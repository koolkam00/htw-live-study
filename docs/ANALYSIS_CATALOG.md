# Analysis catalog

Updated for the full refresh from **`private-export-20260911-1107`**. The counts, source timestamps and methods below are generated from that calculation's metadata. [REFRESH_20260911_1107.md](REFRESH_20260911_1107.md) separately records validated import and production status; calculated does not mean deployed. Original/core packs retain historical inputs.

## How to read the catalog

- The primary site has [ten ranked analyses](TOP_TEN_ANALYSES.md), defined in [lib/ten-analyses.ts](../lib/ten-analyses.ts). They reuse ten of twelve personalized engine paths, not independent datasets.
- Three additional weather candidates are screened together by `build_weather.py`. Only ready candidates receive pages; all results remain in `public/data/weather/evidence.json`. The current 1107 output supports warming and a precise null for typical wind speed, while moisture is too uncertain. See [WEATHER_ANALYSES.md](WEATHER_ANALYSES.md).
- The research archive contains 35 questions: eight foundation packs from `build_pacing.py`, 25 from `build_extended.py`, and two measurement-limited questions (group running and congestion). `write_findings.py` writes narratives from the aggregate values.
- Legacy S/R/RN/P and sustained-slowdown figure folders overlap with newer answers. Do not count folders as independent studies. Their complete producer generator is external and their numbers are not refreshed here.
- Ready describes an implemented, supported output under its stated method. It does not establish causation or resolve the full breadth of an original question. Full source records are public; chart sample thresholds serve reliability, not access restrictions.

The 1107 personalized engine has **3,328,159 eligible finishes**, including **1,170,588 with exact age** and **524,323 with a recent prior benchmark**. It retains twelve paths, whole-minute targets 90–720 and 28 cities plus All courses. Missing age, valid history, historical route validity and start/proximity measurements still limit specific comparisons.

The September 10 failed refresh and schema/archive incompatibilities are dated historical evidence. Current 1107 CORE/FULL member layout, canonical IDs and comparable timing units passed audit; the runtime canonical join is restricted to that explicitly audited release. See [ACCESS.md](../analysis/ACCESS.md).

## Shared inputs and calculation contracts

Foundation input uses raw edition labels, runner for deduplication, recorded gender, exact age and nine elapsed checkpoint strings. Parse to seconds, require every checkpoint and strict increase, finish 90 minutes–12 hours and each section 2–20 min/km. Compare equal-distance 0–20 and 20–40 km, not measured half-marathon splits. Do not interpolate missing data.

Then apply the release-specific [source-quality policy](../analysis/source_quality.py). Ten reviewed invalid-grid, incomplete, held or selected-field editions exclude 40,901 otherwise timing-valid finishes, leaving 3,328,159 from 3,369,060 timing-eligible records. Excluded editions cannot supply earlier benchmarks. Missing age or recorded gender alone does not remove usable timing from All. Every output records policy/script hashes and edition counts.

Extended calculations use retained raw IDs, supplied feature linkage and edition dates; course analyses also use course segments. Audited 1107 raw/feature IDs join canonically only after runtime checks of unique matching sets and labels, then full-timing agreement. September 7 reproduction retains one-to-one edition/name/full-timing matching. Cross-race identities remain supplied candidates, screened for ambiguity, conflicting gender/birth year and duplicate editions. Recent best uses only the two strictly earlier calendar years, excluding all same-year results. See [data architecture](DATA_ARCHITECTURE.md).

Eligible finishes, linked finishes, benchmark observations, pairs and weather editions are different populations. Public cells generally require 100 observations, with additional matched/edition rules. The metadata, linked summary and table contracts preserve the actual denominator, observation unit, provenance and limitations. These sources take precedence over an abbreviated question title.

## Broader research archive question map

| # | Question ID and title | Theme | Extension / state | Aliases |
| --- | --- | --- | --- | --- |
| 1 | `r10_unravel_typology`: How do people actually pace a marathon? | strategy | [ext_pacing_shapes](../public/data/packs/ext_pacing_shapes/pack_meta.json) | — |
| 2 | `r05_exceptional_vs_prior`: What does an unusually good race look like? | strategy | [ext_performance_profiles](../public/data/packs/ext_performance_profiles/pack_meta.json) | — |
| 3 | `r01_banking_time`: What are the rewards and risks of an aggressive start? | strategy | [ext_opening_tradeoffs](../public/data/packs/ext_opening_tradeoffs/pack_meta.json) | 's1_banking_time' |
| 4 | `r02_recover_slow_start`: How do runners successfully respond to a slow start? | strategy | [ext_slow_start_responses](../public/data/packs/ext_slow_start_responses/pack_meta.json) | — |
| 5 | `r03_accel_vs_decel_20k`: Can two runners reach 20 km together but have different prospects? | strategy | [ext_pace_trend_at_20k](../public/data/packs/ext_pace_trend_at_20k/pack_meta.json) | — |
| 6 | `r08_early_blowup_signal`: How early can the splits reveal how the race will finish? | strategy | [ext_checkpoint_forecast_validation](../public/data/packs/ext_checkpoint_forecast_validation/pack_meta.json) | — |
| 7 | `r09_bad_patch_recoverable`: When can runners regain their rhythm after a bad patch? | strategy | [ext_bad_patch_recovery](../public/data/packs/ext_bad_patch_recovery/pack_meta.json) | 's11_recover_bad_patch' |
| 8 | `r30_negative_split_success`: Is a negative split always associated with a better performance? | strategy | [ext_split_pattern_success](../public/data/packs/ext_split_pattern_success/pack_meta.json) | — |
| 9 | `r31_multiple_good_strategies`: Is there one good pacing strategy, or several? | strategy | [ext_successful_race_shapes](../public/data/packs/ext_successful_race_shapes/pack_meta.json) | — |
| 10 | `r34_pacing_risk_reward`: Which pacing approaches offer consistency, and which are more variable? | strategy | [ext_strategy_outcome_spread](../public/data/packs/ext_strategy_outcome_spread/pack_meta.json) | — |
| 11 | `s3_course_breaks`: What is each course’s pacing fingerprint? | courses | [ext_course_pacing_profiles](../public/data/packs/ext_course_pacing_profiles/pack_meta.json) | — |
| 12 | `r11_course_section_traps`: How do runners adjust their pace to climbs and descents? | courses | [ext_terrain_pacing_proxy](../public/data/packs/ext_terrain_pacing_proxy/pack_meta.json) | — |
| 13 | `r12_fastest_by_ability`: What would your time be on another course? | courses | [ext_paired_course_comparisons](../public/data/packs/ext_paired_course_comparisons/pack_meta.json) | 's4_time_translation' |
| 14 | `r13_great_day_vs_consistency`: Which marathon offers speed, and which offers consistency? | courses | [ext_course_outcome_spread](../public/data/packs/ext_course_outcome_spread/pack_meta.json) | — |
| 15 | `r14_knowing_course`: Does knowing the course improve execution? | courses | [ext_course_familiarity](../public/data/packs/ext_course_familiarity/pack_meta.json) | — |
| 16 | `r15_weather_penalty_who`: How does weather change the way a marathon is run? | courses | [ext_weather_pacing_patterns](../public/data/packs/ext_weather_pacing_patterns/pack_meta.json) | 's9_weather_penalty' |
| 17 | `s5_pacing_vs_difficult_day`: Was it my pacing or a difficult race day? | courses | [ext_race_day_context](../public/data/packs/ext_race_day_context/pack_meta.json) | — |
| 18 | `r16_groups_hold_or_fall`: How does running with a group shape the race? | courses | No registered extension; missing group/start timing measurements | — |
| 19 | `r33_start_congestion`: How much does the opening crowd shape the rest of the race? | courses | No registered extension; missing group/start timing measurements | — |
| 20 | `r35_course_adaptation`: Are stronger performers better at adjusting their pace to the course? | courses | [ext_course_response_profiles](../public/data/packs/ext_course_response_profiles/pack_meta.json) | — |
| 21 | `r04_on_pace_goal_hits`: Does being on pace mean you will hit your goal? | goals | [ext_checkpoint_outcomes](../public/data/packs/ext_checkpoint_outcomes/pack_meta.json) | 's2_target_odds' |
| 22 | `r06_decided_after_30k`: How much of a marathon is decided after 30 km? | goals | [ext_late_rank_changes](../public/data/packs/ext_late_rank_changes/pack_meta.json) | — |
| 23 | `r17_milestone_kick`: How much finishing speed appears when a milestone is within reach? | goals | [ext_milestone_finishing_speed](../public/data/packs/ext_milestone_finishing_speed/pack_meta.json) | — |
| 24 | `r18_bq_rule_changes`: Do qualifying rules change how people race? | goals | [ext_qualifying_threshold_comparison](../public/data/packs/ext_qualifying_threshold_comparison/pack_meta.json) | — |
| 25 | `s10_goal_slips`: What happens when a goal slips away? | goals | [ext_goal_slip_recovery](../public/data/packs/ext_goal_slip_recovery/pack_meta.json) | — |
| 26 | `r25_huge_kick_next`: Does a strong finish suggest unused capacity? | goals | [ext_strong_finish_followup](../public/data/packs/ext_strong_finish_followup/pack_meta.json) | — |
| 27 | `r07_wall_clock_vs_distance`: Do pacing changes follow distance or elapsed time? | differences | [ext_distance_and_elapsed_change](../public/data/packs/ext_distance_and_elapsed_change/pack_meta.json) | 's6_wall_distance_vs_time' |
| 28 | `r20_pacing_personalities`: Do runners have persistent pacing habits? | differences | [ext_pacing_habit_persistence](../public/data/packs/ext_pacing_habit_persistence/pack_meta.json) | — |
| 29 | `r22_aging_changes`: How do speed and pace retention vary by age? | differences | [ext_age_pacing](../public/data/packs/ext_age_pacing/pack_meta.json) | 's8_age_speed_vs_endurance' |
| 30 | `r23_gender_pacing`: How does pacing differ across recorded gender groups? | differences | [ext_gender_pacing](../public/data/packs/ext_gender_pacing/pack_meta.json) | — |
| 31 | `r19_near_miss_return`: Does a near miss bring people back? | learning | [ext_near_miss_recorded_return](../public/data/packs/ext_near_miss_recorded_return/pack_meta.json) | — |
| 32 | `r21_learn_from_blowup`: What changes as runners gain experience? | learning | [ext_experience_and_pacing](../public/data/packs/ext_experience_and_pacing/pack_meta.json) | 's7_learn_after_blowup' |
| 33 | `r24_interval_after_pb`: How does the previous marathon affect the next one? | learning | [ext_race_spacing_outcomes](../public/data/packs/ext_race_spacing_outcomes/pack_meta.json) | — |
| 34 | `r26_pacing_over_20y`: How have marathon speed and pacing changed over time? | learning | [ext_pacing_over_time](../public/data/packs/ext_pacing_over_time/pack_meta.json) | 's12_pacing_over_20y' |
| 35 | `r32_where_pbs_are_gained`: Where do runners gain the time that produces a personal best? | learning | [ext_earlier_best_section_gains](../public/data/packs/ext_earlier_best_section_gains/pack_meta.json) | — |

## Registered extensions: methods and outputs

### ext_pacing_shapes

How do people actually pace a marathon?

- Producer: [analysis/build_pacing.py](../analysis/build_pacing.py); display question `r10_unravel_typology`.
- Calculated state: **ready**; bundle `private-20260911-1107`; input timestamp `2026-09-11T15:10:45Z`; calculation timestamp `2026-09-11T15:58:21Z`.
- Reported n: **3328159**; observation unit: eligible finishes (consult method for subgroup/pair denominators); evidence scope: descriptive.
- Contracts: [metadata / cohort / provenance](../public/data/packs/ext_pacing_shapes/pack_meta.json); [answer / chart specifications](../public/data/packs/ext_pacing_shapes/summary.json).
- Tables: [patterns.csv](../public/data/packs/ext_pacing_shapes/tables/patterns.csv), [profile.csv](../public/data/packs/ext_pacing_shapes/tables/profile.csv).

Methods and limitations from this pack:

- For each runner, divide section pace by their full-marathon average pace and subtract one. Plot the median of these individual percentages at each checkpoint; zero is that runner’s own marathon pace. A median curve is not itself one runner’s race and need not integrate to zero.
- Compare elapsed time over 0–20 km with 20–40 km. Faster: more than 2% faster; similar: within 2%; moderate slowing: more than 2% through 10%; pronounced slowing: more than 10%. The final 2.195 km appears in the profile but not this equal-distance classification. These are descriptive categories, not slowdown episodes or measured half-marathon splits.
- Use complete, strictly increasing elapsed checkpoints at 5, 10, 15, 20, 25, 30, 35, 40 and 42.195 km. Clock strings must parse as H:MM:SS or M:SS. No missing splits are interpolated.
- Remove exact duplicate race records, ignoring database IDs, ingestion timestamps and source URLs. Retain finishes from 90 minutes to 12 hours with every section between 2 and 20 minutes per km. These quality filters can exclude genuine unusual performances; the analysis describes this eligible cohort, not every entrant.
- Each observation is a race finish. The same person can appear in multiple races. No runner identities are linked across races. Public cells require at least 100 observations; matched comparisons additionally require at least 20 per group in each stratum.
- Apply the reviewed source-quality edition exclusions for this exact export after the timing checks. Known invalid split grids, incomplete ingestion, unreconciled HOLD editions and a selected top-finisher field do not contribute to the analyses or prior benchmarks. Report source exclusions separately; an already invalid timing row is not counted twice. Missing age or recorded gender alone does not exclude an otherwise eligible finish from the overall cohort. Other sparse editions are not declared incomplete merely from their size.

### ext_performance_profiles

What does an unusually good race look like?

- Producer: [analysis/build_extended.py](../analysis/build_extended.py); display question `r05_exceptional_vs_prior`.
- Calculated state: **ready**; bundle `private-20260911-1107`; input timestamp `2026-09-11T15:10:45Z`; calculation timestamp `2026-09-11T15:59:16Z`.
- Reported n: **524323**; observation unit: eligible finishes; evidence scope: descriptive.
- Contracts: [metadata / cohort / provenance](../public/data/packs/ext_performance_profiles/pack_meta.json); [answer / chart specifications](../public/data/packs/ext_performance_profiles/summary.json).
- Tables: [profiles.csv](../public/data/packs/ext_performance_profiles/tables/profiles.csv).

Methods and limitations from this pack:

- Define a substantially improved performance as a finish more than 2% faster than the recent recorded best. Compare each section’s pace with the full-marathon pace of that earlier benchmark, then plot the median by outcome group.
- For explicitly audited canonical-ID releases, validate unique matching CORE/FULL ID sets and matching recorded edition/name labels, then join by record ID with matching finish and all nine section durations. Legacy exports retain the one-to-one edition, trimmed lowercase name and full-timing join because their IDs are incompatible. Durations are compared to milliseconds. Keep only supplied non-ambiguous runner identities without conflicting recorded gender, inferred birth years spanning more than two years, or duplicate editions. These are candidate cross-race identities, not independently verified people; unlinked runners are absent. The linkage audit records which join was used.
- Recompute the benchmark as the fastest eligible finish in the two strictly earlier calendar years. The current race and every other race in its calendar year are excluded. This avoids guessing within-year chronology and prevents current-outcome leakage. It is a recent recorded best, not a fitness measurement, an expected finish, or a lifetime personal best.
- Performance change is 100 × (current finish / recent recorded best − 1). Negative is faster. Opening change compares 0–10 km pace with that earlier best’s full-marathon pace. Faster opening: more than 2% faster; similar: within 2%; slower: more than 2% slower. The ±2% and ±5% cutoffs are predefined descriptions, not physiological thresholds.
- Use complete, strictly increasing elapsed checkpoints at 5, 10, 15, 20, 25, 30, 35, 40 and 42.195 km. Clock strings must parse as H:MM:SS or M:SS. No missing splits are interpolated.
- Remove exact duplicate race records, ignoring database IDs, ingestion timestamps and source URLs. Retain finishes from 90 minutes to 12 hours with every section between 2 and 20 minutes per km. These quality filters can exclude genuine unusual performances; the analysis describes this eligible cohort, not every entrant.
- Full source records are available in public GitHub Releases. These chart tables require at least 100 eligible observations per cell for estimate reliability. Counts refer to finishes, linked pairs or event observations as specified in that answer.
- These are observational results. Fitness changes, intentions, training, selection into the dataset and unmeasured conditions can explain differences. Outcome percentiles describe variation among performances, not confidence intervals or advice about the best strategy.
- Apply the reviewed source-quality edition exclusions for this exact export after the timing checks. Known invalid split grids, incomplete ingestion, unreconciled HOLD editions and a selected top-finisher field do not contribute to the analyses or prior benchmarks. Report source exclusions separately; an already invalid timing row is not counted twice. Missing age or recorded gender alone does not exclude an otherwise eligible finish from the overall cohort. Other sparse editions are not declared incomplete merely from their size.

### ext_opening_tradeoffs

What are the rewards and risks of an aggressive start?

