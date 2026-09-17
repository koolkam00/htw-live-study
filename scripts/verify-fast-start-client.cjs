const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const Module = require('node:module');
const ts = require('typescript');
for (const ext of ['.ts', '.tsx']) require.extensions[ext] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true, jsx: ts.JsxEmit.ReactJSX },
}).outputText, filename);
const resolve = Module._resolveFilename;
Module._resolveFilename = function(request, ...args) { return resolve.call(this, request.startsWith('@/') ? path.join(__dirname, '..', request.slice(2)) : request, ...args); };
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { FAST_START_DEFAULT, PRIOR_OPTIONS, fastStartSearch, readFastStartSelection, fastStartRow, fastStartCharts, timeChange, loadFastStartEvidence } = require('../lib/fast-start.ts');
const { getFastStartStart } = require('../lib/fast-start-server.ts');
const { FastStartResults, default: FastStartAnalysis } = require('../components/FastStartAnalysis.tsx');
const start = getFastStartStart();
const bytes = fs.readFileSync(path.join(__dirname, '../public/data/fast-start/evidence.json'));
const evidence = JSON.parse(bytes);
const render = (component, props) => renderToStaticMarkup(React.createElement(component, props));

async function main() {
  for (const prior of PRIOR_OPTIONS) for (const band of start.bands) {
    const selection = {city:'New York',age:'35–39',gender:'Women',prior:prior.id,band:band.id};
    assert.deepEqual(readFastStartSelection(fastStartSearch(selection),start),selection);
  }
  assert.deepEqual(readFastStartSelection('?race=unknown&age=unknown&gender=unknown&prior=unknown&opening=unknown',start),FAST_START_DEFAULT);
  assert.equal(readFastStartSelection('?previous=179&goal=300',start).prior,'under3');
  assert.equal(readFastStartSelection('?previous=180',start).prior,'3to330');
  assert.equal(readFastStartSelection('?previous=210',start).prior,'330to4');
  assert.equal(readFastStartSelection('?previous=240',start).prior,'4plus');
  assert.equal(readFastStartSelection('?previous=&goal=180',start).prior,'all','A target must not silently select prior ability');
  assert.equal(readFastStartSelection('?previous=240&prior=all',start).prior,'all','An explicit reset must clear earlier-time filtering');
  assert.equal(fastStartRow(evidence.rows,{...FAST_START_DEFAULT,city:'Missing course'}),undefined,'Sparse cohorts cannot fall back to All');
  assert.equal(fastStartRow(evidence.rows,FAST_START_DEFAULT).groups.length,6);
  const focus=start.initial.groups.find(g=>g.band==='fast10');
  const steady=start.initial.groups.find(g=>g.band==='steady');
  const charts=fastStartCharts(start.initial,focus,start.bands);
  assert.deepEqual(charts.pace.rows.map(row=>row.value),focus.pace_pct);
  assert.deepEqual(charts.pace.rows.map(row=>row.steady),steady.pace_pct);
  assert.deepEqual(charts.pace.rows.map(row=>row.n_value),Array(9).fill(focus.n));
  assert.ok(charts.onset.rows.every(row=>row.n_value===focus.slowdown_n),'Onset denominator is detected episodes, not all group finishes');
  assert.ok(Math.abs(charts.onset.rows.reduce((sum,row)=>sum+row.value,0)-100)<1e-8);
  assert.equal(charts.finishes.rows[0].median,focus.finish_delta_median_s/60);
  assert.ok(Math.abs(charts.accounting.rows[0].value+charts.accounting.rows[1].value-charts.accounting.rows[2].value)<1e-6);
  assert.equal(fastStartCharts(start.initial,steady,start.bands).pace.series.length,1,'A selected steady group must not be duplicated');
  assert.equal(fastStartCharts({...start.initial,groups:[focus]},focus,start.bands).pace.series.length,1,'No invented steady comparison for a sparse cohort');
  assert.equal(timeChange(-997),'16.6 min faster'); assert.equal(timeChange(325),'5.4 min slower'); assert.equal(timeChange(0),'About the same time');

  for (const units of ['mi','km']) {
    const html=render(FastStartResults,{row:start.initial,focus,start,units});
    assert.match(html,/47% developed a sustained slowdown/);
    assert.match(html,/16\.6 min faster/);
    assert.match(html,/17\.9%/); assert.match(html,/142,757/); assert.match(html,/67,025/);
    assert.match(html,/earlier recorded best/); assert.match(html,/do not prove that the start caused/);
    assert.match(html,/not minutes caused or lost/);
    assert.match(html,units==='mi'?/18\.64–21\.75 mi/:/30–35 km/);
    assert.match(html,units==='mi'?/26\.22 mi/:/42\.195 km/);
    assert.doesNotMatch(html,/private-export-|20260912/,'Internal upload identifiers stay out of visible result copy');
  }
  const sparse={...focus,n:100,editions:5,slowdown_n:7,onset:null};
  assert.equal(fastStartCharts(start.initial,sparse,start.bands).onset,null);
  assert.match(render(FastStartResults,{row:{...start.initial,groups:[sparse]},focus:sparse,start,units:'mi'}),/Too few detected slowdowns/);
  const zero={...focus,n:100,editions:5,slowdown_n:0,onset:null,finish_delta_median_s:0};
  assert.match(render(FastStartResults,{row:start.initial,focus:zero,start,units:'km'}),/about the same as/);
  assert.doesNotMatch(render(FastStartResults,{row:start.initial,focus:zero,start,units:'km'}),/same time than/);
  const page=render(FastStartAnalysis,{start});
  assert.match(page,/Opening pace/); assert.match(page,/Earlier recorded best/); assert.doesNotMatch(page,/>Target time</);
  assert.match(page,/withdrawals/i); assert.match(page,/555,437/);
  for (const row of evidence.rows.filter(row=>row.city!=='All courses').slice(0,3)) {
    const html=render(FastStartResults,{row,focus:row.groups[0],start,units:'mi'});
    assert.ok(html.includes(row.city==='New York'?'New York City':row.city));
  }

  const originalFetch=global.fetch; const calls=[]; let served=bytes,status=200;
  global.fetch=async(url,options)=>{calls.push({url:String(url),signal:options.signal});return new Response(served,{status});};
  const signal=new AbortController().signal;
  const descriptor=raw=>({...start,bytes:raw.length,sha256:crypto.createHash('sha256').update(raw).digest('hex')});
  try {
    status=503; await assert.rejects(()=>loadFastStartEvidence(start,signal),/could not load/); status=200;
    served=Buffer.from(bytes); served[0]=32;
    await assert.rejects(()=>loadFastStartEvidence(start,signal),/changed/,'Corrupt bytes must never reach the charts');
    served=Buffer.from(JSON.stringify({...evidence,release_tag:'wrong'}));
    await assert.rejects(()=>loadFastStartEvidence(descriptor(served),signal),/verified/);
    served=bytes; const cancelled=new AbortController(); cancelled.abort();
    await assert.rejects(()=>loadFastStartEvidence(start,cancelled.signal),/Aborted/);
    const loaded=await loadFastStartEvidence(start,signal); assert.equal(loaded.history_n,555437);
    assert.ok(calls.at(-1).url.endsWith('?v='+start.sha256)); assert.equal(calls.at(-1).signal,signal);
    const before=calls.length; await loadFastStartEvidence(start,signal); assert.equal(calls.length,before,'Use only a verified content-bound cache');
  } finally {global.fetch=originalFetch;}
  console.log('Fast-start client checks passed: exact filters and URL restore/reset, no target leakage or sparse fallback, chart denominators and signed accounting, mi/km rendered results, hash-bound loading and errors.');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
