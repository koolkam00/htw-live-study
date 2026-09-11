# Marathon pacing analysis pipeline

The current full-refresh source is **`private-export-20260911-1107`**. Its verified input contains 4,207,456 raw and feature rows; the reviewed timing/source-quality cohort contains 3,328,159 eligible finishes. Calculation, import and publication are distinct statuses recorded in [the refresh report](../docs/REFRESH_20260911_1107.md). Use the exact tag and current source commit when reproducing results.

The pipeline calculates eight foundation and 25 extended packs, plus the 12-path personalized engine supplying the [essential ten](../docs/TOP_TEN_ANALYSES.md). A separate [weather screen](../docs/WEATHER_ANALYSES.md) evaluates humidity, four-hour warming and wind and publishes only supported candidates. The 33 broad packs form the research archive. Group running and congestion remain limited by missing physical-proximity/start-offset measurements.

## Inputs and ownership

[ACCESS.md](ACCESS.md) provides public CORE/FULL and backup downloads. Gzip compression is not encryption. Complete records, names and supplied features are available independently of aggregate charts. Credentials are not dataset contents.

`release.json` pins the main pipeline and `weather-release.json` pins the weather screen. Both select 1107 alongside their validated outputs. Pins select inputs; they do not certify analysis or deployment. Source files, calculations and output metadata retain metric units. Miles and per-mile paces are website display conversions.

These builders do not scrape races, operate the live ingestion database or regenerate `public/data/live.json` and original S/R/RN/P packs. Those files remain explicitly dated historical context. `--live-as-of` records their actual timestamp in new metadata; it never claims that they have been recalculated.

## Download and inspect

Run from the repository root with Python 3.12 and `analysis/requirements.txt` (DuckDB and NumPy). Choose fresh input and output directories.

```bash
python -m pip install -r analysis/requirements.txt
python analysis/download_release.py --bundle FULL --tag private-export-20260911-1107 --output /path/to/1107-input
python analysis/download_release.py --bundle CORE --tag private-export-20260911-1107 --output /path/to/1107-core
python analysis/inspect_export.py --input /path/to/1107-input --output /path/to/1107-inspection
python analysis/audit_expanded.py --input /path/to/1107-input --output /path/to/1107-inspection
python analysis/audit_release.py --input /path/to/1107-input --core /path/to/1107-core --output /path/to/1107-inspection/release-contract.json
python -m unittest discover -s analysis -p 'test_*.py'
```

The downloader verifies release asset size/SHA-256, rejects unsafe, duplicate or unexpected archive members, and writes `provenance.json`. CORE has exactly eight members; FULL adds `features.parquet`. Audit sidecars stay separate assets. `audit_release.py` checks shared files, raw/feature alignment and timing units; add `--previous /path/to/0336-input` for a same-ID raw-record delta. The 1107 manifest's obsolete private-data prose and stale self-reported byte size are recorded defects; do not alter the immutable input.

## Rebuild every analysis

Read `https://htw-live-study.vercel.app/data/live.json` and substitute its actual `as_of` below. Use the same verified FULL directory for all builders.

```bash
python analysis/build_pacing.py --input /path/to/1107-input --output /path/to/1107-aggregates --live-as-of CURRENT_PUBLIC_LIVE_AS_OF
python analysis/build_extended.py --input /path/to/1107-input --output /path/to/1107-aggregates --personalized-output /path/to/1107-personalized --live-as-of CURRENT_PUBLIC_LIVE_AS_OF
python analysis/write_findings.py --output /path/to/1107-aggregates
python analysis/build_weather.py --input /path/to/1107-input --output /path/to/1107-weather/evidence.json
```

`build_pacing.py` writes eight foundation packs; `build_extended.py` writes the other 25 and then calls `build_personalized.generate` on the same prepared cohort/linkage tables. Do not run a partial extension import or replace the current 90–720-minute personalized result with an older 150–270-minute artifact. `write_findings.py` generates narrative results from aggregate tables and records its own script hash.

The weather model and publication gate remain fixed across refreshes: all three candidates are rerun and retained in the audit. Current ready decisions determine routes; do not force humidity to remain withheld or wind/warming to remain published. Details and uncertainty methods are in [WEATHER_ANALYSES.md](../docs/WEATHER_ANALYSES.md).

## Validate and import

The aggregate ZIP must contain `ext_pack_name/pack_meta.json`, `summary.json` and referenced `tables/*.csv`, with all 33 names in `pack_registry.json`. The personalized ZIP contains only `ext_personalized_guide/` and its JSON files. ZIP the contents of each output directory, not an extra parent folder. The two importers have separate ownership contracts.

```bash
python analysis/import_packs.py --archive /path/to/pacing-aggregate-packs.zip --expected-export private-20260911-1107 --check-only
python analysis/import_personalized.py --archive /path/to/pacing-personalized-aggregates.zip --expected-export private-20260911-1107 --check-only
python analysis/import_packs.py --archive /path/to/pacing-aggregate-packs.zip --expected-export private-20260911-1107
python analysis/import_personalized.py --archive /path/to/pacing-personalized-aggregates.zip --expected-export private-20260911-1107
```

Review weather input identity, policy/script hashes, cohort reconciliation, all three decisions and edition values before copying its JSON to `public/data/weather/evidence.json`. Adopt both input pins with the reviewed outputs. Then run:

```bash
npm ci
npm run verify:data
npm run build
```

