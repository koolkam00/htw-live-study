# Project handoff

Updated September 12, 2026 UTC for runner context and peer comparisons on `codex/runner-context-and-peers`. All analytical inputs remain **`private-export-20260911-1107`**. The [runner-context record](RUNNER_CONTEXT_AND_PEERS.md) documents the completed local calculation and pending publication. The [prior refresh record](REFRESH_20260911_1107.md) and [supporting-study/name-search record](CURRENT_SITE_AND_RUNNER_SEARCH.md) describe preceding changes; they do not certify deployment of this extension.

## Read in order

1. [Data architecture](DATA_ARCHITECTURE.md)
2. [Website architecture](WEBSITE_ARCHITECTURE.md)
3. [Analysis catalog](ANALYSIS_CATALOG.md)
4. [Operations](OPERATIONS.md)
5. [Known issues](KNOWN_ISSUES.md)
6. [Producer handoff](INGESTION_HANDOFF.md), treating its September 10 blockers as historical

The [analysis README](../analysis/README.md) gives calculation and import contracts; [export access](../analysis/ACCESS.md) provides direct public downloads.

## Verified 1107 input and analytical cohort

The September 11 1107 CORE and FULL archives have matching shared files and **4,207,456 raw and feature rows**, spanning **34 cities and 240 city/year editions**. Canonical IDs are unique, non-null and have identical sets. Edition labels, recorded names and ages agree; all comparable cumulative timings agree within 1 ms after converting feature minutes to seconds. Against the September 11 0336 snapshot, the raw table has **228,796 added, zero deleted and zero changed records**. The latest included ingestion timestamp is `2026-09-11T15:04:44Z`; manifest creation is `2026-09-11T15:10:45Z`.

The compressed SQLite snapshot was downloaded and opened read-only. Its database SHA-256 matches the manifest, `PRAGMA integrity_check` returned `ok`, and it contains the same 4,207,456 raw rows and latest ingestion timestamp. This is backup verification, not access to or modification of the live service.

Raw timing checks yield **3,369,060** plausible complete finishes. The reviewed source-quality policy removes **40,901** otherwise plausible finishes from ten specifically identified editions, leaving **3,328,159 eligible finishes**. Raw exclusions are 616,424 missing/unparsed, 217,295 non-increasing, 4,677 outside timing bounds and zero exact duplicates. Source exclusions apply after these checks and do not double-count invalid rows. They also apply before earlier-performance benchmarks are formed.

The producer's `valid_splits` flag identifies **3,326,908** feature rows, with **1,022,545** sustained-slowdown flags among them. That is a different cohort from this site's raw-timing/source-quality cohort. The site's eligible cohort includes 36,151 finishes with unrecorded/other gender that fail the feature flag solely for gender coverage. Its gender counts are 2,205,097 men, 1,086,911 women and those 36,151 other/unrecorded finishes. Do not interchange these definitions or call finish counts unique people.

The current linked-history calculation has **3,008,457 linked eligible finishes**, **524,323 recent strictly-earlier-year benchmarks**, **546,847 qualifying cross-year pairs**, and **3,006,219 linked finishes with a supplied edition date**. These are observations and candidate links, not independently verified people.

## Refresh and publication boundary

This refresh rebuilds the **33 registered extension packs**, the **12-path personalized engine supplying the essential ten**, and the **three-candidate weather screen**. Both [main](../analysis/release.json) and [weather](../analysis/weather-release.json) pins are adopted with their validated outputs. The complete import passed its checks against the named release. Consult [the refresh record](REFRESH_20260911_1107.md) for deployment verification against the publication commit.

Weather publication follows the existing evidence rule. A previously published candidate can become withheld and vice versa; all three results remain in the downloadable audit. See [weather methods and decisions](WEATHER_ANALYSES.md).

The subsequent implementation removes old `live.json` charts and original S/R/RN/P data as website inputs. `live.json` becomes a small current-release compatibility metadata file, with no historical figures. `build_public_explorer.py` recalculates sustained-slowdown prevalence, onset, threshold sensitivity, age, earlier-performance, recorded-best, severity and milestone summaries into `public/data/study/evidence.json`. Existing S/R aliases use their current extension; old planner/checkpoint entries open current equivalents. Forecast and validated course-adjustment outputs remain explicitly unavailable where the current inputs cannot support them. Historical outputs remain recoverable in Git history and are never relabeled as fresh. The earlier extension metadata’s `live_as_of` field is historical calculation context only. The new supporting calculation has **1,023,450 detected finishes among 3,328,159 eligible finishes (30.7512%)**; the producer’s 1,022,545 count belongs to its different feature-valid cohort.

## Product and statistical contracts

The primary experience presents [ten ranked runner questions](TOP_TEN_ANALYSES.md), plus weather questions passing the evidence gate. The archive retains 35 broader questions: 33 calculated extension packs and two limited by missing group/start-offset measurements. These overlapping views are not independent studies.

