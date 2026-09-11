# Project handoff

Evidence updated 2026-09-11 during takeover on `codex/documentation-handoff-20260911`, starting at commit `8cc2ada`. The base main commit was `140e5c66e7a433dfc3c6eab0563ec39845006d3f` (PR #28). This document distinguishes that inspected deployment, the export contract and later changes. Public-access work followed on `codex/public-data-access`. The current ten-analysis redesign is on `codex/ten-analysis-redesign`; branch changes are not evidence of a deployment.

## Read in order

1. [Data architecture](DATA_ARCHITECTURE.md)
2. [Website architecture](WEBSITE_ARCHITECTURE.md)
3. [Analysis catalog](ANALYSIS_CATALOG.md)
4. [Operations](OPERATIONS.md)
5. [Known issues](KNOWN_ISSUES.md)
6. [Ingestion handoff](INGESTION_HANDOFF.md)

The [analysis README](../analysis/README.md) documents the pipeline; [verified export access](../analysis/ACCESS.md) separates the September 7 calculation vintage from the September 10 audited export.

## Purpose and product decisions

Owner: Andrew Kam. Marathon Pacing Study covers marathon pacing research and helps visitors prepare for a race, choose a marathon and understand a past result. Its sustained-slowdown measure retains the [Published slowdown method (2021)](https://doi.org/10.1371/journal.pone.0251513). The primary pages present one question, the selected comparison, the observed result and visualization, reading guidance and an expandable method, with mobile usability, transparent sample sizes and accessible explanations.

The primary experience now consists of [ten ranked analyses](TOP_TEN_ANALYSES.md) at `/analyses/{slug}`, defined by `lib/ten-analyses.ts`. The early 12/26-question planning counts are historical. The broader research archive retains 35 questions, of which 33 map to extension packs and two require missing group/congestion measurements. The personalized engine retains 12 calculation paths, including downhill opening and same-course returns beyond the primary ten. Legacy core packs and sustained-slowdown figures remain available. These counts overlap and are not unique independent studies.

The primary explorer starts with an All courses / 4:00 example, all ages, all recorded genders and no earlier time. It shows only supported controls for each question. Whole-minute target support is 1:30–12:00; achieved-time comparisons use a 15-minute band around the nearest preset. The personalized pack was recalculated at `2026-09-11T09:15:27Z` from the same September 7 input to expand this range. A valid target does not guarantee a sufficiently large cohort, especially at extreme times. Previous time filters a band of recent recorded bests, not a verified exact last marathon. Terrain requires an explicit course selection; there is no arbitrary city fallback. Cohort broadening is labeled. Weather and elevation do not create a universal demographic × speed × conditions filter.

## Public-access policy and verification

As requested on September 11, 2026, the source code, complete runner-level data including recorded names, exports, database snapshots, overlays and analysis outputs are public research material. Anyone must be able to download and open ordinary unencrypted files without an account, token or separate decryption key. Public GitHub Releases are preferred for large binary files; storing runner data in the checkout is allowed. Statistical minimum-cohort rules remain rules for the reliability of chart estimates, not access restrictions on full records. Passwords, tokens and operational credentials are not part of the dataset.

**Latest verification (2026-09-11):** GitHub reports this repository as public. Without credentials or cookies, all nine published releases were listed and the first 16 bytes of each of the 21 assets were read successfully, including four CORE/FULL archives and eight SQLite backups. The source release pin was also read anonymously. This verifies public access, not a repeat of every full-file checksum audit.  A subsequent anonymous smoke test downloaded and SHA-256-verified the complete pinned September 7 CORE archive, extracted all eight files and opened all five Parquet tables, including 3,451,055 raw records. See the [access evidence](evidence/2026-09-11/public-access-audit.json) and [download links](../analysis/ACCESS.md).

Legacy `private-export-*`, `private-*` and backup filenames remain stable compatibility identifiers. They do not imply that an account should be required. Earlier instructions to keep runner records private, outside the checkout or out of public downloads are superseded.

## Verified release and production state

- [analysis/release.json](../analysis/release.json) still pins `private-export-20260907-1318`. All 34 extension directories—33 broad packs and the personalized guide—use bundle `private-20260907-1318`. The September 11 personalized recalculation changes target support and its calculation provenance while retaining input timestamp `2026-09-07T13:19:23Z`.
- Before the September 11 presentation changes, all **401 checked-in production aggregate files** were fetched from the public deployment and matched byte for byte. Production therefore used the same September 7 aggregates at inspection; this does not claim the later branch changes are deployed.
- Both archives in [private-export-20260910-1412](https://github.com/koolkam00/htw-live-study/releases/tag/private-export-20260910-1412) were downloaded outside the checkout and verified against their release sizes and SHA-256 digests. CORE has **3,580,279** raw rows; FULL has **3,580,279** feature rows. IDs are unique, non-null and have exactly matching sets. Row order differs. City/year/age agree by ID; 552 raw `X` sex values become null in features. Comparable checkpoint and finish timings agree within 1 ms after converting feature minutes to seconds. This establishes release-specific record alignment, not independently verified cross-race identities.
- The September 10 feature table has **138 columns** and lacks `race`, `runner_name` and `split_mode_in`. Every feature `race_date` remains null. The current history builder expects the missing name/edition fields, so adopting this schema requires an explicit versioned consumer change or a new producer export restoring the required columns.
- Both archives contain files outside the current downloader allowlist. CORE adds `ID-CONTRACT.md` and `SHA256SUMS.txt`; FULL additionally includes `FEATURE-FIELD-NOTES.md` and `COUNT-DIFF.md`. The checked-in downloader rejects these current archives.
- The latest relevant refresh remains [failed run 34490423926](https://github.com/koolkam00/htw-live-study/actions/runs/34490423926), with no retry found at inspection. It failed before downloading FULL with “Expected exactly one FULL archive in the release”; downstream calculations and uploads were skipped. The current listing has one matching FULL archive. Its later extraction/schema problems are separate from that historical failure.
- During the initial takeover, the release producer described a Lead-verification publication gate, and no ingestion change, refresh dispatch, release-pin change, merge or deployment was performed. That historical privacy/access gate does not restrict the current public-data policy. Schema, checksum and analytical validation still determine whether an export is compatible and whether chart calculations are correct.

## Responsibilities and operational access

| Responsibility | Coordination role |
| --- | --- |
| Ingestion, live SQLite, public exports | New Data Base Lead |
| Derived features, original packs and live.json dumps | Core analysis lead |
| Weather and course overlays | Weather Elevation Lead |
| Site repository and publication | Site owner |
| Reviewable UI and extension analyses | Outside analysis/Codex agent |

These are coordination responsibilities. Public repository/data access does not itself provide shell access to the ingestion machine. Publish full records and consistent backups as ordinary, unencrypted files, with direct anonymous links and documented schemas. The live service remains separate from downloadable database snapshots; operational credentials are not research data.

## Remaining work and evidence

The highest-priority task is the [producer handoff](INGESTION_HANDOFF.md): request a new compatible full export with restored name/edition columns, audit sidecars outside the archives and the verified ID fix preserved. If an intentional schema change is preferred, agree a version-specific consumer adapter while retaining the September 7 natural-key join. Run the inspection/calculation before adopting a new numerical release pin. Public access to full exports does not depend on whether their chart refresh has passed. Next, reconcile split/source/edition completeness and exact-age coverage, then validate the redesigned navigation, mobile charts, extreme-time availability and cohort disclosures against a named build before publication.

The checked-in guide still has no published age-specific cohort for 21 of its 30 selections (29 cities plus All courses); only 29.9% of eligible finishes have exact ages. This is a verified aggregate-data limit. Historical UI findings require reproduction against a named deployment. Ingestion scripts, live schedules, backup restore evidence and hosting configuration remain outside the inspected access.

Durable aggregate evidence: [archive members](evidence/2026-09-11/archive-members-audit.json), [ID alignment](evidence/2026-09-11/id-contract-audit.json), [timing/units](evidence/2026-09-11/timing-unit-contract-audit.json), [sex normalization](evidence/2026-09-11/sex-normalization-audit.json). These reports contain no runner rows or archive bytes.

The historical September 7 inspection artifact was [run 34303613905](https://github.com/koolkam00/htw-live-study/actions/runs/34303613905), artifact 10085831842, SHA-256 `2616228dcca906a4c03cc1c1b4aafdb44f6658d70402bb2ba7af1d64e5f42760`. Actions inspection artifacts expire after seven days; keep necessary aggregate evidence with release documentation.
