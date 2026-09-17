# Project handoff

Updated September 17, 2026 for the additive [fast-start analysis](FAST_START_ANALYSIS.md), using the unchanged **`private-export-20260912-0934`** pin. Its local calculation and independent data verification are complete; its PR checks and publication remain separate from the earlier refresh. The [current refresh record](REFRESH_20260912_0934.md) distinguishes the September 12 source audit, calculation, import and production verification. The [runner-context record](RUNNER_CONTEXT_AND_PEERS.md) and [supporting-study/name-search record](CURRENT_SITE_AND_RUNNER_SEARCH.md) retain their earlier implementation evidence. The public site is [splithappens.run](https://splithappens.run).

## Read in order

1. [Data architecture](DATA_ARCHITECTURE.md)
2. [Website architecture](WEBSITE_ARCHITECTURE.md)
3. [Analysis catalog](ANALYSIS_CATALOG.md)
4. [Operations](OPERATIONS.md)
5. [Known issues](KNOWN_ISSUES.md)
6. [Producer handoff](INGESTION_HANDOFF.md), treating its September 10 blockers as historical

The [analysis README](../analysis/README.md) gives calculation and import contracts; [export access](../analysis/ACCESS.md) provides direct public downloads.

## Website analytics

The [PostHog integration](ANALYTICS.md) adds cookieless page and feature analytics, with search/identity redaction, session recordings disabled and a visitor opt-out. Account setup, build variables and production event verification are separate launch requirements; see that runbook before claiming collection is live. This integration does not change research inputs or calculations.

## Verified 0934 input and analytical cohort

The September 12 0934 CORE and FULL archives have matching shared files and **4,462,379 raw and feature rows**, spanning **34 cities and 256 city/year editions**. Canonical IDs are unique, non-null and have identical sets. Edition labels, recorded names and ages agree; all comparable cumulative timings agree within 1 ms after converting feature minutes to seconds. Against the September 11 1107 snapshot, the raw table has **254,923 added, zero deleted and zero changed records**, including 16 new editions. The latest included ingestion timestamp is `2026-09-12T10:00:03Z`; manifest creation is `2026-09-12T13:37:16Z`.

The compressed SQLite snapshot was downloaded and opened read-only. Its database SHA-256 matches the manifest, `PRAGMA integrity_check` returned `ok`, and it contains the same 4,462,379 raw rows and latest ingestion timestamp. This is backup verification, not access to or modification of the live service.

Raw timing checks yield **3,595,426** plausible complete finishes. The reviewed source-quality policy removes **78,090** otherwise plausible finishes from eleven specifically identified editions, leaving **3,517,336 eligible finishes**. Raw exclusions are 632,168 missing/unparsed, 225,218 non-increasing, 9,567 outside timing bounds and zero exact duplicates. Source exclusions apply after these checks and do not double-count invalid rows. They also apply before earlier-performance benchmarks are formed.

The producer's `valid_splits` flag identifies **3,558,154** feature rows, with **1,082,894** sustained-slowdown flags among them. That is a different cohort from this site's raw-timing/source-quality cohort. The site's eligible cohort retains 36,161 finishes with unrecorded/other gender. Its gender counts are 2,339,125 men, 1,142,050 women and those 36,161 other/unrecorded finishes. Do not interchange these definitions or call finish counts unique people.

The current linked-history calculation has **3,194,070 linked eligible finishes**, **555,437 recent strictly-earlier-year benchmarks**, **583,670 qualifying cross-year pairs**, and **3,185,321 linked finishes with a supplied edition date**. These are observations and candidate links, not independently verified people.

## Refresh and publication boundary

The September 12 refresh rebuilt the **33 registered extension packs**, the **12-path personalized engine**, and the **three-candidate weather screen**. Both [main](../analysis/release.json) and [weather](../analysis/weather-release.json) pins are adopted with their validated outputs. The complete import passed its checks against the named release. Consult [the refresh record](REFRESH_20260912_0934.md) for deployment verification against the publication commit. Rank 2 subsequently receives a separate fast-start calculation from the same verified runner profiles; the archive's earlier opening path and existing packs retain their outputs.

Weather publication follows the existing evidence rule. A previously published candidate can become withheld and vice versa; all three results remain in the downloadable audit. See [weather methods and decisions](WEATHER_ANALYSES.md).

The subsequent implementation removes old `live.json` charts and original S/R/RN/P data as website inputs. `live.json` becomes a small current-release compatibility metadata file, with no historical figures. `build_public_explorer.py` recalculates sustained-slowdown prevalence, onset, threshold sensitivity, age, earlier-performance, recorded-best, severity and milestone summaries into `public/data/study/evidence.json`. Existing S/R aliases use their current extension; old planner/checkpoint entries open current equivalents. Forecast and validated course-adjustment outputs remain explicitly unavailable where the current inputs cannot support them. Historical outputs remain recoverable in Git history and are never relabeled as fresh. The earlier extension metadata’s `live_as_of` field is historical calculation context only. The new supporting calculation has **1,070,946 detected finishes among 3,517,336 eligible finishes (30.4476%)**; the producer’s 1,082,894 count belongs to its different feature-valid cohort.

## Product and statistical contracts

The primary experience presents [ten ranked runner questions](TOP_TEN_ANALYSES.md), plus weather questions passing the evidence gate. The archive retains 35 broader questions: 33 calculated extension packs and two limited by missing group/start-offset measurements. These overlapping views are not independent studies.

The initial personalized profile is explicitly All courses / 4:00, all ages, all recorded genders and no earlier time. Whole-minute target support is 1:30–12:00; achieved-time profiles use 15-minute bands. A valid selection does not guarantee a sufficiently large cohort. Previous time means a band of recent recorded bests from strictly earlier years, not a verified last marathon. Terrain requires an explicit course and remains a supplied-route proxy. The separate fast-start page uses course, age, gender and four broad earlier-best time bands, with no target or current-finish filter; sparse selections are never silently broadened.

Miles and minutes per mile are the default display, with a Miles / Kilometres switch and feet for elevation in miles mode. `units=mi|km` takes precedence over the saved preference. Weather converts temperature differences to °F without adding 32 and wind to mph; calculations remain metric. Recorded 5 km sections become 3.11 miles without inventing individual-mile or halfway splits. Visible source descriptions list marathon/year coverage and recorded weather/elevation fields. Exact release tags and timestamps remain in download URLs and machine-readable calculation files, not reader-facing copy.

The sustained-slowdown calculation uses contiguous recorded sections totaling at least 5 km after 20 km; onset is a section boundary, not an exact moment. The definition remains at least 25% slowing for at least 5 km after 20 km relative to the 5–20 km baseline, with the neutral [published-method citation](https://doi.org/10.1371/journal.pone.0251513). Canonical record IDs are not verified cross-race identities: retain ambiguity, gender/birth-year and duplicate-edition checks, and exclude current/same-year results from prior benchmarks.

## Fast-start analysis

Rank 2, `/analyses/starting-pace`, now has an additive implementation using [fast-start evidence](../public/data/fast-start/evidence.json). It divides actual first 10 km pace into six fixed bands relative to the best eligible finish in the two strictly earlier calendar years. It shows section trajectories, finish differences, signed opening/remaining time accounting and the first qualifying sustained-slowdown section. The earlier personalized opening/target-threshold path remains in the research guide; it has not been regenerated.

The builder checks all 7,766 compressed runner shards and source script hashes, then reconstructs exactly **555,437 benchmarked finishes**. **2,961,899 eligible finishes without that recent benchmark are excluded**. The output contains 576 exact filter combinations and 2,846 groups of at least 100 finishes. Onset distributions additionally require 100 detected finishes and use only those detected finishes as their denominator. The rate denominator includes every finish in its opening group. Its own output is bound to the exact runner-manifest hash, so a lookup refresh requires a rebuild.

Globally, openings more than 10% faster than the earlier benchmark have **47.0% sustained slowdown**, compared with **17.9%** for openings within 2%. The most common first qualifying sections are 30–35 km and 35–40 km, respectively. The faster-opening group's median finish nevertheless improves on its earlier benchmark by **16:37**; changing fitness and other differences remain mixed together. Do not turn late slowing into a claimed causal finish-time penalty or treat an earlier best as current fitness. Only eligible recorded finishers are represented, not withdrawals.

Nine calculation tests and the independent JavaScript verifier passed. The verifier recomputed counts, editions, slowdown and onset for every published cell, plus every numeric metric in 36 groups across six filter combinations. [Methods, exact boundaries, measured findings and reproduction commands](FAST_START_ANALYSIS.md) document the completed local evidence. CI and production publication evidence are recorded separately in [PR #41](https://github.com/koolkam00/htw-live-study/pull/41).

## Public runner lookup

`/runners` searches the current release's recorded names and lets visitors confirm which candidate races belong to them. `build_runner_lookup.py` writes compressed, checksummed search/profile shards and a source manifest. The index includes usable named raw records even when their splits or edition are excluded from aggregate analysis. There are 4,462,237 records with searchable names and 142 without a usable normalized name, including 11 null names. No name is invented. Missing timings and quality reasons remain visible.

Candidates use screened supplied identities where available, otherwise one record per candidate. Names never establish cross-race identity. Every performance comparison is limited to the visitor's selected recorded races and eligible timings; an observed best is not necessarily a lifetime best. Search and full-data downloads are public, with no account requirement.

The new runner-context pipeline adds exact same-edition finish comparisons by recorded gender and exact-age band, achieved-time pacing quartiles, selected-race section differences, and validated weather/current-route context. It binds its 256 edition shards to the exact runner manifest; lookup refreshes therefore require a context rebuild even at the same release tag. It uses the same 3,517,336 eligible finishes, with 1,729 peer groups and 13,523 achieved-time pace groups. Weather matches 249 raw editions and terrain 254; gaps and proxy limits remain explicit. See [methods, coverage and verification](RUNNER_CONTEXT_AND_PEERS.md) and the [refresh commands](OPERATIONS.md#runner-context-refresh).

The [September 17 runner-coverage update](RUNNER_RECORD_COVERAGE.md) makes lookup coverage visible beside the search form and gives selections containing only incomplete or held results a full source-record view. Mixed selections retain those records alongside eligible-race analysis. A scan of every published profile found 944,975 searchable records that are ineligible for analysis; all were already indexed. This is a presentation update, with no source-pin, index, calculation or eligibility change. Publication is verified separately in the PR.

## Public access and operations

Source code, complete runner records including recorded names, exports, database snapshots, overlays and aggregate outputs are public research material. Gzip compression is not encryption. Release assets keep large binaries out of website builds for size and reproducibility. Passwords, access tokens and operational credentials are not dataset contents.

The 0934 manifest omits a self-entry and is independently hashed; the prior incorrect self-size is no longer present. Release/README privacy prose remains stale, and ID-CONTRACT/FEATURE-FIELD-NOTES still name the prior snapshot. The feature notes also overstate which fields are safe as prior inputs. Preserve these immutable source files and recompute earlier-only benchmarks. See [access evidence](../analysis/ACCESS.md).

Public snapshot access does not provide shell access to the live ingestion service. Producer schedules, retries and hosting credentials remain outside the website agent's inspected environment. Never replace the live database with a downloaded snapshot.

## Remaining producer work

Reconcile held and partial editions against source totals; resolve the selected top-finisher source and invalid split grids before reconsidering their exclusion. New York 2008 grew to 38,047 records but remains held until completion/source-total reconciliation is supplied. Valencia 2018 is explicitly held; its missing 20 km timing already excludes it numerically. Investigate Paris 2014–2018 checkpoint parsing against source semantics. Improve missing-age coverage (2,893,395 raw ages are null), source chronology and ambiguous start-time provenance. All feature race dates and all historical validity ranges in the 32 course profiles remain null. Do not infer precise ages, chronology, wave starts or historical routes.

The runner-context audit also identifies a conflicting Helsinki 2025 start hour, six raw editions without weather, two cities without course profiles, and incompatible whole-profile/section elevation totals. Request sourced corrections and documented elevation processing in a new immutable export; preserve the original evidence. Current gaps are listed in [the refresh record](REFRESH_20260912_0934.md#weather-terrain-and-remaining-gaps); the runner-context record retains its earlier coverage evidence.

## Historical milestones

- September 7 CORE/FULL record IDs are incompatible; its natural-key linkage remains supported for reproduction.
- September 10 ID alignment was verified, but archive sidecars and missing history columns prevented that vintage's refresh. [Run 34490423926](https://github.com/koolkam00/htw-live-study/actions/runs/34490423926) failed before extraction. Compatible September 11 exports supersede those blockers; the historical run did not become successful.
- The essential-ten redesign shipped in [PR #32](https://github.com/koolkam00/htw-live-study/pull/32), with miles display in [PR #33](https://github.com/koolkam00/htw-live-study/pull/33). The earlier weather screen used the September 11 0336 export separately from the September 7 main input.
- Dated [ID evidence](evidence/2026-09-11/id-contract-audit.json), [timing evidence](evidence/2026-09-11/timing-unit-contract-audit.json), [access evidence](evidence/2026-09-11/public-access-audit.json) and [display verification](evidence/2026-09-11/miles-display.md) remain historical records, not current-vintage counts or deployment certification.
