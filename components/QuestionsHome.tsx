import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import QuestionViz from '@/components/QuestionViz';
import { getPackInfo, isEnrichment, isParked } from '@/lib/packs';

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
  status: string;
  readiness: string | null;
  notes: string | null;
};

type LiveJson = {
  status?: string;
  as_of?: string;
  corpus?: {
    n_records?: number;
    n_runners?: number;
    n_races?: number;
    n_cities?: number;
    year_min?: number;
    year_max?: number;
  };
  definition?: {
    dos?: number;
    los_km?: number;
    after_km?: number;
    base_pace_from_km?: number;
    base_pace_to_km?: number;
  };
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

function readLiveJson(): LiveJson | null {
  const p = path.join(process.cwd(), 'public', 'data', 'live.json');
  return safeReadJson<LiveJson | null>(p);
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
      ? meta.as_of
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
    status,
    readiness: meta.readiness || null,
    notes: meta.notes || null,
  };
}

function formatUtc(asOf: string | null): string | null {
  if (!asOf) return null;
  try {
    const d = new Date(asOf);
    if (isNaN(d.getTime())) return null;
    return d.toISOString().replace('T', ' ').replace('Z', ' UTC');
  } catch {
    return null;
  }
}

function blockedReason(q: QuestionItem): string {
  const ready = q.status === 'ready' || q.status === 'ok';
  if (ready && (!q.answerProse || q.answerProse.trim().length === 0)) {
    return 'Waiting for Analyst answer_prose';
  }
  if (q.status === 'coming-soon' || isParked(q.id)) {
    return (q.notes && q.notes.trim().length > 0) ? q.notes : 'Coming soon (parked)';
  }
  if (q.status === 'stub' && (q.readiness === 'enrichment' || isEnrichment(q.id))) {
    return 'Waiting for weather/elevation overlays';
  }
  if (q.notes && q.notes.trim().length > 0) {
    return q.notes;
  }
  return 'Waiting for Wall Analyst ready dump';
}

