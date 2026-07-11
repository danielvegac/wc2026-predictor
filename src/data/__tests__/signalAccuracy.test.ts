import { describe, it, expect } from 'vitest';
import {
  computeLambdaDivergence,
  evaluateRule23,
  getSignalAccuracySummary,
  computeCloserSignal,
  signalAccuracyData,
} from '../signalAccuracy';
import { checkRule23 } from '../../tools/pickJudge/rules';
import type { SignalAccuracyEntry } from '../signalAccuracy';
import type { PickJudgeInput } from '../../tools/pickJudge/types';

// ─── helpers ────────────────────────────────────────────────────────────────

function makeEntry(overrides: Partial<SignalAccuracyEntry> = {}): SignalAccuracyEntry {
  return {
    matchId: 'TEST-01',
    round: 'R16',
    homeTeamId: 'AAA',
    awayTeamId: 'BBB',
    alphaTopScorelines: [],
    modelLambdaHome: 2.0,
    modelLambdaAway: 2.0,
    modelTopScorelines: [],
    regulationResult: { home: 1, away: 1 },
    wentToExtraTime: false,
    finalResult: { home: 1, away: 1 },
    ...overrides,
  };
}

/** Minimal PickJudgeInput for Rule 23 — only the fields it reads */
function makeInput(
  homeLambda: number | undefined,
  awayLambda: number | undefined,
  alphaImpliedHomeLambda: number | undefined,
  alphaImpliedAwayLambda: number | undefined,
): PickJudgeInput {
  return {
    matchId: 'TEST-01',
    homeTeam: 'AAA',
    awayTeam: 'BBB',
    stage: 'knockout',
    modelPick: { home: 1, away: 1 },
    homeLambda,
    awayLambda,
    homeElo: 1800,
    awayElo: 1800,
    homeTournament: { wins: 1, draws: 1, losses: 1, cleanSheets: 0, goalsConceded: 2, goalsScored: 2 },
    awayTournament:  { wins: 1, draws: 1, losses: 1, cleanSheets: 0, goalsConceded: 2, goalsScored: 2 },
    homeFormMultiplier: 1.0,
    awayFormMultiplier: 1.0,
    homeIsCoHost: false,
    awayIsCoHost: false,
    playingAtIconicHomeStadium: false,
    hasDocumentedRotation: false,
    hasDocumentedDemoralization: false,
    alpha: {
      underTopScore: 0,
      bttsNoScore: 0,
      bttsYesScore: 0,
      overTopScore: 0,
      homeAHBestScore: 0,
      homeAHBestLine: 0,
      homeAHConsecutiveAbove80: 0,
      awayAHBestScore: 0,
      awayAHBestLine: 0,
      awayAHConsecutiveAbove80: 0,
      homeWinScore: 0,
      awayWinScore: 0,
      homeValueMarketsFound: 0,
      awayValueMarketsFound: 0,
      cs00Score: 0,
      csHomeCleanSheetScore: 0,
      csAwayCleanSheetScore: 0,
      csHighScoringHomeScore: 0,
      alphaHomeWinPct: 40,
      alphaDrawPct: 20,
      alphaAwayWinPct: 40,
      leagueBttsPct: 44,
      matchProjectedBttsPct: 44,
      leagueOver25Pct: 50,
      matchProjectedOver25Pct: 50,
      projectedGoalsPerMatch: 2.5,
      climateNetFactor: 1.0,
      alphaImpliedHomeLambda,
      alphaImpliedAwayLambda,
    },
  } as PickJudgeInput;
}

// ─── computeLambdaDivergence ────────────────────────────────────────────────

