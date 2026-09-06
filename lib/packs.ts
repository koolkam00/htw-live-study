export type PackStatus = 'ready' | 'enrichment' | 'coming-soon';

export interface PackInfo {
  id: string;
  title: string;
  status: PackStatus;
  group: 'S' | 'R' | 'paper';
}

// Registry of packs and their readiness badges (non-numeric metadata only).
export const PACKS: PackInfo[] = [
  // Paper pack for Smyth 2021 HTW (live from public/data/live.json)
  { id: 'smyth_htw', title: 'Smyth 2021 — Hitting the Wall', status: 'ready', group: 'paper' },
  // S1–S12
  { id: 's1', title: 'S1 — The price of banking time', status: 'ready', group: 'S' },
  { id: 's2', title: 'S2 — Odds of breaking a target time', status: 'ready', group: 'S' },
  { id: 's3', title: 'S3 — Where each marathon breaks people', status: 'enrichment', group: 'S' },
  { id: 's4', title: 'S4 — Translate your time to another course', status: 'enrichment', group: 'S' },
  { id: 's5', title: 'S5 — Pacing vs. difficult race day', status: 'enrichment', group: 'S' },
  { id: 's6', title: 'S6 — Wall: distance vs elapsed time', status: 'enrichment', group: 'S' },
  { id: 's7', title: 'S7 — Do runners learn after blowing up?', status: 'ready', group: 'S' },
  { id: 's8', title: 'S8 — Age: speed or endurance?', status: 'ready', group: 'S' },
  { id: 's9', title: 'S9 — Weather penalty for different runners', status: 'enrichment', group: 'S' },
  { id: 's10', title: 'S10 — What happens when a goal slips away?', status: 'ready', group: 'S' },
  { id: 's11', title: 'S11 — Can runners recover from a bad patch?', status: 'ready', group: 'S' },
  { id: 's12', title: 'S12 — 20 years of pacing changes', status: 'enrichment', group: 'S' },
  // R1–R26 (ready unless noted)
  { id: 'r1', title: 'R1 — Banking time cost', status: 'ready', group: 'R' },
  { id: 'r2', title: 'R2 — Recover slow start', status: 'ready', group: 'R' },
  { id: 'r3', title: 'R3 — 20km accel vs decelerate', status: 'ready', group: 'R' },
  { id: 'r4', title: 'R4 — On-pace hit rates', status: 'ready', group: 'R' },
  { id: 'r5', title: 'R5 — Exceptional vs prior', status: 'ready', group: 'R' },
  { id: 'r6', title: 'R6 — Decided after 30km', status: 'ready', group: 'R' },
  { id: 'r7', title: 'R7 — Wall clock vs distance', status: 'ready', group: 'R' },
  { id: 'r8', title: 'R8 — How early blowup shows', status: 'ready', group: 'R' },
  { id: 'r9', title: 'R9 — Bad patch recoverable', status: 'ready', group: 'R' },
  { id: 'r10', title: 'R10 — Unravel typology', status: 'ready', group: 'R' },
  { id: 'r11', title: 'R11 — Course traps', status: 'enrichment', group: 'R' },
  { id: 'r12', title: 'R12 — Fastest by ability', status: 'ready', group: 'R' },
  { id: 'r13', title: 'R13 — Great day vs consistency', status: 'ready', group: 'R' },
  { id: 'r14', title: 'R14 — Knowing course', status: 'ready', group: 'R' },
  { id: 'r15', title: 'R15 — Weather penalty', status: 'enrichment', group: 'R' },
  { id: 'r16', title: 'R16 — Groups (parked)', status: 'coming-soon', group: 'R' },
  { id: 'r17', title: 'R17 — Milestone kick', status: 'ready', group: 'R' },
  { id: 'r18', title: 'R18 — BQ rules (parked)', status: 'coming-soon', group: 'R' },
  { id: 'r19', title: 'R19 — Near miss return', status: 'ready', group: 'R' },
  { id: 'r20', title: 'R20 — Pacing personalities', status: 'ready', group: 'R' },
  { id: 'r21', title: 'R21 — Learn from blowup', status: 'ready', group: 'R' },
  { id: 'r22', title: 'R22 — Aging', status: 'ready', group: 'R' },
  { id: 'r23', title: 'R23 — Gender pacing', status: 'ready', group: 'R' },
  { id: 'r24', title: 'R24 — Interval after PB', status: 'ready', group: 'R' },
  { id: 'r25', title: 'R25 — Huge kick', status: 'ready', group: 'R' },
  { id: 'r26', title: 'R26 — 20y pacing', status: 'enrichment', group: 'R' },
];

export function getPackInfo(id: string): PackInfo | undefined {
  return PACKS.find((p) => p.id === id);
}
