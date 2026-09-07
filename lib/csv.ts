export type DataRow = Record<string, string | number | null>;

// Handles quoted commas, escaped quotes, CRLF, and quoted multiline fields.
export function parseCsv(text: string): DataRow[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;
  const input = text.replace(/^\uFEFF/, '');
  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    if (char === '"') {
      if (quoted && input[i + 1] === '"') { field += '"'; i++; }
      else quoted = !quoted;
    } else if (char === ',' && !quoted) {
      row.push(field); field = '';
    } else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && input[i + 1] === '\n') i++;
      row.push(field);
      if (row.some(value => value.trim() !== '')) rows.push(row);
      row = []; field = '';
    } else field += char;
  }
  row.push(field);
  if (row.some(value => value.trim() !== '')) rows.push(row);
  const headers = rows.shift()?.map(value => value.trim()) ?? [];
  return rows.map(values => Object.fromEntries(headers.map((header, i) => {
    const value = (values[i] ?? '').trim();
    if (!value || /^(nan|null|undefined)$/i.test(value)) return [header, null];
    const numeric = Number(value);
    return [header, Number.isFinite(numeric) ? numeric : value];
  })));
}

export function finite(value: unknown): number | null {
  if (value === null || value === undefined || (typeof value === 'string' && value.trim() === '')) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

export function formatNumber(value: number, unit = ''): string {
  if (unit === 'year') return String(Math.round(value));
  if (unit === 'min/km') {
    const seconds = Math.round(value * 60);
    return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}/km`;
  }
  if (unit === 'finish') {
    const minutes = Math.round(value);
    return `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, '0')}`;
  }
  const formatted = new Intl.NumberFormat('en-US', { maximumFractionDigits: unit === 'correlation' ? 2 : unit === 'runners' ? 0 : 1 }).format(value);
  return unit === '%' || unit === '% pace' ? `${formatted}%` : unit === 'runners' || unit === 'correlation' || !unit ? formatted : `${formatted} ${unit}`;
}