- Producer: [analysis/build_extended.py](../analysis/build_extended.py); display question `r01_banking_time`.
- Calculated state: **ready**; bundle `private-20260911-1107`; input timestamp `2026-09-11T15:10:45Z`; calculation timestamp `2026-09-11T15:59:16Z`.
- Reported n: **359172**; observation unit: eligible finishes; evidence scope: descriptive.
- Contracts: [metadata / cohort / provenance](../public/data/packs/ext_opening_tradeoffs/pack_meta.json); [answer / chart specifications](../public/data/packs/ext_opening_tradeoffs/summary.json).
- Tables: [matched_openings.csv](../public/data/packs/ext_opening_tradeoffs/tables/matched_openings.csv).

Methods and limitations from this pack:

- Match faster, similar and slower openings within city, year, race, recorded gender and 15-minute bands of recent recorded best. Keep strata with at least 20 in all three groups. Weight every group by the smallest group count in that stratum.
- Show the weighted mean percentage change from the prior benchmark. The lower and upper limits are percentile confidence limits from 500 bootstrap draws of whole race editions, seed 20260908. This captures edition clustering but not dependence when the same runner appears in different editions. No multiple-comparison significance claims are made.
- For explicitly audited canonical-ID releases, validate unique matching CORE/FULL ID sets and matching recorded edition/name labels, then join by record ID with matching finish and all nine section durations. Legacy exports retain the one-to-one edition, trimmed lowercase name and full-timing join because their IDs are incompatible. Durations are compared to milliseconds. Keep only supplied non-ambiguous runner identities without conflicting recorded gender, inferred birth years spanning more than two years, or duplicate editions. These are candidate cross-race identities, not independently verified people; unlinked runners are absent. The linkage audit records which join was used.
- Recompute the benchmark as the fastest eligible finish in the two strictly earlier calendar years. The current race and every other race in its calendar year are excluded. This avoids guessing within-year chronology and prevents current-outcome leakage. It is a recent recorded best, not a fitness measurement, an expected finish, or a lifetime personal best.
- Performance change is 100 × (current finish / recent recorded best − 1). Negative is faster. Opening change compares 0–10 km pace with that earlier best’s full-marathon pace. Faster opening: more than 2% faster; similar: within 2%; slower: more than 2% slower. The ±2% and ±5% cutoffs are predefined descriptions, not physiological thresholds.
- Use complete, strictly increasing elapsed checkpoints at 5, 10, 15, 20, 25, 30, 35, 40 and 42.195 km. Clock strings must parse as H:MM:SS or M:SS. No missing splits are interpolated.
- Remove exact duplicate race records, ignoring database IDs, ingestion timestamps and source URLs. Retain finishes from 90 minutes to 12 hours with every section between 2 and 20 minutes per km. These quality filters can exclude genuine unusual performances; the analysis describes this eligible cohort, not every entrant.
- Full source records are available in public GitHub Releases. These chart tables require at least 100 eligible observations per cell for estimate reliability. Counts refer to finishes, linked pairs or event observations as specified in that answer.
- These are observational results. Fitness changes, intentions, training, selection into the dataset and unmeasured conditions can explain differences. Outcome percentiles describe variation among performances, not confidence intervals or advice about the best strategy.
- Apply the reviewed source-quality edition exclusions for this exact export after the timing checks. Known invalid split grids, incomplete ingestion, unreconciled HOLD editions and a selected top-finisher field do not contribute to the analyses or prior benchmarks. Report source exclusions separately; an already invalid timing row is not counted twice. Missing age or recorded gender alone does not exclude an otherwise eligible finish from the overall cohort. Other sparse editions are not declared incomplete merely from their size.

### ext_slow_start_responses

How do runners successfully respond to a slow start?

- Producer: [analysis/build_extended.py](../analysis/build_extended.py); display question `r02_recover_slow_start`.
- Calculated state: **ready**; bundle `private-20260911-1107`; input timestamp `2026-09-11T15:10:45Z`; calculation timestamp `2026-09-11T15:59:16Z`.
- Reported n: **44688**; observation unit: eligible finishes; evidence scope: descriptive.
- Contracts: [metadata / cohort / provenance](../public/data/packs/ext_slow_start_responses/pack_meta.json); [answer / chart specifications](../public/data/packs/ext_slow_start_responses/summary.json).
- Tables: [responses.csv](../public/data/packs/ext_slow_start_responses/tables/responses.csv).

Methods and limitations from this pack:

- A slow start is 0–5 km pace more than 5% slower than the earlier benchmark’s average. Group the change from 0–5 to 5–10 km as more than 5% acceleration, 2–5% acceleration, or less acceleration/slowing. Plot the 10th, 50th and 90th percentiles of final performance change. These groups are not matched on course or fitness.
- For explicitly audited canonical-ID releases, validate unique matching CORE/FULL ID sets and matching recorded edition/name labels, then join by record ID with matching finish and all nine section durations. Legacy exports retain the one-to-one edition, trimmed lowercase name and full-timing join because their IDs are incompatible. Durations are compared to milliseconds. Keep only supplied non-ambiguous runner identities without conflicting recorded gender, inferred birth years spanning more than two years, or duplicate editions. These are candidate cross-race identities, not independently verified people; unlinked runners are absent. The linkage audit records which join was used.
- Recompute the benchmark as the fastest eligible finish in the two strictly earlier calendar years. The current race and every other race in its calendar year are excluded. This avoids guessing within-year chronology and prevents current-outcome leakage. It is a recent recorded best, not a fitness measurement, an expected finish, or a lifetime personal best.
- Performance change is 100 × (current finish / recent recorded best − 1). Negative is faster. Opening change compares 0–10 km pace with that earlier best’s full-marathon pace. Faster opening: more than 2% faster; similar: within 2%; slower: more than 2% slower. The ±2% and ±5% cutoffs are predefined descriptions, not physiological thresholds.
- Use complete, strictly increasing elapsed checkpoints at 5, 10, 15, 20, 25, 30, 35, 40 and 42.195 km. Clock strings must parse as H:MM:SS or M:SS. No missing splits are interpolated.
- Remove exact duplicate race records, ignoring database IDs, ingestion timestamps and source URLs. Retain finishes from 90 minutes to 12 hours with every section between 2 and 20 minutes per km. These quality filters can exclude genuine unusual performances; the analysis describes this eligible cohort, not every entrant.
- Full source records are available in public GitHub Releases. These chart tables require at least 100 eligible observations per cell for estimate reliability. Counts refer to finishes, linked pairs or event observations as specified in that answer.
- These are observational results. Fitness changes, intentions, training, selection into the dataset and unmeasured conditions can explain differences. Outcome percentiles describe variation among performances, not confidence intervals or advice about the best strategy.
- Apply the reviewed source-quality edition exclusions for this exact export after the timing checks. Known invalid split grids, incomplete ingestion, unreconciled HOLD editions and a selected top-finisher field do not contribute to the analyses or prior benchmarks. Report source exclusions separately; an already invalid timing row is not counted twice. Missing age or recorded gender alone does not exclude an otherwise eligible finish from the overall cohort. Other sparse editions are not declared incomplete merely from their size.

### ext_pace_trend_at_20k

Can two runners reach 20 km together but have different prospects?

- Producer: [analysis/build_pacing.py](../analysis/build_pacing.py); display question `r03_accel_vs_decel_20k`.
- Calculated state: **ready**; bundle `private-20260911-1107`; input timestamp `2026-09-11T15:10:45Z`; calculation timestamp `2026-09-11T15:58:21Z`.
- Reported n: **1891811**; observation unit: eligible finishes (consult method for subgroup/pair denominators); evidence scope: descriptive.
- Contracts: [metadata / cohort / provenance](../public/data/packs/ext_pace_trend_at_20k/pack_meta.json); [answer / chart specifications](../public/data/packs/ext_pace_trend_at_20k/summary.json).
- Tables: [matched_trends.csv](../public/data/packs/ext_pace_trend_at_20k/tables/matched_trends.csv).

Methods and limitations from this pack:

- Compare the 15–20 km pace with 10–15 km. Accelerating is more than 2% faster, slowing more than 2% slower, and steady within 2%. Match within city, year, race and the same floored minute of elapsed time at 20 km.
- Only strata with at least 20 finishes in each of the three groups qualify. Use the smallest group count as each stratum’s common weight for all three groups, then average the within-stratum finish-time differences versus steady. Sample counts are actual observations, not matching weights.
- Runners arrive within the same 60-second band, not at an identical instant. Prior fitness and runner intention are unknown. This is a conditional association, not proof that accelerating causes a better finish or an out-of-sample prediction.
- Use complete, strictly increasing elapsed checkpoints at 5, 10, 15, 20, 25, 30, 35, 40 and 42.195 km. Clock strings must parse as H:MM:SS or M:SS. No missing splits are interpolated.
- Remove exact duplicate race records, ignoring database IDs, ingestion timestamps and source URLs. Retain finishes from 90 minutes to 12 hours with every section between 2 and 20 minutes per km. These quality filters can exclude genuine unusual performances; the analysis describes this eligible cohort, not every entrant.
- Each observation is a race finish. The same person can appear in multiple races. No runner identities are linked across races. Public cells require at least 100 observations; matched comparisons additionally require at least 20 per group in each stratum.
- Apply the reviewed source-quality edition exclusions for this exact export after the timing checks. Known invalid split grids, incomplete ingestion, unreconciled HOLD editions and a selected top-finisher field do not contribute to the analyses or prior benchmarks. Report source exclusions separately; an already invalid timing row is not counted twice. Missing age or recorded gender alone does not exclude an otherwise eligible finish from the overall cohort. Other sparse editions are not declared incomplete merely from their size.

### ext_checkpoint_forecast_validation

How early can the splits reveal how the race will finish?

- Producer: [analysis/build_extended.py](../analysis/build_extended.py); display question `r08_early_blowup_signal`.
- Calculated state: **ready**; bundle `private-20260911-1107`; input timestamp `2026-09-11T15:10:45Z`; calculation timestamp `2026-09-11T15:59:16Z`.
- Reported n: **861691**; observation unit: eligible finishes; evidence scope: validated forecast.
- Contracts: [metadata / cohort / provenance](../public/data/packs/ext_checkpoint_forecast_validation/pack_meta.json); [answer / chart specifications](../public/data/packs/ext_checkpoint_forecast_validation/summary.json).
- Tables: [calibration.csv](../public/data/packs/ext_checkpoint_forecast_validation/tables/calibration.csv), [errors.csv](../public/data/packs/ext_checkpoint_forecast_validation/tables/errors.csv).

Methods and limitations from this pack:

- At each checkpoint, start with elapsed time × 42.195 / distance. The elapsed-only model multiplies this by the training median actual/projected ratio in 30-second-per-km elapsed-pace bands. The trend model adds the most recent section’s change from the previous section (faster than −2%, within ±2%, or slower than +2%). At 5 km no trend exists.
- Hold out the latest three observed calendar years (2024–2026). Fit every factor and the 10th–90th percentile ratio interval on earlier years only. Training cells need at least 100 records; missing trend cells fall back to the pace-band model, then the pooled training model. No future splits, finishing-time groups, identities or supplied ability fields enter a prediction.
- Report median absolute error for all three methods, plus observed coverage and median width of the nominal 80% prediction interval and the 90th percentile absolute error. Model selection is fixed before examining these results. A runner may occur in training and test in different years; identities are not used. Results apply to complete eligible finishers and do not predict withdrawals.
- Use complete, strictly increasing elapsed checkpoints at 5, 10, 15, 20, 25, 30, 35, 40 and 42.195 km. Clock strings must parse as H:MM:SS or M:SS. No missing splits are interpolated.
- Remove exact duplicate race records, ignoring database IDs, ingestion timestamps and source URLs. Retain finishes from 90 minutes to 12 hours with every section between 2 and 20 minutes per km. These quality filters can exclude genuine unusual performances; the analysis describes this eligible cohort, not every entrant.
- Full source records are available in public GitHub Releases. These chart tables require at least 100 eligible observations per cell for estimate reliability. Counts refer to finishes, linked pairs or event observations as specified in that answer.
- These are observational results. Fitness changes, intentions, training, selection into the dataset and unmeasured conditions can explain differences. Outcome percentiles describe variation among performances, not confidence intervals or advice about the best strategy.
- Apply the reviewed source-quality edition exclusions for this exact export after the timing checks. Known invalid split grids, incomplete ingestion, unreconciled HOLD editions and a selected top-finisher field do not contribute to the analyses or prior benchmarks. Report source exclusions separately; an already invalid timing row is not counted twice. Missing age or recorded gender alone does not exclude an otherwise eligible finish from the overall cohort. Other sparse editions are not declared incomplete merely from their size.

### ext_bad_patch_recovery

When can runners regain their rhythm after a bad patch?

- Producer: [analysis/build_extended.py](../analysis/build_extended.py); display question `r09_bad_patch_recoverable`.
- Calculated state: **ready**; bundle `private-20260911-1107`; input timestamp `2026-09-11T15:10:45Z`; calculation timestamp `2026-09-11T15:59:16Z`.
- Reported n: **1039878**; observation unit: eligible finishes; evidence scope: descriptive.
- Contracts: [metadata / cohort / provenance](../public/data/packs/ext_bad_patch_recovery/pack_meta.json); [answer / chart specifications](../public/data/packs/ext_bad_patch_recovery/summary.json).
- Tables: [recovery.csv](../public/data/packs/ext_bad_patch_recovery/tables/recovery.csv).

Methods and limitations from this pack:

- Scan 20–25, 25–30 and 30–35 km in order. A patch is the first section more than 10% slower than both the immediately preceding section and the 5–20 km baseline pace. Recovery means the next full 5 km is no more than 5% slower than that baseline.
- Every runner contributes at most one patch. The outcome is next-section recovery, not a diagnosis or necessarily a return maintained to the finish. Course sections and different runner mixes can account for differences across distances. Five-kilometer timing cannot distinguish stops, walking, fatigue or terrain.
- Use complete, strictly increasing elapsed checkpoints at 5, 10, 15, 20, 25, 30, 35, 40 and 42.195 km. Clock strings must parse as H:MM:SS or M:SS. No missing splits are interpolated.
- Remove exact duplicate race records, ignoring database IDs, ingestion timestamps and source URLs. Retain finishes from 90 minutes to 12 hours with every section between 2 and 20 minutes per km. These quality filters can exclude genuine unusual performances; the analysis describes this eligible cohort, not every entrant.
- Full source records are available in public GitHub Releases. These chart tables require at least 100 eligible observations per cell for estimate reliability. Counts refer to finishes, linked pairs or event observations as specified in that answer.
- These are observational results. Fitness changes, intentions, training, selection into the dataset and unmeasured conditions can explain differences. Outcome percentiles describe variation among performances, not confidence intervals or advice about the best strategy.
- Apply the reviewed source-quality edition exclusions for this exact export after the timing checks. Known invalid split grids, incomplete ingestion, unreconciled HOLD editions and a selected top-finisher field do not contribute to the analyses or prior benchmarks. Report source exclusions separately; an already invalid timing row is not counted twice. Missing age or recorded gender alone does not exclude an otherwise eligible finish from the overall cohort. Other sparse editions are not declared incomplete merely from their size.

### ext_split_pattern_success

Is a negative split always associated with a better performance?

- Producer: [analysis/build_extended.py](../analysis/build_extended.py); display question `r30_negative_split_success`.
- Calculated state: **ready**; bundle `private-20260911-1107`; input timestamp `2026-09-11T15:10:45Z`; calculation timestamp `2026-09-11T15:59:16Z`.
- Reported n: **524323**; observation unit: eligible finishes; evidence scope: descriptive.
- Contracts: [metadata / cohort / provenance](../public/data/packs/ext_split_pattern_success/pack_meta.json); [answer / chart specifications](../public/data/packs/ext_split_pattern_success/summary.json).
- Tables: [success_rates.csv](../public/data/packs/ext_split_pattern_success/tables/success_rates.csv).

Methods and limitations from this pack:

- Within each complete-race pattern, divide finishes more than 2% faster than the earlier benchmark by all linked finishes with that pattern. This conditions on a pattern known after the finish; it is a retrospective association, not a pre-race strategy trial.
- For explicitly audited canonical-ID releases, validate unique matching CORE/FULL ID sets and matching recorded edition/name labels, then join by record ID with matching finish and all nine section durations. Legacy exports retain the one-to-one edition, trimmed lowercase name and full-timing join because their IDs are incompatible. Durations are compared to milliseconds. Keep only supplied non-ambiguous runner identities without conflicting recorded gender, inferred birth years spanning more than two years, or duplicate editions. These are candidate cross-race identities, not independently verified people; unlinked runners are absent. The linkage audit records which join was used.
- Recompute the benchmark as the fastest eligible finish in the two strictly earlier calendar years. The current race and every other race in its calendar year are excluded. This avoids guessing within-year chronology and prevents current-outcome leakage. It is a recent recorded best, not a fitness measurement, an expected finish, or a lifetime personal best.
- Performance change is 100 × (current finish / recent recorded best − 1). Negative is faster. Opening change compares 0–10 km pace with that earlier best’s full-marathon pace. Faster opening: more than 2% faster; similar: within 2%; slower: more than 2% slower. The ±2% and ±5% cutoffs are predefined descriptions, not physiological thresholds.
- Use complete, strictly increasing elapsed checkpoints at 5, 10, 15, 20, 25, 30, 35, 40 and 42.195 km. Clock strings must parse as H:MM:SS or M:SS. No missing splits are interpolated.
- Remove exact duplicate race records, ignoring database IDs, ingestion timestamps and source URLs. Retain finishes from 90 minutes to 12 hours with every section between 2 and 20 minutes per km. These quality filters can exclude genuine unusual performances; the analysis describes this eligible cohort, not every entrant.
- Full source records are available in public GitHub Releases. These chart tables require at least 100 eligible observations per cell for estimate reliability. Counts refer to finishes, linked pairs or event observations as specified in that answer.
- These are observational results. Fitness changes, intentions, training, selection into the dataset and unmeasured conditions can explain differences. Outcome percentiles describe variation among performances, not confidence intervals or advice about the best strategy.
- Apply the reviewed source-quality edition exclusions for this exact export after the timing checks. Known invalid split grids, incomplete ingestion, unreconciled HOLD editions and a selected top-finisher field do not contribute to the analyses or prior benchmarks. Report source exclusions separately; an already invalid timing row is not counted twice. Missing age or recorded gender alone does not exclude an otherwise eligible finish from the overall cohort. Other sparse editions are not declared incomplete merely from their size.

