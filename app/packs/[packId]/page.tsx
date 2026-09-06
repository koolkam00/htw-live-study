import fs from 'fs';
import path from 'path';
import { getPackInfo, isEnrichment, isParked } from '@/lib/packs';
import PackClientPage from '@/components/PackClientPage';

export default function Page({ params }: { params: { packId: string } }) {
  return <PackClientPage params={params} />;
}

export function generateStaticParams() {
  const idxPath = path.join(process.cwd(), 'public', 'data', 'packs', 'INDEX.json');
  try {
    const raw = fs.readFileSync(idxPath, 'utf-8');
    const arr = JSON.parse(raw);
    if (Array.isArray(arr)) {
      return (arr as string[]).map((id) => ({ packId: id }));
    }
  } catch {}
  return [];
}
