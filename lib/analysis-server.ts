import fs from 'node:fs';
import path from 'node:path';
import { getPersonalSummary } from './personalized-data';
import { buildGuide } from './personalized';
import { EXAMPLE_PROFILE } from './analysis-profile';
import type { CityData } from './personalized-types';

export function getAnalysisStart() {
  const summary = getPersonalSummary();
  if (!summary) throw new Error('The analysis summary is missing.');
  const city = summary.cities.find(row => row.city === EXAMPLE_PROFILE.city);
  if (!city) throw new Error('The all-course comparison is missing.');
  const data = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'public/data/packs/ext_personalized_guide/tables', city.file), 'utf8')) as CityData;
  return { summary, answers: buildGuide(data, summary, EXAMPLE_PROFILE) };
}
