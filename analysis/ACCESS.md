# Verified private export access

Updated September 11, 2026. This records export access, not a direct connection to the live ingestion database. Full runner records remain in private GitHub Releases and outside the website checkout. Archives are compressed, not encrypted. Only aggregate audit evidence is stored with these documents.

## September 10: directly audited export, not yet calculated

Source: `private-export-20260910-1412`. Both CORE and FULL were downloaded outside the checkout and verified against release asset size and SHA-256. Shared CORE files have identical member hashes inside FULL.

| File | Rows | Current observation |
| --- | ---: | --- |
| `race_records.parquet` | 3,580,279 | 20 columns; unique, non-null canonical IDs |
| `features.parquet` | 3,580,279 | 138 columns; unique, non-null matching record-ID set |
| `race_conditions.parquet` | 207 | All supplied race dates populated |
| `course_profiles.parquet` | 32 | Both historical validity fields entirely null |
| `course_segments.parquet` | 288 | Supplied course sections |
| `sources.parquet` | 378 | 148 populated `last_ingested` values |

The two ID sets match exactly; their row order does not. City, year and age agree on the ID join. Sex agrees except for 552 raw `X` values normalized to null in features. After converting feature minutes to seconds, all comparable cumulative checkpoint/finish timings agree within 1 ms. All 2,807,231 feature-valid rows have nine matching checkpoints. This verifies record alignment for this release, not cross-race identity accuracy.

The feature schema no longer contains `race`, `runner_name` or `split_mode_in`. Every feature `race_date` is still null. Supplied runner IDs cover 2,994,501 rows and 2,366,070 distinct IDs, of which 396,353 repeat; 18,561 rows are marked ambiguous. Do not infer exact chronology or verified human identities from these fields.

The ID fix is verified, but refresh compatibility is unresolved:

- CORE contains two additional members rejected by the current downloader: `ID-CONTRACT.md` and `SHA256SUMS.txt`.
- FULL also contains `FEATURE-FIELD-NOTES.md` and `COUNT-DIFF.md`; its first rejected member is `FEATURE-FIELD-NOTES.md`.
- `build_extended.py` still expects feature `race` and `runner_name` for its September 7 natural-key join. Request a new compatible export restoring those columns and moving audit sidecars outside the tarballs, as specified in the [producer handoff](../docs/INGESTION_HANDOFF.md). An intentional schema change instead requires a validated version-specific consumer adapter.
- The latest relevant Actions refresh remained failed run 34490423926, with no retry found at inspection. Its earlier archive-selection failure is separate from these current extraction/schema incompatibilities.

The release pin and all checked-in extension results remain September 7. All 401 public aggregate files matched production before this branch's later presentation changes. September 10 has not supplied a new validated aggregate refresh.

Evidence: [archive member hashes](../docs/evidence/2026-09-11/archive-members-audit.json), [ID/coverage audit](../docs/evidence/2026-09-11/id-contract-audit.json), [timing/units audit](../docs/evidence/2026-09-11/timing-unit-contract-audit.json), [sex normalization](../docs/evidence/2026-09-11/sex-normalization-audit.json).

## September 7: historical input for checked-in calculations

Source: `private-20260907-1318`, created September 7, 2026. All observations below describe that vintage.

Both CORE and FULL were downloaded and SHA-256 verified inside the repository's
private analysis environment. Every Parquet table and column was scanned. The
GitHub connector's lack of direct release-binary download support does not limit
queries in that environment. Individual rows and names are not published.

| File | Rows | Columns |
| --- | ---: | ---: |
| `race_records.parquet` | 3,451,055 | 20 |
| `features.parquet` | 3,382,000 | 142 |
| `race_conditions.parquet` | 185 | 25 |
| `course_profiles.parquet` | 32 | 21 |
| `course_segments.parquet` | 288 | 20 |
| `sources.parquet` | 376 | 14 |

`MANIFEST.json`, `README.md`, and the release brief were also read.
`races_summary.json` is present in both verified archives.

FULL supplies `runner_id`, `match_key`, `is_ambiguous`, `is_repeater`, race order,
PB fields, ability, normalized segments, cumulative checkpoints, rankings,
pace changes, and follow-up outcome features. Runner IDs are populated for
2,826,696 rows, representing 2,242,270 distinct supplied IDs; 372,916 IDs appear
on more than one row. These are supplied identifiers, not independently verified
unique people.

The remaining limits concern data and definitions:

- FULL has 69,055 fewer feature rows than raw CORE records; do not assume identical
  cohorts or join by row order. Its record IDs are a different namespace: only
  five apparent numeric-ID joins had agreeing runner names. Never use numeric
  record IDs to join the exports.
- `features.race_date` is empty throughout. Existing weather-overlay dates may
  provide chronology where the city/year join is unique and dates are verified.
- Supplied PB/ability fields include current-race information for many rows and
  are not used as pre-race covariates. The new analysis recomputes benchmarks from
  strictly earlier calendar years, and date-based intervals from complete,
  unique supplied calendar coverage.
- Actual halfway timestamps, gun/chip offsets, waves and corrals are not columns
  in these exports. Derived half-pace fields do not establish measured half splits.
- Course validity years are absent. Historical route matching remains unverified.
- This is export access, not a direct connection to the scraper's live database.
  Newly scraped rows become available when included in another release.

No further repository invitation was needed for this export inspection. Unfinished analyses should distinguish
uncomputed results and validation work from genuinely missing measurements.

### Executed September 7 linkage audit

The full-split natural join produced 2,366,742 candidate rows. Two ambiguous
cross-export candidates were excluded, leaving **2,366,740** eligible linked
finishes. **373,955** have a recent strictly-earlier-year benchmark; **383,860**
consecutive cross-year pairs pass the endpoint-year requirements. These are
performances/pairs, not unique people, and supplied identities are not independently
verified. **2,143,118** linked finishes have a supplied race date.

Weather notes identify Open-Meteo archive values nearest the scheduled local start.
All 185 supplied weather dates parse and agree with their record year. Most GPX
profiles describe 2024–2026 routes and lack historical validity ranges. Every raw
time used in the new calculations is reparsed from CORE; FULL segment units were
confirmed as minutes and section sums reconcile to supplied finish times.
