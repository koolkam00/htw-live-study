import './globals.css';
import Link from 'next/link';
import { Newsreader, Schibsted_Grotesk } from 'next/font/google';

export const metadata = {
  title: 'HTW Live Study',
  description:
    'Public live-study recreation of Smyth 2021 (PLOS ONE) — How recreational marathon runners hit the wall.',
};

const newsreader = Newsreader({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-serif',
});
const schibsted = Schibsted_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${newsreader.variable} ${schibsted.variable}`}>
      <body style={{ fontFamily: 'var(--font-sans)' }}>
        <header className="site-header">
          <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', padding: '0.9rem 1.25rem' }}>
            <div className="site-title" style={{ fontFamily: 'var(--font-serif)' }}>
              <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>HTW Live Study</Link>
            </div>
            <nav aria-label="Secondary" style={{ display: 'flex', gap: '1rem', fontSize: '0.95rem' }}>
              <Link href="/courses" style={{ color: 'inherit' }}>Courses</Link>
              <Link href="/packs" style={{ color: 'inherit' }}>Packs</Link>
              <Link href="/methodology" style={{ color: 'inherit' }}>Methodology</Link>
              <Link href="/htw" style={{ color: 'inherit' }}>HTW</Link>
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
