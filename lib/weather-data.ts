import fs from 'node:fs';
import path from 'node:path';
import type { WeatherEvidence } from './weather-types';
import { WEATHER_QUESTIONS } from './weather-catalog';

export function getWeatherEvidence(): WeatherEvidence {
  const data = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'public/data/weather/evidence.json'), 'utf8')) as WeatherEvidence;
  if (data.schema_version !== 1 || data.candidates.length !== 3 || !data.editions.length) throw new Error('Invalid weather evidence.');
  return data;
}
export function getWeatherAnalyses(evidence: WeatherEvidence = getWeatherEvidence()) {
  return WEATHER_QUESTIONS.filter(item => evidence.candidates.some(candidate => candidate.id === item.id && candidate.status === 'ready'));
}
