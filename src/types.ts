export type Destination = "Moon" | "Mars" | "Deep space";
export type HardwareType = "Rover" | "Lander" | "Instrument" | "Probe" | "Orbiter";
export type MissionStatus = "Operational" | "Mission completed" | "No longer operational" | "Lost contact" | "Still traveling" | "Impacted or destroyed" | "Physical fate uncertain";
export type DiscoveryCategory = "Water & habitability" | "Geology & surface" | "Atmosphere & environment" | "Outer Solar System" | "Engineering milestone";

export interface ImageRecord {
  nasaId: string;
  title?: string | null;
  description?: string | null;
  credit: string | null;
  center: string | null;
  previewUrl: string;
  assetUrl: string;
  sourceUrl: string;
  searchQuery?: string;
  localPath?: string;
  width?: number | null;
  height?: number | null;
}

export interface MissionSource {
  url: string;
  sourceUrl?: string;
  title: string;
  organization: string;
  sourceType: string;
  accessed: string;
  publicationDate?: string;
  supports: string[];
}

export interface ClaimSource {
  claim: string;
  sourceUrls: string[];
}

export interface HardwareComponent {
  id: string;
  label: string;
  explanation: string;
  importance: string;
  sourceUrl?: string;
}

export interface HardwareDiagram {
  title: string;
  description: string;
  sourceUrl?: string;
  sourceLabel?: string;
  components: HardwareComponent[];
}

export interface TimelineEvent {
  date: string;
  label: string;
  description: string;
}

export interface MissionRecord {
  id: string;
  name: string;
  destination: Destination;
  hardwareType: HardwareType;
  launchDate: string;
  arrivalDate?: string;
  missionEndDate?: string;
  status: MissionStatus;
  statusAsOf: string;
  statusSourceUrl: string;
  physicalFate: string;
  missionObjective: string;
  howItWorked: string;
  simpleExplanation?: string;
  historicalContext?: string;
  objectives?: string[];
  hardwareComponents?: string[];
  instruments?: string[];
  discoveries: string[];
  problems?: string[];
  whyItMatters?: string;
  legacy?: string;
  timeline: TimelineEvent[];
  imageReferences?: string[];
  sources: MissionSource[];
  claimSources?: ClaimSource[];
  technicalSpecs?: Record<string, string>;
  hardwareDiagram?: HardwareDiagram;
}

export interface DiscoveryRecord {
  id: string;
  title: string;
  category?: DiscoveryCategory;
  mission: string;
  missionId: string;
  observed: string;
  instrument?: string;
  location?: string;
  date?: string;
  conclusion: string;
  whyItMatters: string;
  uncertainty: string;
  sourceUrls: string[];
}
