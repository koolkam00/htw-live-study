'use client';

import { useId, useMemo, useState } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from 'recharts';
import { finite, formatNumber } from '@/lib/csv';
import type { ChartSpec } from '@/lib/research-data';

const COLORS = ['#0758c7', '#ad492e', '#526078'];

export default function QuestionViz({ spec }: { spec: ChartSpec }) {
  const id = useId();
  const filters = spec.filters || [];
  const [selected, setSelected] = useState<Record<string, string>>(() => Object.fromEntries(filters.map(filter => {
    const options = [...new Set(spec.rows.map(row => String(row[filter.key] ?? '')))].filter(Boolean);
    return [filter.key, filter.preferred && options.includes(filter.preferred) ? filter.preferred : options[0] || ''];
  })));
  const rows = useMemo(() => spec.rows.filter(row =>
    filters.every(filter => String(row[filter.key] ?? '') === selected[filter.key])
  ), [spec.rows, selected, spec.filters]);
  const allValues = rows.flatMap(row => spec.series.map(series => finite(row[series.key]))).filter((value): value is number => value !== null);
  const signed = allValues.some(value => value < 0);
  const max = spec.unit === '%' ? Math.max(100, ...allValues) : spec.unit === 'correlation' ? 1 : Math.max(1, ...allValues.map(Math.abs));
  const hasCounts = rows.some(row => spec.series.some(series => finite(row[`n_${series.key}`]) !== null));
  const value = (number: unknown) => {
    const n = finite(number);
    return n === null ? 'Not available' : formatNumber(n, spec.unit);
  };
  const label = (v: unknown) => spec.xUnit && typeof v === 'number' ? formatNumber(v, spec.xUnit) : String(v ?? 'Not recorded');
  const axisValue = (v: unknown) => {
    const n = finite(v);
    if (n === null) return String(v);
    if (spec.unit === '%' || spec.unit === '% pace' || spec.unit === 'finish' || spec.unit === 'min/km') return formatNumber(n, spec.unit);
    return formatNumber(n);
  };
  const units: Record<string, string> = {
    '%': 'Percent (%)', '% pace': 'Pace difference (%) · below zero is faster', 'finish': 'Finish time (hours:minutes)', 'min/km': 'Pace (minutes:seconds per km)',
    'min': 'Minutes', 'runners': 'Number of finishes', 'correlation': 'Correlation, from 0 to 1', 'sec/km': 'Change in seconds per kilometer',
  };

  return (
    <figure className="study-figure" aria-labelledby={`${id}-title`}>
      <h3 id={`${id}-title`} className="chart-title">{spec.title}</h3>
      <p className="chart-unit">{units[spec.unit] || spec.unit}</p>
      {filters.length > 0 && <div className="chart-controls">
        {filters.map(filter => {
          const options = [...new Set(spec.rows.map(row => String(row[filter.key] ?? '')))].filter(Boolean);
          return <label key={filter.key} htmlFor={`${id}-${filter.key}`}>
            {filter.label}
            <select id={`${id}-${filter.key}`} value={selected[filter.key]} onChange={event => setSelected(current => ({ ...current, [filter.key]: event.target.value }))}>
              {options.map(option => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>;
        })}
      </div>}
      {spec.series.length > 1 && <div className="chart-legend" aria-label="Chart legend">
        {spec.series.map((series, i) => <span key={series.key} className={`chart-key ${spec.kind === 'line' && i === 1 ? 'dashed' : ''}`} style={{ '--series-color': COLORS[i % COLORS.length] } as React.CSSProperties}>{series.label}</span>)}
      </div>}
      {!allValues.length ? <p className="answer-state" role="status">No published values for this selection.</p>
        : spec.kind === 'line' ? <div className="chart">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <LineChart data={rows} margin={{ top: 20, right: 16, bottom: 24, left: 0 }} accessibilityLayer>
              <CartesianGrid vertical={false} stroke="#dfe5ee" />
              <XAxis dataKey="label" type={spec.xNumeric ? 'number' : 'category'} domain={spec.xNumeric ? ['dataMin', 'dataMax'] : undefined} tickCount={5} tickLine={false} axisLine={false} minTickGap={28} tick={{ fontSize: 14, fill: '#526078' }} tickFormatter={v => typeof v === 'number' ? formatNumber(v, spec.xUnit) : String(v)} label={{ value: spec.xLabel, position: 'insideBottom', offset: -18, fontSize: 14, fill: '#526078' }} />
              <YAxis width={58} tickLine={false} axisLine={false} tick={{ fontSize: 14, fill: '#526078' }} tickFormatter={axisValue} domain={signed ? ['auto', 'auto'] : [0, 'auto']} />
              {signed && <ReferenceLine y={0} stroke="#526078" />}
              <Tooltip formatter={v => value(v)} labelFormatter={v => `${spec.xLabel}: ${label(v)}`} contentStyle={{ fontSize: 14, border: '1px solid #dfe5ee', borderRadius: 4, maxWidth: 250 }} />
              {spec.series.map((series, i) => <Line key={series.key} dataKey={series.key} name={series.label} stroke={COLORS[i % COLORS.length]} strokeWidth={2.5} strokeDasharray={i === 1 ? '6 4' : undefined} type="linear" dot={{ r: 3 }} activeDot={{ r: 5 }} connectNulls={false} isAnimationActive={false} />)}
            </LineChart>
          </ResponsiveContainer>
        </div> : <div className="bars">
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
      {spec.note && <figcaption>{spec.note}</figcaption>}
      <details className="table-disclosure">
        <summary>View exact values{hasCounts ? ' and sample sizes' : ''}</summary>
        <div className="table-scroll" role="region" aria-label={`Values for ${spec.title}`} tabIndex={0}>
          <table className="data-table">
            <thead><tr><th scope="col">{spec.xLabel}</th>{spec.series.map(series => <th scope="col" key={series.key}>{series.label}</th>)}{hasCounts && spec.series.map(series => <th scope="col" key={`n-${series.key}`}>{spec.series.length > 1 ? `${series.label}: ` : ''}Observations</th>)}</tr></thead>
            <tbody>{rows.map((row, index) => <tr key={index}><th scope="row">{label(row.label)}</th>{spec.series.map(series => <td key={series.key}>{value(row[series.key])}</td>)}{hasCounts && spec.series.map(series => <td key={`n-${series.key}`}>{finite(row[`n_${series.key}`]) === null ? 'Not available' : formatNumber(Number(row[`n_${series.key}`]), 'runners')}</td>)}</tr>)}</tbody>
          </table>
        </div>
      </details>
    </figure>
  );
}
