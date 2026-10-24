# Wayfinders research audit

**Audit date:** 2026-10-24  
**Scope:** 11 mission and hardware records in `data/missions.json`

## Records reviewed

- Surveyor 3
- Apollo 12 lunar hardware / ALSEP
- Spirit
- Opportunity
- Curiosity
- Perseverance
- Pioneer 10
- Pioneer 11
- Voyager 1
- Voyager 2
- New Horizons

## Corrections made

- Corrected Surveyor 3's final contact and mission end to **1967-05-04**. The lander is listed as **No longer operational**, while its remaining structure is still on the Moon.
- Corrected the Apollo 12 hardware record so the mission date ends with splashdown on **1969-11-24**. The ALSEP instruments are separately described as no longer operational after the program-wide shutdown on **1977-09-30**.
- Clarified that Apollo 12 removed Surveyor 3's camera and other parts; the rest of the lander remains at Oceanus Procellarum.
- Added Pioneer 10 and Pioneer 11 as separate hardware records. Both are silent, physically traveling on heliocentric escape trajectories, and are not treated as operational.
- Preserved the distinction between a rover that physically remains on Mars and a rover that is still operating.
- Added source metadata to every mission source: title, organization, canonical URL, source type, access date, and supported claims.
- Linked every mission to the local NASA image IDs used by the frontend.

## Remaining uncertainty and limitations

- The exact present engineering condition and precise position of silent Pioneer spacecraft cannot be directly verified from Earth after communication ended.
- The exact future operating lifetime of Curiosity, Perseverance, Voyager 1, Voyager 2, and New Horizons is inherently time-sensitive. Their records carry a status date and authoritative status URL rather than implying permanence.
- “Physical fate” for deep-space probes describes their continuing trajectory; it does not claim a live position or complete knowledge of their hardware condition.
- Apollo lunar hardware is a grouped record. Individual ALSEP instruments had different operating histories even though the program shutdown date is shared.

## Source quality

The audit prioritizes NASA mission pages, NASA Science, NASA Jet Propulsion Laboratory mission archives, NASA NTRS, and the NASA National Space Science Data Center. Image records retain their NASA IDs, original titles, credits, source URLs, and local paths in `data/nasa-image-catalog.json`.

## Image review

The local catalog contains 24 verified NASA image assets. Surveyor 3 / Apollo 12 imagery is especially strong because it shows the actual hardware on the lunar surface. Some deep-space entries are contextual spacecraft, instrument, or mission images rather than photographs of the probe in flight; those are labeled with their original NASA title and should receive a future editorial pass if a closer hardware photograph becomes available.

## Future status updates

Operational records should be rechecked before publication or classroom use. The fields to update are `status`, `statusAsOf`, `statusSourceUrl`, `physicalFate`, and any dependent timeline event. No live tracking is presented by the schematic Solar System exhibit.

## Claim-level traceability review

Mission pages now include a **Research traceability** section. It displays each
source's supported claims, source type, publication date when recorded, and
retrieval date. The existing `claimSources` mappings are checked against the
mission source list by `npm run validate`; URLs that are not in that list are
reported as warnings.

| Mission | Sources | Claim mappings | Outstanding review |
|---|---:|---:|---|
| Surveyor 3 | 2 | 2 | Verify Apollo 12 hardware-return details against the cited Apollo archive. |
| Apollo 12 lunar hardware | 3 | 3 | Review individual ALSEP instrument shutdown dates separately from the grouped record. |
| Spirit | 2 | 2 | Keep last communication, mission end, and surface fate as separate claims. |
| Opportunity | 2 | 2 | Recheck final communication and surface-fate wording in a future status pass. |
| Curiosity | 2 | 2 | Operational status is a dated snapshot; no mission-end date is asserted. |
| Perseverance | 2 | 2 | Sample caching is not represented as sample return. |
| Voyager 1 | 2 | 2 | Recheck subsystem status and heliopause language when status sources change. |
| Voyager 2 | 2 | 2 | Recheck heliopause and encounter claims during future status review. |
| New Horizons | 2 | 2 | Recheck extended-mission status and encounter context periodically. |
| Pioneer 10 | 2 | 1 | Add more granular claim mappings after a primary-source review. |
| Pioneer 11 | 2 | 1 | Add more granular claim mappings and separately verify last communication. |

Publication dates are not present in the current source records and are shown
as “Not recorded”; they are not inferred from URLs or retrieval dates. The
validator checks URL shape and metadata but cannot prove that a remote page is
still online or that its contents have not changed. No broken remote source is
claimed as resolved without a network-backed review.
