# Runner comparisons and environmental context

Implementation record for `codex/runner-context-and-peers`, September 12, 2026 UTC. Source remains **`private-export-20260911-1107`**. This extends the [public runner search](CURRENT_SITE_AND_RUNNER_SEARCH.md); it does not replace the ten primary analyses or change their source pin. The full local calculation is complete. Import, CI, browser verification and production publication must be recorded separately; this document does not certify deployment.

## What the runner view adds

After visitors select and confirm their recorded races, `/runners` provides a focus race, its nine recorded section paces, a comparison with another selected eligible race, same-edition peer comparisons, and supplied weather/course context. Name matches do not establish identity. Excluded or incomplete records remain discoverable with their recorded timings and quality reasons; they cannot supply performance comparisons.

Peer comparisons use the exact recorded **city, year and race**, with the shared timing checks and reviewed edition exclusions. They describe eligible database finishes, not official race standings or all starters. Available groups are All, recorded Men/Women, exact-age band, and exact-age band combined with recorded gender. Ages are 18–24, then five-year bands through 85–89. Missing or unusable age/gender does not remove a finish from All; it prevents the corresponding demographic comparison. A small or unavailable group must be explained rather than silently replaced.

A published group contains at least **101 finishes**, leaving at least 100 other observations for a selected finish. The finish distribution retains exact millisecond-rounded recorded times and their counts. Rank is one plus the number of faster finishes. Percentile excludes the selected record: `100 × (slower finishes + other tied finishes / 2) / (group size − 1)`. Higher percentiles mean faster finishes. The displayed group median retains the selected finish.

Pacing comparisons additionally use a half-open 15-minute achieved-time interval centered on the nearest 15-minute mark. For a 4:00 center, that interval is **3:52:30 inclusive to 4:07:30 exclusive**. Each published pace group also requires 101 finishes. Section pace and late-change quartiles include the selected finish; they are not leave-one-out quartiles. The middle-half band describes observed variation, not a confidence interval, an optimal plan, or a prediction from earlier ability. Selecting on achieved finish is retrospective.

Individual early pace covers 5–20 km, opening pace 0–5 km and late pace 30 km–finish. Late change is `100 × (late pace / early pace − 1)`. The final recorded section is 40–42.195 km. Between-race comparisons subtract matching recorded section elapsed times; those differences sum to the finish-time difference. Sharing a city name does not verify the same historical route. Selection, fitness, field composition, age, route changes and conditions can differ; no weather, terrain or aging effect is identified and no adjusted finish time is calculated.

## Weather contract and gaps

`analysis/runner_environment.py` reuses the weather study's start-hour validation. A city/year must identify one raw race and one weather row, with trimmed case-insensitive race names agreeing. Race-date year must match; the archived hour must be within 30 minutes of the supplied scheduled start, with an exact four-hour endpoint. The runner view additionally requires each of the five exact hourly readings from start through four hours later; it never interpolates. Request URL dates, timezone, coordinates and units are checked. Required temperature, dew point, humidity and wind values must be finite and physically consistent. Additional invalid/missing fields become null with reasons, not zero.

