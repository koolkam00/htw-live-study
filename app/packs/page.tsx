import Link from 'next/link';
import { PACKS } from '@/lib/packs';

function StatusBadge({ status }: { status: 'ready' | 'enrichment' | 'coming-soon' }) {
  const label =
    status === 'ready' ? 'Ready' : status === 'enrichment' ? 'Enrichment' : 'Coming soon';
  return <span className="badge">{label}</span>;
}

export default function PacksIndexPage() {
  const paper = PACKS.filter((p) => p.group === 'paper');
  const sPacks = PACKS.filter((p) => p.group === 'S');
  const rPacks = PACKS.filter((p) => p.group === 'R');
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

      <div className="grid">
        {paper.map((p) => (
          <div key={p.id} className="panel figure-card">
            <div className="figure-header">
              <div className="figure-title">{p.title}</div>
              <StatusBadge status={p.status} />
            </div>
            <div className="site-subtitle">Paper pack</div>
            <div>
              <Link href={`/packs/${p.id}`}>Open</Link>
            </div>
          </div>
        ))}
      </div>

      <div className="panel">
        <div className="figure-title">Shipping S1–S12</div>
      </div>
      <div className="grid">
        {sPacks.map((p) => (
          <div key={p.id} className="panel figure-card">
            <div className="figure-header">
              <div className="figure-title">{p.title}</div>
              <StatusBadge status={p.status} />
            </div>
            <div>
              <Link href={`/packs/${p.id}`}>Open</Link>
            </div>
          </div>
        ))}
      </div>

      <div className="panel">
        <div className="figure-title">Research R1–R26</div>
      </div>
      <div className="grid">
        {rPacks.map((p) => (
          <div key={p.id} className="panel figure-card">
            <div className="figure-header">
              <div className="figure-title">{p.title}</div>
              <StatusBadge status={p.status} />
            </div>
            <div>
              <Link href={`/packs/${p.id}`}>Open</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
