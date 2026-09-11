# Known issues and evidence status

As of 2026-09-11. “Open” means this handoff has not established resolution; it does not mean no other agent is working on it.

| Priority | Issue | Evidence/status | Next verification |
| --- | --- | --- | --- |
| P0 | September 10 export refresh failed | Latest relevant Actions run remains 34490423926; no retry found at September 11 inspection; archive-selection failure skipped downstream steps | Resolve current compatibility problems, then rerun only in an authorized implementation task |
| P0 | Current CORE and FULL archives fail downloader | Verified archive bytes: CORE adds ID-CONTRACT.md/SHA256SUMS.txt; FULL also adds FEATURE-FIELD-NOTES.md/COUNT-DIFF.md, with FEATURE-FIELD-NOTES.md the first rejected member | Request a new compatible producer archive with audit sidecars as separate assets; preserve strict extraction safety checks |
| P0 | September 10 feature schema breaks current history builder | 138 columns; race, runner_name and split_mode_in absent; current code uses name/edition for the September 7 natural join | Request restored name/edition columns in the next export, or agree a validated release-specific adapter; retain old-data semantics |
| P0 | Source pin and published calculations still September 7 | All 34 extension directories remain September 7; 401 public aggregate files matched production before presentation changes | Adopt new vintage only after successful inspection/calculation/import; do not equate local copy edits with deployment |
| Historical | CORE/FULL ID mismatch in September 7 | Old IDs remain incompatible; September 10 has verified unique, non-null matching sets, city/year/age agreement and matching comparable timings | Keep per-release semantics; never join by row order or apply the fix retroactively |
| P1 | Missing/unparsed and non-increasing splits | Old foundation cohort: 489,593 and 217,245 excluded | Read new source/checkpoint audit assets; distinguish source gaps from parser errors |
| P1 | Incomplete/biased edition coverage | Historical user-provided September 9 site audit | Compare source populations, official totals and full-field/elite-only flags |
| P1 | Exact-age coverage and selector behavior | Current guide exact-age coverage 29.9%; 21 of 30 selections have no published age-specific cohort, confirmed from current aggregate shards | Reproduce per-course controls and label fallback/availability |
| P1 | Feature chronology still missing | All feature race_date values null in September 10; 207 weather-overlay dates populated | Obtain stable edition keys and verified dates; avoid assuming year is full chronology |
| P1 | Historical route validity missing | Both validity columns remain entirely null in September 10's 32 course profiles | Obtain sourced validity intervals; retain proxy labels meanwhile |
| P1 | Pre-race PB/ability leakage | Old supplied fields can include current result | Keep recomputed prior-only features; validate new definitions |
| P2 | Mixed sustained-slowdown denominators | Historical audit flags repeaters versus all finishers | Label cohorts and reconcile each chart with its own source |
| P2 | Opening-versus-target interpretation | Historical audit requests clearer explanation | Separate benchmark opening, achieved finish bands and user-selected targets |
| P2 | Sparse courses presented as equal coverage | Current guide still has Tokyo 353 and Melbourne 416 eligible results; Hamburg women flagged missing historically | Recheck source populations and suppress/label inadequate comparisons |
| P2 | Smaller UI issues | Historical audit: negative zero, long course list, wide tables, checkpoint validation stacking, cache/performance and snapshot disclosure | Reproduce against a named build; record fixes individually |
| Updated in branch | Root README and product terminology | README now documents the expanded Marathon Pacing Study; sustained-slowdown measure and source citation are retained | Verify the built presentation; no deployment implied |
| Unknown | Live ingestion operations / production configuration | No direct inspection of ingestion host or hosting settings | Request producer operational handoff and verify hosting separately |

The historical audit used emulated mobile widths 360/390/430, tablet 768 and desktop 1280. It did not test physical phones, iOS Safari, Android Chrome, screen readers or real cellular networks. Its “small invited audience, not broad public share” verdict is historical, not a new deployment certification.

## Specific evidence links

- [Failed September 10 run](https://github.com/koolkam00/htw-live-study/actions/runs/34490423926)
- [September 10 release](https://github.com/koolkam00/htw-live-study/releases/tag/private-export-20260910-1412)
- [Current archive member audit](evidence/2026-09-11/archive-members-audit.json)
- [Current ID and coverage audit](evidence/2026-09-11/id-contract-audit.json)
- [Current timing/units audit](evidence/2026-09-11/timing-unit-contract-audit.json)
- [Old audited access](../analysis/ACCESS.md)
- [Foundation cohort](../public/data/packs/ext_pacing_shapes/pack_meta.json)
- [Current downloader contract](../analysis/download_release.py)

Do not attribute the observed failed run to archive sidecars: it failed before archive extraction. These are two separate findings.
