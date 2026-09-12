const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const Module = require('node:module');
const { createHash } = require('node:crypto');
const { gzipSync } = require('node:zlib');
const ts = require('typescript');
for (const extension of ['.ts', '.tsx']) require.extensions[extension] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true, jsx: ts.JsxEmit.ReactJSX },
}).outputText, filename);
const resolveFilename = Module._resolveFilename;
Module._resolveFilename = function (request, ...args) {
  return resolveFilename.call(this, request.startsWith('@/') ? path.join(__dirname, '..', request.slice(2)) : request, ...args);
};

const contextFile = require.resolve('../lib/runner-context.ts');
const freshClient = () => { delete require.cache[contextFile]; return require(contextFile); };
const client = freshClient();
const { RUNNER_RELEASE, RUNNER_POINTS, loadRunnerManifest, runnerManifestDigest } = require('../lib/runner-search.ts');
const clone = value => structuredClone(value);
const close = (actual, expected, label) => assert.ok(Math.abs(actual - expected) < 1e-8, `${label}: expected ${expected}, received ${actual}`);
const tests = [];
const test = (name, run) => tests.push({ name, run });
const group = finish => ({ n: finish.reduce((sum, row) => sum + row[1], 0), finish, pace: {} });
const race = (changes = {}) => {
  const finish = changes.finish ?? 14400.125;
  const { finish: _, ...fields } = changes;
  return { id: 1, edition: 0, name: 'Fixture Runner', sex: 'F', age: 35, eligible: true, reason: null,
    times: RUNNER_POINTS.map(km => km === 42.195 ? finish : finish * km / 42.195), ...fields };
};
const pace = { n: 201, from_sec: 13950, to_sec: 14850, q25: Array(9).fill(330), median: Array(9).fill(340), q75: Array(9).fill(350), late_change: { q25: -2, median: 0, q75: 5 } };
const fullGroup = { ...group([[14400.125, 101], [14500, 100]]), pace: { '240': pace } };
const edition = { city: 'Example', year: 2020, race: 'Example Marathon' };
const runners = {
  schema_version: 1, release_tag: RUNNER_RELEASE, input_as_of: '2026-09-11T15:10:45Z', as_of: '2026-09-12T01:00:00Z',
  raw_records: 250, named_records: 250, profiles: 250, points_km: RUNNER_POINTS, shards: {}, editions: [edition],
};
const context = {
  schema_version: 1, release_tag: RUNNER_RELEASE, edition: { ...edition, index: 0 }, eligible_n: 201, age_n: 201, gender_n: 201,
  groups: { all: fullGroup, 'gender:Women': clone(fullGroup), 'age:35-39': clone(fullGroup), 'age_gender:35-39:Women': clone(fullGroup) },
  weather: null, weather_reason: 'No unambiguous scheduled start.', terrain: null, terrain_reason: 'No matched route.',
};

