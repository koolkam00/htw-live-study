import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PACK_IDS } from '@/lib/packs';
import { getExtraAnswer } from '@/lib/research-data';
import ResearchQuestion from '@/components/ResearchQuestion';

export default function Page({ params }: { params: { packId: string } }) {
  if (!PACK_IDS.includes(params.packId)) notFound();
  return <><ResearchQuestion question={getExtraAnswer(params.packId)} standalone /><p><Link href="/">All research questions</Link></p></>;
}
export function generateStaticParams() { return PACK_IDS.map(packId => ({ packId })); }
export function generateMetadata({ params }: { params: { packId: string } }) {
  return { title: `${getExtraAnswer(params.packId).title} | HTW Live Study` };
}
