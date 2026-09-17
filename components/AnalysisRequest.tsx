'use client';

import { useState, type FormEvent } from 'react';

const recipient = 'andrew.kam00@gmail.com';
const subject = 'Pace Notes — analysis request';

export default function AnalysisRequest() {
  const [question, setQuestion] = useState('');
  const [details, setDetails] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const message = `Analysis idea\n${question.trim()}${details.trim() ? `\n\nMore context\n${details.trim()}` : ''}\n\nSent from Pace Notes\nhttps://splithappens.run/request-analysis`;
  const mailto = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
  const gmail = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(recipient)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;

  function prepareEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!question.trim()) {
      setError('Add the question you would like us to explore.');
      document.getElementById('analysis-question')?.focus();
      return;
    }
    setError('');
    setStatus('Finish sending in your email app. If it did not open, use Gmail or copy your request below.');
    window.location.href = mailto;
  }

  async function copyRequest() {
    try {
      await navigator.clipboard.writeText(`To: ${recipient}\nSubject: ${subject}\n\n${message}`);
      setStatus('Request copied. Paste it into an email to Andrew and send it when you are ready.');
    } catch {
      setStatus(`Copy your question from the fields above and email it to ${recipient}.`);
    }
  }

  return <div className="analysis-request">
    <form action={`mailto:${recipient}`} method="post" encType="text/plain" onSubmit={prepareEmail}>
      <label htmlFor="analysis-question">What would you like to understand?</label>
      <p className="request-hint" id="question-hint">For example: do runners slow down differently on warmer race days?</p>
      <textarea id="analysis-question" name="Question" rows={3} required maxLength={160} value={question} aria-describedby="question-hint" aria-invalid={error ? true : undefined} onChange={event => { setQuestion(event.target.value); setError(''); setStatus(''); }} />
      <label htmlFor="analysis-details">A little more context <span>(optional)</span></label>
      <p className="request-hint" id="details-hint">Tell Andrew which runners, races or comparisons you have in mind.</p>
      <textarea id="analysis-details" name="Context" rows={5} maxLength={1000} value={details} aria-describedby="details-hint" onChange={event => { setDetails(event.target.value); setStatus(''); }} />
      {error && <p className="feedback-error" role="alert">{error}</p>}
      <button className="button-primary" type="submit">Open email draft <span aria-hidden="true">↗</span></button>
      <p className="request-hint request-delivery">Opens your email app with your request. Review it and press Send to email Andrew. Nothing is submitted from this page.</p>
    </form>
    {status && <p className="request-status" role="status">{status}</p>}
    <div className="request-alternatives">
      <p>Prefer another way?</p>
      <div>{question.trim() && <><a href={gmail} target="_blank" rel="noopener noreferrer">Open draft in Gmail <span aria-hidden="true">↗</span></a><button type="button" onClick={() => void copyRequest()}>Copy request</button></>}<a href={`mailto:${recipient}?subject=${encodeURIComponent(subject)}`}>{recipient}</a></div>
    </div>
  </div>;
}
