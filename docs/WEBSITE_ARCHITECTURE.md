# Website architecture

Current implementation extends `/runners` with peer comparisons and environmental context on `codex/runner-context-and-peers`, using the same 1107 source as the existing site. The new local calculation is complete; publication remains separately verified. See [PROJECT_HANDOFF.md](PROJECT_HANDOFF.md) and [runner-context contracts/status](RUNNER_CONTEXT_AND_PEERS.md).

## Runtime and routes

The primary ten are accompanied by any weather candidates that pass the fixed screen in `public/data/weather/evidence.json`. `weather-data.ts` exposes only ready candidates; `WeatherIndex` adds their links to the homepage and directory, and the temperature page links them as well. `WeatherAnalysis` renders an adjusted percentage-point estimate and uncertainty plus a browser for unadjusted edition observations. Browsing does not refit the overall estimate. The full refresh uses `private-export-20260911-1107` for both inputs; the [refresh record](REFRESH_20260911_1107.md) separately records import and deployment. Read [weather methods and decisions](WEATHER_ANALYSES.md) for the current ready/withheld results.

[package.json](../package.json) pins Next.js 14.2.5, React 18.3.1, Recharts 2.12.7 and TypeScript 5.5.4. [next.config.mjs](../next.config.mjs) sets static export, unoptimized images and optional NEXT_PUBLIC_BASE_PATH/assetPrefix. The documented public host is [Marathon Pacing Study](https://htw-live-study.vercel.app).

| Route | Source / renderer | Purpose |
| --- | --- | --- |
| / | app/page.tsx; PacingPreview / AnalysisIndex | Study introduction and the ranked ten analyses |
| /analyses | app/analyses/page.tsx; AnalysisIndex | Primary ten-question directory |
| /analyses/[slug] | app/analyses/[slug]/page.tsx; AnalysisExplorer / AnalysisChart | One primary question, supported controls, observed results and methods |
| /about | app/about/page.tsx | Study purpose and interpretation |
| /packs and /packs/[packId] | app/packs; ResearchQuestion / PackClientPage | Broader current-source research and compatibility aliases |
| /slowdown | app/slowdown/page.tsx; sustained-slowdown dashboard | Current-source slowdown prevalence, onset, sensitivity, age and recorded-history figures |
| /htw and /packs/smyth_htw | Legacy route files | Compatibility URLs retained for existing links |
| /courses and /courses/[city] | app/courses; lib/course-data.ts | Course-specific supporting summaries |
| /your-race | Legacy personalized entry | Client compatibility redirect preserving mapped question hashes and profile query parameters |
| /research/personalized | Archived PersonalizedGuide | All twelve backing questions in the earlier guide layout |
| /runners | app/runners/page.tsx; RunnerSearch / RunnerContext | Search names, confirm races, compare recorded performances and same-edition peers, inspect weather/current-route context |
| /methodology | app/methodology/page.tsx | Definitions, cohorts and limitations |

[lib/ten-analyses.ts](../lib/ten-analyses.ts) is the primary ordering and route registry: pacing pattern, opening pace, checkpoint, section differences, courses, weather, terrain, target context, improvement and age. The [ten-analysis guide](TOP_TEN_ANALYSES.md) maps these pages to data and limitations. The 35-question catalog in `lib/question-catalog.ts` and 33 broad extension packs remain a research archive; the personalized catalog retains 12 backing calculation paths. These are overlapping views, not independent datasets. `/your-race#guide-{id}` maps the primary ten to their new analysis pages; `#guide-downhill` and `#guide-return` open the retained twelve-question guide at `/research/personalized`. The `/packs` archive links to the ten and keeps the twelve-question list collapsed.

## Full-data access and current data paths

Current policy exposes source code, full runner exports, database snapshots and overlays to anonymous readers in ordinary unencrypted formats. Link to public Release assets for large files; rendering aggregate charts is a performance and analytical choice, not an access boundary. There is no requirement to keep runner data outside this checkout. See [dated access verification](PROJECT_HANDOFF.md#public-access-and-operations).

1. **Supporting study:** `public/data/study/evidence.json`, built by `analysis/build_public_explorer.py`, provides current-source slowdown, severity and milestone results. `lib/research-data.ts` and `lib/study-figures.ts` validate the pinned release and render its documented measures. Old `live.json` charts and S/R/RN/P numerical files are not active inputs; `live.json` becomes small current-release compatibility metadata without figures. Compatibility aliases use current extensions or an explicit unavailable state; registry fallback statuses are not evidence of a current calculation.
2. **Extensions:** lib/extension-data.ts discovers ext_* directories at build time, requires ready schema-valid metadata, reads summaries and CSVs, and maps question_id to lib/question-catalog.ts. Newer input_as_of wins, with calculation date as tie-breaker. Invalid ready data fails the build. This is not a request-time connection to the ingestion database.
3. **Personalized:** `lib/personalized-data.ts` loads the summary/method. `lib/analysis-server.ts` builds the initial All courses / 4:00 answer from the matching city shard during static export. `AnalysisExplorer` and `lib/personalized.ts` select among the fixed aggregates; `lib/analysis-aggregates.ts` loads the needed JSON through the client cache. `public/data/packs/ext_personalized_guide` contains `pack_meta.json`, `summary.json`, `tables/city_XX.json` and `tables/checkpoint_XX.json`. The summary maps city names to filenames; never assume numeric shard positions stay stable. Course comparison uses the summary; checkpoint shards load when requested.

4. **Weather screen:** `lib/weather-data.ts` loads `public/data/weather/evidence.json`; the weather catalog maps ready candidate IDs to static routes. The file contains all three results, edition values, fixed screening rules and provenance. `analysis/weather-release.json` is a separate source pin; both the page reader and verifier require it to match the main study pin and weather JSON; shared eligibility and provenance must also agree.

5. **Public runner lookup:** `analysis/build_runner_lookup.py` writes `public/data/runners/manifest.json` plus compressed name-index and profile shards. `/runners` loads the manifest and relevant shards, verifies their digests and release tag, then lets visitors select their recorded races. Candidate linkage is not independent identity verification; same-name records are never silently merged. The manifest covers all raw records, including those excluded from aggregate analysis, and reports unnamed records explicitly.

6. **Runner context:** `analysis/build_runner_context.py` writes `public/data/runner-context/manifest.json` and 240 compressed edition shards. `lib/runner-context.ts` loads the selected editions, validates source/edition identity and compressed transport, and computes exact finish placement plus achieved-time pacing comparisons. `RunnerContext` exposes pacing, similar-runner and conditions views. The context manifest is bound to the exact runner-manifest hash/timestamp, not merely its release tag. The independent publication verifier checks that binding and recounts all peer finish distributions from the runner shards. Loading has three concurrent requests and a three-edition cache; the full context dataset is not needed to open the page.

Course pages use `lib/course-data.ts` and only `ext_course_pacing_profiles` for both names and plots. Sparse or excluded courses do not fall back to old `live.json` rows. The supporting study, broad questions, personalized engine, weather, search and runner context must all match the common release pin before publication.

## Primary explorer and personalized semantics

`lib/analysis-profile.ts` defines the example as All courses, 4:00, all ages, all recorded genders and no previous time. Profile selections travel between the ten pages in URL parameters; browser history restores them. The explorer labels the example and subsequent selections, validates submitted times, and provides visible loading, retry and unavailable-result states. There is no arbitrary city substitution for a sparse cohort. All courses has no terrain profile: the terrain page asks for a course explicitly.

- Ranking is fixed. Profile changes update comparisons and availability without reordering the ten.
- Read the personalized summary and metadata for source and calculation timestamps. `lib/data-source.ts` formats the exact export tag with its UTC source date, so the two September 11 exports cannot be confused. About and the weather index derive counts/readiness from the imported output.
- Timing checks and reviewed release-specific source exclusions are described in accessible method text. Missing age or gender alone does not remove usable timing from All. A page denominator belongs to its actual cohort, not the full raw corpus.
- Thresholds are every whole minute from 90 through 720 (1:30–12:00). Strict finish < target is evaluated exactly, not interpolated. The engine has 43 presets at 15-minute intervals; achieved-time profiles use a 15-minute bucket centered on the nearest preset and describe achieved finishes, not declared goals.
- Accepted targets do not imply that all corresponding chart cells exist. Profile, nearby-finish, age, prior-performance and checkpoint comparisons retain their sample requirements; sparse and extreme selections can remain unavailable. The pack’s `analyses: 12` counts retained engine paths, not primary pages.
- Visible controls match each question. Course comparison varies courses and hides course/time filters. Weather hides time. Age comparison varies age and hides the age filter. Checkpoint comparison hides previous time. Other relevant profile refinements remain available.
- Ages: 18–24, then five-year bands through 85–89. Unknown exact age contributes to All only.
- Previous time selects a 15-minute band of best recorded performances in the two earlier calendar years, not an exact last-race filter. Broader age/gender/prior comparisons are explicitly labeled.
- Checkpoints at 20/30/35 km use two-minute elapsed bands and optional recent pace trend. Historical complete-finisher outcomes are not calibrated individual probabilities.
- Weather and terrain are supported data views, not universal filters. The weather chart compares published start-hour temperature bands. Terrain switches between supplied elevation and pacing charts; demographic/time refinements change the pace cohort, not the elevation measurements.
- Standard chart estimates require 100 observations. Edition/group comparisons and forecast cohorts have additional rules documented in each pack. These reliability rules do not restrict full-data access.

## Display units

The homepage, About page and ten primary analyses default to miles and minutes per mile. The Miles / Kilometres switch updates these pages together, including distance labels, pace values and axes, exact-value tables, checkpoint controls, and explanatory prose. Miles mode also displays elevation in feet; finish durations, percentages, cohort membership and sample sizes do not change. Weather retains its published temperature bands.

The URL parameter `units=mi|km` makes a shared comparison explicit. A valid URL selection takes precedence over the saved browser preference; absent either, the default is miles. The browser remembers changes, and navigation among analysis pages retains the selection. Unit changes are presentation state, not a reason to download or recalculate new cohorts.

The new weather pages also display °F differences and mph in miles mode, or °C differences and km/h in kilometres mode. Their percentage-point outcomes stay unchanged. Course browsing is stored as `course=` and survives unit changes/reloads. The original temperature analysis keeps its published °C bands.

All underlying distances and analytical definitions remain in kilometres. Use the exact conversion of 1 mile = 1.609344 km and 1 foot = 0.3048 m before rounding for display. For example, 5:00/km is approximately 8:03/mile. A source 5 km timing section displays as 3.11 miles, and the 20, 30 and 35 km checkpoint choices retain those exact underlying checkpoint keys. The site does not invent timing mats, halfway readings or individual-mile splits. Distinguish elapsed time for a recorded section from per-mile pace; converting units never changes the elapsed time.

The current supporting pages and runner view convert visible measurements together with their charts when the unit switch is offered. Source schemas and methods remain metric. Any retained metric-only guide must explicitly force matching metric prose and figures rather than mixing units. Technical source schemas, historical method quotations and release assets also keep original metric units. They describe the calculation contract and should not be rewritten as if the source measured mile splits. The historical display-only update left source pins and aggregate numbers unchanged; the separate 1107 data refresh recalculates those outputs. See the [September 11 display verification](evidence/2026-09-11/miles-display.md) for local checks and measured browser examples.

## Data to rendering to deployment

The chart calculations produce aggregate artifacts; the current data-access policy also covers full source records. Importers validate and write the designated public folders. Build reads those files and generates static output. A repository merge is documented to lead to Vercel publication; exact hosting project settings and credentials were not inspected. During takeover, all 401 checked-in public aggregate files matched the production responses byte for byte, including September 7 extension metadata. This dated evidence predates the September 11 presentation update; it does not establish the deployment state of later changes.

For a new analysis, update its calculation, registry/question mapping, metadata/method, public aggregate output and verification together. Preserve stable IDs and aliases. For UI changes, test mobile widths and null/sparse cohorts; a successful build alone does not resolve the historical mobile audit.

The earlier September 11 presentation update introduced Marathon Pacing Study terminology and the `/slowdown` route while retaining legacy URLs and internal data keys. The numerical definition stays at least 25% slower for at least 5 km after 20 km relative to the 5–20 km baseline, with a neutral [Published slowdown method (2021)](https://doi.org/10.1371/journal.pone.0251513) citation. Presentation edits do not refresh the source vintage, change numeric aggregates or imply a deployment. Original numerical-run hashes and subsequent presentation revisions are recorded separately where metadata text changes.

The subsequent ten-analysis redesign shipped in [PR #32](https://github.com/koolkam00/htw-live-study/pull/32), main commit `3e32bf8`, and was verified live. It changed primary navigation, page composition and profile controls, and recalculated the personalized pack to expand supported targets. In that redesign, calculation provenance changed while September 7 remained the input. The sustained-slowdown definition is unchanged. The display-only unit change did not recalculate aggregates. Later weather and full-data updates have their own publication evidence; consult the current refresh record rather than using the PR #32 deployment as proof of current source freshness.
