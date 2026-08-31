'use client';
import React from 'react';
import { ResponsiveContainer, BarChart, XAxis, YAxis, Tooltip, Bar, CartesianGrid } from 'recharts';
import { ChartPlaceholder } from '@/components/FigureCard';
import type { Filters } from '@/lib/types';

export default function Fig5({
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

  if (!canRender) return <ChartPlaceholder note="HTW time/cost (minutes) distribution will appear here." />;

  return (
    <div className="chart" role="img" aria-label="Figure 5 chart">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={safeSeries}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2a3b" />
          <XAxis dataKey="name" stroke="#8b9bb4" />
          <YAxis stroke="#8b9bb4" />
          <Tooltip />
          <Bar dataKey="value" fill="#f1a13a" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
