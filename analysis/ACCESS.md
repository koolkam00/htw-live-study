# Verified private export access

Source: `private-20260907-1318`, created September 7, 2026.

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

No further repository invitation is needed. Unfinished analyses should distinguish
uncomputed results and validation work from genuinely missing measurements.

## Executed linkage audit

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
