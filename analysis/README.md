# Marathon pacing analyses

This pipeline reads the complete public FULL export (including CORE tables) and produces
33 aggregate question packs: eight foundation analyses and 25 whole-race,
forecast, course and linked-history analyses. Some answers are explicitly partial
or proxy comparisons. Group running and congestion cannot be calculated without
absolute timing and start-offset data. It does not scrape races, change the
database or overwrite core packs. Its chart output contains aggregates; complete
individual records are available separately in the source releases. The main website selects ten ranked analyses from the personalized engine at `/analyses/{slug}`. The 33 broad packs form the research archive; the engine still has 12 calculation paths. See the [ten-analysis map](../docs/TOP_TEN_ANALYSES.md).

## Access and refresh

The source is a public [GitHub Release](https://github.com/koolkam00/htw-live-study/releases) in `koolkam00/htw-live-study`.
The full dataset is intended for anyone to download and open without an account,
token, password or decryption key. See [ACCESS.md](ACCESS.md) for direct links.
`release.json` pins the default release for reproducibility.

The pin and checked-in numerical outputs retain source release `private-export-20260907-1318`. The personalized pack was recalculated at `2026-09-11T09:15:27Z` from that same source to expand exact target support to 90–720 minutes; its input timestamp remains `2026-09-07T13:19:23Z`.
The September 11 takeover verified matching CORE/FULL canonical IDs in the newer
September 10 export, but also confirmed archive and feature-schema incompatibilities
with the current downloader/history builder. At the September 11 takeover inspection, the latest relevant refresh had failed,
with no retry found. Follow [ACCESS.md](ACCESS.md) and
[known issues](../docs/KNOWN_ISSUES.md) before attempting that vintage. All 401
production aggregate files matched the checkout before this branch's later
presentation edits; that observation does not imply those edits are deployed.

Full records, names, features and backups are public release assets. The owner
has removed earlier runner-data privacy restrictions. Releases are preferred for
large binary files to keep clones and website builds small; downloaded inputs may
be placed in any chosen data directory. The archives are compressed, not encrypted.
The legacy `private-export-*` names remain technical identifiers, not access rules.

The **Marathon pacing analysis** workflow downloads and verifies FULL,
runs the calculations, and returns `pacing-aggregate-packs` containing
only JSON and CSV aggregates. The workflow has read-only repository permission.
Its Actions artifacts contain calculation results; full source archives and runner
records are distributed through Releases rather than duplicated in those artifacts.

Publishing a new `private-export-*` release triggers the workflow on the default
branch. It can also be run manually
with a release tag. Changes to `analysis/` in relevant PRs run against the pinned release, including fork PRs subject to
GitHub workflow approval. No schedule, scraping job, automatic merge, or production update
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

Anyone can run the same computation locally with Python 3.12. The downloader
uses ordinary HTTPS and requires no GitHub CLI or login. An optional `GH_TOKEN`
or `GITHUB_TOKEN` can raise API rate limits. Choose an input directory:

```bash
python -m pip install -r analysis/requirements.txt
python analysis/download_release.py --bundle FULL --output /path/to/pacing-input
python analysis/build_pacing.py --input /path/to/pacing-input --output /path/to/pacing-aggregates --live-as-of CURRENT_PUBLIC_LIVE_AS_OF
python analysis/build_extended.py --input /path/to/pacing-input --output /path/to/pacing-aggregates --live-as-of CURRENT_PUBLIC_LIVE_AS_OF
python analysis/write_findings.py --output /path/to/pacing-aggregates
```

Fetch `https://htw-live-study.vercel.app/data/live.json` first and use its actual
`as_of`. FULL is verified against the release asset's size and SHA-256 digest.
The import requires every pack in `pack_registry.json`; partial refreshes fail.

## Inspecting the additional FULL data

`download_release.py --bundle FULL` verifies and extracts the complete release,
including `features.parquet`, into the chosen directory. The separate **Inspect
complete marathon export** workflow does the same on relevant PR changes
or a manual run. It returns table schemas, non-null counts, aggregate identifier
coverage, and export documentation in `pacing-full-export-inspection`.

All columns are available in the downloadable source release. The inspection job
returns its reports without duplicating the source archive in its artifacts. Inspecting a derived feature confirms
its availability, not the validity of its definition or identity-matching method.
Compare its coverage with raw CORE before using it for longitudinal analyses.

## Analysis contract

Each pack contains `pack_meta.json`, `summary.json`, and `tables/*.csv`.
Metadata includes the export ID, input and calculation dates, current public
snapshot date, archive and manifest checksums, script checksum, engine version,
raw and eligible counts, exclusions, and written methodology. Chart files contain
aggregate values with their sample counts.

Numerical-run script checksums identify the code that produced those calculations.
Later presentation-only text revisions are recorded separately; they do not change
the input vintage, calculation timestamp, numerical values or inherited method.
The September 11 personalized range expansion is an actual recalculation with
updated script hashes and calculation timestamp, while preserving the source release.

The site discovers ready extension packs at build time. Each declares a
`question_id`; the latest input vintage supplies that question's answer,
methodology, and charts. Original routes and core files remain available. An
invalid ready pack fails the build rather than silently rendering incorrect data.

The eight foundation packs remain:

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

The additional 25 owned packs are registered in `pack_registry.json`. Their
actual formulas, cohort definitions and limits live in each `pack_meta.json` and
are rendered both on the question and the site's Methodology page. Narrative
findings are regenerated from the aggregate CSVs by `write_findings.py`, with a
separate narrative-script checksum. They do not introduce new numerical inputs.

## Personalized engine and the ten-analysis explorer

The primary experience has ten ranked questions at `/analyses/{slug}`. Its order
and visible controls are defined by `lib/ten-analyses.ts`; the 35-question broader
catalog is a research archive. All 12 backing engine paths remain implemented,
including downhill opening and same-course returns beyond the main ten. The
full earlier guide remains at `/research/personalized`; `/your-race` preserves
old links by forwarding mapped questions and profile parameters.

The initial profile is an explicitly labeled All courses / 4:00 example, all ages,
all recorded genders and no earlier time. Supported controls vary by analysis:
course comparison spans courses, weather has no target filter, age comparison
varies age, and checkpoint comparison has no previous-time filter. Terrain asks
for an explicit course selection. There is no arbitrary city fallback or universal
age × speed × gender × weather × elevation filter. Historical goals and
historical route changes are not inferred.

Visitors can enter every whole-minute target from 1:30 through 12:00. The engine
uses 15-minute presets for achieved-time buckets; exact threshold counts retain
one-minute precision. Published samples remain sparse for some courses,
demographic/history combinations and extreme times. The accepted input range
does not promise that every comparison has a result.

`build_personalized.py` reuses the validated source tables inside the extended
calculation. The workflow passes `--personalized-output` and uploads the separate
**pacing-personalized-aggregates** artifact. It contains only fixed aggregate
cohorts and checkpoint cells. Import it separately after review:

```bash
python analysis/import_personalized.py --archive /path/to/pacing-personalized-aggregates.zip --expected-export private-20260907-1318
npm run verify:data
npm run build
```

The importer validates all cells and provenance before replacing only
`public/data/packs/ext_personalized_guide`. Public files are readable aggregate JSON,
validated before import and checked by SHA-256. Only the selected course loads,
and checkpoint files load only when requested. HTTP compression is left to the
host and requires no browser-specific decompressor. The original 33-pack importer
and registry retain their existing ownership boundary.

The engine publishes achieved-time pacing bands, earlier-benchmark opening
comparisons, exact-threshold near finishes, age contrasts, supplied terrain
alignment, opening/late-pace comparisons, checkpoint outcomes, course outcome
spread, edition-weighted weather, threshold distributions, paired returns and
earlier-best improvement contributions. Each question and the Methodology page
describe its denominator, conditioning variables and limits.

Exact ages use 18–24 then five-year bands through 85–89; unknown ages remain in
All only. Optional previous time selects a 15-minute band of recent recorded
bests, not an exact last-race match. The client tries broader age/gender cohorts
before dropping prior-time constraints and explicitly labels every relaxation.
Per-course results never silently substitute another course. Cross-course and
age-comparison panels deliberately vary the dimension they compare.

Custom threshold counts use strict finish < target at every integer minute from
90 through 720. No interpolation is used. Achieved-time profile and improvement
cohorts use the displayed 15-minute bucket centered on the nearest preset. Near
finishes use [target−5,target) and [target,target+5) minute intervals. Checkpoints
use two-minute elapsed bands with an exclusive upper endpoint, optional recent
5 km trend and no prior-time filter. Their historical outcome proportions are
not validated individual probabilities and exclude non-finishers.

`scripts/verify-personalized.cjs` checks all twelve paths across presets, custom
targets, optional history, sparse cities, explicit fallbacks, sample counts,
finite charts, checkpoint boundaries and the actual JSON response decoder.
`test_personalized.py` tests strict finish boundaries and section reconciliation
on hand-checkable synthetic data inside the analysis workflow.

## Shared definitions and limits

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
- Chart estimates require at least 100 observations for statistical reliability,
  not as a restriction on access to the underlying records. Finish counts are not
  unique runner counts. The opening comparison has a 500-draw edition-clustered
  bootstrap (seed 20260908); it does not also cluster repeated runners. Other
  outcome percentiles describe variation, not uncertainty in estimates.
- The checkpoint forecast holds out the latest three observed years. All factors,
  fallbacks and prediction intervals use only training years and checkpoint-known
  features. Median/90th-percentile absolute error, interval width and actual 80%
  interval coverage are published. It describes complete eligible finishers.
- In the September 7 input, CORE and FULL record IDs do not correspond. Join edition, normalized name and
  all section/finish durations, require one-to-one matches, and use only supplied
  non-ambiguous identities passing gender, birth-year and duplicate-edition checks.
  Do not invent cross-race identities from names alone.
- September 10 canonical IDs were verified to align, but row order differs and
  its feature name/edition columns are absent. The current pipeline has not adopted
  that schema. Request a producer-compatible export or review a version-specific
  consumer adapter. Preserve the September 7 join and do not apply the newer ID
  contract retroactively.
- Prior performance is the best in the two strictly earlier calendar years;
  supplied PB/ability fields and same-year performances never enter that benchmark.
  Earlier-best gains compare with the best in all earlier years, so are not a claim
  of a lifetime PB. Day intervals use the separate complete/unique supplied-date
  cohort. Recorded-return analysis excludes recent index years and requires
  subsequent home-city edition coverage; absence is not retirement.
- Exact-age results exclude age-group labels. Route validity years are absent;
  terrain is explicitly a supplied-route proxy. Weather is the modeled archive
  hour nearest the scheduled start, not personal exposure. Neither is invented
  or newly scraped. The narrow qualifying comparison uses dated B.A.A. standards,
  not inferred individual qualification or acceptance.

The sustained-slowdown definition and `live.json` remain owned by the core study.
The inherited [Published slowdown method (2021)](https://doi.org/10.1371/journal.pone.0251513)
is unchanged: at least 25% slowing for at least 5 km after 20 km relative to the
5–20 km baseline. Marathon Pacing Study retains this source citation and separates
published reference results from its own data calculations.

## Verification

```bash
python -m unittest discover -s analysis -p 'test_*.py'
```

The calculation additionally checks that cohort exclusions reconcile, normalized
individual profiles integrate to zero, pattern shares sum to 100%, and signed
rank changes sum to zero within each edition. The site verification checks pack
provenance, table denominators, all routes, null handling, source links, same-cohort
forecast comparisons, prediction coverage, mirrored course comparisons, transition
probabilities and exact reconciliation of personal-best section gains.
