import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, ChevronDown, ExternalLink, Menu, Search, X, GitCompareArrows, Eye, Check } from "lucide-react";
import { Link, Route, Routes, useLocation, useNavigate, useNavigationType, useParams } from "react-router-dom";
import { discoveries, formatDate, imagesForMission, missions, primaryImage, year } from "./data/catalog";
import type { Destination, DiscoveryCategory, HardwareType, ImageRecord, MissionRecord, MissionStatus } from "./types";

const destinations: Array<"All destinations" | Destination> = ["All destinations", "Moon", "Mars", "Deep space"];
const hardwareTypes: Array<"All hardware" | HardwareType> = ["All hardware", "Rover", "Lander", "Instrument", "Probe", "Orbiter"];
const statuses: Array<"All statuses" | MissionStatus> = ["All statuses", "Operational", "Mission completed", "No longer operational", "Lost contact", "Still traveling", "Impacted or destroyed", "Physical fate uncertain"];
const statusClass = (status: MissionStatus) => status.toLowerCase().replaceAll(" ", "-");

function usePageTitle(title: string) {
  useEffect(() => { document.title = `${title} — Wayfinders`; }, [title]);
}

function ScrollManager() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const positions = useRef(new Map<string, number>());
  const previousKey = useRef(location.key);

  useLayoutEffect(() => {
    const previousPosition = window.scrollY;
    positions.current.set(previousKey.current, previousPosition);
    previousKey.current = location.key;

    const shouldAnimate = navigationType !== "POP" && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const behavior = shouldAnimate ? "smooth" : "auto";
    if (location.hash) {
      const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
      if (target) {
        target.scrollIntoView({ behavior, block: "start" });
        return;
      }
    }

    const savedPosition = navigationType === "POP" ? positions.current.get(location.key) : undefined;
    window.scrollTo({ top: savedPosition ?? 0, left: 0, behavior });
  }, [location.key, location.hash, navigationType]);

  useEffect(() => {
    const recordPosition = () => positions.current.set(location.key, window.scrollY);
    recordPosition();
    window.addEventListener("scroll", recordPosition, { passive: true });
    return () => window.removeEventListener("scroll", recordPosition);
  }, [location.key]);

  useEffect(() => {
    const previousRestoration = history.scrollRestoration;
    history.scrollRestoration = "manual";
    return () => { history.scrollRestoration = previousRestoration; };
  }, []);

  return null;
}

function Header() {
  const [open, setOpen] = useState(false);
  return <header className="site-header">
    <Link className="wordmark" to="/" onClick={() => setOpen(false)}>WAYFINDERS <span>/ NASA HARDWARE</span></Link>
    <button className="menu-button" aria-label={open ? "Close navigation" : "Open navigation"} onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
    <nav className={open ? "nav-links is-open" : "nav-links"} aria-label="Primary navigation">
      <Link to="/explore" onClick={() => setOpen(false)}>Mission explorer</Link>
      <Link to="/discoveries" onClick={() => setOpen(false)}>Discoveries</Link>
      <Link to="/solar-system" onClick={() => setOpen(false)}>Solar System</Link>
      <Link to="/timeline" onClick={() => setOpen(false)}>Timeline</Link>
      <Link to="/about" onClick={() => setOpen(false)}>About & sources</Link>
    </nav>
  </header>;
}

function LocalImage({ image, className, alt, priority = false }: { image?: ImageRecord; className?: string; alt: string; priority?: boolean }) {
  const [failed, setFailed] = useState(false);
  if (!image?.localPath || failed) return <div className={`${className ?? ""} image-placeholder`} role="img" aria-label={`${alt}. The verified NASA image is unavailable locally.`}><span>NASA IMAGE<br />UNAVAILABLE LOCALLY</span></div>;
  return <img className={className} src={image.localPath} alt={alt} width={image.width ?? undefined} height={image.height ?? undefined} loading={priority ? "eager" : "lazy"} decoding="async" onError={() => setFailed(true)} />;
}

function imageAlt(image: ImageRecord, missionName: string) {
  return image.description ? `${image.title ?? `${missionName} NASA image`}: ${image.description}` : image.title ?? `${missionName} NASA image`;
}

function ImageGallery({ mission, images: galleryImages }: { mission: MissionRecord; images: ImageRecord[] }) {
  const [selected, setSelected] = useState<number | null>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (selected === null) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelected(null);
      if (event.key === "ArrowRight") setSelected(current => current === null ? 0 : (current + 1) % galleryImages.length);
      if (event.key === "ArrowLeft") setSelected(current => current === null ? 0 : (current - 1 + galleryImages.length) % galleryImages.length);
    };
    document.addEventListener("keydown", onKeyDown);
    closeButton.current?.focus();
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [selected, galleryImages.length]);
  if (!galleryImages.length) return <p className="small-copy">No verified local image has been linked to this mission yet. Coverage is incomplete for this record.</p>;
  const active = selected === null ? undefined : galleryImages[selected];
  return <>
    <div className="image-strip" aria-label={`${mission.name} image gallery`}>
      {galleryImages.map((item, index) => <figure key={item.nasaId}>
        <button className="gallery-trigger" type="button" onClick={() => setSelected(index)} aria-label={`Open image ${index + 1}: ${item.title ?? item.nasaId}`}>
          <LocalImage image={item} alt={imageAlt(item, mission.name)} />
        </button>
        <figcaption><strong>{item.title ?? "Untitled NASA image"}</strong>{item.description ? <span>{item.description}</span> : null}<small>{item.credit ? `Credit: ${item.credit} · ` : "Credit not listed in catalog · "}<a href={item.sourceUrl} target="_blank" rel="noreferrer">NASA ID {item.nasaId}</a></small></figcaption>
      </figure>)}
    </div>
    {active ? <div className="lightbox" role="dialog" aria-modal="true" aria-label={`${mission.name} image viewer`} onClick={() => setSelected(null)}>
      <div className="lightbox-panel" onClick={event => event.stopPropagation()}>
        <button ref={closeButton} className="lightbox-close" type="button" onClick={() => setSelected(null)} aria-label="Close image viewer"><X /></button>
        <LocalImage image={active} alt={imageAlt(active, mission.name)} priority />
        <p>{active.title ?? "Untitled NASA image"} · {active.credit ? `Credit: ${active.credit}` : "Credit not listed in catalog"} · <a href={active.sourceUrl} target="_blank" rel="noreferrer">NASA ID {active.nasaId}</a></p>
        <small>Use Left/Right Arrow to browse · Escape to close</small>
      </div>
    </div> : null}
  </>;
}

