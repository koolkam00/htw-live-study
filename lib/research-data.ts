import fs from 'node:fs';
import path from 'node:path';
import { parseCsv, finite, formatNumber, type DataRow } from './csv';
import { QUESTIONS, EXTRA_TITLES, questionForPack, type QuestionDefinition } from './question-catalog';

export type ChartSpec = {
  title: string;
  unit: string;
  xLabel: string;
  kind?: 'bars' | 'line';
  xNumeric?: boolean;
  xUnit?: string;
  rows: DataRow[];
  series: { key: string; label: string }[];
  filters?: { key: string; label: string; preferred?: string }[];
  note?: string;
  source?: string;
};
export type ResearchAnswer = {
  id: string; number?: number; title: string; aliases: string[];
  answer: string; detail?: string; method: string[]; charts: ChartSpec[];
  sources: { href: string; label: string }[]; published: string | null;
  available: boolean; related?: { href: string; label: string }[];
};

const root = path.join(process.cwd(), 'public', 'data');
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
export function readJson(file: string): any | null {
  try { return JSON.parse(fs.readFileSync(path.join(root, file), 'utf8')); }
  catch { return null; }
}
export function table(pack: string, name: string): DataRow[] {
  const meta = readJson(`packs/${pack}/pack_meta.json`);
  if (!['ready', 'ok'].includes(meta?.status)) return [];
  try { return parseCsv(fs.readFileSync(path.join(root, 'packs', pack, 'tables', name), 'utf8')); }
  catch { return []; }
}
export function getLive() { return readJson('live.json'); }
export function liveRows(name: string): DataRow[] {
  const live = getLive();
  if (!['ready', 'ok'].includes(live?.status)) return [];
  const t = live?.tables?.[name];
  if (!Array.isArray(t?.columns) || !Array.isArray(t?.rows)) return [];
  return t.rows.map((values: unknown[]) => Object.fromEntries(t.columns.map((key: string, i: number) => [key, values[i] ?? null])));
}
const num = (row: DataRow | undefined, key: string) => finite(row?.[key]);
const pct = (value: number) => formatNumber(value * 100, '%');
const count = (value: number) => formatNumber(value, 'runners');
const sum = (rows: DataRow[], key: string) => rows.reduce((total, row) => total + (num(row, key) ?? 0), 0);
const weighted = (rows: DataRow[], key: string, nKey = 'n') => {
  const usable = rows.filter(row => num(row, key) !== null && (num(row, nKey) ?? 0) > 0);
  const denominator = sum(usable, nKey);
  return denominator ? usable.reduce((total, row) => total + Number(row[key]) * Number(row[nKey]), 0) / denominator : null;
};
const labels: Record<string, string> = {
  F: 'Women', M: 'Men', ALL: 'All runners', sub3: 'Under 3 hours', sub330: 'Under 3:30', sub4: 'Under 4 hours',
  sub430: 'Under 4:30', sub5: 'Under 5 hours', True: 'Recovered', False: 'Did not recover',
  collapse: 'Major fade', even: 'Even pace', modest_fade: 'Modest fade', negative_split: 'Faster second half', recover: 'Fade then recovery',
  fast20: 'Faster 20 km group', mid20: 'Middle 20 km group', slow20: 'Slower 20 km group',
  accel: 'Accelerating', steady: 'Steady', decel: 'Slowing', Q1_low: 'Smallest kick', Q2: 'Second quarter', Q3: 'Third quarter', Q4_high: 'Largest kick',
  cool: 'Below 10°C', mild: '10 to <15°C', warm: '15 to <21°C', hot: '21°C or warmer',
  none: 'Below 10%', moderate: '25 to <40%', severe: '40% or more',
  slipped: 'Missed the goal', hit: 'Made the goal', top_decile_kick: 'Largest 10% of finishing kicks', rest: 'Other runners',
};
export const readableLabel = (value: unknown) => labels[String(value)] || String(value ?? 'Not recorded').replace(/_/g, ' ');

function sexChart(rows: DataRow[], xKey: string, valueKey: string, title: string, unit: string, multiplier = 1, extras: string[] = [], transform?: (row: DataRow) => string): ChartSpec {
  const points = new Map<string, DataRow>();
  for (const row of rows) {
    if (!['F', 'M'].includes(String(row.sex)) || num(row, valueKey) === null || row[xKey] === null) continue;
    const key = JSON.stringify([row[xKey], ...extras.map(extra => row[extra])]);
    const point = points.get(key) || { label: transform ? transform(row) : readableLabel(row[xKey]), ...Object.fromEntries(extras.map(extra => [extra, readableLabel(row[extra])])) };
    const sex = row.sex === 'F' ? 'women' : 'men';
    point[sex] = Number(row[valueKey]) * multiplier;
    point[`n_${sex}`] = num(row, 'n') ?? num(row, 'n_on_pace') ?? num(row, 'n_above') ?? num(row, 'n_pairs');
    points.set(key, point);
  }
  return { title, unit, xLabel: 'Group', rows: [...points.values()], series: [{ key: 'women', label: 'Women' }, { key: 'men', label: 'Men' }] };
}
function singleChart(rows: DataRow[], xKey: string, valueKey: string, title: string, unit: string, multiplier = 1): ChartSpec {
  return { title, unit, xLabel: 'Group', series: [{ key: 'value', label: title }], rows: rows.filter(row => row[xKey] !== null && num(row, valueKey) !== null).map(row => ({ label: readableLabel(row[xKey]), value: Number(row[valueKey]) * multiplier, n_value: num(row, 'n') ?? num(row, 'n_pairs') ?? num(row, 'n_near_miss') })) };
}

