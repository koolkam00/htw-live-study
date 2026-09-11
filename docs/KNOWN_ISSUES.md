# Known issues and evidence status

As of 2026-09-11. “Open” means this handoff has not established resolution; it does not mean no other agent is working on it.

| Priority | Issue | Evidence/status | Next verification |
| --- | --- | --- | --- |
| P0 | September 10 export refresh failed | Verified Actions run 34490423926: expected exactly one FULL archive; downstream steps skipped | Inspect current completed assets and rerun only in an authorized implementation task |
| P0 | Possible unexpected members in new FULL | Producer notes mention COUNT-DIFF/FEATURE-FIELD-NOTES; downloader allowlist excludes them; archive bytes not inspected here | List actual archive members; move sidecars or review consumer compatibility |
| P0 | Source pin and checked-in packs still September 7 | Verified release.json and pack metadata at handoff commit | Adopt new vintage only after successful audit/calculation/import |
| P1 | CORE/FULL ID mismatch in September 7 | Audited; numeric IDs cannot join | New release claims corrected IDs; verify before marking fixed |
| P1 | Missing/unparsed and non-increasing splits | Old foundation cohort: 489,593 and 217,245 excluded | Read new source/checkpoint audit assets; distinguish source gaps from parser errors |
| P1 | Incomplete/biased edition coverage | Historical user-provided September 9 site audit | Compare source populations, official totals and full-field/elite-only flags |
| P1 | Exact-age coverage and selector behavior | Old raw age ~31%; historical audit reports inert age choice on 21/30 courses | Reproduce per-course controls and label fallback/availability |
| P1 | Chronology missing in old FULL | All feature race_date null in old scan | Verify new dates/edition keys; avoid assuming year is full chronology |
| P1 | Historical route validity missing | Existing validity columns all null in old scan | Obtain sourced validity intervals; retain proxy labels meanwhile |
| P1 | Pre-race PB/ability leakage | Old supplied fields can include current result | Keep recomputed prior-only features; validate new definitions |
| P2 | Mixed HTW denominators | Historical audit flags repeaters versus all finishers | Label cohorts and reconcile each chart with its own source |
| P2 | Opening-versus-target interpretation | Historical audit requests clearer explanation | Separate benchmark opening, achieved finish bands and user-selected targets |
| P2 | Sparse courses presented as equal coverage | Old guide has Tokyo 353 and Melbourne 416 eligible results; Hamburg women flagged missing historically | Recheck latest export and suppress/label inadequate comparisons |
| P2 | Smaller UI issues | Historical audit: negative zero, long course list, wide tables, checkpoint validation stacking, cache/performance and snapshot disclosure | Reproduce against a named build; record fixes individually |
| P2 | Root README scope stale | Describes original single-JSON site | Use expanded docs; update root README separately if desired |
| Unknown | Live ingestion operations / production configuration | No direct inspection of ingestion host or hosting settings | Request producer operational handoff and verify hosting separately |

The historical audit used emulated mobile widths 360/390/430, tablet 768 and desktop 1280. It did not test physical phones, iOS Safari, Android Chrome, screen readers or real cellular networks. Its “small invited audience, not broad public share” verdict is historical, not a new deployment certification.

## Specific evidence links

- [Failed September 10 run](https://github.com/koolkam00/htw-live-study/actions/runs/34490423926)
- [New release producer claims](https://github.com/koolkam00/htw-live-study/releases/tag/private-export-20260910-1412)
- [Old audited access](../analysis/ACCESS.md)
- [Foundation cohort](../public/data/packs/ext_pacing_shapes/pack_meta.json)
- [Current downloader contract](../analysis/download_release.py)

Do not attribute the observed failed run to archive sidecars: it failed before archive extraction. These are two separate findings.
