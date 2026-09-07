'use client';
import { useEffect, useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '';

type CsvTable = {
  headers: string[];
  rows: string[][];
};

function tryParseNumber(value: string): number | null {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function parseCsv(text: string): CsvTable {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (!lines.length) return { headers: [], rows: [] };
  const headers = lines[0].split(',').map((h) => h.trim());
  const rows = lines.slice(1).map((line) => line.split(',').map((c) => c.trim()));
  return { headers, rows };
}

function coerceRowsToObjects(headers: string[], rows: string[][]): Record<string, any>[] {
  return rows.map((r) => {
    const obj: Record<string, any> = {};
    headers.forEach((h, i) => {
      const v = r[i] ?? '';
      const num = tryParseNumber(v);
      obj[h] = num === null ? v : num;
    });
    return obj;
  });
}

function pickColumns(headers: string[]) {
  // Prefer typical Y keys for proportions/rates/values
  const yPrefs = ['pct', 'rate', 'proportion', 'value', 'mean', 'avg'];
  const xPrefs = ['km', 'bin', 'bucket', 'threshold', 'x', 'distance', 'year', 'ability', 'age'];
  const lower = headers.map((h) => h.toLowerCase());
  let yKey: string | null = null;
  for (const pref of yPrefs) {
    const idx = lower.indexOf(pref);
    if (idx !== -1) {
      yKey = headers[idx];
      break;
    }
  }
  // If no obvious y, take the first numeric-looking non-categorical header
  if (!yKey) {
    // Heuristic: headers named 'n', 'count' are large counts — avoid as default y if we can
    for (const h of headers) {
      const hl = h.toLowerCase();
      if (hl === 'n' || hl === 'count' || hl.includes('id')) continue;
      yKey = h;
      break;
    }
  }
  // X key
  let xKey: string | null = null;
  for (const pref of xPrefs) {
    const idx = lower.indexOf(pref);
    if (idx !== -1) {
      xKey = headers[idx];
      break;
    }
  }
  if (!xKey) {
    // Fallback: pick first header that is not yKey and not clearly meta
    for (const h of headers) {
      if (h !== yKey && !/^sex$/i.test(h) && !/^(city|race|name)$/i.test(h)) {
        xKey = h;
        break;
      }
    }
  }
  // Ultimate fallback: xKey is first header, yKey is second header
  if (!xKey && headers.length >= 1) xKey = headers[0];
  if (!yKey && headers.length >= 2) yKey = headers[1];
  return { xKey, yKey };
}

export default function QuestionViz({
  packId,
  csvPaths,
  height = 280,
}: {
  packId: string;
  csvPaths: string[];
  height?: number;
}) {
  const [table, setTable] = useState<CsvTable | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Choose the first CSV path available
  const chosenCsv = useMemo(() => {
    return csvPaths.find((p) => p.toLowerCase().endsWith('.csv')) || null;
  }, [csvPaths]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setError(null);
      setTable(null);
      if (!chosenCsv) return;
      try {
        const url = `${BASE_PATH}/data/packs/${packId}/${chosenCsv.replace(/^\.\//, '')}`;
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) throw new Error(`Failed to load ${chosenCsv} (${res.status})`);
        const text = await res.text();
        const parsed = parseCsv(text);
        if (!cancelled) setTable(parsed);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Failed to load CSV');
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [packId, chosenCsv]);

  if (!chosenCsv) {
    return <div className="placeholder">Visualization pending — tables linked</div>;
  }

  if (error) {
    return <div className="placeholder">{error}</div>;
  }

  if (!table || !table.headers.length || !table.rows.length) {
    return <div className="placeholder">Loading…</div>;
  }

  const { xKey, yKey } = pickColumns(table.headers);
  const data = coerceRowsToObjects(table.headers, table.rows).slice(0, 500);
  const xIsNumber = typeof data[0]?.[xKey as string] === 'number';
  const yIsNumber = typeof data[0]?.[yKey as string] === 'number';

  if (!xKey || !yKey || !yIsNumber) {
    // Fallback: show a small table snippet
    return (
      <div style={{ overflowX: 'auto' }}>
        <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
          <thead>
            <tr>
              {table.headers.map((h) => (
                <th key={h} style={{ textAlign: 'left', borderBottom: '1px solid #ccc', padding: '0.35rem 0.5rem' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.slice(0, 12).map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => (
                  <td key={j} style={{ padding: '0.35rem 0.5rem', borderBottom: '1px solid #eee' }}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {table.rows.length > 12 && (
          <div className="site-subtitle" style={{ marginTop: '0.5rem' }}>
            Showing first 12 of {table.rows.length} rows
          </div>
        )}
      </div>
    );
  }

  // Prefer a simple AreaChart for smoother density-like visuals when x numeric; else BarChart
  const ChartComponent = xIsNumber ? AreaChart : BarChart;

  return (
    <div className="chart" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        {xIsNumber ? (
          <AreaChart data={data} margin={{ top: 8, right: 12, bottom: 8, left: 0 }}>
            <defs>
              <linearGradient id="vizColor" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3da9fc" stopOpacity={0.7} />
                <stop offset="95%" stopColor="#3da9fc" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#223047" />
            <XAxis dataKey={xKey!} tick={{ fill: '#8b9bb4' }} />
            <YAxis tick={{ fill: '#8b9bb4' }} />
            <Tooltip />
            <Area type="monotone" dataKey={yKey!} stroke="#3da9fc" fill="url(#vizColor)" />
          </AreaChart>
        ) : (
          <BarChart data={data} margin={{ top: 8, right: 12, bottom: 8, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#223047" />
            <XAxis dataKey={xKey!} tick={{ fill: '#8b9bb4' }} interval={0} angle={-20} textAnchor="end" height={50} />
            <YAxis tick={{ fill: '#8b9bb4' }} />
            <Tooltip />
            <Bar dataKey={yKey!} fill="#3da9fc" />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}

