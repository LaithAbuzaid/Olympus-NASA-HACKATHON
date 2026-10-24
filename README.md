# Wayfinders

Wayfinders is an independent educational field guide to NASA hardware left on worlds, in orbit, and traveling through deep space. It is designed for curious readers roughly 10–16 years old and separates a machine's physical fate from whether it still operates.

## Stack

- React and TypeScript
- Vite
- React Router
- Local JSON mission and image catalogs
- Node.js 20+ scripts using built-in `fetch` and filesystem APIs

Wayfinders is not an official NASA website and does not imply NASA endorsement.

For a live demonstration, follow the prepared sequence in
[PRESENTATION-GUIDE.md](./PRESENTATION-GUIDE.md). It starts with the landing
page's physical-legacy framing, then uses Surveyor 3, Opportunity, and Voyager
1 as contrasting verified records.

## Discovery index

The `/discoveries` route is a discovery-focused view derived from the verified
`discoveries` arrays in `data/missions.json`. Each entry keeps the observation
separate from its conservative conclusion, significance, uncertainty, and the
mission's original source URLs. Categories are only assigned where the
existing record supports them; an unclassified finding remains searchable.

## Prerequisites and setup

Requires Node.js 20 or newer.

```bash
npm install
npm run dev
```

Open the local Vite URL printed in the terminal. The production build is fully local after data assets have been prepared; ordinary page loads do not call NASA APIs.

## Production commands

```bash
npm run build       # TypeScript project build and Vite production bundle
npm run preview     # Preview the production bundle
npm run validate    # Validate mission records, citations, image paths, and local files
```

There is no lint configuration in this project yet. The production build runs the configured TypeScript checker.

## NASA image data pipeline

Fetch a curated catalog from the official NASA Image and Video Library:

```bash
npm run fetch
npm run fetch -- --query "Voyager 1 spacecraft" --max 6 --pages 2
npm run fetch -- --dry-run
```

Download approved preview assets into `public/images/nasa/`:

```bash
npm run download
```

Validate the mission dataset and downloaded assets:

```bash
npm run validate
```

The fetcher uses bounded pagination, timeouts, retries, relevance ranking, duplicate NASA ID filtering, and records failed searches. The downloader only accepts HTTPS NASA hosts, limits response size and concurrency, verifies image signatures, and skips valid files on repeated runs.

## Adding a mission

1. Add a record to `data/missions.json`.
2. Use an explicit `status` and `statusAsOf`; do not infer current operation from an old mission page.
3. Add `statusSourceUrl`, `sources`, and `claimSources` for major claims.
4. Add NASA IDs to `imageReferences` only after the IDs exist in `data/nasa-image-catalog.json`.
5. Run `npm run validate` and `npm run build`.

Mission records should include launch/arrival or encounter dates when verified, mission objective, plain-language engineering explanation, discoveries, physical fate, timeline, and why the record matters.

## Updating status and citations

Current status is time-sensitive. Update `status`, `statusAsOf`, `statusSourceUrl`, and any affected timeline or physical-fate text together. Sources include their title, organization, canonical URL, source type, access date, and the claims they support. Review the repository [research audit](./RESEARCH-AUDIT.md) before publishing a status change.

## NASA image attribution

The local image catalog preserves NASA ID, original title, description, creation date, credit, source URL, asset URL, and local path. Keep the displayed credit and NASA ID near the image or in the mission detail source section. NASA imagery may have additional usage guidance; check the original image page before redistribution.

## Known limitations

- The Solar System exhibit is schematic, not to scale, and never represents live spacecraft coordinates.
- Operational status records are snapshots and require future review.
- Some deep-space records use contextual spacecraft or instrument imagery where the catalog does not provide a direct photograph of the probe in flight; the original NASA title and credit are preserved.
- The image pipeline requires network access only when refreshing the prepared dataset. The website itself reads local data and assets.
