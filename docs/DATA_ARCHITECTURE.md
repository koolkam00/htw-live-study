# Data architecture

Current full-refresh source: **`private-export-20260911-1107`**, created `2026-09-11T15:10:45Z`. The [refresh record](REFRESH_20260911_1107.md) distinguishes verified inputs, calculations, imported files and production. Older inspections below are historical evidence.

## Storage and transfer

| Layer | Location | Meaning |
| --- | --- | --- |
| Live database | Producer's documented `/workspace/race-data-platform/data/platform.sqlite` | Active ingestion environment; not a service operated by this checkout |
| Consistent snapshot | Immutable SQLite backup in GitHub Releases | Auditable copy of a specific live-database state, not the active database |
| CORE export | Eight named files in the release archive | Raw results, overlays, registry, summary, manifest and README |
| FULL export | The same eight files plus `features.parquet` | Synchronized raw and derived records, including candidate runner linkage |
| Main analysis input | [release.json](../analysis/release.json) | Common source pin for broad packs, personalized engine, supporting study and runner lookup |
| Weather input | [weather-release.json](../analysis/weather-release.json) | Separate explicit pin for the three-candidate weather screen |
| Supporting study | `public/data/study/evidence.json` | Current-source sustained-slowdown, severity and milestone calculations |
| Runner lookup | `public/data/runners/manifest.json` and compressed shards | Public recorded names and race records, with candidate linkage and quality reasons |
| Website data | [public/data](../public/data) | Static JSON/CSV consumed during build or fetched by charts; no live SQLite queries |

Backups (`htw-db-*`), exports (`private-export-*`) and pack bundle IDs (`private-*`) are different identifiers. Their legacy names do not determine access. The current policy makes source code, full records, overlays and snapshots publicly downloadable as ordinary unencrypted files; gzip is compression. Prefer Release assets for large files. [ACCESS.md](../analysis/ACCESS.md) gives exact downloads and checksums. Operational credentials are not research data.

## Verified 1107 input

The current CORE/FULL archives have exactly eight/nine members and byte-identical shared files. The raw and feature tables each contain **4,207,456 rows**, spanning **34 cities and 240 city/year editions**. There are 235 weather rows and 32 supplied course profiles. Relative to `private-export-20260911-0336`, the raw snapshot adds 228,796 records with zero deletions and zero modifications to existing records.

Raw `id` and feature `record_id` are unique, non-null and have identical sets. Joined edition labels, names and ages agree exactly; 552 raw `X` values normalize to null feature sex. Comparable finish and cumulative timings agree within 1 ms after converting feature minutes to raw seconds. The audit establishes record alignment, not the validity of cross-race identities. [audit_release.py](../analysis/audit_release.py) reproduces these checks and can compare the prior snapshot.

The SQLite backup passed checksum and read-only integrity checks; its 4,207,456 raw rows and latest ingestion timestamp `2026-09-11T15:04:44Z` agree with the export. Snapshot integrity does not prove that each race field was fully ingested.

Two input-documentation defects remain: the manifest reports its own byte size incorrectly, and it contains obsolete private-data instructions. Record these immutable-source defects in the refresh audit; do not rewrite the downloaded evidence.

## Measurement and eligibility

Raw checkpoints are elapsed H:MM:SS or M:SS strings parsed into seconds. The nine distances are 5, 10, 15, 20, 25, 30, 35, 40 and **42.195 km**. The last field is historically named `split_42_2km`; the final section is 2.195 km. Feature elapsed/section times are minutes and paces are minutes/km. Website miles and minutes-per-mile are display conversions; no individual-mile timing mats are invented.

The shared parser requires all nine increasing checkpoints, a finish from 90 minutes through 12 hours and each section from 2 through 20 min/km. It does not interpolate missing splits or actual halfway readings. Equivalent records are deduplicated without using database IDs, ingestion timestamps or URLs as distinguishing fields.

The [reviewed source policy](../analysis/source_quality.py) then excludes ten explicitly audited editions for invalid grids, incomplete ingestion, unresolved HOLD status or a selected top-finisher field. It applies only to the named release and removes timing-valid records after other checks to avoid double counting. These editions cannot become earlier benchmarks. Do not infer that every small edition is incomplete.

| 1107 population or exclusion | Records |
| --- | ---: |
| Raw results | 4,207,456 |
| Missing or unparsed checkpoints | 616,424 |
| Non-increasing checkpoints | 217,295 |
| Outside timing/pace bounds | 4,677 |
| Exact duplicates removed | 0 |
| Timing-eligible before reviewed exclusions | 3,369,060 |
| Timing-valid records in reviewed excluded editions | 40,901 |
| Final eligible finishes | 3,328,159 |
| Feature `valid_splits` | 3,326,908 |
| Eligible linked finishes | 3,008,457 |
| Recent earlier-year benchmarks | 524,323 |
| Consecutive cross-year pairs | 546,847 |
| Linked finishes with supplied date | 3,006,219 |