function StatusPill({ status }: { status: MissionStatus }) {
  return <span className={`status-pill status-${statusClass(status)}`}><i aria-hidden="true" />{status}</span>;
}

function SourceTrail({ mission }: { mission: MissionRecord }) {
  const claimsByUrl = new Map<string, string[]>();
  for (const claim of mission.claimSources ?? []) {
    for (const url of claim.sourceUrls) claimsByUrl.set(url, [...(claimsByUrl.get(url) ?? []), claim.claim]);
  }
  return <section id="evidence" className="evidence-trail detail-wide detail-section" aria-labelledby="evidence-heading">
    <p className="eyebrow">Research traceability</p>
    <h2 id="evidence-heading">Which sources support this record?</h2>
    <p className="body-copy">Sources are linked to the claims or sections they support where the research record provides that connection. A source list is not a substitute for checking the original document.</p>
    <div className="evidence-list">{mission.sources.map(source => {
      const linkedClaims = claimsByUrl.get(source.url) ?? [];
      return <article className="evidence-source" key={source.url}>
        <div><h3>{source.title}</h3><p>{source.organization} · {source.sourceType}</p></div>
        <dl><div><dt>Supports</dt><dd>{[...source.supports, ...linkedClaims].filter((claim, index, all) => all.indexOf(claim) === index).join(" · ") || "No claim mapping recorded"}</dd></div><div><dt>Publication</dt><dd>{source.publicationDate ? formatDate(source.publicationDate) : "Not recorded"}</dd></div><div><dt>Retrieved</dt><dd>{formatDate(source.accessed)}</dd></div></dl>
        <a href={source.sourceUrl ?? source.url} target="_blank" rel="noreferrer">Open canonical source <ExternalLink size={13} /></a>
      </article>;
    })}</div>
  </section>;
}

function MissionCard({ mission, featured = false }: { mission: MissionRecord; featured?: boolean }) {
  const image = primaryImage(mission);
  return <Link className={`mission-card ${featured ? "featured-card" : ""}`} to={`/missions/${mission.id}`}>
    <div className="card-media"><LocalImage image={image} className="card-image" alt={image?.title ?? `${mission.name} NASA photograph`} /><span className="card-index">{year(mission.launchDate)}</span></div>
    <div className="card-meta"><span>{mission.destination} · {mission.hardwareType}</span><StatusPill status={mission.status} /></div>
    <h3>{mission.name}</h3><p>{mission.missionObjective}</p>
    <span className="card-link">Read the field note <ArrowRight size={15} /></span>
  </Link>;
}

function Landing() {
  usePageTitle("Humanity's hardware across the Solar System");
  const [heroMissionId, setHeroMissionId] = useState("voyager-1");
  const featured = [missions.find(m => m.id === "surveyor-3"), missions.find(m => m.id === "opportunity"), missions.find(m => m.id === "voyager-1")].filter(Boolean) as MissionRecord[];
  return <main>
    <section className="hero">
      <div className="hero-copy"><p className="eyebrow">An evidence-led NASA hardware field guide</p><h1>We went to the stars.<br /><em>We left machines behind.</em></h1><p className="lede">Spacecraft and instruments leave a physical legacy: some rest on a world, some stop after years of science, and some continue outward. Their scientific value can outlast their signals.</p><div className="hero-actions"><Link className="button button-light" to="/explore">Start with the mission explorer <ArrowRight size={17} /></Link><Link className="hero-text-link" to="#demonstration-path">See three contrasting cases <ArrowRight size={15} /></Link></div></div>
      <figure className="hero-visual olympus-hero-visual"><img src="/images/OlympusLogo.jpg" alt="Olympus team project logo" /><figcaption>Wayfinders / Olympus team project · An independent educational field guide</figcaption></figure>
    </section>
    <section className="intro section-grid"><div><p className="eyebrow">The physical legacy</p><h2>Every machine leaves two records.</h2></div><div><p className="body-copy">One record describes what the hardware is doing now—or when it last communicated. The other describes where the hardware is and what remains of it. Wayfinders keeps those facts separate so a silent rover, a lunar lander, and a deep-space probe are not confused.</p><Link className="text-link intro-link" to="/discoveries">Browse discoveries instead of missions <ArrowRight size={16} /></Link></div></section>
    <HomepageMissionExplorer selectedMissionId={heroMissionId} onSelectMission={setHeroMissionId} />
    <DemonstrationPath />
    <Journey />
    <section className="featured section-pad"><div className="section-heading"><div><p className="eyebrow">The full record</p><h2>Follow the evidence.</h2></div><Link className="text-link" to="/explore">Open full mission explorer <ArrowRight size={16} /></Link></div><div className="mission-grid">{featured.map(mission => <MissionCard key={mission.id} mission={mission} featured />)}</div></section>
    <TimelinePreview />
    <About />
  </main>;
}

