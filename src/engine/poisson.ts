// ============================================================
// Poisson Goal-Scoring Model
// ============================================================
// Uses Poisson distribution to calculate the probability of
// specific scorelines given expected goals (lambda) for each team.

/**
 * Calculate factorial (with memoization for performance)
 */
const factorialCache: number[] = [1, 1];
export function factorial(n: number): number {
  if (n < 0) return 1;
  if (factorialCache[n] !== undefined) return factorialCache[n];
  factorialCache[n] = n * factorial(n - 1);
  return factorialCache[n];
}

/**
 * Poisson probability mass function
 * P(X = k) = (e^(-λ) * λ^k) / k!
 */
export function poissonPMF(lambda: number, k: number): number {
  if (lambda <= 0) return k === 0 ? 1 : 0;
  return (Math.exp(-lambda) * Math.pow(lambda, k)) / factorial(k);
}

/**
 * Calculate probability of a specific scoreline
 * Assumes independence between home and away goals (basic Poisson)
 */
export function scorelineProbability(
  lambdaHome: number,
  lambdaAway: number,
  homeGoals: number,
  awayGoals: number
): number {
  return poissonPMF(lambdaHome, homeGoals) * poissonPMF(lambdaAway, awayGoals);
}

/**
 * Generate full score distribution matrix
 * Returns probabilities for all scorelines from 0-0 to maxGoals-maxGoals
 */
export function scoreDistribution(
  lambdaHome: number,
  lambdaAway: number,
  maxGoals: number = 7
): Record<string, number> {
  const distribution: Record<string, number> = {};

  for (let h = 0; h <= maxGoals; h++) {
    for (let a = 0; a <= maxGoals; a++) {
      const prob = scorelineProbability(lambdaHome, lambdaAway, h, a);
      if (prob > 0.0001) {
        distribution[`${h}-${a}`] = prob;
      }
    }
  }

  return distribution;
}

/**
 * Calculate match outcome probabilities (home win / draw / away win)
 */
export function matchOutcomeProbabilities(
  lambdaHome: number,
  lambdaAway: number,
  maxGoals: number = 7
): { homeWin: number; draw: number; awayWin: number } {
  let homeWin = 0;
  let draw = 0;
  let awayWin = 0;

  for (let h = 0; h <= maxGoals; h++) {
    for (let a = 0; a <= maxGoals; a++) {
      const prob = scorelineProbability(lambdaHome, lambdaAway, h, a);
      if (h > a) homeWin += prob;
      else if (h === a) draw += prob;
      else awayWin += prob;
    }
  }

  // Normalize to account for truncation
  const total = homeWin + draw + awayWin;
  return {
    homeWin: homeWin / total,
    draw: draw / total,
    awayWin: awayWin / total,
  };
}

/**
 * Find the most likely scoreline
 */
export function mostLikelyScore(
  lambdaHome: number,
  lambdaAway: number,
  maxGoals: number = 7
): [number, number] {
  let bestProb = 0;
  let bestScore: [number, number] = [0, 0];

  for (let h = 0; h <= maxGoals; h++) {
    for (let a = 0; a <= maxGoals; a++) {
      const prob = scorelineProbability(lambdaHome, lambdaAway, h, a);
      if (prob > bestProb) {
        bestProb = prob;
        bestScore = [h, a];
      }
    }
  }

  return bestScore;
}

/**
 * Simulate a single match score using Poisson random sampling
 * Uses inverse transform sampling
 */
export function simulateScore(lambdaHome: number, lambdaAway: number): [number, number] {
  return [poissonRandom(lambdaHome), poissonRandom(lambdaAway)];
}

/**
 * Generate a Poisson random variable using Knuth's algorithm
 */
function poissonRandom(lambda: number): number {
  const L = Math.exp(-lambda);
  let k = 0;
  let p = 1;

  do {
    k++;
    p *= Math.random();
  } while (p > L);

  return k - 1;
}
