// ============================================================
// Signal Accuracy Tracker — Alpha vs Model vs Actual Result
// ============================================================
// Tracks, per knockout match, how close Alphametrico's scoreline matrix
// and our own model's matrix (Poisson + Dixon-Coles) were to the actual
// result. Populated manually after each match from the model app's
// "Model Score Matrix" card (frozen at lock time — does not recompute
// with live Elo) and the Alphametrico dashboard scoreline matrix.

export interface ScorelineProbability {
  home: number;
  away: number;
  probability: number; // percentage, e.g. 8.1
}

export interface SignalAccuracyEntry {
  matchId: string;                 // "R32-01", "R16-07", "QF-1", etc.
  round: "R32" | "R16" | "QF" | "SF" | "3P" | "F";
  homeTeamId: string;
  awayTeamId: string;

  // ── Alpha (Alphametrico) ──────────────────────────────────
  alphaTopScorelines: ScorelineProbability[];
  alphaImpliedLambdaHome?: number;
  alphaImpliedLambdaAway?: number;

  // ── Model (our engine) ────────────────────────────────────
  modelLambdaHome: number;
  modelLambdaAway: number;
  modelTopScorelines: ScorelineProbability[];

  // ── Results ────────────────────────────────────────────────
  // Optional: matches not yet played leave these unset and are resolved
  // at render time from the ESPN live results store (useResultsStore).
  date?: string;
  regulationResult?: { home: number; away: number };
  wentToExtraTime?: boolean;
  finalResult?: { home: number; away: number };
  penaltyWinner?: string;

  // ── Derived / manually computed accuracy ──
  alphaActualRank?: number | null;
  modelActualRank?: number | null;
  alphaActualProbability?: number;
  modelActualProbability?: number;
  closerSignal?: "alpha" | "model" | "tie" | "neither-aet";
  /**
   * Use ONLY when the pure rank/probability comparison doesn't capture
   * a nuance worth documenting. Must include a reason. When absent,
   * closerSignal is always computed by computeCloserSignal().
   */
  closerSignalOverride?: {
    value: "alpha" | "model" | "tie";
    reason: string;
  };

  // ── Rule flags ─────────────────────────────────────────────
  lambdaDivergencePct?: number;
  rule23Triggered?: boolean;
  /**
   * True for AET/penalty matches. Excludes this entry from the standard
   * alphaCloser/modelCloser/tie tally (getSignalAccuracySummary), and is
   * the trigger for showing the regulation-time dimension below. Does
   * NOT mean "no verdict exists" — see alphaActualRank/alphaActualProbability
   * (or closerSignalOverride) above for the "AET Final Closer" verdict,
   * i.e. who was closer to the actual scoreline that quiniela points are
   * scored on (regulation + extra time + penalties, whatever the final
   * stored result is). That verdict is informational only here; it is
   * deliberately excluded from the tally because Rule 25 exists to avoid
   * over/under-crediting either signal for extra-time chaos neither one
   * is in the business of forecasting.
   */
  rule25Flagged?: boolean;

  // ── Regulation-time (90') comparison — SEPARATE dimension, only for
  // matches that went to AET ──────────────────────────────────────────
  // Alphametrico's markets (Correct Score, BTTS, Totals, Handicap, the
  // whole Scoreline Matrix) price REGULATION TIME ONLY — confirmed via
  // Alphametrico's own dashboard scoring-timeline chart, which is capped
  // at 90 minutes. Our model has no such distinction (PROJECT_SPEC.md:
  // SimulationResult carries a single expectedHomeGoals/expectedAwayGoals
  // pair targeting the full/final result). Comparing the model's raw pick
  // against the regulation score would therefore hold it to a question it
  // was never designed to answer — so only alpha gets a closer/rank
  // verdict on this axis; the model gets an explanatory note instead.
  /** Rank alpha's own top-scorelines list gave to the actual 90' score. */
  alphaRegulationRank?: number | null;
  /** True iff alpha's #1-ranked scoreline exactly matches the 90' score. */
  alphaRegulationCloser?: boolean;
  /**
   * Caveat explaining why the model isn't scored on the regulation-time
   * axis. Never feed this into a "modelRegulationCloser" tally — the
   * model's pick targets the final result, not 90 minutes, so a
   * win/loss framing here would misrepresent what the model is for.
   */
  modelRegulationNote?: string;

  notes?: string;
}

export function computeLambdaDivergence(entry: SignalAccuracyEntry): number | null {
  if (entry.alphaImpliedLambdaHome == null || entry.alphaImpliedLambdaAway == null) {
    return null;
  }
  const modelTotal = entry.modelLambdaHome + entry.modelLambdaAway;
  const alphaTotal = entry.alphaImpliedLambdaHome + entry.alphaImpliedLambdaAway;
  if (modelTotal === 0) return null;
  return Math.abs(modelTotal - alphaTotal) / modelTotal * 100;
}

export const RULE_23_DIVERGENCE_THRESHOLD = 50;

export function evaluateRule23(entry: SignalAccuracyEntry): boolean {
  const div = computeLambdaDivergence(entry);
  return div != null && div > RULE_23_DIVERGENCE_THRESHOLD;
}

/**
 * Determines which signal was closer to the actual result. Lower rank wins.
 * If ranks tie, higher probability wins. A manual override takes precedence.
 */