function buildOrderedIdsFromRegistry(registry: string[]): string[] {
  const set = new Set(registry);
  const out: string[] = [];
  // 1) The study (HTW)
  if (set.has('smyth_htw')) out.push('smyth_htw');
  // 2) For runners S1–S12
  for (let i = 1; i <= 12; i++) {
    const pat = `s${i}_`;
    const id = registry.find((x) => x.startsWith(pat));
    if (id) out.push(id);
  }
  // 3) New research RN1/RN4 (+ RN3 if present)
  const rn1 = registry.find((x) => x.startsWith('rn1_'));
  const rn4 = registry.find((x) => x.startsWith('rn4_'));
  const rn3 = registry.find((x) => x.startsWith('rn3_'));
  if (rn1) out.push(rn1);
  if (rn4) out.push(rn4);
  if (rn3) out.push(rn3);
  // 4) Tools P2/P4 (+ P1/P3 if present)
  const p2 = registry.find((x) => x.startsWith('p2_'));
  const p4 = registry.find((x) => x.startsWith('p4_'));
  const p1 = registry.find((x) => x.startsWith('p1_'));
  const p3 = registry.find((x) => x.startsWith('p3_'));
  if (p2) out.push(p2);
  if (p4) out.push(p4);
  if (p1) out.push(p1);
  if (p3) out.push(p3);
  // 5) Research R1–R26
  for (let i = 1; i <= 26; i++) {
    const num = String(i).padStart(2, '0');
    const pat = `r${num}_`;
    const id = registry.find((x) => x.startsWith(pat));
    if (id) out.push(id);
  }
  // De-dup while preserving order
  const seen = new Set<string>();
  return out.filter((id) => {
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

export default function QuestionsHome() {
  const registry = readPackIds();
  const ordered = buildOrderedIdsFromRegistry(registry);
  const items = ordered
    .map(buildQuestionItem)
    .filter((x): x is QuestionItem => !!x);

  const live = readLiveJson();
  const corpus = live?.corpus || {};
  const def = live?.definition || {};
  const lastPublishUtc = formatUtc(live?.as_of ?? null);

  return (
    <div className="questions">
      {/* Study intro */}
      <section className="readable" style={{ marginBottom: '1.25rem' }}>
        <h1 style={{ marginTop: 0, fontFamily: 'var(--font-serif)' }}>HTW Live Study</h1>
        <div className="site-subtitle" style={{ marginTop: '-0.25rem' }}>
          Findings presented as Answer → How it was computed → Source → Visualization
        </div>
        <div style={{ marginTop: '0.75rem' }}>
          <span className="badge">
            Definition: DoS ≥ {def.dos ?? '—'} and LoS ≥ {def.los_km ?? '—'} km after {def.after_km ?? '—'} km vs {def.base_pace_from_km ?? '—'}–{def.base_pace_to_km ?? '—'} km base pace
          </span>
        </div>
        <div className="stats" role="status" style={{ marginTop: '0.75rem' }}>
          <div className="stat">
            <div className="label">Records</div>
            <div className="value">{typeof corpus.n_records === 'number' ? corpus.n_records.toLocaleString() : '—'}</div>
          </div>
          <div className="stat">
            <div className="label">Runners</div>
            <div className="value">{typeof corpus.n_runners === 'number' ? corpus.n_runners.toLocaleString() : '—'}</div>
          </div>
          <div className="stat">
            <div className="label">Races</div>
            <div className="value">{typeof corpus.n_races === 'number' ? corpus.n_races.toLocaleString() : '—'}</div>
          </div>
          <div className="stat">
            <div className="label">Cities</div>
            <div className="value">{typeof corpus.n_cities === 'number' ? corpus.n_cities.toLocaleString() : '—'}</div>
          </div>
          <div className="stat">
            <div className="label">Years</div>
            <div className="value">
              {typeof corpus.year_min === 'number' && typeof corpus.year_max === 'number'
                ? `${corpus.year_min}–${corpus.year_max}`
                : '—'}
            </div>
          </div>
          <div className="stat">
            <div className="label">Published</div>
            <div className="value">{lastPublishUtc ?? '—'}</div>
          </div>
        </div>
      </section>

      {/* Contents */}
      <section className="readable" id="contents" style={{ marginBottom: '1rem' }}>
        <h2 style={{ margin: '0 0 0.25rem 0', fontFamily: 'var(--font-sans)' }}>Contents</h2>
        <nav aria-label="Table of contents">
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {items.map((q) => {
              const title = `${q.displayId ? q.displayId + ' — ' : ''}${q.title}`;
              return (
                <li key={q.id} style={{ margin: '0.2rem 0' }}>
                  <a href={`#q-${q.id}`} style={{ color: 'inherit', textDecoration: 'underline' }}>
                    {title}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      </section>

      {/* Question blocks */}
      <div className="stack" style={{ display: 'grid', gap: '1.25rem' }}>
        {items.map((q) => {
          const title = `${q.displayId ? q.displayId + ' — ' : ''}${q.title}`;
          const ready = q.status === 'ready' || q.status === 'ok';
          const hasAnswer = !!(q.answerProse && q.answerProse.trim().length > 0);
          const showMethod =
            (q.methodologyProse && q.methodologyProse.trim().length > 0) ||
            (q.methodFallback && q.methodFallback.trim().length > 0);
          const vizCsvs = q.csvTables;
          const pubUtc = formatUtc(q.asOf ?? null);

          // Special HTW block
          if (q.isHTW) {
            return (
              <article key={q.id} id={`q-${q.id}`} className="readable">
                <header className="figure-header" style={{ marginBottom: '0.25rem' }}>
                  <h2 className="question-title" style={{ margin: 0 }}>{title}</h2>
                </header>
                <p className="prose" style={{ marginTop: '0.5rem' }}>
                  Explore the Smyth 2021 reading UI with live-study overlays.
                </p>
                <p style={{ marginTop: '0.25rem' }}>
                  <Link href="/htw">Open HTW</Link>
                </p>
              </article>
            );
          }

          return (
            <article key={q.id} id={`q-${q.id}`} className="readable">
              <header className="figure-header" style={{ marginBottom: '0.25rem' }}>
                <h2 className="question-title" style={{ margin: 0 }}>{title}</h2>
              </header>

              {ready && hasAnswer ? (
                <>
                  <section style={{ marginTop: '0.5rem' }}>
                    <h3 className="question-section">Answer</h3>
                    <p className="prose">{q.answerProse}</p>
                  </section>

                  <section style={{ marginTop: '0.5rem' }}>
                    <h3 className="question-section">How it was computed</h3>
                    <p className="prose">
                      {q.methodologyProse && q.methodologyProse.trim().length > 0
                        ? q.methodologyProse
                        : q.methodFallback}
                    </p>
                  </section>

                  <section style={{ marginTop: '0.5rem' }}>
                    <h3 className="question-section">Source</h3>
                    <div className="site-subtitle">
                      <code style={{ fontFamily: 'monospace' }}>{`public/data/packs/${q.id}/`}</code>
                      {` — Published ${pubUtc ?? '—'}`}
                    </div>
                  </section>

                  <section style={{ marginTop: '0.5rem' }}>
                    <h3 className="question-section">Visualization</h3>
                    {vizCsvs.length > 0 ? (
                      <QuestionViz packId={q.id} csvPaths={vizCsvs} />
                    ) : (
                      <div className="placeholder">Visualization pending — tables linked</div>
                    )}
                  </section>
                </>
              ) : (
                <section style={{ marginTop: '0.5rem' }}>
                  <div className="site-subtitle">{blockedReason(q)}</div>
                </section>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}

