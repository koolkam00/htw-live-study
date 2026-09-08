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
  cohorts or join by row order.
- `features.race_date` is empty throughout. Existing weather-overlay dates may
  provide chronology where the city/year join is unique and dates are verified.
- Validate historical-feature definitions and temporal ordering before treating
  them as prior ability. A populated field alone does not establish that it uses
  only performances before the race being analyzed.
- Actual halfway timestamps, gun/chip offsets, waves and corrals are not columns
  in these exports. Derived half-pace fields do not establish measured half splits.
- Course validity years are absent. Historical route matching remains unverified.
- This is export access, not a direct connection to the scraper's live database.
  Newly scraped rows become available when included in another release.

No further repository invitation is needed. Unfinished analyses should distinguish
uncomputed results and validation work from genuinely missing measurements.