The context retains temperature, feels-like temperature, dew point, relative humidity, wind speed/direction, precipitation, cloud, sea-level pressure, numeric weather code, hourly readings and source provenance. It describes modeled scheduled-start conditions, not a runner's wave or personal exposure. Supplied calendar/start facts are not independently verified, and the archive URLs do not establish one fixed weather model across all years. Precipitation is the preceding hour's total rain, showers and snow, not instantaneous rainfall or a race total. See [Open-Meteo's variable definitions](https://open-meteo.com/en/docs/historical-weather-api).

For 1107, **233 of 240 raw editions** have valid context, covering **4,192,697 of 4,207,456 raw records**. Six editions have no weather row: Amsterdam 2020, Boston 2016, London 2015, Vienna 2022, Chicago 2016 and New York 2008. Helsinki 2025 is rejected because its 06:00 archived hour disagrees with the supplied 15:00 start. Tokyo 2025 has a weather row without matching raw results. Context has no statistical minimum; its coverage therefore differs from the separate association screen's 177 editions and 3,324,934 eligible finishes. Supplying context does not make an excluded race analytically eligible.

## Elevation contract and gaps

Course context requires one supplied profile for the city, a matching recorded race name, and nine unique contiguous sections whose course key, city, race, source and embedded profile values agree. The section labels remain 0–5 through 40–42.195 km. Profile points retain their own supplied distances; no rescaling or extrapolation is performed.

The visible gain, loss and net totals are **separate sums of the nine supplied sections**. Net change must never be reconstructed as gain minus loss: source ascent/descent thresholds make those fields different measurements. Whole-profile gain/loss, endpoint net change and profile distance are retained separately. All 32 profiles' whole-route gain/loss totals differ from section sums by more than 0.11 m, and 265 of 288 sections have gain-minus-loss versus net differences above 0.11 m. Producer notes describe thresholded processing; these values are not interchangeable.

All historical validity ranges are null. Context explicitly reports that the historical route is unverified. Supplied profile tracks range from 42.161 to 43.175 km; Berlin (42.184), Madrid (42.161) and Paris (42.180) end before the final nominal timing boundary. The mismatch remains visible, without treating the section labels as proof of full route coverage. Profiles cover **238 editions / 4,204,380 raw records**; Melbourne 2015 and Vienna 2022 have no profile. Missing-profile eligible finishes total 2,962.

Producer follow-up is to verify historical route intervals, reconcile/document whole-profile versus section processing and short-track coverage, correct Helsinki start provenance, and supply the missing weather/course rows. Do not invent replacements in the website calculation.

## Build, transport and validation

`analysis/build_runner_context.py` consumes the same verified FULL input and the exact imported runner manifest. It verifies the FULL archive/manifest and four used Parquet members, reproduces the shared cohort/source-quality report, and checks the complete ordered edition mapping. It calls `runner_peers.py` and `runner_environment.py`, then writes a manifest and one deterministic gzip JSON shard per raw edition. The manifest records input and script hashes, runner-manifest checksum/timestamp, source tag, cohort, methods and transport checksums. It is bound to that precise runner lookup build; refreshing the lookup requires rebuilding context even when the release tag stays the same.

The new owned public directory is `public/data/runner-context`. `lib/runner-context.ts` loads the manifest and required edition shards, checks compressed sizes/SHA-256 and edition identity, and computes comparisons for selected races. Loading is limited to three concurrent edition requests with a bounded cache. Miles/per-mile pace, feet, °F, mph and inches are presentation conversions; metric source measurements, cohort membership and elapsed times remain unchanged.

`scripts/verify-runner-context.cjs` checks source and calculation hashes, the exact runner-manifest binding, every shard and group, all available 101-finish pace intervals, environmental invariants and totals. It independently recounts **every finish-distribution cell** from the published eligible runner records and recomputes 16 distributed pace-group quartile samples. Python fixtures exercise exact-time ties and band boundaries, cohort thresholds, missing demographics, weather integrity/units and terrain-source conflicts. The importer must run this full verifier before replacing only its owned directory. See [operator commands](OPERATIONS.md#runner-context-refresh).

## Local calculation evidence

The completed output at `/private/tmp/marathon-runner-context/output` records calculation time `2026-09-12T05:09:57Z` and runner-manifest time `2026-09-12T04:11:06Z`:

| Output | Count |
| --- | ---: |
| Eligible finishes | 3,328,159 |
| Edition shards | 240 |
| Published peer groups | 1,602 |
| Achieved-time pace groups | 12,674 |
| Distinct-time/count cells across overlapping groups | 4,873,073 |
| Editions with weather / terrain context | 233 / 238 |
| Compressed edition-shard bytes | 15,859,585 |

The group/cell totals overlap and are not unique people or additional race records. All 52 Python tests passed in the local calculation run. The independent full-data verifier passed every eligible finish/CDF recount and all 16 sampled pacing-quartile recomputations. These are local verification facts; publication remains pending separate verification.
