import Link from 'next/link';
import { getLive, getStudyAnswer } from '@/lib/research-data';
import { QUESTIONS } from '@/lib/question-catalog';
import { getExtensions } from '@/lib/extension-data';

export const metadata = { title: 'Methodology | Marathon Pacing Study' };

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
  const extension = getExtensions()[0];
  return <article className="prose">
    <h1>How we study marathon pacing</h1>
    <p className="answer">The study follows the whole race: how runners start, distribute their speed, respond to the course, finish, and improve over time.</p>
    <h2>Four things we want to understand</h2>
    <ul>
      <li><strong>Performance:</strong> finish time relative to a runner’s previous ability and race conditions.</li>
      <li><strong>Execution:</strong> the distribution of pace across the full distance, including consistency, changes between halves, and finishing acceleration.</li>
      <li><strong>Adaptation:</strong> how pace changes with terrain, weather, congestion, and other runners.</li>
      <li><strong>Development:</strong> how the same runner’s approach and results change across marathons.</li>
    </ul>
    <h2>What is available now?</h2>
    {extension && <p>The latest analyzed export contains {new Intl.NumberFormat('en-US').format(extension.corpus.n_records)} race records across {extension.corpus.n_cities} cities and {extension.corpus.n_race_years} race editions. Individual splits are analyzed privately; only aggregate results appear here.</p>}
    {live?.corpus && <p>The original wall study has its own snapshot: {new Intl.NumberFormat('en-US').format(live.corpus.n_records || 0)} recorded finishes across {live.corpus.n_cities} cities, with reported coverage from {live.corpus.year_min} to {live.corpus.year_max}. Its counts are separate from the newer pacing analyses.</p>}
    <p>The site combines newly calculated pacing results with earlier published summary tables. Each answer identifies its sources and eligible sample. Some questions remain research plans; their “Next analysis” sections describe work still to be done.</p>
    <p>A finish is one performance, so a runner can contribute several. Individual tables can have smaller samples or earlier publication dates than the main snapshot. Each question links its source and reports counts where available.</p>
    <h2>How to read the pacing charts</h2>
    <ul>
      <li><strong>New full-course profiles:</strong> normalize each runner’s section pace by that runner’s full-marathon average, then take the median across runners. Below zero means faster than the individual marathon average. Earlier supporting charts based on course means retain their own labels.</li>
      <li><strong>Equal-distance pace retention:</strong> compare 20–40 km with 0–20 km. Positive values mean the second 20 km was slower. The final 2.195 km is separate. This is not a half-marathon split; CORE does not provide a 21.0975 km checkpoint.</li>
      <li><strong>New pattern shares:</strong> a faster second 20 km means more than 2% faster; similar means within 2%; moderate slowing is more than 2% through 10%; pronounced slowing is more than 10%. Older classifications have different, incompletely documented definitions.</li>
      <li><strong>Exceptional-performance frequency:</strong> exceptional finishes divided by all classified finishes within a pacing pattern. This differs from asking what share of exceptional races used that pattern.</li>
      <li><strong>Missing values:</strong> unknown measurements stay missing. They are never plotted as zero.</li>
    </ul>
    <p>A median profile is a summary across runners, not one runner’s race or an optimal strategy. These initial results describe the observed dataset; confidence intervals accounting for repeated runners and race editions have not yet been calculated.</p>
    <p>Every section must be compared as pace or weighted by its distance. The final 2.195 km is shorter than a 5 km section. Twenty kilometers is before halfway, which is 21.0975 km.</p>
    <h2>What counts as a good performance?</h2>
    <p>The new analyses require complete, strictly increasing checkpoints, a 90-minute to 12-hour finish, and section paces of 2–20 minutes per km. Missing or invalid readings are excluded, never repaired by guessing. These filters may exclude genuine unusual performances; sample counts and exclusions are recorded with each analysis.</p>
    <p>The intended benchmark is an expectation established before the race, using only earlier performances and the relevant course and conditions. The existing “exceptional” labels are supplied by a summary table; their threshold is not documented well enough to treat them as that validated benchmark.</p>
    <p>Finishing-time groups are useful for describing race shapes. Strategy comparisons need ability known before the race, so that the result is not also used to define the comparison group.</p>
    <p>CORE contains runner names but no verified identity key spanning races. Personal-best and learning analyses need reliable linkage before they can be recalculated. Exact-age analyses exclude records with only age-group labels. Course overlays lack validity years, so historical terrain has not been assigned to the new runner-level analyses.</p>
    <h2>What can these comparisons establish?</h2>
    <p>They describe associations. Runners selecting different strategies can also differ in fitness, experience, goals, or conditions. Comparisons should account for these differences and report sample sizes and uncertainty.</p>
    <p>Predictions must use information available at the checkpoint being studied and be tested on unseen race editions. Declared goals should be distinguished from inferred time landmarks. An absence from the database does not establish that a runner stopped racing.</p>
    <p>Splits measure time and pace. Physiological effort, fueling, intentions, and training need additional evidence. Terrain-adjusted pace is an estimated proxy, especially when a 5 km section contains both climbs and descents.</p>
    <h2>How the questions fit together</h2>
    <p>The {QUESTIONS.length} questions are organized around race strategy, courses and conditions, goals and finishing, runner differences, and learning over time. The original question lists are incorporated, alongside six additions about successful strategies, personal-best gains, congestion, consistency, and course adaptation.</p>
    <details className="methodology">
      <summary>Focused analysis: hitting the wall</summary>
      <div className="methodology-content">
        <p>{study.method[0]}</p>
        <p>This definition identifies sustained slowing. It cannot determine whether the cause was fuel depletion, injury, fatigue, walking, or another factor. It is one outcome within the wider pacing study.</p>
        <p>The approach follows <a href="https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0251513">Smyth’s 2021 study</a>. <Link href="/htw">Explore the focused wall analysis</Link>.</p>
      </div>
    </details>
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