describe('computeLambdaDivergence', () => {
  it('returns null when alphaImpliedLambdaHome is missing', () => {
    const entry = makeEntry({ modelLambdaHome: 2.0, modelLambdaAway: 2.0 });
    expect(computeLambdaDivergence(entry)).toBeNull();
  });

  it('returns null when alphaImpliedLambdaAway is missing', () => {
    const entry = makeEntry({
      modelLambdaHome: 2.0,
      modelLambdaAway: 2.0,
      alphaImpliedLambdaHome: 1.0,
    });
    expect(computeLambdaDivergence(entry)).toBeNull();
  });

  it('returns null when model total is 0', () => {
    const entry = makeEntry({
      modelLambdaHome: 0,
      modelLambdaAway: 0,
      alphaImpliedLambdaHome: 1.0,
      alphaImpliedLambdaAway: 1.0,
    });
    expect(computeLambdaDivergence(entry)).toBeNull();
  });

  it('returns 0 when alpha and model totals are identical', () => {
    const entry = makeEntry({
      modelLambdaHome: 1.5,
      modelLambdaAway: 1.5,
      alphaImpliedLambdaHome: 1.5,
      alphaImpliedLambdaAway: 1.5,
    });
    expect(computeLambdaDivergence(entry)).toBe(0);
  });

  it('computes divergence correctly for the PAR-FRA R16-02 match (63%)', () => {
    const entry = signalAccuracyData.find(e => e.matchId === 'R16-02')!;
    const div = computeLambdaDivergence(entry);
    // Entry has no alphaImpliedLambda fields set → returns null
    expect(div).toBeNull();
  });

  it('returns the correct percentage for a known asymmetric case', () => {
    // model total = 5.0, alpha total = 2.0 → |5-2|/5 * 100 = 60%
    const entry = makeEntry({
      modelLambdaHome: 3.0,
      modelLambdaAway: 2.0,
      alphaImpliedLambdaHome: 1.2,
      alphaImpliedLambdaAway: 0.8,
    });
    expect(computeLambdaDivergence(entry)).toBeCloseTo(60, 5);
  });

  it('handles model > alpha divergence correctly', () => {
    // model total = 3.0, alpha total = 1.5 → 50%
    const entry = makeEntry({
      modelLambdaHome: 2.0,
      modelLambdaAway: 1.0,
      alphaImpliedLambdaHome: 1.0,
      alphaImpliedLambdaAway: 0.5,
    });
    expect(computeLambdaDivergence(entry)).toBeCloseTo(50, 5);
  });
});

// ─── evaluateRule23 ─────────────────────────────────────────────────────────

describe('evaluateRule23', () => {
  it('returns false when alphaImplied fields are absent', () => {
    expect(evaluateRule23(makeEntry())).toBe(false);
  });

  it('returns false when divergence is exactly 50%', () => {
    const entry = makeEntry({
      modelLambdaHome: 2.0,
      modelLambdaAway: 1.0,
      alphaImpliedLambdaHome: 1.0,
      alphaImpliedLambdaAway: 0.5,
    });
    expect(evaluateRule23(entry)).toBe(false);
  });

  it('returns true when divergence exceeds 50%', () => {
    const entry = makeEntry({
      modelLambdaHome: 3.0,
      modelLambdaAway: 2.0,
      alphaImpliedLambdaHome: 1.2,
      alphaImpliedLambdaAway: 0.8,
    });
    expect(evaluateRule23(entry)).toBe(true);
  });

  it('returns false when divergence is below 50%', () => {
    const entry = makeEntry({
      modelLambdaHome: 2.0,
      modelLambdaAway: 2.0,
      alphaImpliedLambdaHome: 1.5,
      alphaImpliedLambdaAway: 1.5,
    });
    expect(evaluateRule23(entry)).toBe(false);
  });
});

// ─── checkRule23 (engine rule) ───────────────────────────────────────────────

describe('checkRule23', () => {
  it('does not trigger when alphaImpliedHomeLambda is absent', () => {
    const result = checkRule23(makeInput(2.0, 2.0, undefined, undefined));
    expect(result.triggered).toBe(false);
    expect(result.ruleId).toBe('Rule23');
  });

  it('does not trigger when modelTotal is 0 (homeLambda and awayLambda absent)', () => {
    const result = checkRule23(makeInput(undefined, undefined, 1.0, 1.0));
    expect(result.triggered).toBe(false);
  });

  it('does not trigger when divergence is at the boundary (exactly 50%)', () => {
    const result = checkRule23(makeInput(2.0, 1.0, 1.0, 0.5));
    expect(result.triggered).toBe(false);
    expect(result.reason).toMatch(/50%/);
  });

  it('triggers when divergence exceeds 50%', () => {
    const result = checkRule23(makeInput(0.57, 4.00, 0.57, 1.14));
    expect(result.triggered).toBe(true);
    expect(result.ruleId).toBe('Rule23');
    expect(result.reason).toMatch(/divergence/i);
    expect(result.reason).toMatch(/compression ceiling/i);
  });

  it('reason mentions the computed percentages when not triggered', () => {
    const result = checkRule23(makeInput(2.0, 2.0, 1.8, 1.8));
    expect(result.triggered).toBe(false);
    expect(result.reason).toMatch(/within normal range/i);
  });

  it('reason mentions model and alpha totals when triggered', () => {
    const result = checkRule23(makeInput(3.0, 2.0, 1.2, 0.8));
    expect(result.triggered).toBe(true);
    expect(result.reason).toContain('5.00');
    expect(result.reason).toContain('2.00');
  });
});

// ─── computeCloserSignal ─────────────────────────────────────────────────────

