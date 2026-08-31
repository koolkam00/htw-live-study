'use client';
import React from 'react';
import { TablePlaceholder } from '@/components/TableCard';
import type { Filters } from '@/lib/types';

export default function T4({
  status,
  dataset,
  filters,
}: {
  status: 'empty' | 'ready';
  dataset?: any;
  filters: Filters;
}) {
  const present = status === 'ready' && dataset != null;
  if (!present) return <TablePlaceholder note="Repeaters × age×sex will appear here." />;
  return <TablePlaceholder note="Awaiting live dataset format." />;
}
