'use client';
import { UnitLink as Link, useUnits } from './UnitsProvider';
import { unitText } from '@/lib/units';
import QuestionViz from './QuestionViz';
import type { ResearchAnswer } from '@/lib/research-data';
import { broaderArchive } from '@/lib/broader-analysis-catalog';

const linkedRaceQuestions = new Set(['r05_exceptional_vs_prior', 'r30_negative_split_success', 'r31_multiple_good_strategies', 'r32_where_pbs_are_gained', 'r12_fastest_by_ability', 's4_time_translation', 'r14_knowing_course', 'r20_pacing_personalities', 'r21_learn_from_blowup', 'r25_huge_kick_next', 'r24_interval_after_pb']);

export default function ResearchQuestion({ question, standalone = false, headingLevel }: { question: ResearchAnswer; standalone?: boolean; headingLevel?: 2 | 3 }) {
  const { units } = useUnits();
  const text = (value: string) => unitText(value, units);
  const Title = headingLevel === 3 ? 'h3' : headingLevel === 2 ? 'h2' : standalone ? 'h1' : 'h2';
  return <article className="question" id={`q-${question.id}`} aria-labelledby={`title-${question.id}`}>
    {question.aliases.map(alias => <span key={alias} id={`q-${alias}`} />)}
    <header>
      <span className="question-number">{question.number ? `Question ${String(question.number).padStart(2, '0')}` : 'The study'}</span>
      <Title className="question-title" id={`title-${question.id}`}>{text(question.title)}</Title>
    </header>
    {!standalone && broaderArchive(question.id) && <p className="coverage-notice"><Link href={'/packs/' + question.id}>Explore the broader view without an earlier race ↗</Link>. The recorded-history comparison below remains available separately.</p>}
    {linkedRaceQuestions.has(question.id) && <p className="coverage-notice">This question compares linked races and needs recorded history. With one race, you can still explore <Link href="/analyses/starting-pace">opening pace and late slowing</Link> or <Link href="/runners">your race, conditions and peers</Link>. Those comparisons cannot establish personal improvement or learning.</p>}
    <p className={question.available ? 'answer' : 'answer-state'}>{text(question.answer)}</p>
    {question.detail && <p className="answer-detail">{text(question.detail)}</p>}
    {question.dataset && <p className="study-meta">{new Intl.NumberFormat('en-US').format(question.dataset.n)} {question.dataset.unit || 'eligible finishes'}{question.dataset.scope && question.dataset.scope !== 'descriptive' ? ` · ${question.dataset.scope}` : ''}</p>}
    {question.method[0] && <p className="method-summary"><strong>How we measured it.</strong> {text(question.method[0])}</p>}
    <details className="methodology">
      <summary>Full methodology &amp; sources</summary>
      <div className="methodology-content">
        {question.method.length ? question.method.slice(1).map((paragraph, i) => <p key={i}>{text(paragraph)}</p>) : <p>The method for this result has not yet been documented.</p>}
        {question.nextAnalysis && <section className="analysis-plan">
          <h3>Next analysis</h3>
          <p><strong>Measure:</strong> {text(question.nextAnalysis.measure)}</p>
          <p><strong>Compare:</strong> {text(question.nextAnalysis.compare)}</p>
          <p><strong>Data needed:</strong> {text(question.nextAnalysis.needs)}</p>
        </section>}
        {question.dataset && <p className="study-meta"><Link href="/about#data-coverage">Marathons, years and recorded data</Link>. Chart samples may be smaller than the eligible analysis cohort.</p>}
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
