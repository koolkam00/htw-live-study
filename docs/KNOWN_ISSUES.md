# Known issues and evidence status

As of 2026-09-11. “Open” means this handoff has not established resolution; it does not mean no other agent is working on it.

| Priority | Issue | Evidence/status | Next verification |
| --- | --- | --- | --- |
| Verified | Public source and full-record anonymous downloads | GitHub visibility is public; nine releases and all 21 asset prefixes read without credentials on September 11; see [evidence](evidence/2026-09-11/public-access-audit.json) | Verify every newly published asset anonymously as part of release completion |
| Historical | September 10 export refresh failed | Run 34490423926 remains failed; later September 11 export run 34560607862 succeeded | Preserve the distinction between the old failure and the new release |
| Resolved in newer export | September 10 archives rejected extra members | September 11 FULL was downloaded, checksum-verified and extracted with exactly nine allowed files | Preserve the strict packaging contract |
| Resolved in newer export | September 10 history columns missing | September 11 features restore race and runner_name and preserve canonical IDs; nine names are null | Recheck linkage before a full history refresh; do not invent missing names |
| P1 | Original packs and ten-analysis pin remain September 7 | New warming/wind pages alone use September 11 through a separate pin; original 34 extension directories retain September 7 | Rerun current code before adopting a complete new pack set; old September 11 artifact has obsolete target range |
| P1 | Humidity result inconclusive | Screening interval −0.48 to +1.66 percentage points; no new page | Retain the failed screen; revisit only with new data or a prospectively justified method |
| P1 | Helsinki 2025 weather hour mismatch | observed_at 06:00 versus scheduled start 15:00; excluded by new weather parser | Ask producer to verify actual start/time provenance; no inferred correction |
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
