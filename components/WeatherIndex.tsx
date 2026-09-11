import { getWeatherAnalyses, getWeatherEvidence } from '@/lib/weather-data';
import { weatherHref } from '@/lib/weather-catalog';
import { sourceLabel, sourceReleaseHref } from '@/lib/data-source';
import { UnitLink } from './UnitsProvider';

export default function WeatherIndex() {
  const evidence = getWeatherEvidence();
  const questions = getWeatherAnalyses(evidence);
  if (!questions.length) return null;
  return <section className="weather-index" id="weather-questions"><div className="section-intro"><p className="eyebrow">Conditions, in more detail</p><h2>What else does<br />race-day weather tell us?</h2><p>Each comparison has passed a separate check for a clear, stable takeaway.</p><p className="study-meta">Source: <a href={sourceReleaseHref(evidence.input.release_tag)}>{sourceLabel(evidence.input.as_of, evidence.input.release_tag)}</a>.</p></div><ol className="analysis-index">
    {questions.map(item => <li key={item.id}><UnitLink href={weatherHref(item)} className="analysis-index-link"><span className="analysis-rank" aria-hidden="true">↗</span><span className="analysis-index-copy"><span className="analysis-index-title">{item.title}</span><span className="analysis-index-description">{item.description}</span></span><span className="analysis-index-category">Race-day weather</span><span className="arrow-link" aria-hidden="true">↗</span></UnitLink></li>)}
  </ol></section>;
}