const pending: Record<string, { answer: string; method: string }> = {
  r11_course_section_traps: { answer: 'We do not yet know which fast sections are followed by an avoidable late-race slowdown.', method: 'This needs runner-level comparisons of early section effort and subsequent pacing, with the correct course version and prior ability. An elevation profile alone cannot identify a pacing trap.' },
  r16_groups_hold_or_fall: { answer: 'This question needs checkpoint clock times before we can identify runners who were actually together.', method: 'Chip elapsed times do not establish physical proximity when runners start in different waves. Match absolute checkpoint times and start offsets, then compare group continuity with later pacing.' },
  r18_bq_rule_changes: { answer: 'The results have not yet been matched to historical Boston qualifying standards.', method: 'Attach the standard and qualifying-age rules applicable to each performance. Compare affected groups before and after rule changes, keeping published standards separate from the eventual acceptance cutoff.' },
  r26_pacing_over_20y: { answer: 'The study does not yet separate improvements in speed from improvements in pacing over time.', method: 'Compare opening pace and late-race pace retention across years while accounting for field composition, route changes, and race-day conditions. Results alone cannot attribute changes to shoes, training, or fueling.' },
  s5_pacing_vs_difficult_day: { answer: 'A personal comparison with runners facing the same race-day conditions is not available yet.', method: 'Estimate expected section times for runners with similar prior performances in the same race edition. Compare the individual with that profile, accounting for route, start time, weather, and sample size.' },
};

export function getStudyAnswer(): ResearchAnswer {
  const live = getLive();
  const cityRows = liveRows('t1');
  const rate = weighted(cityRows, 'pct_htw', 'n_records');
  const total = sum(cityRows, 'n_records');
  const d = live?.definition || {};
  const threshold = finite(d.dos);
  const length = finite(d.los_km);
  const after = finite(d.after_km);
  const start = finite(d.base_pace_from_km ?? d.base_window_km?.[0]);
  const end = finite(d.base_pace_to_km ?? d.base_window_km?.[1]);
  const definition = threshold !== null && length !== null && after !== null && start !== null && end !== null
    ? `A runner meets this study's wall definition when their pace is at least ${formatNumber(threshold * 100, '%')} slower for ${length} km or more after ${after} km, compared with their average pace from ${start} to ${end} km.`
    : 'The slowdown threshold and reference window are not available for this snapshot.';
  const chart = sexChart(liveRows('t2'), 'age_group', 'pct_htw', 'Runners meeting the wall definition', '%');
  chart.xLabel = 'Age group';
  chart.note = 'Age groups use only records with a reported age. Each percentage uses the runners in that age and gender group.';
  return { id: 'smyth_htw', title: EXTRA_TITLES.smyth_htw, aliases: [], available: rate !== null,
    answer: rate !== null ? `About ${formatNumber(rate, '%')} of recorded finishes meet the study’s definition of hitting the wall.` : 'The study-wide result is not available in this snapshot.',
    detail: rate !== null ? `That is about ${Math.round(rate)} in every 100 recorded finishes, across ${count(total)} results. A runner can appear more than once.` : undefined,
    method: [definition, 'The overall percentage is weighted by the number of finishes in each city. The age chart has a smaller denominator because some records have no age group.', 'A timing pattern is a proxy for sustained slowing. It cannot distinguish glycogen depletion from injury, fatigue, deliberate walking, or another cause.'],
    charts: chart.rows.length ? [chart] : [], published: live?.as_of ?? null,
    sources: [{ href: `${basePath}/data/live.json`, label: 'Study data' }, { href: 'https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0251513', label: 'Original research' }] };
}

