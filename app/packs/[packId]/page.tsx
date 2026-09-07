import fs from 'fs';
import path from 'path';
import { PACK_IDS } from '@/lib/packs';
import type { PackMeta } from '@/hooks/usePackMeta';
import PackClientPage from '@/components/PackClientPage';

function readJsonIfExists(filePath: string): unknown | null {
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export default function Page({ params }: { params: { packId: string } }) {
  const packId = params.packId;
  const packDir = path.join(process.cwd(), 'public', 'data', 'packs', packId);
  const metaPath = path.join(packDir, 'pack_meta.json');
  const summaryPath = path.join(packDir, 'summary.json');
  const initialMeta = readJsonIfExists(metaPath) as PackMeta | null;
  const initialSummary = readJsonIfExists(summaryPath) as Record<string, unknown> | null;
  return <PackClientPage params={params} initialMeta={initialMeta} initialSummary={initialSummary} />;
}

export function generateStaticParams() {
  return PACK_IDS.map((id) => ({ packId: id }));
}