export function computeCloserSignal(
  entry: SignalAccuracyEntry
): "alpha" | "model" | "tie" {
  if (entry.closerSignalOverride) {
    return entry.closerSignalOverride.value;
  }

  const aRank = entry.alphaActualRank ?? null;
  const mRank = entry.modelActualRank ?? null;
  const aProb = entry.alphaActualProbability ?? 0;
  const mProb = entry.modelActualProbability ?? 0;

  if (aRank == null && mRank == null) return "tie";
  if (aRank == null) return "model";
  if (mRank == null) return "alpha";

  if (aRank < mRank) return "alpha";
  if (mRank < aRank) return "model";

  if (aProb > mProb) return "alpha";
  if (mProb > aProb) return "model";
  return "tie";
}

// ============================================================
// HISTORICAL DATA — R32 + R16 (WC2026), backfilled retrospectively
// ============================================================

export const signalAccuracyData: SignalAccuracyEntry[] = [
  {
    matchId: "R32-01", round: "R32", homeTeamId: "RSA", awayTeamId: "CAN",
    alphaTopScorelines: [
      { home: 0, away: 1, probability: 17 }, { home: 0, away: 0, probability: 15 }, { home: 1, away: 1, probability: 13 },
    ],
    modelLambdaHome: 1.03, modelLambdaAway: 2.36,
    modelTopScorelines: [
      { home: 1, away: 2, probability: 9.7 }, { home: 0, away: 2, probability: 9.4 }, { home: 1, away: 1, probability: 9.3 },
    ],
    regulationResult: { home: 0, away: 1 }, wentToExtraTime: false, finalResult: { home: 0, away: 1 },
    alphaActualRank: 1, modelActualRank: 6, alphaActualProbability: 17, modelActualProbability: 6.9,
    notes: "Alpha nailed exact top cell. Model matrix leaned toward 1-2/0-2 blowout, underweighted the tight 0-1.",
  },
  {
    matchId: "R32-02", round: "R32", homeTeamId: "BRA", awayTeamId: "JPN",
    alphaTopScorelines: [
      { home: 2, away: 0, probability: 10 }, { home: 1, away: 0, probability: 11 }, { home: 2, away: 1, probability: 10 },
    ],
    modelLambdaHome: 2.43, modelLambdaAway: 1.71,
    modelTopScorelines: [
      { home: 2, away: 1, probability: 8.1 }, { home: 1, away: 1, probability: 7.5 }, { home: 2, away: 2, probability: 6.9 },
    ],
    regulationResult: { home: 2, away: 1 }, wentToExtraTime: false, finalResult: { home: 2, away: 1 },
    alphaActualRank: 4, modelActualRank: 1, alphaActualProbability: 10, modelActualProbability: 8.1,
    notes: "Model's own matrix hit the exact scoreline at rank #1.",
  },
  {
    matchId: "R32-03", round: "R32", homeTeamId: "GER", awayTeamId: "PAR",
    alphaTopScorelines: [
      { home: 1, away: 1, probability: 13 }, { home: 2, away: 1, probability: 8 }, { home: 1, away: 0, probability: 8 },
    ],
    modelLambdaHome: 2.82, modelLambdaAway: 0.51,
    modelTopScorelines: [
      { home: 2, away: 0, probability: 14.3 }, { home: 3, away: 0, probability: 13.5 }, { home: 4, away: 0, probability: 9.5 },
    ],
    regulationResult: { home: 1, away: 1 }, wentToExtraTime: true, penaltyWinner: "GER",
    finalResult: { home: 1, away: 1 },
    alphaActualRank: 1, modelActualRank: 6, alphaActualProbability: 13, modelActualProbability: 5.9,
    notes: "Model matrix heavily favored a GER blowout (lambda 2.82 vs 0.51). Alpha correctly read the tight draw.",
  },
  {
    matchId: "R32-04", round: "R32", homeTeamId: "NED", awayTeamId: "MAR",
    alphaTopScorelines: [
      { home: 0, away: 0, probability: 15 }, { home: 1, away: 1, probability: 14 }, { home: 0, away: 1, probability: 13 },
    ],
    modelLambdaHome: 2.88, modelLambdaAway: 1.21,
    modelTopScorelines: [
      { home: 2, away: 1, probability: 8.5 }, { home: 3, away: 1, probability: 8.1 }, { home: 2, away: 0, probability: 7.0 },
    ],
    regulationResult: { home: 1, away: 1 }, wentToExtraTime: true, penaltyWinner: "MAR",
    finalResult: { home: 1, away: 1 },
    alphaActualRank: 2, modelActualRank: 5, alphaActualProbability: 14, modelActualProbability: 6.7,
    notes: "Model matrix overweighted NED winning by 2+. Alpha's draw signal (14%) was much closer.",
  },
  {
    matchId: "R32-05", round: "R32", homeTeamId: "CIV", awayTeamId: "NOR",
    alphaTopScorelines: [
      { home: 1, away: 1, probability: 11.7 }, { home: 1, away: 2, probability: 10.0 }, { home: 0, away: 2, probability: 9.8 },
    ],
    modelLambdaHome: 1.01, modelLambdaAway: 1.93,
    modelTopScorelines: [
      { home: 1, away: 1, probability: 11.7 }, { home: 1, away: 2, probability: 10.0 }, { home: 0, away: 2, probability: 9.8 },
    ],
    regulationResult: { home: 1, away: 2 }, wentToExtraTime: false, finalResult: { home: 1, away: 2 },
    alphaActualRank: 2, modelActualRank: 2, alphaActualProbability: 10.0, modelActualProbability: 10.0,
    notes: "Model and alpha converged almost exactly here (Rule 14 origin match).",
  },
  {
    matchId: "R32-06", round: "R32", homeTeamId: "FRA", awayTeamId: "SWE",
    alphaTopScorelines: [
      { home: 2, away: 1, probability: 9 }, { home: 1, away: 1, probability: 8 }, { home: 3, away: 1, probability: 8 },
    ],
    modelLambdaHome: 3.20, modelLambdaAway: 0.93,
    modelTopScorelines: [
      { home: 3, away: 0, probability: 9.0 }, { home: 2, away: 0, probability: 8.4 }, { home: 3, away: 1, probability: 8.3 },
    ],
    regulationResult: { home: 3, away: 0 }, wentToExtraTime: false, finalResult: { home: 3, away: 0 },
    alphaActualRank: 5, modelActualRank: 1, alphaActualProbability: 7, modelActualProbability: 9.0,
    notes: "Model's clean sheet read (lambda 0.93 away) was the correct one — alpha expected Sweden to score.",
  },
  {
    matchId: "R32-07", round: "R32", homeTeamId: "MEX", awayTeamId: "ECU",
    alphaTopScorelines: [
      { home: 0, away: 0, probability: 21 }, { home: 0, away: 1, probability: 20 }, { home: 1, away: 1, probability: 12 },
    ],
    modelLambdaHome: 2.37, modelLambdaAway: 1.96,
    modelTopScorelines: [
      { home: 2, away: 1, probability: 7.3 }, { home: 2, away: 2, probability: 7.1 }, { home: 1, away: 1, probability: 7.0 },
    ],
    regulationResult: { home: 2, away: 0 }, wentToExtraTime: false, finalResult: { home: 2, away: 0 },
    alphaActualRank: 9, modelActualRank: 9, alphaActualProbability: 3, modelActualProbability: 3.7,
    notes: "Rule 16a co-host veto correctly overrode both alpha (favored ECU) and the raw model matrix (favored a tight/draw outcome).",
  },
  {
    matchId: "R32-08", round: "R32", homeTeamId: "ENG", awayTeamId: "COD",
    alphaTopScorelines: [
      { home: 2, away: 0, probability: 22 }, { home: 1, away: 0, probability: 22 }, { home: 3, away: 0, probability: 13 },
    ],
    modelLambdaHome: 4.00, modelLambdaAway: 0.35,
    modelTopScorelines: [
      { home: 3, away: 0, probability: 14.5 }, { home: 4, away: 0, probability: 14.5 }, { home: 2, away: 0, probability: 10.9 },
    ],
    regulationResult: { home: 2, away: 1 }, wentToExtraTime: false, finalResult: { home: 2, away: 1 },
    alphaActualRank: 6, modelActualRank: 6, alphaActualProbability: 6, modelActualProbability: 3.8,
    notes: "Neither signal anticipated the DRC comeback goal (0-1 at HT) before England's late surge.",
  },
  {
    matchId: "R32-09", round: "R32", homeTeamId: "BEL", awayTeamId: "SEN",
    alphaTopScorelines: [
      { home: 1, away: 1, probability: 13 }, { home: 0, away: 1, probability: 9 }, { home: 1, away: 2, probability: 9 },
    ],
    modelLambdaHome: 2.15, modelLambdaAway: 1.77,
    modelTopScorelines: [
      { home: 1, away: 1, probability: 8.6 }, { home: 2, away: 1, probability: 8.1 }, { home: 2, away: 2, probability: 7.2 },
    ],
    regulationResult: { home: 1, away: 1 }, wentToExtraTime: true, finalResult: { home: 3, away: 2 },
    alphaActualRank: 1, modelActualRank: 1, alphaActualProbability: 13, modelActualProbability: 8.6,
    rule25Flagged: true,
    notes: "Both matrices correctly called the 90' scoreline (1-1) — the actual quiniela-relevant result (3-2 AET) was decided by extra-time chaos, not a signal failure.",
  },
  {
    matchId: "R32-10", round: "R32", homeTeamId: "USA", awayTeamId: "BIH",
    alphaTopScorelines: [
      { home: 1, away: 1, probability: 12 }, { home: 1, away: 0, probability: 10 }, { home: 2, away: 1, probability: 10 },
    ],
    modelLambdaHome: 3.01, modelLambdaAway: 1.04,
    modelTopScorelines: [
      { home: 3, away: 1, probability: 8.3 }, { home: 2, away: 1, probability: 8.3 }, { home: 3, away: 0, probability: 8.0 },
    ],
    regulationResult: { home: 2, away: 0 }, wentToExtraTime: false, finalResult: { home: 2, away: 0 },
    alphaActualRank: 4, modelActualRank: 3, alphaActualProbability: 9, modelActualProbability: 8.0,
    notes: "Rule 17 origin match — clean sheet override confirmed by both signals reasonably closely.",
  },
  {
    matchId: "R32-11", round: "R32", homeTeamId: "ESP", awayTeamId: "AUT",
    alphaTopScorelines: [
      { home: 2, away: 0, probability: 12 }, { home: 1, away: 0, probability: 11 }, { home: 2, away: 1, probability: 10 },
    ],
    modelLambdaHome: 3.55, modelLambdaAway: 0.94,
    modelTopScorelines: [
      { home: 3, away: 0, probability: 8.6 }, { home: 3, away: 1, probability: 8.1 }, { home: 4, away: 0, probability: 7.6 },
    ],
    regulationResult: { home: 3, away: 0 }, wentToExtraTime: false, finalResult: { home: 3, away: 0 },
    alphaActualRank: 5, modelActualRank: 1, alphaActualProbability: 9, modelActualProbability: 8.6,
    notes: "Model matrix hit exactly.",
  },
  {
    matchId: "R32-12", round: "R32", homeTeamId: "POR", awayTeamId: "CRO",
    alphaTopScorelines: [
      { home: 1, away: 0, probability: 13 }, { home: 2, away: 0, probability: 12 }, { home: 1, away: 1, probability: 11 },
    ],
    modelLambdaHome: 2.46, modelLambdaAway: 1.94,
    modelTopScorelines: [
      { home: 2, away: 1, probability: 7.2 }, { home: 2, away: 2, probability: 7.0 }, { home: 1, away: 1, probability: 6.6 },
    ],
    regulationResult: { home: 2, away: 1 }, wentToExtraTime: false, finalResult: { home: 2, away: 1 },
    alphaActualRank: 4, modelActualRank: 1, alphaActualProbability: 10, modelActualProbability: 7.2,
    notes: "Model matrix hit exactly.",
  },
  {
    matchId: "R32-13", round: "R32", homeTeamId: "SUI", awayTeamId: "ALG",
    alphaTopScorelines: [
      { home: 1, away: 1, probability: 11 }, { home: 1, away: 2, probability: 9 }, { home: 2, away: 2, probability: 7 },
    ],
    modelLambdaHome: 1.80, modelLambdaAway: 0.77,
    modelTopScorelines: [
      { home: 1, away: 0, probability: 12.4 }, { home: 2, away: 0, probability: 12.4 }, { home: 1, away: 1, probability: 12.0 },
    ],
    regulationResult: { home: 2, away: 0 }, wentToExtraTime: false, finalResult: { home: 2, away: 0 },
    alphaActualRank: 8, modelActualRank: 1, alphaActualProbability: 5, modelActualProbability: 12.4,
    notes: "Alpha leaned Algeria direction; model matrix (never surfaced to the pick at the time) had the exact answer. Retroactive lesson: always cross-check the model's own matrix, not just its single-point prediction.",
  },
  {
    matchId: "R32-14", round: "R32", homeTeamId: "AUS", awayTeamId: "EGY",
    alphaTopScorelines: [
      { home: 0, away: 1, probability: 17 }, { home: 0, away: 0, probability: 16 }, { home: 1, away: 1, probability: 13 },
    ],
    modelLambdaHome: 1.00, modelLambdaAway: 2.31,
    modelTopScorelines: [
      { home: 1, away: 2, probability: 9.8 }, { home: 0, away: 2, probability: 9.8 }, { home: 1, away: 1, probability: 9.6 },
    ],
    regulationResult: { home: 1, away: 1 }, wentToExtraTime: true, penaltyWinner: "EGY",
    finalResult: { home: 1, away: 1 },
    alphaActualRank: 3, modelActualRank: 3, alphaActualProbability: 13, modelActualProbability: 9.6,
    notes: "Both signals had the draw in their top-3.",
  },
  {
    matchId: "R32-15", round: "R32", homeTeamId: "ARG", awayTeamId: "CPV",
    alphaTopScorelines: [
      { home: 0, away: 0, probability: 19 }, { home: 1, away: 0, probability: 17 }, { home: 1, away: 1, probability: 14 },
    ],
    modelLambdaHome: 4.00, modelLambdaAway: 0.37,
    modelTopScorelines: [
      { home: 3, away: 0, probability: 14.2 }, { home: 4, away: 0, probability: 14.2 }, { home: 2, away: 0, probability: 10.7 },
    ],
    regulationResult: { home: 1, away: 1 }, wentToExtraTime: true, finalResult: { home: 3, away: 2 },
    alphaActualRank: 3, modelActualRank: null, alphaActualProbability: 14, modelActualProbability: 1.0,
    rule25Flagged: true,
    notes: "Alpha had the 90' draw in its top-3. Model expected a blowout via inflated lambda 4.00 (group-stage vs weak opponents). 120' result (3-2) decided by AET chaos.",
  },
  {
    matchId: "R32-16", round: "R32", homeTeamId: "COL", awayTeamId: "GHA",
    alphaTopScorelines: [
      { home: 2, away: 0, probability: 17 }, { home: 1, away: 0, probability: 15 }, { home: 3, away: 0, probability: 12 },
    ],
    modelLambdaHome: 1.82, modelLambdaAway: 0.75,
    modelTopScorelines: [
      { home: 2, away: 0, probability: 12.7 }, { home: 1, away: 0, probability: 12.7 }, { home: 1, away: 1, probability: 11.8 },
    ],
    regulationResult: { home: 1, away: 0 }, wentToExtraTime: false, finalResult: { home: 1, away: 0 },
    alphaActualRank: 2, modelActualRank: 2, alphaActualProbability: 15, modelActualProbability: 12.7,
    notes: "1-0 is the model's #2 cell (tied at 12.7% with 2-0 at #1); alpha's #2 at higher 15% is the closer read.",
  },
  {
    matchId: "R16-01", round: "R16", homeTeamId: "CAN", awayTeamId: "MAR",
    alphaTopScorelines: [
      { home: 0, away: 0, probability: 22 }, { home: 0, away: 1, probability: 20 }, { home: 1, away: 1, probability: 13 },
    ],
    modelLambdaHome: 0.72, modelLambdaAway: 2.27,
    modelTopScorelines: [
      { home: 0, away: 2, probability: 13.0 }, { home: 0, away: 1, probability: 10.4 }, { home: 0, away: 3, probability: 9.9 },
    ],
    regulationResult: { home: 0, away: 3 }, wentToExtraTime: false, finalResult: { home: 0, away: 3 },
    alphaActualRank: 8, modelActualRank: 3, alphaActualProbability: 3, modelActualProbability: 9.9,
    notes: "Model matrix had the 0-3 blowout in its top-3; alpha's draw-leaning matrix missed the margin badly.",
  },
  {
    matchId: "R16-02", round: "R16", homeTeamId: "PAR", awayTeamId: "FRA",
    alphaTopScorelines: [
      { home: 0, away: 1, probability: 14 }, { home: 1, away: 1, probability: 14 }, { home: 0, away: 0, probability: 12 },
    ],
    modelLambdaHome: 0.57, modelLambdaAway: 4.00,
    modelTopScorelines: [
      { home: 0, away: 3, probability: 12.4 }, { home: 0, away: 4, probability: 12.4 }, { home: 0, away: 5, probability: 9.9 },
    ],
    regulationResult: { home: 0, away: 1 }, wentToExtraTime: false, finalResult: { home: 0, away: 1 },
    alphaActualRank: 1, modelActualRank: 10, alphaActualProbability: 14, modelActualProbability: 4.31,
    lambdaDivergencePct: 63,
    rule23Triggered: true,
    notes: "FRA lambda 4.00 hit the engine's hard cap — massively inflated the model matrix toward a blowout that never came. Rule 23 origin match.",
  },
  {
    matchId: "R16-03", round: "R16", homeTeamId: "BRA", awayTeamId: "NOR",
    alphaTopScorelines: [
      { home: 2, away: 0, probability: 10 }, { home: 3, away: 0, probability: 10 }, { home: 2, away: 1, probability: 8 },
    ],
    modelLambdaHome: 2.65, modelLambdaAway: 1.36,
    modelTopScorelines: [
      { home: 1, away: 1, probability: 7.4 }, { home: 2, away: 1, probability: 8.7 }, { home: 3, away: 1, probability: 7.7 },
    ],
    regulationResult: { home: 1, away: 2 }, wentToExtraTime: false, finalResult: { home: 1, away: 2 },
    alphaActualRank: 12, modelActualRank: 7, alphaActualProbability: 2, modelActualProbability: 4.5,
    notes: "Genuine upset — Haaland brace from low xG. Neither signal anticipated a Norway win, but the model's matrix had the near-misses closer.",
  },
  {
    matchId: "R16-04", round: "R16", homeTeamId: "MEX", awayTeamId: "ENG",
    alphaTopScorelines: [
      { home: 0, away: 0, probability: 16 }, { home: 0, away: 1, probability: 15 }, { home: 1, away: 1, probability: 14 },
    ],
    modelLambdaHome: 1.28, modelLambdaAway: 3.14,
    modelTopScorelines: [
      { home: 1, away: 3, probability: 8.1 }, { home: 1, away: 2, probability: 7.7 }, { home: 1, away: 4, probability: 6.3 },
    ],
    regulationResult: { home: 2, away: 3 }, wentToExtraTime: false, finalResult: { home: 2, away: 3 },
    alphaActualRank: 13, modelActualRank: 7, alphaActualProbability: 1, modelActualProbability: 5.2,
    notes: "5-goal thriller neither matrix anticipated exactly, but the model's ENG-favoring lambda (3.14) was directionally closer.",
  },
  {
    matchId: "R16-05", round: "R16", homeTeamId: "POR", awayTeamId: "ESP",
    alphaTopScorelines: [
      { home: 1, away: 1, probability: 14 }, { home: 0, away: 1, probability: 11 }, { home: 1, away: 0, probability: 10 },
    ],
    modelLambdaHome: 1.94, modelLambdaAway: 2.72,
    modelTopScorelines: [
      { home: 1, away: 2, probability: 7.0 }, { home: 2, away: 2, probability: 6.8 }, { home: 1, away: 3, probability: 6.3 },
    ],
    regulationResult: { home: 0, away: 1 }, wentToExtraTime: false, finalResult: { home: 0, away: 1 },
    alphaActualRank: 2, modelActualRank: 19, alphaActualProbability: 11, modelActualProbability: 1.98,
    lambdaDivergencePct: 55,
    rule23Triggered: true,
    notes: "Model lambda (2.72 for ESP) far exceeded alpha's implied xG (1.26) — model matrix expected a high-scoring ESP win, actual was a tight 0-1.",
  },
  {
    matchId: "R16-06", round: "R16", homeTeamId: "USA", awayTeamId: "BEL",
    alphaTopScorelines: [
      { home: 1, away: 1, probability: 13 }, { home: 2, away: 1, probability: 9 }, { home: 0, away: 1, probability: 8 },
    ],
    modelLambdaHome: 1.02, modelLambdaAway: 2.14,
    modelTopScorelines: [
      { home: 1, away: 1, probability: 10.5 }, { home: 1, away: 2, probability: 9.9 }, { home: 0, away: 2, probability: 9.7 },
    ],
    regulationResult: { home: 1, away: 4 }, wentToExtraTime: false, finalResult: { home: 1, away: 4 },
    alphaActualRank: 16, modelActualRank: 20, alphaActualProbability: 1, modelActualProbability: 0.4,
    notes: "Stale BEL formOverride (score 25, never updated post-Senegal) likely contaminated the model lambda. Both signals totally missed the blowout margin.",
  },
  {
    matchId: "R16-07", round: "R16", homeTeamId: "ARG", awayTeamId: "EGY",
    alphaTopScorelines: [
      { home: 1, away: 0, probability: 21 }, { home: 2, away: 0, probability: 16 }, { home: 0, away: 0, probability: 15 },
    ],
    modelLambdaHome: 4.00, modelLambdaAway: 0.97,
    modelTopScorelines: [
      { home: 3, away: 0, probability: 8.3 }, { home: 4, away: 0, probability: 8.3 }, { home: 3, away: 1, probability: 8.1 },
    ],
    regulationResult: { home: 3, away: 2 }, wentToExtraTime: false, finalResult: { home: 3, away: 2 },
    alphaActualRank: null, modelActualRank: 11, alphaActualProbability: 1, modelActualProbability: 3.92,
    lambdaDivergencePct: 51,
    rule23Triggered: true,
    closerSignalOverride: {
      value: "tie",
      reason: "Alpha correctly read the 1-goal margin (top cells 1-0/2-0/0-0, all low-scoring) but completely missed the high-scoring total (actual was 5 goals). The model's matrix got the total-goals ballpark and Argentina's exact goal count right (top cells 3-0/4-0/3-1, all showing ARG scoring 3) but missed the tight margin. A strict rank/probability comparison favors the model (rank #11 vs alpha's unranked <1%), but each signal captured a real, different dimension of the actual result — treated as a tie by design rather than by the numeric rule alone.",
    },
    notes: "Alpha's implied margin (1 goal) was structurally closer than the model's blowout-shaped matrix (lambda 4.00, inflated by weak group-stage opponents).",
  },
  {
    matchId: "R16-08", round: "R16", homeTeamId: "SUI", awayTeamId: "COL",
    alphaTopScorelines: [
      { home: 1, away: 1, probability: 12 }, { home: 0, away: 1, probability: 11 }, { home: 1, away: 2, probability: 10 },
    ],
    modelLambdaHome: 2.17, modelLambdaAway: 2.44,
    modelTopScorelines: [
      { home: 2, away: 2, probability: 7.1 }, { home: 1, away: 2, probability: 6.6 }, { home: 1, away: 1, probability: 6.1 },
    ],
    regulationResult: { home: 0, away: 0 }, wentToExtraTime: false, finalResult: { home: 0, away: 0 },
    alphaActualRank: 5, modelActualRank: 22, alphaActualProbability: 8, modelActualProbability: 1.71,
    lambdaDivergencePct: 51,
    rule23Triggered: true,
    notes: "Model matrix expected goals to flow (combined lambda 4.61); alpha's tighter read (0-1/1-1 top cells) was closer to the dry 0-0.",
  },

  // ==========================================
  // QUARTER-FINALS
  // ==========================================
  {
    matchId: "QF-1", round: "QF", homeTeamId: "FRA", awayTeamId: "MAR",
    date: "2026-07-09",
    modelLambdaHome: 2.83, modelLambdaAway: 0.64,
    modelTopScorelines: [
      { home: 2, away: 0, probability: 12.6 }, { home: 3, away: 0, probability: 11.8 }, { home: 4, away: 0, probability: 8.4 },
    ],
    alphaTopScorelines: [
      { home: 1, away: 0, probability: 17 }, { home: 0, away: 0, probability: 16 }, { home: 1, away: 1, probability: 14 },
    ],
    regulationResult: { home: 2, away: 0 }, wentToExtraTime: false, finalResult: { home: 2, away: 0 },
    modelActualRank: 1, modelActualProbability: 12.6, alphaActualRank: 4, alphaActualProbability: 10,
    rule23Triggered: false, rule25Flagged: false,
    notes: "Model exact hit — 2-0 rank 1 at 12.6%. Alpha top pick was 1-0 " +
           "(17%); 2-0 was rank 4 in alpha matrix (tied with 0-1 MAR at 10%). " +
           "France xG 3.04 vs Morocco 0.14. Rule 13/11b caused chat pick to " +
           "be 2-1; model anchor was correct. Model closer: rank 1 vs rank 4.",
  },
  {
    matchId: "QF-2", round: "QF", homeTeamId: "ESP", awayTeamId: "BEL",
    date: "2026-07-10",
    modelLambdaHome: 1.84, modelLambdaAway: 1.31,
    modelTopScorelines: [
      { home: 1, away: 1, probability: 11.7 }, { home: 2, away: 1, probability: 9.5 }, { home: 2, away: 0, probability: 7.2 },
    ],
    alphaImpliedLambdaHome: 1.45, alphaImpliedLambdaAway: 0.90,
    alphaTopScorelines: [
      { home: 1, away: 1, probability: 13 }, { home: 1, away: 0, probability: 11 }, { home: 2, away: 0, probability: 10 }, { home: 2, away: 1, probability: 9 },
    ],
    regulationResult: { home: 2, away: 1 }, wentToExtraTime: false, finalResult: { home: 2, away: 1 },
    modelActualRank: 2, modelActualProbability: 9.5, alphaActualRank: 4, alphaActualProbability: 9,
    rule23Triggered: false, rule25Flagged: false,
    notes: "Model rank 2 (9.5%) vs alpha rank 4 (9%) — model closer. Chat " +
           "pick was 1-0 (correct margin, wrong total); actual 2-1 exposed a " +
           "gap in the engine's Tier 2 compression for moderate Under signals " +
           "when the favorite's own lambda/form already implied a higher " +
           "attacking output. Led to Rule 30 (Favorite Lambda Floor).",
  },
  {
    matchId: "QF-3", round: "QF", homeTeamId: "NOR", awayTeamId: "ENG",
    date: "2026-07-11",
    modelLambdaHome: 0.71, modelLambdaAway: 1.81,
    modelTopScorelines: [
      { home: 0, away: 1, probability: 13.2 }, { home: 0, away: 2, probability: 13.2 }, { home: 1, away: 1, probability: 11.7 },
    ],
    alphaTopScorelines: [
      { home: 0, away: 1, probability: 11 }, { home: 0, away: 2, probability: 11 }, { home: 1, away: 1, probability: 11 },
    ],
    regulationResult: { home: 1, away: 1 }, wentToExtraTime: true, finalResult: { home: 1, away: 2 },
    modelActualRank: 3, modelActualProbability: 11.7,
    alphaActualRank: 3, alphaActualProbability: 11,
    closerSignalOverride: {
      value: "tie",
      reason: "On the regulation scoreline (1-1), model and alpha both land at rank #3 " +
              "with near-identical probability (11.7% vs 11%, alpha's cell tied 3-way with " +
              "0-1/0-2) — genuine tie, not worth deciding on a 0.7pp gap. On the final AET " +
              "scoreline (1-2), the engine's own Dixon-Coles matrix ranks it #5 at 9.4% " +
              "(tied displayed value with 0-0 at 9.4%) — NOT #4 as originally transcribed " +
              "from the screenshot; corrected against the canonical scoreDistribution() " +
              "output for this session (see notes). Alpha's transcribed #4/10% for 1-2 " +
              "could not be cross-checked (no canonical alpha matrix source in-repo). " +
              "Either way both signals landed in the same neighborhood on the final score too.",
    },
    rule23Triggered: false, rule25Flagged: true,
    alphaRegulationRank: 1, alphaRegulationCloser: true,
    modelRegulationNote: "Model's raw pick (0-1) was never designed to isolate " +
      "regulation time — it targets the final result. Its matrix does show 1-1 " +
      "at rank #3 (11.7%), close to alpha's tied #1 (11%), but that's informational " +
      "only, not a fair predictive-skill measurement on this axis.",
    notes: "Norway 1-2 England (AET). Schjelderup opened for Norway ~24', Bellingham " +
           "equalized just before HT (1-1 regulation — model's rank-3 cell at 11.7%, " +
           "alpha's rank-3 cell at 11% in a 3-way tie with 0-1/0-2), scoreless 2nd half, " +
           "Bellingham's extra-time winner sealed it. Haaland did NOT score — ends his " +
           "run of scoring in 14 straight Norway matches. Chat's submitted pick was 1-2 " +
           "— exact final scoreline hit (Rule 26 no-ancestor matrix-lookup fix from the " +
           "prior session correctly resolved the no-ancestor case here). DATA NOTE: the " +
           "initial screenshot transcription of the model matrix listed the final score " +
           "1-2 as ranked 4th at 9.4% — cross-checked against the canonical " +
           "scoreDistribution() engine output (same homeLambda/awayLambda as the pick " +
           "judge fixture) and corrected: 1-2 is actually rank 5 at 9.4%, tied in " +
           "displayed probability with rank-4 0-0 (also 9.4% at higher precision, " +
           "9.396% vs 9.363%) — the rank number was off by one in the transcription, the " +
           "probability itself was accurate. rule25Flagged: AET result, regulation-score " +
           "comparison used per R32-09 convention for the primary rank fields. England " +
           "advance to face Argentina (SF-1, Atlanta, Jul 15).",
  },
  {
    matchId: "QF-4", round: "QF", homeTeamId: "ARG", awayTeamId: "SUI",
    date: "2026-07-11",
    modelLambdaHome: 4.0, modelLambdaAway: 0.7,
    modelTopScorelines: [
      { home: 3, away: 0, probability: 10.2 }, { home: 4, away: 0, probability: 10.2 }, { home: 5, away: 0, probability: 8.2 },
    ],
    alphaImpliedLambdaHome: 1.7, alphaImpliedLambdaAway: 0.5,
    alphaTopScorelines: [
      { home: 1, away: 0, probability: 15 }, { home: 2, away: 0, probability: 14 }, { home: 1, away: 1, probability: 10 },
    ],
    regulationResult: { home: 1, away: 1 }, wentToExtraTime: true, finalResult: { home: 3, away: 1 },
    modelActualRank: 13, modelActualProbability: 3,
    alphaActualRank: 3, alphaActualProbability: 10,
    closerSignalOverride: {
      value: "model",
      reason: "Split decision depending on which score you compare against. On the " +
              "REGULATION scoreline (1-1), alpha is clearly closer: rank #3 at 10% vs the " +
              "model's rank #13 at 3% — Rule 28's pattern floor blinded the model's own " +
              "matrix to a draw-at-90' outcome. On the FINAL AET scoreline (3-1) — arguably " +
              "the more meaningful read here since 2 of Argentina's 3 goals came in extra " +
              "time — the model is closer: rank #4-5 (tied with 4-1) at 7.2% vs alpha's " +
              "rank #7 at 6% (per the original transcription; not independently verifiable, " +
              "no canonical alpha matrix source in-repo). Calling MODEL CLOSER overall: " +
              "alpha's matrix was anchored toward a low-scoring match (1-0/2-0 dominant) " +
              "and never priced in Argentina's cluster-scoring pattern once they broke " +
              "through — exactly what Rule 28 exists to catch, and exactly why the engine's " +
              "Rule 28-driven pick (3-0, corrected to 3-1 via Rule 31) tracked the final " +
              "outcome better than alpha's market-implied read, even though alpha correctly " +
              "read the 90-minute draw.",
    },
    rule23Triggered: true, lambdaDivergencePct: 53, rule25Flagged: true,
    // Alpha's #1-ranked scoreline (1-0, 15%) was not the 1-1 regulation
    // score, so alphaRegulationCloser is false — but 1-1 was alpha's #3
    // pick (10%), i.e. present in its top-3, not a blind miss.
    alphaRegulationRank: 3, alphaRegulationCloser: false,
    modelRegulationNote: "Model's raw pick (3-0, corrected to 3-1) was never designed " +
      "to isolate regulation time — it targets the final result. The large numeric gap " +
      "from the 90' score (1-1) reflects the model correctly targeting the AET-final " +
      "score, not a regulation-time miss; not scored on this axis.",
    notes: "Argentina 3-1 Switzerland (AET). Mac Allister opened 10' (Messi corner " +
           "assist), Ndoye equalized 1-1 for Switzerland 67' — even after Embolo's 72' " +
           "red card left them down to 10 men for the final ~48 minutes. Alvarez (112') " +
           "and Lautaro Martinez (120+1') settled it in extra time. Chat's submitted " +
           "pick was Argentina 3-0 (Rule 28's scoring-pattern floor correctly held " +
           "Argentina at 3, but nothing in the engine addressed Switzerland's side at " +
           "kickoff) — a miss on the exact scoreline but a correct match-outcome/win-" +
           "margin read (3 goals, ARG win). This miss motivated Rule 31 (Underdog " +
           "Resilience Floor): Switzerland's BTTS No Score=55 (weak-but-present, 50-59) " +
           "combined with their resilience in the prior round (0-0 AET vs Colombia, won " +
           "4-3 on PKs) should have floored them at 1 goal. Retroactively verified: with " +
           "Rule 31 now wired in and awayWentToExtraTimeOrPenaltiesPriorRound=true set on " +
           "the fixture, the CLI produces Argentina 3-1 — matching the actual result. " +
           "DATA NOTE: the initial screenshot transcription of the model's top-3 listed " +
           "Argentina 2-0 (7.7%) as the #3 cell — cross-checked against the canonical " +
           "scoreDistribution() engine output (same lambda 4.0/0.7 as the pick judge " +
           "fixture) and corrected: true #3 is Argentina 5-0 at 8.2%, with 2-0 actually " +
           "#4 at 7.7% (10.2/10.2/8.2/7.7 is the verified order — 2-0 was likely swapped " +
           "in for 5-0 in transcription as the more 'plausible-looking' scoreline). " +
           "Argentina advance to face England (SF-1, Atlanta, Jul 15).",
  },
];

