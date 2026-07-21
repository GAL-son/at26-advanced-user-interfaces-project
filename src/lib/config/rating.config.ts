export const RATING_CONFIG = {
  startingRating: 1000,
  comboMutliplierLimit: 15,
  maxComboMultiplier: 3,
  erosionStart: 10, // 10 weeks
  erosionValue: 2, // points every week over start
  erosionLimitOffset: 500, // 500 points below base
  positionAdjustmentMutiplier: 100,
  raceK: 32,
  qualiK: 16,
} as const;