function HomepageMissionExplorer({ selectedMissionId, onSelectMission }: { selectedMissionId: string; onSelectMission: (id: string) => void }) {
  const [destination, setDestination] = useState<"All" | Destination>("All");
  const options: Array<"All" | Destination> = ["All", "Moon", "Mars", "Deep space"];
  const visibleMissions = missions.filter(mission => destination === "All" || mission.destination === destination);
  const selectedMission = visibleMissions.find(mission => mission.id === selectedMissionId) ?? visibleMissions[0];
  return <section className="homepage-explorer section-pad" aria-labelledby="homepage-explorer-heading">
    <div className="section-heading"><div><p className="eyebrow">Explore from the homepage</p><h2 id="homepage-explorer-heading">Choose a destination.</h2></div><Link className="text-link" to="/explore">Open the full explorer <ArrowRight size={16} /></Link></div>
    <div className="homepage-explorer-controls" role="group" aria-label="Filter missions by destination">{options.map(option => <button key={option} className={`destination-filter ${destination === option ? "is-active" : ""}`} aria-pressed={destination === option} onClick={() => setDestination(option)}>{option === "All" ? "All records" : option}</button>)}</div>
    {selectedMission ? <div className="homepage-explorer-feature"><div className="homepage-explorer-image"><LocalImage image={primaryImage(selectedMission)} alt={primaryImage(selectedMission)?.title ?? `${selectedMission.name} NASA photograph`} /></div><div className="homepage-explorer-copy"><p className="eyebrow">{selectedMission.destination} / {selectedMission.hardwareType}</p><h3>{selectedMission.name}</h3><p>{selectedMission.missionObjective}</p><div className="homepage-explorer-meta"><StatusPill status={selectedMission.status} /><span>{formatDate(selectedMission.statusAsOf)}</span></div><Link className="button button-outline" to={`/missions/${selectedMission.id}`}>Read this mission <ArrowRight size={16} /></Link></div></div> : <div className="homepage-explorer-empty"><h3>No records in view.</h3><p>Choose another destination to continue exploring the archive.</p></div>}
    <div className="homepage-explorer-list" aria-label={`${visibleMissions.length} mission records in ${destination === "All" ? "all destinations" : destination}`}>{visibleMissions.map(mission => <button key={mission.id} className={`homepage-mission-tab ${selectedMission?.id === mission.id ? "is-selected" : ""}`} onClick={() => onSelectMission(mission.id)}><span>{mission.name}</span><small>{mission.destination} · {mission.hardwareType}</small></button>)}</div>
  </section>;
}

function DemonstrationPath() {
  const cases = [
    { id: "surveyor-3", label: "Left on a surface", detail: "Moon · lander", explanation: "Surveyor 3 remains in Oceanus Procellarum. Apollo 12 later visited the lander and returned selected parts to Earth." },
    { id: "opportunity", label: "Science after the planned mission", detail: "Mars · rover", explanation: "Opportunity completed its mission after a long period of surface science; NASA lists its final status as no longer operational as of February 13, 2019." },
    { id: "voyager-1", label: "Still traveling", detail: "Deep space · probe", explanation: "Voyager 1 is listed as still traveling through interstellar space, with the record dated October 24, 2026." },
  ];
  return <section className="demonstration-path section-pad" id="demonstration-path" aria-labelledby="demonstration-heading">
    <div className="section-heading"><div><p className="eyebrow">A three-stop demonstration</p><h2 id="demonstration-heading">Three ways hardware persists.</h2></div><p className="small-copy">Use these records to introduce the central idea before opening the full explorer.</p></div>
    <div className="demonstration-grid">{cases.map(item => {
      const mission = missions.find(candidate => candidate.id === item.id)!;
      return <Link className="demonstration-card" to={`/missions/${mission.id}`} key={item.id}>
        <div className="demonstration-card-top"><span className="demonstration-number">{String(cases.indexOf(item) + 1).padStart(2, "0")}</span><span className="record-kicker">{item.label}</span></div>
        <h3>{mission.name}</h3><p className="demonstration-detail">{item.detail}</p><p>{item.explanation}</p>
        <div className="demonstration-status"><span className="demonstration-status-badge"><StatusPill status={mission.status} /></span><span className="demonstration-verified">Verified {formatDate(mission.statusAsOf)}</span></div>
        <span className="card-link">Open mission record <ArrowRight size={15} /></span>
      </Link>;
    })}</div>
  </section>;
}

function Journey() {
  return <section className="journey"><div className="section-pad journey-inner"><div><p className="eyebrow">A visual journey</p><h2>From the Moon,<br />to Mars, <em>and beyond.</em></h2></div><div className="journey-track" aria-label="Schematic journey from Moon to Mars and deep space"><div className="journey-line" /><Link to="/explore?destination=Moon" className="journey-stop"><span className="journey-orb moon" /><b>Moon</b><small>Hardware left in place</small></Link><Link to="/explore?destination=Mars" className="journey-stop"><span className="journey-orb mars" /><b>Mars</b><small>Machines that read an ancient world</small></Link><Link to="/explore?destination=Deep%20space" className="journey-stop"><span className="journey-orb deep" /><b>Deep space</b><small>Voyages still writing outward</small></Link></div></div></section>;
}

function TimelinePreview() {
  const events = missions.flatMap(m => m.timeline.map(event => ({ ...event, mission: m }))).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 6);
  return <section className="timeline-preview section-pad" id="timeline"><div className="section-heading"><div><p className="eyebrow">1967 — now</p><h2>A short history of leaving things behind.</h2></div><Link className="text-link" to="/timeline">View full timeline <ArrowRight size={16} /></Link></div><div className="preview-events">{events.map(event => <Link to={`/missions/${event.mission.id}`} className="preview-event" key={`${event.mission.id}-${event.date}`}><span>{year(event.date)}</span><b>{event.label}</b><small>{event.mission.name}</small></Link>)}</div></section>;
}

