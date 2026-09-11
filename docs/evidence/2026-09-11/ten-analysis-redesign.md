# Ten-analysis redesign verification

September 11, 2026. Scope: the primary website experience, its compatibility entry points, and expansion of the personalized target range. Source release remains `private-export-20260907-1318`; the live snapshot and other public packs are unchanged.

## Design and navigation

The homepage introduces the study, explains its purpose, previews an actual four-hour pacing profile, and offers one primary starting action. A fixed ranked list leads to ten separate question pages. Each page has a short purpose, relevant comparison controls, an observed result, one chart at a time, reading guidance and an expandable method. The wider work remains accessible through Research archive.

The visual system uses white backgrounds, dark text, restrained blue accents, native Apple/Helvetica typography, generous spacing and dividing rules. Course ranges show a median dot and the observed 10th–90th percentile range. Methods distinguish observed variation from confidence or prediction intervals. Exact values and denominators remain available in accessible tables.

## Browser checks

Checked the local Next development site, then the production static export served on localhost, using the browser UI. Screenshots were reviewed for the homepage, question pages and course range chart. Responsive checks used 1440 px desktop and 390 px phone viewports; the pacing page document width matched each viewport, without horizontal page overflow. The normal browser view was also inspected visually.

- Homepage purpose, actual-data preview, ranked ten links and pacing entry action.
- Five-hour all-course pacing: 173,784 finishes in the 4:52:30–5:07:30 achieved band.
- New York / Women / age 50–54 selection carried from pacing to opening, checkpoint, section, course and weather analyses.
- Opening comparison showed its distinct group denominators; course comparison hid course and target controls and used a common cohort across displayed courses.
- Checkpoint at 30 km in 3:33:18 for a five-hour target: 333 complete New York finishes, 11.4% under target, median 5:10:18. Invalid elapsed input removed the stale result; submitting 3:30:00 produced a new comparison.
- One-band New York weather result explicitly explained that cooler/warmer differences could not be established.
- Terrain showed the supplied route and pacing switcher after choosing a course. Selecting All courses instead asked for a course.
- Target context changed the exact count when moving from five to six hours while retaining the same comparison population.
- Legacy `/your-race?...#guide-gains` forwarded to `/analyses/finding-improvement` with the course, age, gender and target preserved. A broader age comparison was identified in the result.
- Age comparison hid the age selector. Melbourne's insufficient data produced an explanation and an explicit action to load the all-course example.

The development browser emitted existing Recharts/React `defaultProps` deprecation warnings for XAxis and YAxis. They did not prevent rendering. Production checks use the optimized export.

## Automated checks

- Python unittest discovery: all 10 tests passed, including exact threshold boundaries, expanded target range, and import validation.
- `npm run verify:data`: 35 archive questions / 125 views; 12 underlying personalized paths across 160 profiles / 1,320 charts; ten-route registry, shared profile URL round trips, invalid inputs, accessible exact values, percentile/CI distinction, range units, aggregate vintage isolation, cancellation and retries.
- `npm run build`: all 137 static pages generated, including ten primary analyses and the retained research routes.
- Documentation review: 382 local links checked with no missing targets.
- `git diff --check`: passed.

The separate [target expansion audit](target-range-expansion.json) records source checksums and all 9,319,420 unchanged overlapping threshold counts. Thresholds are supported from 1:30 through 12:00; this does not imply every achieved-time or demographic group has enough data. Weather and terrain are supported comparisons, not universal filters that can be applied to every other chart.

## Practical limits

City and checkpoint files load separately, and checkpoint data loads only after a submitted comparison. The largest checkpoint file is 46.7 MB uncompressed; local gzip-equivalent size is 2.63 MB, but HTTP compression was not inferred from that measurement. Real network speed and device memory still affect loading. Errors offer retry; sparse observations remain unavailable. This review does not validate the comparisons as causal recommendations or personal forecasts.