test('placement excludes the focus and gives exact ties half weight', () => {
  const data = group([[14000, 40], [14400.125, 21], [15000, 140]]);
  assert.deepEqual(client.finishPlacement(data, 14400.125), { n: 201, other_n: 200, rank: 41, ties: 20, percentile: 75, median_finish: 15000 });
  const allTied = client.finishPlacement(group([[14400, 101]]), 14400);
  assert.equal(allTied.percentile, 50); assert.equal(allTied.ties, 100); assert.equal(allTied.rank, 1);
});
test('fastest and slowest finishes have the correct percentile direction', () => {
  const data = group([[14000, 1], [14400, 99], [15000, 1]]);
  assert.equal(client.finishPlacement(data, 14000).percentile, 100);
  assert.equal(client.finishPlacement(data, 15000).percentile, 0);
  assert.equal(client.finishPlacement(data, 15000).rank, 101);
});
test('millisecond precision preserves adjacent finish times', () => {
  const data = group([[14400.125, 51], [14400.126, 50]]);
  const first = client.finishPlacement(data, 14400.125000000002);
  assert.equal(first.ties, 50); assert.equal(first.rank, 1); assert.equal(first.percentile, 75);
  const next = client.finishPlacement(data, 14400.126);
  assert.equal(next.ties, 49); assert.equal(next.rank, 52); assert.equal(next.percentile, 24.5);
  assert.equal(first.median_finish, 14400.125);
});
test('even field median interpolates the two central observations', () => {
  const data = group([[14000, 51], [15000, 51]]);
  assert.equal(client.finishPlacement(data, 14000).median_finish, 14500);
});
test('small groups and absent exact timings provide no placement', () => {
  assert.equal(client.finishPlacement(group([[14400, 100]]), 14400), null);
  assert.equal(client.finishPlacement(group([[14400, 101]]), 14400.001), null);
  assert.equal(client.finishPlacement(group([[14400, 101]]), 14399.999), null);
});
test('exact age bands include both edges and reject inferred ages', () => {
  for (const [age, expected] of [[18, '18-24'], [24, '18-24'], [25, '25-29'], [29, '25-29'], [30, '30-34'], [34, '30-34'], [35, '35-39'], [84, '80-84'], [85, '85-89'], [89, '85-89']]) assert.equal(client.runnerAgeBand(age), expected);
  for (const age of [null, undefined, 17, 24.5, 90, NaN, Infinity]) assert.equal(client.runnerAgeBand(age), null);
});
test('only supported recorded gender aliases define a peer group', () => {
  for (const sex of ['F', ' female ', 'WOMAN', 'women']) assert.equal(client.runnerGender(sex), 'Women');
  for (const sex of ['M', ' male ', 'MAN', 'men']) assert.equal(client.runnerGender(sex), 'Men');
  for (const sex of [null, undefined, '', 'X', 'Other', 'nonbinary', 'unknown']) assert.equal(client.runnerGender(sex), null);
});
test('achieved-time buckets have half-open boundaries without minute rounding', () => {
  for (const [seconds, expected] of [[5400, '90'], [13949.999, '225'], [13950, '240'], [14849.999, '240'], [14850, '255'], [43200, '720']]) assert.equal(client.pacePeerKey(seconds), expected);
  assert.equal(client.pacePeerKey(13949.999000000002), '225');
});
test('insights select exact demographic and achieved-time groups without mutation', () => {
  const original = JSON.stringify(context), result = client.raceInsights(context, race());
  assert.deepEqual(Object.keys(result.comparisons), ['all', 'gender', 'age', 'age_gender']);
  assert.equal(result.comparisons.gender.label, 'Women'); assert.equal(result.comparisons.age.label, 'Ages 35–39');
  assert.equal(result.comparisons.age_gender.label, 'Women, ages 35–39');
  for (const comparison of Object.values(result.comparisons)) { assert.equal(comparison.n, 201); assert.equal(comparison.pace.n, 201); }
  assert.equal('groups' in result, false); assert.equal(JSON.stringify(context), original);
});
test('missing demographics never silently fall back to the whole field', () => {
  const unknown = client.raceInsights(context, race({ age: null, sex: 'unknown' })).comparisons;
  assert.ok(unknown.all); assert.equal(unknown.age, null); assert.equal(unknown.gender, null); assert.equal(unknown.age_gender, null);
  const missing = clone(context); delete missing.groups['age_gender:35-39:Women'];
  const selected = client.raceInsights(missing, race()).comparisons;
  assert.ok(selected.age); assert.ok(selected.gender); assert.equal(selected.age_gender, null);
  const withoutPace = clone(context); withoutPace.groups.all.pace = {};
  assert.equal(client.raceInsights(withoutPace, race()).comparisons.all.pace, null);
});
test('excluded, incomplete, and unmatched finishes cannot obtain peer placement', () => {
  for (const selected of [race({ eligible: false, reason: 'Reviewed source exclusion' }), race({ times: [...race().times.slice(0, 8), null] }), race({ finish: 14400.126 })]) {
    assert.ok(Object.values(client.raceInsights(context, selected).comparisons).every(value => value === null));
  }
});
test('all nine signed section differences reconcile for an explicit same-year pair', () => {
  const manifest = { editions: [edition, { ...edition, race: 'Alternate course label' }, { city: 'Elsewhere', year: 2020, race: 'Other Marathon' }] };
  const reference = race({ id: 2, edition: 1, times: RUNNER_POINTS.map(km => km * 330) });
  const changes = [50, -25, 0, 100, -50, 25, -100, 50, -21.95];
  let cumulative = 0;
  const focus = race({ times: reference.times.map((time, i) => { cumulative += changes[i]; return time + cumulative; }) });
  const original = JSON.stringify([focus, reference]);
  const result = client.compareRunnerRaces(focus, reference, manifest);
  assert.equal(result.sections.length, 9); assert.equal(result.sameCourse, true);
  result.sections.forEach((row, i) => { close(row.seconds, changes[i], `section ${i}`); assert.equal(row.start, i ? RUNNER_POINTS[i - 1] : 0); assert.equal(row.end, RUNNER_POINTS[i]); });
  close(result.sections[8].end - result.sections[8].start, 2.195, 'final section distance');
  close(result.finish, 28.05, 'finish difference'); close(result.early, 100, 'difference through 30 km'); close(result.late, -71.95, 'late difference');
  close(result.sections.reduce((sum, row) => sum + row.seconds, 0), result.finish, 'section sum'); close(result.early + result.late, result.finish, 'early and late sum');
  const reversed = client.compareRunnerRaces(reference, focus, manifest);
  close(reversed.finish, -result.finish, 'reversed finish difference');
  reversed.sections.forEach((row, i) => close(row.seconds, -result.sections[i].seconds, `reversed section ${i}`));
  assert.equal(client.compareRunnerRaces(focus, { ...reference, edition: 2 }, manifest).sameCourse, false);
  assert.equal(JSON.stringify([focus, reference]), original);
  assert.equal('earlier' in result, false); assert.equal('improvement' in result, false);
});
test('race comparisons reject self-comparison and unusable timings', () => {
  const manifest = { editions: [edition] }, valid = race();
  assert.equal(client.compareRunnerRaces(valid, valid, manifest), null);
  assert.equal(client.compareRunnerRaces(valid, race({ id: 2, eligible: false }), manifest), null);
  assert.equal(client.compareRunnerRaces(race({ times: Array(9).fill(14400) }), race({ id: 2 }), manifest), null);
});

