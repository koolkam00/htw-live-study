import Link from 'next/link';

export const metadata = {
  title: 'Sustained slowdown | Marathon Pacing Study',
  description: 'Explore the sustained slowdown analysis at its new address.',
  alternates: { canonical: 'https://htw-live-study.vercel.app/slowdown' },
  robots: { index: false, follow: true },
};

// Keep earlier bookmarks usable in the static export.
export default function LegacySlowdownPage() {
  return <section className="study-intro">
    <h1>Sustained slowdown analysis</h1>
    <p>This analysis has moved to a new address.</p>
    <p><Link href="/slowdown">Explore sustained slowdown</Link></p>
  </section>;
}
