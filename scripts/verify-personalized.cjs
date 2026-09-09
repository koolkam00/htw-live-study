const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const ts = require('typescript');
process.chdir(path.resolve(__dirname, '..'));
require.extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
}).outputText, filename);

const { buildGuide, candidates, checkpointResult, chooseCohort, defaultProfile, parseMinutes, parseElapsed, parseSection, percentUnder, priorBand, targetBucket, finishBand } = require('../lib/personalized.ts');
const { PERSONAL_QUESTIONS, GOAL_PRESETS, AGE_OPTIONS } = require('../lib/personalized-catalog.ts');
const { getPersonalSummary } = require('../lib/personalized-data.ts');
const root = 'public/data/packs/ext_personalized_guide';
const summary = getPersonalSummary();
const meta = JSON.parse(fs.readFileSync(`${root}/pack_meta.json`, 'utf8'));
assert.equal(PERSONAL_QUESTIONS.length, 12);
assert.equal(new Set(PERSONAL_QUESTIONS.map(q => q.id)).size, 12);
assert.deepEqual(GOAL_PRESETS, [150, 165, 180, 195, 210, 225, 240, 255, 270]);
assert.ok(AGE_OPTIONS.includes('30–34') && AGE_OPTIONS.includes('85–89'));
assert.equal(parseMinutes('3:10'), 190);
assert.equal(parseMinutes('3:70'), null);
assert.equal(parseMinutes(''), null);
assert.equal(parseElapsed('2:08:59'), 7739);
assert.equal(parseSection('21:30'), 1290);
assert.equal(priorBand(190), '180');
assert.equal(priorBand(null), 'all');
assert.equal(targetBucket(177), 180);
assert.equal(finishBand(177), '2:52:30–3:07:30');
const fake = { n: 200, cdf: Array.from({ length: 121 }, (_, i) => i < 30 ? 0 : i === 30 ? 100 : 200) };
assert.equal(percentUnder(fake, 179), 0);
assert.equal(percentUnder(fake, 180), 50, 'The client must preserve the strict threshold from the calculation');
assert.equal(percentUnder(fake, 181), 100);

let cases = 0, plots = 0;
for (const file of Object.keys(meta.transport_shards_sha256)) {
  const bytes = fs.readFileSync(`${root}/tables/${file}`);
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'), meta.transport_shards_sha256[file]);
  assert.doesNotThrow(() => JSON.parse(bytes));
}
for (const city of ['New York', 'All courses', 'Tokyo', 'London']) {
  const source = summary.cities.find(c => c.city === city); assert.ok(source);
  const data = JSON.parse(fs.readFileSync(`${root}/tables/${source.file}`));
  for (const goal of [150, 177, 180, 270]) for (const previous of [null, 190]) for (const age of ['all', '30–34']) {
    const profile = { ...defaultProfile, city, age, goal, previous, gender: 'Men' };
    const answers = buildGuide(data, summary, profile);
    assert.equal(answers.length, 12);
    assert.equal(new Set(answers.map(a => a.id)).size, 12);
    for (const answer of answers) {
      assert.doesNotMatch(answer.answer + answer.detail, /NaN|undefined|Infinity/);
      assert.ok(answer.method.length > 40);
      if (answer.sample) assert.ok(answer.sample.n >= 100 && answer.sample.editions > 0);
      for (const chart of answer.charts) {
        plots++;
        assert.ok(chart.rows.length && chart.series.length);
        for (const row of chart.rows) for (const series of chart.series) {
          assert.ok(typeof row[series.key] === 'number' && Number.isFinite(row[series.key]), `${answer.id}: invalid chart value`);
          if (`n_${series.key}` in row) assert.ok(row[`n_${series.key}`] >= 100);
        }
        if (chart.sectionEnds) {
          assert.deepEqual(chart.rows.map(r => r.label), [5, 10, 15, 20, 25, 30, 35, 40, 42.195]);
          for (const series of chart.series) assert.equal(new Set(chart.rows.map(r => r[`n_${series.key}`])).size, 1);
        }
      }
    }
    const exactKey = `${age}|Men|${priorBand(previous)}`;
    if (data.cohorts[exactKey]) assert.equal(chooseCohort(data, profile, () => true), data.cohorts[exactKey], 'Use the requested cohort before widening');
    cases++;
  }
}
const cpRow = { ...fake, age: 'all', gender: 'Men', checkpoint: 30, elapsed: 128, trend: 'all', editions: 4, finish: [10700, 10800, 11000], retention: 0, late: 0, pace: [] };
const cp = { city: 'New York', rows: [cpRow] };
const p = { ...defaultProfile, age: '30–34', gender: 'Men', previous: 190 };
assert.equal(checkpointResult(cp, p, 30, 128 * 60, null).row, cpRow);
assert.equal(checkpointResult(cp, p, 30, 129 * 60 + 59, null).row, cpRow);
assert.equal(checkpointResult(cp, p, 30, 130 * 60, null), null, 'Elapsed bands have an exclusive upper boundary');
assert.match(checkpointResult(cp, p, 30, 129 * 60, null).widened, /age/);
assert.equal(checkpointResult(cp, p, 35, 129 * 60, null), null);

(async () => {
  const source = summary.cities.find(c => c.city === 'New York');
  const bytes = fs.readFileSync(`${root}/tables/${source.file}`);
  const browserDecoded = await new Response(bytes).json();
  assert.equal(browserDecoded.city, 'New York', 'The browser transport must decode the published files');
  console.log(`Verified 12 personalized questions across ${cases} profiles and ${plots} charts, exact/custom target boundaries, sparse-cohort fallbacks, checkpoint matching and readable JSON transport.`);
})().catch(error => { console.error(error); process.exitCode = 1; });
