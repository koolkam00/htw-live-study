# Operations runbook

Use [analysis/README.md](../analysis/README.md) for the complete calculation and import contracts. The current full-refresh source is **`private-export-20260911-1107`**; [REFRESH_20260911_1107.md](REFRESH_20260911_1107.md) records what has passed and what is deployed.

## Verify access and source state

1. Read AGENTS.md and PROJECT_HANDOFF.md; record the branch, commit, both analysis pins, relevant Releases/Actions and public `live.json.as_of` separately.
2. Fetch public repository metadata and full-record assets without a token, cookies or an account. Confirm actual bytes and checksums, not only a visible release page. The legacy word `private` in a tag is not an access control.
3. Download immutable CORE and FULL from one exact tag; verify archive/member checksums, schema, units, record/feature alignment, raw counts, overlay dates and source completeness. A successful exporter is not analytical validation.
4. Keep operational credentials out of datasets and logs. Full research records are public and may be stored in or outside the checkout. Prefer durable Release assets for large files.

## Reproduce and audit the current input

Run from the repository root with Python 3.12 and a fresh output directory. Replace `CURRENT_PUBLIC_LIVE_AS_OF` with the actual timestamp of the unchanged historical core context.

```bash
python -m pip install -r analysis/requirements.txt
python analysis/download_release.py --bundle FULL --tag private-export-20260911-1107 --output /path/to/1107-input
python analysis/download_release.py --bundle CORE --tag private-export-20260911-1107 --output /path/to/1107-core
python analysis/inspect_export.py --input /path/to/1107-input --output /path/to/1107-inspection
python analysis/audit_expanded.py --input /path/to/1107-input --output /path/to/1107-inspection
python analysis/audit_release.py --input /path/to/1107-input --core /path/to/1107-core --output /path/to/1107-inspection/release-contract.json
python -m unittest discover -s analysis -p 'test_*.py'
```

Add `--previous /path/to/0336-input` to the release audit to reproduce the raw-record delta. CORE has eight allowed members; FULL adds `features.parquet`. Producer audit notes belong in separate assets. The downloader validates size/SHA-256, rejects unsafe, duplicate or unexpected members and writes provenance. Do not bypass these checks because a prior release had a different archive layout.

Review the release-specific exclusions in `analysis/source_quality.py` before calculation. The policy follows explicit producer/audit evidence for invalid, incomplete, held or selected fields. Apply it after timing eligibility, include its edition counts and hashes in each output, and exclude those editions from earlier benchmarks as well as outcomes. Do not widen exclusions based on small sample size alone or remove usable records merely because age/gender is missing.

## Calculate all owned outputs

```bash
python analysis/build_pacing.py --input /path/to/1107-input --output /path/to/1107-aggregates --live-as-of CURRENT_PUBLIC_LIVE_AS_OF
python analysis/build_extended.py --input /path/to/1107-input --output /path/to/1107-aggregates --personalized-output /path/to/1107-personalized --live-as-of CURRENT_PUBLIC_LIVE_AS_OF
python analysis/write_findings.py --output /path/to/1107-aggregates
python analysis/build_weather.py --input /path/to/1107-input --output /path/to/1107-weather/evidence.json
```

The first two commands produce all 33 registered broad packs. `build_extended.py` also invokes the twelve-path personalized engine, retaining whole-minute targets 90–720. The weather screen is separate: rerun all three fixed candidates with the existing thresholds, retain every decision in its JSON, and let readiness determine which pages exist. A refresh must not freeze old conclusions or loosen the gate to publish a preferred result.

The main workflow produces `pacing-aggregate-packs`, `pacing-personalized-aggregates` and `pacing-export-inspection` for an exact source tag and code commit. The separate weather workflow produces `weather-evidence`. Neither workflow imports data or deploys the site. Inspect source tag, code revision, successful checks and artifacts; do not infer success from release publication. The historical September 10 failed run is not the status of the current 1107 calculations.

## Validate, import and publish

ZIP each output's contents with the registered pack folder at archive root. The broad archive must have all 33 registry entries; the personalized archive must have only `ext_personalized_guide`. Validate both before replacing their owned public folders:

```bash
python analysis/import_packs.py --archive /path/to/pacing-aggregate-packs.zip --expected-export private-20260911-1107 --check-only
python analysis/import_personalized.py --archive /path/to/pacing-personalized-aggregates.zip --expected-export private-20260911-1107 --check-only
python analysis/import_packs.py --archive /path/to/pacing-aggregate-packs.zip --expected-export private-20260911-1107
python analysis/import_personalized.py --archive /path/to/pacing-personalized-aggregates.zip --expected-export private-20260911-1107
npm ci
npm run verify:data
npm run build
```

Review and copy the weather JSON to `public/data/weather/evidence.json` with its exact `analysis/weather-release.json` pin; update `analysis/release.json` with the validated main outputs. The weather file is outside the two ZIP importer contracts. Verify source/script/policy hashes, raw-to-eligible and weather-cohort reconciliation, all candidate gates, dynamic routes, exact source labels and display units. For the current audited release, `calculation_provenance.py` requires the exact reviewed builder and supporting-script hashes before either import; a valid-looking 64-character hash is insufficient. Website data validation repeats these checks on PRs and main. Review the full diff before committing or merging. Verify the deployed source tags and exact commit separately after publication.

Original `live.json` and S/R/RN/P packs remain unchanged historical context; this repository does not contain their complete producer generator. Preserve them until a task supplies and validates that separate pipeline. The source pin alone never certifies a refresh.

## Producer operations and missing information

The live producer database, scheduled ingestion, retries and recovery scripts are external to this checkout. A consistent SQLite snapshot is made through SQLite's backup mechanism or an equivalent supported snapshot; do not blindly copy a changing database or replace ingestion with a downloaded backup. Publish checksummed full-record snapshots with anonymous opening instructions. Public snapshot access does not require exposing the live service or its credentials.

Producer follow-up priorities are complete/reconcile held editions, parse Paris 2014–2018 elapsed formats with source fixtures, document exact-age and missing-field coverage, resolve ambiguous edition dates/start hours and provide historical route validity. See [KNOWN_ISSUES.md](KNOWN_ISSUES.md) and [INGESTION_HANDOFF.md](INGESTION_HANDOFF.md). Never infer missing values to make a cohort larger.

## Report statuses separately

| Status | Required evidence |
| --- | --- |
| Backup saved | Immutable snapshot, timestamp, integrity and checksum |
| Export ready | Synchronized complete CORE/FULL, manifest and schema/ID audit |
| Access verified | Anonymous download of actual full-record bytes, with dated URLs/checksums |
| Analysis passed | Successful calculation and artifacts for exact tag/commit, with exclusions and methods |
| Repository updated | Validated import committed and reviewed |
| Site updated | Authorized deployment verified against exact source labels and commit |

Inspection artifacts retain seven days and main aggregate artifacts thirty days under the existing workflow contract. Preserve durable source files and essential audit reports with Releases; expiring CI artifacts are not a long-term specification.
