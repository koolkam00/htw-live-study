import { unitText, DEFAULT_UNITS } from '@/lib/units';
import { notFound } from 'next/navigation';
import { TEN_ANALYSES, analysisBySlug } from '@/lib/ten-analyses';
import { getAnalysisStart } from '@/lib/analysis-server';
import AnalysisExplorer from '@/components/AnalysisExplorer';
import WeatherAnalysis from '@/components/WeatherAnalysis';
import { getWeatherAnalyses, getWeatherEvidence } from '@/lib/weather-data';

export function generateStaticParams() { return [...TEN_ANALYSES, ...getWeatherAnalyses()].map(item => ({ slug: item.slug })); }
export function generateMetadata({ params }: { params: { slug: string } }) {
  const item = analysisBySlug(params.slug) || getWeatherAnalyses().find(item => item.slug === params.slug);
  return { title: item ? unitText(item.shortTitle, DEFAULT_UNITS) + ' | Marathon Pacing Study' : 'Analysis not found', description: item ? unitText(item.description, DEFAULT_UNITS) : undefined };
}
export default function AnalysisPage({ params }: { params: { slug: string } }) {
  const weatherQuestions = getWeatherAnalyses();
  const weatherDefinition = weatherQuestions.find(item => item.slug === params.slug);
  if (weatherDefinition) {
    const evidence = getWeatherEvidence();
    const candidate = evidence.candidates.find(item => item.id === weatherDefinition.id && item.status === 'ready')!;
    return <WeatherAnalysis key={candidate.id} definition={weatherDefinition} candidate={candidate} evidence={evidence} questions={weatherQuestions} />;
  }
  const definition = analysisBySlug(params.slug);
  if (!definition) notFound();
  const { summary, answers } = getAnalysisStart();
  return <AnalysisExplorer key={definition.id} definition={definition} summary={summary} initialAnswer={answers.find(answer => answer.id === definition.id)!} weatherQuestions={weatherQuestions} />;
}