function About() {
  return <section className="about section-grid" id="about"><div><p className="eyebrow">About this field guide</p><h2>Built from mission records, not myths.</h2></div><div className="about-copy"><p className="body-copy">Wayfinders is an educational project for curious readers. Mission facts come from NASA mission and science pages; images come from the official NASA Image and Video Library and are preserved with their original credit.</p><p className="body-copy">A machine's physical fate and its operating status are separate facts. Status dates are shown next to their sources, and schematic locations never represent live tracking.</p></div></section>;
}

function FilterSelect<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: readonly T[]; onChange: (value: T) => void }) {
  return <label className="select-field"><span className="sr-only">{label}</span><select value={value} onChange={event => onChange(event.target.value as T)}>{options.map(option => <option key={option}>{option}</option>)}</select><ChevronDown size={15} /></label>;
}

function Explorer() {
  usePageTitle("Explore the hardware");
  const location = useLocation();
  const navigate = useNavigate();
  const initialDestination = new URLSearchParams(location.search).get("destination");
  type SortOrder = "chronology" | "launch-newest" | "duration";
  const params = new URLSearchParams(location.search);
  const previousSearch = useRef(location.search);
  const hydratingFromUrl = useRef(false);
  if (previousSearch.current !== location.search) {
    previousSearch.current = location.search;
    hydratingFromUrl.current = true;
  }
  const valid = <T extends string>(value: string | null, options: readonly T[], fallback: T) => value && options.includes(value as T) ? value as T : fallback;
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [destination, setDestination] = useState<typeof destinations[number]>(valid(initialDestination, destinations, "All destinations"));
  const [hardware, setHardware] = useState<typeof hardwareTypes[number]>(valid(params.get("hardware"), hardwareTypes, "All hardware"));
  const [status, setStatus] = useState<typeof statuses[number]>(valid(params.get("status"), statuses, "All statuses"));
  const [sort, setSort] = useState<SortOrder>(valid(params.get("sort"), ["chronology", "launch-newest", "duration"] as const, "chronology"));
  const [compareIds, setCompareIds] = useState<string[]>(params.get("compare")?.split(",").filter(id => missions.some(m => m.id === id)).slice(0, 3) ?? []);
  const [quickView, setQuickView] = useState<MissionRecord | null>(null);
  useEffect(() => {
    if (hydratingFromUrl.current) {
      hydratingFromUrl.current = false;
      return;
    }
    const next = new URLSearchParams();
    if (query) next.set("q", query);
    if (destination !== "All destinations") next.set("destination", destination);
    if (hardware !== "All hardware") next.set("hardware", hardware);
    if (status !== "All statuses") next.set("status", status);
    if (sort !== "chronology") next.set("sort", sort);
    if (compareIds.length) next.set("compare", compareIds.join(","));
    navigate({ pathname: "/explore", search: next.toString() }, { replace: true });
  }, [query, destination, hardware, status, sort, compareIds, navigate]);
  useEffect(() => {
    const next = new URLSearchParams(location.search);
    setQuery(next.get("q") ?? "");
    setDestination(valid(next.get("destination"), destinations, "All destinations"));
    setHardware(valid(next.get("hardware"), hardwareTypes, "All hardware"));
    setStatus(valid(next.get("status"), statuses, "All statuses"));
    setSort(valid(next.get("sort"), ["chronology", "launch-newest", "duration"] as const, "chronology"));
    setCompareIds(next.get("compare")?.split(",").filter(id => missions.some(m => m.id === id)).slice(0, 3) ?? []);
  }, [location.search]); // supports browser back/forward
  const durationDays = (mission: MissionRecord) => mission.missionEndDate ? Math.max(0, (Date.parse(mission.missionEndDate) - Date.parse(mission.launchDate)) / 86400000) : null;
  const filtered = useMemo(() => missions.filter(mission => {
    const haystack = [mission.name, mission.destination, mission.hardwareType, mission.status, mission.missionObjective, mission.physicalFate, mission.howItWorked, mission.legacy, ...(mission.objectives ?? []), ...(mission.instruments ?? []), ...(mission.discoveries ?? []), ...mission.timeline.map(event => `${event.label} ${event.description}`)].join(" ").toLowerCase();
    return haystack.includes(query.toLowerCase()) && (destination === "All destinations" || mission.destination === destination) && (hardware === "All hardware" || mission.hardwareType === hardware) && (status === "All statuses" || mission.status === status);
  }).sort((a, b) => {
    if (sort === "launch-newest") return b.launchDate.localeCompare(a.launchDate);
    if (sort === "duration") return (durationDays(b) ?? Number.POSITIVE_INFINITY) - (durationDays(a) ?? Number.POSITIVE_INFINITY);
    return a.launchDate.localeCompare(b.launchDate);
  }), [query, destination, hardware, status, sort]);
  const reset = () => { setQuery(""); setDestination("All destinations"); setHardware("All hardware"); setStatus("All statuses"); setSort("chronology"); setCompareIds([]); };
  const toggleCompare = (id: string) => setCompareIds(current => current.includes(id) ? current.filter(item => item !== id) : current.length < 3 ? [...current, id] : current);
  const activeFilters = [query && `Search: ${query}`, destination !== "All destinations" && destination, hardware !== "All hardware" && hardware, status !== "All statuses" && status, sort !== "chronology" && (sort === "duration" ? "Duration" : "Newest first")].filter(Boolean) as string[];
  const suggestions = missions.filter(mission => mission.name.toLowerCase().includes(query.toLowerCase())).slice(0, 3);
  const compared = compareIds.map(id => missions.find(mission => mission.id === id)).filter(Boolean) as MissionRecord[];
  return <main className="explore-page section-pad"><div className="page-heading"><p className="eyebrow">The explorer</p><h1>Find a wayfinder.</h1><p className="lede">Search mission names, discoveries, hardware, destinations, and keywords across verified records.</p></div><div className="filter-bar"><label className="search-field"><Search size={17} /><span className="sr-only">Search missions</span><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search mission, place, or discovery" /></label><FilterSelect label="Destination" value={destination} options={destinations} onChange={setDestination} /><FilterSelect label="Hardware type" value={hardware} options={hardwareTypes} onChange={setHardware} /><FilterSelect label="Status" value={status} options={statuses} onChange={setStatus} /><FilterSelect label="Sort records" value={sort} options={["chronology", "launch-newest", "duration"]} onChange={setSort} /></div>{activeFilters.length > 0 && <div className="active-filters" aria-label="Active filters">{activeFilters.map(filter => <span key={filter}>{filter}</span>)}</div>}<div className="results-row"><p className="result-count">{filtered.length} {filtered.length === 1 ? "record" : "records"} in view</p><button className="reset-button" onClick={reset}>Reset all</button></div>{query && suggestions.length > 0 && <div className="suggestions" aria-label="Record suggestions"><span>Actual records</span>{suggestions.map(mission => <button key={mission.id} onClick={() => setQuery(mission.name)}>{mission.name}</button>)}</div>}{filtered.length ? <div className="mission-grid">{filtered.map(mission => <div className="explorer-result" key={mission.id}><MissionCard mission={mission} /><div className="result-actions"><button onClick={() => setQuickView(mission)} aria-label={`Quick view ${mission.name}`}><Eye size={14} /> Quick view</button><button onClick={() => toggleCompare(mission.id)} aria-pressed={compareIds.includes(mission.id)} disabled={!compareIds.includes(mission.id) && compareIds.length >= 3}><Check size={14} /> {compareIds.includes(mission.id) ? "Compared" : "Compare"}</button></div></div>)}</div> : <div className="empty-state"><h2>No wayfinders found.</h2><p>Try an exact record suggestion, remove an active filter, or reset the explorer.</p><button className="button button-outline" onClick={reset}>Reset all</button></div>}{compared.length > 0 && <section className="comparison-panel" aria-labelledby="comparison-heading"><div className="section-heading"><h2 id="comparison-heading">Compare records</h2><button className="reset-button" onClick={() => setCompareIds([])}>Clear comparison</button></div><div className="comparison-grid">{compared.map(mission => <article key={mission.id}><button className="comparison-remove" onClick={() => toggleCompare(mission.id)} aria-label={`Remove ${mission.name}`}><X size={14} /></button><p className="eyebrow">{mission.destination} / {mission.hardwareType}</p><h3>{mission.name}</h3><dl><div><dt>Launch</dt><dd>{formatDate(mission.launchDate)}</dd></div><div><dt>Status</dt><dd><StatusPill status={mission.status} /></dd></div><div><dt>Objective</dt><dd>{mission.missionObjective}</dd></div></dl></article>)}</div></section>}{quickView && <QuickView mission={quickView} onClose={() => setQuickView(null)} />}</main>;
}

