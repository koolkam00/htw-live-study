'use client';
import { useId, useState } from 'react';
import type { ChartSpec } from '@/lib/research-data';
import { resolveSelection } from '@/lib/chart-selection';
import QuestionViz from './QuestionViz';

export default function QuestionCharts({ charts, sharedCourse = false }: { charts: ChartSpec[]; sharedCourse?: boolean }) {
  const id = useId();
  const [selection, setSelection] = useState(() => charts[0] ? resolveSelection(charts[0]) : {});
  const share = sharedCourse && charts.length > 1 && charts.every(chart => chart.filters?.some(filter => filter.key === 'city'));
  const cities = share ? [...new Set(charts[0].rows.map(row => String(row.city)))].sort() : [];
  return <>
    {share && <div className="chart-controls"><label htmlFor={`${id}-course`}>Course<select id={`${id}-course`} value={selection.city} onChange={event => setSelection({ city: event.target.value })}>{cities.map(city => <option key={city}>{city}</option>)}</select></label></div>}
    {charts.map((spec, i) => <QuestionViz key={i} spec={spec} selection={share ? selection : undefined} />)}
  </>;
}