### ext_successful_race_shapes

Is there one good pacing strategy, or several?

- Producer: [analysis/build_extended.py](../analysis/build_extended.py); display question `r31_multiple_good_strategies`.
- Calculated state: **ready**; bundle `private-20260911-1107`; input timestamp `2026-09-11T15:10:45Z`; calculation timestamp `2026-09-11T15:59:16Z`.
- Reported n: **170906**; observation unit: eligible finishes; evidence scope: descriptive.
- Contracts: [metadata / cohort / provenance](../public/data/packs/ext_successful_race_shapes/pack_meta.json); [answer / chart specifications](../public/data/packs/ext_successful_race_shapes/summary.json).
- Tables: [pattern_mix.csv](../public/data/packs/ext_successful_race_shapes/tables/pattern_mix.csv).

Methods and limitations from this pack:

- Restrict to finishes more than 2% faster than the recent recorded best. Divide the number in each equal-distance pattern by all such improved finishes. Suppress any pattern with fewer than 100 improved finishes; if a pattern is suppressed, visible shares need not sum to 100.
- For explicitly audited canonical-ID releases, validate unique matching CORE/FULL ID sets and matching recorded edition/name labels, then join by record ID with matching finish and all nine section durations. Legacy exports retain the one-to-one edition, trimmed lowercase name and full-timing join because their IDs are incompatible. Durations are compared to milliseconds. Keep only supplied non-ambiguous runner identities without conflicting recorded gender, inferred birth years spanning more than two years, or duplicate editions. These are candidate cross-race identities, not independently verified people; unlinked runners are absent. The linkage audit records which join was used.
- Recompute the benchmark as the fastest eligible finish in the two strictly earlier calendar years. The current race and every other race in its calendar year are excluded. This avoids guessing within-year chronology and prevents current-outcome leakage. It is a recent recorded best, not a fitness measurement, an expected finish, or a lifetime personal best.
- Performance change is 100 × (current finish / recent recorded best − 1). Negative is faster. Opening change compares 0–10 km pace with that earlier best’s full-marathon pace. Faster opening: more than 2% faster; similar: within 2%; slower: more than 2% slower. The ±2% and ±5% cutoffs are predefined descriptions, not physiological thresholds.
- Use complete, strictly increasing elapsed checkpoints at 5, 10, 15, 20, 25, 30, 35, 40 and 42.195 km. Clock strings must parse as H:MM:SS or M:SS. No missing splits are interpolated.
- Remove exact duplicate race records, ignoring database IDs, ingestion timestamps and source URLs. Retain finishes from 90 minutes to 12 hours with every section between 2 and 20 minutes per km. These quality filters can exclude genuine unusual performances; the analysis describes this eligible cohort, not every entrant.
- Full source records are available in public GitHub Releases. These chart tables require at least 100 eligible observations per cell for estimate reliability. Counts refer to finishes, linked pairs or event observations as specified in that answer.
- These are observational results. Fitness changes, intentions, training, selection into the dataset and unmeasured conditions can explain differences. Outcome percentiles describe variation among performances, not confidence intervals or advice about the best strategy.
- Apply the reviewed source-quality edition exclusions for this exact export after the timing checks. Known invalid split grids, incomplete ingestion, unreconciled HOLD editions and a selected top-finisher field do not contribute to the analyses or prior benchmarks. Report source exclusions separately; an already invalid timing row is not counted twice. Missing age or recorded gender alone does not exclude an otherwise eligible finish from the overall cohort. Other sparse editions are not declared incomplete merely from their size.

### ext_strategy_outcome_spread

Which pacing approaches offer consistency, and which are more variable?

- Producer: [analysis/build_extended.py](../analysis/build_extended.py); display question `r34_pacing_risk_reward`.
- Calculated state: **ready**; bundle `private-20260911-1107`; input timestamp `2026-09-11T15:10:45Z`; calculation timestamp `2026-09-11T15:59:16Z`.
- Reported n: **524323**; observation unit: eligible finishes; evidence scope: descriptive.
- Contracts: [metadata / cohort / provenance](../public/data/packs/ext_strategy_outcome_spread/pack_meta.json); [answer / chart specifications](../public/data/packs/ext_strategy_outcome_spread/summary.json).
- Tables: [shortfalls.csv](../public/data/packs/ext_strategy_outcome_spread/tables/shortfalls.csv), [spread.csv](../public/data/packs/ext_strategy_outcome_spread/tables/spread.csv).

Methods and limitations from this pack:

- Within each prior-time band and opening group, calculate the 10th, 50th and 90th percentiles of finish-time percentage change. Also calculate the share more than 5% slower than the earlier benchmark. These distributions are unadjusted for course and edition, and describe observed finishers only.
- For explicitly audited canonical-ID releases, validate unique matching CORE/FULL ID sets and matching recorded edition/name labels, then join by record ID with matching finish and all nine section durations. Legacy exports retain the one-to-one edition, trimmed lowercase name and full-timing join because their IDs are incompatible. Durations are compared to milliseconds. Keep only supplied non-ambiguous runner identities without conflicting recorded gender, inferred birth years spanning more than two years, or duplicate editions. These are candidate cross-race identities, not independently verified people; unlinked runners are absent. The linkage audit records which join was used.
- Recompute the benchmark as the fastest eligible finish in the two strictly earlier calendar years. The current race and every other race in its calendar year are excluded. This avoids guessing within-year chronology and prevents current-outcome leakage. It is a recent recorded best, not a fitness measurement, an expected finish, or a lifetime personal best.
- Performance change is 100 × (current finish / recent recorded best − 1). Negative is faster. Opening change compares 0–10 km pace with that earlier best’s full-marathon pace. Faster opening: more than 2% faster; similar: within 2%; slower: more than 2% slower. The ±2% and ±5% cutoffs are predefined descriptions, not physiological thresholds.
- Use complete, strictly increasing elapsed checkpoints at 5, 10, 15, 20, 25, 30, 35, 40 and 42.195 km. Clock strings must parse as H:MM:SS or M:SS. No missing splits are interpolated.
- Remove exact duplicate race records, ignoring database IDs, ingestion timestamps and source URLs. Retain finishes from 90 minutes to 12 hours with every section between 2 and 20 minutes per km. These quality filters can exclude genuine unusual performances; the analysis describes this eligible cohort, not every entrant.
- Full source records are available in public GitHub Releases. These chart tables require at least 100 eligible observations per cell for estimate reliability. Counts refer to finishes, linked pairs or event observations as specified in that answer.
- These are observational results. Fitness changes, intentions, training, selection into the dataset and unmeasured conditions can explain differences. Outcome percentiles describe variation among performances, not confidence intervals or advice about the best strategy.
- Apply the reviewed source-quality edition exclusions for this exact export after the timing checks. Known invalid split grids, incomplete ingestion, unreconciled HOLD editions and a selected top-finisher field do not contribute to the analyses or prior benchmarks. Report source exclusions separately; an already invalid timing row is not counted twice. Missing age or recorded gender alone does not exclude an otherwise eligible finish from the overall cohort. Other sparse editions are not declared incomplete merely from their size.

### ext_course_pacing_profiles

What is each course’s pacing fingerprint?

- Producer: [analysis/build_pacing.py](../analysis/build_pacing.py); display question `s3_course_breaks`.
- Calculated state: **ready**; bundle `private-20260911-1107`; input timestamp `2026-09-11T15:10:45Z`; calculation timestamp `2026-09-11T15:58:21Z`.
- Reported n: **3328159**; observation unit: eligible finishes (consult method for subgroup/pair denominators); evidence scope: descriptive.
- Contracts: [metadata / cohort / provenance](../public/data/packs/ext_course_pacing_profiles/pack_meta.json); [answer / chart specifications](../public/data/packs/ext_course_pacing_profiles/summary.json).
- Tables: [course_profiles.csv](../public/data/packs/ext_course_pacing_profiles/tables/course_profiles.csv).

Methods and limitations from this pack:

- Compute individual section pace relative to each runner’s full-marathon average, then take the median by city and section. Every checkpoint within a city uses the same complete-record cohort.
- Cities pool available race editions. Terrain, weather, field composition and route changes are not separated. Course-profile validity years are absent from CORE, so historical elevation has not been assigned to these runners.
- Use complete, strictly increasing elapsed checkpoints at 5, 10, 15, 20, 25, 30, 35, 40 and 42.195 km. Clock strings must parse as H:MM:SS or M:SS. No missing splits are interpolated.
- Remove exact duplicate race records, ignoring database IDs, ingestion timestamps and source URLs. Retain finishes from 90 minutes to 12 hours with every section between 2 and 20 minutes per km. These quality filters can exclude genuine unusual performances; the analysis describes this eligible cohort, not every entrant.
- Each observation is a race finish. The same person can appear in multiple races. No runner identities are linked across races. Public cells require at least 100 observations; matched comparisons additionally require at least 20 per group in each stratum.
- Apply the reviewed source-quality edition exclusions for this exact export after the timing checks. Known invalid split grids, incomplete ingestion, unreconciled HOLD editions and a selected top-finisher field do not contribute to the analyses or prior benchmarks. Report source exclusions separately; an already invalid timing row is not counted twice. Missing age or recorded gender alone does not exclude an otherwise eligible finish from the overall cohort. Other sparse editions are not declared incomplete merely from their size.

### ext_terrain_pacing_proxy

How do runners adjust their pace to climbs and descents?

- Producer: [analysis/build_extended.py](../analysis/build_extended.py); display question `r11_course_section_traps`.
- Calculated state: **ready**; bundle `private-20260911-1107`; input timestamp `2026-09-11T15:10:45Z`; calculation timestamp `2026-09-11T15:59:16Z`.
- Reported n: **3325197**; observation unit: eligible finishes; evidence scope: route proxy.
- Contracts: [metadata / cohort / provenance](../public/data/packs/ext_terrain_pacing_proxy/pack_meta.json); [answer / chart specifications](../public/data/packs/ext_terrain_pacing_proxy/summary.json).
- Tables: [terrain.csv](../public/data/packs/ext_terrain_pacing_proxy/tables/terrain.csv).

Methods and limitations from this pack:

- Join a unique supplied course segment by city and exact checkpoint distance. Classify net grade above +0.15% as uphill, below −0.15% as downhill and the remainder near level. At each distance, plot median individual section pace relative to that runner’s full-marathon average.
- The course profiles use GPX geometry and digital elevation models, sometimes smoothed over 800 m. Net grade conceals mixed climbs and descents; bridge decks, tunnels and route changes may be wrong. Historical races are compared with the available city profile as a proxy only. Different terrain groups contain different courses and fields; no causal hill penalty or physiological effort is inferred.
- Use complete, strictly increasing elapsed checkpoints at 5, 10, 15, 20, 25, 30, 35, 40 and 42.195 km. Clock strings must parse as H:MM:SS or M:SS. No missing splits are interpolated.
- Remove exact duplicate race records, ignoring database IDs, ingestion timestamps and source URLs. Retain finishes from 90 minutes to 12 hours with every section between 2 and 20 minutes per km. These quality filters can exclude genuine unusual performances; the analysis describes this eligible cohort, not every entrant.
- Full source records are available in public GitHub Releases. These chart tables require at least 100 eligible observations per cell for estimate reliability. Counts refer to finishes, linked pairs or event observations as specified in that answer.
- These are observational results. Fitness changes, intentions, training, selection into the dataset and unmeasured conditions can explain differences. Outcome percentiles describe variation among performances, not confidence intervals or advice about the best strategy.
- Apply the reviewed source-quality edition exclusions for this exact export after the timing checks. Known invalid split grids, incomplete ingestion, unreconciled HOLD editions and a selected top-finisher field do not contribute to the analyses or prior benchmarks. Report source exclusions separately; an already invalid timing row is not counted twice. Missing age or recorded gender alone does not exclude an otherwise eligible finish from the overall cohort. Other sparse editions are not declared incomplete merely from their size.

### ext_paired_course_comparisons

What would your time be on another course?

- Producer: [analysis/build_extended.py](../analysis/build_extended.py); display question `r12_fastest_by_ability`.
- Calculated state: **ready**; bundle `private-20260911-1107`; input timestamp `2026-09-11T15:10:45Z`; calculation timestamp `2026-09-11T15:59:16Z`.
- Reported n: **82987**; observation unit: linked race pairs; evidence scope: partial comparison.
- Contracts: [metadata / cohort / provenance](../public/data/packs/ext_paired_course_comparisons/pack_meta.json); [answer / chart specifications](../public/data/packs/ext_paired_course_comparisons/summary.json).
- Tables: [course_pairs.csv](../public/data/packs/ext_paired_course_comparisons/tables/course_pairs.csv).

Methods and limitations from this pack:

- Use consecutive linked races in different calendar years, at most three years apart, with one recorded eligible race in each endpoint year. For each course pair, calculate the mean destination-minus-origin finish time separately for runners taking each race order, then average those two means equally.
- Require at least 20 pairs in each order and at least 100 overall. Balancing order reduces simple order imbalance but cannot remove fitness, weather, aging, motivation or entry-selection effects. The same runner can supply more than one pair. Positive means a slower finish at the destination.
- For explicitly audited canonical-ID releases, validate unique matching CORE/FULL ID sets and matching recorded edition/name labels, then join by record ID with matching finish and all nine section durations. Legacy exports retain the one-to-one edition, trimmed lowercase name and full-timing join because their IDs are incompatible. Durations are compared to milliseconds. Keep only supplied non-ambiguous runner identities without conflicting recorded gender, inferred birth years spanning more than two years, or duplicate editions. These are candidate cross-race identities, not independently verified people; unlinked runners are absent. The linkage audit records which join was used.
- Use complete, strictly increasing elapsed checkpoints at 5, 10, 15, 20, 25, 30, 35, 40 and 42.195 km. Clock strings must parse as H:MM:SS or M:SS. No missing splits are interpolated.
- Remove exact duplicate race records, ignoring database IDs, ingestion timestamps and source URLs. Retain finishes from 90 minutes to 12 hours with every section between 2 and 20 minutes per km. These quality filters can exclude genuine unusual performances; the analysis describes this eligible cohort, not every entrant.
- Full source records are available in public GitHub Releases. These chart tables require at least 100 eligible observations per cell for estimate reliability. Counts refer to finishes, linked pairs or event observations as specified in that answer.
- These are observational results. Fitness changes, intentions, training, selection into the dataset and unmeasured conditions can explain differences. Outcome percentiles describe variation among performances, not confidence intervals or advice about the best strategy.
- Apply the reviewed source-quality edition exclusions for this exact export after the timing checks. Known invalid split grids, incomplete ingestion, unreconciled HOLD editions and a selected top-finisher field do not contribute to the analyses or prior benchmarks. Report source exclusions separately; an already invalid timing row is not counted twice. Missing age or recorded gender alone does not exclude an otherwise eligible finish from the overall cohort. Other sparse editions are not declared incomplete merely from their size.

### ext_course_outcome_spread

Which marathon offers speed, and which offers consistency?

- Producer: [analysis/build_extended.py](../analysis/build_extended.py); display question `r13_great_day_vs_consistency`.
- Calculated state: **ready**; bundle `private-20260911-1107`; input timestamp `2026-09-11T15:10:45Z`; calculation timestamp `2026-09-11T15:59:16Z`.
- Reported n: **524323**; observation unit: eligible finishes; evidence scope: descriptive.
- Contracts: [metadata / cohort / provenance](../public/data/packs/ext_course_outcome_spread/pack_meta.json); [answer / chart specifications](../public/data/packs/ext_course_outcome_spread/summary.json).
- Tables: [course_spread.csv](../public/data/packs/ext_course_outcome_spread/tables/course_spread.csv).

Methods and limitations from this pack:

