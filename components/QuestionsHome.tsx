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
  tables?: {
    t1?: {
      caption?: string;
      columns?: string[];
      rows?: (string | number | null)[][];
    };
    t2?: {
      caption?: string;
      columns?: string[];
      rows?: (string | number | null)[][];
    };
    [k: string]: any;
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
  const deriveDisplayId = (slug: string): string | null => {
    if (/^s(\d+)_/i.test(slug)) {
      const m = slug.match(/^s(\d+)_/i)!;
      return `S${parseInt(m[1], 10)}`;
    }
    if (/^r(\d+)_/i.test(slug)) {
      const m = slug.match(/^r(\d+)_/i)!;
      return `R${parseInt(m[1], 10)}`;
    }
    if (/^rn(\d+)_/i.test(slug)) {
      const m = slug.match(/^rn(\d+)_/i)!;
      return `RN${parseInt(m[1], 10)}`;
    }
    if (/^p(\d+)_/i.test(slug)) {
      const m = slug.match(/^p(\d+)_/i)!;
      return `P${parseInt(m[1], 10)}`;
    }
    if (slug === 'smyth_htw') return 'HTW';
    return null;
  };

  if (!meta) {
    const info = getPackInfo(id);
    const title = info?.title || id;
    return {
      id,
      displayId: deriveDisplayId(id),
      title,
      asOf: null,
      answerProse: null,
      methodologyProse: null,
      methodFallback: null,
      csvTables: [],
      isHTW: id === 'smyth_htw',
      status: 'stub',
      readiness: null,
      notes: null,
    };
  }
  const status = String(meta.status || '').toLowerCase();

  const summaryPath = path.join(process.cwd(), 'public', 'data', 'packs', id, 'summary.json');
  const summary = safeReadJson<PackSummary | null>(summaryPath);

  const answer = meta.answer_prose || summary?.answer_prose || null;
  const methodology = meta.methodology_prose || summary?.methodology_prose || null;
  const methodFallback = meta.method || null;
  const tables = normalizeTables(meta.tables);

  const info = getPackInfo(id);
  const title = meta.title || info?.title || id;
  const displayId = meta.display_id || deriveDisplayId(id);
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

function formatUtcPretty(asOf: string | null): string | null {
  if (!asOf) return null;
  try {
    const d = new Date(asOf);
    if (isNaN(d.getTime())) return null;
    const parts = new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'UTC',
    }).formatToParts(d);
    const get = (type: string) => parts.find((p) => p.type === type)?.value || '';
    const day = get('day');
    const mon = get('month');
    const year = get('year');
    const hour = get('hour');
    const minute = get('minute');
    return `${day} ${mon} ${year}, ${hour}:${minute} UTC`;
  } catch {
    return null;
  }
}

