'use client';
import React from 'react';

export function ChartPlaceholder({ note }: { note?: string }) {
  return (
    <div className="placeholder" role="status" aria-live="polite">
      <div>
        <div style={{ marginBottom: '0.25rem' }}>No live data available</div>
        <div style={{ fontSize: '0.85rem' }}>{note ?? 'Figures update automatically when data arrives.'}</div>
      </div>
    </div>
  );
}

export default function FigureCard({
  title,
  subtitle,
  children,
  badge,
}: {
  title: string;
  subtitle?: string;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="panel figure-card">
      <div className="figure-header">
        <div>
          <div className="figure-title">{title}</div>
          {subtitle && <div className="site-subtitle">{subtitle}</div>}
        </div>
        {badge && <span className="badge">{badge}</span>}
      </div>
      {children}
    </div>
  );
}
