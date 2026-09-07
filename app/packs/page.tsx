import Link from 'next/link';
import { QUESTIONS, EXTRA_TITLES } from '@/lib/question-catalog';

export const metadata = { title: 'All analyses | HTW Live Study' };
export default function AnalysesPage() {
  return <div className="prose">
    <h1>All analyses</h1>
    <p className="answer-detail">The research questions and their supporting analyses.</p>
    <ol className="contents-list">{QUESTIONS.map(question => <li key={question.id}><Link href={`/packs/${question.id}`}><span className="contents-number">{question.number}</span><span>{question.title}</span></Link></li>)}</ol>
    <h2>Supporting analyses</h2>
    <ul className="course-list">{Object.entries(EXTRA_TITLES).map(([id, title]) => <li key={id}><Link href={`/packs/${id}`}>{title}</Link></li>)}</ul>
  </div>;
}