function blockedReason(q: QuestionItem): string {
  const ready = q.status === 'ready' || q.status === 'ok';
  if (ready && (!q.answerProse || q.answerProse.trim().length === 0)) {
    return 'Waiting for Analyst answer_prose. This question appears in full once the Analyst publishes the answer prose.';
  }
  if (q.status === 'coming-soon' || isParked(q.id)) {
    const base = (q.notes && q.notes.trim().length > 0) ? q.notes : 'Coming soon (parked)';
    return `${base}. This question appears in full once the prerequisites land.`;
  }
  if (q.status === 'stub' && (q.readiness === 'enrichment' || isEnrichment(q.id))) {
    return 'Waiting for weather/elevation overlays. This question appears in full once overlays are joined.';
  }
  if (q.notes && q.notes.trim().length > 0) {
    return q.notes;
  }
  return 'Waiting for Wall Analyst ready dump. This question appears in full once published.';
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
  const liveReady = (live?.status === 'ready' || live?.status === 'ok');
  const corpus = live?.corpus || {};
  const def = live?.definition || {};
  const lastPublishUtc = formatUtcPretty(live?.as_of ?? null);

  // Derive HTW answer from live.json (prefer t2 coverage)
  function computeHtwAnswerFromLive(l: LiveJson | null): string | null {
    const t2 = l?.tables?.t2;
    if (!t2 || !Array.isArray(t2.columns) || !Array.isArray(t2.rows)) return null;
    const idxN = t2.columns.findIndex((c: string) => /^n$/i.test(c));
    const idxPct = t2.columns.findIndex((c: string) => /^pct_htw$/i.test(c));
    if (idxN === -1 || idxPct === -1) return null;
    let totalN = 0;
    let sumWeighted = 0; // pct already on 0..100 scale
    for (const row of t2.rows) {
      const n = Number(row[idxN]);
      const pct = Number(row[idxPct]);
      if (Number.isFinite(n) && Number.isFinite(pct)) {
        totalN += n;
        sumWeighted += pct * n;
      }
    }
    if (totalN <= 0) return null;
    const overallPct = sumWeighted / totalN; // already percent 0..100
    if (!Number.isFinite(overallPct)) return null;
    return `Overall HTW proportion (all runners): ${overallPct.toFixed(1)}% (n=${totalN.toLocaleString()}).`;
  }
  const htwDerivedAnswer = liveReady ? computeHtwAnswerFromLive(live) : null;

  // Build grouped contents
  const groupOf = (id: string): 'study' | 'S' | 'RN' | 'P' | 'R' => {
    if (id === 'smyth_htw') return 'study';
    if (/^s\d+_/.test(id)) return 'S';
    if (/^rn\d+_/.test(id)) return 'RN';
    if (/^p\d+_/.test(id)) return 'P';
    return 'R';
  };
  const groups = [
    { key: 'study', title: 'The study' },
    { key: 'S', title: 'For runners' },
    { key: 'RN', title: 'New research' },
    { key: 'P', title: 'Tools' },
    { key: 'R', title: 'Research questions' },
  ] as const;
  const byGroup = new Map<string, QuestionItem[]>();
  for (const q of items) {
    const g = groupOf(q.id);
    const arr = byGroup.get(g) || [];
    arr.push(q);
    byGroup.set(g, arr);
  }

  return (
    <div className="questions">
      {/* Sticky top bar */}
      <div className="stickybar">
        <div className="stickybar-inner">
          <div className="running-head">HTW Live Study</div>
          <nav className="tabs" aria-label="On-page">
            <a href="#contents">Contents</a>
            <a href="/methodology">Method</a>
            <a href="/data/live.json">Data</a>
          </nav>
        </div>
      </div>

      {/* Study intro */}
      <section className="reading-col" style={{ marginBottom: '1.25rem' }}>
        <h1 style={{ marginTop: 0, fontFamily: 'var(--font-serif)' }}>HTW Live Study</h1>
        <p className="site-subtitle text-col" style={{ marginTop: '0.25rem' }}>
          {liveReady &&
          typeof corpus.n_records === 'number' &&
          typeof corpus.n_runners === 'number' &&
          typeof corpus.n_races === 'number' &&
          typeof corpus.n_cities === 'number' &&
          typeof corpus.year_min === 'number' &&
          typeof corpus.year_max === 'number'
            ? `Live corpus: ${corpus.n_records.toLocaleString()} records from ${corpus.n_runners.toLocaleString()} runners across ${corpus.n_races} races in ${corpus.n_cities} cities (${corpus.year_min}–${corpus.year_max}). Last published ${lastPublishUtc ?? '—'}.`
            : `Live corpus pending. Last published ${lastPublishUtc ?? '—'}.`}
        </p>
        <div className="site-subtitle" style={{ marginTop: '0.25rem' }}>
          Definition: DoS ≥ {def.dos ?? '—'} and LoS ≥ {def.los_km ?? '—'} km after {def.after_km ?? '—'} km vs {def.base_pace_from_km ?? '—'}–{def.base_pace_to_km ?? '—'} km base pace
        </div>
      </section>

      {/* Contents */}
      <section className="reading-col" id="contents" style={{ marginBottom: '1rem' }}>
        <h2 style={{ margin: '0 0 0.5rem 0', fontFamily: 'var(--font-sans)' }}>Contents</h2>
        {groups.map((g) => {
          const arr = byGroup.get(g.key) || [];
          if (!arr.length) return null;
          return (
            <div key={g.key}>
              <div className="toc-group">{g.title}</div>
              <ul className="toc-list two-col">
                {arr.map((q) => {
                  const title = `${q.title}`;
                  const metaReady = q.status === 'ready' || q.status === 'ok';
                  const statusReady = q.isHTW
                    ? metaReady && !!htwDerivedAnswer
                    : metaReady && !!q.answerProse;
                  return (
                    <li key={q.id}>
                      <a href={`#q-${q.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                        {q.displayId ? <span className="display-id">{q.displayId}</span> : null}
                        <span>{title}</span>
                      </a>
                      <span className={`status ${statusReady ? 'ready' : 'waiting'}`}>{statusReady ? 'Ready' : 'Waiting'}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </section>

      {/* Question blocks */}
      <div className="stack reading-col" style={{ display: 'grid', gap: '1.25rem' }}>
        {items.map((q) => {
          const title = `${q.title}`;
          const ready = q.status === 'ready' || q.status === 'ok';
          const hasAnswer = q.isHTW
            ? !!htwDerivedAnswer && ready
            : !!(q.answerProse && q.answerProse.trim().length > 0);
          const showMethod =
            (q.methodologyProse && q.methodologyProse.trim().length > 0) ||
            (q.methodFallback && q.methodFallback.trim().length > 0);
          const vizCsvs = q.csvTables;
          const pubUtc = formatUtcPretty(q.asOf ?? null);

          // Special HTW block
          if (q.isHTW) {
            const t2 = live?.tables?.t2;
            const hasT2 = t2 && Array.isArray(t2.columns) && Array.isArray(t2.rows);
            const defHasFields =
              typeof (def as any)?.dos === 'number' ||
              typeof (def as any)?.los_km === 'number' ||
              typeof (def as any)?.after_km === 'number' ||
              typeof (def as any)?.base_pace_from_km === 'number' ||
              typeof (def as any)?.base_pace_to_km === 'number';
            const htwShowMethod =
              (q.methodologyProse && q.methodologyProse.trim().length > 0) ||
              (q.methodFallback && q.methodFallback.trim().length > 0) ||
              !!defHasFields;
            return (
              <article key={q.id} id={`q-${q.id}`} className="readable">
                <header style={{ marginBottom: '0.25rem' }}>
                  {q.displayId ? <div className="display-id">{q.displayId}</div> : null}
                  <h2 className="question-title" style={{ margin: 0 }}>{title}</h2>
                </header>
                {hasAnswer && htwDerivedAnswer ? (
                  <p className="prose text-col" style={{ marginTop: '0.5rem' }}>{htwDerivedAnswer}</p>
                ) : (
                  <p className="site-subtitle text-col" style={{ marginTop: '0.5rem' }}>
                    {liveReady
                      ? 'Waiting for live.json t2 (pct_htw/n). This question appears in full once the live tables are published.'
                      : 'Live corpus pending. This question appears in full once live.json is published.'}
                  </p>
                )}
                {/* How it was computed */}
                {hasAnswer && htwShowMethod && (
                  <section className="method-col" style={{ marginTop: '0.5rem' }}>
                    <h3 className="question-section">How it was computed</h3>
                    <p className="prose">
                      {def
                        ? `HTW is defined as slowdown (DoS) ≥ ${def.dos ?? '—'} with length (LoS) ≥ ${def.los_km ?? '—'} km after ${def.after_km ?? '—'} km, relative to base pace over ${def.base_pace_from_km ?? '—'}–${def.base_pace_to_km ?? '—'} km.`
                        : (q.methodologyProse && q.methodologyProse.trim().length > 0
                            ? q.methodologyProse
                            : q.methodFallback || '')}
                    </p>
                  </section>
                )}
                {/* Source always for READY */}
                {hasAnswer && (
                  <div className="site-subtitle" style={{ marginTop: '0.25rem' }}>
                    <code>public/data/live.json</code> — Published {lastPublishUtc ?? '—'}
                  </div>
                )}
                {/* Visualization from live.json (prefer t2 age table) */}
                {hasAnswer && hasT2 ? (
                  <section style={{ marginTop: '0.5rem' }}>
                    <div style={{ overflowX: 'auto' }}>
                      <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
                        <thead>
                          <tr>
                            {t2!.columns!.map((h: string) => (
                              <th key={h} style={{ textAlign: 'left', borderBottom: '1px solid var(--rule)', padding: '0.35rem 0.5rem', color: 'var(--slate)' }}>
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {t2!.rows!.slice(0, 20).map((row: any[], i: number) => (
                            <tr key={i}>
                              {row.map((cell, j) => (
                                <td key={j} style={{ padding: '0.35rem 0.5rem', borderBottom: '1px solid var(--rule)' }}>
                                  {cell as any}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="site-subtitle" style={{ marginTop: '0.4rem' }}>
                      {t2?.caption || 'HTW proportion by age group and sex (from live study)'}
                    </div>
                  </section>
                ) : null}
                {hasAnswer && (
                  <p style={{ marginTop: '0.5rem' }}>
                    <Link href="/htw">Explore the HTW dashboard</Link>
                  </p>
                )}
              </article>
            );
          }

          return (
            <article key={q.id} id={`q-${q.id}`} className="readable">
              <header style={{ marginBottom: '0.25rem' }}>
                {q.displayId ? <div className="display-id">{q.displayId}</div> : null}
                <h2 className="question-title" style={{ margin: 0 }}>{title}</h2>
              </header>

              {ready && hasAnswer ? (
                <>
                  <p className="prose text-col" style={{ marginTop: '0.5rem' }}>{q.answerProse}</p>

                  {showMethod && (
                    <section style={{ marginTop: '0.5rem' }}>
                      <h3 className="question-section">How it was computed</h3>
                      <p className="prose method-col">
                        {q.methodologyProse && q.methodologyProse.trim().length > 0
                          ? q.methodologyProse
                          : q.methodFallback}
                      </p>
                    </section>
                  )}
                  {/* Source: always show for READY even if method prose missing */}
                  <div className="site-subtitle" style={{ marginTop: '0.25rem' }}>
                    <code style={{ fontFamily: 'monospace' }}>{`public/data/packs/${q.id}/`}</code>
                    {` — Published ${pubUtc ?? '—'}`}
                  </div>

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
                  <div className="site-subtitle text-col">{blockedReason(q)}</div>
                </section>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}

