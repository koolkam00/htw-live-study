import type { MetadataRoute } from 'next';
import { getCourseNames, slugifyCity } from '@/lib/course-data';
import { getQuestions } from '@/lib/research-data';
import { PACK_IDS } from '@/lib/packs';
import { getExtensions } from '@/lib/extension-data';

export const dynamic = 'force-static';
export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://htw-live-study.vercel.app';
  const urls = ['/', '/your-race', '/methodology', '/courses', '/packs', '/htw',
    ...[...PACK_IDS, ...getQuestions().map(q => q.id), ...getExtensions().map(pack => pack.id)].map(id => `/packs/${id}`),
    ...getCourseNames().map(city => `/courses/${slugifyCity(city)}`)];
  return [...new Set(urls)].map(url => ({ url: base + url }));
}