The 33-pack importer requires the complete registry and validates before replacing only its owned folders. The personalized importer validates every shard/CDF/cell and writes compact JSON with transport hashes. Artifact limits are 20 MB uncompressed for the 33-pack archive and 512 MB for personalized output; investigate unexpected growth rather than dropping required cells. Weather is outside both import contracts and has its own verification.

The site checks source/pin consistency, raw/timing/source-exclusion reconciliation, finite values, observed cohort counts, strict target boundaries, route readiness, source labels and unit conversions. New publication still requires inspecting the exact diff and verifying production against the named commit and source release.

## Timing and source-quality contract

- Parse raw elapsed strings as H:MM:SS or M:SS; require all nine increasing checkpoints at 5, 10, 15, 20, 25, 30, 35, 40 and **42.195 km**, despite the `split_42_2km` field name. Do not interpolate missing splits or halfway times.
- Deduplicate equivalent records ignoring database IDs, ingestion timestamps and source URLs. Keep finishes from 90 minutes to 12 hours and every section from 2 to 20 min/km. These bounds can exclude real unusual performances.
- Apply [source_quality.py](source_quality.py) after timing checks. Its release-specific reviewed exclusions cover invalid grids, incomplete ingestion, unresolved HOLD editions and a selected top-finisher field. Excluded editions do not supply current outcomes or earlier benchmarks. Do not exclude additional editions merely for being small.
- Reconcile `raw = duplicates_removed + missing_or_unparsed + non_increasing + outside_quality_bounds + source_quality_excluded + eligible`. `timing_eligible = source_quality_excluded + eligible`. The policy's edition counts and hashes travel with every output.
- For 1107: timing-eligible 3,369,060; source-excluded 40,901; final eligible 3,328,159. Missing age or recorded gender alone does not remove a valid finish from All. Exact-age/gender comparisons retain their own coverage rules. Feature `valid_splits` is a different population.
- Compare 0–20 with 20–40 km at equal distance; do not call these measured half-marathon splits. Runner-normalized median profiles need not integrate to zero even though each individual's normalized profile does.
- Chart cells generally require 100 finishes. Matched strata and edition comparisons have additional documented minima. These are reliability rules, not restrictions on access to full records. Finish counts are not unique-runner counts.

## Identity and chronology

The explicitly audited 1107 release uses canonical raw `id` / feature `record_id` after runtime checks of unique matching sets and recorded labels. The candidate join additionally matches finish and all nine section durations to milliseconds. Legacy September 7 reproduction retains one-to-one edition/name/full-timing matching because those numeric ID namespaces are incompatible. Never join by row order or apply the newer contract retroactively.

Cross-race IDs remain supplied candidates. Retain non-ambiguity, consistent recorded gender, inferred birth-year span at most two years and no duplicate edition. Recompute recent best from the two strictly earlier calendar years; exclude all current/same-year outcomes. Earlier-best improvements use all strictly earlier years, not a claimed lifetime PB. Supplied PB/ability/next-race fields never supply pre-race covariates.

Feature race dates remain null. Dated comparisons use complete, unique supplied edition-date coverage. Pair analyses require uniquely observed endpoint years; recorded return requires subsequent home-city edition coverage. Missing later records do not establish retirement. Course historical validity remains unavailable, so terrain is a supplied-route proxy.

## Personalized engine

The engine retains 12 calculation paths: achieved-time pacing, earlier-benchmark opening, exact-threshold nearby finishes, age contrasts, terrain, opening/late pacing, checkpoints, course outcome spread, edition-weighted temperature, threshold context, paired returns and earlier-best gains. The primary ten are mapped in `lib/ten-analyses.ts`; the earlier guide remains at `/research/personalized`.

Targets are every whole minute from 90 through 720 with strict finish < target. Achieved-time bands use 43 fifteen-minute presets; exact thresholds do not interpolate. Exact ages are 18–24, then five-year bands through 85–89. Previous time selects a 15-minute band of recorded bests in the two earlier years. Broader cohorts are explicitly labeled; a course never silently falls back to another city.

Checkpoint cells use 20/30/35 km, two-minute elapsed bands with an exclusive upper endpoint, and optional recent-section trend; they do not use a prior-time filter. Their historical proportions are not validated individual probabilities. A separate forecast pack trains only before the latest three observed years and evaluates all models on the same later eligible cohort.

## Outputs, provenance and workflows

Each broad pack has metadata, summary and aggregate CSV tables. Metadata records source/export timestamps, archive/manifest/script hashes, live-context timestamp, raw and eligible counts, source-quality audit and written methods. Personalized metadata also records linkage, target range and JSON transport hashes. Later prose-only edits must be distinguished from numerical recalculation.

The **Marathon pacing analysis** workflow responds to matching release publication, relevant PR changes and manual dispatch. It produces `pacing-aggregate-packs`, `pacing-personalized-aggregates` and `pacing-export-inspection`; it does not import or deploy. The **Weather evidence screen** workflow accepts an explicit tag and produces `weather-evidence`, also without import or deployment. Record exact tag, code commit and artifacts; artifacts can expire, so preserve durable audit reports.

The original sustained-slowdown definition remains unchanged: at least 25% slowing for at least 5 km after 20 km versus the 5–20 km baseline, with a neutral [published-method citation](https://doi.org/10.1371/journal.pone.0251513). Source inclusion changes in the extensions do not recalculate the dated core figures.
