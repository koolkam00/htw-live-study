# Weather evidence and publication decisions

Calculated September 11, 2026, from `private-export-20260911-0336`. The new weather pages have their own source pin in [analysis/weather-release.json](../analysis/weather-release.json). The existing ten and 33 broad packs retain the September 7 source. This document records implementation and validation; deployment is a separate status.

## What was tested

Three questions were specified together before examining their associations with pacing: start dew point as a humidity measure, temperature change in the first four hours, and start wind speed. A candidate can qualify through a stable material association or a sufficiently precise small difference. Uncertain results are retained in the audit but do not receive a website page.

The complete [machine-readable evidence](../public/data/weather/evidence.json) contains all three decisions, estimates, intervals, leave-one-course-out estimates, edition values, input checksums, script hashes, exclusions and the frozen screening rule. The [builder](../analysis/build_weather.py) and [tests](../analysis/test_weather.py) reproduce the method.

| Candidate | Typical exposure contrast | Adjusted difference in slowing, percentage points | 98.33% interval | Decision |
| --- | --- | ---: | --- | --- |
| Humidity / dew point | 4.7°C to 10.8°C dew point | +0.68 | −0.48 to +1.66 | Withheld: inconclusive; neither a clear association nor a precise small difference |
| First-four-hours warming | +2.725°C to +6.4°C temperature rise | +1.94 | +1.43 to +2.52 | Publish at `/analyses/warming-and-pacing` |
| Start wind speed | 2.1925 to 4.105 m/s, approximately 4.9 to 9.2 mph | +0.21 | −0.41 to +0.72 | Publish at `/analyses/wind-and-pacing`, limited to this pacing measure and typical wind contrast |

These contrasts use each exposure's observed interquartile range. They are not contrasts between universal safe/dangerous thresholds. Humidity being withheld does not establish that humidity has no effect. Wind's result does not establish that headwinds, gusts or wind-related finish-time losses are unimportant.

## Population, measurement and model

The September 11 FULL archive was verified against GitHub's size and SHA-256, and contains the expected nine files. Its 3,978,660 raw rows and feature rows have unique non-null canonical IDs with matching sets. Feature race labels are present; nine runner names are null. This repairs the September 10 archive/schema blockers. The successful September 11 release analysis run [34560607862](https://github.com/koolkam00/htw-live-study/actions/runs/34560607862) used older calculation code; its personalized artifact lacks the current 90–720-minute range and was not imported.

Weather contains 227 city-year rows in 33 cities. Every row has 24 hourly readings, and the source URLs specify local timezones and wind in m/s. A single city-year weather row joins to one raw race label; 226 supplied weather rows have raw records. Helsinki 2025 records a 06:00 weather hour against a listed 15:00 start and is excluded from usable weather. Exact half-hour ties at the scheduled start are valid. Tokyo 2025 has weather but no raw records.

The unchanged base parser yields 3,152,691 eligible finishes from the full corpus. It excludes 604,133 missing/unparsed records, 217,277 non-increasing records and 4,559 outside the timing-quality bounds; no exact duplicates were removed. Of eligible finishes, 31,987 lack valid unique weather and 14 belong to an edition below the 100-finish requirement. The final comparison has **3,120,690 finishes, 174 editions and 29 cities**. These are performances and weather editions, not independently identified people. Feature `valid_splits` is a different cohort and is not substituted for this parser's eligibility.

For each runner, late slowing is `100 × ((time40 − time20) / time20 − 1)`. The two blocks are 0–20 km and 20–40 km, with the final 2.195 km excluded. The outcome is the median of individual changes in each edition. Each edition is equally weighted. No individual-mile splits, missing checkpoints, exact ages or wave starts are inferred.

One joint model uses course fixed effects, a linear calendar-year term, start temperature and its square, dew point, four-hour warming and wind speed. Uncertainty resamples whole courses 6,000 times; 98.33% intervals approximately account for three comparisons. The fixed four-hour weather window is independent of each runner's finish time and can extend past faster finishers' races. It describes race-day conditions, not measured personal exposure.

The prespecified gate requires at least 30 editions, 10 courses, meaningful within-course exposure variation in 10 courses, VIF ≤10 and at least 95% valid bootstrap draws. A material association requires an interval excluding zero, at least 1 percentage point of estimated change and consistent direction in every leave-one-course-out refit. A precise small difference requires the full interval and all leave-one-course-out estimates strictly inside ±1 percentage point. That practical threshold is an editorial choice, not a physiological cutoff. All three candidates pass coverage checks; only warming and wind pass the takeaway rule.

Course means the supplied city, not a historically verified route. The model cannot isolate causal weather effects from field composition, fitness, route changes, congestion or race organization. It does not adjust for all measured weather fields: rain, cloud and pressure are not model terms. Independent review reproduced the estimates and bootstrap intervals with a full course-indicator regression to within `1e-8`.

## Site behavior and reproduction

The original ten remain ranked together. The two new questions appear under “Conditions, in more detail” on the homepage and directory, and are linked from the existing temperature page. Only candidates with a ready decision receive a route. The page-level source date and About page distinguish the two vintages.

The units control converts weather display too: °F temperature changes and mph in miles mode, °C changes and km/h in kilometres mode. Temperature changes never receive the +32 offset used for absolute Fahrenheit temperatures. The percentage-point estimate, uncertainty and sample stay unchanged. A course selector browses unadjusted edition observations and an accessible table; it does not refit or personalize the adjusted result. Course browsing is shareable through `course=` and retained through unit changes.

```bash
python -m pip install -r analysis/requirements.txt
python analysis/download_release.py --bundle FULL --tag private-export-20260911-0336 --output /path/to/weather-input
python analysis/build_weather.py --input /path/to/weather-input --output /path/to/evidence.json
python -m unittest discover -s analysis -p 'test_*.py'
npm run verify:data
npm run build
```

The [Weather evidence screen workflow](../.github/workflows/weather-analysis.yml) accepts an explicit release tag and produces an evidence artifact. It does not import data, change either source pin or deploy. Before adoption, verify source identity, schema, scientific decisions, provenance and the exact site diff. The full three-candidate audit must remain available even when only a subset is displayed.

## Validation on September 11

All 20 Python tests, `npm run verify:data`, and the production build passed; the build generated 139 pages. An independent regression implementation reproduced the numerical results. Desktop and 390-pixel mobile browser checks covered both pages, miles/metric conversions, course selection and reload persistence, a course with a single edition, the accessible data table, and navigation excluding humidity. The original source pin, core aggregates and existing packs have no changes in this release.
