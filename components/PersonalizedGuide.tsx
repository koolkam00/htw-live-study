'use client';

import { Fragment, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import QuestionViz from './QuestionViz';
import { AGE_OPTIONS, GOAL_PRESETS, type Profile, type Focus } from '@/lib/personalized-catalog';
import type { CityData, PersonalSummary, CheckpointData, NearResult } from '@/lib/personalized-types';
import { buildGuide, checkpointResult, clock, count, defaultProfile, fmt, GUIDE_PACK, parseElapsed, parseMinutes, parseSection, percentUnder, targetBucket, type GuideAnswer } from '@/lib/personalized';
import { effectiveProfile, profileSearch, readProfile } from '@/lib/guide-profile';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
const cache = new Map<string, unknown>();
async function loadAggregate<T>(file: string, vintage: string, signal: AbortSignal): Promise<T> {
  const prepared = /^[a-f0-9]{64}\.json$/.test(file);
  if (!prepared && !/^(city|checkpoint)_[0-9]{2,3}\.json$/.test(file)) throw new Error('This comparison file is not available.');
  const key = `${file}:${vintage}`;
  if (cache.has(key)) return cache.get(key) as T;
  const response = await fetch(prepared ? `${basePath}/data/guide/${file}` : `${basePath}/data/packs/${GUIDE_PACK}/tables/${file}?v=${encodeURIComponent(vintage)}`, { signal });
  if (!response.ok) throw new Error('The comparison could not load. Please try again.');
  const decoded: unknown = await response.json();
  cache.set(key, decoded);
  if (cache.size > 32) cache.delete(cache.keys().next().value!);
  return decoded as T;
}
const loadMessage = 'The comparison could not load. Check your connection and try again.';
type FileIndex = { city: string; files: Record<string, string> };
async function loadCheckpoints(city: PersonalSummary['cities'][number], vintage: string, checkpoint: number, elapsed: number, signal: AbortSignal): Promise<CheckpointData> {
  if (!city.checkpoint_index) return loadAggregate(city.checkpoint_file, vintage, signal);
  const index = await loadAggregate<FileIndex>(city.checkpoint_index, vintage, signal);
  if (index.city !== city.city) throw new Error(loadMessage);
  const band = Math.floor(elapsed / 120) * 2;
  const files = [band - 2, band, band + 2].map(b => index.files[`${checkpoint}:${b}`]).filter(Boolean);
  const parts = await Promise.all(files.map(file => loadAggregate<CheckpointData>(file, vintage, signal)));
  if (parts.some(part => part.city !== city.city || !Array.isArray(part.rows))) throw new Error(loadMessage);
  return { city: city.city, rows: parts.flatMap(part => part.rows) };
}

const priorities: Record<Focus, string[]> = {
  prepare: ['profile', 'opening', 'checkpoint'],
  choose: ['courses', 'ambition', 'weather'],
  review: ['sections', 'terrain', 'gains'],
};
const focusLabels: Record<Focus, string> = { prepare: 'Prepare for a race', choose: 'Choose a marathon', review: 'Understand a past result' };

function CheckpointComparison({ summary, profile }: { summary: PersonalSummary; profile: Profile }) {
  const [checkpoint, setCheckpoint] = useState(30);
  const [elapsedText, setElapsedText] = useState(() => clock(profile.goal * 60 * 30 / 42.195, true));
  const [elapsedEdited, setElapsedEdited] = useState(false);
  const [sectionText, setSectionText] = useState('');
  const [submitted, setSubmitted] = useState<{ checkpoint: number; elapsed: number; section: number | null } | null>(null);
  const [data, setData] = useState<CheckpointData | null>(null);
  const [error, setError] = useState('');
  const [validationError, setValidationError] = useState('');
  const [loadedKey, setLoadedKey] = useState('');
  const [retry, setRetry] = useState(0);
  const city = summary.cities.find(row => row.city === profile.city)!;
  useEffect(() => { if (!elapsedEdited) setElapsedText(clock(profile.goal * 60 * checkpoint / 42.195, true)); }, [profile.goal, checkpoint, elapsedEdited]);
  const queryKey = submitted ? `${city.city}:${submitted.checkpoint}:${Math.floor(submitted.elapsed / 120)}` : '';
  useEffect(() => {
    if (!submitted) return;
    const controller = new AbortController(); let active = true;
    setData(null); setError('');
    loadCheckpoints(city, summary.as_of, submitted.checkpoint, submitted.elapsed, controller.signal).then(value => {
      if (value.city !== city.city || !Array.isArray(value.rows)) throw new Error('This checkpoint comparison is not available.');
      if (active) { setData(value); setLoadedKey(queryKey); }
    }).catch(e => { if (active && e.name !== 'AbortError') setError(loadMessage); });
    return () => { active = false; controller.abort(); };
  }, [queryKey, city.checkpoint_file, summary.as_of, retry]);
  const currentData = data?.city === profile.city && loadedKey === queryKey ? data : null;
  const result = currentData && submitted ? checkpointResult(currentData, profile, submitted.checkpoint, submitted.elapsed, submitted.section) : null;
  const remaining = submitted ? (profile.goal * 60 - submitted.elapsed) / (42.195 - submitted.checkpoint) : null;
  return <div className="checkpoint-comparison">
    <form className="guide-form" onSubmit={event => {
      event.preventDefault();
      const elapsed = parseElapsed(elapsedText), section = sectionText ? parseSection(sectionText) : null;
      setSubmitted(null); setError(''); setValidationError('');
      if (elapsed === null || elapsed <= 0 || elapsed >= 12 * 3600) { setValidationError('Enter an elapsed time such as 2:08:00.'); return; }
      if (sectionText && (section === null || section < 600 || section > 6000 || section > elapsed)) { setValidationError('Enter the latest 5 km time as minutes:seconds, from 10:00 to 100:00 and below total elapsed time.'); return; }
      setSubmitted({ checkpoint, elapsed, section });
    }}>
      <div className="guide-fields">
        <label>Checkpoint<select value={checkpoint} onChange={event => { const km = Number(event.target.value); setCheckpoint(km); setElapsedEdited(false); setElapsedText(clock(profile.goal * 60 * km / 42.195, true)); }}>{[20, 30, 35].map(km => <option value={km} key={km}>{km} km</option>)}</select></label>
        <label>Elapsed time (h:mm:ss)<input value={elapsedText} onChange={event => { setElapsedEdited(true); setElapsedText(event.target.value); }} aria-describedby="checkpoint-example" spellCheck={false} /></label>
        <label>Latest 5 km time (optional)<input value={sectionText} onChange={event => setSectionText(event.target.value)} placeholder="e.g. 21:30" spellCheck={false} /></label>
      </div>
      <p id="checkpoint-example" className="study-meta">An even-pace time is prefilled as an example. Replace it with your actual elapsed time.</p>
      <button type="submit" className="guide-submit">Compare this checkpoint</button>
    </form>
    {validationError && <p role="alert" className="guide-error">{validationError}</p>}
    {error && <div role="alert" className="guide-error"><p>{error}</p><button type="button" onClick={() => setRetry(x => x + 1)}>Try loading again</button></div>}
    {submitted && !currentData && !error && <p role="status" className="study-meta">Loading checkpoint comparisons…</p>}
    {currentData && submitted && !result && <p className="answer-state">Fewer than 100 complete finishes match this elapsed-time band, even after broadening age, gender and recent pace trend. Choose another course or checkpoint; no estimate is shown.</p>}
    {result && submitted && <div aria-live="polite">
      <p className="answer">{fmt(percentUnder(result.row, profile.goal))}% of the {count(result.row.n)} eligible finishers who passed {submitted.checkpoint} km from {clock(result.row.elapsed * 60)} to under {clock((result.row.elapsed + 2) * 60)} finished below {clock(profile.goal * 60)}. Their median finish was {clock(result.row.finish[1], true)}.</p>
      <p className="answer-detail">{remaining !== null && remaining > 0 ? `Reaching your target from the entered time requires ${Math.floor(Math.round(remaining) / 60)}:${String(Math.round(remaining) % 60).padStart(2, '0')}/km over the remaining ${fmt(42.195 - submitted.checkpoint)} km.` : 'The selected target time has already elapsed at this checkpoint.'} This historical group is not a calibrated personal prediction.</p>
      <p className="study-meta guide-coverage">{result.comparison}. {result.row.editions} represented editions. Previous marathon time is not used in this checkpoint comparison.</p>
      {(result.widened || result.trendWidened) && <p className="study-meta guide-widened">{[result.widened, result.trendWidened ? 'Recent pace trend was broadened to all trends.' : ''].filter(Boolean).join(' ')}</p>}
      <div className="checkpoint-neighbors"><h3>Nearby checkpoint times</h3><p className="study-meta">These are fixed two-minute groups. Crossing a boundary changes the comparison group, not your ability abruptly. The rows below use the same age, gender and pace-trend filters.</p>
        {[...result.adjacent, result.row].sort((a, b) => a.elapsed - b.elapsed).map(row => <p className="study-meta" key={row.elapsed}><strong>{clock(row.elapsed * 60)}–{clock((row.elapsed + 2) * 60)}{row === result.row ? ' (your band)' : ''}:</strong> {fmt(percentUnder(row, profile.goal))}% below {clock(profile.goal * 60)} · median {clock(row.finish[1], true)} · {count(row.n)} finishes</p>)}
        {result.adjacent.length < 2 && <p className="study-meta">At least one neighboring band has fewer than 100 matching finishes and is not published.</p>}
      </div>
      <QuestionViz spec={{ title: 'Historical finish-time range', unit: 'finish', xLabel: 'Percentile', kind: 'bars', series: [{ key: 'value', label: 'Finish time' }], rows: ['10th percentile', 'Median', '90th percentile'].map((label, i) => ({ label, value: result.row.finish[i] / 60, n_value: result.row.n })), note: 'These percentiles show variation among complete eligible finishers, including repeated runners. Non-finishers and missing-split records are absent.' }} />
    </div>}
  </div>;
}

function Answer({ answer, number, summary, profile }: { answer: GuideAnswer; number: number; summary: PersonalSummary; profile: Profile }) {
  return <section className="question guide-question" id={`guide-${answer.id}`} aria-labelledby={`guide-title-${answer.id}`}>
    <span className="question-number">Personalized question {number} of 12</span>
    <h2 className="question-title" id={`guide-title-${answer.id}`}>{answer.title}</h2>
    <p className="answer">{answer.answer}</p>
    <p className="answer-detail">{answer.detail}</p>
    {answer.comparison && <p className="study-meta guide-coverage">Comparison: {answer.comparison}.{answer.sample && ` ${count(answer.sample.n)} observations across ${answer.sample.editions} represented editions.`}</p>}
    <details className="methodology"><summary>Methodology</summary><div className="methodology-content"><p>{answer.method}</p><p>Every published result contains at least 100 observations. Variation bands describe performances, not certainty in an estimate. Each answer labels its actual comparison group, including broader filters where needed.</p><Link prefetch={false} href={`/methodology#personal-${answer.id}`}>Full personalized methodology</Link></div></details>
    {answer.id === 'checkpoint' ? <CheckpointComparison summary={summary} profile={profile} /> : answer.charts.map((chart, i) => <QuestionViz key={`${answer.id}-${i}`} spec={chart} />)}
  </section>;
}

export default function PersonalizedGuide({ summary }: { summary: PersonalSummary }) {
  const initial = { ...defaultProfile, city: summary.cities.some(c => c.city === 'New York') ? 'New York' : summary.cities[0].city };
  const [profile, setProfile] = useState<Profile>(initial);
  const [draft, setDraft] = useState<Profile>(initial);
  const [goalText, setGoalText] = useState('3:00');
  const [customGoal, setCustomGoal] = useState(false);
  const [previousText, setPreviousText] = useState('');
  const [optionalOpen, setOptionalOpen] = useState(false);
  const [data, setData] = useState<CityData | null>(null);
  const [formError, setFormError] = useState('');
  const [loadError, setLoadError] = useState('');
  const [retry, setRetry] = useState(0);
  const [ready, setReady] = useState(false);
  const [urlNotice, setUrlNotice] = useState('');
  const [nearData, setNearData] = useState<{ city: string; target: number; near: Record<string, NearResult[]> } | null>(null);
  const [nearError, setNearError] = useState('');
  const [nearRetry, setNearRetry] = useState(0);
  const [loadedFile, setLoadedFile] = useState('');
  const city = summary.cities.find(c => c.city === profile.city)!;
  const draftCity = summary.cities.find(c => c.city === draft.city)!;
  const applied = effectiveProfile(profile, summary);
  const profileFile = city.profile_files?.[targetBucket(profile.goal)] || city.file;

  useEffect(() => {
    const restore = () => {
      const { profile: restored, corrected } = readProfile(window.location.search, summary);
      setProfile(restored); setDraft(restored); setGoalText(clock(restored.goal * 60)); setCustomGoal(!GOAL_PRESETS.includes(restored.goal)); setPreviousText(restored.previous === null ? '' : clock(restored.previous * 60));
      setOptionalOpen(restored.gender !== 'all' || restored.previous !== null); setFormError('');
      setUrlNotice(corrected ? 'Some link settings were invalid. The corrected profile is shown below and in the address.' : '');
      window.history.replaceState(null, '', `${window.location.pathname}?${profileSearch(restored)}${window.location.hash}`);
      setReady(true);
    };
    restore();
    window.addEventListener('popstate', restore);
    return () => window.removeEventListener('popstate', restore);
  }, [summary]);

  useEffect(() => {
    if (!ready) return;
    const controller = new AbortController(); let active = true;
    setData(null); setLoadError('');
    loadAggregate<CityData>(profileFile, summary.as_of, controller.signal).then(value => {
      if (value.city !== city.city || !value.cohorts) throw new Error('This course comparison is not available.');
      if (active) { setData(value); setLoadedFile(profileFile); }
    }).catch(e => { if (active && e.name !== 'AbortError') setLoadError(loadMessage); });
    return () => { active = false; controller.abort(); };
  }, [ready, city.city, profileFile, summary.as_of, retry]);

  useEffect(() => {
    if (!ready || !city.near_index) return;
    const controller = new AbortController(); let active = true;
    setNearData(null); setNearError('');
    const load = async () => {
      const index = await loadAggregate<FileIndex>(city.near_index!, summary.as_of, controller.signal);
      if (index.city !== city.city || !index.files[String(profile.goal)]) throw new Error(loadMessage);
      const value = await loadAggregate<NonNullable<typeof nearData>>(index.files[String(profile.goal)], summary.as_of, controller.signal);
      if (value.city !== city.city || value.target !== profile.goal || !value.near) throw new Error(loadMessage);
      if (active) setNearData(value);
    };
    load().catch(e => { if (active && e.name !== 'AbortError') setNearError(loadMessage); });
    return () => { active = false; controller.abort(); };
  }, [ready, city.city, city.near_index, profile.goal, summary.as_of, nearRetry]);

  const answers = useMemo(() => {
    if (!data || data.city !== profile.city || loadedFile !== profileFile) return [];
    const currentNear = nearData?.city === profile.city && nearData.target === profile.goal ? nearData : null;
    const complete = currentNear ? { ...data, cohorts: Object.fromEntries(Object.entries(data.cohorts).map(([key, row]) => [key, { ...row, near: currentNear.near[key] || [] }])) } : data;
    const all = buildGuide(complete, summary, effectiveProfile(profile, summary)), top = priorities[profile.focus];
    if (city.near_index && !currentNear) {
      const sections = all.find(a => a.id === 'sections')!;
      sections.answer = nearError ? 'The nearby-finish comparison could not load.' : 'Loading nearby-finish comparisons…';
      sections.detail = nearError ? 'The other analyses remain available. Use the retry button below to load this comparison.' : '';
    }
    return [...top.map(id => all.find(answer => answer.id === id)!), ...all.filter(answer => !top.includes(answer.id))];
  }, [data, summary, profile, loadedFile, profileFile, nearData, nearError, city.near_index]);
  const notices = [...new Set(answers.map(a => a.widened).filter(Boolean))];

  useEffect(() => {
    if (!answers.length) return;
    const hash = window.location.hash.slice(1);
    if (answers.some(answer => `guide-${answer.id}` === hash)) document.getElementById(hash)?.scrollIntoView();
  }, [answers.length]);

  return <article className="personalized-guide">
    <header className="guide-intro"><h1>Your race, in context.</h1><p>12 questions for your course, age and time, drawn from {count(summary.n)} eligible finishes.</p></header>
    <form className="guide-profile guide-form" onSubmit={event => {
      event.preventDefault();
      const goal = parseMinutes(goalText), previous = previousText.trim() ? parseMinutes(previousText) : null;
      if (goal === null || goal < 150 || goal > 270) { setFormError('Enter a target from 2:30 to 4:30 in hours:minutes, such as 2:57.'); return; }
      if (previousText.trim() && (previous === null || previous < 120 || previous > 720)) { setFormError('Enter an earlier marathon time from 2:00 to 12:00 as hours:minutes, such as 3:10, or leave it blank.'); return; }
      const next = { ...draft, goal, previous }; setProfile(next); setDraft(next); setFormError(''); setUrlNotice('');
      const nextSearch = profileSearch(next);
      if (nextSearch !== window.location.search.slice(1)) window.history.pushState(null, '', `${window.location.pathname}?${nextSearch}`);
    }}>
      <div className="guide-fields">
        <label>Marathon<select value={draft.city} onChange={event => setDraft({ ...draft, city: event.target.value })}>{summary.cities.map(c => <option key={c.city} value={c.city}>{c.city}{c.limited ? ' (limited coverage)' : ''}</option>)}</select></label>
        <label>I want to…<select value={draft.focus} onChange={event => setDraft({ ...draft, focus: event.target.value as Focus })}>{Object.entries(focusLabels).map(([key, value]) => <option key={key} value={key}>{value}</option>)}</select></label>
        <label>{draft.focus === 'review' ? 'Time to compare' : 'Target time'}<select value={customGoal ? 'custom' : String(parseMinutes(goalText))} onChange={event => { setCustomGoal(event.target.value === 'custom'); if (event.target.value !== 'custom') setGoalText(clock(Number(event.target.value) * 60)); }}><option value="custom">Custom time</option>{GOAL_PRESETS.map(goal => <option value={goal} key={goal}>Sub-{clock(goal * 60)}</option>)}</select></label>
        {customGoal && <label>Custom time (h:mm)<input value={goalText} onChange={event => setGoalText(event.target.value)} placeholder="e.g. 2:57" aria-describedby="guide-target-note" spellCheck={false} /></label>}
        <label>Age group<select disabled={draftCity.ages?.length === 0} value={draftCity.ages?.length === 0 ? 'all' : draft.age} onChange={event => setDraft({ ...draft, age: event.target.value })}>{AGE_OPTIONS.map(age => <option key={age} value={age}>{age === 'all' ? 'All ages' : age}</option>)}</select>{draftCity.ages?.length === 0 && <span>No publishable exact-age groups for this course.</span>}</label>
      </div>
      <details className="guide-optional" open={optionalOpen} onToggle={event => setOptionalOpen(event.currentTarget.open)}><summary>Optional: gender and previous marathon</summary><div className="guide-fields">
        <label>Gender<select value={draft.gender} onChange={event => setDraft({ ...draft, gender: event.target.value })}><option value="all">All recorded categories</option>{['Men', 'Women'].map(gender => <option key={gender} value={gender} disabled={!!draftCity.genders && !draftCity.genders.includes(gender)}>{gender}{draftCity.genders && !draftCity.genders.includes(gender) ? ' (no publishable group)' : ''}</option>)}</select></label>
        <label>Previous marathon (h:mm)<input value={previousText} onChange={event => setPreviousText(event.target.value)} placeholder="e.g. 3:10" aria-describedby="guide-previous-note" spellCheck={false} /></label>
      </div><p className="study-meta" id="guide-previous-note">An earlier time selects a 15-minute band of recorded bests from earlier years. Leave it blank for broader field comparisons.</p></details>
      <p className="study-meta" id="guide-target-note">Targets are comparison thresholds. Historical runners’ declared goals are unknown.</p>
      {formError && <p role="alert" className="guide-error">{formError}</p>}
      <button className="guide-submit" type="submit">Update my comparisons</button>
    </form>
    {urlNotice && <p className="study-meta" role="status">{urlNotice}</p>}
    <p className="guide-selection" aria-live="polite">{profile.city} · {profile.age === 'all' ? 'all ages' : `age ${profile.age}`} · sub-{clock(profile.goal * 60)} · {profile.gender === 'all' ? 'all recorded categories' : profile.gender}{profile.previous !== null && ` · previous marathon ${clock(profile.previous * 60)}`}</p>
    <p className="study-meta">{focusLabels[profile.focus]}: the three most relevant questions appear first. Each answer identifies its actual comparison group and any broader filters used.</p>
    {city.limited && <p className="guide-coverage-notice"><strong>Limited coverage:</strong> {count(city.n)} eligible finishes across {city.editions} represented edition{city.editions === 1 ? '' : 's'}. This sample may cover only part of the field and cannot represent a typical entrant. Many comparisons are unavailable.</p>}
    {city.ages?.length === 0 && <p className="study-meta guide-widened">{city.city} has no publishable exact-age groups. The comparisons below use all ages.</p>}
    {city.genders && city.genders.length < 2 && <p className="study-meta guide-widened">Published gender groups on this course: {city.genders.join(', ') || 'none'}. All-category results can be dominated by this coverage.</p>}
    {applied.gender !== profile.gender && <p className="study-meta guide-widened">The selected {profile.gender} group has insufficient coverage. The comparisons below use all recorded categories.</p>}
    <p className="study-meta">Edition counts mean editions represented in this sample, including partial coverage. They do not count complete race fields.</p>
    {loadError ? <div className="guide-error" role="alert"><p>{loadError}</p><button type="button" onClick={() => setRetry(x => x + 1)}>Try again</button></div> : !answers.length ? <p role="status" className="answer-state">Loading comparisons for {profile.city}…</p> : <>
      <details className="question-index guide-index"><summary>Explore all 12 personalized questions</summary><ol className="contents-list">{answers.map((answer, i) => <li key={answer.id}><a href={`#guide-${answer.id}`}><span className="contents-number">{i + 1}</span><span>{answer.title}</span></a></li>)}</ol></details>
      {notices.length > 0 && <details className="guide-fallbacks"><summary>Some comparisons use broader groups</summary>{notices.map(note => <p className="study-meta" key={note}>{note}</p>)}<p className="study-meta">The comparison line under each answer identifies the group actually used.</p></details>}
      <div className="question-list">{answers.map((answer, i) => <Fragment key={answer.id}><Answer answer={answer} number={i + 1} summary={summary} profile={applied} />{answer.id === 'sections' && nearError && <button type="button" onClick={() => setNearRetry(x => x + 1)}>Retry nearby-finish comparison</button>}</Fragment>)}</div>
    </>}
    <p className="guide-source study-meta">Data through {new Date(summary.input_as_of).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}. <a href={`${basePath}/data/packs/${GUIDE_PACK}/pack_meta.json`}>Coverage and calculation details</a>. Historical route validity and runners’ declared goals are unavailable.</p>
    <p><Link href="/">Explore the 35 broader research questions</Link></p>
  </article>;
}
