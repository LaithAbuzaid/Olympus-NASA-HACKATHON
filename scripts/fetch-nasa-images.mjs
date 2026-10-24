import { mkdir, readFile, writeFile } from "node:fs/promises";

const API = "https://images-api.nasa.gov";
const DEFAULT_QUERIES = [
  "Surveyor 3 Apollo 12",
  "Apollo lunar hardware ALSEP",
  "Mars Exploration Rover Spirit",
  "Mars Exploration Rover Opportunity",
  "Curiosity rover Mars",
  "Perseverance rover Mars",
  "Mars lander scientific instrument",
  "Pioneer 10 spacecraft",
  "Pioneer 11 spacecraft",
  "Voyager 1 spacecraft",
  "Voyager 2 spacecraft",
  "New Horizons spacecraft",
  "NASA deep space probe instrument"
];
const args = process.argv.slice(2);
const valueAfter = (flag, fallback) => { const index = args.indexOf(flag); return index >= 0 ? args[index + 1] ?? fallback : fallback; };
const queries = valueAfter("--query", null) ? [valueAfter("--query", "")] : DEFAULT_QUERIES;
const boundedNumber = (value, fallback, min, upper) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.min(upper, Math.max(min, Math.floor(parsed))) : fallback;
};
const max = boundedNumber(valueAfter("--max", "4"), 4, 1, 20);
const pageSize = boundedNumber(valueAfter("--page-size", "20"), 20, 1, 100);
const maxPages = boundedNumber(valueAfter("--pages", "2"), 2, 1, 5);
const dryRun = args.includes("--dry-run");
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function request(url, attempt = 0) {
  try {
    if (!(url instanceof URL) || url.protocol !== "https:" || url.hostname !== "images-api.nasa.gov") throw new Error("request URL is not an allowed NASA API URL");
    const response = await fetch(url, { signal: AbortSignal.timeout(20_000), headers: { accept: "application/json" } });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload = await response.json();
    if (!payload || typeof payload !== "object") throw new Error("NASA API returned an invalid JSON object");
    return payload;
  } catch (error) {
    if (attempt < 2) { await sleep(500 * (attempt + 1)); return request(url, attempt + 1); }
    throw error;
  }
}

function rank(item, query) {
  const data = item.data?.[0] ?? {};
  const text = `${data.title ?? ""} ${data.description ?? ""} ${(data.keywords ?? []).join(" ")}`.toLowerCase();
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  let score = terms.reduce((total, term) => total + (text.includes(term) ? 5 : 0), 0);
  const link = item.links?.find(link => link.rel === "preview" || link.rel === "alternate" && link.render === "image");
  if (link?.width >= 640 && link?.height >= 360) score += 3;
  if (/illustration|poster|logo|concept|diagram|infographic/i.test(text)) score -= 8;
  return score;
}

function normalize(item, query) {
  const data = item.data?.[0] ?? {};
  const links = item.links ?? [];
  const preview = links.find(link => link.rel === "preview") ?? links.find(link => link.render === "image" && link.width >= 640);
  if (!data.nasa_id || !preview?.href) return null;
  return {
    nasaId: data.nasa_id,
    title: data.title?.trim() || null,
    description: data.description?.trim() || null,
    creationDate: data.date_created || null,
    credit: data.secondary_creator || data.photographer || data.center || null,
    center: data.center || null,
    previewUrl: preview.href,
    assetUrl: `${API}/asset/${encodeURIComponent(data.nasa_id)}`,
    sourceUrl: `${API}/search?nasa_id=${encodeURIComponent(data.nasa_id)}`,
    searchQuery: query,
    width: preview.width || null,
    height: preview.height || null,
    retrievedAt: new Date().toISOString()
  };
}

const results = [];
const failures = [];
for (const query of queries) {
  if (typeof query !== "string" || query.trim().length < 2 || query.length > 160) {
    failures.push({ query: String(query), error: "query must be between 2 and 160 characters" });
    continue;
  }
  if (dryRun) { console.log(`[dry-run] would search: ${query}`); continue; }
  try {
    for (let page = 1; page <= maxPages && results.filter(item => item.searchQuery === query).length < max; page++) {
      const endpoint = new URL(`${API}/search`);
      endpoint.searchParams.set("q", query);
      endpoint.searchParams.set("media_type", "image");
      endpoint.searchParams.set("page", String(page));
      endpoint.searchParams.set("page_size", String(pageSize));
      const collection = await request(endpoint);
      const ranked = (collection.collection?.items ?? []).sort((a, b) => rank(b, query) - rank(a, query));
      for (const item of ranked) {
        const normalized = normalize(item, query);
        if (normalized && !results.some(existing => existing.nasaId === normalized.nasaId) && results.filter(existing => existing.searchQuery === query).length < max) results.push(normalized);
      }
      if (!(collection.collection?.links ?? []).some(link => link.rel === "next")) break;
      await sleep(250);
    }
  } catch (error) { failures.push({ query, error: error instanceof Error ? error.message : String(error) }); }
}
if (dryRun) process.exit(0);
await mkdir("data", { recursive: true });
const catalog = { version: 1, api: API, retrievedAt: new Date().toISOString(), queries, images: results, failures };
await writeFile("data/nasa-image-catalog.json", `${JSON.stringify(catalog, null, 2)}\n`);
console.log(`Selected ${results.length} unique NASA images from ${queries.length} queries.`);
if (failures.length) { console.error(`Search failures: ${failures.length}`); process.exitCode = 1; }
