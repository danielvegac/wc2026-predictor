// ============================================================
// Quiniela Pool Benchmark — Anonymized reference data only
// ============================================================
// The real-world "Jeeves World Cup Pool" (114 participants) has
// concluded. Only anonymized point thresholds are stored here —
// no participant names, per privacy requirement.

export const poolTotalParticipants = 114;

// Anonymized point thresholds only — no participant names, per privacy requirement.
// Rank 1 = leader; ranks 2-15 = known next-highest scores.
export const knownPoolPointThresholds: number[] = [
  380, 371, 354, 349, 344, 342, 341, 335, 335, 333, 330, 328, 328, 328, 322,
];

export const danielOfficialScore = 328;
export const danielOfficialRank = 14;

export interface PlacementResult {
  total: number;
  wouldHaveWon: boolean;
  tiedForFirst: boolean;
  estimatedRank: string;
  note: string;
}

export function computeQuinielaPlacement(total: number): PlacementResult {
  const thresholds = knownPoolPointThresholds; // sorted desc, index 0 = rank 1
  const leaderPoints = thresholds[0];

  if (total > leaderPoints) {
    return {
      total,
      wouldHaveWon: true,
      tiedForFirst: false,
      estimatedRank: "1st of 114",
      note: `Would have won the pool outright with ${total} pts, surpassing the leader's ${leaderPoints} pts.`,
    };
  }
  if (total === leaderPoints) {
    return {
      total,
      wouldHaveWon: false,
      tiedForFirst: true,
      estimatedRank: "Tied for 1st of 114",
      note: `Would have tied the leader at ${leaderPoints} pts — real tiebreaker rules unknown, so an outright win isn't guaranteed.`,
    };
  }

  const rankIndex = thresholds.findIndex((pts) => pts <= total);
  if (rankIndex === -1) {
    return {
      total,
      wouldHaveWon: false,
      tiedForFirst: false,
      estimatedRank: "16th or lower (exact rank unknown beyond top 15)",
      note: `Below the lowest known top-15 score (${thresholds[14]} pts) — remaining 99 participants' scores aren't available.`,
    };
  }

  if (thresholds[rankIndex] === total) {
    return {
      total,
      wouldHaveWon: false,
      tiedForFirst: false,
      estimatedRank: `Tied at rank ${rankIndex + 1}`,
      note: `Exact tie at ${total} pts with the rank ${rankIndex + 1} score — real tiebreaker rules unknown.`,
    };
  }

  return {
    total,
    wouldHaveWon: false,
    tiedForFirst: false,
    estimatedRank: `Between rank ${rankIndex} and rank ${rankIndex + 1}`,
    note: `Falls between two known thresholds — exact rank depends on the unlisted participants.`,
  };
}
