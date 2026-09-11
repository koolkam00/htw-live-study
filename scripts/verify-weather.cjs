const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const Module = require('node:module');
const ts = require('typescript');

for (const extension of ['.ts', '.tsx']) require.extensions[extension] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true, jsx: ts.JsxEmit.ReactJSX },
}).outputText, filename);
const resolveFilename = Module._resolveFilename;
Module._resolveFilename = function (request, ...args) {
  return resolveFilename.call(this, request.startsWith('@/') ? path.join(__dirname, '..', request.slice(2)) : request, ...args);
};
const root = path.join(__dirname, '..');
const { getWeatherEvidence, getWeatherAnalyses } = require('../lib/weather-data.ts');
const { WEATHER_QUESTIONS } = require('../lib/weather-catalog.ts');
const { weatherValue, weatherLabel, weatherFinding } = require('../lib/weather-display.ts');
const evidence = getWeatherEvidence();
const canonical = JSON.stringify(evidence);
const sum = values => values.reduce((a, b) => a + b, 0);
const close = (actual, expected, label, tolerance = 1e-9) => assert.ok(Math.abs(actual - expected) <= tolerance, `${label}: ${actual} != ${expected}`);
const digest = file => crypto.createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex');

// Publication requires a reproducible calculation and an explicit source vintage.
assert.equal(evidence.schema_version, 1);
assert.equal(evidence.input.release_tag, 'private-export-20260911-0336');
assert.equal(evidence.calculation.script_sha256, digest('analysis/build_weather.py'), 'Weather evidence must be regenerated after changing its calculation');
assert.equal(evidence.calculation.pacing_script_sha256, digest('analysis/build_pacing.py'), 'The exact eligibility parser must match the recorded provenance');
for (const key of ['asset_sha256', 'manifest_sha256', 'race_conditions_sha256']) assert.match(evidence.input[key], /^[0-9a-f]{64}$/);
assert.ok(Number.isFinite(Date.parse(evidence.input.as_of)));
assert.ok(Date.parse(evidence.as_of) >= Date.parse(evidence.input.as_of));
assert.equal(JSON.parse(fs.readFileSync(path.join(root, 'analysis/release.json'), 'utf8')).tag, 'private-export-20260907-1318', 'The standalone weather import must not silently repin the essential ten');

const cohort = evidence.cohort;
assert.equal(cohort.raw, 3978660, 'Named September 11 source corpus');
assert.equal(sum(['duplicates_removed', 'missing_or_unparsed', 'non_increasing', 'outside_quality_bounds', 'eligible'].map(key => cohort[key])), cohort.raw);
assert.equal(evidence.editions.length, cohort.weather_analysis_editions);
assert.equal(new Set(evidence.editions.map(row => row.city + '/' + row.year)).size, evidence.editions.length, 'One independent weather observation per edition');
assert.equal(new Set(evidence.editions.map(row => row.city)).size, cohort.weather_analysis_courses);
assert.equal(sum(evidence.editions.map(row => row.n)), cohort.weather_analysis_finishes);
assert.equal(sum(Object.entries(evidence.exclusions).filter(([key]) => key.endsWith('_finishes')).map(([, value]) => value)) + cohort.weather_analysis_finishes, cohort.eligible);
assert.equal(cohort.weather_analysis_editions, 174);
assert.equal(cohort.weather_analysis_courses, 29);
assert.equal(cohort.weather_analysis_finishes, 3120690);
for (const row of evidence.editions) {
  assert.ok(Number.isInteger(row.n) && row.n >= 100, 'Every published edition has at least 100 eligible finishes');
  for (const key of ['pace_change_pct', 'temp_c', 'dewpoint_c', 'humidity_pct', 'wind_mps', 'warming_c']) assert.ok(Number.isFinite(row[key]), `${row.city} ${row.year}: ${key}`);
  assert.equal(new Date(row.date).getUTCFullYear(), row.year);
  assert.ok(row.dewpoint_c <= row.temp_c + .2);
  assert.ok(row.humidity_pct >= 0 && row.humidity_pct <= 100 && row.wind_mps >= 0);
  const startHour = Date.parse(row.start_hour + 'Z');
  assert.equal(Date.parse(row.four_hour + 'Z') - startHour, 4 * 60 * 60 * 1000, 'The weather window is always four hours, regardless of finish speed');
  assert.ok(Math.abs(startHour - Date.parse(row.date + 'T' + row.scheduled_start + ':00Z')) <= 30 * 60 * 1000, 'Weather must be close to the supplied local start');
}

