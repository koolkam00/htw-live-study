export type Sex = 'all' | 'male' | 'female';

export type AgeGroup =
  | 'all'
  | '20-39'
  | '40-44'
  | '45-49'
  | '50-54'
  | '55-59'
  | '60+';

export type AbilityBucket =
  | 'all'
  | '<3:00'
  | '3:00–3:29'
  | '3:30–3:59'
  | '4:00–4:29'
  | '4:30–4:59'
  | '5:00+';

export interface HtwDefinition {
  dos: number; // degree of slowdown threshold (e.g., 0.25 for 25%)
  los_km: number; // length of slowdown (km) threshold (e.g., 5)
}

export interface CorpusCounts {
  races: number | null;
  runners: number | null;
  records: number | null;
}

export type FigureDataset = Record<string, unknown>;

export interface LiveJson {
  status: 'empty' | 'ready';
  as_of: string | null;
  definition: HtwDefinition;
  corpus: CorpusCounts;
  figures: {
    fig1?: FigureDataset;
    fig2?: FigureDataset;
    fig3?: FigureDataset;
    fig4?: FigureDataset;
    fig5?: FigureDataset;
    fig6?: FigureDataset;
  };
}

export interface Filters {
  sex: Sex;
  ageGroup: AgeGroup;
  ability: AbilityBucket;
}
