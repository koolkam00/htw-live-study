import type { GuideAnswer } from './personalized';
import { elevationLabel, paceLabel, unitText, type UnitSystem } from './units';

/** Convert narrative measurements from the original chart values, before rounding. */
export function findingText(answer: GuideAnswer, units: UnitSystem): string {
  if (units === 'km') return answer.answer;
  let source = answer.answer;
  let measurement: string | undefined;
  if (source.includes('slowest median section pace:')) {
    const values = answer.charts.find(chart => chart.unit === 'min/km')?.rows
      .map(row => row.value).filter((value): value is number => typeof value === 'number' && Number.isFinite(value));
    if (values?.length) {
      measurement = paceLabel(Math.max(...values) * 60, units);
      source = source.replace(/\d+:[0-5]\d\/km/, '{{measurement}}');
    }
  } else if (source.includes('m of net elevation change')) {
    const values = answer.charts.find(chart => chart.unit === 'm')?.rows
      .map(row => row.value).filter((value): value is number => typeof value === 'number' && Number.isFinite(value));
    if (values?.length) {
      measurement = elevationLabel(Math.max(...values), units);
      source = source.replace(/[−-]?[\d,.]+ m(?= of net elevation change)/, '{{measurement}}');
    }
  }
  const converted = unitText(source, units);
  return measurement ? converted.replace('{{measurement}}', measurement) : converted;
}
