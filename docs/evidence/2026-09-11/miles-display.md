# Display-unit verification

Verified locally on September 11, 2026, on `codex/miles-pace-display`, based on main commit `3e32bf8`. This records pre-publication checks; it is not evidence of a deployed build.

## Scope

The homepage, About page and ten primary analyses default to miles and minutes per mile, with a Miles / Kilometres switch. Miles mode uses feet for elevation. Explicit URL units take precedence over browser storage. Source data, cohorts, calculations and `analysis/release.json` are unchanged. The research archive and full methodology retain source units.

Original timing sections are converted, not interpolated: 5 km is displayed as 3.11 miles. Numeric conversions use original precision before rounding, including narrative findings derived from chart values.

## Automated checks

- `npx tsc --noEmit --incremental false` passed.
- `npm run verify:data` passed, including conversion, URL preference, narrative precision, chart rendering, source immutability and existing analytical checks.
- `npm run build` passed with 137 exported pages.
- `git diff --check` passed.
- No changes to `public/data` or `analysis/release.json`.

## Browser checks

Checks used the local site at desktop width and a 390 px mobile viewport.

- All courses, target 3:15: both modes retain 188,226 finishes. The slowest section displays as 21.75–24.85 mi at 7:53/mi, or 35–40 km at 4:54/km. Exact-value tables retain all nine original sections and their sample sizes.
- Checkpoint comparison at 30 km / 18.64 mi: switching units preserves 41,731 complete finishes across 160 editions, 10.3% under 3:15 and median finish 3:19:44. Required pace changes from 7:26/mile to 4:37/km without resetting the comparison.
- New York terrain, target 3:15: the largest net elevation change displays as 44.6 ft or 13.6 m. Switching units preserves the selected climbing/descending chart.
- Analysis navigation carries target and units in the URL. Reload restores explicit units; visiting the homepage without a units parameter restores the saved preference.
- Mobile layout has no horizontal page overflow, and both unit buttons have 44 px touch targets.

The full methods and archived research retain metric source definitions. No individual-mile observations, new runner cohorts or new source-release adoption are implied.
