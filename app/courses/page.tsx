import fs from 'node:fs/promises';
import path from 'node:path';
import Link from 'next/link';

type LiveJsonShape = {
  status?: 'empty' | 'ready';
  filters?: {
    cities?: string[];
  } | null;
};

async function getCities(): Promise<string[]> {
  try {
    const filePath = path.join(process.cwd(), 'public', 'data', 'live.json');
    const raw = await fs.readFile(filePath, 'utf8');
    const json = JSON.parse(raw) as LiveJsonShape;
    const cities = Array.isArray(json?.filters?.cities) ? json!.filters!.cities! : [];
    return Array.from(new Set(cities)).filter((c) => typeof c === 'string' && c.trim().length > 0);
  } catch {
    // If the file is missing or malformed, surface an empty list (honest state).
    return [];
  }
}

function slugifyCity(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '') // strip accents
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export const metadata = {
  title: 'Courses — HTW Live Study',
};

export default async function CoursesIndexPage() {
  const cities = await getCities();
  const hasCities = cities.length > 0;

  return (
    <div className="stack" style={{ display: 'grid', gap: '1rem' }}>
      <div className="panel">
        <h1 style={{ marginTop: 0 }}>Courses</h1>
        <p className="site-subtitle" style={{ marginTop: '-0.5rem' }}>
          Browse course pages by city. Wall Map and per-edition views are being scaffolded.
        </p>
      </div>

      {!hasCities && (
        <div className="panel" role="status">
          <div className="site-subtitle">
            Course pages waiting on Analyst course dumps.
          </div>
        </div>
      )}

      {hasCities && (
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
          {cities.map((city) => {
            const slug = slugifyCity(city);
            return (
              <Link
                key={city}
                href={`/courses/${slug}`}
                className="panel"
                style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontWeight: 600 }}>{city}</div>
                  <div className="badge">Course</div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

