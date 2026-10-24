import missionData from "../../data/missions.json";
import imageData from "../../data/nasa-image-catalog.json";
import type { DiscoveryCategory, DiscoveryRecord, ImageRecord, MissionRecord } from "../types";

export const missions = missionData as MissionRecord[];
export const images = imageData.images as ImageRecord[];

type DiscoverySeed = {
  category?: DiscoveryCategory;
  location?: string;
  instrument?: string;
  date?: string;
  whyItMatters: string;
  uncertainty: string;
};

const discoverySeeds: Record<string, DiscoverySeed[]> = {
  "surveyor-3": [
    { category: "Geology & surface", instrument: "Television camera", whyItMatters: "The images document the local lunar surface for later comparison.", uncertainty: "The mission summary does not identify a single image date for this result." },
    { category: "Geology & surface", instrument: "Soil-mechanics scoop", location: "Surveyor 3 landing site, Moon", whyItMatters: "Direct soil tests informed understanding of the lunar surface at a robotic landing site.", uncertainty: "The summary describes the result but does not provide a measurement range here." },
    { category: "Geology & surface", location: "Surveyor 3 landing site, Moon", whyItMatters: "Apollo 12 made it possible to compare exposed hardware with the lunar environment over time.", uncertainty: "The summary does not specify which material changes were measured." },
  ],
  "apollo-12-lunar-hardware": [
    { category: "Atmosphere & environment", instrument: "ALSEP", location: "Apollo 12 landing site, Moon", whyItMatters: "Long-lived surface experiments extended measurements after the crew departed.", uncertainty: "The summary does not list each individual ALSEP experiment or its date." },
    { category: "Geology & surface", location: "Apollo 12 landing site, Moon", whyItMatters: "Returned samples connect a robotic landing site with crewed field geology.", uncertainty: "The summary does not identify the individual samples in this finding." },
    { category: "Engineering milestone", location: "Moon", whyItMatters: "Precision landing supported more targeted lunar fieldwork.", uncertainty: "This is a mission-level conclusion; the summary does not quantify landing accuracy." },
  ],
  spirit: [
    { category: "Water & habitability", location: "Gusev Crater, Mars", whyItMatters: "Altered rocks preserve evidence that water once changed the Martian surface.", uncertainty: "Alteration by water does not by itself establish that life was present." },
    { category: "Geology & surface", location: "Husband Hill, Gusev Crater, Mars", whyItMatters: "Layered terrain records a more complex volcanic history than a flat landing-site view.", uncertainty: "The summary does not detail the composition of every layer." },
    { category: "Engineering milestone", whyItMatters: "Surviving beyond the planned mission expanded the time available for surface science.", uncertainty: "The summary does not attribute the extended operation to one single factor." },
  ],
  opportunity: [
    { category: "Geology & surface", location: "Meridiani Planum, Mars", whyItMatters: "Hematite concretions are a mineral clue to the region's past environmental conditions.", uncertainty: "The summary does not establish the complete process that formed each concretion." },
    { category: "Water & habitability", location: "Meridiani Planum, Mars", whyItMatters: "Water-shaped rocks preserve evidence of an ancient, chemically challenging environment.", uncertainty: "The finding describes past water; it does not imply present-day liquid water." },
    { category: "Engineering milestone", location: "Mars", whyItMatters: "The driving record demonstrates how long-duration mobility increased scientific reach.", uncertainty: "Distance comparisons depend on the reference date and mission accounting." },
  ],
  curiosity: [
    { category: "Water & habitability", location: "Gale Crater, Mars", whyItMatters: "A former freshwater setting makes Gale Crater a useful record of ancient habitability.", uncertainty: "Past habitability is not evidence that life was found." },
    { category: "Water & habitability", instrument: "Sample analysis instruments", location: "Gale Crater, Mars", whyItMatters: "Organic molecules are ingredients relevant to habitability and planetary chemistry.", uncertainty: "Organic molecules can form without biology; this finding does not identify life." },
    { category: "Atmosphere & environment", instrument: "Atmospheric environmental sensors", location: "Gale Crater, Mars", whyItMatters: "Repeated measurements show that Mars' surface environment changes over time.", uncertainty: "The summary does not state the size, source, or biological meaning of the changes." },
  ],
  perseverance: [
    { category: "Water & habitability", location: "Jezero Crater, Mars", whyItMatters: "A delta is a compelling setting for reading how ancient water moved sediment and may have preserved biosignatures.", uncertainty: "The summary does not claim that the delta contains evidence of life." },
    { category: "Engineering milestone", instrument: "Ingenuity", location: "Mars", whyItMatters: "Powered flight demonstrated a new way to scout and support exploration on another planet.", uncertainty: "The result concerns flight demonstration, not a general guarantee for all Martian aircraft." },
    { category: "Geology & surface", instrument: "Coring and caching system", location: "Jezero Crater, Mars", whyItMatters: "Sealed samples preserve material for potential future laboratory study.", uncertainty: "Collected samples are not the same as returned samples; the summary does not claim return has occurred." },
  ],
  "voyager-1": [
    { category: "Atmosphere & environment", location: "Io, Jupiter system", whyItMatters: "Active volcanism revealed that worlds beyond Earth can be geologically active.", uncertainty: "The summary does not describe the frequency or persistence of the eruptions." },
    { category: "Outer Solar System", location: "Jupiter", whyItMatters: "The ring expanded the known kinds of structures in the Jupiter system.", uncertainty: "The summary does not describe the ring's composition or dimensions." },
    { category: "Outer Solar System", whyItMatters: "The crossing marks a change from the heliosphere to interstellar space for the spacecraft's measurements.", uncertainty: "The heliopause is a boundary inferred from changing plasma and particle conditions, not a visible surface." },
  ],
  "voyager-2": [
    { category: "Outer Solar System", whyItMatters: "Those encounters remain the only close spacecraft visits recorded for Uranus and Neptune.", uncertainty: "The statement describes mission history, not a claim that no future visit is possible." },
    { category: "Outer Solar System", location: "Triton, Neptune system", whyItMatters: "Geysers show that a distant icy moon can be dynamically active.", uncertainty: "The summary does not identify the energy source of the geysers." },
    { category: "Outer Solar System", whyItMatters: "A second heliopause crossing extends the record of how the heliosphere changes with direction and time.", uncertainty: "The boundary is inferred from instrument measurements." },
  ],
  "new-horizons": [
    { category: "Outer Solar System", location: "Pluto", whyItMatters: "Pluto's varied surface shows that distant dwarf planets have active, complex geology.", uncertainty: "The summary does not resolve the age or full origin of each terrain." },
    { category: "Outer Solar System", location: "Arrokoth, Kuiper Belt", whyItMatters: "The encounter provided the first close look at a Kuiper Belt object.", uncertainty: "A single flyby cannot characterize every Kuiper Belt body." },
    { category: "Outer Solar System", whyItMatters: "Continued measurements extend planetary science beyond the major planets.", uncertainty: "The summary does not specify which measurements are currently still being returned." },
  ],
  "pioneer-10": [
    { category: "Engineering milestone", location: "Asteroid belt", whyItMatters: "The crossing established that a spacecraft could travel safely through the belt.", uncertainty: "The summary does not state the hazard rate or every object encountered." },
    { category: "Outer Solar System", location: "Jupiter", whyItMatters: "Close-up observations and radiation measurements made later Jupiter missions safer and more targeted.", uncertainty: "The summary does not list the individual radiation measurements." },
    { category: "Engineering milestone", whyItMatters: "Early outer-planet results provided design and planning context for later missions.", uncertainty: "This is a planning legacy, not a claim that Pioneer made every later mission decision." },
  ],
  "pioneer-11": [
    { category: "Outer Solar System", location: "Saturn", whyItMatters: "The encounter established a close-up baseline for Saturn's atmosphere, rings, and polar region.", uncertainty: "The summary does not separate which observations revealed the polar features from those about the rings." },
    { category: "Outer Solar System", location: "Saturn system", whyItMatters: "Finding another ring and moon expanded the known Saturn system.", uncertainty: "The summary does not provide the objects' names or physical measurements." },
    { category: "Atmosphere & environment", location: "Outer Solar System", whyItMatters: "Radiation and dust measurements helped engineers plan later encounters.", uncertainty: "The summary does not quantify the radiation or dust environment." },
  ],
};

