import Link from 'next/link';
import QuestionViz from './QuestionViz';
import type { ResearchAnswer } from '@/lib/research-data';

export default function ResearchQuestion({ question, standalone = false, headingLevel = 2 }: { question: ResearchAnswer; standalone?: boolean; headingLevel?: 2 | 3 }) {
  const Title = standalone ? 'h1' : headingLevel === 3 ? 'h3' : 'h2';
  const published = question.published && !isNaN(Date.parse(question.published))
    ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(new Date(question.published)) : null;
  return <article className="question" id={`q-${question.id}`} aria-labelledby={`title-${question.id}`}>
    {question.aliases.map(alias => <span key={alias} id={`q-${alias}`} />)}
    <header>
      <span className="question-number">{question.number ? `Question ${String(question.number).padStart(2, '0')}` : 'The study'}</span>
      <Title className="question-title" id={`title-${question.id}`}>{question.title}</Title>
    </header>
    <p className={question.available ? 'answer' : 'answer-state'}>{question.answer}</p>
    {question.detail && <p className="answer-detail">{question.detail}</p>}
    {question.dataset && <p className="study-meta">{new Intl.NumberFormat('en-US').format(question.dataset.n)} eligible finishes · Data through {new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(new Date(question.dataset.asOf))}</p>}
    {question.method[0] && <p className="method-summary"><strong>How we measured it.</strong> {question.method[0]}</p>}
    <details className="methodology">
      <summary>Full methodology &amp; sources</summary>
      <div className="methodology-content">
        {question.method.length ? question.method.slice(1).map((paragraph, i) => <p key={i}>{paragraph}</p>) : <p>The method for this result has not yet been documented.</p>}
        {question.nextAnalysis && <section className="analysis-plan">
          <h3>Next analysis</h3>
          <p><strong>Measure:</strong> {question.nextAnalysis.measure}</p>
          <p><strong>Compare:</strong> {question.nextAnalysis.compare}</p>
          <p><strong>Data needed:</strong> {question.nextAnalysis.needs}</p>
        </section>}
        {published && <p className="study-meta">Results published {published}.</p>}
        {question.dataset && <p className="study-meta">Source export: {question.dataset.exportId}. Chart samples may be smaller than the eligible analysis cohort.</p>}
        <div className="source-links">
          {question.sources.map((source, i) => <a href={source.href} key={`${source.href}-${i}`}>{source.label}</a>)}
          <Link href="/methodology">Study methodology</Link>
        </div>
        {question.related?.length ? <div className="source-links">{question.related.map(link => <Link key={link.href} href={link.href}>{link.label}</Link>)}</div> : null}
      </div>
    </details>
    {question.charts.map((spec, i) => <QuestionViz key={`${question.id}-${i}`} spec={spec} />)}
  </article>;
}