export function getResearchAnswer(def: QuestionDefinition): ResearchAnswer {
  const pack = def.id;
  const meta = readJson(`packs/${pack}/pack_meta.json`);
  const result: ResearchAnswer = { id: pack, number: def.number, title: def.title, aliases: def.aliases || [],
    answer: 'An answer is not available in the current results.', method: [], charts: [], sources: [], published: meta?.as_of || null, available: false };
  const add = (id: string, file: string) => {
    const rows = table(id, file);
    if (rows.length) result.sources.push({ href: `${basePath}/data/packs/${id}/tables/${file}`, label: result.sources.length ? 'Supporting data (CSV)' : 'Chart data (CSV)' });
    return rows;
  };
  const read = (file: string) => add(pack, file);
  const chart = (spec: ChartSpec) => { if (spec.rows.length) result.charts.push(spec); };
  if (pending[pack]) {
    result.answer = pending[pack].answer; result.method = [pending[pack].method]; return result;
  }
  switch (pack) {
    case 'r01_banking_time': {
      const rows = read('bank_ratio_by_sex.csv');
      result.answer = 'Higher recorded banking ratios are associated with more late-race collapses. These results do not yet put a causal price on starting faster.';
      result.method = ['The chart compares wall rates within the published banking-ratio groups and gender categories. These are descriptive groups, not runners matched on prior ability.', 'The export does not document the exact reference used for the banking ratio. A minutes-gained versus minutes-lost estimate needs that definition and an ability measure available before the race.'];
      chart(sexChart(rows, 'bank_bin', 'htw_rate', 'Wall rate by recorded banking ratio', '%', 100)); break;
    }
    case 'r02_recover_slow_start': {
      const rows = read('slow_start_recover.csv');
      result.answer = 'Runners classified as recovering a slow start had lower wall rates. The results do not yet compare an immediate catch-up with a gradual one.';
      result.method = ['Compare the exported recovered and not-recovered groups after a slow start. The groups differ greatly in size and are not randomized.', 'The slow-start and recovery thresholds are not documented in this export, so the chart cannot establish the best catch-up strategy.'];
      chart(sexChart(rows, 'recovered', 'htw_rate', 'Wall rate after a slow start', '%', 100)); break;
    }
    case 'r03_accel_vs_decel_20k': {
      const rows = read('accel_vs_decel_20k.csv');
      result.answer = 'Within broad 20 km time groups, runners who were already slowing generally had higher wall rates than those holding or increasing their pace.';
      result.method = ['Compare acceleration groups within the published fast, middle, or slow 20 km bands. These bands are not identical checkpoint times or a match on prior fitness.', 'Band boundaries and the acceleration formula need fuller documentation before these associations can support an individual forecast.'];
      const spec = sexChart(rows, 'accel_tert', 'htw_rate', 'Wall rate by pace trend approaching 20 km', '%', 100, ['cum20_band']);
      spec.filters = [{ key: 'cum20_band', label: '20 km time group', preferred: 'Middle 20 km group' }]; chart(spec); break;
    }
    case 'r04_on_pace_goal_hits': {
      const rows = read('on_pace_hit_rates.csv');
      const at20 = weighted(rows.filter(row => row.goal === 'sub3' && row.checkpoint_km === 20), 'hit_rate', 'n_on_pace');
      const at30 = weighted(rows.filter(row => row.goal === 'sub3' && row.checkpoint_km === 30), 'hit_rate', 'n_on_pace');
      if (at20 !== null && at30 !== null) result.answer = `Of runners on sub-3 pace, ${pct(at20)} broke three hours when measured at 20 km, compared with ${pct(at30)} at 30 km.`;
      result.method = ['On pace means being within the even-pace time budget for the target at that checkpoint. Hit rate is the number who finish under the target divided by the number on pace.', 'The opening comparison combines genders using their sample sizes. Each checkpoint is a different group, not a prediction updated for one runner. The current export covers 20 and 30 km.', 'These historical rates do not yet condition on course, age, weather, or previous performances. Twenty kilometers is before the halfway point of 21.0975 km.'];
      const spec = sexChart(rows, 'checkpoint_km', 'hit_rate', 'Share of on-pace runners who achieved the target', '%', 100, ['goal'], row => `${row.checkpoint_km} km`);
      spec.filters = [{ key: 'goal', label: 'Finish target', preferred: 'Under 3 hours' }]; chart(spec);
      result.related = [{ href: '/packs/p2_halfway_calculator', label: 'Finish-time ranges by course' }]; break;
    }
    case 'r05_exceptional_vs_prior': {
      const rows = read('fade_type_exceptional.csv').filter(row => row.exceptional !== null);
      const modest = rows.find(row => row.exceptional === 'True' && row.fade_type === 'modest_fade');
      if (num(modest, 'pct_within_group') !== null) result.answer = `A modest fade was the most common pattern among finishes classified as exceptional: ${pct(Number(modest!.pct_within_group))}. A faster second half was not required.`;
      result.method = ['Compare pacing-pattern shares within the exported exceptional-performance group. The exact improvement threshold and pacing-class boundaries are not included in this export.', 'Records without an exceptional-performance classification are excluded. These associations do not prove that deliberately slowing produces a better performance.'];
      const spec = singleChart(rows.filter(row => row.exceptional === 'True'), 'fade_type', 'pct_within_group', 'Pacing patterns among exceptional performances', '%', 100); chart(spec); break;
    }
    case 'r06_decided_after_30k': {
      read('decided_after_30k.csv');
      result.answer = 'The current ranking summary needs verification before it can tell us how many places change after 30 km.';
      result.method = ['Reconstruct comparable positions at 30 km and the finish using the same runners and ranking scope. Clarify whether ranks use elapsed or gun time.', 'The current export reports positive average signed rank changes in every group. That requires checking the rank definition and denominators before presenting it as overtaking.']; break;
    }
    case 'r07_wall_clock_vs_distance': {
      const rows = read('htw_start_distance.csv');
      const clock = add('s6_wall_distance_vs_time', 'wall_distance_vs_clock.csv');
      const f = clock.find(row => row.sex === 'F'); const m = clock.find(row => row.sex === 'M');
      if (f && m) result.answer = `The wall begins around 30 km for both women and men in this snapshot, but the average elapsed time differs: ${formatNumber(Number(f.mean_htw_elapsed_min), 'min')} for women and ${formatNumber(Number(m.mean_htw_elapsed_min), 'min')} for men.`;
      result.method = ['The chart includes finishes with a detected wall episode. The distance marks the beginning of the first qualifying 5 km segment; it is not an exact point of onset.', 'Similar mean distances do not establish that distance is the better predictor. That requires comparing distance and time models within ability groups and testing them on unseen races.'];
      chart(sexChart(rows, 'htw_start_km', 'pct', 'Where detected wall episodes begin', '%', 100, [], row => `${row.htw_start_km}–${Number(row.htw_start_km) + 5} km`)); break;
    }
    case 'r08_early_blowup_signal': {
      const rows = read('early_blowup_signal.csv');
      result.answer = 'Early pace changes are associated with later slowing, but this table does not establish a reliable advance warning.';
      result.method = ['For each checkpoint and threshold, the export counts runners with a pace change above the threshold and reports their eventual wall rate.', 'The reference for the pace-change variable, a below-threshold comparison, sensitivity, and validation on unseen races are needed before this becomes a warning system.'];
      const spec = sexChart(rows, 'threshold', 'htw_rate', 'Wall rate among runners above a pace-change threshold', '%', 100, ['delta_col'], row => `${formatNumber(Number(row.threshold) * 100, '%')} or more`);
      spec.rows = spec.rows.map(row => ({ ...row, delta_col: String(row.delta_col).replace('delta pace ', '') + ' km' }));
      spec.filters = [{ key: 'delta_col', label: 'Checkpoint' }]; chart(spec); break;
    }
    case 'r09_bad_patch_recoverable': {
      const rows = read('bad_patch_recover.csv');
      const total = sum(rows, 'n'); const recovered = sum(rows.filter(row => row.recovered === 'True'), 'n');
      if (total) result.answer = `Recovery appears in ${pct(recovered / total)} of finishes included in the bad-patch table. Regaining pace does not necessarily mean finishing faster overall.`;
      result.method = ['Recovery rate is the count classified as recovered divided by all records in the bad-patch table. It is not a percentage of all marathon finishes.', 'The export does not document the qualifying bad-patch threshold. This describes recovery frequency; it does not yet identify who can recover or why.'];
      const recovery = ['F', 'M'].map(sex => { const group = rows.filter(row => row.sex === sex); const n = sum(group, 'n'); return { label: readableLabel(sex), value: n ? sum(group.filter(row => row.recovered === 'True'), 'n') / n * 100 : null, n_value: n }; });
      chart({ title: 'Share recovering from a recorded bad patch', unit: '%', xLabel: 'Gender', rows: recovery, series: [{ key: 'value', label: 'Recovered' }] }); break;
    }
    case 'r10_unravel_typology': {
      const rows = read('fade_type_x_htw.csv');
      const groups = [...new Set(rows.map(row => String(row.fade_type)))]; const total = sum(rows, 'n');
      result.answer = 'The results distinguish modest fading, major fading, even pacing, a faster second half, and recovery after a fade. The same finishing time can hide different patterns.';
      result.method = ['The chart adds the counts across genders and wall flags, then divides by all classified finishes.', 'Pattern labels are supplied by the analysis export. Their exact cutoffs need documentation. A major-fade label and the study’s sustained-wall definition are separate classifications.'];
      chart({ title: 'Pacing patterns across recorded finishes', unit: '%', xLabel: 'Pattern', series: [{ key: 'value', label: 'Share of finishes' }], rows: groups.map(group => { const n = sum(rows.filter(row => row.fade_type === group), 'n'); return { label: readableLabel(group), value: total ? n / total * 100 : null, n_value: n }; }) });
      result.related = [{ href: '/packs/rn1_wall_severity', label: 'Explore the severity of slowing' }]; break;
    }
    case 'r12_fastest_by_ability': {
      const rows = read('fastest_city_by_ability.csv');
      result.answer = 'The fastest recorded city varies by ability group. A trustworthy personal time conversion between courses is not available yet.';
      result.method = ['The export identifies the city with the lowest mean finish time in each published ability and gender group. This is a comparison of different fields, not the same runners on different courses.', 'The ability-band construction and minimum sample rules need confirmation. Course translation requires linked runners, race spacing, route versions, weather, and uncertainty intervals.'];
      const selected = rows.filter(row => num(row, 'ability_band') !== null);
      const spec = singleChart(selected, 'best_city', 'mean_finish', 'Lowest recorded mean finish within each ability group', 'finish');
      spec.rows = selected.map(row => ({ label: String(row.best_city), value: num(row, 'mean_finish'), n_value: num(row, 'n'), group: `${readableLabel(row.sex)} · ${formatNumber(Number(row.ability_band), 'finish')}–${formatNumber(Number(row.ability_band) + 30, 'finish')} ability band` }));
      spec.filters = [{ key: 'group', label: 'Comparison group', preferred: 'Women · 3:00–3:30 ability band' }];
      spec.note = 'Groups are supplied by the source. Implausibly fast ability bands need validation before interpretation.';
      chart(spec); break;
    }
    case 'r13_great_day_vs_consistency': {
      const rows = read('great_day_vs_consistency.csv');
      result.answer = 'Finish-time spreads vary across courses, but the current results cannot separate course reliability from differences in who enters.';
      result.method = ['Compare the 10th-percentile finish with the median within each city. The 10th percentile is the time at which 10% of the field has finished.', 'This gap is a spread within a field, not the probability of a personal best or a measure of an individual runner’s consistency across years. Field-adjusted comparisons are still needed.'];
      const spec = singleChart(rows, 'city', 'gap_median_minus_p10', 'Gap between the median and 10th-percentile finish', 'min');
      spec.rows = spec.rows.filter(row => ['Berlin', 'Boston', 'Chicago', 'London', 'New York', 'Tokyo', 'Sydney'].includes(String(row.label))); chart(spec); break;
    }
    case 'r14_knowing_course': {
      const rows = read('section_paces_race2_vs_race1.csv');
      result.answer = 'Second visits do not produce a uniform improvement. The change in section pace differs by course.';
      result.method = ['Compare the second recorded course performance with the first for linked runners. Convert the published mean pace change from minutes to seconds per kilometer.', 'Negative values mean the second performance was faster. A first observed appearance may not be a runner’s first visit. Weather, age, training, and experience elsewhere have not been isolated.'];
      const points = rows.flatMap(row => ['05', '10', '15', '20', '25', '30', '35', '40', '42'].map(segment => {
        const change = num(row, `delta_pace_${segment}`);
        return { city: row.city, label: segment === '42' ? 42.195 : Number(segment), value: change === null ? null : change * 60, n_value: num(row, 'n_pairs') };
      }));
      chart({ title: 'Change in pace on the second recorded visit', xLabel: 'Distance (km)', unit: 'sec/km', kind: 'line', xNumeric: true, rows: points, series: [{ key: 'value', label: 'Second minus first visit' }], filters: [{ key: 'city', label: 'Course', preferred: 'New York' }], note: 'Below zero means faster on the second visit.' }); break;
    }
    case 'r15_weather_penalty_who': {
      const rows = add('rn3_heat_curves', 'htw_severity_by_band_sex.csv').filter(row => ['M', 'F'].includes(String(row.sex)));
      const cool = weighted(rows.filter(row => row.weather_band === 'cool'), 'htw_rate');
      const warm = weighted(rows.filter(row => row.weather_band === 'warm'), 'htw_rate');
      if (cool !== null && warm !== null) result.answer = `Wall rates were ${pct(cool)} below 10°C and ${pct(warm)} at 15 to under 21°C. The hottest group did not have the highest wall rate.`;
      result.detail = 'These groups contain different races and runners. The pattern is not a personal heat penalty.';
      result.method = ['Use valid-split finishes with a resolved temperature: the exported temperature near 5 km, falling back to the race mean. Missing temperatures are excluded, not treated as zero.', 'The comparison is grouped by temperature and gender. Differences in course, year, ability, age, and duration remain. The hottest group is smaller and has a different mix of cities.'];
      chart(sexChart(rows, 'weather_band', 'htw_rate', 'Wall rate by recorded race temperature', '%', 100));
      result.published = readJson('packs/rn3_heat_curves/pack_meta.json')?.as_of || null;
      result.related = [{ href: '/packs/rn3_heat_curves', label: 'Weather coverage and findings' }]; break;
    }
    case 'r17_milestone_kick': {
      const rows = read('milestone_kick_hit.csv');
      result.answer = 'Larger finishing kicks are associated with higher goal-hit rates in the selected milestone groups. This does not establish that seeing a milestone caused the acceleration.';
      result.method = ['Compare the published finishing-kick quarters within each goal and gender. The largest-kick quarter is compared with the smallest.', 'The inclusion window and kick formula need fuller documentation. This table does not yet compare similarly positioned runners near round and non-round targets.'];
      const spec = sexChart(rows, 'kick_bin', 'hit_rate', 'Goal-hit rate by finishing-kick group', '%', 100, ['goal']);
      spec.filters = [{ key: 'goal', label: 'Finish target', preferred: 'Under 3 hours' }]; chart(spec);
      result.related = [{ href: '/packs/rn4_reference_dependence', label: 'Finishing just before a round-number time' }]; break;
    }
    case 'r19_near_miss_return': {
      const rows = read('near_miss_return.csv');
      const rates = rows.map(row => num(row, 'return_rate')).filter((n): n is number => n !== null);
      if (rates.length) result.answer = `Across the target groups, ${pct(Math.min(...rates))} to ${pct(Math.max(...rates))} of recorded near misses were followed by another recorded marathon within a year. The comparison with runners who narrowly succeeded is still missing.`;
      result.method = ['The numerator is a subsequent appearance within one year; the denominator is the exported near-miss group. Near-miss window boundaries are not documented here.', 'An absence from this database does not mean someone stopped running. A fair comparison also needs narrowly successful runners and equal follow-up time, excluding incomplete recent windows.'];
      const spec = singleChart(rows, 'near_miss', 'return_rate', 'Another recorded marathon within one year', '%', 100);
      spec.rows = spec.rows.map(row => ({ ...row, label: String(row.label).replace('near miss sub330', 'Near miss: 3:30').replace('near miss sub3', 'Near miss: 3 hours').replace('near miss sub4', 'Near miss: 4 hours') })); chart(spec); break;
    }
    case 'r20_pacing_personalities': {
      const rows = read('pacing_personality_corr.csv');
      const r = rows.find(row => row.metric === 'positive_split');
      if (r) result.answer = `Pacing habits show some persistence: the correlation in second-half slowing across consecutive races is ${formatNumber(Number(r.corr_consecutive), 'correlation')}, across ${count(Number(r.n_pairs))} race pairs.`;
      result.method = ['Use the published correlation between the same metric in consecutive recorded performances. A correlation of zero means no linear relationship; one means perfect positive alignment.', 'Persistence does not identify a fixed personality. Course choice, training, age, and conditions can also carry across performances.'];
      const spec = singleChart(rows, 'metric', 'corr_consecutive', 'Similarity between consecutive performances', 'correlation');
      spec.rows = spec.rows.map(row => ({ ...row, label: row.label === 'positive split' ? 'Second-half slowing' : 'Recorded banking ratio' })); chart(spec); break;
    }
    case 'r21_learn_from_blowup': {
      const rows = read('learn_after_blowup.csv');
      result.answer = 'A previous major slowdown is associated with a higher wall rate in the next recorded race. These results do not show whether runners changed their opening strategy.';
      result.method = ['Compare the subsequent wall rates of runners with and without the exported prior-blowup flag, within gender groups.', 'This is an association between consecutive outcomes. Testing learning requires comparing changes in opening pace while accounting for ability, course, weather, and which runners return.'];
      chart(sexChart(rows, 'prior_blowup', 'htw_rate', 'Wall rate in the next recorded marathon', '%', 100, [], row => row.prior_blowup === 'True' ? 'Previous major slowdown' : 'No previous major slowdown')); break;
    }
    case 'r22_aging_changes': {
      const rows = read('age_speed_endurance.csv').filter(row => row.age_group !== null);
      result.answer = 'Older age groups generally have slower opening paces. This table compares different people, so it cannot yet show what changes first as an individual ages.';
      result.method = ['Compare first-half pace and second-half slowing by reported age group and gender. Records without an age group are omitted.', 'Following the same runners across age groups is required to separate aging from cohort composition, experience, and the selection of runners who keep racing.'];
      chart(sexChart(rows, 'age_group', 'mean_positive_split', 'Average second-half slowing relative to the first half', '%', 100)); break;
    }
    case 'r23_gender_pacing': {
      const rows = read('gender_open_vs_sustain.csv');
      const f = rows.find(row => row.sex === 'F'); const m = rows.find(row => row.sex === 'M');
      if (f && m) result.answer = `The second half was ${pct(Number(f.mean_positive_split))} slower for women and ${pct(Number(m.mean_positive_split))} slower for men, on average. These are unadjusted comparisons.`;
      result.method = ['Positive split is the ratio of second-half to first-half pace, minus one. Group means come directly from the exported table.', 'These runners have not been matched on age, prior performance, experience, or course. The result does not establish whether opening aggression explains the difference.'];
      chart(singleChart(rows, 'sex', 'mean_positive_split', 'Average second-half slowing', '%', 100)); break;
    }
    case 'r24_interval_after_pb': {
      read('interval_after_pb_vs_collapse.csv');
      result.answer = 'The current table cannot tell us how time between marathons changes the next performance.';
      result.method = ['The export contains only a pooled post-collapse summary. It does not separate recovery intervals or include the personal-best comparison.', 'This question needs linked races grouped by the interval between starts and the preceding outcome, with comparable observation windows.']; break;
    }
    case 'r25_huge_kick_next': {
      const rows = read('huge_kick_next.csv'); const top = rows.find(row => row.group === 'top_decile_kick'); const rest = rows.find(row => row.group === 'rest');
      if (top && rest) result.answer = `Among runners with a subsequent result, the largest finishing-kick group ran their next marathon ${formatNumber(Math.abs(Number(top.mean_next_finish_delta)), 'min')} faster on average. Other runners were ${formatNumber(Number(rest.mean_next_finish_delta), 'min')} slower.`;
      result.method = ['Compare the largest 10% of recorded finishing kicks with the remainder. The finish-time change uses only runners with a subsequent observed result.', 'Chart sample sizes use n_with_next, not all runners in each kick group. Course, interval, training, and selection into another observed race can explain some of the difference.'];
      const spec = singleChart(rows, 'group', 'mean_next_finish_delta', 'Next finish time minus current finish time', 'min');
      spec.rows = rows.map(row => ({ label: readableLabel(row.group), value: num(row, 'mean_next_finish_delta'), n_value: num(row, 'n_with_next') }));
      spec.note = 'Negative values mean the next marathon was faster.'; chart(spec); break;
    }
    case 's3_course_breaks': {
      const rows = read('course_section_elev_vs_pace.csv');
      result.answer = 'We can show how average pace changes along each recorded course. A map of where individual wall episodes begin is not available yet.';
      result.method = ['The chart uses mean segment pace from the available course-and-split joins. Courses without an elevation join are omitted from this table.', 'The exported wall rate repeats the overall city rate across segments; it must not be plotted as a segment-specific risk. A true wall map needs counts of new episodes beginning within each segment and the runners still at risk.', 'Course geometry and elevation need the correct historical route version, especially where bridges or start routes differ.'];
      const spec: ChartSpec = { title: 'Average pace through the course', unit: 'min/km', xLabel: 'Distance (km)', kind: 'line', xNumeric: true, series: [{ key: 'value', label: 'Average segment pace' }], rows: rows.map(row => ({ label: row.seg_to_km, value: num(row, 'mean_pace'), city: row.city, n_value: num(row, 'n') })), filters: [{ key: 'city', label: 'Course', preferred: 'New York' }] };
      chart(spec); break;
    }
    case 's10_goal_slips': {
      const rows = read('goal_slips_vs_hit.csv');
      result.answer = 'Runners who missed a goal after being on pace slowed more in the second half. The current table does not locate the moment the goal slipped away.';
      result.method = ['Compare the exported hit and slipped outcome groups for each target and gender. Mean positive split measures second-half pace relative to first-half pace.', 'Slowing contributes directly to missing a goal, so this comparison cannot establish a psychological response to losing it. That needs checkpoint-by-checkpoint goal feasibility and subsequent pace changes.'];
      const spec = sexChart(rows, 'outcome', 'mean_positive_split', 'Second-half slowing by goal outcome', '%', 100, ['goal']);
      spec.filters = [{ key: 'goal', label: 'Finish target', preferred: 'Under 3 hours' }]; chart(spec); break;
    }
  }
  result.available = result.charts.length > 0;
  if (!result.available && !result.sources.length && !pending[pack]) result.answer = 'An answer is not available in the current results.';
  return result;
}

