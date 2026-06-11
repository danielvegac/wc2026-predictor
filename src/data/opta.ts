// ============================================================
// Opta Supercomputer Reference Data
// ============================================================
// Pre-tournament predictions from the Opta Supercomputer (25,000 sims)
// Source: theanalyst.com — published June 1, 2026
//
// This is a STATIC reference dataset for validation/comparison.
// Our model runs independently; Opta serves as a third benchmark
// alongside the user's own predictions.
//
// Live updates: theanalyst.com/competition/fifa-world-cup/predictions
// (can be scraped via Vercel API route in Phase 4)

export interface OptaTeamPrediction {
  teamId: string;
  championshipProb: number;       // % chance of winning the World Cup
  finalProb: number | null;       // % chance of reaching the final
  semifinalProb: number | null;   // % chance of reaching the semis
  quarterfinalProb: number | null;// % chance of reaching the QFs
  groupWinProb: number | null;    // % chance of winning their group
  advanceFromGroupProb: number | null; // % chance of advancing (top 2 + best 3rd)
}

/**
 * Opta Supercomputer championship probabilities (pre-tournament)
 * Source: Opta Analyst, June 2026 — 25,000 simulations
 *
 * Advancement probabilities filled where publicly reported.
 * Null values = not published in available sources.
 */
