'use client';

import { useId, useState } from 'react';
import Link from 'next/link';
import QuestionViz from './QuestionViz';
import type { StudyFigureData } from '@/lib/study-figures';

export default function StudyFigure({ figure }: { figure: StudyFigureData }) {
  const [choice, setChoice] = useState(0);
  const id = useId();
  return <article className="question" id={figure.id} aria-labelledby={`${id}-title`}>
    <h2 id={`${id}-title`}>{figure.title}</h2>
    <p className="answer">{figure.answer}</p>
    <div className="chart-controls">
      <label htmlFor={`${id}-chart`}>Comparison
        <select id={`${id}-chart`} value={choice} onChange={event => setChoice(Number(event.target.value))}>
          {figure.charts.map((chart, index) => <option key={index} value={index}>{chart.title}</option>)}
        </select>
      </label>
    </div>
    <QuestionViz key={choice} spec={figure.charts[choice]} unitSystem="km" />
    <details className="methodology">
      <summary>Methodology &amp; sources</summary>
      <div className="methodology-content">
        {figure.method.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
        <div className="source-links"><Link href="/methodology">Study methodology</Link><a href={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/data/live.json`}>Figure data</a></div>
      </div>
    </details>
  </article>;
}
