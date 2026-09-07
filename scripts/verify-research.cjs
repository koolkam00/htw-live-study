const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const ts = require('typescript');

process.chdir(path.resolve(__dirname, '..'));
require.extensions['.ts'] = (module, filename) => module._compile(
  ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
  }).outputText, filename,
);

const { parseCsv, finite, formatNumber } = require('../lib/csv.ts');
const { getQuestions, getStudyAnswer, getExtraAnswer, getWallTimingAnswer, getCoursePacingChart, liveRows, getLive, table } = require('../lib/research-data.ts');
const { getStudyFigures } = require('../lib/study-figures.ts');
const { EXTRA_TITLES, QUESTIONS, THEMES } = require('../lib/question-catalog.ts');
const { PACKS } = require('../lib/packs.ts');

assert.deepEqual(parseCsv('name,n,note\r\n"New York, NY",,"A ""quote""\nand a line"\r\nBoston,0,NaN\r\nnone,1,none'), [
  { name: 'New York, NY', n: null, note: 'A "quote"\nand a line' },
  { name: 'Boston', n: 0, note: null },
  { name: 'none', n: 1, note: 'none' },
]);
for (const value of [null, undefined, '', ' ', 'NaN']) assert.equal(finite(value), null);
assert.equal(finite(0), 0);

const questions = getQuestions();
const extras = [...Object.keys(EXTRA_TITLES).map(getExtraAnswer), getWallTimingAnswer()];
const figures = getStudyFigures();
const ids = QUESTIONS.flatMap(question => [question.id, ...(question.aliases || [])]);
assert.equal(new Set(ids).size, ids.length, 'Question anchors must be unique');
for (const pack of PACKS) assert.ok(ids.includes(pack.id) || EXTRA_TITLES[pack.id], `${pack.id}: missing from the question catalog`);
for (const question of questions) assert.ok(THEMES.some(theme => theme.id === question.theme), `${question.id}: inaccessible research theme`);

// The course profile must integrate to zero over distance, including the short finish segment.
const profiles = getCoursePacingChart();
assert.ok(profiles.rows.length, 'Complete course profiles must be available');
for (const city of new Set(profiles.rows.map(row => row.city))) {
  let previous = 0, weightedChange = 0;
  for (const row of profiles.rows.filter(row => row.city === city)) {
    weightedChange += row.value * (row.label - previous); previous = row.label;
  }
  assert.equal(previous, 42.195, `${city}: incomplete full-course profile`);
  assert.ok(Math.abs(weightedChange) < 1e-8, `${city}: profile was not weighted by actual section distance`);
}

// P(exceptional | pattern) uses the eligible count within that pattern.
// Its weighted average must recover the overall exceptional rate.
const classification = table('r05_exceptional_vs_prior', 'fade_type_exceptional.csv').filter(row => ['True', 'False'].includes(row.exceptional));
const eligibleN = classification.reduce((sum, row) => sum + row.n, 0);
const exceptionalN = classification.filter(row => row.exceptional === 'True').reduce((sum, row) => sum + row.n, 0);
const patternRates = questions.find(question => question.id === 'r30_negative_split_success').charts[0].rows;
assert.equal(patternRates.reduce((sum, row) => sum + row.n_value, 0), eligibleN);
assert.ok(Math.abs(patternRates.reduce((sum, row) => sum + row.value / 100 * row.n_value, 0) - exceptionalN) < 1e-8);
const patternMix = questions.find(question => question.id === 'r31_multiple_good_strategies').charts[0].rows;
for (const group of ['exceptional', 'ordinary']) assert.ok(Math.abs(patternMix.reduce((sum, row) => sum + row[group], 0) - 100) < 1e-8);
for (const id of ['r32_where_pbs_are_gained', 'r33_start_congestion', 'r34_pacing_risk_reward', 'r35_course_adaptation']) {
  const question = questions.find(question => question.id === id);
  assert.equal(question.charts.length, 0, `${id}: uncomputed research must not have fabricated chart values`);
  assert.ok(question.nextAnalysis?.measure && question.nextAnalysis?.compare && question.nextAnalysis?.needs, `${id}: missing research specification`);
}

const live = getLive();
assert.ok(['ready', 'ok'].includes(live?.status), 'This check requires a published study snapshot');
const cities = liveRows('t1');
const total = cities.reduce((sum, row) => sum + row.n_records, 0);
assert.equal(total, live.corpus.n_records, 'Overall results must include every city record, including unknown ages');
const overallRate = cities.reduce((sum, row) => sum + row.n_records * row.pct_htw, 0) / total;
const sensitivity = live.figures.fig1.panels.find(panel => panel.title === `LoS ${live.definition.los_km} km`).series.find(series => series.sex === 'all');
const thresholdIndex = sensitivity.x.indexOf(live.definition.dos);
assert.ok(Math.abs(overallRate / 100 - sensitivity.y[thresholdIndex]) < 1e-8, 'City totals and threshold-sensitivity results disagree');
assert.ok(getStudyAnswer().answer.includes(formatNumber(overallRate, '%')));

const severity = table('rn1_wall_severity', 'severity_band_counts.csv');
assert.ok(severity.some(row => row.severity_band === 'none'), 'The none severity category is data, not a missing value');
assert.ok(Math.abs(severity.reduce((sum, row) => sum + row.pct, 0) - 100) < .01);

assert.equal(figures.length, Object.keys(live.figures).length, 'Every published study figure must be accessible');
for (const figure of figures) assert.equal(figure.charts.length, live.figures[figure.id].panels.length, `${figure.id}: a published comparison is missing`);
const charts = [...questions, ...extras].flatMap(question => question.charts).concat(figures.flatMap(figure => figure.charts));
for (const chart of charts) {
  assert.ok(chart.rows.length, `${chart.title}: empty chart`);
  for (const row of chart.rows) {
    assert.ok(row.label !== undefined && row.label !== null, `${chart.title}: missing label`);
    if (chart.xNumeric) assert.ok(Number.isFinite(row.label), `${chart.title}: invalid numeric distance/time`);
    for (const series of chart.series) {
      if (row[series.key] != null) assert.ok(Number.isFinite(row[series.key]), `${chart.title}: non-finite value`);
      const count = row[`n_${series.key}`];
      if (count != null) assert.ok(Number.isInteger(count) && count >= 0, `${chart.title}: invalid sample size`);
    }
  }
  const selections = Object.fromEntries((chart.filters || []).map(filter => {
    const options = [...new Set(chart.rows.map(row => String(row[filter.key] ?? '')))].filter(Boolean);
    return [filter.key, options.includes(filter.preferred) ? filter.preferred : options[0]];
  }));
  assert.ok(chart.rows.some(row => Object.entries(selections).every(([key, value]) => String(row[key]) === value)), `${chart.title}: empty initial selection`);
}
for (const question of [...questions, ...extras]) for (const source of question.sources) {
  const href = source.href.replace(process.env.NEXT_PUBLIC_BASE_PATH || /^$/, '');
  if (href.startsWith('/')) assert.ok(fs.existsSync(`public${href}`), `${source.href}: missing source file`);
}

console.log(`Verified ${questions.length} questions, ${charts.length} chart views, all original analysis routes, source files, CSV edge cases, and the ${total.toLocaleString('en-US')}-finish denominator.`);
