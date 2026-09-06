'use client';
import { useEffect, useState } from 'react';

export interface PackMeta {
  status: 'ready' | 'ok' | 'empty' | 'enrichment' | 'coming-soon' | 'stub';
  as_of?: string | null;
  [key: string]: unknown;
}

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '';

export function usePackMeta(packId: string) {
  const [meta, setMeta] = useState<PackMeta | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`${BASE_PATH}/data/packs/${packId}/pack_meta.json`, {
          cache: 'no-store',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!res.ok) {
          setMeta(null);
        } else {
          const json = (await res.json()) as PackMeta;
          if (!cancelled) setMeta(json);
        }
      } catch {
        if (!cancelled) setMeta(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [packId]);

  return { meta, loading };
}
