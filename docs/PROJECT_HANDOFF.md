# Project handoff

Evidence updated 2026-09-11 during takeover on `codex/documentation-handoff-20260911`, starting at commit `8cc2ada`. The base main commit was `140e5c66e7a433dfc3c6eab0563ec39845006d3f` (PR #28). This document distinguishes the inspected deployment, current export contract and subsequent presentation changes in this branch.

## Read in order

1. [Data architecture](DATA_ARCHITECTURE.md)
2. [Website architecture](WEBSITE_ARCHITECTURE.md)
3. [Analysis catalog](ANALYSIS_CATALOG.md)
4. [Operations](OPERATIONS.md)
5. [Known issues](KNOWN_ISSUES.md)
6. [Ingestion handoff](INGESTION_HANDOFF.md)

The [analysis README](../analysis/README.md) documents the pipeline; [verified export access](../analysis/ACCESS.md) separates the September 7 calculation vintage from the September 10 audited export.

## Purpose and product decisions

Owner: Andrew Kam. Marathon Pacing Study covers marathon pacing research and helps visitors prepare for a race, choose a marathon and understand a past result. Its sustained-slowdown measure retains the [Published slowdown method (2021)](https://doi.org/10.1371/journal.pone.0251513). Research pages follow Answer → Methodology → Visualization, with mobile usability, transparent sample sizes and accessible explanations.

The early 12/26-question planning counts are historical. The current catalog contains 35 broader questions, of which 33 map to extension packs and two require missing group/congestion measurements. There are also 12 personalized questions, legacy core packs and sustained-slowdown figures. These counts overlap and are not unique independent studies.

The personalized selector uses course, age band, target 2:30–4:30 with 15-minute presets and whole-minute custom thresholds, optional recorded gender and previous marathon time. Previous time filters a band of recent recorded bests, not a verified exact last marathon. Course substitution is never silent; cohort broadening must be labeled. Do not invent data.

## Verified release and production state

- [analysis/release.json](../analysis/release.json) still pins `private-export-20260907-1318`. All 34 extension directories—33 broad packs and the personalized guide—use bundle `private-20260907-1318`.
- Before presentation changes in this branch, all **401 checked-in production aggregate files** were fetched from the public deployment and matched byte for byte. Production therefore used the same September 7 aggregates at inspection; this does not claim the later branch changes are deployed.
- Both archives in [private-export-20260910-1412](https://github.com/koolkam00/htw-live-study/releases/tag/private-export-20260910-1412) were downloaded outside the checkout and verified against their release sizes and SHA-256 digests. CORE has **3,580,279** raw rows; FULL has **3,580,279** feature rows. IDs are unique, non-null and have exactly matching sets. Row order differs. City/year/age agree by ID; 552 raw `X` sex values become null in features. Comparable checkpoint and finish timings agree within 1 ms after converting feature minutes to seconds. This establishes release-specific record alignment, not independently verified cross-race identities.
- The September 10 feature table has **138 columns** and lacks `race`, `runner_name` and `split_mode_in`. Every feature `race_date` remains null. The current history builder expects the missing name/edition fields, so adopting this schema requires an explicit versioned consumer change or a new producer export restoring the required columns.
- Both archives contain files outside the current downloader allowlist. CORE adds `ID-CONTRACT.md` and `SHA256SUMS.txt`; FULL additionally includes `FEATURE-FIELD-NOTES.md` and `COUNT-DIFF.md`. The checked-in downloader rejects these current archives.
- The latest relevant refresh remains [failed run 34490423926](https://github.com/koolkam00/htw-live-study/actions/runs/34490423926), with no retry found at inspection. It failed before downloading FULL with “Expected exactly one FULL archive in the release”; downstream calculations and uploads were skipped. The current listing has one matching FULL archive. Its later extraction/schema problems are separate from that historical failure.
- The release producer states publication is gated on Lead verification. No ingestion change, refresh dispatch, release-pin change, merge or deployment was performed during takeover.

## Ownership and access boundaries

| Responsibility | Coordination role |
| --- | --- |
| Ingestion, live private SQLite, private exports | New Data Base Lead |
| Derived features, original packs and live.json dumps | Core analysis lead |
| Weather and course overlays | Weather Elevation Lead |
| Site repository and publication | Site owner |
| Reviewable UI and extension analyses | Outside analysis/Codex agent |

These are responsibility labels, not authenticated identities or permission grants. Repository access does not provide shell access to the ingestion machine. Private Releases hold compressed full records and backups; they are not encrypted archives. Keep raw runner data, names and working inputs outside the site tree and public artifacts.

## Remaining work and evidence

The highest-priority task is the [producer handoff](INGESTION_HANDOFF.md): request a new compatible full export with restored name/edition columns, audit sidecars outside the archives and the verified ID fix preserved. If an intentional schema change is preferred, agree a version-specific consumer adapter while retaining the September 7 natural-key join. Run the private inspection/calculation before proposing any pin or publication change. Next, reconcile split/source/edition completeness and exact-age coverage, then reproduce the targeted production UI and cohort-disclosure issues.

The checked-in guide still has no published age-specific cohort for 21 of its 30 selections (29 cities plus All courses); only 29.9% of eligible finishes have exact ages. This is a verified aggregate-data limit. Historical UI findings require reproduction against a named deployment. Ingestion scripts, live schedules, backup restore evidence and hosting configuration remain outside the inspected access.

Durable aggregate evidence: [archive members](evidence/2026-09-11/archive-members-audit.json), [ID alignment](evidence/2026-09-11/id-contract-audit.json), [timing/units](evidence/2026-09-11/timing-unit-contract-audit.json), [sex normalization](evidence/2026-09-11/sex-normalization-audit.json). These reports contain no runner rows or archive bytes.

The historical September 7 inspection artifact was [run 34303613905](https://github.com/koolkam00/htw-live-study/actions/runs/34303613905), artifact 10085831842, SHA-256 `2616228dcca906a4c03cc1c1b4aafdb44f6658d70402bb2ba7af1d64e5f42760`. Actions inspection artifacts expire after seven days; keep necessary aggregate evidence with release documentation.
