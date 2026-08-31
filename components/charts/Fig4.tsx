'use client';
import React from 'react';
import { ResponsiveContainer, LineChart, XAxis, YAxis, Tooltip, Line, CartesianGrid } from 'recharts';
import { ChartPlaceholder } from '@/components/FigureCard';
import type { Filters } from '@/lib/types';

export default function Fig4({
  status,
  dataset,
  filters,
}: {
  status: 'empty' | 'ready';
  dataset?: any;
  filters: Filters;
}) {
  const safeSeries: Array<{ name: string; value: number }> =
    Array.isArray(dataset?.series) ? dataset.series : [];
  const canRender = status === 'ready' && safeSeries.length > 0;

  if (!canRender) return <ChartPlaceholder note="Figure 3 split by age and ability will appear here." />;

  return (
    <div className="chart" role="img" aria-label="Figure 4 chart">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={safeSeries}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2a3b" />
          <XAxis dataKey="name" stroke="#8b9bb4" />
          <YAxis stroke="#8b9bb4" />
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke="#59d38c" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
