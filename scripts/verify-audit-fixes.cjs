const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const { isDeepStrictEqual } = require('node:util');
const ts = require('typescript');
process.chdir(path.resolve(__dirname, '..'));
require.extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
}).outputText, filename);
const { prepareGuide } = require('./prepare-guide.cjs');
const summary = prepareGuide();
const auditedSnapshot = summary.export_id === 'private-20260907-1318';
const { buildGuide, checkpointResult, defaultProfile, percentUnder, targetBucket } = require('../lib/personalized.ts');
const { readProfile, profileSearch, effectiveProfile } = require('../lib/guide-profile.ts');
const { formatNumber } = require('../lib/csv.ts');
const { getQuestions, liveRows } = require('../lib/research-data.ts');
const { getStudyFigures } = require('../lib/study-figures.ts');
const source = 'public/data/packs/ext_personalized_guide/tables/';
function read(file) { return JSON.parse(fs.readFileSync(file, 'utf8')); }
function view(file) {
  const bytes = fs.readFileSync('public/data/guide/' + file);
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex') + '.json', file);
  return JSON.parse(bytes);
}

assert.equal(formatNumber(-0.001, 'min'), '0.0 min');
assert.equal(formatNumber(-0, '%'), '0%');
const parsed = readProfile('?race=boston&age=30-34&goal=999&previous=90', summary);
assert.equal(parsed.profile.city, 'Boston'); assert.equal(parsed.profile.age, '30–34');
assert.equal(parsed.profile.goal, 180); assert.equal(parsed.profile.previous, null); assert.equal(parsed.corrected, true);
assert.deepEqual(readProfile('?' + profileSearch(parsed.profile), summary).profile, parsed.profile);
assert.equal(readProfile('?race=NYC&previous=190', summary).profile.city, 'New York');
const london = summary.cities.find(c => c.city === 'London'), berlin = summary.cities.find(c => c.city === 'Berlin');
if (auditedSnapshot) {
  assert.equal(london.ages.length, 0); assert.ok(berlin.ages.includes('30–34'));
  assert.equal(effectiveProfile({ ...defaultProfile, city: 'London', age: '30–34' }, summary).age, 'all');
  assert.ok(summary.cities.find(c => c.city === 'Tokyo').limited);
  assert.equal(effectiveProfile({ ...defaultProfile, city: 'Hamburg', gender: 'Women' }, summary).gender, 'all');
}

let equivalentProfiles = 0;
for (const city of summary.cities) {
  const full = read(source + city.file), index = view(city.near_index);
  assert.equal(index.city, city.city);
  for (const goal of [150, 180, 187, 270]) {
    const small = view(city.profile_files[targetBucket(goal)]), near = view(index.files[goal]);
    assert.equal(near.target, goal); assert.equal(near.city, city.city);
    const assembled = { ...small, cohorts: Object.fromEntries(Object.entries(small.cohorts).map(([key, c]) => [key, { ...c, near: near.near[key] || [] }])) };
    for (const filter of [{ age: 'all', gender: 'all', previous: null }, { age: '30–34', gender: 'Men', previous: 190 }]) {
      const profile = { ...defaultProfile, city: city.city, goal, ...filter };
      const actual = buildGuide(assembled, summary, profile), expected = buildGuide(full, summary, profile);
      actual.forEach((answer, i) => assert.ok(isDeepStrictEqual(answer, expected[i]), `${city.city} ${goal} ${answer.id}: transport must preserve the full answer, chart and sample`));
      equivalentProfiles++;
    }
  }
}

const ny = summary.cities.find(c => c.city === 'New York');
const checkpointIndex = view(ny.checkpoint_index);
const checkpoint = { city: ny.city, rows: [126, 128, 130].flatMap(band => view(checkpointIndex.files[`30:${band}`]).rows) };
const profile = { ...defaultProfile, age: '30–34', gender: 'Men', previous: 190 };
const before = checkpointResult(checkpoint, profile, 30, 127 * 60 + 59, null);
const after = checkpointResult(checkpoint, profile, 30, 128 * 60, null);
if (auditedSnapshot) { assert.equal(before.row.n, 591); assert.equal(after.row.n, 455); }
assert.ok(before.adjacent.some(row => row.elapsed === 128));
assert.ok(after.adjacent.some(row => row.elapsed === 126));
if (auditedSnapshot) {
  assert.equal(Math.round(percentUnder(before.row, 180)), 33);
  assert.ok(Math.abs(percentUnder(after.row, 180) - 4.2) < .1);
}
const originalCheckpoint = read(source + ny.checkpoint_file);
assert.deepEqual(after, checkpointResult(originalCheckpoint, profile, 30, 128 * 60, null));

const questions = getQuestions(), yearly = questions.find(q => q.id === 'r26_pacing_over_20y');
if (yearly.dataset.exportId === 'private-20260907-1318') for (const chart of yearly.charts) for (const [city, year] of [['New York', 2016], ['Berlin', 2023], ['Amsterdam', 2020]]) {
  assert.ok(chart.partialRows.some(row => row.city === city && row.label === year));
  const row = chart.rows.find(row => row.city === city && row.label === year);
  assert.ok(chart.series.every(series => row[series.key] === null), 'Flagged years must break the line');
}
assert.match(questions.find(q => q.id === 'r06_decided_after_30k').method.join(' '), /otherwise eligible finishes/);
const figure = getStudyFigures().find(f => f.id === 'fig2');
assert.match(figure.charts[0].title, /repeaters/);
const first = figure.charts[0].rows.find(row => row.label === '20-39');
assert.ok(Object.keys(first).some(key => key.startsWith('n_') && first[key] === liveRows('t4').find(r => r.sex === 'M' && r.age_group === '20-39').n));
console.log(`Verified ${equivalentProfiles} complete-vs-smaller guide profiles, content hashes, URL normalization, coverage controls, checkpoint neighbors, negative-zero formatting, yearly screens, and HTW cohort counts.`);
