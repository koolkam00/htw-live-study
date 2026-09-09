export type AnalysisPlan = { measure: string; compare: string; needs: string };

// Research specifications describe future calculations, never completed findings.
export const ANALYSIS_PLANS: Record<string, AnalysisPlan> = {
  r10_unravel_typology: {
    measure: 'The frequency of complete race shapes, pace variability, changes between halves, and finishing acceleration.',
    compare: 'Group each runner’s distance-normalized split profile into interpretable patterns. Show median profiles and their spread by course and prior ability.',
    needs: 'Individual valid splits and documented pattern definitions. Course-average curves cannot supply the shape or variation within a runner group.',
  },
  r05_exceptional_vs_prior: {
    measure: 'Finish time relative to a pre-race expectation, and where the runner gained or lost time.',
    compare: 'A runner’s unusually good race with their ordinary performances, allowing for age, course, conditions, and race spacing.',
    needs: 'Linked race histories, an explicit exceptional-performance threshold, and predictions built using only earlier performances.',
  },
  r01_banking_time: {
    measure: 'Opening pace relative to prior ability, finish performance, target achievement, and the size of gains or shortfalls.',
    compare: 'Cautious, steady, and aggressive openings within comparable pre-race ability, course, weather, age, and experience groups. Report both typical outcomes and their spread.',
    needs: 'A documented opening-pace measure, individual splits, prior performances, and recorded targets where available.',
  },
  r02_recover_slow_start: {
    measure: 'Catch-up speed, subsequent consistency, and finish time relative to expectation.',
    compare: 'Immediate acceleration, gradual catch-up, and maintaining the slower pace after similar slow starts. Account for congestion and prior ability.',
    needs: 'Individual early splits, clear slow-start and recovery definitions, start waves or offsets, and pre-race ability.',
  },
  r03_accel_vs_decel_20k: {
    measure: 'Remaining race time, finish position, and prediction uncertainty.',
    compare: 'Runners reaching 20 km in narrow time bands while accelerating, maintaining pace, or slowing. Test predictions on later, unseen race editions.',
    needs: 'Individual checkpoint histories and prior performances. The available broad time bands are not equivalent arrival times.',
  },
  r08_early_blowup_signal: {
    measure: 'How accurately each checkpoint predicts remaining time, target achievement, or a change in pacing pattern.',
    compare: 'Elapsed time alone with elapsed time plus recent pace trend and variability. Keep every input available at the checkpoint being tested.',
    needs: 'Individual complete split histories, predefined outcomes, and race editions held out for validation.',
  },
  r09_bad_patch_recoverable: {
    measure: 'Frequency of regained pace, time to recovery, and finish performance after a temporary slowdown.',
    compare: 'Similar slowdowns with different subsequent responses, adjusting for course section, prior ability, and conditions.',
    needs: 'Documented bad-patch and recovery thresholds and individual split sequences. Five-kilometer readings limit the timing precision.',
  },
  s3_course_breaks: {
    measure: 'Typical relative pace and its variation across all course sections, including acceleration and strong finishes.',
    compare: 'Distance-weighted profiles by race edition and prior ability, with terrain alongside the profile.',
    needs: 'Individual splits to calculate runner-normalized medians and uncertainty bands, plus dated route versions and elevation. Current curves use course-level means.',
  },
  r11_course_section_traps: {
    measure: 'Pace changes on climbs and descents, and the return toward baseline in subsequent sections.',
    compare: 'Similar runners on the same terrain, allowing for distance already run and race conditions. Terrain-adjusted pace is an estimate, not a direct effort measurement.',
    needs: 'Individual segment times and historical course geometry. A section’s net height change can conceal hills within it.',
  },
  r15_weather_penalty_who: {
    measure: 'Opening restraint, the pacing profile through the race, finish performance, and variability of outcomes.',
    compare: 'Similar runners and course editions across conditions, matching weather to each wave and segment arrival time.',
    needs: 'Linked pre-race ability, individual splits, dated courses, wave or start times, and hourly weather. Current weather summaries pool different fields.',
  },
  r16_groups_hold_or_fall: {
    measure: 'Pace consistency, surges, group continuity, and finish outcomes.',
    compare: 'Runners who stay with a group, join or leave one, or run without a sustained group, at comparable ability and course positions.',
    needs: 'Absolute checkpoint timestamps and start offsets. Similar chip elapsed times do not establish physical proximity.',
  },
  r07_wall_clock_vs_distance: {
    measure: 'The beginning of acceleration, gradual fading, recovery, and sustained slowing.',
    compare: 'Distance-based and elapsed-time-based models across ability groups, using the same change definitions and unseen races for validation.',
    needs: 'Individual complete split histories and arrival times. Existing wall-episode summaries cover only one kind of pacing change.',
  },
  r21_learn_from_blowup: {
    measure: 'Changes in opening pace, variability, terrain responses, finishing speed, and performance across appearances.',
    compare: 'Each runner with their earlier races, separating first observed appearance from actual marathon debut and adjusting for conditions.',
    needs: 'Linked race histories, prior ability and start-to-start intervals. An analysis of repeated wall episodes cannot establish learning.',
  },
  r22_aging_changes: {
    measure: 'Opening speed, consistency, pace retention, and performance as the same runners get older.',
    compare: 'Within-runner changes across age transitions, alongside differences between age groups.',
    needs: 'Reliable age and identity links over time, with course, conditions, and continued participation accounted for.',
  },
  r23_gender_pacing: {
    measure: 'Opening pace, variability, recovery, late-race pace retention, and finishing acceleration.',
    compare: 'Reported gender groups matched on age, prior ability, experience, course, and conditions.',
    needs: 'Individual splits and pre-race histories. Preserve reported categories; do not infer gender from names.',
  },
  r25_huge_kick_next: {
    measure: 'Finishing acceleration, performance relative to prior ability, and improvement in a subsequent race.',
    compare: 'Strong finishes following cautious, steady, or aggressive openings, within comparable runners and race conditions.',
    needs: 'A documented finishing-kick measure, earlier performances, and comparable follow-up. A strong finish alone does not establish unused capacity.',
  },
  r30_negative_split_success: {
    measure: 'Performance relative to a pre-race expectation for even, faster-second-half, and modestly slower-second-half races.',
    compare: 'Runners of similar prior ability on comparable course editions. Show the outcome distribution rather than assuming one split pattern is best.',
    needs: 'Documented pattern and performance thresholds, individual splits, and linked prior results. The current exceptional-performance table is unadjusted.',
  },
  r31_multiple_good_strategies: {
    measure: 'The race shapes associated with strong outcomes, and the uncertainty around each approach.',
    compare: 'Complete normalized profiles among better-than-expected performances, within course and pre-race ability groups. Check whether several shapes have comparable outcomes.',
    needs: 'Individual split profiles and independent pre-race expectations. Counts of successful patterns cannot establish equal effectiveness.',
  },
  r32_where_pbs_are_gained: {
    measure: 'Seconds gained or lost in the opening 10 km, middle 20 km, and final 12.195 km of a personal best.',
    compare: 'Each new recorded best with the runner’s previous best, using exact section lengths and comparable route versions.',
    needs: 'Linked individual splits for successive personal bests, race dates, and course conditions. The section gains must sum to the finish-time improvement.',
  },
  r33_start_congestion: {
    measure: 'Start delay, first-section pace, catch-up behavior, and the remainder of the race.',
    compare: 'Runners of similar prior ability across waves and corrals. Use crowd and timing evidence to distinguish congestion from deliberate restraint where possible.',
    needs: 'Individual chip and gun times, wave or corral assignments, checkpoint clock times, and dated start arrangements.',
  },
  r34_pacing_risk_reward: {
    measure: 'Median finish performance, outcome percentiles, the chance of an exceptional result, and the size of shortfalls.',
    compare: 'Different opening and mid-race approaches within comparable pre-race ability and race editions. Include uncertainty and sample sizes.',
    needs: 'Individual pacing profiles and pre-race expectations. A course’s finish-time spread does not measure the variability of a pacing strategy.',
  },
  r35_course_adaptation: {
    measure: 'Terrain-related pace adjustments, return toward baseline, and performance relative to expectation.',
    compare: 'Stronger and ordinary performances within prior ability groups on the same course sections, accounting for conditions and distance already run.',
    needs: 'Individual splits, prior performances, and dated course elevation. Five-kilometer net grades and course means cannot reveal individual effort.',
  },
};
