# Public export access

Updated September 12, 2026 for **`private-export-20260912-0934`**. Full source records, recorded names, supplied features, overlays and consistent database backups are public research material. Archives are compressed, not encrypted. Public snapshot access does not imply a connection to the running ingestion database.

## Download the audited source

- [0934 release and all assets](https://github.com/koolkam00/htw-live-study/releases/tag/private-export-20260912-0934)
- [CORE archive](https://github.com/koolkam00/htw-live-study/releases/download/private-export-20260912-0934/htw-private-export-CORE-20260912-0934.tar.gz)
- [SQLite snapshot](https://github.com/koolkam00/htw-live-study/releases/download/private-export-20260912-0934/_snapshot_platform_20260912-0934-freeze.sqlite.gz)
- [Standalone features](https://github.com/koolkam00/htw-live-study/releases/download/private-export-20260912-0934/features.parquet)
- [Producer audits](https://github.com/koolkam00/htw-live-study/releases/download/private-export-20260912-0934/audits-20260912-0934-freeze.zip)
- [FULL archive](https://github.com/koolkam00/htw-live-study/releases/download/private-export-20260912-0934/htw-private-export-FULL-20260912-0934.tar.gz)

No account, password or decryption key is required. Standard gzip/tar tools open the archives; DuckDB or PyArrow reads Parquet. FULL includes CORE plus `features.parquet`. The legacy `private` text in tags and filenames is retained for compatibility, not as an access restriction.

Both archives were downloaded and checked against their release sizes and SHA-256 digests. Their eight shared files match byte-for-byte, and FULL contains exactly the expected nine members. The compressed SQLite backup was opened read-only, its database hash matches the manifest, and `PRAGMA integrity_check` returned `ok`. See [the refresh evidence](../docs/REFRESH_20260912_0934.md) for calculation/import/deployment status and the full audit trail.

| Verification | Value |
| --- | --- |
| FULL archive SHA-256 | `cb4e0ab7432010de29755ec5d75ca3b370e64e481eda5b20c44b359f39552204` |
| Manifest SHA-256 | `a6f534d40bac291e0a1bc2eeb70633660acd00a710a090320876736de9c30f4d` |
| SQLite database SHA-256 | `b5da2f6557eec5bf382f291f86c040cf50302cbaa55aa248f076c723f9cd822f` |
| Raw records and features | 4,462,379 each |
| Raw coverage | 34 cities; 256 city/year editions |
| Latest included ingestion | `2026-09-12T10:00:03Z` |
| Manifest creation | `2026-09-12T13:37:16Z` |
| Change from 1107 | 254,923 added; 0 deleted; 0 changed raw records |
| Weather rows | 251 unique city/year editions |
| Course profiles | 32; all historical validity bounds null |

The manifest no longer declares its own size; it is independently hashed. Release/README privacy prose is stale, and the separate ID-CONTRACT and FEATURE-FIELD-NOTES still name the prior snapshot. The feature notes also overstate which history fields are safe as prior inputs. These are recorded source-documentation defects; preserve the immutable bytes and recompute strictly earlier-year benchmarks. Operational credentials remain excluded from research material.

## Record and identity contract

Raw `id` and feature `record_id` are unique, non-null and have identical sets in 0934. Edition labels, recorded names and age agree exactly; comparable cumulative checkpoint and finish timings agree within 1 ms after converting feature minutes to seconds. Raw `X` gender is normalized to null in 552 feature rows. Row order is not a join key.

The current history builder enables canonical IDs for the explicitly reviewed 1107 and 0934 releases, rechecking ID sets/labels before joining and matching all nine section durations plus finish time. Supplied cross-race identities must still pass ambiguity, gender/birth-year and duplicate-edition checks. Eleven names are null; they are not invented. A verified record join does not independently prove that a supplied cross-race identity belongs to one person.

Raw elapsed strings remain authoritative for site timing calculations. Feature `valid_splits` identifies 3,558,154 rows; this is not the website's raw-timing/source-quality cohort of 3,517,336. The complete export retains invalid, missing and excluded rows for audit. Missing ages remain missing (2,893,395 raw null ages); every feature race date is still null. Unique weather-overlay dates supply edition context, not personal start or exact within-year race chronology.

## Reproduce and inspect

```bash
python -m pip install -r analysis/requirements.txt
python analysis/download_release.py --bundle FULL --tag private-export-20260912-0934 --output /path/to/0934-input
python analysis/download_release.py --bundle CORE --tag private-export-20260912-0934 --output /path/to/0934-core
python analysis/inspect_export.py --input /path/to/0934-input --output /path/to/0934-inspection
python analysis/audit_expanded.py --input /path/to/0934-input --output /path/to/0934-inspection
python analysis/audit_release.py --input /path/to/0934-input --core /path/to/0934-core --output /path/to/0934-inspection/release-contract.json
```

Add `--previous /path/to/1107-input` to the last command to reproduce the raw-record delta. Follow [the analysis README](README.md) and [operations](../docs/OPERATIONS.md) for complete calculations and validated imports. Downloading a release does not change either pin, the website or the ingestion database.

## Historical compatibility evidence

The September 11 0336 export repaired the September 10 archive and name/edition-column blockers. Its standalone weather results preceded the complete 1107 refresh. The earlier successful [0336 workflow run](https://github.com/koolkam00/htw-live-study/actions/runs/34560607862) used older personalized target-range code and must not be substituted for a current calculation.

The September 10 export had matching CORE/FULL IDs but extra in-archive sidecars and missing `race`/`runner_name` history columns. Its [failed run](https://github.com/koolkam00/htw-live-study/actions/runs/34490423926) failed during archive selection, before those extraction/schema issues. These are historical findings, not current 1107 blockers. Preserve the [archive](../docs/evidence/2026-09-11/archive-members-audit.json), [ID](../docs/evidence/2026-09-11/id-contract-audit.json) and [timing](../docs/evidence/2026-09-11/timing-unit-contract-audit.json) audit files with their vintage labels.

September 7 CORE had 3,451,055 raw rows versus 3,382,000 feature rows, and its numeric record IDs belong to incompatible namespaces. Reproduce that vintage with the legacy one-to-one edition/name/full-timing join; never apply the 1107 contract retroactively. Its historical linked cohort was 2,366,740 finishes, with 373,955 recent benchmarks and 383,860 cross-year pairs. [Earlier public-access evidence](../docs/evidence/2026-09-11/public-access-audit.json) also retains its original date and counts.