function fixture(options = {}) {
  const data = clone(context);
  options.data?.(data);
  const bytes = gzipSync(Buffer.from(JSON.stringify(data)));
  const sha256 = createHash('sha256').update(bytes).digest('hex');
  // Include whitespace and a final newline so hashing reserialized JSON cannot
  // accidentally pass as hashing the exact downloaded manifest bytes.
  const runnerBytes = Buffer.from(JSON.stringify(runners, null, 2) + '\n');
  const changedRunners = clone(runners);
  options.runners?.(changedRunners);
  const servedRunnerBytes = options.runners ? Buffer.from(JSON.stringify(changedRunners, null, 2) + '\n') : runnerBytes;
  const manifest = { schema_version: 1, release_tag: RUNNER_RELEASE, input_as_of: runners.input_as_of, as_of: '2026-09-12T02:00:00Z', runner_manifest_as_of: runners.as_of,
    runner_manifest_sha256: createHash('sha256').update(runnerBytes).digest('hex'), cohort: { raw: runners.raw_records, eligible: 201 },
    editions: { '0': { file: 'editions/000.json.gz', bytes: bytes.byteLength, sha256 } } };
  options.manifest?.(manifest);
  return { data, bytes, manifest, servedRunnerBytes };
}
async function withFetch(options, run) {
  const payload = fixture(options), requests = [], previous = global.fetch;
  global.fetch = async (url, init = {}) => {
    if (init.signal?.aborted) throw new DOMException('Aborted', 'AbortError');
    if (String(url).includes('/data/runners/manifest.json?')) return new Response(payload.servedRunnerBytes);
    requests.push({ url: String(url), signal: init.signal });
    if (String(url).includes('/data/runner-context/manifest.json?')) return new Response(JSON.stringify(payload.manifest), { status: options.manifestStatus || 200 });
    assert.match(String(url), /\/data\/runner-context\/editions\/000\.json\.gz\?v=[a-f0-9]{64}$/);
    if (options.editionResponse) return options.editionResponse(payload, init);
    return new Response(options.corrupt ? options.corrupt(Buffer.from(payload.bytes)) : payload.bytes, { status: options.editionStatus || 200 });
  };
  try {
    payload.runners = await loadRunnerManifest();
    assert.equal(runnerManifestDigest(payload.runners), createHash('sha256').update(payload.servedRunnerBytes).digest('hex'));
    return await run(freshClient(), payload, requests);
  } finally { global.fetch = previous; }
}
test('loader opens genuine gzip bytes, verifies their hash and reuses an edition', async () => {
  await withFetch({}, async (loaded, payload, requests) => {
    const control = new AbortController(), selected = [race(), race({ id: 2, finish: 14500 })];
    const result = await loaded.loadRaceInsights(selected, payload.runners, control.signal);
    assert.deepEqual(Object.keys(result), ['1', '2']); assert.equal(result[1].comparisons.all.n, 201);
    assert.equal(result[2].comparisons.all.rank, 102); assert.equal(result[1].weather, null);
    assert.equal(requests.length, 2, 'Two selected records in one edition require one compressed file');
    assert.ok(requests.every(request => request.signal === control.signal));
    assert.ok(requests[1].url.endsWith(payload.manifest.editions['0'].sha256));
    await loaded.loadRaceInsights([race()], payload.runners, control.signal);
    assert.equal(requests.length, 3, 'A verified cached edition is reused after the manifest is checked again');
  });
});
test('loader rejects a changed runner shard manifest with identical tag, timestamps and counts', async () => {
  await withFetch({ runners: value => { value.shards['profiles/000.json.gz'] = { bytes: 123, sha256: 'a'.repeat(64) }; } }, async (loaded, payload, requests) => {
    for (const key of ['release_tag', 'input_as_of', 'as_of', 'raw_records', 'named_records', 'profiles']) assert.equal(payload.runners[key], runners[key]);
    assert.notEqual(runnerManifestDigest(payload.runners), payload.manifest.runner_manifest_sha256);
    await assert.rejects(loaded.loadRaceInsights([race()], payload.runners, new AbortController().signal), /could not be verified/);
    assert.equal(requests.length, 1, 'A runner-manifest mismatch must stop before any edition download');
  });
});
test('loader refuses a plain manifest object without a verified transport digest', async () => {
  await withFetch({}, async (loaded, payload, requests) => {
    const unverified = clone(payload.runners);
    assert.equal(runnerManifestDigest(unverified), undefined);
    await assert.rejects(loaded.loadRaceInsights([race()], unverified, new AbortController().signal), /could not be verified/);
    assert.equal(requests.length, 0, 'An unverified manifest must fail before requesting context');
  });
});
for (const [label, change] of [
  ['release', value => { value.release_tag = 'obsolete-export'; }],
  ['input timestamp', value => { value.input_as_of = '2026-09-10T01:00:00Z'; }],
  ['runner manifest timestamp', value => { value.runner_manifest_as_of = '2026-09-11T01:00:00Z'; }],
  ['raw population', value => { value.cohort.raw++; }],
]) test(`loader rejects stale ${label} before requesting edition data`, async () => {
  await withFetch({ manifest: change }, async (loaded, payload, requests) => {
    await assert.rejects(loaded.loadRaceInsights([race()], payload.runners, new AbortController().signal), /could not be verified/);
    assert.equal(requests.length, 1);
  });
});
for (const [label, change] of [
  ['edition identity', value => { value.edition.city = 'Wrong city'; }],
  ['edition index', value => { value.edition.index = 1; }],
  ['release inside valid gzip', value => { value.release_tag = 'obsolete-export'; }],
  ['CDF count', value => { value.groups.all.finish[0][1]--; }],
  ['CDF ordering', value => { value.groups.all.finish.reverse(); }],
  ['pace quantiles', value => { value.groups.all.pace['240'].q25[0] = 500; }],
]) test(`loader rejects invalid ${label} despite a matching transport checksum`, async () => {
  await withFetch({ data: change }, async (loaded, payload) => {
    await assert.rejects(loaded.loadRaceInsights([race()], payload.runners, new AbortController().signal), /could not be verified/);
  });
});
test('loader rejects wrong SHA before attempting decompression', async () => {
  await withFetch({ corrupt: bytes => { bytes[bytes.length - 1] ^= 1; return bytes; } }, async (loaded, payload) => {
    await assert.rejects(loaded.loadRaceInsights([race()], payload.runners, new AbortController().signal), /could not be verified/);
  });
});
test('loader rejects an incorrect declared compressed size', async () => {
  await withFetch({ manifest: value => { value.editions['0'].bytes++; } }, async (loaded, payload) => {
    await assert.rejects(loaded.loadRaceInsights([race()], payload.runners, new AbortController().signal), /could not be verified/);
  });
});
test('loader distinguishes an unavailable response from verified data', async () => {
  for (const options of [{ manifestStatus: 503 }, { editionStatus: 404 }]) await withFetch(options, async (loaded, payload) => {
    await assert.rejects(loaded.loadRaceInsights([race()], payload.runners, new AbortController().signal), /could not load/);
  });
});
test('loader propagates cancellation before fetching and during an edition request', async () => {
  const before = new AbortController(); before.abort();
  await withFetch({}, async (loaded, payload, requests) => {
    await assert.rejects(loaded.loadRaceInsights([race()], payload.runners, before.signal), { name: 'AbortError' });
    assert.equal(requests.length, 0);
  });
  const during = new AbortController();
  await withFetch({ editionResponse: (payload, { signal }) => new Promise((resolve, reject) => {
    signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')), { once: true });
    queueMicrotask(() => during.abort());
  }) }, async (loaded, payload, requests) => {
    await assert.rejects(loaded.loadRaceInsights([race()], payload.runners, during.signal), { name: 'AbortError' });
    assert.equal(requests.length, 2); assert.ok(requests.every(request => request.signal === during.signal));
  });
});

(async () => {
  for (const { name, run } of tests) {
    try { await run(); } catch (error) { error.message = `${name}: ${error.message}`; throw error; }
  }
  console.log(`Runner context client passed ${tests.length} checks: exact peer placement, demographic and time-band boundaries, signed race comparisons, verified gzip transport, stale/corrupt response rejection and cancellation.`);
})().catch(error => { console.error(error); process.exitCode = 1; });
