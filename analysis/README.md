# Marathon pacing analyses

This pipeline reads the private CORE Parquet export and produces eight aggregate
analysis packs. It does not scrape races, change the database, overwrite core
packs, link runner identities, or publish individual records.

## Access and refresh

The private source is a GitHub Release in `koolkam00/htw-live-study`.
`release.json` pins the default release for reproducibility.

The **Private marathon pacing analysis** workflow downloads and verifies CORE,
runs the calculations privately, and returns `pacing-aggregate-packs` containing
only JSON and CSV aggregates. The workflow has read-only repository permission.
It does not upload CORE or runner records to Actions artifacts.

After this workflow is merged into the default branch, publishing a new
`private-export-*` release triggers a recalculation. It can also be run manually
with a release tag. Changes to `analysis/` in same-repository PRs run against the
pinned release. No schedule, scraping job, automatic merge, or production update
is created.

To update the site after a successful run:

1. Download the `pacing-aggregate-packs` artifact ZIP from the successful run.
2. Confirm the run used the intended release and analysis commit.
3. Validate and import the ZIP, specifying its bundle ID:

   ```bash
   python analysis/import_packs.py --archive /path/to/pacing-aggregate-packs.zip --expected-export private-20260907-1318
   npm run verify:data
   npm run build
   ```

4. Review and commit only the resulting `public/data/packs/ext_*` changes to a PR.
   Andrew or the site owner merges it for Vercel publication. Updating
   `analysis/release.json` keeps subsequent PR checks on the new release.

For an analyst with an authenticated GitHub CLI, the same computation runs
locally. Use Python 3.12 and an input directory outside this checkout:

```bash
python -m pip install -r analysis/requirements.txt
python analysis/download_release.py --output /private/path/pacing-input
python analysis/build_pacing.py --input /private/path/pacing-input --output /private/path/pacing-aggregates --live-as-of CURRENT_PUBLIC_LIVE_AS_OF
```

Fetch `https://htw-live-study.vercel.app/data/live.json` first and use its actual
`as_of`. CORE is verified against the release asset's size and SHA-256 digest.
The full archive is not needed for these eight calculations.

## Inspecting the additional FULL data

`download_release.py --bundle FULL` verifies and extracts the complete release,
including `features.parquet`, outside the checkout. The separate **Inspect
complete private marathon export** workflow does the same on relevant PR changes
or a manual run. It returns table schemas, non-null counts, aggregate identifier
coverage, and export documentation in `pacing-full-export-inspection`.

All columns remain queryable inside the private job. It does not upload the
archive or individual rows as artifacts. Inspecting a derived feature confirms
its availability, not the validity of its definition or identity-matching method.
Compare its coverage with raw CORE before using it for longitudinal analyses.

## Analysis contract

Each pack contains `pack_meta.json`, `summary.json`, and `tables/*.csv`.
Metadata includes the export ID, input and calculation dates, current public
snapshot date, archive and manifest checksums, script checksum, engine version,
raw and eligible counts, exclusions, and written methodology. Chart files contain
aggregate values with their sample counts.

The site discovers ready extension packs at build time. Each declares a
`question_id`; the latest input vintage supplies that question's answer,
methodology, and charts. Original routes and core files remain available. An
invalid ready pack fails the build rather than silently rendering incorrect data.

| Extension | Measure |
| --- | --- |
| `ext_pacing_shapes` | Median runner-normalized section pace and equal-distance pacing categories |
| `ext_course_pacing_profiles` | The same median profiles within each city |
| `ext_checkpoint_outcomes` | Target achievement among runners within ±1% of target pace at 20, 30, and 40 km |
| `ext_pace_trend_at_20k` | Finish-time differences across pace trends, matched on edition and 20 km minute |
| `ext_late_rank_changes` | Changes in elapsed-time rank after 30 km using the same finishers and averaged ties |
| `ext_age_pacing` | Opening speed and pace retention by exact age and recorded gender |
| `ext_gender_pacing` | Pooled and race/20 km time-matched pace retention |
| `ext_pacing_over_time` | City-specific yearly medians of opening speed and pace retention |

## Definitions and limits

- Splits must parse as elapsed H:MM:SS or M:SS and increase strictly. All nine
  checkpoints must exist. The finish distance is 42.195 km despite the source
  column name `split_42_2km`.
- Exclude finishes outside 90 minutes–12 hours and sections outside 2–20 min/km.
  These bounds can exclude genuine unusual performances. Exclusion categories
  are disjoint and reconcile exactly to the raw count.
- Compare 0–20 km with 20–40 km at equal distance. CORE has no halfway checkpoint;
  do not call this an observed negative/positive half-marathon split.
- Course profiles normalize each runner before taking medians. Median profiles
  need not integrate to zero, although every individual's normalization does.
- Matching uses the same city, year, race, and floored minute at 20 km, with at
  least 20 observations per group. The smallest group supplies a common weight
  for all groups in each stratum. Published sample counts are actual observations.
- Public chart estimates require at least 100 observations. Race finish counts
  are not unique runner counts. These initial results have no clustered
  confidence intervals and no out-of-sample prediction validation.
- CORE has names but no verified cross-race identity key. Do not manufacture
  personal-best histories from names alone. Exact-age results exclude age-group
  labels. Course overlays have no validity years; no historical terrain has been
  assigned. Weather and elevation are neither invented nor newly scraped.

The original Smyth wall definition and `live.json` remain owned by the core study.

## Verification

```bash
python -m unittest discover -s analysis -p 'test_*.py'
```

The calculation additionally checks that cohort exclusions reconcile, normalized
individual profiles integrate to zero, pattern shares sum to 100%, and signed
rank changes sum to zero within each edition. The site verification checks pack
provenance, table denominators, all routes, null handling, and source links.
