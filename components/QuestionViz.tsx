'use client';

import { useId, useMemo, useState } from 'react';
import { ResponsiveContainer, ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from 'recharts';
import { finite, formatNumber, type DataRow } from '@/lib/csv';
import type { ChartSpec } from '@/lib/research-data';
import { filterOptions, resolveSelection } from '@/lib/chart-selection';
import { sectionLabel } from '@/lib/section-labels';

const COLORS = ['#0758c7', '#ad492e', '#526078'];

export default function QuestionViz({ spec, selection }: { spec: ChartSpec; selection?: Record<string, string> }) {
  const id = useId();
  const filters = spec.filters || [];
  const [localSelection, setSelected] = useState<Record<string, string>>(() => resolveSelection(spec));
  const selected = selection || localSelection;
  const rows = useMemo(() => spec.rows.filter(row =>
    filters.every(filter => String(row[filter.key] ?? '') === selected[filter.key])
  ), [spec.rows, selected, spec.filters]);
  const allValues = rows.flatMap(row => spec.series.map(series => finite(row[series.key]))).filter((value): value is number => value !== null);
  const signed = allValues.some(value => value < 0);
  const max = spec.unit === '%' ? Math.max(100, ...allValues) : spec.unit === 'correlation' ? 1 : Math.max(1, ...allValues.map(Math.abs));
  const hasCounts = rows.some(row => spec.series.some(series => finite(row[`n_${series.key}`]) !== null));
  const countSeries = spec.series.filter(series => rows.some(row => finite(row[`n_${series.key}`]) !== null));
  const sharedCounts = countSeries.length > 1 && rows.every(row => countSeries.every(series => row[`n_${series.key}`] === row[`n_${countSeries[0].key}`]));
  const displayedCounts = sharedCounts ? countSeries.slice(0, 1) : countSeries;
  const samples = [...new Set(rows.flatMap(row => countSeries.map(series => finite(row[`n_${series.key}`]))).filter((n): n is number => n !== null))];
  const editions = [...new Set(rows.map(row => finite(row.editions)).filter((n): n is number => n !== null))];
  const cities = [...new Set(rows.map(row => finite(row.cities)).filter((n): n is number => n !== null))];
  const partialRows = (spec.partialRows || []).filter(row => filters.every(filter => String(row[filter.key] ?? '') === selected[filter.key]));
  const tableRows: DataRow[] = rows.map(row => {
    const partial = partialRows.find(candidate => candidate.label === row.label);
    return partial ? { ...partial, label: `${row.label} (small sample; omitted from trend)` } : row;
  });
  const chartRows = spec.band ? rows.map(row => ({ ...row, interval: [row[spec.band!.lower], row[spec.band!.upper]] })) : rows;
  const value = (number: unknown) => {
    const n = finite(number);
    return n === null ? 'Not available' : formatNumber(n, spec.unit);
  };
  const label = (v: unknown) => spec.sectionEnds ? sectionLabel(v, spec.sectionEnds) : spec.xUnit && typeof v === 'number' ? formatNumber(v, spec.xUnit) : String(v ?? 'Not recorded');
  const axisValue = (v: unknown) => {
    const n = finite(v);
    if (n === null) return String(v);
    if (spec.unit === '%' || spec.unit === '% pace' || spec.unit === '% change' || spec.unit === 'finish' || spec.unit === 'min/km') return formatNumber(n, spec.unit);
    return formatNumber(n);
  };
  const units: Record<string, string> = {
    '%': 'Percent (%)', '% pace': 'Pace difference (%) · higher is slower', '% change': 'Finish-time change (%) · below zero is faster', 'finish': 'Finish time (hours:minutes)', 'min/km': 'Pace (minutes:seconds per km)',
    'min': 'Minutes', 'runners': 'Number of finishes', 'correlation': 'Correlation, from −1 to 1', 'sec/km': 'Change in seconds per kilometer',
  };

  return (
    <figure className="study-figure" aria-labelledby={`${id}-title`}>
      <h3 id={`${id}-title`} className="chart-title">{spec.title}</h3>
      <p className="chart-unit">{units[spec.unit] || spec.unit}</p>
      {spec.sectionEnds && <p className="study-meta">Each point averages the preceding section: 40 km means 35–40 km. The last point covers 40–42.195 km. Connecting lines do not locate a change within a section.</p>}
      {filters.length > 0 && !selection && <div className="chart-controls">
        {filters.map((filter, index) => {
          const options = filterOptions(spec, index, selected);
          return <label key={filter.key} htmlFor={`${id}-${filter.key}`}>
            {filter.label}
            <select id={`${id}-${filter.key}`} value={selected[filter.key]} onChange={event => setSelected(current => resolveSelection(spec, { ...current, [filter.key]: event.target.value }))}>
              {options.map(option => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>;
        })}
      </div>}
      {samples.length > 0 && <p className="study-meta chart-sample" aria-live="polite">{samples.length === 1 ? `${formatNumber(samples[0], 'runners')} observations in this selection` : `${formatNumber(Math.min(...samples), 'runners')}–${formatNumber(Math.max(...samples), 'runners')} observations per plotted group`}{editions.length === 1 ? ` · ${editions[0]} represented editions` : ''}. {spec.coverageNote}</p>}
      {cities.length > 0 && <p className="study-meta">{cities.length === 1 ? cities[0] : `${Math.min(...cities)}–${Math.max(...cities)}`} contributing {cities.length === 1 && cities[0] === 1 ? 'city' : 'cities'} per comparison. This limited coverage should not be generalized to all marathons.</p>}
      {partialRows.length > 0 && <p className="study-meta guide-widened">Small-sample editions are omitted from the trend: {partialRows.map(row => `${row.label} (${formatNumber(Number(row[`n_${spec.series[0].key}`]), 'runners')} finishes)`).join(', ')}. Each has fewer than 25% of this city’s median eligible edition count. This flags possible partial coverage; it does not verify field completeness.</p>}
      {spec.kind === 'range' && <p className="study-meta">The band spans the 10th–90th percentiles; the dark marker is the median. The center reference is zero change.</p>}
      {spec.series.length > 1 && spec.kind !== 'range' && <div className="chart-legend" aria-label="Chart legend">
        {spec.series.map((series, i) => <span key={series.key} className={`chart-key ${spec.kind === 'line' && i === 1 ? 'dashed' : ''} ${spec.band && i > 0 ? 'band-edge' : ''}`} style={{ '--series-color': spec.band && i > 0 ? '#0758c7' : COLORS[i % COLORS.length] } as React.CSSProperties}>{series.label}</span>)}
      </div>}
      {!allValues.length ? <p className="answer-state" role="status">No published values for this selection.</p>
        : spec.kind === 'line' ? <div className="chart">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <ComposedChart data={chartRows} margin={{ top: 20, right: 16, bottom: 24, left: 0 }} accessibilityLayer aria-label={`${spec.title}, line chart`} aria-describedby={`${id}-description`}>
              <CartesianGrid vertical={false} stroke="#dfe5ee" />
              <XAxis dataKey="label" type={spec.xNumeric ? 'number' : 'category'} domain={spec.xNumeric ? ['dataMin', 'dataMax'] : undefined} ticks={spec.sectionEnds ? [10, 20, 30, 40].filter(km => spec.sectionEnds!.includes(km)) : undefined} interval={spec.sectionEnds ? 0 : 'preserveStartEnd'} tickCount={5} tickLine={false} axisLine={false} minTickGap={20} tick={{ fontSize: 14, fill: '#526078' }} tickFormatter={v => typeof v === 'number' ? formatNumber(v, spec.xUnit) : String(v)} label={{ value: spec.xLabel, position: 'insideBottom', offset: -18, fontSize: 14, fill: '#526078' }} />
              <YAxis width={58} tickLine={false} axisLine={false} tick={{ fontSize: 14, fill: '#526078' }} tickFormatter={axisValue} domain={signed || spec.unit === 'min/km' ? ['auto', 'auto'] : [0, 'auto']} />
              {signed && <ReferenceLine y={0} stroke="#526078" />}
              {spec.band && <Area type="linear" dataKey="interval" stroke="none" fill="#0758c7" fillOpacity={0.12} tooltipType="none" isAnimationActive={false} />}
              <Tooltip formatter={v => value(v)} labelFormatter={v => spec.sectionEnds ? `Average over ${label(v)}` : `${spec.xLabel}: ${label(v)}`} contentStyle={{ fontSize: 14, border: '1px solid #dfe5ee', borderRadius: 4, maxWidth: 250 }} />
              {spec.series.map((series, i) => <Line key={series.key} dataKey={series.key} name={series.label} stroke={spec.band && i > 0 ? '#0758c7' : COLORS[i % COLORS.length]} strokeOpacity={spec.band && i > 0 ? 0.35 : 1} strokeWidth={spec.band && i > 0 ? 1 : 2.5} strokeDasharray={i === 1 ? '6 4' : undefined} type="linear" dot={spec.band && i > 0 ? false : { r: 3 }} activeDot={{ r: 5 }} connectNulls={false} isAnimationActive={false} />)}
            </ComposedChart>
          </ResponsiveContainer>
        </div> : spec.kind === 'range' ? <div className="range-chart">
          {rows.map((row, i) => {
            const low = Number(row.low), mid = Number(row.value), high = Number(row.high);
            const position = (n: number) => 50 + n / max * 50;
            return <div className="range-item" key={i}><strong>{label(row.label)}</strong><div className="range-track" aria-hidden="true"><span className="range-interval" style={{ left: `${position(low)}%`, width: `${(high - low) / max * 50}%` }} /><span className="range-median" style={{ left: `${position(mid)}%` }} /></div><p className="study-meta">{value(low)} to {value(high)} · median <strong>{value(mid)}</strong></p></div>;
          })}
        </div> : spec.kind === 'paired' ? <div className="paired-chart"><p className="study-meta">Left of zero: less time than the even-pace budget. Right: more time.</p>{rows.map((row, i) => <div className="paired-item" key={i}><strong>{label(row.label)}</strong><div className="paired-tracks" aria-hidden="true">{spec.series.map((series, index) => {
          const n = Number(row[series.key]);
          return <div className="paired-track" key={series.key}><span style={{ background: COLORS[index % COLORS.length], left: `${50 + Math.min(0, n) / max * 50}%`, width: `${Math.abs(n) / max * 50}%` }} /></div>;
        })}</div><p className="paired-values">{spec.series.map((series, index) => <span key={series.key} style={{ color: COLORS[index % COLORS.length] }}>{series.key === 'below' ? 'Below' : series.key === 'above' ? 'Above' : series.label}: {value(row[series.key])}</span>)}</p></div>)}</div> : <div className="bars">
          {rows.map((row, i) => <div className="bar-item" key={`${row.label}-${i}`}>
            <div className="bar-label"><span>{label(row.label)}</span>{spec.series.length === 1 && <strong>{value(row[spec.series[0].key])}</strong>}</div>
            {spec.series.map((series, index) => {
              const n = finite(row[series.key]);
              return <div key={series.key}>
                {spec.series.length > 1 && <div className="bar-label"><span style={{ color: COLORS[index % COLORS.length] }}>{series.label}</span><strong>{value(n)}</strong></div>}
                {n !== null && <div className={`bar-track ${signed ? 'signed-track' : ''}`} aria-hidden="true"><div className="bar-fill" style={{ width: `${Math.abs(n) / max * (signed ? 50 : 100)}%`, marginLeft: signed ? `${n < 0 ? 50 - Math.abs(n) / max * 50 : 50}%` : undefined, background: COLORS[index % COLORS.length] }} /></div>}
              </div>;
            })}
          </div>)}
        </div>}
      <figcaption id={`${id}-description`}>{spec.note || `${spec.title}. Exact values and sample sizes are available below.`}</figcaption>
      <details className="table-disclosure">
        <summary>View exact values{hasCounts ? ' and sample sizes' : ''}</summary>
        <div className="table-scroll" role="region" aria-label={`Values for ${spec.title}`} tabIndex={0}>
          <table className="data-table readable-values">
            <thead><tr><th scope="col">{spec.sectionEnds ? 'Course section' : spec.xLabel}</th>{spec.series.map(series => <th scope="col" key={series.key}>{series.label}</th>)}{displayedCounts.map(series => <th scope="col" key={`n-${series.key}`}>{displayedCounts.length > 1 ? `${series.label}: ` : ''}Observations</th>)}</tr></thead>
            <tbody>{tableRows.map((row, index) => <tr key={index}><th scope="row">{label(row.label)}</th>{spec.series.map(series => <td data-label={series.label} key={series.key}>{value(row[series.key])}</td>)}{displayedCounts.map(series => <td data-label={`${displayedCounts.length > 1 ? `${series.label}: ` : ''}Observations`} key={`n-${series.key}`}>{finite(row[`n_${series.key}`]) === null ? 'Not available' : formatNumber(Number(row[`n_${series.key}`]), 'runners')}</td>)}</tr>)}</tbody>
          </table>
        </div>
      </details>
    </figure>
  );
}
