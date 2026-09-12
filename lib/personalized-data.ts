import fs from 'node:fs';
import release from '../analysis/release.json';
import path from 'node:path';
import type { PersonalSummary } from './personalized-types';

const folder = path.join(process.cwd(), 'public/data/packs/ext_personalized_guide');
export function getPersonalSummary(): PersonalSummary | null {
  const file = path.join(folder, 'summary.json');
  if (!fs.existsSync(file)) return null;
  const data = JSON.parse(fs.readFileSync(file, 'utf8')) as PersonalSummary;
  if (data.schema_version !== 1 || data.analyses !== 12 || data.pack_id !== 'ext_personalized_guide' || !data.cities.length) throw new Error('Invalid personalized guide summary');
  if (data.export_id !== release.tag.replace('private-export-', 'private-')) throw new Error('Personalized data must match the current release');
  return data;
}
export function getPersonalMethod(): string[] {
  const file = path.join(folder, 'pack_meta.json');
  return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')).methodology_prose : [];
}
