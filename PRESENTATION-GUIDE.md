# Wayfinders presentation guide

## Demonstration sequence

1. **Landing page:** Begin with the opening statement that spacecraft and
   instruments leave a physical legacy, while their scientific value can
   continue after a mission ends.
2. **Three ways hardware persists:** Open the three linked records in order:
   - **Surveyor 3** — a lander left on the Moon in Oceanus Procellarum. Its
     record is dated 1967-05-04; Apollo 12 later visited it and returned
     selected parts.
   - **Opportunity** — a Mars rover listed as no longer operational as of
     2019-02-13 after a long period of surface science. The rover remains at
     Perseverance Valley.
   - **Voyager 1** — a deep-space probe listed as still traveling through
     interstellar space, with the current record dated 2026-10-24.
3. **Mission explorer:** Search by a discovery or hardware type, combine
   destination/status filters, open quick view, and compare two records.
4. **Discovery index:** Move from mission names to evidence, then open the
   supporting mission record and source trail.
5. **Solar System visualization:** Select Moon, Mars, and Deep space. Emphasize
   that the positions are schematic groupings, not live tracking.
6. **Mission detail:** Show the authentic image gallery, hardware explanation,
   timeline, physical fate, status date, and evidence trail.

## Strongest features

- One verified mission dataset powers the explorer, discoveries, comparison,
  learning activities, and Solar System exhibit.
- Status and physical fate are shown as separate facts.
- NASA image titles, IDs, credits, captions, and source links remain attached to
  the local image catalog.
- Discovery records preserve observations, conclusions, significance, and
  uncertainty instead of turning hypotheses into facts.
- URLs preserve explorer searches and filters for sharing.

## Verification

- `npm run build` — passed.
- `npm run validate` — passed: 11 missions and 24 NASA images.
- TypeScript diagnostics for the edited application files — no errors.
- Browser smoke checks — landing page, mission detail evidence trail, and local
  mission route loaded successfully.

## Remaining limitations

- The operational records are dated snapshots, not live telemetry.
- Some deep-space imagery is contextual NASA imagery rather than a photograph of
  a probe in flight.
- Publication dates are not available for every source record.
- The Solar System exhibit is schematic and intentionally does not provide
  unverified coordinates or current spacecraft positions.