const discoveryCategories: Array<"All categories" | DiscoveryCategory> = [
  "All categories",
  "Water & habitability",
  "Geology & surface",
  "Atmosphere & environment",
  "Outer Solar System",
  "Engineering milestone",
];

function DiscoveryExplorer() {
  usePageTitle("Discoveries");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof discoveryCategories)[number]>("All categories");
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return discoveries.filter(discovery => {
      const haystack = [discovery.title, discovery.observed, discovery.mission, discovery.instrument, discovery.location, discovery.conclusion, discovery.whyItMatters, discovery.uncertainty].filter(Boolean).join(" ").toLowerCase();
      return (!needle || haystack.includes(needle)) && (category === "All categories" || discovery.category === category);
    });
  }, [category, query]);
  return <main className="discoveries-page section-pad">
    <div className="page-heading"><p className="eyebrow">Verified findings · mission records</p><h1>What we learned.</h1><p className="lede">A discovery index built only from findings already recorded in the mission dataset. Read the observation, the cautious conclusion, and what remains uncertain.</p></div>
    <div className="filter-bar"><label className="search-field"><Search size={17} /><span className="sr-only">Search discoveries</span><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search a finding, place, mission, or instrument" /></label><FilterSelect label="Discovery category" value={category} options={discoveryCategories} onChange={setCategory} /></div>
    <div className="results-row"><p className="result-count">{filtered.length} {filtered.length === 1 ? "finding" : "findings"} in view</p>{(query || category !== "All categories") && <button className="reset-button" onClick={() => { setQuery(""); setCategory("All categories"); }}>Reset filters</button>}</div>
    {filtered.length ? <div className="discovery-grid">{filtered.map(discovery => <details className="discovery-card" key={discovery.id}><summary><span className="discovery-card-kicker">{discovery.category ?? "Verified finding"} · {discovery.mission}</span><h2>{discovery.title}</h2><span className="card-link">Expand finding <ChevronDown size={15} /></span></summary><div className="discovery-detail"><dl><div><dt>Observed</dt><dd>{discovery.observed}</dd></div><div><dt>Mission / instrument</dt><dd><Link to={`/missions/${discovery.missionId}`}>{discovery.mission}</Link> · {discovery.instrument ?? "Instrument not specified in the mission summary"}</dd></div><div><dt>Date</dt><dd>{discovery.date ? formatDate(discovery.date) : "Not recorded for this finding"}</dd></div><div><dt>Location</dt><dd>{discovery.location ?? "Not specified for this finding"}</dd></div><div><dt>Conclusion</dt><dd>{discovery.conclusion}</dd></div><div><dt>Why it matters</dt><dd>{discovery.whyItMatters}</dd></div><div><dt>Uncertainty</dt><dd>{discovery.uncertainty}</dd></div></dl><p className="discovery-sources"><span>Original sources</span>{discovery.sourceUrls.map((url, index) => <a href={url} target="_blank" rel="noreferrer" key={url}>NASA source {index + 1} <ExternalLink size={12} /></a>)}</p></div></details>)}</div> : <div className="empty-state"><h2>No findings found.</h2><p>Try another term or reset the category filter.</p></div>}
  </main>;
}

