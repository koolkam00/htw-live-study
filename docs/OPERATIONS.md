# Operations runbook

Use [analysis/README.md](../analysis/README.md) for the full existing contract. This document separates reusable procedures from the dated takeover results in [PROJECT_HANDOFF.md](PROJECT_HANDOFF.md).

## Access and initial verification

1. Open the koolkam00/htw-live-study repository and read AGENTS.md plus PROJECT_HANDOFF.md. The current policy requires public source and complete datasets; verify actual access separately.
2. Check the current main commit, analysis/release.json, GitHub Releases, latest relevant Actions run and public live.json as_of. Record each separately.
3. Test repository, release metadata and direct asset downloads without cookies, tokens or an account. Use anonymous HTTPS for public binary downloads. Record redirects/status and confirm the returned bytes, not just a visible release page. Legacy names containing `private` do not imply authentication is required.
4. Publish full runner records and snapshots as ordinary unencrypted Parquet/SQLite files with schemas and checksums. Prefer Release assets for large binaries; working inputs may be inside or outside the checkout. Keep operational credentials out of files and logs because they are not dataset contents.

## Reproduce the pinned export locally

Run from the repository root with Python 3.12 and the dependencies in analysis/requirements.txt. Public downloads must not require GitHub authentication. The example uses a local working directory; another location is optional, not a privacy requirement. Read the actual public live.json timestamp first.

```bash
python -m pip install -r analysis/requirements.txt
python analysis/download_release.py --bundle FULL --output ./data-work/pacing-input
python analysis/inspect_export.py --input ./data-work/pacing-input --output ./data-work/pacing-inspection
python analysis/audit_expanded.py --input ./data-work/pacing-input --output ./data-work/pacing-inspection
python -m unittest discover -s analysis -p 'test_*.py'
python analysis/build_pacing.py --input ./data-work/pacing-input --output ./data-work/pacing-aggregates --live-as-of CURRENT_PUBLIC_LIVE_AS_OF
python analysis/build_extended.py --input ./data-work/pacing-input --output ./data-work/pacing-aggregates --personalized-output ./data-work/pacing-personalized --live-as-of CURRENT_PUBLIC_LIVE_AS_OF
python analysis/write_findings.py --output ./data-work/pacing-aggregates
```

Download verifies GitHub asset size/SHA-256, rejects unsafe/duplicate/unexpected members and writes provenance.json. CORE requires exactly eight named files; FULL adds features.parquet. OUTSIDE-AGENT-PASTE-BRIEF.md is an optional separate release asset. Extra sidecars inside either archive require an explicitly reviewed consumer change. The September 10 archives have verified extra members and therefore fail this current downloader; the commands above reproduce the September 7 pin, not the newer export.

## Adopt a newer export

- Confirm all intended assets exist before publishing a release. Validate the schema, ID contract, per-table row counts, units, timestamps, checksums and exclusions.
- Pass `--tag private-export-YYYYMMDD-HHMM` to the downloader or the workflow release_tag input after compatibility checks. Do not merely edit the pin and assume validity.
- Run the full inspection and calculation against that vintage. Compare raw/features/eligible/linked counts and source coverage with the previous release.
- The analysis workflow (historically named “Private marathon pacing analysis”) handles published private-export-* releases, relevant PR changes (including forks, subject to GitHub workflow approval) and manual invocation. htw-db-* releases are skipped.
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

The first importer requires the complete 33-pack registry and owns its ext_* directories; the second owns only ext_personalized_guide. They are separate artifact contracts. Review the exact public file diff and provenance. Submit intended aggregate changes and a reviewed analysis/release.json pin update through a PR. Retain historical core-pack ownership. The historical private-data publication gate is superseded by the public-access policy. Keep repository review and numerical validation to establish analytical correctness; they do not limit access to the full source records.

## Producer operations outside this repository

The producer documents ongoing ingestion into platform.sqlite; the live process was not inspected here. Consistent SQLite backup and integrity checks are documented in earlier release notes; do not copy a changing SQLite file blindly or replace live ingestion with a downloaded backup. Publish full-record backups and exports with anonymous Release download links. Ordinary Parquet/SQLite files and optional gzip compression require no decryption key. Public availability of a snapshot does not require exposing the live service or its credentials. Producer scripts, schedules, retries, recovery procedures and credentials are not available in this checkout. Obtain the [ingestion handoff](INGESTION_HANDOFF.md) before operating that environment.

## Report statuses separately

| Status | Evidence required |
| --- | --- |
| Backup saved | Immutable full-record backup asset, timestamp, integrity/checksum |
| Export ready | Complete verified synchronized CORE/FULL and manifest |
| Anonymous access verified | Repository and full-record assets fetched without account, token or cookies; record dated URLs and byte/checksum checks |
| Analysis passed | Successful run and aggregate artifacts for exact tag/commit |
| Repository updated | Validated import committed and reviewed |
| Site updated | Authorized deployment verified with matching public metadata |

Inspection artifacts retain seven days; aggregates retain thirty days in current workflows. Preserve necessary audit evidence, full source files and opening instructions durably with the release. Do not rely on an expiring artifact as the sole long-term specification.
