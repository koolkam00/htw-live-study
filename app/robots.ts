import type { MetadataRoute } from 'next';
export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: '*', allow: '/', disallow: '/data/' }, sitemap: 'https://htw-live-study.vercel.app/sitemap.xml' };
}