function QuickView({ mission, onClose }: { mission: MissionRecord; onClose: () => void }) {
  useEffect(() => { const close = (event: KeyboardEvent) => event.key === "Escape" && onClose(); document.addEventListener("keydown", close); return () => document.removeEventListener("keydown", close); }, [onClose]);
  return <div className="quick-view-backdrop" role="presentation" onMouseDown={event => event.target === event.currentTarget && onClose()}><aside className="quick-view" role="dialog" aria-modal="true" aria-labelledby="quick-view-title"><button className="quick-view-close" onClick={onClose} aria-label="Close quick view"><X /></button><p className="eyebrow">{mission.destination} / {mission.hardwareType}</p><h2 id="quick-view-title">{mission.name}</h2><dl><div><dt>Objective</dt><dd>{mission.missionObjective}</dd></div><div><dt>Major discovery</dt><dd>{mission.discoveries[0] ?? "Discovery not recorded"}</dd></div><div><dt>Physical fate</dt><dd>{mission.physicalFate}</dd></div><div><dt>Status</dt><dd><StatusPill status={mission.status} /> <small>as of {formatDate(mission.statusAsOf)}</small></dd></div></dl><Link className="button button-outline" to={`/missions/${mission.id}`} onClick={onClose}>Open full field note <ArrowRight size={15} /></Link></aside></div>;
}

function HardwareExplorer({ mission }: { mission: MissionRecord }) {
  const diagram = mission.hardwareDiagram;
  const [selectedId, setSelectedId] = useState(diagram?.components[0]?.id);
  if (!diagram?.components.length) return null;
  const selected = diagram.components.find(component => component.id === selectedId) ?? diagram.components[0];
  const image = primaryImage(mission);
  return <section className="hardware-explorer detail-wide detail-section" aria-labelledby="hardware-explorer-title">
    <div className="hardware-explorer-heading">
      <div><p className="eyebrow">Interactive hardware view</p><h2 id="hardware-explorer-title">{diagram.title}</h2></div>
      <p className="schematic-note">NASA image · labels are interpretive</p>
    </div>
    <p className="body-copy">{diagram.description}</p>
    <div className="hardware-explorer-grid">
      <div className="schematic-panel" role="group" aria-label={`${diagram.title}. Select a documented component.`}>
        <div className="schematic-stage hardware-photo-stage">
          {image ? <LocalImage image={image} className="hardware-photo" alt={image.title ?? `${mission.name} hardware`} priority /> : <div className="image-placeholder">NASA IMAGE UNAVAILABLE</div>}
          <p className="schematic-overlay-note">Documented hardware view</p>
        </div>
        {image ? <p className="hardware-image-credit">{image.title ?? "NASA image"} · {image.credit ?? "NASA"} · <a href={image.sourceUrl} target="_blank" rel="noreferrer">Original NASA image record <ExternalLink size={12} /></a></p> : null}
        <div className="schematic-reading" aria-live="polite"><p className="eyebrow">Selected component</p><h3>{selected.label}</h3><p>{selected.explanation}</p><strong>Why it matters: </strong><span>{selected.importance}</span>{selected.sourceUrl ? <a href={selected.sourceUrl} target="_blank" rel="noreferrer">Component source <ExternalLink size={13} /></a> : null}</div>
      </div>
      <div className="component-list">
        <p className="eyebrow">Text alternative</p>
        <h3>Documented components</h3>
        <ol>{diagram.components.map(component => <li key={component.id}><button onClick={() => setSelectedId(component.id)} aria-pressed={selected.id === component.id}><span>{component.label}</span><small>{component.explanation} {component.importance}</small></button></li>)}</ol>
      </div>
    </div>
    {diagram.sourceUrl ? <p className="small-copy hardware-source">Diagram source: <a href={diagram.sourceUrl} target="_blank" rel="noreferrer">{diagram.sourceLabel ?? diagram.sourceUrl} <ExternalLink size={13} /></a></p> : null}
  </section>;
}

