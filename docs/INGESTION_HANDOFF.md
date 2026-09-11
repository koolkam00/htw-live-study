# Ingestion agent handoff

This is the requested producer handoff from the conversation, updated for the September 10 release. It is a work specification, not a claim the actions have been completed. Coordinate with New Data Base Lead, Wall Analyst, Weather Elevation Lead and the site owner according to existing responsibilities.

## What is already reported

The September 10 release reports synchronized raw/features (3,580,279 each), 33 cities, 207 race-years, 2,807,231 valid_splits and matching canonical record IDs. Separate assets now include ID-CONTRACT.md, NOTES.md, source exclusion reports, checkpoint_null_matrix.csv, _audit_totals.json and checksums. This task verified their listing, not their contents. Avoid repeating the earlier request as if these assets did not exist.

The consumer failed at selecting a FULL asset during the release-triggered run. One matching FULL asset is listed now. Confirm upload completion/timing and archive compatibility. Do not declare the site refreshed.

## Next producer deliverables, in order

1. **Complete export contract.** Supply snapshot identifier/time, schema version, exact asset inventory, checksums, table counts and raw/features reconciliation. Verify that archived files match consumer expectations. Keep additional reports as separate release assets unless the consumer is updated.
2. **Validated canonical IDs.** Demonstrate uniqueness and 1:1 referential integrity between raw and features, plus matching edition and source-result identity. Preserve a documented mapping for old IDs. Distinguish race-result IDs from uncertain cross-race runner identities. Preserve ambiguity and linkage versioning.
3. **Split exclusion diagnosis.** Reconcile raw, deduplicated, parsed, strictly increasing and eligible totals by edition/source/checkpoint. Inspect cumulative-versus-segment timing, units, column shifts and missing pages. Old raw 20 km is null in 404,815 rows. Preserve original values and correction provenance; never interpolate into measured data.
4. **Edition completeness.** Report official finishers when available, ingested unique results, full valid splits, exact age, published age bands, gender coverage, pending/error counts and source URLs. Mark full-field, partial, elite-only and unknown. A finished scrape is not proof of complete coverage. Recheck Tokyo/Melbourne/Hamburg and incomplete major-marathon editions.
5. **Dates and measurements.** Populate sourced race dates, local start/timezone and stable edition keys. Preserve exact age separately from age group. Capture measured halfway, chip/gun times, start offsets, waves/corrals and finish/DNF/DNS status when supplied; retain missing values where unavailable.
6. **History and overlays.** Document pre-race versus retrospective features and prevent current/future outcomes from entering prior ability. Coordinate sourced course validity and missing weather editions. Do not backfill all historical races with an unverified modern route; describe modeled weather and exposure timing.
7. **Safe backup and publication.** Use consistent SQLite snapshots and integrity checks, retain immutable versions and change logs, and preserve raw/private boundaries. Earlier releases document malformed-image recovery; verify current backup and restoration procedures rather than assuming they are safe.
8. **Close the refresh loop.** Report backup saved, export ready, analysis passed, repository updated and site updated separately. Publish complete release assets before triggering consumers. Respect the producer's Lead-verification gate and the site owner's publishing responsibilities.

## Operational details still needed from the ingestion agent

| Requested fact | Why it matters |
| --- | --- |
| Scraper/ingestion repository, branch and commit | Reproduce source transformations; the site repo does not contain the producer |
| Host/workspace and authoritative database paths | Distinguish live database from snapshot/export copies |
| Source registry definitions and stable IDs | Reconcile repeated ingestion and revisions |
| Scheduler/job commands, concurrency and write ownership | Understand ongoing ingestion and SQLite contention |
| Retry, pagination and watermark semantics | Distinguish complete from pending/failed editions |
| Deduplication and correction policy | Prevent duplicate or silently overwritten results |
| Backup method, retention, integrity and restore drill | Recover safely without overwriting active ingestion |
| Feature generation command/version and cutoff | Guarantee synchronized exports and prior-only fields |
| Overlay update workflow and historical validity | Prevent false course/weather joins |
| Access provisioning procedure | Grant legitimate access without placing credentials in docs |

## Acceptance evidence

Return a concise release map with exact tags/assets/timestamps; machine-readable schemas and definitions/units; source-level counts and exclusion reconciliation; ID integrity results; any unresolved missing measurements; a compatibility check against analysis/download_release.py; and the exact successful consumer run if one exists. If any item is unavailable, label it unknown and identify its owner. Do not invent ingestion details from website code.
