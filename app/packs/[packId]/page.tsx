import { PACKS } from '@/lib/packs';
import PackClientPage from '@/components/PackClientPage';

export default function Page({ params }: { params: { packId: string } }) {
  return <PackClientPage params={params} />;
}

export function generateStaticParams() {
  return PACKS.map((p) => ({ packId: p.id }));
}
