const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const zlib = require('node:zlib');
const Module = require('node:module');
const ts = require('typescript');
for (const extension of ['.ts', '.tsx']) require.extensions[extension] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true, jsx: ts.JsxEmit.ReactJSX },
}).outputText, filename);
const resolveFilename = Module._resolveFilename;
Module._resolveFilename = function (request, ...args) {
  return resolveFilename.call(this, request.startsWith('@/') ? path.join(__dirname, '..', request.slice(2)) : request, ...args);
};
const {
  RUNNER_RELEASE, RUNNER_POINTS, RUNNER_PAGE_SIZE, normalizeRunnerName, runnerNameMatches,
  runnerShardKey, validateRunnerManifest, loadRunnerManifest, searchRunnerNames, loadRunnerProfile,
  validateRunnerProfile, runnerMetrics, runnerDuration, runnerProgression, runnerSearchPage,
} = require('../lib/runner-search.ts');
const { SelectedAnalysis } = require('../components/RunnerSearch.tsx');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const close = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-9, `${actual} != ${expected}`);
const manifest = {
  schema_version: 1, release_tag: RUNNER_RELEASE, input_as_of: '2026-09-11T15:10:45Z', as_of: '2026-09-11T16:00:00Z',
  raw_records: 100, named_records: 99, profiles: 80, points_km: RUNNER_POINTS,
  editions: [{ city: 'London', year: 2020, race: 'London Marathon' }, { city: 'Boston', year: 2020, race: 'Boston Marathon' }, { city: 'Berlin', year: 2021, race: 'Berlin Marathon' }],
  shards: {},
};
const race = (id, edition, pace = 300, extra = {}) => ({
  id, edition, name: 'José Smith', sex: null, age: null, times: RUNNER_POINTS.map(km => km * pace),
  eligible: true, reason: null, ...extra,
});

