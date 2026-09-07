import { redirect } from 'next/navigation';
import fs from 'fs';
import path from 'path';
import { getPackInfo, isEnrichment } from '@/lib/packs';

type Badge = 'Ready' | 'Coming soon' | 'Waiting';

function toBadge(id: string, meta: any | null): Badge {
  if (meta?.status === 'ready' || meta?.status === 'ok') return 'Ready';
  if (meta?.status === 'coming-soon') return 'Coming soon';
  return 'Waiting';
}

function StatusBadge({ id, meta }: { id: string; meta: any | null }) {
  const label = toBadge(id, meta);
  return <span className="badge">{label}</span>;
}

function readPackIds(): string[] {
  const packsDir = path.join(process.cwd(), 'public', 'data', 'packs');
  const idsPathA = path.join(packsDir, 'PACK_IDS.json'); // preferred
  const idsPathB = path.join(packsDir, 'INDEX.json'); // legacy
  try {
    const raw = fs.readFileSync(idsPathA, 'utf-8');
    const arr = JSON.parse(raw);
    if (Array.isArray(arr)) return arr as string[];
  } catch {}
  try {
    const raw = fs.readFileSync(idsPathB, 'utf-8');
    const arr = JSON.parse(raw);
    if (Array.isArray(arr)) return arr as string[];
  } catch {}
  return [];
}

function readMeta(id: string): any | null {
  const metaPath = path.join(process.cwd(), 'public', 'data', 'packs', id, 'pack_meta.json');
  try {
    const raw = fs.readFileSync(metaPath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export default function PacksIndexPage() {
  // Reading UI lives on '/', keep /packs as a convenience redirect to Contents
  redirect('/#contents');
}
