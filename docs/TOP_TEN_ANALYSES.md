# Ten analyses for Marathon Pacing Study

Implementation documented September 11, 2026; the redesign shipped in [PR #32](https://github.com/koolkam00/htw-live-study/pull/32), main commit `3e32bf8`, and was verified live. The main website presents ten ranked analyses, each at `/analyses/{slug}`. The personalized pack was recalculated at `2026-09-11T09:15:27Z` to expand whole-minute target support to 90–720 minutes, using the same September 7 input. This is not adoption of a newer source release. The checked-in personalized pack uses `private-20260907-1318`: 2,739,842 eligible finishes, 819,742 with an exact age, and 373,955 with a recent prior benchmark. The newer export has not replaced these results.

The order prioritizes an understandable runner decision, then strength and availability of the evidence, then additional information beyond the preceding cards. The ranking stays fixed; changing a profile updates results and availability without shuffling priorities.

The subsequent display-unit update defaults to miles and minutes per mile, with a Miles / Kilometres switch and elevation in feet for miles mode. The selection follows links and is shareable as `units=mi|km`; the browser saves the preference. The metric section names in this technical catalog describe source measurements. On the site, a recorded 5 km section becomes 3.11 miles without creating individual-mile splits. Unit selection changes displayed numbers and labels only: the ranked questions, source release, cohorts, counting thresholds and finish durations stay the same. See [display-unit semantics](WEBSITE_ARCHITECTURE.md#display-units). The PR #32 deployment verification above predates this unit update.

## Primary order and routes

The order, titles, slugs and visible controls are defined in [lib/ten-analyses.ts](../lib/ten-analyses.ts). The home page and `/analyses` list the ten; `AnalysisExplorer` renders one question at a time with profile parameters shared through its links. All ten have implemented selectors in [lib/personalized.ts](../lib/personalized.ts), underlying fields in [lib/personalized-types.ts](../lib/personalized-types.ts), and calculations in [analysis/build_personalized.py](../analysis/build_personalized.py). They are views of the existing [personalized pack](../public/data/packs/ext_personalized_guide/pack_meta.json), not ten independent datasets.

| Rank | Short title / question | Why this earns its place | Implemented data and method | Controls that actually affect the result | Limit to display with the result |
| ---: | --- | --- | --- | --- | --- |
| 1 | **Your pacing pattern** — How do runners near my time pace the race? (`/analyses/pacing-pattern`) | The whole-race profile provides the clearest starting point for understanding a marathon. | `profile`: `cohort.profiles[targetBucket]`; median section pace and observed 25th–75th percentiles over nine sections. | Course, exact-age band, recorded gender, achieved-time band around the target, optional prior-time band. | These are achieved finishes, not intended goals or an optimal pacing prescription; the middle 50% is observed variation, not uncertainty in the estimate. |
| 2 | **The opening 10 km** — What happens after a faster start? (`/analyses/starting-pace`) | The opening is a decision a runner can recognize and change, with a clearly defined earlier benchmark. | `opening`: `cohort.openings`; first 10 km pace more than 2% faster than, within 2% of, or more than 2% slower than the runner's recent recorded best pace; exact fraction finishing under the target. | Course, age, gender, target threshold, optional prior-time band. | Only linked runners with an earlier benchmark enter; groups differ in fitness, course and other factors, so a higher observed success rate is not the effect of choosing that opening. |
| 3 | **From here to the finish** — What can my checkpoint time tell me? (`/analyses/checkpoint`) | Actual race progress makes this useful during preparation and when reviewing a result. | `checkpoint` and `checkpointResult`: course checkpoint shards; observed finish distribution and exact under-target count in a two-minute elapsed band. | Course, age, gender, target threshold, checkpoint at 20/30/35 km, elapsed time, optional latest 5 km time/trend. | Previous time is not used. Complete finishers only; these historical outcomes are not calibrated personal probabilities and exclude withdrawals. |
| 4 | **The minutes that matter** — Where is a target time won or lost? (`/analyses/where-time-is-gained`) | A direct section-by-section comparison makes a finish-time difference tangible without a complex model. | `sections`: `cohort.near`; compare mean section durations in `[target−5,target)` and `[target,target+5)` minutes against the target's even-pace budget. | Course, age, gender, exact whole-minute target, optional prior-time band. | The groups are selected by their final result; their difference does not prove where a runner should push harder. Show each group's own sample. |
| 5 | **Compare the courses** — Which courses have faster, steadier results? (`/analyses/course-comparison`) | Course choice deserves a comparison that shows both typical outcomes and their variability. | `courses`: `summary.courses`; 10th, 50th and 90th percentiles of finish change versus recent recorded best, with at least 100 finishes and three editions per course. | One common age, gender and prior-time cohort across courses; course and target controls are hidden. | Target does not filter this result; course is the comparison dimension, not a restriction to one course. Different fields, conditions and fitness changes remain mixed; do not label a winner the fastest course or show an equivalent-time prediction. |
| 6 | **Race-day weather** — How do warm and cool races compare? (`/analyses/race-day-weather`) | Weather matters to race planning, and equal edition weighting avoids treating every runner as a separate weather experiment. | `weather`: `cohort.weather`; average edition medians of finish change versus recent prior best, within supplied start-hour temperature bands. | Course, age, gender, optional prior-time band; the chart displays the available temperature bands together. | Target does not filter this result. At least 20 finishes per edition/group, three editions and 100 finishes per band; modeled start-hour temperature is not personal exposure or a causal heat penalty. |
| 7 | **Hills and rhythm** — Where do hills and pace changes line up? (`/analyses/hills-and-pacing`) | Pairing section pace with the supplied terrain gives concrete course context while keeping the uncertainty visible. | `terrain`: the same achieved-time pace profile as rank 1, aligned with `CityData.terrain` net change and supplied gain/loss. | An explicitly selected course; age, gender, target band and prior-time band affect pace only; the chart switcher shows pace, net elevation change and supplied gain/loss when available. | Elevation does not change when demographic filters change. No historical validity years; net change hides mixed climbs/descents, and supplied gain/loss may not reconcile. No grade-adjusted effort or historical hill penalty. |
| 8 | **Your target in context** — How does my target compare with the field? (`/analyses/finish-time-context`) | It gives a simple, precisely counted reference for a time without claiming to measure readiness. | `ambition`: `cohort.cdf` at every whole-minute target from 90 through 720, plus the cohort's finish distribution. | Course, age, gender, exact target, optional prior-time band. | Without a prior-time filter it describes the selected field; with one it is still a historical proportion, not an individual success probability. Changing target changes the counted threshold, not the cohort. |
| 9 | **Where improvement happens** — Where do improving runners find time? (`/analyses/finding-improvement`) | Paired section gains make recorded improvement understandable and reconcile to the total gain. | `gains`: `cohort.gains[targetBucket]`; mean time gained in opening 10 km, middle 20 km and final 12.195 km against the fastest linked finish in strictly earlier years. | Course, age, gender, achieved-time band, optional prior-time band. | The earlier result need not be on the same course. These are selected improving finishes and earlier recorded bests, not verified lifetime PBs or a prescription. |
| 10 | **Age and pace retention** — How does pacing differ across age groups? (`/analyses/age-and-pacing`) | It addresses an important demographic question, but comes last because age coverage is uneven and the comparison is cross-sectional. | `age`: median percentage pace change from 0–20 to 20–40 km across exact-age bands, using an identical prior-time band if supplied, otherwise the same achieved-time band. | Course, gender, prior-time band; target band only when no usable prior band is retained. The age control is hidden because the chart compares age groups. | Different people are compared, not the same runner aging. Require at least two published age groups; unknown ages are never assigned to a band. |

Each result presents the cohort actually used, a sample and edition count when available, the input vintage, and one concise limitation. An expandable method contains the remaining details. A percent in the opening or checkpoint analysis represents an observed share of finishes, not “your chance.”

## Supported controls and counting rules

The profile type has course, age, gender, target and previous time. Weather and terrain are separate data views; there is no shared age × speed × gender × elevation × weather record cube in the published personalized pack. Selecting a warm day must not appear to recalculate a cool-weather pacing profile, and selecting an uphill section must not appear to create a hill-adjusted forecast.

“Speed” has two distinct meanings and needs two labels:

- **Target finish:** a strict counting threshold for ranks 2, 3 and 8; exact neighboring finish windows for rank 4; a centered achieved-time band for ranks 1, 7 and 9 and for rank 10 without history. Whole-minute targets run from 1:30 through 12:00, with exact counts at all 631 thresholds. The engine has 43 presets from 90 through 720 minutes; cells publish only when they meet the method’s sample requirements. Profile bands are 15 minutes wide around the nearest preset, so not every one-minute target adjustment changes those profiles.
- **Earlier recorded best:** an optional 15-minute band of the fastest eligible result in the two strictly earlier calendar years. It is not an exact last marathon time. It changes supported cohorts, especially ranks 2, 5 and 6, but never the checkpoint comparison. Do not silently fill it from the visitor's target.

Weather supports the existing bands below 10°C, 10–14.9°C, 15–19.9°C and 20°C or warmer only where cells exist. The all-course aggregate currently publishes the first three, not the hot band. The chart displays those observed bands; it does not generate intermediate temperatures or filter the other nine analyses. At least two bands are needed to claim a cooler/warmer comparison. A one-band result is labeled as coverage, not a cooler/warmer contrast.

Terrain supports a supplied profile for an explicitly selected course. The chart switcher displays net change, supplied gain/loss when available, and the corresponding observed pace profile. There is no elevation slider that generates new runner cohorts, corrected paces or a causal hill adjustment. A separate all-course terrain-class chart already exists in `ext_terrain_pacing_proxy`, but its classes mix different courses and are not the personalized cohort.

The explorer shows only the controls used by the selected analysis. Course comparison hides course and target; weather hides target; age comparison hides age; checkpoint comparison hides earlier performance. All ages and all recorded gender categories are genuine choices, not inferred characteristics of the visitor.

## Cold start and availability

Implemented initial profile: **All courses, all ages, all recorded genders, no earlier time, example target 4:00**. This example is defined in `lib/analysis-profile.ts` and is not an inferred visitor profile. The main explorer does not choose an arbitrary city when a cohort is missing.

Why 4:00: the all-course 3:52:30–4:07:30 band has **351,995 finishes across 159 editions**, the largest of the 28 published all-course achieved-time preset bands in the expanded pack. The all-course cohort has **2,739,842 finishes across 162 editions**, with median finish **4:08:40**. Thus 4:00 is a well-covered example rather than a claim about a visitor's ability. The controls label the initial state “Start with an example.” An alternative centered on the corpus median would choose 4:15, but it has a smaller band (296,313 finishes).

The 4:00 all-course starting view has all three opening groups (255,613 faster, 65,089 similar, 53,253 slower openings), both near-target comparison groups (143,114 below and 99,141 above), three weather bands, 16 course comparison groups, 26,813 improving finishes, and 11 age comparison groups. These denominators differ deliberately; do not present one global sample as applying to every card.

The checkpoint example starts at 30 km with the 4:00 even-pace elapsed time, explicitly labeled as an example. The resulting 2:50–under-2:52 cohort contains 77,783 complete finishes across 157 editions. The visitor can replace the example before requesting a comparison; no earlier-time filter is applied.

All courses has **no terrain profile**. Rank 7 asks the user to choose a course; it does not borrow a default course's elevation. A deliberate course selection updates the shared profile, with that change visible. The analytical ranking stays fixed while the card needs a selection.

Checks of the September 11 recalculated shards establish these limits; the underlying September 7 population is unchanged:

| Coverage check | Result |
| --- | --- |
| Published selections | 29 cities plus All courses |
| Exact-age coverage | 819,742 / 2,739,842 eligible finishes, 29.9% |
| Selections without any age-specific cohort | 21 of 30 |
| At the 4:00 example, selections with a profile / near-target comparison | 27 / 27 of 30 |
| At the 4:00 example, selections with at least two opening groups | 20 of 30 |
| At the 4:00 example, selections with an age comparison | 8 of 30 |
| At the 4:00 example, selections with recorded-best gains | 17 of 30 |
| City selections with at least two temperature bands in the all/all/all cohort | Amsterdam, Eindhoven, Rotterdam and Washington |
| All-course weather coverage | Below 10°C: 46 editions / 131,730 finishes; 10–14.9°C: 60 / 185,252; 15–19.9°C: 14 / 15,702 |
| Published all-course achieved-time bands | 28 bands, centered from 2:00 through 8:45; extreme accepted targets can lack a profile |
| Sparse selections | Tokyo: 353 eligible finishes and no checkpoint cells; Melbourne: 416, no supported target profiles, no checkpoint cells and no supplied terrain in the guide |

These are aggregate-data availability checks, not a claim that all age/gender/prior combinations exist. `candidates()` broadens age/gender first while retaining prior time, then drops prior time. `checkpointResult()` also broadens recent pace trend and never changes course. Always disclose the actual relaxation; do not silently substitute a nearby target, another city or a national weather comparison. A broader comparison can be offered as an explicit user action.

## Relationship to the extended packs

The extended packs offer useful method context and additional questions. They cannot be spliced into a personalized card as if they used the same filters or denominator.

| Personalized card | Relevant extended pack | Important difference |
| --- | --- | --- |
| Opening | `ext_opening_tradeoffs` | Edition/gender/prior-band matched opening comparison with an edition bootstrap; the personalized under-target shares are unadjusted. |
| Checkpoint | `ext_checkpoint_forecast_validation` | A separate temporal holdout forecast trained before 2024 and tested in 2024–2026; it does not validate every personalized cohort's probabilities. |
| Weather | `ext_weather_pacing_patterns` | Requires 100 finishes per edition and five editions per band; the personal weather cells require 20 per edition/group and three editions. |
| Terrain | `ext_terrain_pacing_proxy` | All-course net-grade classes are pooled descriptive proxies, without personal age/gender/history filters. |
| Courses | `ext_course_outcome_spread`, `ext_paired_course_comparisons` | The first uses broader prior-ability groups; the second compares linked course pairs and balances race order. Neither is an individual equivalent-time calculator. |
| Improvement | `ext_earlier_best_section_gains` | Related earlier-best attribution; keep its published grouping and denominators distinct from target-bucket personal cohorts. |
| Age | `ext_age_pacing` | Broader decade bands and recorded-gender comparisons, rather than the guide's five-year groups and selected achieved/prior-time cohort. |

Do not force the general forecast, paired-course or matched-opening results to obey unsupported personal controls. They can be linked under “Method and broader evidence.”

## Questions omitted from the primary ten

- **Downhill opening:** overlaps ranks 2 and 7, and the supplied-route proxy cannot establish that descent caused late slowing. Its supported descriptive result remains in the twelve-question archive after an explicit course selection.
- **Returning to the same course:** implemented and useful, but lower immediate decision value than the selected ten and restricted to linked repeats. It remains in the twelve-question archive. It is not selected by target, and its paired change cannot isolate familiarity.

The wider 35-question catalog, its 33 calculated packs, sustained-slowdown figures and compatibility URLs remain a research archive. The shared engine retains all 12 calculation paths; `summary.analyses` and metadata `analysis_count` intentionally remain 12. The full earlier guide remains at `/research/personalized`. `/your-race` forwards mapped hashes and profile parameters to the primary pages; downhill and return hashes open that archive. The ten-page selection does not remove those outputs. The expanded target support was recalculated from the same September 7 input with updated calculation provenance; the input release pin, cohort thresholds and source definitions remain unchanged.
