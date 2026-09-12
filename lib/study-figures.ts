import { getStudyEvidence, type ChartSpec } from './research-data';

export type StudyFigureData = {
  id: string; title: string; answer: string; method: string[]; charts: ChartSpec[];
  sources: { href: string; label: string }[];
  releaseTag: string;
};

/** Every visible supporting figure is recalculated from the same pinned export. */
export function getStudyFigures(): StudyFigureData[] {
  const study = getStudyEvidence();
  if (!study) return [];
  return study.figures.filter(figure => figure.charts.some(chart => chart.rows.length)).map(figure => ({
    ...figure, releaseTag: study.release_tag,
    sources: [{ href: `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/data/study/evidence.json`, label: 'Current figure data, methods and source checksums' }],
  }));
}
