import fs from 'node:fs';
import path from 'node:path';
import type { PersonalSummary } from './personalized-types';

const folder = path.join(process.cwd(), 'public/data/packs/ext_personalized_guide');
export function getPersonalSummary(): PersonalSummary | null {
  const prepared = path.join(process.cwd(), 'public/data/guide/manifest.json');
  const file = path.join(folder, 'summary.json');
  if (!fs.existsSync(file)) return null;
  const source = JSON.parse(fs.readFileSync(file, 'utf8')) as PersonalSummary;
  const candidate = fs.existsSync(prepared) ? JSON.parse(fs.readFileSync(prepared, 'utf8')) as PersonalSummary : null;
  const data = candidate?.as_of === source.as_of && candidate?.export_id === source.export_id ? candidate : source;
  if (data.schema_version !== 1 || data.analyses !== 12 || data.pack_id !== 'ext_personalized_guide' || !data.cities.length) throw new Error('Invalid personalized guide summary');
  return data;
}
export function getPersonalMethod(): string[] {
  const file = path.join(folder, 'pack_meta.json');
  return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')).methodology_prose : [];
}
