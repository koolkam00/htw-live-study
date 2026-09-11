# Data architecture

Evidence date: 2026-09-11. Read [project status](PROJECT_HANDOFF.md) before treating any historical count as current.

## Storage and transfer boundaries

| Layer | Location | Meaning |
| --- | --- | --- |
| Live database | `/workspace/race-data-platform/data/platform.sqlite` on ingestion machine | Producer's documented active database; not this checkout |
| Consistent export snapshot | September 7 manifest: `/workspace/race-data-platform/data/export/_snapshot_platform.sqlite` | Snapshot used for raw export |
| Historical feature source | `/workspace/wall-analyst/output-api-dump-2026-09-07/features.parquet` | Separate Analyst output used in September 7 FULL |
| Online durable backups/exports | [Private GitHub Releases](https://github.com/koolkam00/htw-live-study/releases) | Private full-record SQLite gzip backups and CORE/FULL tar.gz exports; compression is not encryption |
| Reproducible analysis input | [release.json](../analysis/release.json) | Pinned export; currently September 7 |
| Website data | [public/data](../public/data) | Public aggregate JSON/CSV; no direct live SQLite queries |

Do not confuse database backup tags `htw-db-*`, export tags `private-export-*`, and pack bundle IDs `private-*`. A backup does not trigger a successful site refresh. The September 10 backup reports approximately 3,543,512 records; the later September 10 export was audited at 3,580,279. They are distinct snapshots. Full records remain in private Releases, never public website assets.

## September 10 verified export

Both `private-export-20260910-1412` archives were size/SHA-256 verified outside the checkout during the September 11 takeover. Shared CORE members have matching hashes in FULL. [Archive evidence](evidence/2026-09-11/archive-members-audit.json) records each member and digest.

| Table | Rows | Current contract |
| --- | ---: | --- |
| race_records.parquet | 3,580,279 | Raw records; unique, non-null canonical `id` |
| features.parquet | 3,580,279 | 138 columns; matching unique, non-null `record_id`; different row order |
| race_conditions.parquet | 207 | All 207 supplied dates populated |
| course_profiles.parquet | 32 | Historical validity columns still entirely null |
| course_segments.parquet | 288 | Supplied course sections |
| sources.parquet | 378 | `last_ingested` populated for 148 rows |

The ID sets match exactly. City, year and age match on the canonical ID. Feature sex differs only for 552 raw `X` values normalized to null. Comparable cumulative and finish timings agree within 1 ms after conversion from feature minutes to raw seconds; all 2,807,231 feature-valid records have all nine matching checkpoints. This checks export row alignment, not the truth of cross-race runner identities. See [ID audit](evidence/2026-09-11/id-contract-audit.json), [timing audit](evidence/2026-09-11/timing-unit-contract-audit.json) and [normalization audit](evidence/2026-09-11/sex-normalization-audit.json).

The new feature schema lacks `race`, `runner_name` and `split_mode_in`; all feature `race_date` values remain null. The current history builder still requires the September 7 name/edition fields. Archive extraction also fails the current allowlist: CORE adds `ID-CONTRACT.md` and `SHA256SUMS.txt`; FULL adds those plus `FEATURE-FIELD-NOTES.md` and `COUNT-DIFF.md`. Resolve these verified compatibility failures through a producer-compatible export or reviewed version-specific consumer adapter before calculating or adopting a new vintage. The pin and deployed numerical analyses remain September 7.

## September 7 inspected tables

| Table | Rows | Columns | Grain and content |
| --- | ---: | ---: | --- |
| race_records.parquet | 3,451,055 | 20 | Source race-result rows: edition, demographics and elapsed checkpoint strings |
| features.parquet (FULL only) | 3,382,000 | 142 | Analyst-derived result features and supplied runner linkage |
| race_conditions.parquet | 185 | 25 | Race weather/date overlay keyed by city/year in existing analysis |
| course_profiles.parquet | 32 | 21 | Supplied course geometry, elevation, provenance and validity fields |
| course_segments.parquet | 288 | 20 | Nine sections per supplied profile |
| sources.parquet | 376 | 14 | Source registry and ingestion watermarks |

Both bundles also contain races_summary.json, MANIFEST.json and README.md. FULL includes CORE plus features. [ACCESS.md](../analysis/ACCESS.md) records the table scan; detailed column counts were read from the historical inspection artifact.

### Raw columns and units

The 20 raw fields are `id, race, year, city, runner, sex, age, age_group, split_5km, split_10km, split_15km, split_20km, split_25km, split_30km, split_35km, split_40km, split_42_2km, source_url, ingested_at, age_or_group`.

Raw splits are elapsed H:MM:SS or M:SS strings, reparsed into seconds by [build_pacing.py](../analysis/build_pacing.py). Distances are 5, 10, 15, 20, 25, 30, 35, 40, **42.195** km; the final section is **2.195** km. In the old FULL export segment/finish/cumulative durations are minutes and paces are minutes/km. Never interchange these units without conversion.

September 7 raw exact age is populated in 1,068,374 rows (~31%); age-group labels are a separate field. Non-null does not establish validity. The 20 km string is null in 404,815 rows. Source URLs and ingestion timestamps are populated throughout, but registry last_ingested is populated for only 124 of 376 sources. Registry presence alone does not prove full ingestion.

### Feature families and limitations

September 7 FULL includes normalized names; runner_id/match_key/ambiguity/repeater flags; race sequence; section/cumulative times and paces; checkpoint ranks; sustained-slowdown severity/onset/cost; PB and ability; pace changes; target outcomes; and next-race fields. These are derived columns, not all independent observations or pre-race covariates. Do not assume every field exists in a later export.

For September 7, all 3,382,000 feature race_date values are null; all split_mode_in values report cumulative. Supplied runner_id covers 2,826,696 rows and 2,242,270 distinct IDs; 372,916 IDs repeat. These IDs are not independently verified people. 18,310 rows are marked ambiguous.

Supplied PB/ability can include current-race information. The current extension pipeline recomputes recent bests from the two strictly earlier calendar years; best-improvement analysis uses all strictly earlier years. Same-year races are not used for these benchmarks. Date intervals use a separate unambiguous date cohort. Actual halfway measurements, chip/gun offsets, waves and corrals are absent from this vintage.

### Join contract by vintage

- **September 7 audited:** CORE id and FULL record_id are incompatible. Raw rows exceed feature rows by 69,055. Numeric joining produced 3,106,398 apparent matches, just five with agreeing runner names. Existing [prepare_history](../analysis/build_extended.py) matches edition, normalized name and all split/finish durations, requires one-to-one matches, and screens supplied identities for ambiguity, gender/birth-year conflicts and duplicate editions.
- **September 10 audited:** raw/features have matching unique ID sets and matching city/year/age and comparable timings. Join `features.record_id` to `race_records.id`, never row position, only under this verified release-specific contract. The current code has not yet adopted this join, and the fix does not repair old files retroactively. Missing feature name/edition fields still require a producer-compatible export or reviewed version-specific consumer adapter.
- Existing weather analysis aggregates only unambiguous city/year dates. A stable race-edition key is recommended for future exports; it is not an implemented key in the old schema.
- Existing terrain joins use supplied unique city/section profiles. Both valid_from_year and valid_to_year columns exist but contain zero non-null values in September 7. “Validity absent” in older prose means values are missing, not columns.

### Overlays

Weather contains race date, local start/timezone, coordinates, temperature/apparent temperature/dewpoint, humidity, wind/direction, precipitation, pressure, cloud, hourly_json and provenance. September 7 values are modeled Open-Meteo archive weather near scheduled start, not each runner's exposure; hourly_json being non-null does not prove complete hourly coverage.

Profiles contain course_key, geometry points, distance, gain/loss/min/max, start/finish coordinates, notes and sources. Segments contain from/to distances, elevation summaries, gain/loss/net, grades and point counts. Most supplied routes refer to 2024–2026; historical matching is unverified. DEM smoothing, tunnels and bridge decks can distort elevation interpretation.

## Denominators: do not conflate

September 7 foundation filtering yields 2,739,842 eligible finishes from 3,451,055 raw rows: 489,593 missing/unparsed, 217,245 non-increasing, 4,375 outside bounds, zero exact duplicates removed. FULL valid_splits reports 2,646,005, a different cohort. Linked eligible finishes are 2,366,740; recent benchmark finishes 373,955; consecutive qualifying cross-year pairs 383,860. These are results/pairs, not unique people. Source: [pack metadata](../public/data/packs/ext_pacing_shapes/pack_meta.json) and [access audit](../analysis/ACCESS.md).

September 10's feature `valid_splits` count was audited at 2,807,231. Do not substitute it for the extension pipeline's eligible count without recalculation. Supplied runner IDs cover 2,994,501 rows and 2,366,070 distinct identifiers; 396,353 identifiers repeat and 18,561 rows are marked ambiguous. These are supplied identities, not independently verified people.
