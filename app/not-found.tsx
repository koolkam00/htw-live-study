import Link from 'next/link';

export default function NotFound() {
  return <section className="not-found"><h1>This page could not be found.</h1><p>The link may have changed. You can return to the research questions or open your race guide.</p><div className="source-links"><Link prefetch={false} href="/">Research questions</Link><Link prefetch={false} href="/your-race">Your race guide</Link></div></section>;
}
