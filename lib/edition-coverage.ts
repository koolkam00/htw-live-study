import { finite, type DataRow } from './csv';

// Sample-size screen, not a claim that any remaining edition is complete.
export function screenEditions(rows: DataRow[], countKey: string) {
  const counts = rows.map(row => finite(row[countKey])).filter((n): n is number => n !== null && n > 0).sort((a, b) => a - b);
  if (!counts.length) return { typical: 0, partial: [] as DataRow[], retained: rows };
  const mid = Math.floor(counts.length / 2);
  const typical = counts.length % 2 ? counts[mid] : (counts[mid - 1] + counts[mid]) / 2;
  return { typical, partial: rows.filter(row => Number(row[countKey]) < typical * .25), retained: rows.filter(row => Number(row[countKey]) >= typical * .25) };
}
