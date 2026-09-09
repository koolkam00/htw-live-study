export const MARATHON_SECTION_ENDS = [5, 10, 15, 20, 25, 30, 35, 40, 42.195];

export function sectionLabel(value: unknown, ends: number[] = MARATHON_SECTION_ENDS): string {
  const end = Number(value);
  const index = ends.findIndex(point => Math.abs(point - end) < 0.001);
  if (index < 0) return String(value ?? 'Not recorded');
  const start = index ? ends[index - 1] : 0;
  return `${start}–${ends[index]} km`;
}