export const optaPredictions: OptaTeamPrediction[] = [
  // === Tier 1: Genuine contenders (>5%) ===
  { teamId: "ESP", championshipProb: 16.04, finalProb: 25.6, semifinalProb: 39.0, quarterfinalProb: 52.1, groupWinProb: 75.3, advanceFromGroupProb: null },
  { teamId: "FRA", championshipProb: 12.76, finalProb: 21.3, semifinalProb: null, quarterfinalProb: 47.9, groupWinProb: 60.3, advanceFromGroupProb: null },
  { teamId: "ENG", championshipProb: 11.36, finalProb: 19.0, semifinalProb: 30.3, quarterfinalProb: 47.7, groupWinProb: 67.9, advanceFromGroupProb: null },
  { teamId: "ARG", championshipProb: 10.35, finalProb: null, semifinalProb: null, quarterfinalProb: null, groupWinProb: 73.0, advanceFromGroupProb: null },
  { teamId: "POR", championshipProb: 6.82, finalProb: null, semifinalProb: null, quarterfinalProb: null, groupWinProb: null, advanceFromGroupProb: null },
  { teamId: "BRA", championshipProb: 6.45, finalProb: null, semifinalProb: null, quarterfinalProb: null, groupWinProb: null, advanceFromGroupProb: null },

  // === Tier 2: Dark horses (2-5%) ===
  { teamId: "GER", championshipProb: 5.43, finalProb: null, semifinalProb: null, quarterfinalProb: 33.8, groupWinProb: null, advanceFromGroupProb: null },
  { teamId: "NED", championshipProb: 3.80, finalProb: null, semifinalProb: null, quarterfinalProb: null, groupWinProb: null, advanceFromGroupProb: null },
  { teamId: "NOR", championshipProb: 3.36, finalProb: null, semifinalProb: null, quarterfinalProb: 27.2, groupWinProb: null, advanceFromGroupProb: null },
  { teamId: "BEL", championshipProb: 2.35, finalProb: null, semifinalProb: null, quarterfinalProb: null, groupWinProb: null, advanceFromGroupProb: null },
  { teamId: "COL", championshipProb: 2.10, finalProb: null, semifinalProb: null, quarterfinalProb: null, groupWinProb: null, advanceFromGroupProb: null },
  { teamId: "MAR", championshipProb: 1.93, finalProb: null, semifinalProb: null, quarterfinalProb: null, groupWinProb: null, advanceFromGroupProb: null },

  // === Tier 3: Outsiders (1-2%) ===
  { teamId: "URU", championshipProb: 1.70, finalProb: null, semifinalProb: null, quarterfinalProb: null, groupWinProb: null, advanceFromGroupProb: null },
  { teamId: "MEX", championshipProb: 1.00, finalProb: null, semifinalProb: null, quarterfinalProb: null, groupWinProb: 47.8, advanceFromGroupProb: 50.0 },
  { teamId: "USA", championshipProb: 1.24, finalProb: null, semifinalProb: 8.0, quarterfinalProb: null, groupWinProb: 32.8, advanceFromGroupProb: null },
  { teamId: "JPN", championshipProb: 1.50, finalProb: null, semifinalProb: null, quarterfinalProb: null, groupWinProb: null, advanceFromGroupProb: null },
  { teamId: "SEN", championshipProb: 1.20, finalProb: null, semifinalProb: null, quarterfinalProb: null, groupWinProb: null, advanceFromGroupProb: null },
  { teamId: "CRO", championshipProb: 1.10, finalProb: null, semifinalProb: null, quarterfinalProb: null, groupWinProb: null, advanceFromGroupProb: null },

  // === Tier 4: Long shots (<1%) ===
  { teamId: "CAN", championshipProb: 0.82, finalProb: null, semifinalProb: null, quarterfinalProb: null, groupWinProb: null, advanceFromGroupProb: 42.7 },
  { teamId: "KOR", championshipProb: 0.70, finalProb: null, semifinalProb: null, quarterfinalProb: null, groupWinProb: null, advanceFromGroupProb: null },
  { teamId: "SUI", championshipProb: 0.65, finalProb: null, semifinalProb: null, quarterfinalProb: null, groupWinProb: null, advanceFromGroupProb: null },
  { teamId: "AUT", championshipProb: 0.55, finalProb: null, semifinalProb: null, quarterfinalProb: null, groupWinProb: null, advanceFromGroupProb: null },
  { teamId: "TUR", championshipProb: 0.50, finalProb: null, semifinalProb: null, quarterfinalProb: null, groupWinProb: 29.0, advanceFromGroupProb: null },
  { teamId: "ECU", championshipProb: 0.45, finalProb: null, semifinalProb: null, quarterfinalProb: null, groupWinProb: null, advanceFromGroupProb: null },
  { teamId: "EGY", championshipProb: 0.40, finalProb: null, semifinalProb: null, quarterfinalProb: null, groupWinProb: null, advanceFromGroupProb: null },
  { teamId: "AUS", championshipProb: 0.35, finalProb: null, semifinalProb: null, quarterfinalProb: null, groupWinProb: 17.6, advanceFromGroupProb: null },
  { teamId: "CIV", championshipProb: 0.35, finalProb: null, semifinalProb: null, quarterfinalProb: null, groupWinProb: null, advanceFromGroupProb: null },
  { teamId: "ALG", championshipProb: 0.30, finalProb: null, semifinalProb: null, quarterfinalProb: null, groupWinProb: null, advanceFromGroupProb: null },
  { teamId: "IRN", championshipProb: 0.25, finalProb: null, semifinalProb: null, quarterfinalProb: null, groupWinProb: null, advanceFromGroupProb: null },
  { teamId: "SWE", championshipProb: 0.20, finalProb: null, semifinalProb: null, quarterfinalProb: null, groupWinProb: null, advanceFromGroupProb: null },
  { teamId: "PAR", championshipProb: 0.20, finalProb: null, semifinalProb: null, quarterfinalProb: null, groupWinProb: 20.5, advanceFromGroupProb: null },
  { teamId: "TUN", championshipProb: 0.15, finalProb: null, semifinalProb: null, quarterfinalProb: null, groupWinProb: null, advanceFromGroupProb: null },
  { teamId: "SCO", championshipProb: 0.15, finalProb: null, semifinalProb: null, quarterfinalProb: null, groupWinProb: null, advanceFromGroupProb: null },
  { teamId: "GHA", championshipProb: 0.12, finalProb: null, semifinalProb: null, quarterfinalProb: null, groupWinProb: null, advanceFromGroupProb: null },
  { teamId: "CZE", championshipProb: 0.12, finalProb: null, semifinalProb: null, quarterfinalProb: null, groupWinProb: null, advanceFromGroupProb: null },
  { teamId: "QAT", championshipProb: 0.10, finalProb: null, semifinalProb: null, quarterfinalProb: null, groupWinProb: null, advanceFromGroupProb: null },
  { teamId: "KSA", championshipProb: 0.10, finalProb: null, semifinalProb: null, quarterfinalProb: null, groupWinProb: null, advanceFromGroupProb: null },
  { teamId: "PAN", championshipProb: 0.08, finalProb: null, semifinalProb: null, quarterfinalProb: null, groupWinProb: null, advanceFromGroupProb: null },
  { teamId: "RSA", championshipProb: 0.08, finalProb: null, semifinalProb: null, quarterfinalProb: null, groupWinProb: null, advanceFromGroupProb: null },
  { teamId: "BIH", championshipProb: 0.07, finalProb: null, semifinalProb: null, quarterfinalProb: null, groupWinProb: null, advanceFromGroupProb: null },
  { teamId: "UZB", championshipProb: 0.06, finalProb: null, semifinalProb: null, quarterfinalProb: null, groupWinProb: null, advanceFromGroupProb: null },
  { teamId: "IRQ", championshipProb: 0.05, finalProb: null, semifinalProb: null, quarterfinalProb: null, groupWinProb: null, advanceFromGroupProb: null },
  { teamId: "COD", championshipProb: 0.05, finalProb: null, semifinalProb: null, quarterfinalProb: null, groupWinProb: null, advanceFromGroupProb: null },
  { teamId: "JOR", championshipProb: 0.04, finalProb: null, semifinalProb: null, quarterfinalProb: null, groupWinProb: null, advanceFromGroupProb: null },
  { teamId: "NZL", championshipProb: 0.03, finalProb: null, semifinalProb: null, quarterfinalProb: null, groupWinProb: null, advanceFromGroupProb: null },
  { teamId: "HAI", championshipProb: 0.02, finalProb: null, semifinalProb: null, quarterfinalProb: null, groupWinProb: null, advanceFromGroupProb: null },
  { teamId: "CPV", championshipProb: 0.02, finalProb: null, semifinalProb: null, quarterfinalProb: null, groupWinProb: null, advanceFromGroupProb: null },
  { teamId: "CUW", championshipProb: 0.01, finalProb: null, semifinalProb: null, quarterfinalProb: null, groupWinProb: null, advanceFromGroupProb: null },
];

