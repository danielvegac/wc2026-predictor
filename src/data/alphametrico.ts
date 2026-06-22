// ============================================================
// alphametrico Market Signal Data
// ============================================================
// Manually populated before each match day from alphametrico's
// dashboard (anchored on Pinnacle sharp odds).
// Shown for all matches — pre-match as signal, post-match as outcome tracker.
//
// divergence values:
//   "confirmed"  — market and our model agree on direction + margin
//   "warning"    — market sees meaningfully different margin or result
//   "neutral"    — market and model loosely aligned, no strong signal
//
// topSignals confidence values: "high" | "medium" | "low"
// (derived from alphametrico Score: >65 = high, 40-65 = medium, <40 = low)

export interface AlphaSignal {
  label: string;           // plain-language description
  ev: string;              // e.g. "+16–39%" or "+7%"
  confidence: "high" | "medium" | "low";
}

export interface AlphaMatchData {
  matchId: string;
  matchScore: number;           // alphametrico's overall match confidence (0–100)
  radarSummary: string;         // one-line plain-language radar read
  divergence: "confirmed" | "warning" | "neutral";
  divergenceNote: string;       // specific explanation of where model and market agree/differ
  topSignals: AlphaSignal[];    // 2–4 key EV signals, translated to plain language
  alphaPickExact: string;       // e.g. "2-1 Belgium" — alpha's implied exact score zone
  alphaPickNote: string;        // one sentence rationale for the pick
}

export const alphaMatchData: AlphaMatchData[] = [

  // ── June 21 ──────────────────────────────────────────────

  {
    matchId: "GS-H-3",
    matchScore: 77,
    radarSummary: "Spain dominant, Saudi Arabia unlikely to score",
    divergence: "confirmed",
    divergenceNote: "Market and model agree Spain win clearly. Alpha sweet spot is 2-goal margin — model says similar.",
    topSignals: [
      { label: "Saudi Arabia don't score (BTTS No)", ev: "+13.4%", confidence: "high" },
      { label: "Spain win by 2+ goals", ev: "+5.6%", confidence: "high" },
      { label: "Spain win by 3+ goals", ev: "+9.1%", confidence: "medium" },
    ],
    alphaPickExact: "2-0 Spain",
    alphaPickNote: "Clean sheet zone, ~2-goal margin. 3-0 and 4-0 also in range — Spain motivated after Cape Verde shock.",
  },

  {
    matchId: "GS-G-3",
    matchScore: 87,
    radarSummary: "Tight game, ~2 goals total, Iran far more competitive than market expects",
    divergence: "warning",
    divergenceNote: "Market prices Belgium to run away; alpha strongly disagrees — Iran staying within 2 goals is the highest-confidence signal.",
    topSignals: [
      { label: "Iran stays within 2 goals of Belgium", ev: "+13–39%", confidence: "high" },
      { label: "Under 3 total goals", ev: "+7%", confidence: "high" },
      { label: "Under 2.5 total goals", ev: "+8.6%", confidence: "medium" },
      { label: "Draw underpriced by market", ev: "+24.6%", confidence: "low" },
    ],
    alphaPickExact: "2-1 Belgium",
    alphaPickNote: "Tight Belgium win zone. 2-0 and 3-0 strongly disfavored. Iran competitive — BTTS essentially neutral.",
  },

];

/** Get alphametrico data for a specific match. Returns undefined if not available. */
export function getAlphaData(matchId: string): AlphaMatchData | undefined {
  return alphaMatchData.find((d) => d.matchId === matchId);
}