export function getQuestions() { return QUESTIONS.map(getResearchAnswer); }

export function getExtraAnswer(id: string): ResearchAnswer {
  if (id === 'smyth_htw') return getStudyAnswer();
  const canonical = questionForPack(id);
  if (canonical) return getResearchAnswer(canonical);
  const meta = readJson(`packs/${id}/pack_meta.json`);
  const result: ResearchAnswer = { id, title: EXTRA_TITLES[id] || 'Research analysis', aliases: [], answer: 'An answer is not available in the current results.', method: [], charts: [], sources: [], published: meta?.as_of || null, available: false };
  const add = (file: string) => { const rows = table(id, file); if (rows.length) result.sources.push({ href: `${basePath}/data/packs/${id}/tables/${file}`, label: 'Chart data (CSV)' }); return rows; };
  if (id === 'rn3_heat_curves') {
    const q = getResearchAnswer(QUESTIONS[14]); return { ...q, id, number: undefined, title: EXTRA_TITLES[id], aliases: [] };
  }
  if (id === 'rn1_wall_severity') {
    const rows = add('severity_band_counts.csv');
    result.answer = 'Most recorded finishes have an average positive late-race slowdown below 10%. A small share average 40% or more.';
    result.method = ['For each finish, take segment slowing relative to the 5–20 km reference pace, floor negative values at zero, and average the second-half values weighted by distance.', 'These severity bands describe the average slowdown. They are separate from the wall definition, which requires a sustained threshold breach. The lowest band is not necessarily zero slowdown.'];
    const spec = singleChart(rows, 'severity_band', 'pct', 'Distribution of average positive late-race slowing', '%');
    // The source uses "mild" for a severity band, not a weather band.
    spec.rows = rows.map(row => ({ label: ({ none: 'Below 10%', mild: '10 to <25%', moderate: '25 to <40%', severe: '40% or more' } as Record<string,string>)[String(row.severity_band)], value: num(row, 'pct'), n_value: num(row, 'n') })); result.charts = [spec];
  } else if (id === 'rn4_reference_dependence') {
    const rows = add('cliff_ratios_primary.csv').filter(row => row.sex === 'ALL' && ['sub3','sub330','sub4'].includes(String(row.target_label)));
    result.answer = 'More runners finish in the minute just before three, three-and-a-half, and four hours than in the minute just after.';
    result.method = ['Count finishers in the one-minute windows immediately before and after each threshold. Each pair is a separate comparison.', 'This is evidence of bunching around time landmarks. Finishing times alone do not reveal a runner’s declared target or establish the psychological mechanism.'];
    result.charts = [{ title: 'Finishers immediately before and after a milestone', unit: 'runners', xLabel: 'Milestone', series: [{ key: 'before', label: 'Minute before' }, { key: 'after', label: 'Minute after' }], rows: rows.map(row => ({ label: readableLabel(row.target_label), before: num(row, 'n_before'), after: num(row, 'n_after') })) }];
  } else if (id === 'p4_even_effort_gap') {
    const rows = add('positive_vs_gap_split_overall.csv');
    if (rows[0] && num(rows[0], 'mean_positive_split') !== null && num(rows[0], 'mean_live_gap_positive_split') !== null) result.answer = `Average second-half slowing changes from ${pct(Number(rows[0].mean_positive_split))} to ${pct(Number(rows[0].mean_live_gap_positive_split))} after the export’s course adjustment. This is a model comparison, not a measured causal effect of hills.`;
    result.method = ['The model adjusts segment pace using grade, distance into the race, and a post-20 km term. It therefore includes more than elevation alone.', 'The adjusted and observed summaries have slightly different coverage. The adjustment may absorb late-race fatigue; its difference must not be described as time caused by hills.'];
    result.charts = [{ title: 'Average second-half slowing before and after adjustment', unit: '%', xLabel: 'Measure', series: [{ key: 'value', label: 'Second-half slowing' }], rows: rows.flatMap(row => [{ label: 'Observed', value: Number(row.mean_positive_split) * 100, n_value: num(row, 'n_positive_split') }, { label: 'Model adjusted', value: Number(row.mean_live_gap_positive_split) * 100, n_value: num(row, 'n_live_gap_positive_split') }]) }];
  } else if (id === 'p1_pace_band_planner') {
    add('pace_band_by_ability_sex.csv');
    result.answer = 'The current export provides ranges of pacing used by comparable finishers. It does not establish an optimal pacing prescription.';
    result.method = ['Published groups use 30-minute ability bands and gender, with course-specific groups where available. Bands can fall back from ability to recent best and then current finish time.', 'Groups based on current finish time are retrospective and cannot be used as an independent pre-race ability estimate. Weather is missing from this pacing export.', 'Use the empirical ranges as descriptions of peers, with at least 30 observations per published group.'];
  } else if (id === 'p2_halfway_calculator') {
    const rows = add('example_halfway_to_finish_quantiles.csv');
    result.answer = 'The current export provides finish-time ranges conditional on 20 km times for courses with sufficient data. Twenty kilometers is not quite halfway.';
    result.method = ['Course-specific bins summarize finish-time percentiles using early cumulative time. Bins with fewer than 50 observations are omitted.', 'Tokyo has sparse coverage. Athens, Honolulu, and Mexico City lack the cumulative 20 km splits used by this lookup. An unconditional course range is not a checkpoint prediction.'];
    if (rows.length) result.detail = 'The published example table is available below; a validated interactive calculator is not implemented here.';
    result.sources.push({ href: `${basePath}/data/packs/${id}/data/index.json`, label: 'Course coverage and lookup data' });
  } else if (id === 'p3_race_week_weather') {
    add('forecast_coverage.csv');
    result.answer = 'Race-morning forecasts are not available in the current snapshot for the tracked races.';
    result.method = ['The export marks race-morning temperature as missing for Berlin, Chicago, and New York. Partial lead-up weather must not be presented as race-day conditions.', 'These are saved forecast results, not a live forecast request. Check the publication date and forecast coverage before use.'];
  }
  result.available = result.charts.some(spec => spec.rows.length > 0) || result.sources.length > 0;
  return result;
}
