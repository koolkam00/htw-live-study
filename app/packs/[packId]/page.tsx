import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PACK_IDS } from '@/lib/packs';
import { getExtraAnswer } from '@/lib/research-data';
import ResearchQuestion from '@/components/ResearchQuestion';
import { QUESTIONS } from '@/lib/question-catalog';
import { getExtensions } from '@/lib/extension-data';

const routes = [...new Set([...PACK_IDS, ...QUESTIONS.map(question => question.id), ...getExtensions().map(pack => pack.id)])];

export default function Page({ params }: { params: { packId: string } }) {
  if (!routes.includes(params.packId)) notFound();
  return <><ResearchQuestion question={getExtraAnswer(params.packId)} standalone /><p><Link href="/">All research questions</Link></p></>;
}
// The dedicated compatibility page owns this path in the static export.
export function generateStaticParams() { return routes.filter(packId => packId !== 'smyth_htw').map(packId => ({ packId })); }
export function generateMetadata({ params }: { params: { packId: string } }) {
  return { title: `${getExtraAnswer(params.packId).title} | Marathon Pacing Study` };
}
