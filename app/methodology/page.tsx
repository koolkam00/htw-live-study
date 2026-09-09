import Link from 'next/link';
import { getLive, getStudyAnswer, getQuestions } from '@/lib/research-data';
import { QUESTIONS } from '@/lib/question-catalog';
import { getExtensions } from '@/lib/extension-data';
import { getPersonalMethod, getPersonalSummary } from '@/lib/personalized-data';
import { PERSONAL_QUESTIONS } from '@/lib/personalized-catalog';

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
  const questions = getQuestions();
  const calculated = questions.filter(question => question.dataset);
  const personalized = getPersonalSummary();
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
    <p>{calculated.length} of the {QUESTIONS.length} questions have results recalculated from the private export. Some are partial answers: a course comparison cannot isolate the course’s causal effect, and a route proxy cannot establish the hills used in an old edition. Group running and congestion require start and checkpoint clock times that are absent from this export.</p>
    <p>A finish is one performance, so a runner can contribute several. Individual tables can have smaller samples or earlier publication dates than the main snapshot. Each question links its source and reports counts where available.</p>
    <h2 id="personalized">Twelve questions for your race</h2>
    {personalized && <p>The personalized guide uses {new Intl.NumberFormat('en-US').format(personalized.n)} eligible finishes, including {new Intl.NumberFormat('en-US').format(personalized.age_n)} with an exact usable age. The usable earlier-benchmark cohort contains {new Intl.NumberFormat('en-US').format(personalized.history_n)} finishes. Combining course, age, recorded gender and earlier-time filters can make samples much smaller.</p>}
    <p>A visitor can choose a marathon, an age group, a threshold from 2:30 to 4:30, and optional recorded gender and previous marathon time. Preparing for a race, choosing a course and reviewing a past result reorder the same twelve questions. They do not change the evidence.</p>
    {getPersonalMethod().map((method, index) => <p key={`personal-common-${index}`}>{method}</p>)}
    <p>The visitor’s previous marathon time is compared with bands of earlier recorded bests, not an exact last-race match. A custom target can be any whole minute; success counts and nearby-finish comparisons use that exact threshold. Pacing profiles and improvement breakdowns use the clearly displayed 15-minute achieved-time band centered on the nearest preset, with the upper boundary excluded.</p>
    <p>Fallbacks keep the selected course and try broader age and gender groups before dropping an earlier-time restriction. Each answer prints its actual comparison group and identifies broadened filters. Cross-course comparisons use one common set of filters across all displayed courses. A missing comparison is not shown as zero. Age-group and course comparisons deliberately vary the dimension being compared.</p>
    <p>Checkpoint comparisons use current elapsed progress instead of previous marathon time. They match a two-minute elapsed-time interval and, when entered, the most recent 5 km pace relative to elapsed average pace. The entered time determines the required remaining pace exactly, while historical outcomes describe the full matching interval. These retrospective proportions have not been calibrated as personal forecasts.</p>
    {PERSONAL_QUESTIONS.map(question => <details className="methodology" key={question.id}><summary>{question.title}</summary><div className="methodology-content"><p>{question.method}</p><Link href={`/your-race#guide-${question.id}`}>Open this personalized question</Link></div></details>)}
    <p><a href={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/data/packs/ext_personalized_guide/pack_meta.json`}>Personalized analysis coverage, provenance and calculation details</a></p>
    <h2>How to read the pacing charts</h2>
    <p><strong>“40 km” means the 35–40 km section.</strong> Pace profiles show section averages at the section’s end distance, not instantaneous pace at that timing mat. An upward movement means slower pace. Joining two averages with a line does not establish a sudden change at either checkpoint.</p>
    <ul>
      <li><strong>New full-course profiles:</strong> normalize each runner’s section pace by that runner’s full-marathon average, then take the median across runners. Below zero means faster than the individual marathon average. Earlier supporting charts based on course means retain their own labels.</li>
      <li><strong>Equal-distance pace retention:</strong> compare 20–40 km with 0–20 km. Positive values mean the second 20 km was slower. The final 2.195 km is separate. This is not a half-marathon split; CORE does not provide a 21.0975 km checkpoint.</li>
      <li><strong>New pattern shares:</strong> a faster second 20 km means more than 2% faster; similar means within 2%; moderate slowing is more than 2% through 10%; pronounced slowing is more than 10%. Older classifications have different, incompletely documented definitions.</li>
      <li><strong>Exceptional-performance frequency:</strong> exceptional finishes divided by all classified finishes within a pacing pattern. This differs from asking what share of exceptional races used that pattern.</li>
      <li><strong>Missing values:</strong> unknown measurements stay missing. They are never plotted as zero.</li>
    </ul>
    <p>A median profile is a summary across runners, not one runner’s race or an optimal strategy. Outcome percentiles show variation between performances. Confidence intervals instead show uncertainty in an estimate; prediction intervals show a range for an individual future outcome. The charts keep these separate.</p>
    <p>Every section must be compared as pace or weighted by its distance. The final 2.195 km is shorter than a 5 km section. Twenty kilometers is before halfway, which is 21.0975 km.</p>
    <h2>What counts as a good performance?</h2>
    <p>The new analyses require complete, strictly increasing checkpoints, a 90-minute to 12-hour finish, and section paces of 2–20 minutes per km. Missing or invalid readings are excluded, never repaired by guessing. These filters may exclude genuine unusual performances; sample counts and exclusions are recorded with each analysis.</p>
    <p>The new history analyses use the fastest eligible finish in the two strictly earlier calendar years as a benchmark. A substantially improved performance is more than 2% faster than that recorded best. The benchmark describes prior performance; it is not a measurement of current fitness or a course-adjusted expected finish. Supplied “ability,” personal-best and exceptional-performance labels are not used to define the new outcomes.</p>
    <p>Performance change is 100 × (current finish ÷ earlier benchmark − 1). Opening change compares the first 10 km pace with that benchmark’s full-marathon average pace. Negative values mean faster. Faster openings are more than 2% faster, similar openings are within 2%, and slower openings are more than 2% slower. These thresholds are descriptive choices, not physiological boundaries.</p>
    <p>Finishing-time groups are useful for describing race shapes. Strategy comparisons need ability known before the race, so that the result is not also used to define the comparison group.</p>
    <h2>How we link runners without mixing up records</h2>
    <p>The full export supplies candidate runner identities, but its record IDs do not identify the same rows as the raw export. We join on race, city, year, trimmed lowercase name, finish time and every section duration, rounded to milliseconds. We retain only one-to-one matches and non-ambiguous supplied identities.</p>
    <p>We reject identity groups with conflicting recorded gender, inferred birth years spanning more than two years, or duplicate records in an edition. These checks reduce errors; they do not independently confirm that every identity link is correct. Names and runner IDs stay private.</p>
    <p>Using only strictly earlier years prevents current-race and same-year results from entering the prior benchmark. Personal-best gains compare with the fastest finish in earlier recorded years; they cannot establish a lifetime best. Race-pair analyses use adjacent observations with one race in each endpoint year. The interval analysis instead uses exact supplied dates, restricted to identity groups with complete, unique date coverage.</p>
    <p>Exact-age analyses exclude age-group-only records. Reported gender is used as supplied and is never inferred from names. Unknown categories are preserved in overall counts where the analysis permits them.</p>
    <h2>Matching, uncertainty and forecast validation</h2>
    <p>The opening-strategy comparison matches race edition, recorded gender and 15-minute bands of prior performance. All three opening groups need at least 20 finishes within a stratum; the smallest group supplies a common weight. Its 95% interval comes from 500 resamples of whole race editions. This accounts for edition clustering, but not a runner appearing across editions.</p>
    <p>Other charts are descriptive unless their individual methods state otherwise. A large runner count does not eliminate confounding or create thousands of independent weather observations. No significance ranking or claim of an optimal strategy is made from the many comparisons.</p>
    <p>The checkpoint forecast is trained on earlier years and tested on the latest three observed years. It compares even-pace extrapolation with a model calibrated to elapsed pace, and then adds the latest pace trend. All inputs are available at the checkpoint. Training cells need 100 records; sparse cells use a documented fallback. The site reports actual forecast error and observed coverage of an 80% prediction interval.</p>
    <p>The forecast test holds out entire later race editions. Runners can appear in both periods, but identities are not model inputs. The same complete-finish cohort is used at every checkpoint; these results do not predict withdrawals or apply automatically to runners with missing splits.</p>
    <h2>Weather, routes and qualifying rules</h2>
    <p>The weather overlay uses the Open-Meteo archive hour nearest the scheduled local start. Each temperature-band comparison gives equal weight to eligible race editions, with at least five editions per band. These modeled conditions are a start-hour proxy, not each runner’s exposure throughout the race.</p>
    <p>Course elevation comes from supplied GPX routes and digital elevation models, sometimes smoothed over 800 m. Historical validity years are absent. Terrain comparisons use the available city route as an explicitly labeled proxy; mixed hills, route changes, bridges and tunnels limit interpretation.</p>
    <p>The qualifying-rule comparison uses the B.A.A.’s published five-minute change for the 2020 Boston Marathon. It compares finish-time bunching around fixed old and new standards in 2016–2017 and 2019 for exact ages 18–31. It does not assign eligibility, acceptance, or declared Boston intentions. <a href="https://www.baa.org/news/2020-boston-marathon-qualifier-acceptances-announced/">Official standards and announcement</a>.</p>
    <h2>Return, missing follow-up and new exports</h2>
    <p>The near-miss analysis includes runners who have no later observed race. It requires two subsequent years of observed editions in the original city and excludes the latest two years as index races. Return means an eligible linked appearance anywhere in the export in the next two calendar years. Missing follow-up is never called retirement.</p>
    <p>Every calculation records the input export, checksums, method version, eligible count and exclusions. New private export releases can rerun the same calculations. Aggregate results are validated and reviewed before the website changes; the displayed export date identifies the data actually analyzed.</p>
    <h2>What can these comparisons establish?</h2>
    <p>They describe associations. Runners selecting different strategies can also differ in fitness, experience, goals, or conditions. Comparisons should account for these differences and report sample sizes and uncertainty.</p>
    <p>Predictions must use information available at the checkpoint being studied and be tested on unseen race editions. Declared goals should be distinguished from inferred time landmarks. An absence from the database does not establish that a runner stopped racing.</p>
    <p>Splits measure time and pace. Physiological effort, fueling, intentions, and training need additional evidence. Terrain-adjusted pace is an estimated proxy, especially when a 5 km section contains both climbs and descents.</p>
    <h2>How the questions fit together</h2>
    <p>The {QUESTIONS.length} questions are organized around race strategy, courses and conditions, goals and finishing, runner differences, and learning over time. The original question lists are incorporated, alongside six additions about successful strategies, personal-best gains, congestion, consistency, and course adaptation.</p>
    <h2 id="question-methods">Methods for every question</h2>
    <p>Open a question for its actual definitions, comparison groups, sample rules and limits. The result page contains the answer and charts.</p>
    {questions.map(question => <details className="methodology" key={question.id}>
      <summary>{question.number}. {question.title}</summary>
      <div className="methodology-content">
        {question.method.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
        {question.nextAnalysis && <p><strong>Still needed:</strong> {question.nextAnalysis.needs}</p>}
        <div className="source-links"><Link href={`/packs/${question.id}`}>Read the answer &amp; charts</Link>{question.sources.map(source => <a href={source.href} key={source.href}>{source.label}</a>)}</div>
      </div>
    </details>)}
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
