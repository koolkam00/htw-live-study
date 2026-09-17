import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PACK_IDS } from '@/lib/packs';
import { getExtraAnswer } from '@/lib/research-data';
import ResearchQuestion from '@/components/ResearchQuestion';
import { QUESTIONS } from '@/lib/question-catalog';
import { getExtensions } from '@/lib/extension-data';
import { broaderArchive } from '@/lib/broader-analysis-catalog';
import AllFinisherAnalysis from '@/components/AllFinisherAnalysis';
import { getAllFinisherContextStart } from '@/lib/all-finisher-context-server';
import FastStartAnalysis from '@/components/FastStartAnalysis';
import { getFastStartStarts } from '@/lib/fast-start-server';

const routes = [...new Set([...PACK_IDS, ...QUESTIONS.map(question => question.id), ...getExtensions().map(pack => pack.id)])];

export default function Page({ params }: { params: { packId: string } }) {
  if (!routes.includes(params.packId)) notFound();
  const broader = broaderArchive(params.packId);
  if (broader) {
    const history = <ResearchQuestion question={getExtraAnswer(params.packId)} standalone headingLevel={broader.kind === 'opening' ? 2 : undefined} />;
    if (broader.kind === 'opening') return <><FastStartAnalysis starts={getFastStartStarts()} defaultOpening={broader.opening} title={broader.title} description={broader.description} archive /><details className="methodology"><summary>Original comparison with earlier recorded results</summary><p>This original archive analysis needs an earlier result. Its definitions and smaller cohort differ from the single-race view above.</p>{history}</details></>;
    return <AllFinisherAnalysis kind={broader.kind} start={getAllFinisherContextStart(broader.kind)} title={broader.title} description={broader.description} archive history={history} />;
  }
  return <><ResearchQuestion question={getExtraAnswer(params.packId)} standalone /><p><Link href="/">All research questions</Link></p></>;
}
// The dedicated compatibility page owns this path in the static export.
export function generateStaticParams() { return routes.filter(packId => packId !== 'smyth_htw').map(packId => ({ packId })); }
export function generateMetadata({ params }: { params: { packId: string } }) {
  return { title: `${broaderArchive(params.packId)?.title || getExtraAnswer(params.packId).title} | Marathon Pacing Study` };
}
