import { access, readFile, stat } from "node:fs/promises";
import path from "node:path";

const errors = [];
const warnings = [];
const root = path.resolve("public/images/nasa");
const isUrl = value => { try { const url = new URL(value); return ["http:", "https:"].includes(url.protocol); } catch { return false; } };
let missions = [];
let catalog = { images: [] };
try { missions = JSON.parse(await readFile("data/missions.json", "utf8")); } catch (error) { errors.push(`Cannot read data/missions.json: ${error.message}`); }
try { catalog = JSON.parse(await readFile("data/nasa-image-catalog.json", "utf8")); } catch (error) { errors.push(`Cannot read data/nasa-image-catalog.json: ${error.message}`); }
const missionIds = new Set();
const imageIds = new Set((catalog.images ?? []).map(image => image.nasaId));
const seenImageIds = new Set();
for (const mission of missions) {
  for (const field of ["id", "name", "destination", "hardwareType", "launchDate", "status", "statusAsOf", "statusSourceUrl", "physicalFate", "missionObjective", "howItWorked", "discoveries", "whyItMatters", "timeline", "imageReferences", "sources"]) if (!(field in mission) || mission[field] === "" || mission[field] == null) errors.push(`${mission.id || "unknown"}: missing required field ${field}`);
  if (missionIds.has(mission.id)) errors.push(`duplicate mission id: ${mission.id}`);
  missionIds.add(mission.id);
  if (!isUrl(mission.statusSourceUrl)) errors.push(`${mission.id}: invalid statusSourceUrl`);
  const sourceUrls = new Set((mission.sources ?? []).map(source => source.url));
  if (!sourceUrls.has(mission.statusSourceUrl)) warnings.push(`${mission.id}: statusSourceUrl is not present in the mission source list`);
  for (const source of mission.sources ?? []) {
    if (!isUrl(source.url)) errors.push(`${mission.id}: invalid source URL`);
    for (const field of ["title", "organization", "sourceType", "accessed", "supports"]) if (!source[field] || (Array.isArray(source[field]) && !source[field].length)) errors.push(`${mission.id}: source ${source.url} is missing ${field}`);
  }
  for (const claim of mission.claimSources ?? []) {
    if (!claim.claim || !Array.isArray(claim.sourceUrls) || !claim.sourceUrls.length) errors.push(`${mission.id}: claim source mapping is incomplete`);
    for (const url of claim.sourceUrls ?? []) {
      if (!isUrl(url)) errors.push(`${mission.id}: invalid claim source URL ${url}`);
      else if (!sourceUrls.has(url)) warnings.push(`${mission.id}: claim mapping references a URL not in sources (${url})`);
    }
  }
  const refs = mission.imageReferences ?? [];
  if (!refs.length) warnings.push(`${mission.id}: no explicit mission image references (catalog search fallback unavailable to validator)`);
  if (new Set(refs).size !== refs.length) warnings.push(`${mission.id}: duplicate image references`);
  for (const nasaId of refs) if (!imageIds.has(nasaId)) warnings.push(`${mission.id}: image reference ${nasaId} is not in the local NASA catalog`);
}
for (const image of catalog.images ?? []) {
  for (const field of ["nasaId", "title", "description", "creationDate", "credit", "previewUrl", "assetUrl", "sourceUrl"]) if (!image[field]) warnings.push(`${image.nasaId || "unknown"}: missing image ${field}`);
  if (seenImageIds.has(image.nasaId)) errors.push(`duplicate NASA image id: ${image.nasaId}`);
  seenImageIds.add(image.nasaId);
  if (!isUrl(image.previewUrl) || !isUrl(image.assetUrl) || !isUrl(image.sourceUrl)) errors.push(`${image.nasaId}: invalid image URL`);
  if (image.localPath) {
    const resolved = path.resolve("public", image.localPath.replace(/^\/+/, ""));
    if (!resolved.startsWith(`${root}${path.sep}`)) errors.push(`${image.nasaId}: local path escapes public image directory`);
    else try { const file = await stat(resolved); if (!file.size) errors.push(`${image.nasaId}: local image is empty`); } catch { errors.push(`${image.nasaId}: local image is missing (${resolved})`); }
  } else warnings.push(`${image.nasaId}: image has not been downloaded yet`);
}
if (!(catalog.images ?? []).length) warnings.push("Image catalog is empty; run npm run fetch.");
console.log(`Validated ${missions.length} missions and ${(catalog.images ?? []).length} NASA images.`);
if (warnings.length) console.warn(`Warnings (${warnings.length}):\n${warnings.map(item => `- ${item}`).join("\n")}`);
if (errors.length) { console.error(`Errors (${errors.length}):\n${errors.map(item => `- ${item}`).join("\n")}`); process.exitCode = 1; } else console.log("NASA data validation passed.");
