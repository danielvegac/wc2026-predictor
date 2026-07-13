// ============================================================
// Poisson Goal-Scoring Model Tests
// ============================================================

import { describe, it, expect, vi, afterEach } from "vitest";
import {
  factorial,
  poissonPMF,
  scorelineProbability,
  scoreDistribution,
  matchOutcomeProbabilities,
  mostLikelyScore,
  simulateScore,
} from "../../src/engine/poisson";

describe("factorial", () => {
  it("computes small factorials", () => {
    expect(factorial(0)).toBe(1);
    expect(factorial(1)).toBe(1);
    expect(factorial(5)).toBe(120);
  });

  it("treats negative input as 1", () => {
    expect(factorial(-3)).toBe(1);
  });

  it("is consistent with the recurrence n! = n * (n-1)!", () => {
    expect(factorial(6)).toBe(6 * factorial(5));
  });
});

describe("poissonPMF", () => {
  it("returns e^-lambda at k=0", () => {
    expect(poissonPMF(1.5, 0)).toBeCloseTo(Math.exp(-1.5), 10);
  });

  it("matches the analytic formula for k>0", () => {
    const lambda = 2;
    const k = 3;
    const expected = (Math.exp(-lambda) * Math.pow(lambda, k)) / 6;
    expect(poissonPMF(lambda, k)).toBeCloseTo(expected, 10);
  });

  it("collapses to a point mass at 0 when lambda <= 0", () => {
    expect(poissonPMF(0, 0)).toBe(1);
    expect(poissonPMF(0, 2)).toBe(0);
    expect(poissonPMF(-1, 0)).toBe(1);
  });

  it("sums to ~1 over a wide support", () => {
    let total = 0;
    for (let k = 0; k <= 20; k++) total += poissonPMF(1.4, k);
    expect(total).toBeCloseTo(1, 6);
  });
});

describe("scorelineProbability", () => {
  it("is the product of the two marginal Poisson probabilities", () => {
    const p = scorelineProbability(1.4, 1.1, 2, 1);
    expect(p).toBeCloseTo(poissonPMF(1.4, 2) * poissonPMF(1.1, 1), 10);
  });
});

describe("scoreDistribution (independent Poisson)", () => {
  it("omits Dixon-Coles adjustment and prunes negligible probabilities", () => {
    const dist = scoreDistribution(1.4, 1.1, 5, false);
    for (const prob of Object.values(dist)) {
      expect(prob).toBeGreaterThan(0.0001);
    }
    // 0-0 should be present and match the independent product
    expect(dist["0-0"]).toBeCloseTo(poissonPMF(1.4, 0) * poissonPMF(1.1, 0), 10);
  });

  it("returns a nearly-complete distribution that sums to ~1", () => {
    const dist = scoreDistribution(1.4, 1.1, 10, false);
    const total = Object.values(dist).reduce((s, p) => s + p, 0);
    expect(total).toBeCloseTo(1, 2);
  });
});

describe("matchOutcomeProbabilities (independent Poisson)", () => {
  it("normalizes outcomes to sum to 1", () => {
    const { homeWin, draw, awayWin } = matchOutcomeProbabilities(1.4, 1.1, 7, false);
    expect(homeWin + draw + awayWin).toBeCloseTo(1, 10);
  });

  it("favors the higher-lambda team", () => {
    const { homeWin, awayWin } = matchOutcomeProbabilities(2.2, 0.8, 7, false);
    expect(homeWin).toBeGreaterThan(awayWin);
  });

  it("is symmetric for equal lambdas", () => {
    const { homeWin, awayWin } = matchOutcomeProbabilities(1.3, 1.3, 7, false);
    expect(homeWin).toBeCloseTo(awayWin, 10);
  });
});

describe("mostLikelyScore (independent Poisson)", () => {
  it("returns 0-0 for very low expected goals", () => {
    expect(mostLikelyScore(0.2, 0.2, 7, false)).toEqual([0, 0]);
  });

  it("gives the stronger side the higher goal count", () => {
    const [h, a] = mostLikelyScore(2.5, 0.5, 7, false);
    expect(h).toBeGreaterThan(a);
  });
});

describe("simulateScore", () => {
  afterEach(() => vi.restoreAllMocks());

  it("returns non-negative integer goal counts", () => {
    const [h, a] = simulateScore(1.5, 1.2);
    expect(Number.isInteger(h)).toBe(true);
    expect(Number.isInteger(a)).toBe(true);
    expect(h).toBeGreaterThanOrEqual(0);
    expect(a).toBeGreaterThanOrEqual(0);
  });

  it("yields 0-0 when the random draw immediately falls below the threshold", () => {
    // Knuth's loop multiplies p by Math.random() until p <= e^-lambda.
    // A tiny first draw drops below the threshold immediately -> 0 goals.
    vi.spyOn(Math, "random").mockReturnValue(0.01);
    expect(simulateScore(0.5, 0.5)).toEqual([0, 0]);
  });
});
