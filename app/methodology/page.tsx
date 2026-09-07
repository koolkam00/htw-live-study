import Link from 'next/link';
import { getLive, getStudyAnswer } from '@/lib/research-data';

export const metadata = { title: 'Methodology | HTW Live Study' };

const additions = [
  { name: 'Hourly weather', fields: 'Temperature, dew point, humidity, rain, wind, cloud cover, and solar radiation.', benefit: 'Match conditions to the time each runner reaches a segment. Use a consistent historical model across years.', href: 'https://open-meteo.com/en/docs/historical-weather-api', source: 'Open-Meteo historical weather', coverage: 'Broad historical coverage; modeled grid estimates, not conditions measured at the runner.' },
  { name: 'Weather-station observations', fields: 'Observed temperature, dew point, wind, and precipitation, with station location and quality flags.', benefit: 'Check unusual weather days against observations near the course.', href: 'https://www.ncei.noaa.gov/products/global-historical-climatology-network-hourly', source: 'NOAA GHCN hourly', coverage: 'Station and year coverage vary. The newer GHCN hourly archive replaces ISD.' },
  { name: 'The route for each race edition', fields: 'Course geometry, checkpoint locations, certification ID, route changes, and separate start routes.', benefit: 'Calculate section distance, turns, road direction, and the route actually used that year.', href: 'https://certifiedroadraces.com/search/', source: 'USATF course certification database', coverage: 'US courses; use each organizer’s dated maps elsewhere. Older routes often need manual recovery.' },
  { name: 'Elevation and slope by section', fields: 'Climb, descent, net elevation change, and grade along the route.', benefit: 'Separate terrain-related pacing patterns from a runner’s unusual slowdown.', href: 'https://www.opentopodata.org/datasets/srtm/', source: 'Open Topo Data / SRTM', coverage: 'Available for route coordinates. Check bridges and tunnels separately: terrain height may differ from the road deck.' },
  { name: 'Waves, corrals, and actual start times', fields: 'Wave schedule, runner corral, chip start, gun finish, and timing conventions.', benefit: 'Estimate time-of-day exposure and establish who was together at a checkpoint.', href: 'https://www.chicagomarathon.com/event-info/participant-information/', source: 'Official participant information', coverage: 'Schedules are commonly published; individual start timestamps depend on the timing provider. A wave start is not an individual start.' },
  { name: 'Aid stations and course amenities', fields: 'Water and fuel locations, supplied products, medical stations, toilets, and station changes by year.', benefit: 'Compare local pacing patterns with where runners can stop or refuel.', href: 'https://www.chicagomarathon.com/event-info/participant-information/course/', source: 'Official course and aid-station guide', coverage: 'Often available in participant guides. Product availability does not reveal what any runner consumed.' },
  { name: 'Qualifying rules and entry routes', fields: 'Published time standards, eligible age, qualifying window, acceptance cutoff, and entry category where public.', benefit: 'Study goal incentives and account for differences in who enters each race.', href: 'https://www.baa.org/races/boston-marathon/qualify/', source: 'Boston Athletic Association', coverage: 'Use dated rules and announcements. Historical records need an edition-by-edition audit.' },
  { name: 'Air quality', fields: 'Particle pollution, ozone, and other pollutants at the race location and time.', benefit: 'Explore whether poor-air-quality editions have different pacing patterns.', href: 'https://ads.atmosphere.copernicus.eu/datasets/cams-global-reanalysis-eac4', source: 'Copernicus CAMS reanalysis', coverage: 'Historical modeled coverage from 2003; spatial resolution is too coarse to represent every street.' },
];

export default function MethodologyPage() {
  const study = getStudyAnswer();
  const live = getLive();
  return <article className="prose">
    <h1>How to read the results</h1>
    <p className="answer">Each question pairs a finding with the data behind it. Some results are descriptive; others need more information before the full question can be answered.</p>
    <h2>What counts as hitting the wall?</h2>
    <p>{study.method[0]}</p>
    <p>A sustained slowdown is observable in the splits. Its cause is not. The method follows the pacing-based approach in <a href="https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0251513">Smyth’s 2021 study</a>.</p>
    <h2>What is in this snapshot?</h2>
    {live?.corpus && <p>{new Intl.NumberFormat('en-US').format(live.corpus.n_records || 0)} recorded finishes across {live.corpus.n_cities} cities, with reported coverage from {live.corpus.year_min} to {live.corpus.year_max}. Coverage is uneven: this is not every runner at every marathon in every year.</p>}
    <p>A finish is one race performance. A runner can contribute several finishes. Age and weather analyses can have smaller samples because the necessary fields are missing for some records.</p>
    <h2>What do the chart numbers mean?</h2>
    <ul>
      <li><strong>Wall rate:</strong> the percentage of eligible finishes meeting the sustained-slowdown definition.</li>
      <li><strong>Second-half slowing:</strong> second-half pace divided by first-half pace, minus one. A value of 10% means the second half was run at a pace 10% slower.</li>
      <li><strong>Sample size:</strong> the observations behind a particular value. Open “View exact values” for counts where the source provides them.</li>
      <li><strong>Missing values:</strong> unknown measurements stay missing. They are never plotted as zero.</li>
    </ul>
    <h2>What can these comparisons establish?</h2>
    <p>They describe associations in observed race results. Comparing different runners, courses, or years does not by itself isolate a pacing strategy’s effect.</p>
    <p>Some available exports answer only part of the proposed question. For example, an age-group comparison is not a study of the same runners aging, and a fastest-city table is not a personal course conversion. Each question explains the remaining gap.</p>
    <p>Five-kilometer splits identify an interval of slowdown, not an exact onset point. The final segment is 2.195 km and must be converted to pace before comparison. A 20 km checkpoint is before halfway, which is 21.0975 km.</p>
    <h2>How the question lists fit together</h2>
    <p>The original 26 questions retain their numbers. The first list adds question 27, the course-by-course wall map; question 28, personal pacing versus a difficult race day; and question 29, what happens when a goal slips away. Personal course translation is included in question 12.</p>
    <details className="methodology" id="additional-data">
      <summary>Additional web data that could strengthen the study</summary>
      <div className="methodology-content">
        <p>Start with dated course routes, hourly weather, and start times. These are proposed sources for extending and validating the dataset; availability here does not mean every source has already been joined.</p>
        {additions.map(item => <section key={item.name}>
          <h3>{item.name}</h3>
          <p>{item.fields} {item.benefit}</p>
          <p className="study-meta">{item.coverage} <a href={item.href}>{item.source}</a>.</p>
        </section>)}
        <h3>More fields to retain from official results</h3>
        <p>Keep all published timing points, including halfway and the finish; bib and provider IDs; reported age and category; gun and chip times; official finish, withdrawal, disqualification, and non-start statuses; and result corrections. Availability varies by organizer and year.</p>
        <p>Do not infer a withdrawal from one missing timing read, or a debut marathon from a runner’s first appearance in this database.</p>
        <h3>Preserve the evidence</h3>
        <p>For every added field, retain its source URL, race edition, retrieval date, original unit, and whether it was observed, modeled, or inferred. Keep one weather record per place and time, then join it to estimated segment exposure. Between timing mats, a runner’s exact location is an estimate.</p>
        <p>Hourly wind plus route direction can estimate headwind exposure. Route geometry can estimate turn counts. Crowd density, shade, training, shoes, and individual fueling are harder to reconstruct consistently over 20 years and should not be assumed.</p>
      </div>
    </details>
    <div className="source-links"><Link href="/">Return to the questions</Link><a href={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/data/live.json`}>Download the study snapshot</a></div>
  </article>;
}
