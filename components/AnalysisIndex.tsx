import Link from 'next/link';
import { TEN_ANALYSES, analysisHref } from '@/lib/ten-analyses';

export default function AnalysisIndex({ compact = false }: { compact?: boolean }) {
  return <ol className={'analysis-index' + (compact ? ' analysis-index-compact' : '')}>
    {TEN_ANALYSES.map(item => <li key={item.id}>
      <Link href={analysisHref(item)} className="analysis-index-link">
        <span className="analysis-rank">{String(item.rank).padStart(2, '0')}</span>
        <span className="analysis-index-copy"><span className="analysis-index-title">{item.title}</span><span className="analysis-index-description">{item.description}</span></span>
        <span className="analysis-index-category">{item.category}</span>
        <span className="arrow-link" aria-hidden="true">↗</span>
      </Link>
    </li>)}
  </ol>;
}
