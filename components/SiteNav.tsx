'use client';
import { UnitLink as Link } from './UnitsProvider';
import { usePathname } from 'next/navigation';

export default function SiteNav() {
  const path = usePathname();
  return <nav aria-label="Main navigation" className="main-nav">
    <Link href="/analyses" aria-current={path.startsWith('/analyses') ? 'page' : undefined}>The ten analyses</Link>
    <Link href="/about" aria-current={path === '/about' ? 'page' : undefined}>About the study</Link>
    <a href="https://github.com/koolkam00/htw-live-study/releases" className="nav-data">Open data <span aria-hidden="true">↗</span></a>
  </nav>;
}
