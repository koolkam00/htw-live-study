'use client';
import Link from 'next/link';
import { getPackInfo, isEnrichment, isParked } from '@/lib/packs';
import { usePackMeta } from '@/hooks/usePackMeta';

export default function PackClientPage({ params }: { params: { packId: string } }) {
  const packId = params.packId;
  const info = getPackInfo(packId);
  const { meta, loading } = usePackMeta(packId);

  if (!info) {
    return (
      <div className="panel">
        <div className="figure-title">Unknown pack</div>
        <div className="site-subtitle">This pack is not registered.</div>
        <div style={{ marginTop: '0.75rem' }}>
          <Link href="/packs">Back to packs</Link>
        </div>
      </div>
    );
  }

  if (info.id === 'smyth_htw') {
    return (
      <div className="panel">
        <div className="figure-title">{info.title}</div>
        <div className="site-subtitle">This pack surfaces the HTW Smyth 2021 paper dashboard.</div>
        <div style={{ marginTop: '0.75rem' }}>
          <Link href="/">Open the HTW dashboard</Link>
        </div>
      </div>
    );
  }

  const badge =
    meta?.status === 'ready' || meta?.status === 'ok'
      ? 'Ready'
      : meta?.status === 'coming-soon' || isParked(info.id)
      ? 'Coming soon'
      : isEnrichment(info.id)
      ? 'Enrichment'
      : 'Waiting';
  const asOf =
    meta?.as_of && typeof meta.as_of === 'string' && meta.as_of.length > 0
      ? new Date(meta.as_of).toLocaleString()
      : null;

  const enrichmentNeeds = isEnrichment(info.id) && (!meta || (meta.status !== 'ready' && meta.status !== 'ok'));
  const isComingSoon = meta?.status === 'coming-soon' || isParked(info.id);
  const waiting = !meta && !isComingSoon && !enrichmentNeeds;

  return (
    <div className="stack" style={{ display: 'grid', gap: '1rem' }}>
      <div className="panel figure-card">
        <div className="figure-header">
          <div>
            <div className="figure-title">{info.title}</div>
            <div className="site-subtitle">
              {asOf ? `As of: ${asOf}` : 'Awaiting publication'}
            </div>
          </div>
          <span className="badge">{badge}</span>
        </div>

        {isComingSoon && (
          <div className="placeholder">Coming soon (parked)</div>
        )}
        {enrichmentNeeds && (
          <div className="placeholder">Needs weather/elevation overlays</div>
        )}
        {waiting && (
          <div className="placeholder">{loading ? 'Loading…' : 'Waiting for live pack data'}</div>
        )}
        {meta?.status === 'ready' && (
          <div className="placeholder">
            Pack is ready. Artifacts will render here once connected.
          </div>
        )}
      </div>

      <div className="panel">
        <Link href="/packs">Back to packs</Link>
      </div>
    </div>
  );
}
