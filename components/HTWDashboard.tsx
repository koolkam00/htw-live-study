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
import TableCard from '@/components/TableCard';
import T1 from '@/components/tables/T1';
import T2 from '@/components/tables/T2';
import T3 from '@/components/tables/T3';
import T4 from '@/components/tables/T4';
import { useLiveData } from '@/hooks/useLiveData';

function DashboardInner() {
  const { filters } = useFilters();
  const { data, status, loading, error } = useLiveData(60000);
  const isReady = status === 'ready';
  const corpus = (data?.corpus ?? { races: null, runners: null, records: null }) as any;
  const displayRaces = (corpus?.races ?? corpus?.n_races) ?? '—';
  const displayRunners = (corpus?.runners ?? corpus?.n_runners) ?? '—';
  const displayRecords = (corpus?.records ?? corpus?.n_records) ?? '—';

  return (
    <div className="stack" style={{ display: 'grid', gap: '1rem' }}>
      <div className="toolbar">
        <div className="panel">
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <div>
              <div className="site-title" style={{ gap: '0.5rem' }}>
                <span>Marathon Pacing Study</span>
              </div>
              <div className="site-subtitle">Sustained slowdown across recorded marathon finishes</div>
            </div>
            <div className="badge">{isReady ? 'Recorded marathon results' : 'Results not yet available'}</div>
          </div>
          <div style={{ marginTop: '0.75rem' }} className="stats" role="status">
            <div className="stat">
              <div className="label">Races</div>
              <div className="value">{displayRaces}</div>
            </div>
            <div className="stat">
              <div className="label">Runners</div>
              <div className="value">{displayRunners}</div>
            </div>
            <div className="stat">
              <div className="label">Records</div>
              <div className="value">{displayRecords}</div>
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
        <FigureCard
          title="Figure 1: Sustained slowdown frequency across thresholds"
          subtitle="Sensitivity analysis across slowdown and window thresholds"
          badge={isReady && data?.figures?.fig1 ? 'Live' : 'Waiting'}
        >
          <Fig1 status={isReady ? 'ready' : 'empty'} dataset={data?.figures?.fig1} filters={filters} />
        </FigureCard>

        <FigureCard
          title="Figure 2: Sustained slowdown by age and recorded ability"
          subtitle="Sex split available via filters"
          badge={isReady && data?.figures?.fig2 ? 'Live' : 'Waiting'}
        >
          <Fig2 status={isReady ? 'ready' : 'empty'} dataset={data?.figures?.fig2} filters={filters} />
        </FigureCard>

        <FigureCard
          title="Figure 3: Sustained slowdown before and after a recorded personal best"
          subtitle="Relationship to PB proximity"
          badge={isReady && data?.figures?.fig3 ? 'Live' : 'Waiting'}
        >
          <Fig3 status={isReady ? 'ready' : 'empty'} dataset={data?.figures?.fig3} filters={filters} />
        </FigureCard>

        <FigureCard
          title="Figure 4: Figure 3 split by age and ability"
          subtitle="PB proximity analysis stratified by age and ability"
          badge={isReady && data?.figures?.fig4 ? 'Live' : 'Waiting'}
        >
          <Fig4 status={isReady ? 'ready' : 'empty'} dataset={data?.figures?.fig4} filters={filters} />
        </FigureCard>

        <FigureCard
          title="Figure 5: Slowdown onset, distance, and severity by age and recorded ability"
          subtitle="Distribution of onset, duration, and slowdown degree"
          badge={isReady && data?.figures?.fig5 ? 'Live' : 'Waiting'}
        >
          <Fig5 status={isReady ? 'ready' : 'empty'} dataset={data?.figures?.fig5} filters={filters} />
        </FigureCard>

        <FigureCard
          title="Figure 6: Finish times and estimated slowdown costs by age and recorded ability"
          subtitle="Descriptive estimates of time associated with slowing"
          badge={isReady && data?.figures?.fig6 ? 'Live' : 'Waiting'}
        >
          <Fig6 status={isReady ? 'ready' : 'empty'} dataset={data?.figures?.fig6} filters={filters} />
        </FigureCard>
      </div>

      <div className="grid">
        <TableCard
          title="Table 1: Original × city/race"
          subtitle="Original sample breakdown by city/race"
          badge={isReady && data?.tables?.t1 ? 'Live' : 'Waiting'}
        >
          <T1 status={isReady ? 'ready' : 'empty'} dataset={data?.tables?.t1} filters={filters} />
        </TableCard>

        <TableCard
          title="Table 2: Repeaters × city/race"
          subtitle="Repeaters sample breakdown by city/race"
          badge={isReady && data?.tables?.t2 ? 'Live' : 'Waiting'}
        >
          <T2 status={isReady ? 'ready' : 'empty'} dataset={data?.tables?.t2} filters={filters} />
        </TableCard>

        <TableCard
          title="Table 3: Original × age×sex"
          subtitle="Original sample breakdown by age and sex"
          badge={isReady && data?.tables?.t3 ? 'Live' : 'Waiting'}
        >
          <T3 status={isReady ? 'ready' : 'empty'} dataset={data?.tables?.t3} filters={filters} />
        </TableCard>

        <TableCard
          title="Table 4: Repeaters × age×sex"
          subtitle="Repeaters sample breakdown by age and sex"
          badge={isReady && data?.tables?.t4 ? 'Live' : 'Waiting'}
        >
          <T4 status={isReady ? 'ready' : 'empty'} dataset={data?.tables?.t4} filters={filters} />
        </TableCard>
      </div>
    </div>
  );
}

export default function HTWDashboard() {
  return (
    <FiltersProvider>
      <DashboardInner />
    </FiltersProvider>
  );
}
