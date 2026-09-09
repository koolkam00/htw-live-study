import './globals.css';
import Link from 'next/link';

export const metadata = {
  title: 'Marathon Pacing Study | Every split of the race',
  description: 'Explore marathon strategy, course conditions, finishing goals, runner differences, and improvement through answers, charts, and transparent methods.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main">Skip to content</a>
        <header className="site-header">
          <div className="container header-inner">
            <Link prefetch={false} href="/" className="site-title">Marathon Pacing Study</Link>
            <nav aria-label="Main navigation" className="main-nav">
              <Link prefetch={false} href="/your-race">Your race</Link>
              <Link prefetch={false} href="/">Questions</Link>
              <Link prefetch={false} href="/methodology">Methodology</Link>
            </nav>
          </div>
        </header>
        <main id="main" className="container main-content">{children}</main>
        <footer className="container footer">
          <p>How marathons are run, split by split.</p>
          <nav aria-label="More research">
            <Link prefetch={false} href="/courses">By course</Link>
            <Link prefetch={false} href="/packs">All analyses</Link>
            <Link prefetch={false} href="/htw">Hitting the wall</Link>
            <Link prefetch={false} href="/methodology">Sources &amp; methodology</Link>
          </nav>
        </footer>
      </body>
    </html>
  );
}
