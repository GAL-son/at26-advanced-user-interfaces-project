import { RaceResult } from '@prisma/client';
import { EloAlgorithm, type RaceResultCalculatable } from './EloAlgorithm';


export class StandardEloAlgorithm implements EloAlgorithm {
  readonly name: string;
  private K: number;

  constructor(name = 'Standard_K48', K = 48) {
    this.name = name;
    this.K = K;
  }

  calculate(results: RaceResultCalculatable[]): RaceResultCalculatable[] {
    const numDrivers = results.length;
    if (numDrivers < 2) return results;

    // Słownik na sumowanie zmian dla każdego kierowcy
    const ratingChanges = new Map<string, number>();
    results.forEach(r => ratingChanges.set(r.driverGuid, 0));

    for (let i = 0; i < numDrivers; i++) {
      for (let j = i + 1; j < numDrivers; j++) {
        const resA = results[i];
        const resB = results[j];

        const eloA = resA.eloBefore ?? 1000.0;
        const eloB = resB.eloBefore ?? 1000.0;

        const expectedA = 1 / (1 + Math.pow(10, (eloB - eloA) / 400));
        const actualA = 1; // A jest wyżej w tablicy, więc wygrał

        const pointsExchanged = this.K * (actualA - expectedA);
        const scaledChange = pointsExchanged / (numDrivers - 1);

        ratingChanges.set(resA.driverGuid, (ratingChanges.get(resA.driverGuid) ?? 0) + scaledChange);
        ratingChanges.set(resB.driverGuid, (ratingChanges.get(resB.driverGuid) ?? 0) - scaledChange);
      }
    }

    return results.map(res => {
      let change = ratingChanges.get(res.driverGuid) ?? 0;
      const currentCombo = res.combo ?? 0;

      if (change > 0) {
        const multiplier = 1 + 0.1 * currentCombo;
        change = change * multiplier;
      }

      const eloBefore = res.eloBefore ?? 1000.0;
      
      res.eloAfter = Math.max(0, Math.round(eloBefore + change));
      res.eloAlg = this.name;

      return res;
    });
  }
}