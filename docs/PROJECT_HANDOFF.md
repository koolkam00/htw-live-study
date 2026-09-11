# Project handoff

Verified 2026-09-11 against repository commit `140e5c66e7a433dfc3c6eab0563ec39845006d3f`. This is a curated transfer of the Marathon Analysis conversation plus repository evidence, not a verbatim transcript or a claim to know inaccessible ingestion internals.

## Read in order

1. [Data architecture](DATA_ARCHITECTURE.md)
2. [Website architecture](WEBSITE_ARCHITECTURE.md)
3. [Analysis catalog](ANALYSIS_CATALOG.md)
4. [Operations](OPERATIONS.md)
5. [Known issues](KNOWN_ISSUES.md)
6. [Ingestion handoff](INGESTION_HANDOFF.md)

Existing [analysis README](../analysis/README.md) and [September 7 access audit](../analysis/ACCESS.md) remain authoritative for the workflows and vintage they describe.

## Purpose and product decisions from the conversation

Owner: Andrew Kam. The project began as a recreation of Barry Smyth's 2021 marathon hitting-the-wall study and expanded into broader marathon pacing research. The public experience should help visitors prepare for a race, choose a marathon, and understand a past result. Research pages follow Answer → Methodology → Visualization, with mobile usability, transparent sample sizes and accessible explanations.

The early 12/26-question planning counts are historical. The current question catalog contains 35 broader questions, of which 33 map to extension packs and two concern missing group/congestion measurements. There are also 12 personalized questions, legacy core packs and the Smyth figures. Do not add those counts together as unique independent studies.

The personalized selector uses course, age band, target 2:30–4:30 with 15-minute presets and whole-minute custom thresholds, optional recorded gender and previous marathon time. The implementation's previous-time filter represents a band of recent recorded bests, not a verified exact last marathon. No silent substitution of another course; cohort broadening must be labeled. User preferences include concise explanations and no invented data.

## Current repository evidence

- Main is merge commit [140e5c66e7a433dfc3c6eab0563ec39845006d3f](https://github.com/koolkam00/htw-live-study/commit/140e5c66e7a433dfc3c6eab0563ec39845006d3f), merging PR #28, the mobile research redesign and personalized analyses.
- [analysis/release.json](../analysis/release.json) still pins `private-export-20260907-1318`.
- Existing extension metadata remains tied to bundle `private-20260907-1318`; current production was not independently re-audited in this documentation task.
- A newer [private-export-20260910-1412](https://github.com/koolkam00/htw-live-study/releases/tag/private-export-20260910-1412) exists. Its notes report 3,580,279 raw and feature rows, 33 cities, 207 race-years and canonical ID equality. These are producer claims, not a new local row-level audit.
- [Run 34490423926](https://github.com/koolkam00/htw-live-study/actions/runs/34490423926) failed at FULL download with “Expected exactly one FULL archive in the release.” Subsequent calculation and upload steps were skipped. The current asset listing contains one matching FULL archive; do not infer the exact historical cause from the current listing.
- The release notes say FULL includes COUNT-DIFF and FEATURE-FIELD-NOTES. The current downloader rejects extra archive members. Treat this as a compatibility risk to inspect separately from the observed failure.
- The release producer also states site publication is gated until Lead verifies. This documentation PR does not perform that verification or publication.

## Ownership recorded in the September 7 handoff

| Role | Responsibility |
| --- | --- |
| New Data Base Lead | Ingestion, live private SQLite, private exports |
| Wall Analyst | Derived features, official packs and live.json dumps |
| Weather Elevation Lead | Weather and course overlays |
| Live Study Sight | Site repository and Vercel publication |
| Outside analysis/Codex agent | Reviewable UI and ext_* analysis work |

These are role labels from the prior handoff, not authenticated identities or permission grants. Repository access does not provide shell access to the ingestion machine.

## What has and has not been verified

September 10 conversation work downloaded the September 9 inspection artifact, checked its SHA-256 and read every table's schema/non-null counts, manifest and aggregate linkage audit. That artifact describes September 7 data. The live database and September 10 archives have not been rescanned in this handoff task. The September 9 UI audit was reported in the conversation; its issues need reproduction against a specified deployment before declaring resolution.

Start the next Codex session by reading these documents, checking the current commit/release/run, explaining the data-to-site chain, and proposing the smallest next change. The first priority is the new export's validation and refresh compatibility, followed by source-level split quality and completeness.

## Evidence preservation

Store enduring aggregate inspection reports and source citations alongside release documentation where compatible; Actions inspection artifacts expire after seven days. The historical artifact was [run 34303613905](https://github.com/koolkam00/htw-live-study/actions/runs/34303613905), artifact 10085831842, SHA-256 `2616228dcca906a4c03cc1c1b4aafdb44f6658d70402bb2ba7af1d64e5f42760`. This PR contains no private rows or archive bytes.