export function getSignalAccuracySummary() {
  const comparable = signalAccuracyData.filter(
    (e) => !e.rule25Flagged && e.finalResult != null
  );
  const withSignal = comparable.map((e) => ({ e, signal: computeCloserSignal(e) }));

  const alphaCloser = withSignal.filter((x) => x.signal === "alpha").length;
  const modelCloser = withSignal.filter((x) => x.signal === "model").length;
  const tie = withSignal.filter((x) => x.signal === "tie").length;

  const rule23Matches = signalAccuracyData.filter((e) => e.rule23Triggered);
  const rule23Signals = rule23Matches.map((e) => computeCloserSignal(e));
  const rule23AlphaWins = rule23Signals.filter((s) => s === "alpha").length;
  const rule23Ties = rule23Signals.filter((s) => s === "tie").length;
  const rule23ModelWins = rule23Signals.filter((s) => s === "model").length;

  return {
    totalMatches: signalAccuracyData.length,
    comparableMatches: comparable.length,
    aetExcluded: signalAccuracyData.length - comparable.length,
    alphaCloser,
    modelCloser,
    tie,
    rule23TriggeredCount: rule23Matches.length,
    rule23Breakdown: { alpha: rule23AlphaWins, tie: rule23Ties, model: rule23ModelWins },
  };
}