function SolarSystem() {
  usePageTitle("Schematic Solar System");
  const [selected, setSelected] = useState<Destination>("Mars");
  const navigate = useNavigate();
  const destinationMissions = missions.filter(m => m.destination === selected);
  const placement = (mission: MissionRecord) => {
    const fate = mission.physicalFate.toLowerCase();
    if (fate.includes("orbit")) return "Orbit record";
    if (mission.destination === "Deep space" || mission.status === "Still traveling") return "Traveling record";
    return "Surface record";
  };
  const destinationDescription: Record<Destination, string> = {
    Moon: "Landing sites and instruments recorded on the lunar surface.",
    Mars: "Surface machines and the sites where their records place them.",
    "Deep space": "Outbound probes and encounter context; no live positions are shown.",
  };
  return <main className="exhibit-page section-pad">
    <div className="page-heading"><p className="eyebrow">Interactive exhibit · NASA records</p><h1>Where the machines are.</h1><p className="lede">Choose a destination to inspect every relevant mission record. This educational map is schematic, not to scale, and not live tracking: it contains no invented coordinates or trajectories.</p></div>
    <div className="solar-layout">
      <section className="solar-stage" aria-labelledby="solar-map-heading">
        <div className="solar-stage-heading"><p className="eyebrow">Destination map</p><h2 id="solar-map-heading">A map of recorded hardware</h2><p className="small-copy">Markers represent records, not geographic positions. Select a destination or a mission marker.</p></div>
        <div className="solar-destination-map" role="group" aria-label="NASA mission destinations">
          {(["Moon", "Mars", "Deep space"] as Destination[]).map(destination => {
            const records = missions.filter(mission => mission.destination === destination);
            return <div className={`destination-node ${selected === destination ? "selected" : ""}`} key={destination}>
              <button className="destination-button" aria-pressed={selected === destination} onClick={() => setSelected(destination)}><span className={`destination-dot ${destination === "Moon" ? "moon" : destination === "Mars" ? "mars" : "deep"}`} /><b>{destination}</b><small>{records.length} records</small></button>
              <div className="mission-markers" aria-label={`${destination} mission markers`}>{records.map(mission => <button className="mission-marker" key={mission.id} onClick={() => navigate(`/missions/${mission.id}`)} title={`Open ${mission.name}`}><span>{year(mission.launchDate)}</span>{mission.name}<ArrowRight size={13} aria-hidden="true" /></button>)}</div>
            </div>;
          })}
        </div>
        <p className="map-legend"><span className="legend-line" />Placement labels: surface · orbit (when recorded) · traveling. No scale · no trajectories · no current positions.</p>
      </section>
      <section className="solar-info" aria-live="polite" aria-labelledby="selected-destination-heading">
        <p className="eyebrow">Selected destination</p><h2 id="selected-destination-heading">{selected}</h2><p className="small-copy">{destinationDescription[selected]}</p>
        <div className="solar-missions">{destinationMissions.map(mission => <article className="solar-mission-card" key={mission.id}>
          <div className="solar-card-heading"><div><span className="record-kicker">{year(mission.launchDate)} · {placement(mission)}</span><h3>{mission.name}</h3></div><StatusPill status={mission.status} /></div>
          <dl className="solar-card-facts"><div><dt>Hardware</dt><dd>{mission.hardwareType}</dd></div><div><dt>Destination / encounter</dt><dd>{mission.arrivalDate ? `Arrived / encountered ${formatDate(mission.arrivalDate)}` : "Encounter date not recorded"}</dd></div><div><dt>Mission outcome</dt><dd>{mission.whyItMatters}</dd></div><div><dt>Site / trajectory context</dt><dd>{mission.physicalFate}</dd></div><div><dt>Hardware status</dt><dd>{mission.status} · recorded {formatDate(mission.statusAsOf)}</dd></div></dl>
          <button className="solar-card-link" onClick={() => navigate(`/missions/${mission.id}`)}>Read mission record <ArrowRight size={15} /></button>
        </article>)}</div>
      </section>
    </div>
    <p className="solar-alt"><strong>Text alternative:</strong> NASA records are grouped by destination above. The selected {selected} group contains {destinationMissions.map(mission => mission.name).join(", ")}. Each record lists hardware, encounter context, outcome, status, and physical fate; open a mission record for its dated timeline and sources.</p>
  </main>;
}

function Timeline() {
  usePageTitle("Exploration timeline");
  const events = missions.flatMap(mission => mission.timeline.map(event => ({ ...event, mission }))).sort((a, b) => a.date.localeCompare(b.date));
  return <main className="timeline-page section-pad"><div className="page-heading"><p className="eyebrow">1967 — now</p><h1>Leaving a mark.</h1><p className="lede">A chronology of machines that landed, listened, measured, and carried on.</p></div><div className="full-timeline">{events.map((event, index) => <Link className="full-event" to={`/missions/${event.mission.id}`} key={`${event.mission.id}-${event.date}-${index}`}><span>{formatDate(event.date)}</span><div><p className="eyebrow">{event.mission.destination} / {event.mission.name}</p><h2>{event.label}</h2><p>{event.description}</p></div><ArrowRight size={18} /></Link>)}</div></main>;
}