- Within city and prior-time band, report the 10th, 50th and 90th percentiles of finish-time change versus the earlier benchmark. Pool available editions and require at least 100 observations per city and band. A wide percentile range describes individual variation, not uncertainty in the median.
- For explicitly audited canonical-ID releases, validate unique matching CORE/FULL ID sets and matching recorded edition/name labels, then join by record ID with matching finish and all nine section durations. Legacy exports retain the one-to-one edition, trimmed lowercase name and full-timing join because their IDs are incompatible. Durations are compared to milliseconds. Keep only supplied non-ambiguous runner identities without conflicting recorded gender, inferred birth years spanning more than two years, or duplicate editions. These are candidate cross-race identities, not independently verified people; unlinked runners are absent. The linkage audit records which join was used.
- Recompute the benchmark as the fastest eligible finish in the two strictly earlier calendar years. The current race and every other race in its calendar year are excluded. This avoids guessing within-year chronology and prevents current-outcome leakage. It is a recent recorded best, not a fitness measurement, an expected finish, or a lifetime personal best.
- Performance change is 100 × (current finish / recent recorded best − 1). Negative is faster. Opening change compares 0–10 km pace with that earlier best’s full-marathon pace. Faster opening: more than 2% faster; similar: within 2%; slower: more than 2% slower. The ±2% and ±5% cutoffs are predefined descriptions, not physiological thresholds.
- Use complete, strictly increasing elapsed checkpoints at 5, 10, 15, 20, 25, 30, 35, 40 and 42.195 km. Clock strings must parse as H:MM:SS or M:SS. No missing splits are interpolated.
- Remove exact duplicate race records, ignoring database IDs, ingestion timestamps and source URLs. Retain finishes from 90 minutes to 12 hours with every section between 2 and 20 minutes per km. These quality filters can exclude genuine unusual performances; the analysis describes this eligible cohort, not every entrant.
- Full source records are available in public GitHub Releases. These chart tables require at least 100 eligible observations per cell for estimate reliability. Counts refer to finishes, linked pairs or event observations as specified in that answer.
- These are observational results. Fitness changes, intentions, training, selection into the dataset and unmeasured conditions can explain differences. Outcome percentiles describe variation among performances, not confidence intervals or advice about the best strategy.
- Apply the reviewed source-quality edition exclusions for this exact export after the timing checks. Known invalid split grids, incomplete ingestion, unreconciled HOLD editions and a selected top-finisher field do not contribute to the analyses or prior benchmarks. Report source exclusions separately; an already invalid timing row is not counted twice. Missing age or recorded gender alone does not exclude an otherwise eligible finish from the overall cohort. Other sparse editions are not declared incomplete merely from their size.

### ext_course_familiarity

Does knowing the course improve execution?

- Producer: [analysis/build_extended.py](../analysis/build_extended.py); display question `r14_knowing_course`.
- Calculated state: **ready**; bundle `private-20260911-1107`; input timestamp `2026-09-11T15:10:45Z`; calculation timestamp `2026-09-11T15:59:16Z`.
- Reported n: **258554**; observation unit: eligible finishes; evidence scope: descriptive.
- Contracts: [metadata / cohort / provenance](../public/data/packs/ext_course_familiarity/pack_meta.json); [answer / chart specifications](../public/data/packs/ext_course_familiarity/summary.json).
- Tables: [familiarity.csv](../public/data/packs/ext_course_familiarity/tables/familiarity.csv).

Methods and limitations from this pack:

- Familiar means at least one eligible linked appearance in the same city in an earlier calendar year. Match familiar and first-recorded groups within edition, recorded gender and 15-minute prior-time bands; each group needs 20 finishes per stratum. Use the smaller stratum count as a common weight.
- The outcome is mean percentage change from 0–20 to 20–40 km. Both groups have some prior recorded marathon history, but familiarity itself is not randomly assigned. Route changes and visits absent from the dataset are unknown.
- For explicitly audited canonical-ID releases, validate unique matching CORE/FULL ID sets and matching recorded edition/name labels, then join by record ID with matching finish and all nine section durations. Legacy exports retain the one-to-one edition, trimmed lowercase name and full-timing join because their IDs are incompatible. Durations are compared to milliseconds. Keep only supplied non-ambiguous runner identities without conflicting recorded gender, inferred birth years spanning more than two years, or duplicate editions. These are candidate cross-race identities, not independently verified people; unlinked runners are absent. The linkage audit records which join was used.
- Recompute the benchmark as the fastest eligible finish in the two strictly earlier calendar years. The current race and every other race in its calendar year are excluded. This avoids guessing within-year chronology and prevents current-outcome leakage. It is a recent recorded best, not a fitness measurement, an expected finish, or a lifetime personal best.
- Performance change is 100 × (current finish / recent recorded best − 1). Negative is faster. Opening change compares 0–10 km pace with that earlier best’s full-marathon pace. Faster opening: more than 2% faster; similar: within 2%; slower: more than 2% slower. The ±2% and ±5% cutoffs are predefined descriptions, not physiological thresholds.
- Use complete, strictly increasing elapsed checkpoints at 5, 10, 15, 20, 25, 30, 35, 40 and 42.195 km. Clock strings must parse as H:MM:SS or M:SS. No missing splits are interpolated.
- Remove exact duplicate race records, ignoring database IDs, ingestion timestamps and source URLs. Retain finishes from 90 minutes to 12 hours with every section between 2 and 20 minutes per km. These quality filters can exclude genuine unusual performances; the analysis describes this eligible cohort, not every entrant.
- Full source records are available in public GitHub Releases. These chart tables require at least 100 eligible observations per cell for estimate reliability. Counts refer to finishes, linked pairs or event observations as specified in that answer.
- These are observational results. Fitness changes, intentions, training, selection into the dataset and unmeasured conditions can explain differences. Outcome percentiles describe variation among performances, not confidence intervals or advice about the best strategy.
- Apply the reviewed source-quality edition exclusions for this exact export after the timing checks. Known invalid split grids, incomplete ingestion, unreconciled HOLD editions and a selected top-finisher field do not contribute to the analyses or prior benchmarks. Report source exclusions separately; an already invalid timing row is not counted twice. Missing age or recorded gender alone does not exclude an otherwise eligible finish from the overall cohort. Other sparse editions are not declared incomplete merely from their size.

### ext_weather_pacing_patterns

How does weather change the way a marathon is run?

- Producer: [analysis/build_extended.py](../analysis/build_extended.py); display question `r15_weather_penalty_who`.
- Calculated state: **ready**; bundle `private-20260911-1107`; input timestamp `2026-09-11T15:10:45Z`; calculation timestamp `2026-09-11T15:59:16Z`.
- Reported n: **524323**; observation unit: eligible finishes; evidence scope: weather proxy.
- Contracts: [metadata / cohort / provenance](../public/data/packs/ext_weather_pacing_patterns/pack_meta.json); [answer / chart specifications](../public/data/packs/ext_weather_pacing_patterns/summary.json).
- Tables: [weather_outcomes.csv](../public/data/packs/ext_weather_pacing_patterns/tables/weather_outcomes.csv), [weather_profiles.csv](../public/data/packs/ext_weather_pacing_patterns/tables/weather_profiles.csv).

Methods and limitations from this pack:

- Use the supplied Open-Meteo archive hour nearest the scheduled local start. Join the single city-year weather row whose race date parses and matches the record year. Group temperature below 10°C, 10–14.9°C, 15–19.9°C and at least 20°C.
- First calculate each edition’s median outcome among linked runners with a recent benchmark, requiring 100 finishes. Then average edition medians equally within temperature bands, requiring five editions. The profile is normalized by each runner’s own marathon average; performance is relative to the earlier benchmark.
- The modeled weather is a start-hour proxy, not each runner’s exposure. Start offsets are absent, temperatures change during the race and humidity, wind, sunshine, terrain and fitness remain potential confounders. Edition counts in the source table are the number of weather exposures; finish counts are not independent weather observations.
- For explicitly audited canonical-ID releases, validate unique matching CORE/FULL ID sets and matching recorded edition/name labels, then join by record ID with matching finish and all nine section durations. Legacy exports retain the one-to-one edition, trimmed lowercase name and full-timing join because their IDs are incompatible. Durations are compared to milliseconds. Keep only supplied non-ambiguous runner identities without conflicting recorded gender, inferred birth years spanning more than two years, or duplicate editions. These are candidate cross-race identities, not independently verified people; unlinked runners are absent. The linkage audit records which join was used.
- Recompute the benchmark as the fastest eligible finish in the two strictly earlier calendar years. The current race and every other race in its calendar year are excluded. This avoids guessing within-year chronology and prevents current-outcome leakage. It is a recent recorded best, not a fitness measurement, an expected finish, or a lifetime personal best.
- Performance change is 100 × (current finish / recent recorded best − 1). Negative is faster. Opening change compares 0–10 km pace with that earlier best’s full-marathon pace. Faster opening: more than 2% faster; similar: within 2%; slower: more than 2% slower. The ±2% and ±5% cutoffs are predefined descriptions, not physiological thresholds.
- Use complete, strictly increasing elapsed checkpoints at 5, 10, 15, 20, 25, 30, 35, 40 and 42.195 km. Clock strings must parse as H:MM:SS or M:SS. No missing splits are interpolated.
- Remove exact duplicate race records, ignoring database IDs, ingestion timestamps and source URLs. Retain finishes from 90 minutes to 12 hours with every section between 2 and 20 minutes per km. These quality filters can exclude genuine unusual performances; the analysis describes this eligible cohort, not every entrant.
- Full source records are available in public GitHub Releases. These chart tables require at least 100 eligible observations per cell for estimate reliability. Counts refer to finishes, linked pairs or event observations as specified in that answer.
- These are observational results. Fitness changes, intentions, training, selection into the dataset and unmeasured conditions can explain differences. Outcome percentiles describe variation among performances, not confidence intervals or advice about the best strategy.
- Apply the reviewed source-quality edition exclusions for this exact export after the timing checks. Known invalid split grids, incomplete ingestion, unreconciled HOLD editions and a selected top-finisher field do not contribute to the analyses or prior benchmarks. Report source exclusions separately; an already invalid timing row is not counted twice. Missing age or recorded gender alone does not exclude an otherwise eligible finish from the overall cohort. Other sparse editions are not declared incomplete merely from their size.

### ext_race_day_context

Was it my pacing or a difficult race day?

- Producer: [analysis/build_extended.py](../analysis/build_extended.py); display question `s5_pacing_vs_difficult_day`.
- Calculated state: **ready**; bundle `private-20260911-1107`; input timestamp `2026-09-11T15:10:45Z`; calculation timestamp `2026-09-11T15:59:16Z`.
- Reported n: **524323**; observation unit: eligible finishes; evidence scope: partial comparison.
- Contracts: [metadata / cohort / provenance](../public/data/packs/ext_race_day_context/pack_meta.json); [answer / chart specifications](../public/data/packs/ext_race_day_context/summary.json).
- Tables: [race_days.csv](../public/data/packs/ext_race_day_context/tables/race_days.csv).

Methods and limitations from this pack:

- For every city and race year, calculate the median and 10th–90th percentiles of percentage finish change versus each linked runner’s recent recorded best. Require 100 such finishes per edition. Compare an individual’s percentage change with that edition median to describe their position relative to the field.
- This contemporaneous edition reference is retrospective, includes the runner when eligible, and may shift with selection and fitness changes. It is not a weather correction or a prediction available before race day.
- For explicitly audited canonical-ID releases, validate unique matching CORE/FULL ID sets and matching recorded edition/name labels, then join by record ID with matching finish and all nine section durations. Legacy exports retain the one-to-one edition, trimmed lowercase name and full-timing join because their IDs are incompatible. Durations are compared to milliseconds. Keep only supplied non-ambiguous runner identities without conflicting recorded gender, inferred birth years spanning more than two years, or duplicate editions. These are candidate cross-race identities, not independently verified people; unlinked runners are absent. The linkage audit records which join was used.
- Recompute the benchmark as the fastest eligible finish in the two strictly earlier calendar years. The current race and every other race in its calendar year are excluded. This avoids guessing within-year chronology and prevents current-outcome leakage. It is a recent recorded best, not a fitness measurement, an expected finish, or a lifetime personal best.
- Performance change is 100 × (current finish / recent recorded best − 1). Negative is faster. Opening change compares 0–10 km pace with that earlier best’s full-marathon pace. Faster opening: more than 2% faster; similar: within 2%; slower: more than 2% slower. The ±2% and ±5% cutoffs are predefined descriptions, not physiological thresholds.
- Use complete, strictly increasing elapsed checkpoints at 5, 10, 15, 20, 25, 30, 35, 40 and 42.195 km. Clock strings must parse as H:MM:SS or M:SS. No missing splits are interpolated.
- Remove exact duplicate race records, ignoring database IDs, ingestion timestamps and source URLs. Retain finishes from 90 minutes to 12 hours with every section between 2 and 20 minutes per km. These quality filters can exclude genuine unusual performances; the analysis describes this eligible cohort, not every entrant.
- Full source records are available in public GitHub Releases. These chart tables require at least 100 eligible observations per cell for estimate reliability. Counts refer to finishes, linked pairs or event observations as specified in that answer.
- These are observational results. Fitness changes, intentions, training, selection into the dataset and unmeasured conditions can explain differences. Outcome percentiles describe variation among performances, not confidence intervals or advice about the best strategy.
- Apply the reviewed source-quality edition exclusions for this exact export after the timing checks. Known invalid split grids, incomplete ingestion, unreconciled HOLD editions and a selected top-finisher field do not contribute to the analyses or prior benchmarks. Report source exclusions separately; an already invalid timing row is not counted twice. Missing age or recorded gender alone does not exclude an otherwise eligible finish from the overall cohort. Other sparse editions are not declared incomplete merely from their size.

### ext_course_response_profiles

Are stronger performers better at adjusting their pace to the course?

- Producer: [analysis/build_extended.py](../analysis/build_extended.py); display question `r35_course_adaptation`.
- Calculated state: **ready**; bundle `private-20260911-1107`; input timestamp `2026-09-11T15:10:45Z`; calculation timestamp `2026-09-11T15:59:16Z`.
- Reported n: **524323**; observation unit: eligible finishes; evidence scope: partial comparison.
- Contracts: [metadata / cohort / provenance](../public/data/packs/ext_course_response_profiles/pack_meta.json); [answer / chart specifications](../public/data/packs/ext_course_response_profiles/summary.json).
- Tables: [course_responses.csv](../public/data/packs/ext_course_response_profiles/tables/course_responses.csv).

Methods and limitations from this pack:

- Normalize section pace by each runner’s own full-marathon average, then take the median by city and performance group. Performance groups use more than 2% faster than, within 2% of, or more than 2% slower than the prior benchmark. Require 100 per city and group.
- The outcome group is known after the race. Courses pool editions; neither terrain versions nor race-day conditions are held constant. This is a descriptive course-response profile, not evidence of optimal effort allocation on hills.
- For explicitly audited canonical-ID releases, validate unique matching CORE/FULL ID sets and matching recorded edition/name labels, then join by record ID with matching finish and all nine section durations. Legacy exports retain the one-to-one edition, trimmed lowercase name and full-timing join because their IDs are incompatible. Durations are compared to milliseconds. Keep only supplied non-ambiguous runner identities without conflicting recorded gender, inferred birth years spanning more than two years, or duplicate editions. These are candidate cross-race identities, not independently verified people; unlinked runners are absent. The linkage audit records which join was used.
- Recompute the benchmark as the fastest eligible finish in the two strictly earlier calendar years. The current race and every other race in its calendar year are excluded. This avoids guessing within-year chronology and prevents current-outcome leakage. It is a recent recorded best, not a fitness measurement, an expected finish, or a lifetime personal best.
- Performance change is 100 × (current finish / recent recorded best − 1). Negative is faster. Opening change compares 0–10 km pace with that earlier best’s full-marathon pace. Faster opening: more than 2% faster; similar: within 2%; slower: more than 2% slower. The ±2% and ±5% cutoffs are predefined descriptions, not physiological thresholds.
- Use complete, strictly increasing elapsed checkpoints at 5, 10, 15, 20, 25, 30, 35, 40 and 42.195 km. Clock strings must parse as H:MM:SS or M:SS. No missing splits are interpolated.
- Remove exact duplicate race records, ignoring database IDs, ingestion timestamps and source URLs. Retain finishes from 90 minutes to 12 hours with every section between 2 and 20 minutes per km. These quality filters can exclude genuine unusual performances; the analysis describes this eligible cohort, not every entrant.
- Full source records are available in public GitHub Releases. These chart tables require at least 100 eligible observations per cell for estimate reliability. Counts refer to finishes, linked pairs or event observations as specified in that answer.
- These are observational results. Fitness changes, intentions, training, selection into the dataset and unmeasured conditions can explain differences. Outcome percentiles describe variation among performances, not confidence intervals or advice about the best strategy.
- Apply the reviewed source-quality edition exclusions for this exact export after the timing checks. Known invalid split grids, incomplete ingestion, unreconciled HOLD editions and a selected top-finisher field do not contribute to the analyses or prior benchmarks. Report source exclusions separately; an already invalid timing row is not counted twice. Missing age or recorded gender alone does not exclude an otherwise eligible finish from the overall cohort. Other sparse editions are not declared incomplete merely from their size.

### ext_checkpoint_outcomes

Does being on pace mean you will hit your goal?

