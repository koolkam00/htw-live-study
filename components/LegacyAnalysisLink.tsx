'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TEN_ANALYSES, analysisHref } from '@/lib/ten-analyses';

export default function LegacyAnalysisLink() {
  const router = useRouter();
  useEffect(() => {
    const id = window.location.hash.replace('#guide-', '');
    const analysis = TEN_ANALYSES.find(item => item.id === id);
    const destination = analysis ? analysisHref(analysis) : id === 'downhill' ? '/analyses/downhill-start' : id === 'return' ? '/research/personalized' : analysisHref(TEN_ANALYSES[0]);
    router.replace(destination + window.location.search + (id === 'return' ? window.location.hash : ''));
  }, [router]);
  return null;
}
