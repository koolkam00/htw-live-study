import './globals.css';
import { UnitLink as Link, UnitSwitch } from '@/components/UnitsProvider';
import UnitsProvider from '@/components/UnitsProvider';
import SiteNav from '@/components/SiteNav';
import SiteAnalytics from '@/components/SiteAnalytics';

export const metadata = {
  title: 'Marathon Pacing Study | Understand your next 26.2 miles',
  description: 'Ten essential runner questions and new weather comparisons, drawn from millions of recorded marathon finishes.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body><UnitsProvider>
        <a className="skip-link" href="#main">Skip to content</a>
        <header className="site-header">
          <div className="container header-inner">
            <Link href="/" className="site-title"><span className="brand-mark" aria-hidden="true"><i /><i /><i /></span><span>Marathon<br className="brand-break" /> Pacing Study</span></Link>
            <div className="header-controls"><SiteNav /><UnitSwitch /></div>
          </div>
        </header>
        <main id="main" className="container main-content">{children}</main>
        <footer className="container footer">
          <div className="footer-brand"><Link href="/">Marathon Pacing Study</Link><p>Every split tells part of the story.</p></div>
          <nav aria-label="More research">
            <Link href="/analyses">Explore analyses</Link>
            <Link href="/runners">Find a runner</Link>
            <Link href="/about">About the study</Link>
            <Link href="/methodology">Methods &amp; sources</Link>
            <Link href="/packs">Research archive</Link>
            <Link href="/privacy">Privacy &amp; analytics</Link>
            <a href="https://github.com/koolkam00/htw-live-study/releases">Download the data ↗</a>
          </nav>
        </footer>
        <SiteAnalytics />
      </UnitsProvider></body>
    </html>
  );
}