- Producer: [analysis/build_pacing.py](../analysis/build_pacing.py); display question `r04_on_pace_goal_hits`.
- Calculated state: **ready**; bundle `private-20260911-1107`; input timestamp `2026-09-11T15:10:45Z`; calculation timestamp `2026-09-11T15:58:21Z`.
- Reported n: **3328159**; observation unit: eligible finishes (consult method for subgroup/pair denominators); evidence scope: descriptive.
- Contracts: [metadata / cohort / provenance](../public/data/packs/ext_checkpoint_outcomes/pack_meta.json); [answer / chart specifications](../public/data/packs/ext_checkpoint_outcomes/summary.json).
- Tables: [goal_rates.csv](../public/data/packs/ext_checkpoint_outcomes/tables/goal_rates.csv).

Methods and limitations from this pack:

- On pace means elapsed time within ±1% of the target’s even-pace time at that checkpoint. A goal is achieved only when the finish is strictly under the target. Divide successes by all eligible on-pace finishes for that goal and checkpoint.
- This window includes runners just ahead of and just behind the target; it is narrower than the older core table’s time-budget definition. Results pool editions and are descriptive historical frequencies, not a validated personal forecast. Goals are inferred benchmarks, not runners’ declared intentions.
- Use complete, strictly increasing elapsed checkpoints at 5, 10, 15, 20, 25, 30, 35, 40 and 42.195 km. Clock strings must parse as H:MM:SS or M:SS. No missing splits are interpolated.
- Remove exact duplicate race records, ignoring database IDs, ingestion timestamps and source URLs. Retain finishes from 90 minutes to 12 hours with every section between 2 and 20 minutes per km. These quality filters can exclude genuine unusual performances; the analysis describes this eligible cohort, not every entrant.
- Each observation is a race finish. The same person can appear in multiple races. No runner identities are linked across races. Public cells require at least 100 observations; matched comparisons additionally require at least 20 per group in each stratum.
- Apply the reviewed source-quality edition exclusions for this exact export after the timing checks. Known invalid split grids, incomplete ingestion, unreconciled HOLD editions and a selected top-finisher field do not contribute to the analyses or prior benchmarks. Report source exclusions separately; an already invalid timing row is not counted twice. Missing age or recorded gender alone does not exclude an otherwise eligible finish from the overall cohort. Other sparse editions are not declared incomplete merely from their size.

### ext_late_rank_changes

How much of a marathon is decided after 30 km?

- Producer: [analysis/build_pacing.py](../analysis/build_pacing.py); display question `r06_decided_after_30k`.
- Calculated state: **ready**; bundle `private-20260911-1107`; input timestamp `2026-09-11T15:10:45Z`; calculation timestamp `2026-09-11T15:58:21Z`.
- Reported n: **3328145**; observation unit: eligible finishes (consult method for subgroup/pair denominators); evidence scope: descriptive.
- Contracts: [metadata / cohort / provenance](../public/data/packs/ext_late_rank_changes/pack_meta.json); [answer / chart specifications](../public/data/packs/ext_late_rank_changes/summary.json).
- Tables: [rank_changes.csv](../public/data/packs/ext_late_rank_changes/tables/rank_changes.csv).

Methods and limitations from this pack:

- Rank the same complete-record finishers at 30 km and at the finish within each city, year and race. Ties receive their average rank. Positive rank change means gaining places; all signed changes sum to zero within each edition.
- Convert rank changes to percentile points using field size minus one. A five-point move corresponds to about 500 positions in a 10,000-person eligible field. Missing-split finishers and non-finishers are absent. Different start waves mean elapsed-time ranks cannot count physical passes.
- Use complete, strictly increasing elapsed checkpoints at 5, 10, 15, 20, 25, 30, 35, 40 and 42.195 km. Clock strings must parse as H:MM:SS or M:SS. No missing splits are interpolated.
- Remove exact duplicate race records, ignoring database IDs, ingestion timestamps and source URLs. Retain finishes from 90 minutes to 12 hours with every section between 2 and 20 minutes per km. These quality filters can exclude genuine unusual performances; the analysis describes this eligible cohort, not every entrant.
- Each observation is a race finish. The same person can appear in multiple races. No runner identities are linked across races. Public cells require at least 100 observations; matched comparisons additionally require at least 20 per group in each stratum.
- Apply the reviewed source-quality edition exclusions for this exact export after the timing checks. Known invalid split grids, incomplete ingestion, unreconciled HOLD editions and a selected top-finisher field do not contribute to the analyses or prior benchmarks. Report source exclusions separately; an already invalid timing row is not counted twice. Missing age or recorded gender alone does not exclude an otherwise eligible finish from the overall cohort. Other sparse editions are not declared incomplete merely from their size.

### ext_milestone_finishing_speed

How much finishing speed appears when a milestone is within reach?

- Producer: [analysis/build_extended.py](../analysis/build_extended.py); display question `r17_milestone_kick`.
- Calculated state: **ready**; bundle `private-20260911-1107`; input timestamp `2026-09-11T15:10:45Z`; calculation timestamp `2026-09-11T15:59:16Z`.
- Reported n: **990704**; observation unit: eligible finishes; evidence scope: descriptive.
- Contracts: [metadata / cohort / provenance](../public/data/packs/ext_milestone_finishing_speed/pack_meta.json); [answer / chart specifications](../public/data/packs/ext_milestone_finishing_speed/summary.json).
- Tables: [hits.csv](../public/data/packs/ext_milestone_finishing_speed/tables/hits.csv), [kick.csv](../public/data/packs/ext_milestone_finishing_speed/tables/kick.csv).

Methods and limitations from this pack:

- Project finish time at 40 km by multiplying elapsed time by 42.195/40. Keep projections within five minutes of a round target and divide the margin into four bands. The kick measure is 100 × (40–42.195 km pace / 35–40 km pace − 1); negative means a faster final section.
- Plot the median kick and the share finishing strictly below the target. Different courses, ability and fatigue can produce the same projected margin. These are unadjusted associations, not evidence that a milestone caused a sprint.
- Use complete, strictly increasing elapsed checkpoints at 5, 10, 15, 20, 25, 30, 35, 40 and 42.195 km. Clock strings must parse as H:MM:SS or M:SS. No missing splits are interpolated.
- Remove exact duplicate race records, ignoring database IDs, ingestion timestamps and source URLs. Retain finishes from 90 minutes to 12 hours with every section between 2 and 20 minutes per km. These quality filters can exclude genuine unusual performances; the analysis describes this eligible cohort, not every entrant.
- Full source records are available in public GitHub Releases. These chart tables require at least 100 eligible observations per cell for estimate reliability. Counts refer to finishes, linked pairs or event observations as specified in that answer.
- These are observational results. Fitness changes, intentions, training, selection into the dataset and unmeasured conditions can explain differences. Outcome percentiles describe variation among performances, not confidence intervals or advice about the best strategy.
- Apply the reviewed source-quality edition exclusions for this exact export after the timing checks. Known invalid split grids, incomplete ingestion, unreconciled HOLD editions and a selected top-finisher field do not contribute to the analyses or prior benchmarks. Report source exclusions separately; an already invalid timing row is not counted twice. Missing age or recorded gender alone does not exclude an otherwise eligible finish from the overall cohort. Other sparse editions are not declared incomplete merely from their size.

### ext_qualifying_threshold_comparison

Do qualifying rules change how people race?

- Producer: [analysis/build_extended.py](../analysis/build_extended.py); display question `r18_bq_rule_changes`.
- Calculated state: **ready**; bundle `private-20260911-1107`; input timestamp `2026-09-11T15:10:45Z`; calculation timestamp `2026-09-11T15:59:16Z`.
- Reported n: **854**; observation unit: eligible finishes; evidence scope: partial comparison.
- Contracts: [metadata / cohort / provenance](../public/data/packs/ext_qualifying_threshold_comparison/pack_meta.json); [answer / chart specifications](../public/data/packs/ext_qualifying_threshold_comparison/summary.json).
- Tables: [thresholds.csv](../public/data/packs/ext_qualifying_threshold_comparison/tables/thresholds.csv).

Methods and limitations from this pack:

- The B.A.A. history lists 18–34 standards of 3:05 for men and 3:35 for women for 2013–2019 Boston races; the 2020 standards became 3:00 and 3:30, announced in September 2018. Compare 2016–2017 performances with 2019, excluding the transition year. Exact ages 18–31 avoid crossing the 35-year boundary within the next two years.
- Around each fixed old/new benchmark, select finishes within ±2 minutes. Within each city and period, calculate the share at or below the benchmark. Keep cities with at least 20 close finishes in both periods and weight both periods by the smaller city-period count. Report at least 100 observed finishes per displayed period.
- Acceptance cutoffs, declared intentions, age on a future Boston race day, certification and qualifying windows are not assigned to individuals. Round-number appeal, historical field changes and anticipatory behavior can explain bunching. This is not a difference-in-differences causal estimate, and the comparison does not cover every rule change.
- Official sources: https://www.baa.org/races/boston-marathon/qualify/ ; https://www.baa.org/news/2020-boston-marathon-qualifier-acceptances-announced/ . Historical values verified 2026-09-08.
- Use complete, strictly increasing elapsed checkpoints at 5, 10, 15, 20, 25, 30, 35, 40 and 42.195 km. Clock strings must parse as H:MM:SS or M:SS. No missing splits are interpolated.
- Remove exact duplicate race records, ignoring database IDs, ingestion timestamps and source URLs. Retain finishes from 90 minutes to 12 hours with every section between 2 and 20 minutes per km. These quality filters can exclude genuine unusual performances; the analysis describes this eligible cohort, not every entrant.
- Full source records are available in public GitHub Releases. These chart tables require at least 100 eligible observations per cell for estimate reliability. Counts refer to finishes, linked pairs or event observations as specified in that answer.
- These are observational results. Fitness changes, intentions, training, selection into the dataset and unmeasured conditions can explain differences. Outcome percentiles describe variation among performances, not confidence intervals or advice about the best strategy.
- Apply the reviewed source-quality edition exclusions for this exact export after the timing checks. Known invalid split grids, incomplete ingestion, unreconciled HOLD editions and a selected top-finisher field do not contribute to the analyses or prior benchmarks. Report source exclusions separately; an already invalid timing row is not counted twice. Missing age or recorded gender alone does not exclude an otherwise eligible finish from the overall cohort. Other sparse editions are not declared incomplete merely from their size.

### ext_goal_slip_recovery

What happens when a goal slips away?

- Producer: [analysis/build_extended.py](../analysis/build_extended.py); display question `s10_goal_slips`.
- Calculated state: **ready**; bundle `private-20260911-1107`; input timestamp `2026-09-11T15:10:45Z`; calculation timestamp `2026-09-11T15:59:16Z`.
- Reported n: **250129**; observation unit: eligible finishes; evidence scope: descriptive.
- Contracts: [metadata / cohort / provenance](../public/data/packs/ext_goal_slip_recovery/pack_meta.json); [answer / chart specifications](../public/data/packs/ext_goal_slip_recovery/summary.json).
- Tables: [slips.csv](../public/data/packs/ext_goal_slip_recovery/tables/slips.csv).

Methods and limitations from this pack:

- At 20 km keep elapsed time from 99% through 100% of the target’s even-pace budget. Find the first 25, 30, 35 or 40 km checkpoint where elapsed time exceeds that budget. Divide eventual strict sub-target finishes by all such first-crossing observations.
- This uses inferred round-time benchmarks and elapsed chip times. It cannot establish when a runner mentally abandoned a goal. First-crossing groups differ, and results include only complete eligible finishes.
- Use complete, strictly increasing elapsed checkpoints at 5, 10, 15, 20, 25, 30, 35, 40 and 42.195 km. Clock strings must parse as H:MM:SS or M:SS. No missing splits are interpolated.
- Remove exact duplicate race records, ignoring database IDs, ingestion timestamps and source URLs. Retain finishes from 90 minutes to 12 hours with every section between 2 and 20 minutes per km. These quality filters can exclude genuine unusual performances; the analysis describes this eligible cohort, not every entrant.
- Full source records are available in public GitHub Releases. These chart tables require at least 100 eligible observations per cell for estimate reliability. Counts refer to finishes, linked pairs or event observations as specified in that answer.
- These are observational results. Fitness changes, intentions, training, selection into the dataset and unmeasured conditions can explain differences. Outcome percentiles describe variation among performances, not confidence intervals or advice about the best strategy.
- Apply the reviewed source-quality edition exclusions for this exact export after the timing checks. Known invalid split grids, incomplete ingestion, unreconciled HOLD editions and a selected top-finisher field do not contribute to the analyses or prior benchmarks. Report source exclusions separately; an already invalid timing row is not counted twice. Missing age or recorded gender alone does not exclude an otherwise eligible finish from the overall cohort. Other sparse editions are not declared incomplete merely from their size.

### ext_strong_finish_followup

Does a strong finish suggest unused capacity?

- Producer: [analysis/build_extended.py](../analysis/build_extended.py); display question `r25_huge_kick_next`.
- Calculated state: **ready**; bundle `private-20260911-1107`; input timestamp `2026-09-11T15:10:45Z`; calculation timestamp `2026-09-11T15:59:16Z`.
- Reported n: **546847**; observation unit: linked race pairs; evidence scope: partial comparison.
- Contracts: [metadata / cohort / provenance](../public/data/packs/ext_strong_finish_followup/pack_meta.json); [answer / chart specifications](../public/data/packs/ext_strong_finish_followup/summary.json).
- Tables: [kick_followup.csv](../public/data/packs/ext_strong_finish_followup/tables/kick_followup.csv), [kick_success.csv](../public/data/packs/ext_strong_finish_followup/tables/kick_success.csv).

Methods and limitations from this pack:

- A finishing acceleration is the percentage change in pace from 35–40 to 40–42.195 km. Group it as more than 5% faster, up to 5% faster, or similar/slower. Use consecutive cross-year linked pairs at most three years apart.
- Measure next-finish percentage change relative to the first finish, report its 10th/50th/90th percentiles within the first race’s pacing pattern, and the share improving by more than 2%. This does not measure effort reserves, account for absent follow-up, or establish what would have happened with a harder earlier effort.
- For explicitly audited canonical-ID releases, validate unique matching CORE/FULL ID sets and matching recorded edition/name labels, then join by record ID with matching finish and all nine section durations. Legacy exports retain the one-to-one edition, trimmed lowercase name and full-timing join because their IDs are incompatible. Durations are compared to milliseconds. Keep only supplied non-ambiguous runner identities without conflicting recorded gender, inferred birth years spanning more than two years, or duplicate editions. These are candidate cross-race identities, not independently verified people; unlinked runners are absent. The linkage audit records which join was used.
- Use complete, strictly increasing elapsed checkpoints at 5, 10, 15, 20, 25, 30, 35, 40 and 42.195 km. Clock strings must parse as H:MM:SS or M:SS. No missing splits are interpolated.
- Remove exact duplicate race records, ignoring database IDs, ingestion timestamps and source URLs. Retain finishes from 90 minutes to 12 hours with every section between 2 and 20 minutes per km. These quality filters can exclude genuine unusual performances; the analysis describes this eligible cohort, not every entrant.
- Full source records are available in public GitHub Releases. These chart tables require at least 100 eligible observations per cell for estimate reliability. Counts refer to finishes, linked pairs or event observations as specified in that answer.
- These are observational results. Fitness changes, intentions, training, selection into the dataset and unmeasured conditions can explain differences. Outcome percentiles describe variation among performances, not confidence intervals or advice about the best strategy.
- Apply the reviewed source-quality edition exclusions for this exact export after the timing checks. Known invalid split grids, incomplete ingestion, unreconciled HOLD editions and a selected top-finisher field do not contribute to the analyses or prior benchmarks. Report source exclusions separately; an already invalid timing row is not counted twice. Missing age or recorded gender alone does not exclude an otherwise eligible finish from the overall cohort. Other sparse editions are not declared incomplete merely from their size.

### ext_distance_and_elapsed_change

Do pacing changes follow distance or elapsed time?

- Producer: [analysis/build_extended.py](../analysis/build_extended.py); display question `r07_wall_clock_vs_distance`.
- Calculated state: **ready**; bundle `private-20260911-1107`; input timestamp `2026-09-11T15:10:45Z`; calculation timestamp `2026-09-11T15:59:16Z`.
- Reported n: **2253478**; observation unit: eligible finishes; evidence scope: descriptive.
- Contracts: [metadata / cohort / provenance](../public/data/packs/ext_distance_and_elapsed_change/pack_meta.json); [answer / chart specifications](../public/data/packs/ext_distance_and_elapsed_change/summary.json).
- Tables: [distance.csv](../public/data/packs/ext_distance_and_elapsed_change/tables/distance.csv), [elapsed.csv](../public/data/packs/ext_distance_and_elapsed_change/tables/elapsed.csv).

Methods and limitations from this pack:

