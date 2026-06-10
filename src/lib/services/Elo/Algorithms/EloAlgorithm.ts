import { type RaceResult } from '@/lib/db/types';

// Tworzymy typ dla wyników, które krążą po algorytmach (id staje się opcjonalne)
export type RaceResultCalculatable = Omit<RaceResult, 'id'> & { id?: string };

export interface EloAlgorithm {
  readonly name: string;
  calculate(results: RaceResultCalculatable[]): RaceResultCalculatable[];
}