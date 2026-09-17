import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import release from '@/analysis/release.json';
import { FAST_START_DEFAULT, fastStartRow, type FastStartEvidence, type FastStartStart, type FastStartMode, type FastStartStarts } from './fast-start';

export function getFastStartStart(mode: FastStartMode = 'all'): FastStartStart {
  const bytes = fs.readFileSync(path.join(process.cwd(), 'public/data/fast-start', mode === 'all' ? 'all-finishers.json' : 'evidence.json'));
  const runnerBytes = fs.readFileSync(path.join(process.cwd(), 'public/data/runners/manifest.json'));
  const evidence = JSON.parse(bytes.toString()) as FastStartEvidence;
  const runners = JSON.parse(runnerBytes.toString());
  if (evidence.schema_version !== 1 || evidence.release_tag !== release.tag || evidence.runner_manifest_sha256 !== createHash('sha256').update(runnerBytes).digest('hex') || evidence.history_n !== runners.linkage.recent_benchmark_finishes) throw new Error('Fast-start data must match the adopted runner data.');
  if (mode === 'all' ? evidence.mode !== 'all-finishers' || evidence.analysis_n !== runners.eligible_records : evidence.mode !== undefined) throw new Error('Fast-start comparison mode must match its source cohort.');
  const initial = fastStartRow(evidence.rows, FAST_START_DEFAULT);
  if (!initial) throw new Error('The all-course fast-start comparison is missing.');
  return { initial, bands: evidence.bands, cities: ['All courses', ...[...new Set<string>(runners.editions.map((row: { city: string }) => row.city))].sort()],
    history_n: evidence.history_n, min_cell: evidence.min_cell, release_tag: evidence.release_tag, as_of: evidence.as_of,
    mode, analysis_n: mode === 'all' ? evidence.analysis_n! : evidence.history_n,
    bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') };
}
export function getFastStartStarts(): FastStartStarts { return { all: getFastStartStart('all'), history: getFastStartStart('history') }; }
