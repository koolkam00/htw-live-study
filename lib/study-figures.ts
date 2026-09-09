import { getLive, liveRows, type ChartSpec } from './research-data';
import { finite, type DataRow } from './csv';

export type StudyFigureData = { id: string; title: string; answer: string; method: string[]; charts: ChartSpec[] };
type PublishedPanel = { title: string; xLabel: string; yLabel: string; series: { id: string; label: string; sex?: string; x: (string | number)[]; y: (number | null)[] }[] };

const definitions = [
  {
    id: 'fig1', title: 'How much does the wall definition matter?',
    answer: 'A stricter definition finds fewer wall episodes. Both the amount of slowing and how long it lasts change the reported rate.',
    method: ['Each curve changes the minimum slowdown while keeping the minimum distance fixed. The main study uses a 25% slowdown sustained for at least 5 km after 20 km, relative to the 5–20 km reference pace.'],
    titles: ['Slowing sustained for at least 5 km', 'Slowing sustained for at least 10 km', 'Slowing sustained for at least 15 km', 'Slowing sustained for at least 20 km'],
  },
  {
    id: 'fig2', title: 'How does wall frequency vary by age and ability?',
    answer: 'These wall rates describe the repeaters subset: runners with multiple linked races. Its age-group percentages differ from the original-dataset age chart above because it contains different finishes.',
    method: ['Use the published repeaters age table (t4) and recent-personal-best group figure. These are linked-history subsets, not the original-dataset age table (t2). A reported age or linked performance history may be missing. These comparisons do not isolate age or fitness effects.'],
    titles: ['Wall rate by age group · repeaters subset', 'Wall rate by recorded recent best · linked histories'],
  },
  {
    id: 'fig3', title: 'What happens around a personal best?',
    answer: 'Wall rates are lower around the year of a recorded personal best. A strong performance and less slowing naturally overlap, so this does not establish a before-and-after training effect.',
    method: ['Compare recorded races by their year relative to an observed personal best. Year zero includes the personal-best year; it is not a distinct pre-race ability measure.', 'Only linked performance histories can enter this comparison. Unequal follow-up, missing races, and the choice of personal-best window affect the result.'],
    titles: ['Wall rate by years from a personal best', 'Wall rate in periods before and after a personal best'],
  },
  {
    id: 'fig4', title: 'Does the personal-best pattern vary between groups?',
    answer: 'The study separates runners by age and whether their recorded best is under four hours. Each selection shows the same comparison around a personal best for that group.',
    method: ['These are published subgroup summaries, not adjusted estimates. Compare shapes with care: the figure data do not supply sample counts or uncertainty intervals for each point.'],
    titles: ['Under 40 · best under 4 hours', '40 and over · best under 4 hours', 'Under 40 · best 4 hours or more', '40 and over · best 4 hours or more'],
  },
  {
    id: 'fig5', title: 'When does slowing begin, and how long does it last?',
    answer: 'Among runners with a detected wall, average onset is near 30 km across age groups. The distance and severity of slowing provide different views of the same episode.',
    method: ['These summaries describe detected wall episodes. Start distance is resolved from timing segments, not the exact moment a runner began to struggle.', 'Severity is a pace slowdown relative to the reference; distance is the recorded length of the qualifying episode.'],
    titles: ['Average start distance by age', 'Average start distance by recorded recent best', 'Average episode length by age', 'Average episode length by recorded recent best', 'Average slowdown by age', 'Average slowdown by recorded recent best'],
  },
  {
    id: 'fig6', title: 'How much time is associated with the wall?',
    answer: 'The figures summarize finish times and estimated time costs among runners with a detected wall. An estimated cost is not an amount an individual could necessarily recover.',
    method: ['Finish time and the exported cost measures are separate summaries. The cost formula needs fuller documentation before it can support an individual prediction.', 'These are descriptive group means. Training, conditions, and the reason for slowing are not identified by the timing record.'],
    titles: ['Average finish time by age', 'Average finish time by recorded recent best', 'Estimated time cost by age', 'Estimated time cost by recorded recent best', 'Estimated relative cost by age', 'Estimated relative cost by recorded recent best'],
  },
];

const periodLabels: Record<string, string> = { '4-9_before': '4–9 years before', '1-3_before': '1–3 years before', '1-3_after': '1–3 years after', '4-9_after': '4–9 years after' };

export function getStudyFigures(): StudyFigureData[] {
  const live = getLive();
  if (!['ready', 'ok'].includes(live?.status)) return [];
  return definitions.flatMap(definition => {
    const panels = live?.figures?.[definition.id]?.panels as PublishedPanel[] | undefined;
    if (!Array.isArray(panels)) return [];
    const charts = panels.flatMap((panel, index): ChartSpec[] => {
      if (!Array.isArray(panel.series) || !definition.titles[index]) return [];
      const percent = ['HTW proportion', 'DoS', 'fraction'].includes(panel.yLabel);
      const seriesOrder = ['F', 'M', 'all'];
      const series = [...panel.series].sort((a, b) => seriesOrder.indexOf(a.sex || a.label) - seriesOrder.indexOf(b.sex || b.label));
      const points = new Map<string | number, DataRow>();
      for (const [seriesIndex, curve] of series.entries()) {
        if (!Array.isArray(curve.x) || !Array.isArray(curve.y)) continue;
        curve.x.forEach((x, i) => {
          const label = panel.xLabel === 'DoS' ? Number(x) * 100 : periodLabels[String(x)] || x;
          const point = points.get(x) || { label };
          const y = finite(curve.y[i]);
          point[`s${seriesIndex}`] = y === null ? null : y * (percent ? 100 : 1);
          if (definition.id === 'fig2' && index === 0) {
            const sample = liveRows('t4').find(row => row.age_group === x && row.sex === (curve.sex || curve.label));
            point[`n_s${seriesIndex}`] = finite(sample?.n);
          }
          points.set(x, point);
        });
      }
      const ability = panel.xLabel === 'recent PB (min)';
      const xNumeric = ['DoS', 'recent PB (min)', 'years from PB'].includes(panel.xLabel);
      const xLabel = ({ DoS: 'Minimum slowdown (%)', 'recent PB (min)': 'Recent best (hours:minutes)', 'years from PB': 'Years from personal best', 'age group': 'Age group', period: 'Period' } as Record<string, string>)[panel.xLabel] || panel.xLabel;
      return [{
        title: definition.titles[index], kind: panel.xLabel === 'period' || panel.xLabel === 'age group' ? 'bars' : 'line', xNumeric, xLabel,
        xUnit: ability ? 'finish' : '', unit: percent ? '%' : definition.id === 'fig6' && index < 2 ? 'finish' : panel.yLabel,
        rows: [...points.values()], series: series.map((curve, i) => ({ key: `s${i}`, label: ({ F: 'Women', M: 'Men', all: 'All runners' } as Record<string, string>)[curve.sex || curve.label] || curve.label })),
        note: definition.id === 'fig2' && index === 0 ? 'Repeaters subset, using the published t4 counts. A runner can contribute several finishes. This is a different cohort from the original-dataset age chart above. Uncertainty intervals are not supplied.' : ability ? 'Linked performance histories with a recorded recent best. Labels are the lower edges of the source’s time groups. Implausibly fast groups and sparsely populated extremes need validation; point counts are not supplied.' : 'Percentages and means use each published group. Point counts and uncertainty intervals are not supplied in this figure export.',
      }];
    });
    return charts.length ? [{ id: definition.id, title: definition.title, answer: definition.answer, method: definition.method, charts }] : [];
  });
}
