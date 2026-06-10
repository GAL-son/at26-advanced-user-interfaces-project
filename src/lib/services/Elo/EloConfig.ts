import { EloAlgorithm } from './Algorithms/EloAlgorithm';
import { StandardEloAlgorithm } from './Algorithms/StandardEloAlgorithm';

export const eloRegistry: Record<string, EloAlgorithm> = {
  standardK48: new StandardEloAlgorithm('ACSM_Standard_K48', 48),
  aggressiveK64: new StandardEloAlgorithm('ACSM_Aggressive_K64', 64),
};

// ⚙️ Główny przełącznik konfiguracji
export const currentAlgorithm: EloAlgorithm = eloRegistry.standardK48;