// Check the declared evidence gate independently of the Python publication flag.
const gate = evidence.prespecified_gate;
assert.equal(gate.locked_before_outcomes, true);
assert.equal(gate.family_comparisons, 3);
close(gate.confidence, 1 - .05 / 3, 'Three-comparison confidence');
assert.equal(gate.practical_difference_pp, 1);
assert.deepEqual(evidence.candidates.map(item => item.id).sort(), ['humidity', 'warming', 'wind']);
for (const candidate of evidence.candidates) {
  const { effect, support, exposure } = candidate;
  for (const value of [...Object.values(effect).filter(value => typeof value === 'number'), ...Object.values(exposure).filter(value => typeof value === 'number'), ...Object.values(support)]) assert.ok(Number.isFinite(value));
  assert.ok(effect.low <= effect.estimate && effect.estimate <= effect.high, 'An uncertainty interval must contain the published estimate');
  close(effect.confidence, gate.confidence, 'Candidate confidence');
  assert.equal(effect.unit, 'percentage points', 'A difference in pace percentages is not a percentage change in finish time');
  assert.ok(exposure.min <= exposure.q25 && exposure.q25 < exposure.q75 && exposure.q75 <= exposure.max);
  close(exposure.q75 - exposure.q25, exposure.iqr, 'Observed interquartile contrast');
  assert.equal(support.editions, cohort.weather_analysis_editions);
  assert.equal(support.courses, cohort.weather_analysis_courses);
  assert.equal(support.finishes, cohort.weather_analysis_finishes);
  assert.equal(support.valid_bootstrap_draws + support.failed_bootstrap_draws, gate.bootstrap_draws);
  assert.equal(candidate.leave_course_out.length, support.courses);
  const leaveOut = candidate.leave_course_out.map(row => row.estimate).filter(value => value !== null);
  assert.equal(leaveOut.length + support.failed_leave_course_out_fits, support.courses);
  close(Math.min(...leaveOut), support.leave_course_out_min, 'Leave-one-course-out lower estimate');
  close(Math.max(...leaveOut), support.leave_course_out_max, 'Leave-one-course-out upper estimate');
  const adequate = support.editions >= gate.minimum_editions && support.courses >= gate.minimum_courses
    && support.courses_with_half_iqr_range >= gate.minimum_courses_with_half_iqr_range
    && support.vif <= gate.maximum_vif && support.valid_bootstrap_draws >= gate.bootstrap_draws * gate.minimum_valid_bootstrap_fraction
    && support.failed_leave_course_out_fits === 0;
  const association = (effect.low > 0 || effect.high < 0) && Math.abs(effect.estimate) >= gate.practical_difference_pp && leaveOut.every(value => value * effect.estimate > 0);
  const preciseNull = effect.low > -gate.practical_difference_pp && effect.high < gate.practical_difference_pp && leaveOut.every(value => Math.abs(value) < gate.practical_difference_pp);
  assert.equal(candidate.status === 'ready', adequate && (association || preciseNull));
  if (candidate.status === 'ready') {
    assert.equal(candidate.takeaway_type, association ? 'association' : 'precise_null');
    assert.equal(candidate.reasons.length, 0);
  } else {
    assert.equal(candidate.takeaway_type, null);
    assert.ok(candidate.reasons.length > 0, 'Withheld work retains the reason in the audit');
  }
}
const humidity = evidence.candidates.find(item => item.id === 'humidity');
const warming = evidence.candidates.find(item => item.id === 'warming');
const wind = evidence.candidates.find(item => item.id === 'wind');
assert.equal(humidity.status, 'withheld');
assert.equal(warming.takeaway_type, 'association');
assert.equal(wind.takeaway_type, 'precise_null');
const questions = getWeatherAnalyses();
assert.deepEqual(questions.map(item => item.id), ['warming', 'wind'], 'The public catalog includes supported results only');
const route = require('../app/analyses/[slug]/page.tsx');
const slugs = route.generateStaticParams().map(item => item.slug);
assert.ok(slugs.includes('warming-and-pacing') && slugs.includes('wind-and-pacing'));
assert.ok(!slugs.includes('humidity-and-pacing'), 'Withheld humidity must not receive a published route');
assert.throws(() => route.default({ params: { slug: 'humidity-and-pacing' } }), /NEXT_NOT_FOUND/);

