import Link from 'next/link';
import QuestionViz from './QuestionViz';
import type { ResearchAnswer } from '@/lib/research-data';

export default function ResearchQuestion({ question, standalone = false }: { question: ResearchAnswer; standalone?: boolean }) {
  const Title = standalone ? 'h1' : 'h2';
  const published = question.published && !isNaN(Date.parse(question.published))
    ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(new Date(question.published)) : null;
  return <article className="question" id={`q-${question.id}`} aria-labelledby={`title-${question.id}`}>
    {question.aliases.map(alias => <span key={alias} id={`q-${alias}`} />)}
    <header>
      <span className="question-number">{question.number ? `Question ${String(question.number).padStart(2, '0')}` : 'The study'}</span>
      <Title id={`title-${question.id}`}>{question.title}</Title>
    </header>
    <p className={question.available ? 'answer' : 'answer-state'}>{question.answer}</p>
    {question.detail && <p className="answer-detail">{question.detail}</p>}
    {question.charts.map((spec, i) => <QuestionViz key={`${question.id}-${i}`} spec={spec} />)}
    <details className="methodology">
      <summary>Methodology &amp; sources</summary>
      <div className="methodology-content">
        {question.method.length ? question.method.map((paragraph, i) => <p key={i}>{paragraph}</p>) : <p>The method for this result has not yet been documented.</p>}
        {published && <p className="study-meta">Results published {published}.</p>}
        <div className="source-links">
          {question.sources.map((source, i) => <a href={source.href} key={`${source.href}-${i}`}>{source.label}</a>)}
          <Link href="/methodology">Study methodology</Link>
        </div>
        {question.related?.length ? <div className="source-links">{question.related.map(link => <Link key={link.href} href={link.href}>{link.label}</Link>)}</div> : null}
      </div>
    </details>
  </article>;
}
