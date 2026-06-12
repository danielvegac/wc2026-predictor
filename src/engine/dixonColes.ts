// ============================================================
// Dixon-Coles Low-Score Correlation Adjustment
// ============================================================
// The standard Poisson model assumes home and away goals are
// independent. Dixon & Coles (1997) showed that low-scoring
// outcomes (0-0, 1-0, 0-1, 1-1) deviate from this assumption.
//
// rho < 0 means:
//   - 0-0 and 1-1 are slightly LESS common than pure Poisson
//   - 1-0 and 0-1 are slightly MORE common than pure Poisson

import { poissonPMF } from "./poisson";

/** Default dependence parameter from Dixon-Coles (1997) */
export const DEFAULT_RHO = -0.13;

/**
 * Tau adjustment function for low-scoring outcomes.
 *
 * tau(0,0) = 1 - lambda * mu * rho
 * tau(0,1) = 1 + lambda * rho
 * tau(1,0) = 1 + mu * rho
 * tau(1,1) = 1 - rho
 * tau(x,y) = 1 for all other (x,y)
 */
export function tau(
  x: number,
  y: number,
  lambda: number,
  mu: number,
  rho: number
): number {
  if (x === 0 && y === 0) return 1 - lambda * mu * rho;
  if (x === 0 && y === 1) return 1 + lambda * rho;
  if (x === 1 && y === 0) return 1 + mu * rho;
  if (x === 1 && y === 1) return 1 - rho;
  return 1;
}

/**
 * Dixon-Coles adjusted probability for a specific scoreline.
 * P_DC(x,y) = tau(x,y,lambda,mu,rho) * Poisson(x;lambda) * Poisson(y;mu)
 *
 * NOTE: The raw product is NOT normalized — call dixonColesDistribution()
 * to get a properly normalized distribution.
 */
export function dixonColesRawProbability(
  homeGoals: number,
  awayGoals: number,
  lambda: number,
  mu: number,
  rho: number = DEFAULT_RHO
): number {
  return (
    tau(homeGoals, awayGoals, lambda, mu, rho) *
    poissonPMF(lambda, homeGoals) *
    poissonPMF(mu, awayGoals)
  );
}

/**
 * Generate a full Dixon-Coles score distribution, normalized so
 * probabilities sum to 1.
 */
export function dixonColesDistribution(
  lambda: number,
  mu: number,
  rho: number = DEFAULT_RHO,
  maxGoals: number = 7
): Record<string, number> {
  const raw: Record<string, number> = {};
  let total = 0;

  for (let h = 0; h <= maxGoals; h++) {
    for (let a = 0; a <= maxGoals; a++) {
      const p = dixonColesRawProbability(h, a, lambda, mu, rho);
      if (p > 0.00001) {
        raw[`${h}-${a}`] = p;
        total += p;
      }
    }
  }

  // Normalize
  const distribution: Record<string, number> = {};
  for (const [key, val] of Object.entries(raw)) {
    distribution[key] = val / total;
  }

  return distribution;
}

/**
 * Dixon-Coles adjusted outcome probabilities (home win / draw / away win),
 * normalized.
 */
export function dixonColesOutcomeProbabilities(
  lambda: number,
  mu: number,
  rho: number = DEFAULT_RHO,
  maxGoals: number = 7
): { homeWin: number; draw: number; awayWin: number } {
  let homeWin = 0;
  let draw = 0;
  let awayWin = 0;
  let total = 0;

  for (let h = 0; h <= maxGoals; h++) {
    for (let a = 0; a <= maxGoals; a++) {
      const p = dixonColesRawProbability(h, a, lambda, mu, rho);
      total += p;
      if (h > a) homeWin += p;
      else if (h === a) draw += p;
      else awayWin += p;
    }
  }

  return {
    homeWin: homeWin / total,
    draw: draw / total,
    awayWin: awayWin / total,
  };
}
