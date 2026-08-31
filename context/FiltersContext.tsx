'use client';
import React, { createContext, useContext, useMemo, useState } from 'react';
import type { AbilityBucket, AgeGroup, Filters, Sex } from '@/lib/types';

interface FiltersContextValue {
  filters: Filters;
  setSex: (sex: Sex) => void;
  setAgeGroup: (ageGroup: AgeGroup) => void;
  setAbility: (ability: AbilityBucket) => void;
  reset: () => void;
}

const defaultFilters: Filters = {
  sex: 'all',
  ageGroup: 'all',
  ability: 'all',
};

const FiltersContext = createContext<FiltersContextValue | undefined>(undefined);

export function FiltersProvider({ children }: { children: React.ReactNode }) {
  const [filters, setFilters] = useState<Filters>(defaultFilters);

  const value = useMemo<FiltersContextValue>(
    () => ({
      filters,
      setSex: (sex) => setFilters((f) => ({ ...f, sex })),
      setAgeGroup: (ageGroup) => setFilters((f) => ({ ...f, ageGroup })),
      setAbility: (ability) => setFilters((f) => ({ ...f, ability })),
      reset: () => setFilters(defaultFilters),
    }),
    [filters]
  );

  return <FiltersContext.Provider value={value}>{children}</FiltersContext.Provider>;
}

export function useFilters() {
  const ctx = useContext(FiltersContext);
  if (!ctx) throw new Error('useFilters must be used within FiltersProvider');
  return ctx;
}