async function main() {
  assert.equal(normalizeRunnerName('  JOSÉ,   O’Neíl—陳  '), 'jose o neil 陳');
  assert.equal(normalizeRunnerName('ＡＮＡ  İpek'), 'ana ipek');
  assert.equal(normalizeRunnerName('𠮷野家'), '𠮷野家');
  assert.equal(runnerNameMatches('Smith, José', 'jos smi'), true, 'Name order and accent differences should not hide a match');
  assert.equal(runnerNameMatches('Smith, José', 'jos bro'), false, 'Every query token must match');
  assert.equal(runnerNameMatches('William Smith', 'li smi'), false, 'Short tokens match whole words, not interior text or prefixes');
  assert.equal(runnerNameMatches('Liam Smith', 'li'), false);
  assert.equal(runnerNameMatches('Li Smith', 'li smi'), true);
  assert.equal(runnerNameMatches('José Smith', '***'), false);
  assert.equal(await runnerShardKey('𠮷野家'), crypto.createHash('sha256').update('𠮷野家').digest('hex').slice(0, 3));
  assert.equal(validateRunnerManifest(manifest).release_tag, RUNNER_RELEASE);
  assert.throws(() => validateRunnerManifest({ ...manifest, release_tag: 'private-export-20260911-0336' }), /verified/);
  assert.throws(() => validateRunnerManifest({ ...manifest, points_km: [...RUNNER_POINTS.slice(0, 8), 42.2] }), /verified/, 'Never silently change marathon length');
  assert.throws(() => validateRunnerManifest({ ...manifest, shards: { '../other.json.gz': { bytes: 1, sha256: '0'.repeat(64) } } }), /verified/, 'Manifest paths must stay inside the published runner assets');

  const base = race(1, 0), changed = race(2, 1, 280), later = race(3, 2, 270);
  const metrics = runnerMetrics(base);
  close(metrics.finish, 12658.5); close(metrics.pace, 300); close(metrics.baseline, 300); close(metrics.latePace, 300); close(metrics.lateChange, 0); close(metrics.openingChange, 0);
  close(metrics.sections[8].elapsed, 658.5); close(metrics.sections[8].end - metrics.sections[8].start, 2.195);
  assert.ok(runnerMetrics({ ...base, times: [...base.times.slice(0, 8), base.times[7] + 2.195 * 120] }), 'A permitted boundary pace must survive floating-point distance subtraction');
  const slowing = race(4, 1, 300, { times: RUNNER_POINTS.map(km => km * 300 + Math.max(0, km - 30) * 60) });
  close(runnerMetrics(slowing).lateChange, 20);
  const missing = race(5, 0, 200, { eligible: false, reason: 'Missing source checkpoint', times: [null, ...base.times.slice(1)] });
  const held = race(6, 0, 200, { eligible: false, reason: 'Incomplete edition held for review' });
  assert.equal(runnerMetrics(missing), null); assert.equal(runnerMetrics(held), null, 'Plausible fast times in an excluded edition must not become a best');
  assert.equal(runnerMetrics({ ...base, times: base.times.map((time, i) => i === 1 ? base.times[0] : time) }), null);
  assert.equal(runnerProgression([held, missing], manifest), null);
  assert.equal(runnerProgression([base, changed], manifest).yearChange, null, 'Two same-year races do not establish before/after chronology');
  const progression = runnerProgression([later, held, changed, base], manifest);
  assert.equal(progression.valid.length, 3); assert.equal(progression.best.race.id, later.id);
  close(progression.yearChange, changed.times[8] - later.times[8]);
  assert.equal(progression.earliestYear, 2020); assert.equal(progression.latestYear, 2021);
  assert.equal(runnerDuration(59.9996), '0:01:00');
  assert.equal(runnerDuration(12658.5), '3:30:58.5');
  assert.equal(runnerDuration(12658.501), '3:30:58.501');
  assert.equal(runnerDuration(null), 'Not recorded');
  const profile = { id: 7, names: ['José Smith'], races: [base, missing, held] };
  assert.equal(validateRunnerProfile(profile, manifest).races.length, 3);
  assert.equal(validateRunnerProfile({ ...profile, races: [{ ...base, age: 1923 }] }, manifest).races[0].age, 1923, 'Retain a suspect recorded age without inventing a correction');
  assert.throws(() => validateRunnerProfile({ ...profile, races: [base, base] }, manifest), /verified/);
  assert.throws(() => validateRunnerProfile({ ...profile, races: [{ ...base, times: [null, ...base.times.slice(1)] }] }, manifest), /verified/);

  const render = (races, units) => renderToStaticMarkup(React.createElement(SelectedAnalysis, { races, manifest, units }));
  const sameYearHtml = render([base, changed], 'mi');
  assert.doesNotMatch(sameYearHtml, /Your fastest selected finish in/);
  const smallGain = { ...base, id: 9, edition: 2, times: [...base.times.slice(0, 8), base.times[8] - 0.2] };
  assert.match(render([base, smallGain], 'mi'), /0:00:00\.2 faster than/, 'A measurable fractional-second change must not be called the same time');
  const mileHtml = render([base, held], 'mi');
  assert.match(mileHtml, /8:03\/mi/); assert.match(mileHtml, /3:30:58\.5/); assert.match(mileHtml, /the same pace as your early pace/);
  assert.match(mileHtml, /1 selected record is excluded/); assert.doesNotMatch(mileHtml, /the same pace than/);
  assert.match(mileHtml, /26\.22 mi/); assert.doesNotMatch(mileHtml, /5:00\/km/);
  const kmHtml = render([base], 'km'); assert.match(kmHtml, /5:00\/km/); assert.match(kmHtml, /42\.195 km/);
  assert.match(render([held, missing], 'mi'), /cannot support a pacing analysis/);

  const originalFetch = global.fetch;
  const requests = [];
  let served;
  global.fetch = async url => { requests.push(String(url)); return new Response(served, { status: 200 }); };
  const descriptor = value => {
    const bytes = zlib.gzipSync(Buffer.from(JSON.stringify(value)));
    return { bytes, meta: { bytes: bytes.length, sha256: crypto.createHash('sha256').update(bytes).digest('hex') } };
  };
  const sourceFor = (path, data) => ({ ...manifest, shards: { [path]: data.meta } });
  const signal = new AbortController().signal;
  try {
    served = JSON.stringify(manifest);
    assert.equal((await loadRunnerManifest()).release_tag, RUNNER_RELEASE);
    assert.ok(requests.at(-1).endsWith('/manifest.json?v=' + RUNNER_RELEASE), 'Request the pin explicitly rather than using an unversioned old manifest');
    served = JSON.stringify({ ...manifest, release_tag: 'old' });
    await assert.rejects(() => loadRunnerManifest(), /verified/);

    const rows = Array.from({ length: 79 }, (_, i) => [`José Smith ${i}`, i + 1, 1, 2020, 2020, 'London']);
    rows.push(['JOSE SMITH 0', 1, 1, 2020, 2020, 'London']);
    rows.push(['José Brown', 1000, 1, 2020, 2020, 'London']);
    const index = descriptor({ release_tag: RUNNER_RELEASE, rows });
    const indexPath = `index/${await runnerShardKey('jos')}.json.gz`;
    served = index.bytes;
    const matches = await searchRunnerNames('jos smi', sourceFor(indexPath, index), signal);
    assert.equal(matches.length, 79, 'Deduplicate aliases by candidate group, while retaining every matching group');
    assert.equal(new Set(matches.map(row => row[1])).size, 79);
    assert.ok(requests.at(-1).endsWith(indexPath + '?v=' + index.meta.sha256), 'Shard URL must use its exact content digest');
    const pages = Array.from({ length: Math.ceil(matches.length / RUNNER_PAGE_SIZE) }, (_, page) => runnerSearchPage(matches, page));
    assert.deepEqual(pages.map(page => page.length), [25, 25, 25, 4]);
    assert.deepEqual(pages.flat(), matches, 'The last match must remain reachable through pagination');
    assert.deepEqual(runnerSearchPage(matches, -1), []);
    const beforeEmpty = requests.length;
    assert.deepEqual(await searchRunnerNames('zzzzzz', manifest, signal), []);
    assert.equal(requests.length, beforeEmpty, 'An absent manifest bucket is a verified empty prefix');

    const wrongTag = descriptor({ release_tag: 'old', rows }); served = wrongTag.bytes;
    await assert.rejects(() => searchRunnerNames('jos', sourceFor(indexPath, wrongTag), signal), /verified/);
    const badHash = { ...index, meta: { ...index.meta, sha256: '0'.repeat(64) } }; served = index.bytes;
    await assert.rejects(() => searchRunnerNames('jos', sourceFor(indexPath, badHash), signal), /verified/);
    served = Buffer.concat([index.bytes, Buffer.from('x')]);
    await assert.rejects(() => searchRunnerNames('jos', sourceFor(indexPath, { meta: { ...index.meta, sha256: '1'.repeat(64) } }), signal), /verified/);
    const corrupted = descriptor({ release_tag: RUNNER_RELEASE, rows: [['Name', 'wrong id']] }); served = corrupted.bytes;
    await assert.rejects(() => searchRunnerNames('jos', sourceFor(indexPath, corrupted), signal), /verified/);

    const profilePath = `profiles/${await runnerShardKey(String(profile.id))}.json.gz`;
    const storedProfile = descriptor({ release_tag: RUNNER_RELEASE, profiles: [profile] }); served = storedProfile.bytes;
    assert.deepEqual(await loadRunnerProfile(profile.id, sourceFor(profilePath, storedProfile), signal), profile);
    const staleProfile = descriptor({ release_tag: 'old', profiles: [profile] }); served = staleProfile.bytes;
    await assert.rejects(() => loadRunnerProfile(profile.id, sourceFor(profilePath, staleProfile), signal), /verified/);
    const duplicateProfile = descriptor({ release_tag: RUNNER_RELEASE, profiles: [profile, profile] }); served = duplicateProfile.bytes;
    await assert.rejects(() => loadRunnerProfile(profile.id, sourceFor(profilePath, duplicateProfile), signal), /verified/);
  } finally { global.fetch = originalFetch; }
  console.log('Runner search checks passed: Unicode/token matching, complete pagination, explicit eligibility, year-only progression, mi/km readings and verified versioned gzip loading.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