The feature and analysis populations differ by design. Missing recorded gender does not invalidate usable timing: 36,151 final eligible finishes with other/unrecorded gender remain in All. Men and Women contain 2,205,097 and 1,086,911 respectively. The eligible exact-age count is read from the personalized summary; raw age is null in 2,758,408 records. Never treat an age-group label as an exact age.

## Identity and chronology

The audited 1107 canonical record join checks unique matching IDs and labels at runtime, then agrees on finish and all nine section durations rounded to milliseconds. Legacy September 7 reproduction retains a one-to-one edition/name/full-timing match because its numeric ID namespaces are incompatible. Never join by row position or apply a newer release contract retroactively.

Candidate cross-race identities must be non-ambiguous, have consistent recorded gender, inferred birth-year span at most two years and no duplicate edition. These checks reduce false links without independently proving identity. Recent best uses only the two strictly earlier calendar years; best-improvement uses all strictly earlier years. Supplied PB, ability and next-race fields cannot be treated as pre-race measurements.

All feature race dates remain null; nine feature names are null. Dated history uses unique supplied edition dates, with complete date coverage for the relevant identity group. The date-based spacing analysis can use ordered same-year observations; the year-based benchmark analyses cannot. Missing later races do not prove that a runner stopped racing.

## Weather and terrain overlays

Weather records contain local scheduled start, observed hour, timezone, modeled temperature/apparent temperature/dew point, humidity, wind/direction, precipitation, pressure, cloud, hourly arrays and source provenance. The separate weather screen checks observed hour within 30 minutes of scheduled start and an exact four-hour endpoint. It rejects inconsistent or ambiguous rows rather than silently repairing them. It compares equally weighted edition medians; many finishes in one edition are still one weather observation. [WEATHER_ANALYSES.md](WEATHER_ANALYSES.md) records the frozen model, uncertainty, support checks and all three results.

Scheduled-start archive weather is a proxy for personal exposure. It does not establish each runner's actual wave start, heat load, headwind or gust exposure. Source URLs establish supplied units; they do not establish a single named reanalysis model across all editions.

Course profiles and segments contain supplied geometry, distance, elevation gain/loss/net, coordinates and provenance. All 32 profiles still have null historical validity years. A current supplied route is not a verified historical route, and net elevation can hide mixed climbs and descents. Course and terrain findings remain descriptive proxies.

## Supporting study and name-search contract

`build_public_explorer.py` reads the frozen FULL export and invokes the shared timing parser, source-quality policy and screened history join. Its study output records the common eligible cohort, release tag, input/archive digests, calculation time and script hashes. Sustained episodes require contiguous measured sections at least 25% slower than the 5–20 km baseline, totaling at least 5 km after 20 km. Sensitivity changes the threshold/duration against the same denominator. Severity is average positive slowing over 20–42.195 km weighted by distance; it is a separate measure. Recorded-best history is retrospective and can reflect selection and uneven follow-up.

`build_runner_lookup.py` retains all raw records in profile shards. Source candidate identities pass the same conflict checks; unmatched/ambiguous records become singleton candidates rather than name-based merges. Names are normalized for search with Unicode NFKD, combining-mark removal, lowercase and alphanumeric tokenization. Search and profile shards use deterministic hash partitions and gzip compression. The manifest includes raw/eligible/named/unnamed counts, edition references, timing distances and each shard's SHA-256 and byte size. Shard hashes verify delivery; they are not encryption or identity proof.

Name search can find a record whose incomplete timings prevent analysis. Original timing strings are retained for excluded records, and the UI must explain the reason rather than fabricate a complete race. A public race record and an analytical cohort member are different states. Release pins, supporting study and runner manifest must agree before publication.

## Historical inspections

September 7 supplied 3,451,055 raw rows, 3,382,000 feature rows and incompatible raw/feature ID namespaces; its original extension cohort had 2,739,842 eligible finishes. September 10 supplied 3,580,279 aligned raw/feature records, but its extra archive members and missing consumer fields blocked that vintage's adoption at the initial takeover. Those are dated compatibility findings, not current 1107 blockers. See the [historical archive audit](evidence/2026-09-11/archive-members-audit.json), [ID audit](evidence/2026-09-11/id-contract-audit.json) and [timing audit](evidence/2026-09-11/timing-unit-contract-audit.json).

The old `live.json` charts and S/R/RN/P calculations are retained in Git history. The deployed `live.json` becomes current-release compatibility metadata only, with no old charts. They are no longer website data sources in the current implementation. Current supporting calculations are recomputed by `build_public_explorer.py`; matching route aliases use existing 1107 extensions, and unsupported forecast/course-adjustment outputs remain unavailable. This changes the active calculation path without claiming the old undocumented formulas were reproduced.
