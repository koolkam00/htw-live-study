import ResearchQuestion from './ResearchQuestion';
import { getLive, getQuestions, getStudyAnswer } from '@/lib/research-data';

export default function QuestionsHome() {
  const questions = getQuestions();
  const study = getStudyAnswer();
  const live = getLive();
  const corpus = live?.corpus;
  const ready = ['ready', 'ok'].includes(live?.status);
  return (
    <div className="questions">
      <section className="study-intro">
        <h1>Marathon questions,<br />answered by the data.</h1>
        <p>{ready && typeof corpus?.n_records === 'number'
          ? `${new Intl.NumberFormat('en-US').format(corpus.n_records)} recorded finishes · ${corpus.n_cities} cities · ${corpus.year_min}–${corpus.year_max}`
          : 'Research on marathon pacing and late-race slowing.'}</p>
      </section>
      <details className="question-index" id="contents">
        <summary>Explore the 29 questions</summary>
        <nav aria-label="Research questions">
          <ol className="contents-list">
            <li><a href="#q-smyth_htw"><span className="contents-number">•</span><span>{study.title}</span></a></li>
            {questions.map(q => <li key={q.id}><a href={`#q-${q.id}`}><span className="contents-number">{String(q.number).padStart(2, '0')}</span><span>{q.title}</span></a></li>)}
          </ol>
        </nav>
      </details>
      <div className="question-list">
        <ResearchQuestion question={study} />
        {questions.map(question => <ResearchQuestion key={question.id} question={question} />)}
      </div>
    </div>
  );
}