export const discoveries: DiscoveryRecord[] = missions.flatMap((mission) =>
  mission.discoveries.map((observed, index) => {
    const seed = discoverySeeds[mission.id]?.[index];
    const sourceUrls = mission.sources.map((source) => source.url);
    return {
      id: `${mission.id}-discovery-${index + 1}`,
      missionId: mission.id,
      title: observed,
      observed,
      mission: mission.name,
      instrument: seed?.instrument,
      date: seed?.date,
      location: seed?.location,
      conclusion: `The verified mission record reports this observation: ${observed}`,
      whyItMatters: seed?.whyItMatters ?? "It is part of the mission's verified scientific record.",
      uncertainty: seed?.uncertainty ?? "The available mission summary does not provide further uncertainty detail.",
      sourceUrls,
      category: seed?.category,
    };
  }),
);

const queryAliases: Record<string, string[]> = {
  "surveyor-3": ["Surveyor 3 Apollo 12"],
  "apollo-12-lunar-hardware": ["Apollo lunar hardware ALSEP", "Surveyor 3 Apollo 12"],
  spirit: ["Mars Exploration Rover Spirit"],
  opportunity: ["Mars Exploration Rover Opportunity"],
  curiosity: ["Curiosity rover Mars"],
  perseverance: ["Perseverance rover Mars"],
  "voyager-1": ["Voyager 1 spacecraft"],
  "voyager-2": ["Voyager 2 spacecraft"],
  "new-horizons": ["New Horizons spacecraft"],
};

export function imagesForMission(mission: MissionRecord): ImageRecord[] {
  const references = new Set(mission.imageReferences);
  const aliases = queryAliases[mission.id] ?? [];
  const matched = images.filter((image) => references.has(image.nasaId));
  // Search aliases are only a documented fallback for records without explicit IDs.
  // Never let a broad search result replace a verified mission reference.
  const fallback = matched.length ? [] : images.filter((image) => aliases.includes(image.searchQuery ?? ""));
  return [...matched, ...fallback].filter((image, index, all) => all.findIndex(item => item.nasaId === image.nasaId) === index).slice(0, 3);
}

export function primaryImage(mission: MissionRecord): ImageRecord | undefined {
  return imagesForMission(mission)[0];
}

export function formatDate(date: string | undefined): string {
  if (!date) return "Date not recorded";
  return new Intl.DateTimeFormat("en", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" }).format(new Date(`${date}T00:00:00Z`));
}

export function year(date: string): string {
  return date.slice(0, 4);
}
