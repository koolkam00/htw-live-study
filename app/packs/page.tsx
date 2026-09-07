import Link from 'next/link';
import fs from 'fs';
import path from 'path';
import { getPackInfo, isEnrichment } from '@/lib/packs';

type Badge = 'Ready' | 'Coming soon' | 'Waiting';

function toBadge(id: string, meta: any | null): Badge {
  if (meta?.status === 'ready' || meta?.status === 'ok') return 'Ready';
  if (meta?.status === 'coming-soon') return 'Coming soon';
  return 'Waiting';
}

function StatusBadge({ id, meta }: { id: string; meta: any | null }) {
  const label = toBadge(id, meta);
  return <span className="badge">{label}</span>;
}

function readPackIds(): string[] {
  const packsDir = path.join(process.cwd(), 'public', 'data', 'packs');
  const idsPathA = path.join(packsDir, 'PACK_IDS.json'); // preferred
  const idsPathB = path.join(packsDir, 'INDEX.json'); // legacy
  try {
    const raw = fs.readFileSync(idsPathA, 'utf-8');
    const arr = JSON.parse(raw);
    if (Array.isArray(arr)) return arr as string[];
  } catch {}
  try {
    const raw = fs.readFileSync(idsPathB, 'utf-8');
    const arr = JSON.parse(raw);
    if (Array.isArray(arr)) return arr as string[];
  } catch {}
  return [];
}

function readMeta(id: string): any | null {
  const metaPath = path.join(process.cwd(), 'public', 'data', 'packs', id, 'pack_meta.json');
  try {
    const raw = fs.readFileSync(metaPath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export default function PacksIndexPage() {
  const ids = readPackIds();
  const paper = ids.filter((id) => id === 'smyth_htw');
  const sPacks = ids.filter((id) => /^s\d+_/.test(id));
  const rPacks = ids.filter((id) => /^r\d+_/.test(id));
  const rnPacks = ids.filter((id) => /^rn\d+_/.test(id));
  const pPacks = ids.filter((id) => /^p\d+_/.test(id));

  const renderCard = (id: string) => {
    const info = getPackInfo(id);
    const meta = readMeta(id);
    const title = info?.title ?? id;
    const isEnrich = isEnrichment(id);
    return (
      <div key={id} className="panel figure-card">
        <div className="figure-header">
          <div className="figure-title">{title}</div>
          <StatusBadge id={id} meta={meta} />
        </div>
        {isEnrich && (meta?.status !== 'ready' && meta?.status !== 'ok') && (
          <div className="site-subtitle">Needs weather/elevation overlays</div>
        )}
        <div>
          {id === 'smyth_htw' ? (
            <Link href={`/packs/${id}`}>Open</Link>
          ) : (
            <Link href={`/packs/${id}`}>Open</Link>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="stack" style={{ display: 'grid', gap: '1rem' }}>
      <div className="panel">
        <div className="figure-header">
          <div>
            <div className="figure-title">Live-study packs</div>
            <div className="site-subtitle">
              Explore shipping questions (S1–S12) and research questions (R1–R26).
            </div>
          </div>
        </div>
      </div>

      <div className="grid">{paper.map(renderCard)}</div>

      <div className="panel">
        <div className="figure-title">Shipping S1–S12</div>
      </div>
      <div className="grid">{sPacks.map(renderCard)}</div>

      <div className="panel">
        <div className="figure-title">Research RN (new)</div>
      </div>
      <div className="grid">{rnPacks.map(renderCard)}</div>

      <div className="panel">
        <div className="figure-title">Presentation P (new)</div>
      </div>
      <div className="grid">{pPacks.map(renderCard)}</div>

      <div className="panel">
        <div className="figure-title">Research R1–R26</div>
      </div>
      <div className="grid">{rPacks.map(renderCard)}</div>
    </div>
  );
}