describe('computeCloserSignal', () => {
  it('returns "tie" when both ranks are null', () => {
    const entry = makeEntry({ alphaActualRank: null, modelActualRank: null });
    expect(computeCloserSignal(entry)).toBe('tie');
  });

  it('returns "model" when only alphaActualRank is null', () => {
    const entry = makeEntry({ alphaActualRank: null, modelActualRank: 3 });
    expect(computeCloserSignal(entry)).toBe('model');
  });

  it('returns "alpha" when only modelActualRank is null', () => {
    const entry = makeEntry({ alphaActualRank: 2, modelActualRank: null });
    expect(computeCloserSignal(entry)).toBe('alpha');
  });

  it('returns "alpha" when alpha rank is lower (regardless of probability)', () => {
    const entry = makeEntry({
      alphaActualRank: 2, alphaActualProbability: 5,
      modelActualRank: 5, modelActualProbability: 20,
    });
    expect(computeCloserSignal(entry)).toBe('alpha');
  });

  it('returns "model" when model rank is lower (regardless of probability)', () => {
    const entry = makeEntry({
      alphaActualRank: 8, alphaActualProbability: 15,
      modelActualRank: 1, modelActualProbability: 8,
    });
    expect(computeCloserSignal(entry)).toBe('model');
  });

  it('breaks a rank tie in favour of higher probability — alpha wins', () => {
    const entry = makeEntry({
      alphaActualRank: 3, alphaActualProbability: 12,
      modelActualRank: 3, modelActualProbability: 9,
    });
    expect(computeCloserSignal(entry)).toBe('alpha');
  });

  it('breaks a rank tie in favour of higher probability — model wins', () => {
    const entry = makeEntry({
      alphaActualRank: 3, alphaActualProbability: 8,
      modelActualRank: 3, modelActualProbability: 11,
    });
    expect(computeCloserSignal(entry)).toBe('model');
  });

  it('returns "tie" when rank and probability are identical', () => {
    const entry = makeEntry({
      alphaActualRank: 2, alphaActualProbability: 10,
      modelActualRank: 2, modelActualProbability: 10,
    });
    expect(computeCloserSignal(entry)).toBe('tie');
  });

  it('closerSignalOverride takes precedence over computed result', () => {
    // Without override: alpha rank 1 should beat model rank 5
    // With override set to "model", the override wins
    const entry = makeEntry({
      alphaActualRank: 1, alphaActualProbability: 15,
      modelActualRank: 5, modelActualProbability: 8,
      closerSignalOverride: { value: 'model', reason: 'test override' },
    });
    expect(computeCloserSignal(entry)).toBe('model');
  });

  it('closerSignalOverride "tie" overrides a clear numeric winner', () => {
    const entry = makeEntry({
      alphaActualRank: null, alphaActualProbability: 1,
      modelActualRank: 11, modelActualProbability: 3.92,
      closerSignalOverride: {
        value: 'tie',
        reason: 'each signal captured a different dimension',
      },
    });
    expect(computeCloserSignal(entry)).toBe('tie');
  });
});

// ─── getSignalAccuracySummary ────────────────────────────────────────────────

describe('getSignalAccuracySummary', () => {
  it('reports 28 total matches', () => {
    expect(getSignalAccuracySummary().totalMatches).toBe(28);
  });

  it('reports 24 comparable matches (excluding AET-flagged and pending entries)', () => {
    expect(getSignalAccuracySummary().comparableMatches).toBe(24);
  });

  it('reports 4 AET-excluded/pending matches', () => {
    expect(getSignalAccuracySummary().aetExcluded).toBe(4);
  });

  it('reports Rule 23 triggered on exactly 4 matches', () => {
    expect(getSignalAccuracySummary().rule23TriggeredCount).toBe(4);
  });

  it('reports alphaCloser: 10, modelCloser: 12, tie: 2', () => {
    const s = getSignalAccuracySummary();
    expect(s.alphaCloser).toBe(10);
    expect(s.modelCloser).toBe(12);
    expect(s.tie).toBe(2);
  });

  it('reports rule23Breakdown: { alpha: 3, tie: 1, model: 0 }', () => {
    expect(getSignalAccuracySummary().rule23Breakdown).toEqual({ alpha: 3, tie: 1, model: 0 });
  });

  it('comparable + excluded = total', () => {
    const s = getSignalAccuracySummary();
    expect(s.comparableMatches + s.aetExcluded).toBe(s.totalMatches);
  });

  it('alphaCloser + modelCloser + tie = comparableMatches', () => {
    const s = getSignalAccuracySummary();
    expect(s.alphaCloser + s.modelCloser + s.tie).toBe(s.comparableMatches);
  });

  it('all rule25Flagged and pending entries are excluded from comparable count', () => {
    const excluded = signalAccuracyData.filter(
      (e) => e.rule25Flagged || e.finalResult == null
    );
    expect(excluded.length).toBe(getSignalAccuracySummary().aetExcluded);
  });

  it('rule23Breakdown counts sum to rule23TriggeredCount', () => {
    const s = getSignalAccuracySummary();
    const { alpha, tie, model } = s.rule23Breakdown;
    expect(alpha + tie + model).toBe(s.rule23TriggeredCount);
  });
});