// Distinguish a temperature change from an absolute temperature.
assert.equal(weatherValue(0, 'warming', 'mi'), 0);
assert.equal(weatherValue(5, 'warming', 'mi'), 9);
assert.equal(weatherValue(-5, 'warming', 'mi'), -9);
assert.equal(weatherValue(5, 'warming', 'km'), 5);
assert.equal(weatherValue(0, 'humidity', 'mi'), 32);
assert.equal(weatherValue(10, 'humidity', 'mi'), 50);
assert.equal(weatherValue(10, 'humidity', 'km'), 10);
close(weatherValue(1, 'wind', 'mi'), 2.2369362920544, 'm/s to mph');
close(weatherValue(1, 'wind', 'km'), 3.6, 'm/s to km/h');
assert.equal(weatherLabel(5, 'warming', 'mi'), '+9.0°F');
assert.equal(weatherLabel(5, 'warming', 'km'), '+5.0°C');
assert.match(weatherFinding({ ...warming, effect: { ...warming.effect, estimate: -2 } }), /less late-race slowing/);
assert.match(weatherFinding(wind), /little change/);
assert.doesNotMatch(weatherFinding(wind), /associated with (?:more|less)/);

const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const provider = require('../components/UnitsProvider.tsx');
const originalUseUnits = provider.useUnits;
const WeatherAnalysis = require('../components/WeatherAnalysis.tsx').default;
try {
  for (const units of ['mi', 'km']) {
    // Render the real page in each display mode without browser persistence noise.
    provider.useUnits = () => ({ units, setUnits() {} });
    for (const candidate of [warming, wind]) {
      const definition = WEATHER_QUESTIONS.find(item => item.id === candidate.id);
      const html = renderToStaticMarkup(React.createElement(WeatherAnalysis, { definition, candidate, evidence, questions }));
      assert.ok(html.includes('/releases/tag/private-export-20260911-0336'));
      assert.ok(html.includes('September 11, 2026') && html.includes('September 7 input'), 'New weather evidence must not imply the old ten were refreshed');
      assert.ok(html.includes('174 race editions') && html.includes('29 courses') && html.includes('3,120,690 complete finishes'));
      assert.ok(html.includes('Each edition has equal weight'));
      assert.match(html, /98\.3% uncertainty interval/);
      assert.doesNotMatch(html, /95% uncertainty interval|95% confidence interval|95% interval/);
      assert.ok(html.includes(weatherLabel(candidate.exposure.q25, candidate.id, units)));
      assert.ok(html.includes(weatherLabel(candidate.exposure.q75, candidate.id, units)));
      assert.ok(html.includes('before adjustment') && html.includes('remains the full-study comparison'), 'Browsing editions must not be presented as a model refit');
      assert.ok(html.includes('percentage points'));
      assert.ok(html.includes(units === 'mi' ? '12.43–24.85 mi' : '20–40 km'));
      assert.ok(html.includes(units === 'mi' ? '0–12.43 mi' : '0–20 km'));
      assert.doesNotMatch(html, /half-marathon splits are measured|observed halfway/);
      for (const edition of evidence.editions) {
        assert.ok(html.includes(edition.city + ' ' + edition.year));
        assert.ok(html.includes(weatherLabel(edition[candidate.exposure.key], candidate.id, units)), 'Exact-values table converts the actual recorded weather measurement');
      }
      if (candidate.id === 'wind') assert.ok(html.includes('not evidence that strong winds are harmless'));
      if (candidate.id === 'warming') assert.ok(html.includes('does not prove that warming caused'));
    }
  }
} finally {
  provider.useUnits = originalUseUnits;
}
assert.equal(JSON.stringify(evidence), canonical, 'Rendering and unit conversions must not mutate published evidence');
console.log('Verified weather provenance, reconciled edition cohorts, all three publication gates, supported routes, source units, corrected uncertainty and actual rendered results in miles and metric.');
