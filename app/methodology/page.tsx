import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Methodology — HTW Live Study',
};

export default function MethodologyPage() {
  return (
    <div className="panel">
      <h1 style={{ marginTop: 0 }}>Methodology</h1>
      <p className="site-subtitle" style={{ marginTop: '-0.5rem' }}>
        How this site reproduces the “hitting the wall” (HTW) definition from Smyth 2021 (PLOS ONE).
      </p>

      <h2>HTW definition</h2>
      <ol>
        <li>
          <b>Base pace</b>: computed as the mean pace across 5–10 km, 10–15 km, and 15–20 km split
          segments. These mid-race segments are used to avoid early-race variability.
        </li>
        <li>
          <b>HTW event</b>: a runner is considered to have “hit the wall” if, after 20 km,
          their pace slows by <b>≥ 25%</b> relative to their base pace, sustained for a continuous distance of
          <b> ≥ 5 km</b>.
        </li>
      </ol>
      <p>
        Formally, with base pace \( p_b \) and observed pace \( p_d \) at distance \( d \ge 20 \) km, an HTW episode
        occurs when \( p_d \ge (1 + \\text&#123;DoS&#125;) \cdot p_b \) for a continuous window of at least \( \\text&#123;LoS&#125; \) km,
        where DoS = 0.25 and LoS = 5 km.
      </p>

      <h2>Filters</h2>
      <ul>
        <li><b>Sex</b>: male, female (or all).</li>
        <li><b>Age group</b>: 20–39, 40–44, 45–49, 50–54, 55–59, 60+ (or all).</li>
        <li><b>Ability</b>: 30-minute PB buckets (e.g., &lt;3:00, 3:00–3:29, …, 5:00+).</li>
      </ul>

      <h2>Figures</h2>
      <p>
        Six figures mirror the paper exactly:
        (1) HTW proportion vs DoS/LoS thresholds (sensitivity);
        (2) HTW by age and by ability;
        (3) HTW vs years before/after a recent PB;
        (4) Fig 3 split by age and ability;
        (5) HTW start, distance, and slowdown by age and ability;
        (6) HTW finish time and time cost by age and ability.
        All are split by sex and support the filters above.
      </p>
      <p>
        When live data are not present, figures and tables display an honest empty state. If we include any redraws of the 2021
        paper for context, they are explicitly labeled <b>“Smyth 2021 (published)”</b> and never treated as live data.
      </p>

      <h2>Data contract</h2>
      <p>
        The site reads a single JSON at <code>public/data/live.json</code> with the following shape:
      </p>
      <pre style={{ whiteSpace: 'pre-wrap', overflowX: 'auto' }}>
{`{
  "status": "empty" | "ready",
  "as_of": string | null,            // ISO timestamp for live data snapshot
  "definition": { "dos": 0.25, "los_km": 5, "after_km": 20, "base_window_km": [5, 20] },
  "corpus": { "races": number|null, "runners": number|null, "records": number|null },
  "figures": {
    "fig1": { /* implementation-defined series */ },
    "fig2": { /* implementation-defined series */ },
    "fig3": { /* implementation-defined series */ },
    "fig4": { /* implementation-defined series */ },
    "fig5": { /* implementation-defined series */ },
    "fig6": { /* implementation-defined series */ }
  } | null,
  "tables": {
    "t1": { /* implementation-defined */ },
    "t2": { /* implementation-defined */ },
    "t3": { /* implementation-defined */ },
    "t4": { /* implementation-defined */ }
  } | null
}`}
      </pre>
      <p>
        Start with <code>status: "empty"</code>. Do not invent live numbers. When moving to <code>"ready"</code>, add data
        that each component understands (for example, figures may expect a <code>series</code> array of <code>&#123;name, value&#125;</code> objects).
      </p>

      <h2>Repro notes</h2>
      <ul>
        <li>Split data must include 5-km segments to compute base pace and detect HTW windows.</li>
        <li>Bias checks: filters are applied consistently before aggregations.</li>
        <li>All computations are done offline; this UI is a static site with client-side rendering.</li>
      </ul>
    </div>
  );
}
