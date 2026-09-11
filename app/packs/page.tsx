import Link from 'next/link';
import { QUESTIONS, EXTRA_TITLES, THEMES } from '@/lib/question-catalog';
import { PERSONAL_QUESTIONS } from '@/lib/personalized-catalog';

export const metadata = { title: 'All analyses | Marathon Pacing Study' };
export default function AnalysesPage() {
  return <div className="prose">
    <h1>All analyses</h1>
    <p className="answer-detail">{QUESTIONS.length} questions about race strategy, conditions, goals, runner differences, and improvement.</p>
    <h2>Twelve questions for your race</h2>
    <p>Choose a course, age group and time, with optional gender and previous performance.</p>
    <ol className="contents-list">{PERSONAL_QUESTIONS.map((q, i) => <li key={q.id}><Link href={`/your-race#guide-${q.id}`}><span className="contents-number">{i + 1}</span><span>{q.title}</span></Link></li>)}</ol>
    {THEMES.map(theme => <section key={theme.id} aria-labelledby={`index-${theme.id}`}>
      <h2 id={`index-${theme.id}`}>{theme.title}</h2>
      <ol className="contents-list">{QUESTIONS.filter(question => question.theme === theme.id).map(question => <li key={question.id}><Link href={`/packs/${question.id}`}><span className="contents-number">{question.number}</span><span>{question.title}</span></Link></li>)}</ol>
    </section>)}
    <h2>Supporting analyses</h2>
    <ul className="course-list">{Object.entries(EXTRA_TITLES).map(([id, title]) => <li key={id}><Link href={id === 'smyth_htw' ? '/slowdown' : `/packs/${id}`}>{title}</Link></li>)}</ul>
  </div>;
}
