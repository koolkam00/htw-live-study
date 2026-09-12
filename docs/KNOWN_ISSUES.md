# Known issues and evidence status

Updated September 11, 2026 for `private-export-20260911-1107`. Calculation, import and deployment status is tracked in [the refresh record](REFRESH_20260911_1107.md). Historical failures do not establish that the newest export remains broken.

| Priority/status | Issue | Current evidence | Next action |
| --- | --- | --- | --- |
| Import validated | All extension, personalized and weather outputs refreshed | 1107 inputs verified; all 33 packs, the essential-ten engine and weather rebuilt and imported with matching pins | Track site and production verification in the refresh record |
| P1 | Incomplete, held, selected-field and invalid-grid editions | Ten reviewed editions are excluded; 40,901 rows pass timing checks but fail source-quality inclusion | Producer reconciliation before removing any release-specific exclusion; retain all raw records in the downloadable export |
| P1 | Missing/unparsed and non-increasing checkpoints | 616,424 missing/unparsed and 217,295 non-increasing records; another 4,677 fail timing bounds | Check source semantics, particularly Paris 2014–2018; distinguish incomplete sources from parser defects |
| P1 | Missing exact ages | 2,758,408 raw ages are null | Obtain supported exact ages; never turn age-group labels into invented ages; audit each new cohort's coverage |
| P1 | Incomplete chronology/start provenance | All feature race dates remain null; 235 weather rows provide edition dates, not personal wave starts | Reconcile ambiguous calendar/start records against sources; preserve strictly earlier-year benchmarks |
| P1 | Historical route validity absent | Both validity-range columns are null in all 32 course profiles | Obtain sourced route intervals; continue labeling terrain as a supplied-route proxy |
| P1 | Candidate runner identities are not verified people | Canonical raw/feature alignment is verified; cross-race runner IDs still need ambiguity/conflict checks | Retain candidate-identity terminology and earlier-only recomputation; do not use supplied current-inclusive PB/ability as pre-race inputs |
| P2 | Source metadata defects | Manifest reports itself as 2,286 bytes versus 4,862 actual; obsolete private-data prose contradicts the owner's public policy | Correct future producer metadata; preserve audited immutable input and recorded digests |
| P2 | Legacy live/core outputs retain an older vintage | Extension builders do not generate `live.json` or original S/R/RN/P packs | Keep source labels explicit; obtain producer-generated replacements before refreshing these files |
| Ongoing | Weather decisions can change with new evidence | All three candidates are rerun under the same prespecified gate | Publish only current ready candidates; retain every estimate and withheld decision in the audit |
| Ongoing | Sparse demographic/historical cohorts | More records need not fill every age/gender/prior-time combination | Recompute availability and retain explicit broadening/unavailable states |
| Unknown | Direct ingestion service and hosting operations | Snapshots are accessible; live host schedules and production settings are not directly inspected | Obtain the operational handoff before operating those systems |
| Resolved for newer exports | September 10 packaging/history-schema blockers | September 11 archives have expected members and restored race/name columns | Keep strict archive validation; do not present historical blockers as current failures |
| Historical | September 7 record-ID mismatch | Its CORE/FULL numeric namespaces differ | Preserve its natural-key join; canonical-ID behavior is release-gated |

The producer feature `valid_splits` population (3,326,908) and the site's final analytical population (3,328,159) are different definitions. The former has 1,022,545 sustained-slowdown flags; this does not refresh legacy live/core charts. The latter includes 36,151 timing-valid finishes with other/unrecorded gender. Missing age or recorded gender alone does not exclude a valid finish from the overall cohort.

Held editions are documented in [the release-specific policy](../analysis/source_quality.py) and its output audit. Small size alone is not an exclusion rule. The verified SQLite snapshot passed a read-only integrity check; this does not establish direct access to the running ingestion database or a production restore test.

Historical September 10 [archive](evidence/2026-09-11/archive-members-audit.json), [ID](evidence/2026-09-11/id-contract-audit.json), [timing](evidence/2026-09-11/timing-unit-contract-audit.json) and [failed workflow](https://github.com/koolkam00/htw-live-study/actions/runs/34490423926) evidence remains available. That run failed during archive selection, before extraction; later sidecar/schema findings were separate problems.