- Define the first section after 20 km whose average pace is more than 10% slower than 5–20 km. Look only through 40 km so all tested sections are 5 km long. Group runners using their observed 5–20 km pace.
- Among runners with such a section, plot the distribution of its end distance. For each distance and early-pace group, show median elapsed arrival at the start and end of that section. The medians bound a typical observation interval; they are not confidence limits. This broader 10% section definition is separate from the sustained slowdown definition.
- Use complete, strictly increasing elapsed checkpoints at 5, 10, 15, 20, 25, 30, 35, 40 and 42.195 km. Clock strings must parse as H:MM:SS or M:SS. No missing splits are interpolated.
- Remove exact duplicate race records, ignoring database IDs, ingestion timestamps and source URLs. Retain finishes from 90 minutes to 12 hours with every section between 2 and 20 minutes per km. These quality filters can exclude genuine unusual performances; the analysis describes this eligible cohort, not every entrant.
- Full source records are available in public GitHub Releases. These chart tables require at least 100 eligible observations per cell for estimate reliability. Counts refer to finishes, linked pairs or event observations as specified in that answer.
- These are observational results. Fitness changes, intentions, training, selection into the dataset and unmeasured conditions can explain differences. Outcome percentiles describe variation among performances, not confidence intervals or advice about the best strategy.
- Apply the reviewed source-quality edition exclusions for this exact export after the timing checks. Known invalid split grids, incomplete ingestion, unreconciled HOLD editions and a selected top-finisher field do not contribute to the analyses or prior benchmarks. Report source exclusions separately; an already invalid timing row is not counted twice. Missing age or recorded gender alone does not exclude an otherwise eligible finish from the overall cohort. Other sparse editions are not declared incomplete merely from their size.

### ext_pacing_habit_persistence

Do runners have persistent pacing habits?

- Producer: [analysis/build_extended.py](../analysis/build_extended.py); display question `r20_pacing_personalities`.
- Calculated state: **ready**; bundle `private-20260911-1107`; input timestamp `2026-09-11T15:10:45Z`; calculation timestamp `2026-09-11T15:59:16Z`.
- Reported n: **546847**; observation unit: linked race pairs; evidence scope: descriptive.
- Contracts: [metadata / cohort / provenance](../public/data/packs/ext_pacing_habit_persistence/pack_meta.json); [answer / chart specifications](../public/data/packs/ext_pacing_habit_persistence/summary.json).
- Tables: [correlation.csv](../public/data/packs/ext_pacing_habit_persistence/tables/correlation.csv), [transitions.csv](../public/data/packs/ext_pacing_habit_persistence/tables/transitions.csv).

Methods and limitations from this pack:

- Use consecutive linked finishes in different years, no more than three years apart, with exactly one recorded eligible finish in each endpoint year. Calculate Pearson correlation between the two 0–20 versus 20–40 km pace changes, grouped by calendar-year gap.
- For each earlier race pattern, divide the number of next races in each pattern by all eligible pairs with that earlier pattern. These conditional transition percentages sum to 100 within the earlier pattern. Correlation is descriptive; repeat observations of a runner are not independent.
- For explicitly audited canonical-ID releases, validate unique matching CORE/FULL ID sets and matching recorded edition/name labels, then join by record ID with matching finish and all nine section durations. Legacy exports retain the one-to-one edition, trimmed lowercase name and full-timing join because their IDs are incompatible. Durations are compared to milliseconds. Keep only supplied non-ambiguous runner identities without conflicting recorded gender, inferred birth years spanning more than two years, or duplicate editions. These are candidate cross-race identities, not independently verified people; unlinked runners are absent. The linkage audit records which join was used.
- Use complete, strictly increasing elapsed checkpoints at 5, 10, 15, 20, 25, 30, 35, 40 and 42.195 km. Clock strings must parse as H:MM:SS or M:SS. No missing splits are interpolated.
- Remove exact duplicate race records, ignoring database IDs, ingestion timestamps and source URLs. Retain finishes from 90 minutes to 12 hours with every section between 2 and 20 minutes per km. These quality filters can exclude genuine unusual performances; the analysis describes this eligible cohort, not every entrant.
- Full source records are available in public GitHub Releases. These chart tables require at least 100 eligible observations per cell for estimate reliability. Counts refer to finishes, linked pairs or event observations as specified in that answer.
- These are observational results. Fitness changes, intentions, training, selection into the dataset and unmeasured conditions can explain differences. Outcome percentiles describe variation among performances, not confidence intervals or advice about the best strategy.
- Apply the reviewed source-quality edition exclusions for this exact export after the timing checks. Known invalid split grids, incomplete ingestion, unreconciled HOLD editions and a selected top-finisher field do not contribute to the analyses or prior benchmarks. Report source exclusions separately; an already invalid timing row is not counted twice. Missing age or recorded gender alone does not exclude an otherwise eligible finish from the overall cohort. Other sparse editions are not declared incomplete merely from their size.

### ext_age_pacing

How do speed and pace retention vary by age?

- Producer: [analysis/build_pacing.py](../analysis/build_pacing.py); display question `r22_aging_changes`.
- Calculated state: **ready**; bundle `private-20260911-1107`; input timestamp `2026-09-11T15:10:45Z`; calculation timestamp `2026-09-11T15:58:21Z`.
- Reported n: **1165597**; observation unit: eligible finishes (consult method for subgroup/pair denominators); evidence scope: descriptive.
- Contracts: [metadata / cohort / provenance](../public/data/packs/ext_age_pacing/pack_meta.json); [answer / chart specifications](../public/data/packs/ext_age_pacing/summary.json).
- Tables: [age_pacing.csv](../public/data/packs/ext_age_pacing/tables/age_pacing.csv).

Methods and limitations from this pack:

- Use exact integer ages from 18 through 89, grouping 18–29 then ten-year bands. Do not infer exact ages from age-group labels. Report median 0–20 km pace and median percentage pace change from 0–20 to 20–40 km, separately by recorded gender.
- This is cross-sectional: different people, races and performance levels are being compared. Selection into marathons, missing ages, course and prior ability can explain part of the pattern. It is not an estimate of an individual’s aging trajectory.
- Use complete, strictly increasing elapsed checkpoints at 5, 10, 15, 20, 25, 30, 35, 40 and 42.195 km. Clock strings must parse as H:MM:SS or M:SS. No missing splits are interpolated.
- Remove exact duplicate race records, ignoring database IDs, ingestion timestamps and source URLs. Retain finishes from 90 minutes to 12 hours with every section between 2 and 20 minutes per km. These quality filters can exclude genuine unusual performances; the analysis describes this eligible cohort, not every entrant.
- Each observation is a race finish. The same person can appear in multiple races. No runner identities are linked across races. Public cells require at least 100 observations; matched comparisons additionally require at least 20 per group in each stratum.
- Apply the reviewed source-quality edition exclusions for this exact export after the timing checks. Known invalid split grids, incomplete ingestion, unreconciled HOLD editions and a selected top-finisher field do not contribute to the analyses or prior benchmarks. Report source exclusions separately; an already invalid timing row is not counted twice. Missing age or recorded gender alone does not exclude an otherwise eligible finish from the overall cohort. Other sparse editions are not declared incomplete merely from their size.

### ext_gender_pacing

How does pacing differ across recorded gender groups?

- Producer: [analysis/build_pacing.py](../analysis/build_pacing.py); display question `r23_gender_pacing`.
- Calculated state: **ready**; bundle `private-20260911-1107`; input timestamp `2026-09-11T15:10:45Z`; calculation timestamp `2026-09-11T15:58:21Z`.
- Reported n: **2769673**; observation unit: eligible finishes (consult method for subgroup/pair denominators); evidence scope: descriptive.
- Contracts: [metadata / cohort / provenance](../public/data/packs/ext_gender_pacing/pack_meta.json); [answer / chart specifications](../public/data/packs/ext_gender_pacing/summary.json).
- Tables: [gender_matched.csv](../public/data/packs/ext_gender_pacing/tables/gender_matched.csv), [gender_pooled.csv](../public/data/packs/ext_gender_pacing/tables/gender_pooled.csv).

Methods and limitations from this pack:

- Compare average percentage change from the first 20 km to the second 20 km. The pooled chart uses all eligible women’s and men’s records. The matched chart uses only race-edition and one-minute 20 km strata containing at least 20 finishes in each category.
- Use the smaller category count as a common stratum weight. Thus both matched estimates have the same race and opening-time distribution. Opening time is an observed race performance, not an independent measure of prior fitness. Age, experience and other factors remain uncontrolled.
- The export field is sex; labels follow its recorded categories. Other or missing categories remain in the overall pacing analyses but are not included in this two-category comparison.
- Use complete, strictly increasing elapsed checkpoints at 5, 10, 15, 20, 25, 30, 35, 40 and 42.195 km. Clock strings must parse as H:MM:SS or M:SS. No missing splits are interpolated.
- Remove exact duplicate race records, ignoring database IDs, ingestion timestamps and source URLs. Retain finishes from 90 minutes to 12 hours with every section between 2 and 20 minutes per km. These quality filters can exclude genuine unusual performances; the analysis describes this eligible cohort, not every entrant.
- Each observation is a race finish. The same person can appear in multiple races. No runner identities are linked across races. Public cells require at least 100 observations; matched comparisons additionally require at least 20 per group in each stratum.
- Apply the reviewed source-quality edition exclusions for this exact export after the timing checks. Known invalid split grids, incomplete ingestion, unreconciled HOLD editions and a selected top-finisher field do not contribute to the analyses or prior benchmarks. Report source exclusions separately; an already invalid timing row is not counted twice. Missing age or recorded gender alone does not exclude an otherwise eligible finish from the overall cohort. Other sparse editions are not declared incomplete merely from their size.

### ext_near_miss_recorded_return

Does a near miss bring people back?

- Producer: [analysis/build_extended.py](../analysis/build_extended.py); display question `r19_near_miss_return`.
- Calculated state: **ready**; bundle `private-20260911-1107`; input timestamp `2026-09-11T15:10:45Z`; calculation timestamp `2026-09-11T15:59:16Z`.
- Reported n: **202208**; observation unit: eligible finishes; evidence scope: partial comparison.
- Contracts: [metadata / cohort / provenance](../public/data/packs/ext_near_miss_recorded_return/pack_meta.json); [answer / chart specifications](../public/data/packs/ext_near_miss_recorded_return/summary.json).
- Tables: [returns.csv](../public/data/packs/ext_near_miss_recorded_return/tables/returns.csv).

Methods and limitations from this pack:

- Select linked finishes within two minutes of each round target. Under is strictly below the target; an exact target time belongs to the at-or-over group. Require two subsequent calendar years with at least 100 eligible finishes in the index city, and exclude the latest two observed years as index years.
- Return means any eligible linked finish anywhere in the export during the next two calendar years. Same-year returns do not count. Divide returns by every eligible index finish in each group, including those with no observed return. Coverage checks reduce administrative censoring but do not establish complete race ingestion. Repeat index observations, false/missed links, changing coverage and unrecorded goals can affect the association.
- For explicitly audited canonical-ID releases, validate unique matching CORE/FULL ID sets and matching recorded edition/name labels, then join by record ID with matching finish and all nine section durations. Legacy exports retain the one-to-one edition, trimmed lowercase name and full-timing join because their IDs are incompatible. Durations are compared to milliseconds. Keep only supplied non-ambiguous runner identities without conflicting recorded gender, inferred birth years spanning more than two years, or duplicate editions. These are candidate cross-race identities, not independently verified people; unlinked runners are absent. The linkage audit records which join was used.
- Use complete, strictly increasing elapsed checkpoints at 5, 10, 15, 20, 25, 30, 35, 40 and 42.195 km. Clock strings must parse as H:MM:SS or M:SS. No missing splits are interpolated.
- Remove exact duplicate race records, ignoring database IDs, ingestion timestamps and source URLs. Retain finishes from 90 minutes to 12 hours with every section between 2 and 20 minutes per km. These quality filters can exclude genuine unusual performances; the analysis describes this eligible cohort, not every entrant.
- Full source records are available in public GitHub Releases. These chart tables require at least 100 eligible observations per cell for estimate reliability. Counts refer to finishes, linked pairs or event observations as specified in that answer.
- These are observational results. Fitness changes, intentions, training, selection into the dataset and unmeasured conditions can explain differences. Outcome percentiles describe variation among performances, not confidence intervals or advice about the best strategy.
- Apply the reviewed source-quality edition exclusions for this exact export after the timing checks. Known invalid split grids, incomplete ingestion, unreconciled HOLD editions and a selected top-finisher field do not contribute to the analyses or prior benchmarks. Report source exclusions separately; an already invalid timing row is not counted twice. Missing age or recorded gender alone does not exclude an otherwise eligible finish from the overall cohort. Other sparse editions are not declared incomplete merely from their size.

### ext_experience_and_pacing

What changes as runners gain experience?

- Producer: [analysis/build_extended.py](../analysis/build_extended.py); display question `r21_learn_from_blowup`.
- Calculated state: **ready**; bundle `private-20260911-1107`; input timestamp `2026-09-11T15:10:45Z`; calculation timestamp `2026-09-11T15:59:16Z`.
- Reported n: **524323**; observation unit: eligible finishes; evidence scope: descriptive.
- Contracts: [metadata / cohort / provenance](../public/data/packs/ext_experience_and_pacing/pack_meta.json); [answer / chart specifications](../public/data/packs/ext_experience_and_pacing/summary.json).
- Tables: [experience.csv](../public/data/packs/ext_experience_and_pacing/tables/experience.csv), [next_changes.csv](../public/data/packs/ext_experience_and_pacing/tables/next_changes.csv).

Methods and limitations from this pack:

- Count eligible linked finishes in strictly earlier calendar years. Show median opening pace relative to the recent benchmark and median change between the two 20 km blocks by prior count.
- Separately, use consecutive cross-year pairs to calculate the median next-minus-previous pace-retention change, grouped by the previous pattern. Selecting an unusually good or bad first race creates regression to the mean, so improvement after pronounced slowing is not proof of learning. Continued participation and changing fitness also affect these comparisons.
- For explicitly audited canonical-ID releases, validate unique matching CORE/FULL ID sets and matching recorded edition/name labels, then join by record ID with matching finish and all nine section durations. Legacy exports retain the one-to-one edition, trimmed lowercase name and full-timing join because their IDs are incompatible. Durations are compared to milliseconds. Keep only supplied non-ambiguous runner identities without conflicting recorded gender, inferred birth years spanning more than two years, or duplicate editions. These are candidate cross-race identities, not independently verified people; unlinked runners are absent. The linkage audit records which join was used.
- Recompute the benchmark as the fastest eligible finish in the two strictly earlier calendar years. The current race and every other race in its calendar year are excluded. This avoids guessing within-year chronology and prevents current-outcome leakage. It is a recent recorded best, not a fitness measurement, an expected finish, or a lifetime personal best.
- Performance change is 100 × (current finish / recent recorded best − 1). Negative is faster. Opening change compares 0–10 km pace with that earlier best’s full-marathon pace. Faster opening: more than 2% faster; similar: within 2%; slower: more than 2% slower. The ±2% and ±5% cutoffs are predefined descriptions, not physiological thresholds.
- Use complete, strictly increasing elapsed checkpoints at 5, 10, 15, 20, 25, 30, 35, 40 and 42.195 km. Clock strings must parse as H:MM:SS or M:SS. No missing splits are interpolated.
- Remove exact duplicate race records, ignoring database IDs, ingestion timestamps and source URLs. Retain finishes from 90 minutes to 12 hours with every section between 2 and 20 minutes per km. These quality filters can exclude genuine unusual performances; the analysis describes this eligible cohort, not every entrant.
- Full source records are available in public GitHub Releases. These chart tables require at least 100 eligible observations per cell for estimate reliability. Counts refer to finishes, linked pairs or event observations as specified in that answer.
- These are observational results. Fitness changes, intentions, training, selection into the dataset and unmeasured conditions can explain differences. Outcome percentiles describe variation among performances, not confidence intervals or advice about the best strategy.
- Apply the reviewed source-quality edition exclusions for this exact export after the timing checks. Known invalid split grids, incomplete ingestion, unreconciled HOLD editions and a selected top-finisher field do not contribute to the analyses or prior benchmarks. Report source exclusions separately; an already invalid timing row is not counted twice. Missing age or recorded gender alone does not exclude an otherwise eligible finish from the overall cohort. Other sparse editions are not declared incomplete merely from their size.

### ext_race_spacing_outcomes

How does the previous marathon affect the next one?

- Producer: [analysis/build_extended.py](../analysis/build_extended.py); display question `r24_interval_after_pb`.
- Calculated state: **ready**; bundle `private-20260911-1107`; input timestamp `2026-09-11T15:10:45Z`; calculation timestamp `2026-09-11T15:59:16Z`.
- Reported n: **567474**; observation unit: dated race pairs; evidence scope: descriptive.
- Contracts: [metadata / cohort / provenance](../public/data/packs/ext_race_spacing_outcomes/pack_meta.json); [answer / chart specifications](../public/data/packs/ext_race_spacing_outcomes/summary.json).
- Tables: [spacing.csv](../public/data/packs/ext_race_spacing_outcomes/tables/spacing.csv).

Methods and limitations from this pack:

