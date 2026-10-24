import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const CATALOG_PATH = "data/nasa-image-catalog.json";
const OUTPUT_DIR = path.resolve("public/images/nasa");
const MAX_BYTES = 12 * 1024 * 1024;
const CONCURRENCY = 3;
const allowedHosts = new Set(["images-assets.nasa.gov", "images-api.nasa.gov"]);
const catalog = JSON.parse(await readFile(CATALOG_PATH, "utf8"));
if (!catalog || !Array.isArray(catalog.images)) throw new Error("NASA image catalog must contain an images array");
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const safeName = id => `${id.replace(/[^a-zA-Z0-9._-]/g, "-")}.jpg`;
const isAllowed = value => { try { const url = new URL(value); return url.protocol === "https:" && allowedHosts.has(url.hostname); } catch { return false; } };
function isImage(buffer) {
  return buffer.length > 12 && ((buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) || buffer.subarray(0, 8).toString("hex") === "89504e470d0a1a0a" || buffer.subarray(0, 6).toString() === "GIF89a" || buffer.subarray(0, 6).toString() === "GIF87a" || buffer.subarray(0, 4).toString() === "RIFF" && buffer.subarray(8, 12).toString() === "WEBP"); 
}
async function download(image, attempt = 0) {
  const localPath = path.join(OUTPUT_DIR, safeName(image.nasaId));
  if (typeof image.nasaId !== "string" || !image.nasaId.trim()) return { image, error: "missing NASA image ID" };
  image.localPath = `/images/nasa/${safeName(image.nasaId)}`;
  if (!isAllowed(image.previewUrl)) return { image, error: "preview URL host or protocol is not allowed" };
  try {
    const existing = await stat(localPath).catch(() => null);
    if (existing?.size > 0) return { image, skipped: true };
    const response = await fetch(image.previewUrl, { signal: AbortSignal.timeout(30_000), headers: { accept: "image/*" } });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    if (!isAllowed(response.url)) throw new Error("redirected to a host or protocol that is not allowed");
    const contentType = response.headers.get("content-type") || "";
    if (contentType && !contentType.startsWith("image/")) throw new Error(`unexpected content type: ${contentType}`);
    const contentLength = Number(response.headers.get("content-length") || 0);
    if (contentLength > MAX_BYTES) throw new Error(`response exceeds ${MAX_BYTES} byte limit`);
    const reader = response.body?.getReader();
    if (!reader) throw new Error("response has no readable body");
    const chunks = [];
    let total = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > MAX_BYTES) {
        await reader.cancel();
        throw new Error(`response exceeds ${MAX_BYTES} byte limit`);
      }
      chunks.push(Buffer.from(value));
    }
    const buffer = Buffer.concat(chunks, total);
    if (!buffer.length || buffer.length > MAX_BYTES || !isImage(buffer)) throw new Error("empty or invalid image content");
    await writeFile(localPath, buffer);
    return { image, bytes: buffer.length };
  } catch (error) {
    if (attempt < 2) { await sleep(700 * (attempt + 1)); return download(image, attempt + 1); }
    return { image, error: error instanceof Error ? error.message : String(error) };
  }
}
await mkdir(OUTPUT_DIR, { recursive: true });
const outcomes = [];
for (let index = 0; index < catalog.images.length; index += CONCURRENCY) outcomes.push(...await Promise.all(catalog.images.slice(index, index + CONCURRENCY).map(download)));
catalog.images = outcomes.map(({ image }) => image);
catalog.downloads = { completedAt: new Date().toISOString(), failed: outcomes.filter(outcome => outcome.error).map(outcome => ({ nasaId: outcome.image.nasaId, error: outcome.error })), downloaded: outcomes.filter(outcome => !outcome.error).length, skipped: outcomes.filter(outcome => outcome.skipped).length };
await writeFile(CATALOG_PATH, `${JSON.stringify(catalog, null, 2)}\n`);
console.log(`Downloaded ${catalog.downloads.downloaded - catalog.downloads.skipped} images; skipped ${catalog.downloads.skipped} valid files.`);
if (catalog.downloads.failed.length) { console.error(`Failed downloads: ${catalog.downloads.failed.length}`); process.exitCode = 1; }
