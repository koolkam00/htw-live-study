import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import QuestionViz from '@/components/QuestionViz';
import { getPackInfo } from '@/lib/packs';

type PackMeta = {
  pack_id?: string;
  slug?: string;
  display_id?: string;
  title?: string;
  status?: string;
  readiness?: string;
  as_of?: string | null;
  tables?: string[];
  notes?: string;
  method?: string;
  answer_prose?: string;
  methodology_prose?: string;
};

type PackSummary = {
  answer_prose?: string;
  methodology_prose?: string;
  [k: string]: unknown;
};

type QuestionItem = {
  id: string;
  displayId: string | null;
  title: string;
  asOf: string | null;
  answerProse: string | null;
  methodologyProse: string | null;
  methodFallback: string | null;
  csvTables: string[];
  isHTW: boolean;
};

function safeReadJson<T = any>(p: string): T | null {
  try {
    const raw = fs.readFileSync(p, 'utf-8');
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function readPackIds(): string[] {
  const packsDir = path.join(process.cwd(), 'public', 'data', 'packs');
  const idsPathA = path.join(packsDir, 'PACK_IDS.json'); // preferred
  const idsPathB = path.join(packsDir, 'INDEX.json'); // legacy
  const a = safeReadJson<string[] | null>(idsPathA);
  if (Array.isArray(a)) return a;
  const b = safeReadJson<string[] | null>(idsPathB);
  if (Array.isArray(b)) return b;
  try {
    return fs
      .readdirSync(packsDir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);
  } catch {
    return [];
  }
}

function normalizeTables(tables: unknown): string[] {
  if (!Array.isArray(tables)) return [];
  const out: string[] = [];
  for (const t of tables) {
    if (typeof t === 'string' && t.toLowerCase().endsWith('.csv')) {
      out.push(t.replace(/^\.\//, ''));
    }
  }
  return out;
}

function buildQuestionItem(id: string): QuestionItem | null {
  const metaPath = path.join(process.cwd(), 'public', 'data', 'packs', id, 'pack_meta.json');
  const meta = safeReadJson<PackMeta | null>(metaPath);
  if (!meta) return null;
  const status = String(meta.status || '').toLowerCase();
  if (status !== 'ready' && status !== 'ok') return null;

  const summaryPath = path.join(process.cwd(), 'public', 'data', 'packs', id, 'summary.json');
  const summary = safeReadJson<PackSummary | null>(summaryPath);

  const answer = meta.answer_prose || summary?.answer_prose || null;
  const methodology = meta.methodology_prose || summary?.methodology_prose || null;
  const methodFallback = meta.method || null;
  const tables = normalizeTables(meta.tables);

  const info = getPackInfo(id);
  const title = meta.title || info?.title || id;
  const displayId = meta.display_id || null;
  const asOf =
    meta.as_of && typeof meta.as_of === 'string' && meta.as_of.length > 0
      ? new Date(meta.as_of).toLocaleString()
      : null;

  return {
    id,
    displayId,
    title,
    asOf,
    answerProse: answer,
    methodologyProse: methodology,
    methodFallback,
    csvTables: tables,
    isHTW: id === 'smyth_htw',
  };
}

const PRIORITY: string[] = [
  'smyth_htw',
  'rn1_wall_severity',
  'rn4_reference_dependence',
  'p4_even_effort_gap',
  'p2_halfway_calculator',
  'p1_pace_band_planner',
];

function priorityIndex(id: string): number {
  const idx = PRIORITY.indexOf(id);
  return idx === -1 ? Number.POSITIVE_INFINITY : idx;
}

export default function QuestionsHome() {
  const ids = readPackIds();
  const items = ids
    .map(buildQuestionItem)
    .filter((x): x is QuestionItem => !!x)
    // Strict: require Answer prose for non-HTW; HTW may appear as a link-out block
    .filter((q) => q.isHTW || !!q.answerProse);

  // Sort by priority, then by asOf (desc), then by id
  items.sort((a, b) => {
    const pa = priorityIndex(a.id);
    const pb = priorityIndex(b.id);
    if (pa !== pb) return pa - pb;
    const ta = a.asOf ? new Date(a.asOf).getTime() : 0;
    const tb = b.asOf ? new Date(b.asOf).getTime() : 0;
    if (ta !== tb) return tb - ta;
    return a.id.localeCompare(b.id);
  });

  return (
    <div className="questions">
      <div className="panel readable">
        <h1 style={{ marginTop: 0 }}>Questions</h1>
        <p className="site-subtitle" style={{ marginTop: '-0.5rem' }}>
          Findings presented as Answer → Methodology → Visualization. Built for humans to read.
        </p>
      </div>

      <div className="stack" style={{ display: 'grid', gap: '1.25rem' }}>
        {items.map((q) => {
          const title = `${q.displayId ? q.displayId + ' — ' : ''}${q.title}`;
          const showMethod =
            (q.methodologyProse && q.methodologyProse.trim().length > 0) ||
            (q.methodFallback && q.methodFallback.trim().length > 0);
          const vizCsvs = q.csvTables;
          const hasAnswer = !!(q.answerProse && q.answerProse.trim().length > 0);
          return (
            <article key={q.id} className="panel readable">
              <header className="figure-header" style={{ marginBottom: '0.5rem' }}>
                <div>
                  <h2 className="question-title" style={{ margin: 0 }}>{title}</h2>
                  <div className="site-subtitle">{q.asOf ? `As of: ${q.asOf}` : 'Awaiting publication'}</div>
                </div>
                <span className="badge">Ready</span>
              </header>

              {/* Answer */}
              {hasAnswer ? (
                <section style={{ marginTop: '0.5rem' }}>
                  <h3 className="question-section">Answer</h3>
                  <p className="prose">{q.answerProse}</p>
                </section>
              ) : q.isHTW ? (
                <section style={{ marginTop: '0.5rem' }}>
                  <h3 className="question-section">Answer</h3>
                  <p className="prose">
                    HTW figures are available in the dedicated dashboard.
                  </p>
                </section>
              ) : null}

              {/* Methodology */}
              {showMethod && (
                <section style={{ marginTop: '0.5rem' }}>
                  <h3 className="question-section">Methodology</h3>
                  <p className="prose">
                    {q.methodologyProse && q.methodologyProse.trim().length > 0
                      ? q.methodologyProse
                      : q.methodFallback}
                  </p>
                </section>
              )}

              {/* Visualization */}
              <section style={{ marginTop: '0.5rem' }}>
                <h3 className="question-section">Visualization</h3>
                {q.isHTW ? (
                  <div>
                    <div className="placeholder" style={{ height: 120, marginBottom: '0.75rem' }}>
                      HTW figures live in the dashboard
                    </div>
                    <Link href="/packs/smyth_htw">Open HTW figures</Link>
                  </div>
                ) : vizCsvs.length > 0 ? (
                  <QuestionViz packId={q.id} csvPaths={vizCsvs} />
                ) : (
                  <div className="placeholder">Visualization pending — tables linked</div>
                )}
              </section>
            </article>
          );
        })}
      </div>
    </div>
  );
}

