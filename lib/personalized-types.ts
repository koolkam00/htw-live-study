export type Sample = { n: number; editions: number };
export type Distribution = Sample & { finish: number[]; cdf: number[]; retention: number; late: number; pace: number[][] };
export type NearResult = { target: number; below: Sample & { durations: number[] }; above: Sample & { durations: number[] } };
export type PersonalCohort = Distribution & {
  age: string; gender: string; prior: string;
  profiles: Record<string, Distribution>;
  openings: Record<string, Distribution>;
  near: NearResult[];
  weather: (Sample & { band: string; value: number })[];
  repeat?: Sample & { previous: number[]; current: number[]; finish_change: number };
  gains: Record<string, Sample & { values: number[]; total: number; previous: number; current: number }>;
  performance?: Sample & { values: number[] };
};
export type Terrain = { end: number; net: number; gain: number | null; loss: number | null };
export type CityData = { city: string; cohorts: Record<string, PersonalCohort>; terrain: Terrain[] };
export type CheckpointRow = Distribution & { age: string; gender: string; checkpoint: number; elapsed: number; trend: string };
export type CheckpointData = { city: string; rows: CheckpointRow[] };
export type CourseResult = Sample & { city: string; age: string; gender: string; prior: string; values: number[] };
export type PersonalSummary = {
  schema_version: 1; pack_id: string; as_of: string; export_id: string; input_as_of: string;
  n: number; age_n: number; history_n: number; analyses: number;
  cities: { city: string; file: string; checkpoint_file: string; n: number }[];
  courses: CourseResult[];
};
