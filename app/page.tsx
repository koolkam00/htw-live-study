'use client';
import { FiltersProvider, useFilters } from '@/context/FiltersContext';
import FiltersBar from '@/components/FiltersBar';
import FigureCard from '@/components/FigureCard';
import Fig1 from '@/components/charts/Fig1';
import Fig2 from '@/components/charts/Fig2';
import Fig3 from '@/components/charts/Fig3';
import Fig4 from '@/components/charts/Fig4';
import Fig5 from '@/components/charts/Fig5';
import Fig6 from '@/components/charts/Fig6';
import { useLiveData } from '@/hooks/useLiveData';

function Dashboard() {
  const { filters } = useFilters();
  const { data, status, loading, error } = useLiveData(60000);
  const asOf =
    data?.as_of && typeof data.as_of === 'string' && data.as_of.length > 0
      ? new Date(data.as_of).toLocaleString()
      : '—';
  const corpus = data?.corpus ?? { races: null, runners: null, records: null };

  return (
    <div className="stack" style={{ display: 'grid', gap: '1rem' }}>
      <div className="toolbar">
        <div className="panel">
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <div>
              <div className="site-title" style={{ gap: '0.5rem' }}>
                <span>How recreational marathon runners hit the wall</span>
              </div>
              <div className="site-subtitle">Smyth 2021 (PLOS ONE) — live-study recreation</div>
            </div>
            <div className="badge">As of: {asOf}</div>
          </div>
          <div style={{ marginTop: '0.75rem' }} className="stats" role="status">
            <div className="stat">
              <div className="label">Races</div>
              <div className="value">{corpus.races ?? '—'}</div>
            </div>
            <div className="stat">
              <div className="label">Runners</div>
              <div className="value">{corpus.runners ?? '—'}</div>
            </div>
            <div className="stat">
              <div className="label">Records</div>
              <div className="value">{corpus.records ?? '—'}</div>
            </div>
          </div>
          {status !== 'ready' && (
            <div className="site-subtitle" style={{ marginTop: '0.5rem' }}>
              {loading ? 'Loading…' : error ? `Error: ${error}` : 'No live data yet. Figures will render when data is available.'}
            </div>
          )}
        </div>
        <FiltersBar />
      </div>

      <div className="grid">
        <FigureCard title="Figure 1: HTW proportion" subtitle="by age group and ability" badge="Live">
          <Fig1 status={status === 'ready' ? 'ready' : 'empty'} dataset={data?.figures?.fig1} filters={filters} />
        </FigureCard>

        <FigureCard title="Figure 2: HTW vs. PB proximity" subtitle="years around personal best" badge="Live">
          <Fig2 status={status === 'ready' ? 'ready' : 'empty'} dataset={data?.figures?.fig2} filters={filters} />
        </FigureCard>

        <FigureCard title="Figure 3: HTW start distance" subtitle="km after 20km" badge="Live">
          <Fig3 status={status === 'ready' ? 'ready' : 'empty'} dataset={data?.figures?.fig3} filters={filters} />
        </FigureCard>

        <FigureCard title="Figure 4: HTW slowdown degree" subtitle="percentage slowdown" badge="Live">
          <Fig4 status={status === 'ready' ? 'ready' : 'empty'} dataset={data?.figures?.fig4} filters={filters} />
        </FigureCard>

        <FigureCard title="Figure 5: HTW time cost" subtitle="minutes lost" badge="Live">
          <Fig5 status={status === 'ready' ? 'ready' : 'empty'} dataset={data?.figures?.fig5} filters={filters} />
        </FigureCard>

        <FigureCard title="Figure 6: Cost vs. slowdown" subtitle="relationship between time cost and slowdown" badge="Live">
          <Fig6 status={status === 'ready' ? 'ready' : 'empty'} dataset={data?.figures?.fig6} filters={filters} />
        </FigureCard>
      </div>

      <div className="panel" role="note">
        <div className="site-subtitle">
          Any 2021 paper redraws, if added for context, will be labeled “2021 published”. Live figures never use the paper’s static numbers.
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <FiltersProvider>
      <Dashboard />
    </FiltersProvider>
  );
}
