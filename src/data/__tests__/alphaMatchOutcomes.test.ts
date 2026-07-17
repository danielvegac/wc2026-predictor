import { describe, it, expect } from 'vitest';
import {
  computeAlphaResult,
  getAlphaResultForMatch,
  alphaMatchOutcomes,
} from '../alphaMatchOutcomes';
import type { AlphaMatchOutcome } from '../alphaMatchOutcomes';

describe('computeAlphaResult', () => {
  it('returns correct: true when the highest-probability outcome matches the actual result', () => {
    const outcome: AlphaMatchOutcome = {
      matchId: 'TEST-CORRECT', homeWinPct: 60, drawPct: 25, awayWinPct: 15,
      source: 'chat-history-verified',
    };
    const result = computeAlphaResult(outcome, 'home');
    expect(result.alphaPick).toBe('home');
    expect(result.correct).toBe(true);
  });

  it('returns correct: false when the highest-probability outcome does not match the actual result', () => {
    const outcome: AlphaMatchOutcome = {
      matchId: 'TEST-INCORRECT', homeWinPct: 60, drawPct: 25, awayWinPct: 15,
      source: 'chat-history-verified',
    };
    const result = computeAlphaResult(outcome, 'away');
    expect(result.alphaPick).toBe('home');
    expect(result.correct).toBe(false);
  });

  it('returns null/null when the source is unavailable', () => {
    const outcome: AlphaMatchOutcome = {
      matchId: 'TEST-UNAVAILABLE', homeWinPct: null, drawPct: null, awayWinPct: null,
      source: 'unavailable',
    };
    const result = computeAlphaResult(outcome, 'home');
    expect(result.alphaPick).toBeNull();
    expect(result.correct).toBeNull();
  });

  it('returns null/null for the R16-8 AET-excluded match regardless of data', () => {
    const outcome: AlphaMatchOutcome = {
      matchId: 'R16-8', homeWinPct: 23.0, drawPct: 25.0, awayWinPct: 52.1,
      source: 'chat-history-verified',
      note: 'AET match — exclude from correct-result aggregate per Rule 25',
    };
    const result = computeAlphaResult(outcome, 'draw');
    expect(result.alphaPick).toBeNull();
    expect(result.correct).toBeNull();
  });
});

describe('getAlphaResultForMatch', () => {
  it('returns null for a matchId not tracked in alphaMatchOutcomes', () => {
    expect(getAlphaResultForMatch('NOT-A-MATCH')).toBeNull();
  });

  it('R32-15 and R32-16 are marked unavailable (only an incomplete placeholder exists)', () => {
    const r3215 = alphaMatchOutcomes.find((o) => o.matchId === 'R32-15');
    const r3216 = alphaMatchOutcomes.find((o) => o.matchId === 'R32-16');
    expect(r3215?.source).toBe('unavailable');
    expect(r3216?.source).toBe('unavailable');
    expect(getAlphaResultForMatch('R32-15')).toEqual({ alphaPick: null, correct: null });
    expect(getAlphaResultForMatch('R32-16')).toEqual({ alphaPick: null, correct: null });
  });

  it('R16-4 correctly favored the away win (Argentina/England style upset) and matches the actual result', () => {
    // R16-4 is MEX 2-3 ENG, alpha home/draw/away = 14.0/16.0/70.0 -> pick away, actual away -> correct
    const result = getAlphaResultForMatch('R16-4');
    expect(result?.alphaPick).toBe('away');
    expect(result?.correct).toBe(true);
  });

  it('R16-8 (Switzerland vs Colombia, AET) is excluded from the correct-result aggregate', () => {
    expect(getAlphaResultForMatch('R16-8')).toEqual({ alphaPick: null, correct: null });
  });
});
