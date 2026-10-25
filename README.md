# Wayfinders — NASA Hardware Across the Solar System

**An educational field guide to NASA hardware left on other worlds, in orbit, and traveling through deep space.**

Wayfinders explores spacecraft, landers, rovers, and probes, documenting what they discovered and what happened to them. Designed for readers aged 10–16, it distinguishes **operational status** from **physical fate**: a machine can stop operating while its hardware remains somewhere in space.

**[Live Demo](https://olympus-nasa-hackathon.vercel.app/)** · **[Mission Explorer](https://olympus-nasa-hackathon.vercel.app/explore)** · **[Research & Sources](https://olympus-nasa-hackathon.vercel.app/about)**

> Wayfinders is an independent educational project and is not affiliated with or endorsed by NASA.

## Features

- **Mission Explorer** — explore documented NASA hardware.
- **Discoveries** — browse scientific findings, their significance, and uncertainty.
- **Solar System** — explore a schematic view of missions across the Solar System.
- **Timeline** — follow mission events and milestones.
- **Research & Sources** — trace claims to documented sources and understand the project's limitations.

## Technology

React · TypeScript · Vite · React Router · JSON · Node.js 20+

Mission records and NASA image metadata are stored locally. Normal website visits do not require NASA API requests.

## Getting Started

**Requirements:** Node.js 20 or newer and npm.

```bash
git clone https://github.com/LaithAbuzaid/Olympus-NASA-HACKATHON.git
cd Olympus-NASA-HACKATHON
npm install
npm run dev
```

Open the local URL printed in the terminal.

## Development Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build |
| `npm run validate` | Validate mission data, citations, image references, and local files |

Before publishing changes, run:

```bash
npm run validate
npm run build
```

## NASA Image Pipeline

The project includes scripts to retrieve NASA Image and Video Library metadata, download approved assets, and validate local files.

```bash
npm run fetch
npm run download
npm run validate
```

To fetch a specific subject:

```bash
npm run fetch -- --query "Voyager 1 spacecraft" --max 6 --pages 2
```

Fetching and downloading require network access. The website itself uses the prepared local data and assets. The downloader restricts sources to HTTPS NASA hosts, checks image signatures, limits downloads, and skips valid files on repeated runs.

## Research Standards

Scientific accuracy and transparency are central to Wayfinders.

- **Traceable claims:** Major claims should have supporting source references.
- **Separate status and fate:** Operational status must not be confused with the physical location or fate of hardware.
- **Visible uncertainty:** Unconfirmed details must remain uncertain rather than being presented as facts.
- **Dated status records:** Time-sensitive status information must include an `statusAsOf` date and a supporting source.
- **Image attribution:** Preserve NASA IDs, original titles, credits, and source references.

To add a mission, update `data/missions.json` and reference image IDs present in `data/nasa-image-catalog.json`. Include the relevant sources and status information, then run the validation and build commands.

Review [`RESEARCH-AUDIT.md`](./RESEARCH-AUDIT.md) before publishing research or status changes.

## Limitations

- The Solar System visualization is schematic, not to scale, and does not show live spacecraft coordinates.
- Operational status records are snapshots that may require future review.
- Some deep-space records use contextual imagery when direct photographs of a probe in flight are unavailable.
- Passing validation checks does not independently prove every scientific claim.

## Project Documentation

- [`PRESENTATION-GUIDE.md`](./PRESENTATION-GUIDE.md) — prepared project demonstration sequence.
- [`RESEARCH-AUDIT.md`](./RESEARCH-AUDIT.md) — research uncertainties and review points.
- [`data/missions.json`](./data/missions.json) — mission and discovery records.
- [`data/nasa-image-catalog.json`](./data/nasa-image-catalog.json) — NASA image metadata.

---

**Wayfinders / 2026** · An independent educational field guide to NASA hardware across the Solar System.
