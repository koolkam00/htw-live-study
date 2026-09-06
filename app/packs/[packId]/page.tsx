import fs from 'fs';
import path from 'path';
import { getPackInfo } from '@/lib/packs';
import PackClientPage from '@/components/PackClientPage';

export default function Page({ params }: { params: { packId: string } }) {
  return <PackClientPage params={params} />;
}

export function generateStaticParams() {
  const packsDir = path.join(process.cwd(), 'public', 'data', 'packs');
  const idsPathA = path.join(packsDir, 'PACK_IDS.json');
  const idsPathB = path.join(packsDir, 'INDEX.json');
  try {
    const raw = fs.readFileSync(idsPathA, 'utf-8');
    const arr = JSON.parse(raw);
    if (Array.isArray(arr)) {
      return (arr as string[]).map((id) => ({ packId: id }));
    }
  } catch {}
  try {
    const raw = fs.readFileSync(idsPathB, 'utf-8');
    const arr = JSON.parse(raw);
    if (Array.isArray(arr)) {
      return (arr as string[]).map((id) => ({ packId: id }));
    }
  } catch {}
  return [];
}