- Use only linked identity groups for which every eligible record has a unique supplied race date. Order by that date, pair adjacent races and retain intervals of 1–1095 days. Unlike the year-based analyses, this includes same-year pairs. Dates come from the supplied calendar overlay and have not all been independently reverified.
- Calculate 100 × (next finish / previous finish − 1) and its 10th/50th/90th percentiles in the displayed day bands. The second view requires the earlier race to beat every recorded finish in earlier calendar years; same-year bests are not used for that label. Fitness, course, motivation and selection into short or long intervals remain confounders.
- For explicitly audited canonical-ID releases, validate unique matching CORE/FULL ID sets and matching recorded edition/name labels, then join by record ID with matching finish and all nine section durations. Legacy exports retain the one-to-one edition, trimmed lowercase name and full-timing join because their IDs are incompatible. Durations are compared to milliseconds. Keep only supplied non-ambiguous runner identities without conflicting recorded gender, inferred birth years spanning more than two years, or duplicate editions. These are candidate cross-race identities, not independently verified people; unlinked runners are absent. The linkage audit records which join was used.
- Use complete, strictly increasing elapsed checkpoints at 5, 10, 15, 20, 25, 30, 35, 40 and 42.195 km. Clock strings must parse as H:MM:SS or M:SS. No missing splits are interpolated.
- Remove exact duplicate race records, ignoring database IDs, ingestion timestamps and source URLs. Retain finishes from 90 minutes to 12 hours with every section between 2 and 20 minutes per km. These quality filters can exclude genuine unusual performances; the analysis describes this eligible cohort, not every entrant.
- Full source records are available in public GitHub Releases. These chart tables require at least 100 eligible observations per cell for estimate reliability. Counts refer to finishes, linked pairs or event observations as specified in that answer.
- These are observational results. Fitness changes, intentions, training, selection into the dataset and unmeasured conditions can explain differences. Outcome percentiles describe variation among performances, not confidence intervals or advice about the best strategy.
- Apply the reviewed source-quality edition exclusions for this exact export after the timing checks. Known invalid split grids, incomplete ingestion, unreconciled HOLD editions and a selected top-finisher field do not contribute to the analyses or prior benchmarks. Report source exclusions separately; an already invalid timing row is not counted twice. Missing age or recorded gender alone does not exclude an otherwise eligible finish from the overall cohort. Other sparse editions are not declared incomplete merely from their size.

### ext_pacing_over_time

How have marathon speed and pacing changed over time?

- Producer: [analysis/build_pacing.py](../analysis/build_pacing.py); display question `r26_pacing_over_20y`.
- Calculated state: **ready**; bundle `private-20260911-1107`; input timestamp `2026-09-11T15:10:45Z`; calculation timestamp `2026-09-11T15:58:21Z`.
- Reported n: **3216336**; observation unit: eligible finishes (consult method for subgroup/pair denominators); evidence scope: descriptive.
- Contracts: [metadata / cohort / provenance](../public/data/packs/ext_pacing_over_time/pack_meta.json); [answer / chart specifications](../public/data/packs/ext_pacing_over_time/summary.json).
- Tables: [yearly_pacing.csv](../public/data/packs/ext_pacing_over_time/tables/yearly_pacing.csv).

Methods and limitations from this pack:

- For each city and year, calculate median first-20-km pace and median percentage pace change from the first 20 km to the second. Show city-years with at least 100 eligible finishes, and cities with at least three available years.
- The same cities, runners and course versions are not represented every year. Choose a city to avoid pooling changing city coverage into one global trend. Even within a city, field composition, route changes and conditions remain uncontrolled. Gaps are years without publishable data, not interpolated observations.
- Use complete, strictly increasing elapsed checkpoints at 5, 10, 15, 20, 25, 30, 35, 40 and 42.195 km. Clock strings must parse as H:MM:SS or M:SS. No missing splits are interpolated.
- Remove exact duplicate race records, ignoring database IDs, ingestion timestamps and source URLs. Retain finishes from 90 minutes to 12 hours with every section between 2 and 20 minutes per km. These quality filters can exclude genuine unusual performances; the analysis describes this eligible cohort, not every entrant.
- Each observation is a race finish. The same person can appear in multiple races. No runner identities are linked across races. Public cells require at least 100 observations; matched comparisons additionally require at least 20 per group in each stratum.
- Apply the reviewed source-quality edition exclusions for this exact export after the timing checks. Known invalid split grids, incomplete ingestion, unreconciled HOLD editions and a selected top-finisher field do not contribute to the analyses or prior benchmarks. Report source exclusions separately; an already invalid timing row is not counted twice. Missing age or recorded gender alone does not exclude an otherwise eligible finish from the overall cohort. Other sparse editions are not declared incomplete merely from their size.

### ext_earlier_best_section_gains

Where do runners gain the time that produces a personal best?

- Producer: [analysis/build_extended.py](../analysis/build_extended.py); display question `r32_where_pbs_are_gained`.
- Calculated state: **ready**; bundle `private-20260911-1107`; input timestamp `2026-09-11T15:10:45Z`; calculation timestamp `2026-09-11T15:59:16Z`.
- Reported n: **259262**; observation unit: earlier-best comparisons; evidence scope: partial comparison.
- Contracts: [metadata / cohort / provenance](../public/data/packs/ext_earlier_best_section_gains/pack_meta.json); [answer / chart specifications](../public/data/packs/ext_earlier_best_section_gains/summary.json).
- Tables: [gains.csv](../public/data/packs/ext_earlier_best_section_gains/tables/gains.csv).

Methods and limitations from this pack:

- For each eligible linked finish faster than every eligible recorded finish in strictly earlier calendar years, select the fastest earlier-year record as comparator. Break tied best times by earlier year and then stable raw record ID. Both races must have all nine valid checkpoints.
- Subtract current from earlier elapsed time over 0–10, 10–30 and 30–42.195 km. Positive means time gained. Compute means so that the three block means sum exactly to the mean finish improvement; separately divide each block by its own distance to show seconds gained per kilometer. Assert that block gains sum to total gain for every pair and in the published means. Different courses and conditions can contribute to gains.
- For explicitly audited canonical-ID releases, validate unique matching CORE/FULL ID sets and matching recorded edition/name labels, then join by record ID with matching finish and all nine section durations. Legacy exports retain the one-to-one edition, trimmed lowercase name and full-timing join because their IDs are incompatible. Durations are compared to milliseconds. Keep only supplied non-ambiguous runner identities without conflicting recorded gender, inferred birth years spanning more than two years, or duplicate editions. These are candidate cross-race identities, not independently verified people; unlinked runners are absent. The linkage audit records which join was used.
- Use complete, strictly increasing elapsed checkpoints at 5, 10, 15, 20, 25, 30, 35, 40 and 42.195 km. Clock strings must parse as H:MM:SS or M:SS. No missing splits are interpolated.
- Remove exact duplicate race records, ignoring database IDs, ingestion timestamps and source URLs. Retain finishes from 90 minutes to 12 hours with every section between 2 and 20 minutes per km. These quality filters can exclude genuine unusual performances; the analysis describes this eligible cohort, not every entrant.
- Full source records are available in public GitHub Releases. These chart tables require at least 100 eligible observations per cell for estimate reliability. Counts refer to finishes, linked pairs or event observations as specified in that answer.
- These are observational results. Fitness changes, intentions, training, selection into the dataset and unmeasured conditions can explain differences. Outcome percentiles describe variation among performances, not confidence intervals or advice about the best strategy.
- Apply the reviewed source-quality edition exclusions for this exact export after the timing checks. Known invalid split grids, incomplete ingestion, unreconciled HOLD editions and a selected top-finisher field do not contribute to the analyses or prior benchmarks. Report source exclusions separately; an already invalid timing row is not counted twice. Missing age or recorded gender alone does not exclude an otherwise eligible finish from the overall cohort. Other sparse editions are not declared incomplete merely from their size.

## Personalized engine: twelve calculation paths and methods

Producer: [analysis/build_personalized.py](../analysis/build_personalized.py), called from build_extended.py with --personalized-output. Renderer/calculation selection: [lib/personalized.ts](../lib/personalized.ts); question wording: [lib/personalized-catalog.ts](../lib/personalized-catalog.ts). Output: [metadata](../public/data/packs/ext_personalized_guide/pack_meta.json) and [summary and city-file mapping](../public/data/packs/ext_personalized_guide/summary.json), with tables/city_XX.json and tables/checkpoint_XX.json shards. Import using import_personalized.py separately from the 33-pack import.

The primary page order and wording come from [the ten-analysis registry](../lib/ten-analyses.ts); the engine catalog below retains its original focus labels and two additional paths, `downhill` and `return`. The primary default is an All courses / 4:00 example, with no assumed age, gender or prior performance. The 1107 pack uses input timestamp `2026-09-11T15:10:45Z` and calculation timestamp `2026-09-11T16:07:06Z`. Every integer target from 90 through 720 minutes has exact threshold support, but profile, near-finish, checkpoint and history cells publish only when their own sample rules pass. Extreme or sparse selections can therefore have no result.

All questions share the eligible and prior-history preparation described above. A displayed filter may be broadened only with explicit labeling. Read each method for dimensions deliberately varied, achieved-time conditioning and prior-time exclusions.

### profile: What does a race near my target look like?

Focus: prepare, review.

Select finishes in the displayed 15-minute finish-time band, centered on the nearest 15-minute target preset. Show each section’s median pace and middle 50% of observed paces. These are achieved times, not declared goals, and the profile is not an optimal pacing plan.

### opening: Which openings are associated with finishing under my target?

Focus: prepare.

Use runners with a recorded best in the two strictly earlier calendar years. Classify the first 10 km as more than 2% faster than that benchmark’s marathon pace, within 2%, or more than 2% slower. For each group, count finishes strictly below the selected time. Groups are observational and pool available editions; a prior-time filter narrows ability but does not eliminate confounding.

### sections: Where do nearby finishes gain or lose time?

Focus: prepare, review.

Compare finishes in the five minutes strictly below the selected target with finishes from the target up to, but excluding, five minutes above it. Subtract the target’s even-pace time budget from each mean section duration. Means reconcile with mean finish-time differences; selection on the outcome makes this descriptive.

### age: How does pacing differ across age groups?

Focus: prepare, review.

Compare median percentage pace change from 0–20 to 20–40 km across exact-age bands. When previous performance is supplied, compare the same 15-minute prior-time band. Otherwise compare the same displayed achieved-time band. Gender and course are held to the displayed selection. This is a comparison of different people, not an individual aging trajectory.

### terrain: What pace changes appear alongside the supplied terrain?

Focus: prepare, review.

Align the supplied unique city-level course segments with the pacing profile. Historical route validity is unknown. Net elevation change can hide both climbing and descending; bridge decks, tunnels, smoothing and route changes can affect the profile. This does not estimate a historical hill penalty or grade-adjusted effort.

### downhill: What follows a fast opening on a downhill-start profile?

Focus: prepare.

Identify a net-downhill opening from the first two supplied 5 km terrain segments. Among the earlier-benchmark opening groups, compare median pace change from the 5–20 km baseline to the final 12.195 km. The supplied route is a proxy, and these associations do not establish that an early descent caused later slowing. Where no downhill opening is documented, show the general opening comparison and say so.

### checkpoint: What happened to runners at a similar checkpoint time?

Focus: prepare, review.

Match course, available age/gender groups, checkpoint and a two-minute elapsed-time band at 20, 30 or 35 km. Optional recent-5-km pace is classified relative to elapsed average pace using ±2%. The previous-marathon filter is not used because this comparison conditions on current-race progress. Show historical finish percentiles and the fraction below the visitor’s threshold, not a calibrated personal probability. Only complete eligible finishers are represented.

### courses: Which courses combine faster outcomes and consistency?

Focus: choose.

For the same displayed age, gender and prior-time cohort across courses, show the 10th, 50th and 90th percentiles of finish-time change relative to the recent recorded best. Require at least 100 observations and three editions per course. Use identical cohort criteria across the displayed courses. These different runners and editions do not isolate a course effect or provide equivalent-time predictions.

### weather: How do outcomes differ across cooler and warmer editions?

Focus: prepare, choose.

Use the supplied modeled start-hour temperature and runners with earlier benchmarks. Compute edition-level median finish-time change, requiring 20 finishes per edition/group. Average edition medians equally within temperature bands, requiring three editions and 100 finishes. Weather exposure is a start-hour proxy, not personal exposure; humidity, sun, wind and route changes are not isolated.

### ambition: Where does my target sit among comparable results?

Focus: prepare, choose.

Evaluate the selected time against the historical finish-time distribution in the displayed cohort. Optional previous performance selects a 15-minute band of recent recorded bests. Each whole-minute threshold from 1:30 through 12:00 is calculated exactly using a strict less-than comparison. Without previous performance this describes the selected field, not individual readiness.

### return: How do runners change when they return to this course?

Focus: prepare, review.

Use consecutive linked appearances in different years, at most three years apart, on the same city course, requiring one eligible recorded race in both endpoint years. Apply the profile to the later appearance and compare both observed section profiles, each normalized to its own finish. Report paired mean finish-time change. Route changes, fitness and selection remain possible explanations; first recorded is not first ever.

### gains: Where did runners improving toward this time gain minutes?

Focus: prepare, review.

Select finishes in the displayed achieved-time band that beat the runner’s fastest recorded finish from strictly earlier years. Compare durations in the opening 10 km, middle 20 km and final 12.195 km with that earlier result. Mean block gains sum to mean finish improvement. This is an earlier recorded best, not a lifetime personal best or a prescription for a future improvement.

## Original/core pack inventory

These are producer-owned packs, preserved by extension imports. Their original calculation source is external to this checkout unless specifically provided by the producer; this catalog does not reconstruct those pipelines. The table records historical core metadata status, not the freshness or effective readiness of the newly calculated extension replacements. The UI uses lib/research-data.ts and extension precedence to interpret them. In particular, a legacy qualifying/terrain stub can coexist with a ready, narrower extension.

