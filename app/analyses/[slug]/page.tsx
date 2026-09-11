import { unitText, DEFAULT_UNITS } from '@/lib/units';
import { notFound } from 'next/navigation';
import { TEN_ANALYSES, analysisBySlug } from '@/lib/ten-analyses';
import { getAnalysisStart } from '@/lib/analysis-server';
import AnalysisExplorer from '@/components/AnalysisExplorer';

export function generateStaticParams() { return TEN_ANALYSES.map(item => ({ slug: item.slug })); }
export function generateMetadata({ params }: { params: { slug: string } }) {
  const item = analysisBySlug(params.slug);
  return { title: item ? unitText(item.shortTitle, DEFAULT_UNITS) + ' | Marathon Pacing Study' : 'Analysis not found', description: item ? unitText(item.description, DEFAULT_UNITS) : undefined };
}
export default function AnalysisPage({ params }: { params: { slug: string } }) {
  const definition = analysisBySlug(params.slug);
  if (!definition) notFound();
  const { summary, answers } = getAnalysisStart();
  return <AnalysisExplorer key={definition.id} definition={definition} summary={summary} initialAnswer={answers.find(answer => answer.id === definition.id)!} />;
}
