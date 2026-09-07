import './globals.css';
import Link from 'next/link';

export const metadata = {
  title: 'HTW Live Study | Marathon questions, answered',
  description: 'Explore marathon pacing, late-race slowdown, and race performance through clear answers, charts, and transparent methods.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main">Skip to content</a>
        <header className="site-header">
          <div className="container header-inner">
            <Link href="/" className="site-title">HTW Live Study</Link>
            <nav aria-label="Main navigation" className="main-nav">
              <Link href="/">Questions</Link>
              <Link href="/methodology">Methodology</Link>
            </nav>
          </div>
        </header>
        <main id="main" className="container main-content">{children}</main>
        <footer className="container footer">
          <p>Marathon results describe what happened. They cannot establish why an individual runner slowed.</p>
          <nav aria-label="More research">
            <Link href="/courses">By course</Link>
            <Link href="/packs">All analyses</Link>
            <Link href="/htw">Study figures</Link>
            <Link href="/methodology">Sources &amp; methodology</Link>
          </nav>
        </footer>
      </body>
    </html>
  );
}
