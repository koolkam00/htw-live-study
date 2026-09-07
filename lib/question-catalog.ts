export type QuestionDefinition = { number: number; id: string; title: string; aliases?: string[] };

// Preserve the original 26 numbers. Three distinct questions from the first
// list are appended; course translation is included in question 12.
export const QUESTIONS: QuestionDefinition[] = [
  { number: 1, id: 'r01_banking_time', title: 'What does banking time actually cost?', aliases: ['s1_banking_time'] },
  { number: 2, id: 'r02_recover_slow_start', title: 'Does trying to recover a slow start make things worse?' },
  { number: 3, id: 'r03_accel_vs_decel_20k', title: 'Can identical checkpoint times hide very different races?' },
  { number: 4, id: 'r04_on_pace_goal_hits', title: 'Does being on pace mean you will hit your goal?', aliases: ['s2_target_odds'] },
  { number: 5, id: 'r05_exceptional_vs_prior', title: 'What does an exceptional performance look like across the splits?' },
  { number: 6, id: 'r06_decided_after_30k', title: 'How much of a marathon is decided after 30 km?' },
  { number: 7, id: 'r07_wall_clock_vs_distance', title: 'Does the wall follow the clock or the distance?', aliases: ['s6_wall_distance_vs_time'] },
  { number: 8, id: 'r08_early_blowup_signal', title: 'How early does a major slowdown reveal itself?' },
  { number: 9, id: 'r09_bad_patch_recoverable', title: 'When is a bad patch recoverable?', aliases: ['s11_recover_bad_patch'] },
  { number: 10, id: 'r10_unravel_typology', title: 'Are there distinct ways a marathon unravels?' },
  { number: 11, id: 'r11_course_section_traps', title: 'Which course sections are traps?' },
  { number: 12, id: 'r12_fastest_by_ability', title: 'What would your time be on another course?', aliases: ['s4_time_translation'] },
  { number: 13, id: 'r13_great_day_vs_consistency', title: 'Which marathon offers speed, and which offers consistency?' },
  { number: 14, id: 'r14_knowing_course', title: 'Does knowing the course improve execution?' },
  { number: 15, id: 'r15_weather_penalty_who', title: 'Who pays the biggest weather penalty, and where?', aliases: ['s9_weather_penalty'] },
  { number: 16, id: 'r16_groups_hold_or_fall', title: 'Do groups hold runners together or fall apart together?' },
  { number: 17, id: 'r17_milestone_kick', title: 'How much finishing speed appears when a milestone is within reach?' },
  { number: 18, id: 'r18_bq_rule_changes', title: 'Do qualifying rules change how people race?' },
  { number: 19, id: 'r19_near_miss_return', title: 'Does a near miss bring people back?' },
  { number: 20, id: 'r20_pacing_personalities', title: 'Do runners have persistent pacing habits?' },
  { number: 21, id: 'r21_learn_from_blowup', title: 'Do runners learn from a bad race?', aliases: ['s7_learn_after_blowup'] },
  { number: 22, id: 'r22_aging_changes', title: 'What changes first as runners age: speed or endurance?', aliases: ['s8_age_speed_vs_endurance'] },
  { number: 23, id: 'r23_gender_pacing', title: 'Where do gender differences in pacing originate?' },
  { number: 24, id: 'r24_interval_after_pb', title: 'How does the previous marathon affect the next one?' },
  { number: 25, id: 'r25_huge_kick_next', title: 'Does a huge finishing kick predict future improvement?' },
  { number: 26, id: 'r26_pacing_over_20y', title: 'Have runners become faster or better at holding their speed?', aliases: ['s12_pacing_over_20y'] },
  { number: 27, id: 's3_course_breaks', title: 'Where does each marathon break people?' },
  { number: 28, id: 's5_pacing_vs_difficult_day', title: 'Was it my pacing or a difficult race day?' },
  { number: 29, id: 's10_goal_slips', title: 'What happens when a goal slips away?' },
];

export const EXTRA_TITLES: Record<string, string> = {
  smyth_htw: 'How often do marathon runners hit the wall?',
  rn1_wall_severity: 'How severe is late-race slowing?',
  rn3_heat_curves: 'How does late-race slowing vary with temperature?',
  rn4_reference_dependence: 'Do runners bunch just before round-number finish times?',
  p1_pace_band_planner: 'How do comparable runners pace their marathons?',
  p2_halfway_calculator: 'What can your 20 km time tell you about your finish?',
  p3_race_week_weather: 'Are race-day weather forecasts available?',
  p4_even_effort_gap: 'How much does the pacing pattern change after course adjustment?',
};

export function questionForPack(id: string): QuestionDefinition | undefined {
  return QUESTIONS.find(question => question.id === id || question.aliases?.includes(id));
}
