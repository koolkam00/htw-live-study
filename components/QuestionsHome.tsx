import ResearchQuestion from './ResearchQuestion';
import { getLive, getQuestions } from '@/lib/research-data';
import { THEMES } from '@/lib/question-catalog';

export default function QuestionsHome() {
  const questions = getQuestions();
  const live = getLive();
  const corpus = live?.corpus;
  const ready = ['ready', 'ok'].includes(live?.status);
  return (
    <div className="questions">
      <section className="study-intro">
        <h1>Marathon pacing,<br />split by split.</h1>
        <p>{ready && typeof corpus?.n_records === 'number'
          ? `${new Intl.NumberFormat('en-US').format(corpus.n_records)} recorded finishes · ${corpus.n_cities} cities · ${corpus.year_min}–${corpus.year_max}`
          : 'Research on how runners start, adapt, finish, and improve.'}</p>
      </section>
      <nav className="theme-nav" aria-label="Research themes">
        {THEMES.map(theme => <a key={theme.id} href={`#theme-${theme.id}`}>{theme.title}</a>)}
      </nav>
      <details className="question-index" id="contents">
        <summary>Explore all {questions.length} questions</summary>
        <nav aria-label="Research questions">
          <ol className="contents-list">
            {questions.map(q => <li key={q.id}><a href={`#q-${q.id}`}><span className="contents-number">{String(q.number).padStart(2, '0')}</span><span>{q.title}</span></a></li>)}
          </ol>
        </nav>
      </details>
      <div className="question-list">
        {THEMES.map(theme => <section className="research-theme" id={`theme-${theme.id}`} key={theme.id} aria-labelledby={`theme-title-${theme.id}`}>
          <h2 className="theme-title" id={`theme-title-${theme.id}`}>{theme.title}</h2>
          {questions.filter(question => question.theme === theme.id).map(question => <ResearchQuestion key={question.id} question={question} headingLevel={3} />)}
        </section>)}
      </div>
    </div>
  );
}