The initial profile is explicitly All courses / 4:00, all ages, all recorded genders and no earlier time. Whole-minute target support is 1:30–12:00; achieved-time profiles use 15-minute bands. A valid selection does not guarantee a sufficiently large cohort. Previous time means a band of recent recorded bests from strictly earlier years, not a verified last marathon. Terrain requires an explicit course and remains a supplied-route proxy.

Miles and minutes per mile are the default display, with a Miles / Kilometres switch and feet for elevation in miles mode. `units=mi|km` takes precedence over the saved preference. Weather converts temperature differences to °F without adding 32 and wind to mph; calculations remain metric. Recorded 5 km sections become 3.11 miles without inventing individual-mile or halfway splits. Visible source labels include the exact release tag to distinguish same-day exports.

The sustained-slowdown calculation uses contiguous recorded sections totaling at least 5 km after 20 km; onset is a section boundary, not an exact moment. The definition remains at least 25% slowing for at least 5 km after 20 km relative to the 5–20 km baseline, with the neutral [published-method citation](https://doi.org/10.1371/journal.pone.0251513). Canonical record IDs are not verified cross-race identities: retain ambiguity, gender/birth-year and duplicate-edition checks, and exclude current/same-year results from prior benchmarks.

## Public runner lookup

`/runners` searches the current release's recorded names and lets visitors confirm which candidate races belong to them. `build_runner_lookup.py` writes compressed, checksummed search/profile shards and a source manifest. The index includes usable named raw records even when their splits or edition are excluded from aggregate analysis. Missing names are counted explicitly; no name is invented. Missing timings and quality reasons remain visible.

Candidates use screened supplied identities where available, otherwise one record per candidate. Names never establish cross-race identity. Every performance comparison is limited to the visitor's selected recorded races and eligible timings; an observed best is not necessarily a lifetime best. Search and full-data downloads are public, with no account requirement.

The new runner-context pipeline adds exact same-edition finish comparisons by recorded gender and exact-age band, achieved-time pacing quartiles, selected-race section differences, and validated weather/current-route context. It binds its 240 edition shards to the exact runner manifest; lookup refreshes therefore require a context rebuild even at the same release tag. Its local calculation covers 3,328,159 eligible finishes, 1,602 peer groups and 12,674 pace groups. Weather matches 233 raw editions and terrain 238; gaps and proxy limits remain explicit. See [methods, coverage and pending publication](RUNNER_CONTEXT_AND_PEERS.md) and the [refresh commands](OPERATIONS.md#runner-context-refresh).

## Public access and operations

Source code, complete runner records including recorded names, exports, database snapshots, overlays and aggregate outputs are public research material. Gzip compression is not encryption. Release assets keep large binaries out of website builds for size and reproducibility. Passwords, access tokens and operational credentials are not dataset contents.

The 1107 manifest still contains obsolete private-data prose and an incorrect self-reported manifest byte count (2,286 versus 4,862 actual bytes). Record these producer defects without modifying the immutable input. Verified archive/member digests and the owner's public-access policy remain applicable. See [access evidence](../analysis/ACCESS.md).

Public snapshot access does not provide shell access to the live ingestion service. Producer schedules, retries and hosting credentials remain outside the website agent's inspected environment. Never replace the live database with a downloaded snapshot.

## Remaining producer work

Reconcile held and partial editions against source totals; resolve the selected top-finisher source and invalid split grids before reconsidering their exclusion. Investigate Paris 2014–2018 checkpoint parsing against source semantics. Improve missing-age coverage (2,758,408 raw ages are null), source chronology and ambiguous start-time provenance. All feature race dates and all historical validity ranges in the 32 course profiles remain null. Do not infer precise ages, chronology, wave starts or historical routes.

The runner-context audit also identifies a conflicting Helsinki 2025 start hour, six raw editions without weather, two cities without course profiles, and incompatible whole-profile/section elevation totals. Request sourced corrections and documented elevation processing in a new immutable export; preserve the original evidence. Exact gaps are listed in [runner context](RUNNER_CONTEXT_AND_PEERS.md#weather-contract-and-gaps).

## Historical milestones

- September 7 CORE/FULL record IDs are incompatible; its natural-key linkage remains supported for reproduction.
- September 10 ID alignment was verified, but archive sidecars and missing history columns prevented that vintage's refresh. [Run 34490423926](https://github.com/koolkam00/htw-live-study/actions/runs/34490423926) failed before extraction. Compatible September 11 exports supersede those blockers; the historical run did not become successful.
- The essential-ten redesign shipped in [PR #32](https://github.com/koolkam00/htw-live-study/pull/32), with miles display in [PR #33](https://github.com/koolkam00/htw-live-study/pull/33). The earlier weather screen used the September 11 0336 export separately from the September 7 main input.
- Dated [ID evidence](evidence/2026-09-11/id-contract-audit.json), [timing evidence](evidence/2026-09-11/timing-unit-contract-audit.json), [access evidence](evidence/2026-09-11/public-access-audit.json) and [display verification](evidence/2026-09-11/miles-display.md) remain historical records, not current-vintage counts or deployment certification.
