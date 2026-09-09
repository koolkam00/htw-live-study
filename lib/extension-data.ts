import fs from 'node:fs';
import path from 'node:path';
import { parseCsv } from './csv';
import type { ChartSpec, ResearchAnswer } from './research-data';
import { MARATHON_SECTION_ENDS } from './section-labels';
import { screenEditions } from './edition-coverage';

const root = path.join(process.cwd(), 'public/data/packs');
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
type Extension = {
  id: string; questionId: string; title: string; asOf: string;
  n: number; exportId: string; inputAsOf: string; scope: string;
  corpus: { n_records: number; n_cities: number; n_race_years: number };
  answer: Pick<ResearchAnswer, 'answer' | 'detail' | 'method' | 'charts' | 'sources' | 'published' | 'available' | 'dataset'>;
};

let cache: Extension[] | undefined;

export function getExtensions(): Extension[] {
  if (cache) return cache;
  if (!fs.existsSync(root)) return [];
  const extensions: Extension[] = [];
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    if (!entry.isDirectory() || !/^ext_[a-z0-9_]+$/.test(entry.name)) continue;
    const folder = path.join(root, entry.name);
    const metaPath = path.join(folder, 'pack_meta.json');
    if (!fs.existsSync(metaPath)) continue;
    const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
    // The personalized guide has its own cohort-shard contract and renderer.
    if (meta.presentation === 'personalized-guide') continue;
    if (meta.status !== 'ready') continue;
    const summary = JSON.parse(fs.readFileSync(path.join(folder, 'summary.json'), 'utf8'));
    const valid = meta.schema_version === 1 && meta.id === entry.name && typeof meta.question_id === 'string'
      && Number.isInteger(meta.n) && meta.n >= 100 && Number.isFinite(Date.parse(meta.as_of))
      && Number.isFinite(Date.parse(meta.input_as_of)) && typeof meta.input_export_id === 'string'
      && typeof summary.answer_prose === 'string' && Array.isArray(meta.methodology_prose)
      && meta.methodology_prose.every((method: unknown) => typeof method === 'string') && Array.isArray(summary.charts);
    if (!valid) throw new Error(`Invalid ready extension pack: ${entry.name}`);
    const sources: ResearchAnswer['sources'] = [
      { href: `${basePath}/data/packs/${entry.name}/pack_meta.json`, label: 'Method and data coverage (JSON)' },
    ];
    if (Array.isArray(meta.source_links)) for (const source of meta.source_links) {
      if (typeof source.href === 'string' && source.href.startsWith('https://') && typeof source.label === 'string') sources.push(source);
    }
    const charts: ChartSpec[] = summary.charts.map((spec: ChartSpec & { table: string }) => {
      if (!/^[a-z0-9_]+\.csv$/.test(spec.table) || !Array.isArray(spec.series) || !spec.series.length) throw new Error(`Invalid chart in ${entry.name}`);
      const rows = parseCsv(fs.readFileSync(path.join(folder, 'tables', spec.table), 'utf8'));
      if (!rows.length) throw new Error(`Empty ready chart in ${entry.name}`);
      for (const row of rows) for (const series of spec.series) {
        const value = row[series.key], n = row[`n_${series.key}`];
        if (value !== null && (typeof value !== 'number' || !Number.isFinite(value))) throw new Error(`Invalid numeric chart value in ${entry.name}`);
        if (value !== null && (typeof n !== 'number' || !Number.isInteger(n) || n < 100)) throw new Error(`Invalid chart sample in ${entry.name}`);
      }
      const href = `${basePath}/data/packs/${entry.name}/tables/${spec.table}`;
      if (!sources.some(source => source.href === href)) sources.push({ href, label: `${spec.title} (CSV)` });
      const { table: _table, ...chart } = spec;
      // Whole-race pace profiles contain interval averages, not instantaneous
      // measurements at their end checkpoints. Forecast checkpoint charts retain
      // their separate checkpoint labels.
      const profile = chart.kind === 'line' && chart.unit === '% pace' && chart.xLabel === 'Distance (km)'
        && MARATHON_SECTION_ENDS.every(end => rows.some(row => row.label === end));
      if (profile) return { ...chart, rows, xLabel: 'Section end (km)', sectionEnds: MARATHON_SECTION_ENDS };
      // Include explicit null years so a line cannot bridge an unobserved season.
      if (chart.kind === 'line' && chart.xLabel === 'Race year') {
        const withGaps = [];
        const partialRows = [];
        for (const city of new Set(rows.map(row => row.city))) {
          const cityRows = rows.filter(row => row.city === city).sort((a, b) => Number(a.label) - Number(b.label));
          const screened = screenEditions(cityRows, `n_${spec.series[0].key}`);
          partialRows.push(...screened.partial);
          for (let year = Number(cityRows[0].label); year <= Number(cityRows[cityRows.length - 1].label); year++) {
            withGaps.push(screened.retained.find(row => row.label === year) || { city, label: year, ...Object.fromEntries(spec.series.flatMap(series => [[series.key, null], [`n_${series.key}`, null]])) });
          }
        }
        return { ...chart, rows: withGaps, partialRows, xUnit: 'year', note: `${chart.note || ''} Editions below 25% of the city’s median eligible edition size are omitted from the trend and retained in the exact-value table. This sample-size screen cannot establish that the other editions are complete.`.trim() };
      }
      return { ...chart, rows };
    });
    const method = [...meta.methodology_prose];
    if (meta.question_id === 'r06_decided_after_30k') method.push(`The ranking analysis requires at least 100 eligible finishes within a city, year and race. This excludes ${(meta.cohort.eligible - meta.n).toLocaleString('en-US')} otherwise eligible finishes in small fields. Tied times receive average ranks and are retained.`);
    if (meta.question_id === 'r26_pacing_over_20y') method.push('The chart applies an additional display screen: city-years below 25% of the city’s median eligible edition size are omitted from trend lines and labeled in the exact-value tables. Counts still describe the original calculated cohort. This flags possible partial coverage without certifying the other editions as complete.');
    extensions.push({ id: entry.name, questionId: meta.question_id, title: meta.title, asOf: meta.as_of,
      n: meta.n, exportId: meta.input_export_id, inputAsOf: meta.input_as_of, corpus: meta.corpus, scope: meta.evidence_scope || 'descriptive',
      answer: { answer: summary.answer_prose, detail: summary.detail_prose, method,
        charts, sources, published: meta.as_of, available: true,
        dataset: { n: meta.n, exportId: meta.input_export_id, asOf: meta.input_as_of, unit: meta.observation_unit || 'eligible finishes', scope: meta.evidence_scope || 'descriptive' } },
    });
  }
  // Newer input vintages take precedence, with calculation date as a tie-breaker.
  cache = extensions.sort((a, b) => Date.parse(b.inputAsOf) - Date.parse(a.inputAsOf) || Date.parse(b.asOf) - Date.parse(a.asOf) || a.id.localeCompare(b.id));
  return cache;
}

export const extensionForQuestion = (questionId: string) => getExtensions().find(pack => pack.questionId === questionId);
export const extensionForPack = (packId: string) => getExtensions().find(pack => pack.id === packId);
