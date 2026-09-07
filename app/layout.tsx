import './globals.css';
import Link from 'next/link';

export const metadata = {
  title: 'HTW Live Study',
  description:
    'Public live-study recreation of Smyth 2021 (PLOS ONE) — How recreational marathon runners hit the wall.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', padding: '0.9rem 1.25rem' }}>
            <div className="site-title">
              <span aria-hidden>🏃‍♂️</span>
              <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>HTW Live Study</Link>
            </div>
            <nav style={{ display: 'flex', gap: '1rem' }}>
              <Link href="/" style={{ color: 'inherit' }}>Dashboard</Link>
              <Link href="/courses" style={{ color: 'inherit' }}>Courses</Link>
              <Link href="/packs" style={{ color: 'inherit' }}>Packs</Link>
              <Link href="/methodology" style={{ color: 'inherit' }}>Methodology</Link>
            </nav>
          </div>
        </header>
        <main className="container" style={{ paddingTop: '1.25rem' }}>
          {children}
        </main>
        <footer className="container footer">
          <div>
            This is a public, no-auth, static site. Do not treat the 2021 published figures as live data.
          </div>
        </footer>
      </body>
    </html>
  );
}
