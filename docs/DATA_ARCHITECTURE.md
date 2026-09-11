# Data architecture

Evidence date: 2026-09-11. Read [project status](PROJECT_HANDOFF.md) before treating any historical count as current.

## Storage and transfer boundaries

| Layer | Location | Meaning |
| --- | --- | --- |
| Live database | `/workspace/race-data-platform/data/platform.sqlite` on ingestion machine | Producer's documented active database; not this checkout |
| Consistent export snapshot | September 7 manifest: `/workspace/race-data-platform/data/export/_snapshot_platform.sqlite` | Snapshot used for raw export |
| Historical feature source | `/workspace/wall-analyst/output-api-dump-2026-09-07/features.parquet` | Separate Analyst output used in September 7 FULL |
| Online durable backups/exports | [Private GitHub Releases](https://github.com/koolkam00/htw-live-study/releases) | Downloadable SQLite gzip backups and CORE/FULL tar.gz exports |
| Reproducible analysis input | [release.json](../analysis/release.json) | Pinned export; currently September 7 |
| Website data | [public/data](../public/data) | Public aggregate JSON/CSV; no direct live SQLite queries |

Do not confuse database backup tags `htw-db-*`, export tags `private-export-*`, and pack bundle IDs `private-*`. A backup does not trigger a successful site refresh. The September 10 backup reports approximately 3,543,512 records; a later September 10 export reports 3,580,279. They are distinct snapshots.

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

FULL includes normalized names; runner_id/match_key/ambiguity/repeater flags; race sequence; section/cumulative times and paces; checkpoint ranks; HTW severity/onset/cost; PB and ability; pace changes; target outcomes; and next-race fields. These are derived columns, not all independent observations or pre-race covariates.

For September 7, all 3,382,000 feature race_date values are null; all split_mode_in values report cumulative. Supplied runner_id covers 2,826,696 rows and 2,242,270 distinct IDs; 372,916 IDs repeat. These IDs are not independently verified people. 18,310 rows are marked ambiguous.

Supplied PB/ability can include current-race information. The current extension pipeline recomputes recent bests from the two strictly earlier calendar years; best-improvement analysis uses all strictly earlier years. Same-year races are not used for these benchmarks. Date intervals use a separate unambiguous date cohort. Actual halfway measurements, chip/gun offsets, waves and corrals are absent from this vintage.

### Join contract by vintage

- **September 7 audited:** CORE id and FULL record_id are incompatible. Raw rows exceed feature rows by 69,055. Numeric joining produced 3,106,398 apparent matches, just five with agreeing runner names. Existing [prepare_history](../analysis/build_extended.py) matches edition, normalized name and all split/finish durations, requires one-to-one matches, and screens supplied identities for ambiguity, gender/birth-year conflicts and duplicate editions.
- **September 10 release claim:** raw/features are 1:1 and features.record_id equals race_records.id. Verify uniqueness, referential integrity, row identity and units on the downloaded new export before adopting a version-specific join. This claim does not repair the old files retroactively.
- Existing weather analysis aggregates only unambiguous city/year dates. A stable race-edition key is recommended for future exports; it is not an implemented key in the old schema.
- Existing terrain joins use supplied unique city/section profiles. Both valid_from_year and valid_to_year columns exist but contain zero non-null values in September 7. “Validity absent” in older prose means values are missing, not columns.

### Overlays

Weather contains race date, local start/timezone, coordinates, temperature/apparent temperature/dewpoint, humidity, wind/direction, precipitation, pressure, cloud, hourly_json and provenance. September 7 values are modeled Open-Meteo archive weather near scheduled start, not each runner's exposure; hourly_json being non-null does not prove complete hourly coverage.

Profiles contain course_key, geometry points, distance, gain/loss/min/max, start/finish coordinates, notes and sources. Segments contain from/to distances, elevation summaries, gain/loss/net, grades and point counts. Most supplied routes refer to 2024–2026; historical matching is unverified. DEM smoothing, tunnels and bridge decks can distort elevation interpretation.

## Denominators: do not conflate

September 7 foundation filtering yields 2,739,842 eligible finishes from 3,451,055 raw rows: 489,593 missing/unparsed, 217,245 non-increasing, 4,375 outside bounds, zero exact duplicates removed. FULL valid_splits reports 2,646,005, a different cohort. Linked eligible finishes are 2,366,740; recent benchmark finishes 373,955; consecutive qualifying cross-year pairs 383,860. These are results/pairs, not unique people. Source: [pack metadata](../public/data/packs/ext_pacing_shapes/pack_meta.json) and [access audit](../analysis/ACCESS.md).

September 10 notes report valid_splits 2,807,231. Do not substitute it for the extension pipeline's eligible count without recalculation.