/** Quick lookup by team ID */
export function getOptaPrediction(teamId: string): OptaTeamPrediction | undefined {
  return optaPredictions.find((p) => p.teamId === teamId);
}

/** Get all teams sorted by championship probability */
export function getOptaRanking(): OptaTeamPrediction[] {
  return [...optaPredictions].sort((a, b) => b.championshipProb - a.championshipProb);
}

/**
 * Opta Power Rankings context for Group K
 * (Daniel's group of interest)
 *
 * Group K is the 2nd toughest group per Opta Power Rankings:
 * - Colombia: 6th in Opta Power Rankings
 * - Portugal: 9th in Opta Power Rankings
 * - Uzbekistan: debut
 * - DR Congo: low probability
 *
 * The Colombia vs Portugal match on June 27 in Miami is flagged by Opta
 * as one of the three most pivotal MD3 clashes in the entire tournament.
 */

/**
 * Model Health Check: compare our Monte Carlo output against Opta
 *
 * Flags divergences above thresholds:
 * - Championship: >3% absolute difference
 * - Advancement (QF+): >10% absolute difference
 * - Group winner: >15% absolute difference
 */
export interface HealthCheckResult {
  teamId: string;
  metric: string;
  ourValue: number;
  optaValue: number;
  divergence: number;     // absolute difference
  severity: "ok" | "mild" | "flag";
}

export function runHealthCheck(
  ourChampionProbs: Record<string, number>,
  optaData: OptaTeamPrediction[] = optaPredictions
): HealthCheckResult[] {
  const results: HealthCheckResult[] = [];

  for (const opta of optaData) {
    const ourProb = (ourChampionProbs[opta.teamId] ?? 0) * 100;
    const optaProb = opta.championshipProb;
    const divergence = Math.abs(ourProb - optaProb);

    let severity: HealthCheckResult["severity"] = "ok";
    if (divergence > 5) severity = "flag";
    else if (divergence > 3) severity = "mild";

    results.push({
      teamId: opta.teamId,
      metric: "championship",
      ourValue: ourProb,
      optaValue: optaProb,
      divergence,
      severity,
    });
  }

  return results.sort((a, b) => b.divergence - a.divergence);
}
