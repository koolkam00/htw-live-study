# Public export access

Updated September 11, 2026 for **`private-export-20260911-1107`**. Full source records, recorded names, supplied features, overlays and consistent database backups are public research material. Archives are compressed, not encrypted. Public snapshot access does not imply a connection to the running ingestion database.

## Download the audited source

- [1107 release and all assets](https://github.com/koolkam00/htw-live-study/releases/tag/private-export-20260911-1107)
- [CORE archive](https://github.com/koolkam00/htw-live-study/releases/download/private-export-20260911-1107/htw-private-export-CORE-20260911-1107.tar.gz)
- [FULL archive](https://github.com/koolkam00/htw-live-study/releases/download/private-export-20260911-1107/htw-private-export-FULL-20260911-1107.tar.gz)

No account, password or decryption key is required. Standard gzip/tar tools open the archives; DuckDB or PyArrow reads Parquet. FULL includes CORE plus `features.parquet`. The legacy `private` text in tags and filenames is retained for compatibility, not as an access restriction.

Both archives were downloaded and checked against their release sizes and SHA-256 digests. Their eight shared files match byte-for-byte, and FULL contains exactly the expected nine members. The compressed SQLite backup was opened read-only, its database hash matches the manifest, and `PRAGMA integrity_check` returned `ok`. See [the refresh evidence](../docs/REFRESH_20260911_1107.md) for calculation/import/deployment status and the full audit trail.

| Verification | Value |
| --- | --- |
| FULL archive SHA-256 | `ffe901857c2603ac4305d9376a194eed171052d9835223c8ba5b19b59067a656` |
| Manifest SHA-256 | `4aa3d330cb567ea02aa8c78d0f02015ac0fec35f3c8000215fbc8933ede398e2` |
| SQLite database SHA-256 | `795595ad61e61cae58b3e3d7722cbfa7c74fa1c36da863006fb7645e6a6c7e0d` |
| Raw records and features | 4,207,456 each |
| Raw coverage | 34 cities; 240 city/year editions |
| Latest included ingestion | `2026-09-11T15:04:44Z` |
| Manifest creation | `2026-09-11T15:10:45Z` |
| Change from 0336 | 228,796 added; 0 deleted; 0 changed raw records |
| Weather rows | 235 unique city/year editions |
| Course profiles | 32; all historical validity bounds null |

The manifest still carries obsolete private-data prose and reports its own size as 2,286 bytes although its verified size is 4,862. These are recorded metadata defects, not encryption or a reason to alter the immutable input. Operational credentials remain excluded from research material.

## Record and identity contract

Raw `id` and feature `record_id` are unique, non-null and have identical sets in 1107. Edition labels, recorded names and age agree exactly; comparable cumulative checkpoint and finish timings agree within 1 ms after converting feature minutes to seconds. Raw `X` gender is normalized to null in 552 feature rows. Row order is not a join key.

The current history builder enables canonical IDs only for the explicitly reviewed 1107 release, rechecking ID sets/labels before joining and matching all nine section durations plus finish time. Supplied cross-race identities must still pass ambiguity, gender/birth-year and duplicate-edition checks. Nine names are null; they are not invented. A verified record join does not independently prove that a supplied cross-race identity belongs to one person.

Raw elapsed strings remain authoritative for site timing calculations. Feature `valid_splits` identifies 3,326,908 rows; this is not the website's raw-timing/source-quality cohort of 3,328,159. The complete export retains invalid, missing and excluded rows for audit. Missing ages remain missing (2,758,408 raw null ages); every feature race date is still null. Unique weather-overlay dates supply edition context, not personal start or exact within-year race chronology.

## Reproduce and inspect

```bash
python -m pip install -r analysis/requirements.txt
python analysis/download_release.py --bundle FULL --tag private-export-20260911-1107 --output /path/to/1107-input
python analysis/download_release.py --bundle CORE --tag private-export-20260911-1107 --output /path/to/1107-core
python analysis/inspect_export.py --input /path/to/1107-input --output /path/to/1107-inspection
python analysis/audit_expanded.py --input /path/to/1107-input --output /path/to/1107-inspection
python analysis/audit_release.py --input /path/to/1107-input --core /path/to/1107-core --output /path/to/1107-inspection/release-contract.json
```

Add `--previous /path/to/0336-input` to the last command to reproduce the raw-record delta. Follow [the analysis README](README.md) and [operations](../docs/OPERATIONS.md) for complete calculations and validated imports. Downloading a release does not change either pin, the website or the ingestion database.

## Historical compatibility evidence

The September 11 0336 export repaired the September 10 archive and name/edition-column blockers. Its standalone weather results preceded the complete 1107 refresh. The earlier successful [0336 workflow run](https://github.com/koolkam00/htw-live-study/actions/runs/34560607862) used older personalized target-range code and must not be substituted for a current calculation.

The September 10 export had matching CORE/FULL IDs but extra in-archive sidecars and missing `race`/`runner_name` history columns. Its [failed run](https://github.com/koolkam00/htw-live-study/actions/runs/34490423926) failed during archive selection, before those extraction/schema issues. These are historical findings, not current 1107 blockers. Preserve the [archive](../docs/evidence/2026-09-11/archive-members-audit.json), [ID](../docs/evidence/2026-09-11/id-contract-audit.json) and [timing](../docs/evidence/2026-09-11/timing-unit-contract-audit.json) audit files with their vintage labels.

September 7 CORE had 3,451,055 raw rows versus 3,382,000 feature rows, and its numeric record IDs belong to incompatible namespaces. Reproduce that vintage with the legacy one-to-one edition/name/full-timing join; never apply the 1107 contract retroactively. Its historical linked cohort was 2,366,740 finishes, with 373,955 recent benchmarks and 383,860 cross-year pairs. [Earlier public-access evidence](../docs/evidence/2026-09-11/public-access-audit.json) also retains its original date and counts.
