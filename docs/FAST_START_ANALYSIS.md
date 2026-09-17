# Fast starts, late slowing and finish time

Implemented September 17, 2026 for rank 2, `/analyses/starting-pace`. The local calculation, nine Python tests and independent source-data verification have passed. CI and production publication evidence are recorded separately in [PR #41](https://github.com/koolkam00/htw-live-study/pull/41).

## Scope and source

The page uses the new [fast-start evidence](../public/data/fast-start/evidence.json), produced by [build_fast_start.py](../analysis/build_fast_start.py), instead of the personalized engine's three-group opening/target-threshold view. That earlier path remains available in the research guide. Its payload and the 33 research packs have not been regenerated or relabeled.

The source remains the adopted `private-export-20260912-0934` release. This addition changes neither release pin, runner lookup, source-quality policy nor existing calculation scripts. It derives new aggregates from the actual checkpoint times in the [published runner profiles](../public/data/runners/manifest.json), not from averages of existing charts. The page's visible source copy follows the website convention of describing marathon/year and field coverage without internal export identifiers.

The builder verifies every one of the **7,766 compressed shards** against the runner manifest's size and SHA-256, checks all five source calculation hashes, and confirms raw/profile ID uniqueness and raw, eligible and profile counts. Its output binds the exact runner-manifest SHA-256, source release, source archive/manifest hashes, source-quality policy and its own calculation hash. The runner manifest currently hashes to `41632a5249afed6421e0e30e428eecdca3130cac18927a109d79456b3ee1ebe6`.

There are **4,462,379 raw records**, **3,517,336 eligible finishes**, and **555,437 finishes with the required earlier benchmark**. The latter count exactly reconciles with the original linked-history calculation. The other **2,961,899 eligible finishes** have no qualifying recent benchmark and cannot enter this comparison. Counts are race performances, not unique people.

## Earlier benchmark and opening groups

For each eligible race in year `y`, use the fastest eligible finish from years `y−2` or `y−1` within its screened supplied identity candidate. The current race and all same-year races are excluded. Held, incomplete and invalid records cannot provide a benchmark. Names never establish a link; the source identity screening does not independently verify a person's identity.

The benchmark is a recent recorded best. It is not measured current fitness, a declared goal, the runner's last marathon, or necessarily a lifetime best. Changes in fitness between races are especially important when interpreting a faster opening.

Let `opening_change` be:

```text
100 × ((actual first 10 km elapsed time / 10) / (earlier best finish time / 42.195) − 1)
```

Negative means faster pace than the earlier best's whole-marathon average. The fixed bands are:

| ID | Display description | Exact percentage interval |
| --- | --- | --- |
| `fast10` | More than 10% faster | `< −10` |
| `fast5` | 5–10% faster | `−10 ≤ change < −5` |
| `fast2` | 2–5% faster | `−5 ≤ change < −2` |
| `steady` | Within 2% | `−2 ≤ change ≤ 2` |
| `slow2` | 2–5% slower | `2 < change ≤ 5` |
| `slow5` | More than 5% slower | `> 5` |

Decimal timing cross-products classify boundaries without rounding source times or introducing binary-division artifacts. For example, 2,850 seconds over the first 10 km versus a 12,658.5-second earlier marathon is exactly 5% faster and belongs to `fast2`. These are descriptive categories, not physiological thresholds establishing that a runner started too fast.

## Filters and sample rules

The default uses All courses, all ages, all recorded genders, all earlier times, and the `fast10` opening group. Filters select an exact combination of:

- Course, pooling its available eligible editions, or All courses.
- Recorded exact age: All, 18–24, then five-year bands from 25–29 through 85–89. Missing, fractional or out-of-range ages stay in All.
- Recorded gender: All, Men or Women. Other/unrecorded values stay in All.
- Earlier recorded-best finish: All, under 3:00, 3:00–under 3:30, 3:30–under 4:00, or 4:00 and longer.

There is **no target-time or current-finish filter** in this view. Earlier time supplies the only time-based filter; it avoids selecting groups by the outcome being explained. Course, age and gender filters do not match or adjust race editions, weather, training or changing fitness. The results remain pooled observational comparisons.

Every displayed opening group requires at least **100 eligible benchmarked finishes**. Each roll-up is calculated directly from its records, never by averaging subgroup medians. Sparse combinations show an unavailable result; they are not silently broadened. The current file contains **576 supported filter combinations and 2,846 opening-group cells**, about **1.19 MB**.

## What the charts measure

**Section trajectory:** For each actual recorded interval, calculate the individual's percentage pace difference from their earlier-best marathon pace, then display its group median. Nine intervals retain the recorded 5 km timing grid and final 2.195 km section. Separate section medians do not describe one representative runner and need not sum to the median finish. Miles mode converts distances without inventing mile splits.

**Finish outcome:** Current finish minus earlier recorded best, in actual seconds. The median is the typical observed difference; the 10th and 90th percentiles describe the middle 80% of individual differences. These percentiles are not confidence intervals or individual predictions.

**Opening and remaining time:** Compare actual first 10 km elapsed time with `10 / 42.195` of the earlier finish. Remaining difference equals finish difference minus opening difference. The group's mean opening and remaining differences add to its mean finish difference. Negative means fewer seconds spent than the reference; positive means more. This signed accounting uses an arithmetic even-pace reference, not an alternative race the runner would have achieved. Means can differ materially from the separate median outcome.

**Sustained-slowdown rate:** Use the same definition as the supporting study: pace at least 25% slower than the current race's 5–20 km baseline, for contiguous recorded sections totaling at least 5 km after 20 km. A `1e−12` ratio tolerance absorbs binary rounding at the threshold. The final 2.195 km cannot qualify alone. The denominator is every eligible benchmarked finish in the selected opening group, including those with no detected episode.

**First qualifying section:** Among detected finishes, count whether the first qualifying section starts at 20, 25, 30 or 35 km. A distribution is displayed only when the group has at least **100 detected finishes**; otherwise `onset` is null. The four shares use the detected-finish denominator, not all finishes. Timing mats locate a section, not the exact instant the pace changed. Slowing may have begun before the threshold or before the first tested section; the chart does not identify physiological failure.

The output also retains median late pace change, comparing 30 km–finish against the same race's 5–20 km baseline. This is a distinct measure from the earlier-best pace reference used for opening groups and section trajectories.

## Measured results for All courses / All filters

| Opening group | Finishes | Sustained slowdown | Median finish difference from earlier best |
| --- | ---: | ---: | --- |
| More than 10% faster | 142,757 | 47.0% | 16:37 faster |
| 5–10% faster | 137,055 | 29.5% | 1:57 faster |
| 2–5% faster | 103,017 | 20.4% | 0:12 slower |
| Within 2% | 97,545 | 17.9% | 5:25 slower |
| 2–5% slower | 30,793 | 20.3% | 14:33 slower |
| More than 5% slower | 44,270 | 25.3% | 36:11 slower |

In the fastest-opening group, 67,025 finishes meet the slowdown definition. Its onset counts at 20, 25, 30 and 35 km are 8,329, 15,177, 25,073 and 18,446; the most frequent first qualifying section is **30–35 km**. The steady group has 17,472 detected finishes with respective counts 1,073, 2,535, 6,266 and 7,598; its most frequent section is **35–40 km**. These are modes, not a promised or precise onset distance.

The data show more late slowing among faster-opening groups, while their finish changes can still be faster than the earlier benchmark. Both observations must remain visible. Improved fitness, the earlier race's quality, differing courses and conditions, and selection into linked histories can explain part of this pattern. It is unsupported to turn these results into a causal finish-time penalty or a recommendation to start aggressively. Only recorded complete eligible finishes are represented: the analysis cannot estimate withdrawals or the chance of not finishing, nor isolate training, fueling or physiological causes.

## Reproduction and independent verification

Run from the repository root with NumPy installed:

```bash
python -m unittest discover -s analysis -p test_fast_start.py -v
python analysis/build_fast_start.py --runners public/data/runners --pin analysis/release.json --output public/data/fast-start/evidence.json
node scripts/verify-fast-start.cjs
npm run verify:data
npm run build
```

The measured build used NumPy 2.2.6 and records its actual engine version. The nine [Python tests](../analysis/test_fast_start.py) cover exact percentage and decimal-timing boundaries, strictly earlier-year benchmarks, unavailable demographics, the short final section, threshold inclusion, signed time accounting, percentiles and sparse-cohort behavior. A regression fixture also preserves valid exact section-pace bounds after decimal elapsed-time subtraction while rejecting genuinely out-of-range paces. This uses the runner verifier's `1e−8` seconds/km rounding tolerance at 120 and 1200 seconds/km; it does not change the underlying eligibility rules.

The separate [JavaScript verifier](../scripts/verify-fast-start.cjs) independently scans all profile records, reconstructs the 555,437 earlier benchmarks, and recomputes **all 2,846 published cells' counts, edition counts, slowdown counts and onset distributions**, including omitted sparse cells. It independently recalculates every numeric metric in **36 groups across six filter combinations**, including all six global opening groups and five varied filtered combinations. It uses separate exact integer cross-products for decimal boundary classification. This full verification passed after the final calculation.

Refreshing the runner lookup requires regenerating this output against the exact new manifest, even if the source tag stays the same. A benchmark/count/hash mismatch blocks publication; do not relax it to accept unexplained differences. Existing research packs and the archive's opening engine keep their own contracts. Record PR, deployment and live-payload verification separately before claiming the new page is live.