| Core pack | Metadata title | Metadata status | Stored table files |
| --- | --- | --- | --- |
| [p1_pace_band_planner](../public/data/packs/p1_pace_band_planner/pack_meta.json) | Pace band planner | ready | [ability_band_counts.csv](../public/data/packs/p1_pace_band_planner/tables/ability_band_counts.csv), [cohort_sizes_exact_nosex_sample.csv](../public/data/packs/p1_pace_band_planner/tables/cohort_sizes_exact_nosex_sample.csv), [cohort_sizes_exact_sex_sample.csv](../public/data/packs/p1_pace_band_planner/tables/cohort_sizes_exact_sex_sample.csv), [fallback_probe_examples.csv](../public/data/packs/p1_pace_band_planner/tables/fallback_probe_examples.csv), [fallback_stage_rates.csv](../public/data/packs/p1_pace_band_planner/tables/fallback_stage_rates.csv), [null_weather_elev_notes.csv](../public/data/packs/p1_pace_band_planner/tables/null_weather_elev_notes.csv), [pace_band_by_ability_sex.csv](../public/data/packs/p1_pace_band_planner/tables/pace_band_by_ability_sex.csv), [pace_band_by_ability_sex_course.csv](../public/data/packs/p1_pace_band_planner/tables/pace_band_by_ability_sex_course.csv), [pace_band_by_ability_sex_majors.csv](../public/data/packs/p1_pace_band_planner/tables/pace_band_by_ability_sex_majors.csv), [weather_band_counts.csv](../public/data/packs/p1_pace_band_planner/tables/weather_band_counts.csv), [wristband_target_finish.csv](../public/data/packs/p1_pace_band_planner/tables/wristband_target_finish.csv) |
| [p2_halfway_calculator](../public/data/packs/p2_halfway_calculator/pack_meta.json) | Halfway calculator | ready | [course_coverage.csv](../public/data/packs/p2_halfway_calculator/tables/course_coverage.csv), [example_halfway_to_finish_quantiles.csv](../public/data/packs/p2_halfway_calculator/tables/example_halfway_to_finish_quantiles.csv) |
| [p3_race_week_weather](../public/data/packs/p3_race_week_weather/pack_meta.json) | Race-week weather advisory | ready | [berlin_2026_forecast.csv](../public/data/packs/p3_race_week_weather/tables/berlin_2026_forecast.csv), [forecast_coverage.csv](../public/data/packs/p3_race_week_weather/tables/forecast_coverage.csv), [null_race_morning_cities.csv](../public/data/packs/p3_race_week_weather/tables/null_race_morning_cities.csv), [rn3_berlin_htw_by_band.csv](../public/data/packs/p3_race_week_weather/tables/rn3_berlin_htw_by_band.csv) |
| [p4_even_effort_gap](../public/data/packs/p4_even_effort_gap/pack_meta.json) | Even-effort GAP splits | ready | [c2_grade_coef_caveat.csv](../public/data/packs/p4_even_effort_gap/tables/c2_grade_coef_caveat.csv), [city_summary.csv](../public/data/packs/p4_even_effort_gap/tables/city_summary.csv), [even_effort_recommended_paces.csv](../public/data/packs/p4_even_effort_gap/tables/even_effort_recommended_paces.csv), [live_gap_multipliers_by_city_segment.csv](../public/data/packs/p4_even_effort_gap/tables/live_gap_multipliers_by_city_segment.csv), [majors_segment_pace_vs_gap.csv](../public/data/packs/p4_even_effort_gap/tables/majors_segment_pace_vs_gap.csv), [null_gap_cities.csv](../public/data/packs/p4_even_effort_gap/tables/null_gap_cities.csv), [positive_vs_gap_split_by_city.csv](../public/data/packs/p4_even_effort_gap/tables/positive_vs_gap_split_by_city.csv), [positive_vs_gap_split_overall.csv](../public/data/packs/p4_even_effort_gap/tables/positive_vs_gap_split_overall.csv), [segment_pace_vs_gap.csv](../public/data/packs/p4_even_effort_gap/tables/segment_pace_vs_gap.csv) |
| [r01_banking_time](../public/data/packs/r01_banking_time/pack_meta.json) | Banking time cost (first 10km vs after 30km) | ready | [bank_ratio_by_sex.csv](../public/data/packs/r01_banking_time/tables/bank_ratio_by_sex.csv) |
| [r02_recover_slow_start](../public/data/packs/r02_recover_slow_start/pack_meta.json) | Recover slow start: immediate vs gradual | ready | [slow_start_recover.csv](../public/data/packs/r02_recover_slow_start/tables/slow_start_recover.csv) |
| [r03_accel_vs_decel_20k](../public/data/packs/r03_accel_vs_decel_20k/pack_meta.json) | Same 20km, accel vs decelerate → finish | ready | [accel_vs_decel_20k.csv](../public/data/packs/r03_accel_vs_decel_20k/tables/accel_vs_decel_20k.csv) |
| [r04_on_pace_goal_hits](../public/data/packs/r04_on_pace_goal_hits/pack_meta.json) | On-pace → sub-3 / 3:30 / 4 hit rates | ready | [on_pace_hit_rates.csv](../public/data/packs/r04_on_pace_goal_hits/tables/on_pace_hit_rates.csv) |
| [r05_exceptional_vs_prior](../public/data/packs/r05_exceptional_vs_prior/pack_meta.json) | Exceptional vs prior: even / negative / modest fade | ready | [fade_type_exceptional.csv](../public/data/packs/r05_exceptional_vs_prior/tables/fade_type_exceptional.csv) |
| [r06_decided_after_30k](../public/data/packs/r06_decided_after_30k/pack_meta.json) | How much decided after 30km | ready | [decided_after_30k.csv](../public/data/packs/r06_decided_after_30k/tables/decided_after_30k.csv) |
| [r07_wall_clock_vs_distance](../public/data/packs/r07_wall_clock_vs_distance/pack_meta.json) | Slowdown: clock vs distance | ready | [htw_elapsed_clock.csv](../public/data/packs/r07_wall_clock_vs_distance/tables/htw_elapsed_clock.csv), [htw_start_distance.csv](../public/data/packs/r07_wall_clock_vs_distance/tables/htw_start_distance.csv) |
| [r08_early_blowup_signal](../public/data/packs/r08_early_blowup_signal/pack_meta.json) | How early blowup shows | ready | [early_blowup_signal.csv](../public/data/packs/r08_early_blowup_signal/tables/early_blowup_signal.csv) |
| [r09_bad_patch_recoverable](../public/data/packs/r09_bad_patch_recoverable/pack_meta.json) | Bad patch recoverable vs cascade | ready | [bad_patch_recover.csv](../public/data/packs/r09_bad_patch_recoverable/tables/bad_patch_recover.csv) |
| [r10_unravel_typology](../public/data/packs/r10_unravel_typology/pack_meta.json) | Unravel patterns typology | ready | [fade_type_x_htw.csv](../public/data/packs/r10_unravel_typology/tables/fade_type_x_htw.csv) |
| [r11_course_section_traps](../public/data/packs/r11_course_section_traps/pack_meta.json) | Course section traps | stub | See metadata and live.json for payload |
| [r12_fastest_by_ability](../public/data/packs/r12_fastest_by_ability/pack_meta.json) | Fastest marathon by ability band | ready | [fastest_city_by_ability.csv](../public/data/packs/r12_fastest_by_ability/tables/fastest_city_by_ability.csv) |
| [r13_great_day_vs_consistency](../public/data/packs/r13_great_day_vs_consistency/pack_meta.json) | Great day vs consistency by course | ready | [great_day_vs_consistency.csv](../public/data/packs/r13_great_day_vs_consistency/tables/great_day_vs_consistency.csv) |
| [r14_knowing_course](../public/data/packs/r14_knowing_course/pack_meta.json) | Knowing course improves sections | ready | [section_paces_race2_vs_race1.csv](../public/data/packs/r14_knowing_course/tables/section_paces_race2_vs_race1.csv) |
| [r15_weather_penalty_who](../public/data/packs/r15_weather_penalty_who/pack_meta.json) | Weather penalty who/where | stub | See metadata and live.json for payload |
| [r16_groups_hold_or_fall](../public/data/packs/r16_groups_hold_or_fall/pack_meta.json) | Groups hold or fall apart | stub | See metadata and live.json for payload |
| [r17_milestone_kick](../public/data/packs/r17_milestone_kick/pack_meta.json) | Milestone kick final 2.195 | ready | [milestone_kick_hit.csv](../public/data/packs/r17_milestone_kick/tables/milestone_kick_hit.csv) |
| [r18_bq_rule_changes](../public/data/packs/r18_bq_rule_changes/pack_meta.json) | BQ rule changes pacing | stub | See metadata and live.json for payload |
| [r19_near_miss_return](../public/data/packs/r19_near_miss_return/pack_meta.json) | Near miss → return within a year | ready | [near_miss_return.csv](../public/data/packs/r19_near_miss_return/tables/near_miss_return.csv) |
| [r20_pacing_personalities](../public/data/packs/r20_pacing_personalities/pack_meta.json) | Pacing personalities persist | ready | [pacing_personality_corr.csv](../public/data/packs/r20_pacing_personalities/tables/pacing_personality_corr.csv) |
| [r21_learn_from_blowup](../public/data/packs/r21_learn_from_blowup/pack_meta.json) | Learn from blowing up | ready | [learn_after_blowup.csv](../public/data/packs/r21_learn_from_blowup/tables/learn_after_blowup.csv) |
| [r22_aging_changes](../public/data/packs/r22_aging_changes/pack_meta.json) | Aging: what changes first | ready | [age_speed_endurance.csv](../public/data/packs/r22_aging_changes/tables/age_speed_endurance.csv) |
| [r23_gender_pacing](../public/data/packs/r23_gender_pacing/pack_meta.json) | Gender pacing: open vs sustain | ready | [gender_open_vs_sustain.csv](../public/data/packs/r23_gender_pacing/tables/gender_open_vs_sustain.csv) |
| [r24_interval_after_pb](../public/data/packs/r24_interval_after_pb/pack_meta.json) | Interval after PB vs collapse → next | ready | [interval_after_pb_vs_collapse.csv](../public/data/packs/r24_interval_after_pb/tables/interval_after_pb_vs_collapse.csv) |
| [r25_huge_kick_next](../public/data/packs/r25_huge_kick_next/pack_meta.json) | Huge kick → next improvement | ready | [huge_kick_next.csv](../public/data/packs/r25_huge_kick_next/tables/huge_kick_next.csv) |
| [r26_pacing_over_20y](../public/data/packs/r26_pacing_over_20y/pack_meta.json) | 20y: faster early vs less late fade | stub | See metadata and live.json for payload |
| [rn1_wall_severity](../public/data/packs/rn1_wall_severity/pack_meta.json) | Slowdown severity spectrum | ready | [htw_vs_severity_band.csv](../public/data/packs/rn1_wall_severity/tables/htw_vs_severity_band.csv), [severity_band_by_ability.csv](../public/data/packs/rn1_wall_severity/tables/severity_band_by_ability.csv), [severity_band_by_sex.csv](../public/data/packs/rn1_wall_severity/tables/severity_band_by_sex.csv), [severity_band_counts.csv](../public/data/packs/rn1_wall_severity/tables/severity_band_counts.csv), [severity_histogram.csv](../public/data/packs/rn1_wall_severity/tables/severity_histogram.csv) |
| [rn3_heat_curves](../public/data/packs/rn3_heat_curves/pack_meta.json) | Heat decomposition / heat curves | ready | [by_city_weather_band.csv](../public/data/packs/rn3_heat_curves/tables/by_city_weather_band.csv), [finish_quantiles_by_weather_band.csv](../public/data/packs/rn3_heat_curves/tables/finish_quantiles_by_weather_band.csv), [htw_severity_by_band_sex.csv](../public/data/packs/rn3_heat_curves/tables/htw_severity_by_band_sex.csv), [late_wx_vs_fade.csv](../public/data/packs/rn3_heat_curves/tables/late_wx_vs_fade.csv), [splits_by_weather_band.csv](../public/data/packs/rn3_heat_curves/tables/splits_by_weather_band.csv), [weather_band_counts.csv](../public/data/packs/rn3_heat_curves/tables/weather_band_counts.csv), [wx_coverage.csv](../public/data/packs/rn3_heat_curves/tables/wx_coverage.csv) |
| [rn4_reference_dependence](../public/data/packs/rn4_reference_dependence/pack_meta.json) | Reference dependence | ready | [cliff_ratios.csv](../public/data/packs/rn4_reference_dependence/tables/cliff_ratios.csv), [cliff_ratios_primary.csv](../public/data/packs/rn4_reference_dependence/tables/cliff_ratios_primary.csv), [finish_histogram.csv](../public/data/packs/rn4_reference_dependence/tables/finish_histogram.csv), [finish_histogram_by_sex.csv](../public/data/packs/rn4_reference_dependence/tables/finish_histogram_by_sex.csv), [hit_near_miss_counts.csv](../public/data/packs/rn4_reference_dependence/tables/hit_near_miss_counts.csv), [milestone_kick_by_outcome.csv](../public/data/packs/rn4_reference_dependence/tables/milestone_kick_by_outcome.csv), [milestone_kick_hit.csv](../public/data/packs/rn4_reference_dependence/tables/milestone_kick_hit.csv), [on_pace_hit_rates.csv](../public/data/packs/rn4_reference_dependence/tables/on_pace_hit_rates.csv) |
| [s10_goal_slips](../public/data/packs/s10_goal_slips/pack_meta.json) | What happens when a goal slips away? | ready | [goal_slips_vs_hit.csv](../public/data/packs/s10_goal_slips/tables/goal_slips_vs_hit.csv) |
| [s11_recover_bad_patch](../public/data/packs/s11_recover_bad_patch/pack_meta.json) | Can runners recover from a bad patch? | ready | [bad_patch_recover.csv](../public/data/packs/s11_recover_bad_patch/tables/bad_patch_recover.csv) |
| [s12_pacing_over_20y](../public/data/packs/s12_pacing_over_20y/pack_meta.json) | Have marathoners become better at pacing over 20 years? | stub | See metadata and live.json for payload |
| [s1_banking_time](../public/data/packs/s1_banking_time/pack_meta.json) | The price of banking time | ready | [bank_ratio_by_sex.csv](../public/data/packs/s1_banking_time/tables/bank_ratio_by_sex.csv) |
| [s2_target_odds](../public/data/packs/s2_target_odds/pack_meta.json) | Odds of breaking a target time | ready | [on_pace_hit_rates.csv](../public/data/packs/s2_target_odds/tables/on_pace_hit_rates.csv) |
| [s3_course_breaks](../public/data/packs/s3_course_breaks/pack_meta.json) | Where each marathon breaks people | ready | [course_section_elev_vs_pace.csv](../public/data/packs/s3_course_breaks/tables/course_section_elev_vs_pace.csv) |
| [s4_time_translation](../public/data/packs/s4_time_translation/pack_meta.json) | What your time translates to on another course | stub | See metadata and live.json for payload |
| [s5_pacing_vs_difficult_day](../public/data/packs/s5_pacing_vs_difficult_day/pack_meta.json) | Was it my pacing or a difficult race day? | stub | See metadata and live.json for payload |
| [s6_wall_distance_vs_time](../public/data/packs/s6_wall_distance_vs_time/pack_meta.json) | Slowdown linked to distance or elapsed time? | ready | [wall_distance_vs_clock.csv](../public/data/packs/s6_wall_distance_vs_time/tables/wall_distance_vs_clock.csv), [wall_seg_elevation.csv](../public/data/packs/s6_wall_distance_vs_time/tables/wall_seg_elevation.csv) |
| [s7_learn_after_blowup](../public/data/packs/s7_learn_after_blowup/pack_meta.json) | Do runners learn after blowing up? | ready | [learn_after_blowup.csv](../public/data/packs/s7_learn_after_blowup/tables/learn_after_blowup.csv) |
| [s8_age_speed_vs_endurance](../public/data/packs/s8_age_speed_vs_endurance/pack_meta.json) | What changes with age: speed or endurance? | ready | [age_speed_endurance.csv](../public/data/packs/s8_age_speed_vs_endurance/tables/age_speed_endurance.csv) |
| [s9_weather_penalty](../public/data/packs/s9_weather_penalty/pack_meta.json) | Weather penalty for different runners | ready | [weather_penalty_by_temp.csv](../public/data/packs/s9_weather_penalty/tables/weather_penalty_by_temp.csv) |
| [Sustained-slowdown figures](../public/data/packs/smyth_htw/pack_meta.json) | Sustained slowdown (Figures 1–6) | ok | [fig1_sensitivity.csv](../public/data/packs/smyth_htw/tables/fig1_sensitivity.csv), [fig2_a_htw_by_age.csv](../public/data/packs/smyth_htw/tables/fig2_a_htw_by_age.csv), [fig2_b_htw_by_ability.csv](../public/data/packs/smyth_htw/tables/fig2_b_htw_by_ability.csv), [fig3_a_years_from_pb.csv](../public/data/packs/smyth_htw/tables/fig3_a_years_from_pb.csv), [fig3_b_pb_periods.csv](../public/data/packs/smyth_htw/tables/fig3_b_pb_periods.csv), [fig5_a_htw_start_by_age.csv](../public/data/packs/smyth_htw/tables/fig5_a_htw_start_by_age.csv), [fig5_b_htw_start_by_ability.csv](../public/data/packs/smyth_htw/tables/fig5_b_htw_start_by_ability.csv), [fig5_c_htw_distance_by_age.csv](../public/data/packs/smyth_htw/tables/fig5_c_htw_distance_by_age.csv), [fig5_d_htw_distance_by_ability.csv](../public/data/packs/smyth_htw/tables/fig5_d_htw_distance_by_ability.csv), [fig5_e_htw_slowdown_by_age.csv](../public/data/packs/smyth_htw/tables/fig5_e_htw_slowdown_by_age.csv), [fig5_f_htw_slowdown_by_ability.csv](../public/data/packs/smyth_htw/tables/fig5_f_htw_slowdown_by_ability.csv), [fig6_a_htw_time_by_age.csv](../public/data/packs/smyth_htw/tables/fig6_a_htw_time_by_age.csv), [fig6_b_htw_time_by_ability.csv](../public/data/packs/smyth_htw/tables/fig6_b_htw_time_by_ability.csv), [fig6_c_htw_cost_by_age.csv](../public/data/packs/smyth_htw/tables/fig6_c_htw_cost_by_age.csv), [fig6_d_htw_cost_by_ability.csv](../public/data/packs/smyth_htw/tables/fig6_d_htw_cost_by_ability.csv), [fig6_e_htw_rel_cost_by_age.csv](../public/data/packs/smyth_htw/tables/fig6_e_htw_rel_cost_by_age.csv), [fig6_f_htw_rel_cost_by_ability.csv](../public/data/packs/smyth_htw/tables/fig6_f_htw_rel_cost_by_ability.csv), [htw_proportion_overall.csv](../public/data/packs/smyth_htw/tables/htw_proportion_overall.csv), [table_original_by_city.csv](../public/data/packs/smyth_htw/tables/table_original_by_city.csv), [table_original_by_sex.csv](../public/data/packs/smyth_htw/tables/table_original_by_sex.csv), [table_repeaters_by_sex.csv](../public/data/packs/smyth_htw/tables/table_repeaters_by_sex.csv) |

## Sustained-slowdown definition and analysis gaps

The inherited [Published slowdown method (2021)](https://doi.org/10.1371/journal.pone.0251513) remains slowdown ≥25%, sustained ≥5 km after 20 km, relative to baseline pace over 5–20 km. The core figures/tables are in [public/data/live.json](../public/data/live.json); the sustained-slowdown dashboard and chart/table components render them at `/slowdown`. Published reference numbers remain distinguished from this project's calculations. Internal legacy keys and compatibility routes do not change the measure's definition.

Group dynamics (`r16_groups_hold_or_fall`) and congestion (`r33_start_congestion`) cannot establish physical proximity or overtakes from elapsed splits alone. Actual start offsets/absolute timing and wave information are missing in the audited vintage. Current terrain and course comparisons are proxies/observational comparisons; qualifying-threshold analysis is narrower than identifying individual qualification or acceptance.

## Maintaining this document

Review the primary ten against `lib/ten-analyses.ts`, and the archive and backing-engine maps against `analysis/pack_registry.json`, `lib/question-catalog.ts` and `lib/personalized-catalog.ts` after adding analyses. Update the entry's method, input vintage, cohort, script and output links when calculations change. Preserve the separation between hypotheses, measured fields, derived features, completed outputs and blocked questions.