function MissionDetail() {
  const { id } = useParams();
  const mission = missions.find(item => item.id === id);
  usePageTitle(mission?.name ?? "Mission not found");
  if (!mission) return <main className="empty-state section-pad"><h1>Mission not found.</h1><Link className="text-link" to="/explore">Return to explorer <ArrowRight size={16} /></Link></main>;
  const related = missions.filter(item => item.id !== mission.id && item.destination === mission.destination).slice(0, 3);
  const image = primaryImage(mission);
  const missionImages = imagesForMission(mission);
  const objectives = mission.objectives?.length ? mission.objectives : [mission.missionObjective];
  const listSections = [
    ["Objectives", objectives],
    ["Hardware components", mission.hardwareComponents],
    ["Instruments", mission.instruments],
    ["Discoveries", mission.discoveries],
    ["Problems and constraints", mission.problems],
  ] as const;
  return <main className="mission-detail">
    <section className="detail-hero">
      <figure className="detail-hero-visual"><LocalImage image={image} alt={image?.title ?? `${mission.name} NASA photograph`} /><figcaption>{image?.title ?? `${mission.name} NASA photograph`} · {image?.credit ?? "NASA"} · {image?.nasaId ?? "catalog image"}</figcaption></figure>
      <div className="detail-hero-copy"><p className="eyebrow">{mission.destination} / {mission.hardwareType}</p><h1>{mission.name}</h1><p className="lede">{mission.simpleExplanation ?? mission.missionObjective}</p><dl className="detail-facts"><div><dt>Launched</dt><dd>{formatDate(mission.launchDate)}</dd></div><div><dt>Status</dt><dd><StatusPill status={mission.status} /></dd><small>Verified {formatDate(mission.statusAsOf)}</small></div><div><dt>Arrived / encountered</dt><dd>{formatDate(mission.arrivalDate)}</dd></div></dl></div>
    </section>
    <div className="detail-layout">
      <nav className="detail-toc" aria-label={`${mission.name} contents`}><p className="eyebrow">On this page</p><a href="#overview">Overview</a>{mission.historicalContext ? <a href="#context">Context</a> : null}<a href="#specs">Hardware & instruments</a><a href="#timeline">Timeline</a><a href="#fate">Fate & legacy</a><a href="#evidence">Evidence trail</a><a href="#gallery">Gallery & sources</a>{related.length ? <a href="#related">Related missions</a> : null}</nav>
      <article className="detail-content">
        <section id="overview" className="detail-section"><p className="eyebrow">Mission objective</p><h2>{mission.missionObjective}</h2><p className="body-copy">{mission.howItWorked}</p></section>
        <section className="detail-section"><p className="eyebrow">Reader's note</p><h2>What the hardware had to do.</h2><p className="body-copy">{mission.simpleExplanation ?? `This ${mission.hardwareType.toLowerCase()} went to ${mission.destination.toLowerCase()} to answer a focused question. The record describes its working approach as: ${mission.howItWorked}`}</p></section>
        {mission.historicalContext ? <section id="context" className="detail-section"><p className="eyebrow">Historical context</p><h2>Why this mission was sent.</h2><p className="body-copy">{mission.historicalContext}</p></section> : null}
        <section id="specs" className="detail-wide detail-section"><p className="eyebrow">The hardware</p><div className="mission-brief"><div className="brief-grid"><div><b>Hardware</b><span>{mission.hardwareType}</span></div><div><b>Destination</b><span>{mission.destination}</span></div><div><b>Mission end</b><span>{formatDate(mission.missionEndDate)}</span></div><div><b>Current reading</b><span>{mission.status} · {formatDate(mission.statusAsOf)}</span></div></div>{mission.technicalSpecs ? <dl className="technical-specs">{Object.entries(mission.technicalSpecs).map(([key, value]) => <div key={key}><dt>{key}</dt><dd>{value}</dd></div>)}</dl> : null}</div></section>
        <HardwareExplorer mission={mission} />
        {listSections.filter(([, items]) => items?.length).map(([title, items]) => <details className="deep-dive-panel" key={title} open={title === "Discoveries"}><summary>{title}<ChevronDown size={17} /></summary><ul className="finding-list">{items?.map(item => <li key={item}>{item}</li>)}</ul></details>)}
        <section id="timeline" className="detail-wide detail-section"><p className="eyebrow">A life in dates</p><div className="timeline">{mission.timeline.map(item => <div className="timeline-item" key={`${item.date}-${item.label}`}><span>{formatDate(item.date)}</span><div><h3>{item.label}</h3><p>{item.description}</p></div></div>)}</div></section>
        <section id="fate" className="callout detail-wide detail-section"><p className="eyebrow">Physical fate</p><p>{mission.physicalFate}</p><p className="small-copy"><strong>Operating status:</strong> {mission.status}, recorded {formatDate(mission.statusAsOf)}. <a href={mission.statusSourceUrl} target="_blank" rel="noreferrer">Read the status source <ExternalLink size={13} /></a></p></section>
        {mission.legacy || mission.whyItMatters ? <section className="why-matters detail-wide detail-section"><p className="eyebrow">Legacy</p><p>{mission.legacy ?? mission.whyItMatters}</p></section> : null}
        <SourceTrail mission={mission} />
        <section id="gallery" className="detail-wide image-credit-block detail-section"><p className="eyebrow">Gallery & sources</p><ImageGallery mission={mission} images={missionImages} /><div className="sources">{mission.sources.map(source => <a key={source.url} href={source.sourceUrl ?? source.url} target="_blank" rel="noreferrer"><span>{source.title}</span><small>{source.organization} · {source.sourceType}</small><ExternalLink size={14} /></a>)}</div></section>
        {related.length ? <section id="related" className="detail-wide related detail-section"><div className="section-heading"><div><p className="eyebrow">Same destination</p><h2>Continue the journey.</h2></div></div><div className="mission-grid">{related.map(item => <MissionCard key={item.id} mission={item} />)}</div></section> : null}
      </article>
    </div>
  </main>;
}

function Footer() {
  return <footer><span>WAYFINDERS / 2026</span><span>NASA hardware across the Solar System</span><Link to="/about">Research & sources <ArrowRight size={14} /></Link></footer>;
}

function AboutPage() {
  usePageTitle("About & sources");
  return <main className="about-page section-pad"><div className="page-heading"><p className="eyebrow">Research & sources</p><h1>How this archive works.</h1><p className="lede">A transparent field guide to machines that remain after the mission.</p></div><div className="about-columns"><section><p className="eyebrow">Selection</p><h2>NASA hardware, clearly labeled.</h2><p className="body-copy">The collection focuses on NASA spacecraft, landers, rovers, probes, and instruments. Non-NASA objects can appear only as clearly identified context. Status and physical fate are kept separate because a silent machine can still remain on another world.</p></section><section><p className="eyebrow">Method</p><h2>Facts first. Interpretation second.</h2><p className="body-copy">Dates, mission objectives, discoveries, and status references are recorded in the local mission dataset. Every source includes its title, organization, source type, access date, and the claims it supports. Images come from the official NASA Image and Video Library, with NASA IDs, titles, credits, original URLs, and local paths preserved.</p></section><section><p className="eyebrow">Limitations</p><h2>A snapshot, not live tracking.</h2><p className="body-copy">Operational status can change. The schematic Solar System view is intentionally not to scale and never represents current spacecraft coordinates. When a physical fate is uncertain, the record says so. Corrections, uncertainties, and future review points are recorded in the repository's research audit.</p></section></div></main>;
}

function App() {
  return <><ScrollManager /><Header /><Routes><Route path="/" element={<Landing />} /><Route path="/explore" element={<Explorer />} /><Route path="/discoveries" element={<DiscoveryExplorer />} /><Route path="/missions/:id" element={<MissionDetail />} /><Route path="/solar-system" element={<SolarSystem />} /><Route path="/timeline" element={<Timeline />} /><Route path="/about" element={<AboutPage />} /></Routes><Footer /></>;
}

export default App;
