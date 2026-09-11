import './globals.css';
import { UnitLink as Link, UnitSwitch } from '@/components/UnitsProvider';
import UnitsProvider from '@/components/UnitsProvider';
import SiteNav from '@/components/SiteNav';

export const metadata = {
  title: 'Marathon Pacing Study | Understand your next 26.2 miles',
  description: 'Ten clear, interactive analyses of marathon pacing, courses, conditions and improvement, drawn from millions of recorded finishes.',
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
            <Link href="/analyses">The ten analyses</Link>
            <Link href="/about">About the study</Link>
            <Link href="/methodology">Methods &amp; sources</Link>
            <Link href="/packs">Research archive</Link>
            <a href="https://github.com/koolkam00/htw-live-study/releases">Download the data ↗</a>
          </nav>
        </footer>
      </UnitsProvider></body>
    </html>
  );
}
