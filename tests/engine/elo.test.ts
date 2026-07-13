// ============================================================
// Elo Rating System Tests
// ============================================================

import { describe, it, expect } from "vitest";
import {
  expectedScore,
  eloProbabilities,
  eloGoalAdjustment,
  updateElo,
  getKFactor,
} from "../../src/engine/elo";

describe("expectedScore", () => {
  it("returns 0.5 for equal ratings", () => {
    expect(expectedScore(1800, 1800)).toBeCloseTo(0.5, 10);
  });

  it("gives the higher-rated team a >0.5 expectation", () => {
    expect(expectedScore(2000, 1800)).toBeGreaterThan(0.5);
    expect(expectedScore(1800, 2000)).toBeLessThan(0.5);
  });

  it("expectations of the two teams sum to 1", () => {
    const a = expectedScore(1900, 1700);
    const b = expectedScore(1700, 1900);
    expect(a + b).toBeCloseTo(1, 10);
  });

  it("gives ~0.76 for a 200-point advantage", () => {
    expect(expectedScore(2000, 1800)).toBeCloseTo(0.76, 2);
  });

  it("applies home advantage in favor of team A", () => {
    const withAdv = expectedScore(1800, 1800, 100);
    expect(withAdv).toBeGreaterThan(0.5);
  });
});

describe("eloProbabilities", () => {
  it("produces ~26% draw probability for equal teams and symmetric win probs", () => {
    const { winA, draw, winB } = eloProbabilities(1800, 1800);
    expect(draw).toBeCloseTo(0.26, 5);
    expect(winA).toBeCloseTo(winB, 10);
  });

  it("probabilities sum to 1", () => {
    const { winA, draw, winB } = eloProbabilities(2000, 1650);
    expect(winA + draw + winB).toBeCloseTo(1, 10);
  });

  it("gives the stronger team the larger win probability", () => {
    const { winA, winB } = eloProbabilities(2000, 1650);
    expect(winA).toBeGreaterThan(winB);
  });

  it("lowers draw probability as the rating gap widens", () => {
    const close = eloProbabilities(1800, 1800).draw;
    const wide = eloProbabilities(2100, 1500).draw;
    expect(wide).toBeLessThan(close);
  });
});

describe("eloGoalAdjustment", () => {
  it("returns 1.0 for equal ratings", () => {
    expect(eloGoalAdjustment(1800, 1800)).toBeCloseTo(1, 10);
  });

  it("returns >1 multiplier for the stronger team and <1 for the weaker", () => {
    expect(eloGoalAdjustment(2000, 1800)).toBeGreaterThan(1);
    expect(eloGoalAdjustment(1800, 2000)).toBeLessThan(1);
  });

  it("is reciprocal-symmetric for opposite matchups", () => {
    const up = eloGoalAdjustment(2000, 1800);
    const down = eloGoalAdjustment(1800, 2000);
    expect(up * down).toBeCloseTo(1, 10);
  });
});

describe("updateElo", () => {
  it("increases rating on an over-performance and rounds the result", () => {
    // expected 0.5, actual win -> +0.5 * 60 = +30
    expect(updateElo(1800, 0.5, 1)).toBe(1830);
  });

  it("decreases rating on an under-performance", () => {
    expect(updateElo(1800, 0.5, 0)).toBe(1770);
  });

  it("leaves rating unchanged when result matches expectation", () => {
    expect(updateElo(1800, 0.5, 0.5)).toBe(1800);
  });

  it("respects a custom K-factor", () => {
    expect(updateElo(1800, 0.5, 1, 20)).toBe(1810);
  });
});

describe("getKFactor", () => {
  it("returns 60 for World Cup matches", () => {
    expect(getKFactor("World Cup")).toBe(60);
    expect(getKFactor("WC")).toBe(60);
  });

  it("returns 50 for continental championships", () => {
    expect(getKFactor("Copa America")).toBe(50);
    expect(getKFactor("EURO")).toBe(50);
    expect(getKFactor("AFCON")).toBe(50);
  });

  it("returns 40 for World Cup qualifiers", () => {
    expect(getKFactor("WCQ")).toBe(40);
    expect(getKFactor("World Cup Qualifier")).toBe(40);
  });

  it("returns 35 for Nations League", () => {
    expect(getKFactor("Nations League")).toBe(35);
    expect(getKFactor("NL")).toBe(35);
  });

  it("defaults to 20 for unknown competitions", () => {
    expect(getKFactor("Friendly")).toBe(20);
    expect(getKFactor("")).toBe(20);
  });
});
