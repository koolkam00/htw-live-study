# Website architecture

Takeover evidence and current branch changes are distinguished in [PROJECT_HANDOFF.md](PROJECT_HANDOFF.md).

## Runtime and routes

[package.json](../package.json) pins Next.js 14.2.5, React 18.3.1, Recharts 2.12.7 and TypeScript 5.5.4. [next.config.mjs](../next.config.mjs) sets static export, unoptimized images and optional NEXT_PUBLIC_BASE_PATH/assetPrefix. The documented public host is [Marathon Pacing Study](https://htw-live-study.vercel.app).

| Route | Source / renderer | Purpose |
| --- | --- | --- |
| / | app/page.tsx; components/QuestionsHome.tsx | Themed research questions |
| /packs | app/packs/page.tsx | Pack browsing |
| /packs/[packId] | app/packs/[packId]/page.tsx; ResearchQuestion / PackClientPage | Question or legacy pack content |
| /slowdown | app/slowdown/page.tsx; sustained-slowdown dashboard | Sustained-slowdown measure and six figures |
| /htw and /packs/smyth_htw | Legacy route files | Compatibility URLs retained for existing links |
| /courses and /courses/[city] | app/courses; lib/course-data.ts | Course-specific public summaries |
| /your-race | app/your-race/page.tsx; components/PersonalizedGuide.tsx | Twelve personalized questions |
| /methodology | app/methodology/page.tsx | Definitions, cohorts and limitations |

## Full-data access and three chart-data paths

Current policy exposes source code, full runner exports, database snapshots and overlays to anonymous readers in ordinary unencrypted formats. Link to public Release assets for large files; rendering aggregate charts is a performance and analytical choice, not an access boundary. There is no requirement to keep runner data outside this checkout. See [dated access verification](PROJECT_HANDOFF.md#public-access-policy-and-verification).

1. **Core:** public/data/live.json and original S/R/RN/P pack folders. lib/research-data.ts reads JSON/CSV and maps them to explanatory answers; hooks/useLiveData.ts and usePackMeta.ts support client legacy views. lib/packs.ts default statuses are fallback registry values, not proof of valid current calculations.
2. **Extensions:** lib/extension-data.ts discovers ext_* directories at build time, requires ready schema-valid metadata, reads summaries and CSVs, and maps question_id to lib/question-catalog.ts. Newer input_as_of wins, with calculation date as tie-breaker. Invalid ready data fails the build. This is not a request-time connection to the ingestion database.
3. **Personalized:** lib/personalized-data.ts loads the summary/method; PersonalizedGuide and lib/personalized.ts use per-city aggregate shards. public/data/packs/ext_personalized_guide contains pack_meta.json, summary.json, tables/city_XX.json and tables/checkpoint_XX.json. The summary maps city names to filenames; never assume numeric shard positions stay stable. Checkpoint shards load when requested.

Course pages use `lib/course-data.ts`: names come from `live.json` table `t1` and the course-profile extension, and charts come from `ext_course_pacing_profiles`. Files under `public/data/c4` exist but are not read by this route's loader. Core and extensions can have different source vintages; display and compare them explicitly.

## Personalized semantics to preserve

- Three focuses: prepare, choose, review. They reorder/select emphasis among the same twelve questions.
- Thresholds are whole minutes 150–270; presets are every 15 minutes. Strict finish < target is evaluated exactly, not interpolated.
- Achieved-time profiles use a 15-minute bucket centered on the nearest preset; these are not declared goals.
- Ages: 18–24, then five-year bands through 85–89. Unknown exact age contributes to All only.
- Previous time selects a 15-minute band of best recorded performances in the two earlier calendar years, not an exact last-race filter.
- Fallback broadening should be explicit. Never replace the selected course silently. Comparison questions intentionally vary the comparison dimension.
- Checkpoints at 20/30/35 km use two-minute elapsed bands and optional recent pace trend; the previous-time filter does not apply. Historical complete-finisher outcomes are not calibrated individual probabilities.
- Standard public estimates require 100 observations. Edition/group comparisons and forecast cohorts have additional rules documented in each pack.

## Data to rendering to deployment

The chart calculations produce aggregate artifacts; the current data-access policy also covers full source records. Importers validate and write the designated public folders. Build reads those files and generates static output. A repository merge is documented to lead to Vercel publication; exact hosting project settings and credentials were not inspected. During takeover, all 401 checked-in public aggregate files matched the production responses byte for byte, including September 7 extension metadata. This dated evidence predates the September 11 presentation update; it does not establish the deployment state of later changes.

For a new analysis, update its calculation, registry/question mapping, metadata/method, public aggregate output and verification together. Preserve stable IDs and aliases. For UI changes, test mobile widths and null/sparse cohorts; a successful build alone does not resolve the historical mobile audit.

The September 11 presentation update introduced Marathon Pacing Study terminology and the `/slowdown` route while retaining legacy URLs and internal data keys. The numerical definition stays at least 25% slower for at least 5 km after 20 km relative to the 5–20 km baseline, with a neutral [Published slowdown method (2021)](https://doi.org/10.1371/journal.pone.0251513) citation. Presentation edits do not refresh the source vintage, change numeric aggregates or imply a deployment. Original numerical-run hashes and subsequent presentation revisions are recorded separately where metadata text changes.
