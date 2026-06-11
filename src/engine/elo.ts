// ============================================================
// Elo Rating System
// ============================================================
// Calculates expected match outcomes based on Elo rating differences
// and updates ratings after matches are played.

/**
 * Calculate expected score (win probability) for team A against team B
 * All World Cup matches are neutral venue, so no home advantage.
 *
 * E_a = 1 / (1 + 10^((elo_b - elo_a) / 400))
 */
export function expectedScore(eloA: number, eloB: number, homeAdvantage: number = 0): number {
  return 1 / (1 + Math.pow(10, (eloB - eloA - homeAdvantage) / 400));
}

/**
 * Calculate Elo-based win/draw/loss probabilities
 * Draw probability is derived from the closeness of ratings
 */
export function eloProbabilities(
  eloA: number,
  eloB: number
): { winA: number; draw: number; winB: number } {
  const eA = expectedScore(eloA, eloB);
  const eB = 1 - eA;

  // Draw probability increases when teams are closer in rating
  // Using a simple model: draw_prob ≈ 0.26 * (1 - |eA - eB|)
  // This gives ~26% draw probability for equal teams, decreasing for mismatches
  const drawBase = 0.26;
  const drawProb = drawBase * (1 - Math.abs(eA - eB) * 0.8);

  const winA = eA * (1 - drawProb);
  const winB = eB * (1 - drawProb);

  return { winA, draw: drawProb, winB };
}

/**
 * Convert Elo difference to goal expectation adjustment
 * Scales the Poisson lambda based on relative team strength
 *
 * A 200-point Elo advantage ≈ 76% expected win rate
 * This translates to roughly a 0.4 goal advantage
 */
export function eloGoalAdjustment(eloA: number, eloB: number): number {
  const diff = eloA - eloB;
  // Maps Elo difference to a multiplier around 1.0
  // +200 Elo → ~1.15x goals, -200 Elo → ~0.87x goals
  return Math.pow(10, diff / 1600);
}

/**
 * Update Elo rating after a match
 *
 * K-factor varies by competition:
 * - World Cup: 60
 * - Continental qualifiers: 40
 * - Friendlies: 20
 */
export function updateElo(
  currentElo: number,
  expected: number,
  actual: number, // 1 = win, 0.5 = draw, 0 = loss
  kFactor: number = 60
): number {
  return Math.round(currentElo + kFactor * (actual - expected));
}

/**
 * K-factor lookup by competition type
 */
export function getKFactor(competition: string): number {
  switch (competition) {
    case "World Cup":
    case "WC":
      return 60;
    case "Continental Championship":
    case "Copa America":
    case "EURO":
    case "AFCON":
    case "Asian Cup":
      return 50;
    case "WCQ":
    case "World Cup Qualifier":
      return 40;
    case "Nations League":
    case "NL":
      return 35;
    default:
      return 20; // Friendlies and other
  }
}
