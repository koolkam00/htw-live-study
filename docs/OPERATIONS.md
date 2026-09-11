# Operations runbook

Use [analysis/README.md](../analysis/README.md) for the full existing contract. This document separates reusable procedures from the dated takeover results in [PROJECT_HANDOFF.md](PROJECT_HANDOFF.md).

## Access and initial verification

1. Open the private koolkam00/htw-live-study repository and read AGENTS.md plus PROJECT_HANDOFF.md.
2. Check the current main commit, analysis/release.json, GitHub Releases, latest relevant Actions run and public live.json as_of. Record each separately.
3. Use authenticated GitHub CLI with private release access for binary downloads, or the existing private Actions workflow. Connector metadata access alone does not establish a local authenticated gh session.
4. Keep inputs and working calculation outputs outside the checkout. Never print credentials or publish raw runner rows.

## Reproduce the pinned export locally

Run from the repository root with Python 3.12, the dependencies in analysis/requirements.txt and authenticated gh. Replace placeholder paths with private directories outside this checkout. Read the actual public live.json timestamp first.

```bash
python -m pip install -r analysis/requirements.txt
python analysis/download_release.py --bundle FULL --output /private/path/pacing-input
python analysis/inspect_export.py --input /private/path/pacing-input --output /private/path/pacing-inspection
python analysis/audit_expanded.py --input /private/path/pacing-input --output /private/path/pacing-inspection
python -m unittest discover -s analysis -p 'test_*.py'
python analysis/build_pacing.py --input /private/path/pacing-input --output /private/path/pacing-aggregates --live-as-of CURRENT_PUBLIC_LIVE_AS_OF
python analysis/build_extended.py --input /private/path/pacing-input --output /private/path/pacing-aggregates --personalized-output /private/path/pacing-personalized --live-as-of CURRENT_PUBLIC_LIVE_AS_OF
python analysis/write_findings.py --output /private/path/pacing-aggregates
```

Download verifies GitHub asset size/SHA-256, rejects unsafe/duplicate/unexpected members and writes provenance.json. CORE requires exactly eight named files; FULL adds features.parquet. OUTSIDE-AGENT-PASTE-BRIEF.md is an optional separate release asset. Extra sidecars inside either archive require an explicitly reviewed consumer change. The September 10 archives have verified extra members and therefore fail this current downloader; the commands above reproduce the September 7 pin, not the newer export.

## Adopt a newer export

- Confirm all intended assets exist before publishing a release. Validate the schema, ID contract, per-table row counts, units, timestamps, checksums and exclusions.
- Pass `--tag private-export-YYYYMMDD-HHMM` to the downloader or the workflow release_tag input after compatibility checks. Do not merely edit the pin and assume validity.
- Run the full inspection and calculation against that vintage. Compare raw/features/eligible/linked counts and source coverage with the previous release.
- The existing Private marathon pacing analysis workflow handles published private-export-* releases, relevant same-repository PR changes and manual invocation. htw-db-* releases are skipped.
- Check successful completion and correct source commit/tag for all three relevant artifacts: pacing-aggregate-packs, pacing-personalized-aggregates and pacing-export-inspection.
- The latest relevant September 10 refresh is still failed run 34490423926, with no retry found during the September 11 inspection. Its archive-selection failure did not calculate outputs. The current listing has one FULL archive, but a separate audit verified extra archive members and missing feature columns expected by the consumer. Resolve both compatibility problems before rerunning; do not attribute the historical failure to them. See [known issues](KNOWN_ISSUES.md).

## Import verified aggregates

The following example intentionally names the old verified bundle. Substitute a new bundle only after validating it.

```bash
python analysis/import_packs.py --archive /path/to/pacing-aggregate-packs.zip --expected-export private-20260907-1318
python analysis/import_personalized.py --archive /path/to/pacing-personalized-aggregates.zip --expected-export private-20260907-1318
npm ci
npm run verify:data
npm run build
```

The first importer requires the complete 33-pack registry and owns its ext_* directories; the second owns only ext_personalized_guide. They are separate artifact contracts. Review the exact public file diff and provenance. Submit intended aggregate changes and a reviewed analysis/release.json pin update through a PR. Retain historical core-pack ownership. Merge/publication requires the task's authorization and the producer's stated validation gate.

## Producer operations outside this repository

The producer documents ongoing ingestion into platform.sqlite; the live process was not inspected here. Consistent SQLite backup and integrity checks are documented in earlier release notes; do not copy a changing SQLite file blindly or replace live ingestion with a downloaded backup. Private Releases retain full-record backups and exports. These files are compressed, not encrypted, and must not enter public website assets. Producer scripts, schedules, retries, recovery procedures and credentials are not available in this checkout. Obtain the [ingestion handoff](INGESTION_HANDOFF.md) before operating that environment.

## Report statuses separately

| Status | Evidence required |
| --- | --- |
| Backup saved | Immutable private backup asset, timestamp, integrity/checksum |
| Export ready | Complete verified synchronized CORE/FULL and manifest |
| Analysis passed | Successful run and aggregate artifacts for exact tag/commit |
| Repository updated | Validated import committed and reviewed |
| Site updated | Authorized deployment verified with matching public metadata |

Inspection artifacts retain seven days; aggregates retain thirty days in current workflows. Preserve necessary non-row audit evidence durably with the release. Do not rely on an expiring artifact as the sole long-term specification.
