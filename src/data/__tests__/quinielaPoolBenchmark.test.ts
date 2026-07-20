import { describe, it, expect } from 'vitest';
import {
  computeQuinielaPlacement,
  knownPoolPointThresholds,
  poolTotalParticipants,
  danielOfficialScore,
  danielOfficialRank,
} from '../quinielaPoolBenchmark';

describe('computeQuinielaPlacement', () => {
  it('reports an outright win when total exceeds the leader', () => {
    const result = computeQuinielaPlacement(400);
    expect(result.wouldHaveWon).toBe(true);
    expect(result.tiedForFirst).toBe(false);
    expect(result.estimatedRank).toBe('1st of 114');
  });

  it('reports a tie for first when total equals the leader', () => {
    const result = computeQuinielaPlacement(380);
    expect(result.wouldHaveWon).toBe(false);
    expect(result.tiedForFirst).toBe(true);
    expect(result.estimatedRank).toBe('Tied for 1st of 114');
  });

  it('reports landing between two known thresholds', () => {
    // Between rank 2 (371) and rank 3 (354)
    const result = computeQuinielaPlacement(360);
    expect(result.wouldHaveWon).toBe(false);
    expect(result.tiedForFirst).toBe(false);
    expect(result.estimatedRank).toBe('Between rank 2 and rank 3');
  });

  it('reports below the rank-15 threshold as unknown exact rank', () => {
    const result = computeQuinielaPlacement(291);
    expect(result.wouldHaveWon).toBe(false);
    expect(result.estimatedRank).toContain('16th or lower');
    expect(result.note).toContain('322');
  });

  it('reports an exact tie with a known threshold', () => {
    // 328 appears three times in the thresholds (ranks 12-14); findIndex
    // returns the first match, rank 12.
    const result = computeQuinielaPlacement(328);
    expect(result.wouldHaveWon).toBe(false);
    expect(result.tiedForFirst).toBe(false);
    expect(result.estimatedRank).toBe('Tied at rank 12');
  });

  it('exposes anonymized benchmark constants with no participant names', () => {
    expect(poolTotalParticipants).toBe(114);
    expect(danielOfficialScore).toBe(328);
    expect(danielOfficialRank).toBe(14);
    expect(knownPoolPointThresholds).toEqual([
      380, 371, 354, 349, 344, 342, 341, 335, 335, 333, 330, 328, 328, 328, 322,
    ]);

    // Guard against accidental reintroduction of participant names: every
    // exported value here must be a number (or array of numbers).
    for (const value of [poolTotalParticipants, danielOfficialScore, danielOfficialRank]) {
      expect(typeof value).toBe('number');
    }
    for (const value of knownPoolPointThresholds) {
      expect(typeof value).toBe('number');
    }
  });
});
