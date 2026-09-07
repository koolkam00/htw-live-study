import fs from 'node:fs/promises';
import path from 'node:path';
import Link from 'next/link';
import type { Metadata } from 'next';

type T1Table = {
  caption?: string;
  columns?: string[];
  rows?: (string | number | null)[][];
};

type LiveJsonShape = {
  status?: 'empty' | 'ready';
  filters?: { cities?: string[] } | null;
  tables?: { t1?: T1Table | null } | null;
};

function slugifyCity(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function parseYearRange(years: string): number[] {
  // Accept forms like "2012–2025" (en dash) or "2012-2025"
  const m = years.match(/(19|20)\\d{2}\\s*[–-]\\s*(19|20)\\d{2}/);
  if (!m) return [];
  const parts = years.split(/[–-]/).map((s) => parseInt(s.trim(), 10)).filter((n) => Number.isFinite(n));
  if (parts.length !== 2) return [];
  const [start, end] = parts[0] <= parts[1] ? [parts[0], parts[1]] : [parts[1], parts[0]];
  const list: number[] = [];
  for (let y = start; y <= end; y++) list.push(y);
  return list;
}

async function readLiveJson(): Promise<LiveJsonShape | null> {
  try {
    const filePath = path.join(process.cwd(), 'public', 'data', 'live.json');
    const raw = await fs.readFile(filePath, 'utf8');
    return JSON.parse(raw) as LiveJsonShape;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: { city: string } }): Promise<Metadata> {
  const json = await readLiveJson();
  const cities = Array.isArray(json?.filters?.cities) ? json!.filters!.cities! : [];
  const cityName = cities.find((c) => slugifyCity(c) === params.city) ?? params.city;
  return {
    title: `${cityName} — Courses — HTW Live Study`,
  };
}

export default async function CityCoursePage({ params }: { params: { city: string } }) {
  const json = await readLiveJson();
  const cities = Array.isArray(json?.filters?.cities) ? json!.filters!.cities! : [];

  // Resolve slug to canonical city name, if possible
  const cityName = cities.find((c) => slugifyCity(c) === params.city) ?? null;

  if (!cityName) {
    return (
      <div className="panel">
        <h1 style={{ marginTop: 0 }}>City not found</h1>
        <p className="site-subtitle" style={{ marginTop: '-0.5rem' }}>
          The requested course page does not exist.
        </p>
        <p><Link href="/courses">Back to Courses</Link></p>
      </div>
    );
  }

  // Attempt to extract available editions (years) for this city from tables.t1
  const t1 = json?.tables?.t1 ?? null;
  let editionYears: number[] = [];
  if (t1?.columns && Array.isArray(t1.rows)) {
    const cityIdx = t1.columns.findIndex((c) => c.toLowerCase() === 'city');
    const yearsIdx = t1.columns.findIndex((c) => c.toLowerCase() === 'years');
    if (cityIdx >= 0 && yearsIdx >= 0) {
      const row = t1.rows.find((r) => String(r[cityIdx]).toLowerCase() === cityName.toLowerCase());
      const yearsStr = typeof row?.[yearsIdx] === 'string' ? (row![yearsIdx] as string) : null;
      if (yearsStr) {
        editionYears = parseYearRange(yearsStr);
      }
    }
  }

  const hasEditions = editionYears.length > 0;

  return (
    <div className="stack" style={{ display: 'grid', gap: '1rem' }}>
      <div className="panel">
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ marginTop: 0 }}>{cityName}</h1>
            <div className="site-subtitle" style={{ marginTop: '-0.25rem' }}>Course overview</div>
          </div>
          <div className="badge">{json?.status === 'ready' ? 'Live' : 'Waiting'}</div>
        </div>
      </div>

      {/* Edition strip (horizontal chips) */}
      <div className="panel">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontWeight: 600 }}>Editions</div>
          {!hasEditions && <div className="badge">Waiting</div>}
        </div>
        {!hasEditions ? (
          <div className="site-subtitle" style={{ marginTop: '0.5rem' }}>
            Edition list waiting on Analyst course dumps.
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
            {editionYears.map((y) => (
              <span
                key={y}
                className="badge"
                style={{
                  borderRadius: '999px',
                  paddingInline: '0.75rem',
                  background: 'var(--panel)',
                }}
              >
                {y}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Wall Map placeholder */}
      <div className="panel" style={{ minHeight: 280, display: 'grid', placeItems: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Wall Map</div>
          <div className="site-subtitle">Placeholder — waiting on course-level data. No HTW or elevation metrics are shown.</div>
        </div>
      </div>

      <div className="panel" role="note">
        <div className="site-subtitle">
          These course pages are scaffolds. They never invent cities, editions, elevation, or HTW numbers.
        </div>
      </div>
    </div>
  );
}

