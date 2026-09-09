# Follow-up to the September 9 site audit

This update changes presentation, controls and aggregate delivery. It preserves every source CSV/JSON pack, runner-level calculation and private-data boundary.

## Changes

| Audit items | Resolution |
| --- | --- |
| A1 | Derive age/gender availability from the published city cohorts. Disable age where no publishable exact-age group exists, disable unavailable gender options, and explain course-wide fallback once. Other fallback messages are deduplicated above the answers; each answer still names its actual group. Berlin does have some exact-age cohorts, contrary to the audit's example wording. |
| A2 | Omit city-years below 25% of the city's median eligible edition size from both trend lines. Keep their values, counts and labels in the table, with explicit gaps. This is a sample-size warning, not proof of scrape completeness. Pooled guide estimates retain their original data; edition counts are labeled as represented editions, including partial fields. |
| A3, B7 | Label the original wall snapshot and the separate repeaters/linked-history figure. Attach t4 sample counts to the repeaters age chart. |
| A4 | Explain that opening categories use an earlier-best pace and mix ability changes with opening choices. Show one sentence when no published opening group beats a threshold. The audit's proposed claim that only faster openers *could* reach the target is not mathematically valid: later acceleration can compensate. |
| A5 | Mark courses with fewer than 1,000 eligible finishes or three represented editions as limited coverage, in both the selector and a prominent notice. This does not certify other courses as complete. |
| B1 | Round away negative zero; show one decimal for minutes. |
| B2, B3 | One percentile range and median marker per course; compact paired section bars with a visible zero reference and one legend. |
| B4, C7, C9 | Separate checkpoint input errors from fetch errors, clear submitted results on invalid input, restrict retry to loading failures, and use friendly network-error text. Fix trend-fallback grammar. |
| B5 | Show the selected fixed two-minute bin and publishable adjacent bins with identical demographic/trend filters. Explain the boundary effect. Do not invent recentered or interpolated estimates from aggregates. |
| B6, C4 | Generate smaller, content-addressed profile views for each achieved-time band; fetch nearby-finish data for the exact target separately and checkpoint data only for relevant elapsed bands. Restore the URL before any course fetch. Disable navigation prefetch. Immutable caching applies only to content-hash filenames, not mutable source files. |
| B8 | Display the selected chart's observation counts next to its controls; distinguish the full-analysis count above it. |
| B9 | Deduplicate identical count columns. Stack exact values with field labels on small screens. |
| B10 | Link each research/personalized question to its method anchor; open the matching disclosure when reached by a fragment link. |
| B11, C3 | Push submitted profiles into browser history, restore on back/forward, normalize course case and age dashes, and canonicalize corrected URL settings with a notice. |
| C2 | Previous-time entry accepts 2:00–12:00. This is a guide input range, not a claim about the current world record. |
| C5, C6, C13 | Pace-chart ticks include 10/20/30/40 km; percentile-edge swatches are lighter/thinner; SVG charts receive accessible names and descriptions. |
| C8 | Use New York consistently and prefix specific checkpoint age groups with “age.” |
| C10, C11 | Add a compact 404 with navigation, robots.txt and a sitemap matching generated routes. |
| C12 | Share one course selector between the two annual trend charts. |
| C14 | Distinguish ingested cities from courses with usable complete splits in the homepage coverage text. |
| C15 | Document the actual exclusion: 14 eligible finishes are outside fields with at least 100 eligible finishers. Ties receive average ranks and are retained. |

## Deliberate differences from the suggested fixes

- C1: keep a text keyboard for colon-formatted times. A numeric-only keypad commonly omits the colon, which would make the existing input format harder to enter. Splitting times into separate numeric fields remains an optional future interface change.
- Do not claim that Tokyo is elite-only from these aggregates alone. Its small, unusually fast sample is prominently labeled as limited and potentially unrepresentative.
- Do not reclassify opening strategy against the current finish time; that would reintroduce outcome leakage into a strategy comparison. Current-finish normalization remains available for descriptive race shapes.
- Explain regression to the mean in return-to-course comparisons and the distinct exact-age inclusion rules. Mention measured forecast coverage rather than promising that a nominal 80% interval achieves 80% everywhere.

## Verification

- Production build and TypeScript checks pass.
- Existing checks cover 35 research questions, 125 chart views, and 64 personalized profiles.
- A new regression check compares every answer, chart and sample from the smaller transport views against the full source shards across 240 profiles spanning all 30 course selections, four targets and two demographic/prior-time profiles.
- Targeted checks cover checkpoint boundary neighbors, URL normalization, age/gender availability, negative zero, screened annual editions, rank exclusions and repeaters counts.
- Export checks resolve 151 methodology fragment links, all 120 sitemap URLs and the custom 404.

No physical-device, browser-emulation, screen-reader or slow-network timing audit was rerun in this update. Payload reductions are byte measurements, not measured loading-time guarantees.

## Remaining research limitations

Historical field completeness, route applicability and identity-link accuracy need source-level validation. The wall snapshot remains separate from the newer export. Forecast calibration can vary by checkpoint. Sparse weather/qualifying-rule comparisons cannot establish general effects, and the cause of absent high-temperature groups needs further upstream inspection. Public aggregates cannot estimate a false-link rate or validate all private calculations.
