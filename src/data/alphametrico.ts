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
  matchDate?: string;           // ISO date string, e.g. "2026-06-22"
  homeTeamId?: string;          // FIFA team code
  awayTeamId?: string;          // FIFA team code
  matchScore?: number;          // alphametrico's overall match confidence (0–100) — legacy field
  overallScore?: number;        // alphametrico's overall match confidence (0–100)
  radarSummary?: string;        // one-line plain-language radar read
  divergence?: "confirmed" | "warning" | "neutral";
  divergenceNote?: string;      // specific explanation of where model and market agree/differ
  topSignals?: AlphaSignal[];   // 2–4 key EV signals, translated to plain language
  alphaPickExact: string;       // e.g. "2-1 Belgium" — alpha's implied exact score zone
  alphaPickNote: string;        // one sentence rationale for the pick
  signalOutcome?: "hit" | "partial" | "miss"; // post-match outcome assessment
  signalNote?: string;          // post-match calibration note
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

  {
    matchId: "GS-H-4",
    matchScore: 92,
    radarSummary: "Very low scoring expected — market wildly overprices goals, Cape Verde far more competitive than odds suggest",
    divergence: "warning",
    divergenceNote: "Market prices Uruguay to win comfortably with 2-3 goals; alpha strongly disagrees — Under 2 total goals has +48% EV, all high-scoring markets have deeply negative EV. Cape Verde defensive blueprint from Spain draw still intact.",
    topSignals: [
      { label: "Under 3 total goals (Score 87)", ev: "+18.6%", confidence: "high" },
      { label: "Under 2.5 total goals (Score 82)", ev: "+26.2%", confidence: "high" },
      { label: "Under 2 total goals (Score 69)", ev: "+48.2%", confidence: "high" },
      { label: "Cape Verde +2 Asian Handicap (Score 87)", ev: "+17.6%", confidence: "high" },
    ],
    alphaPickExact: "1-0 Uruguay",
    alphaPickNote: "Tight Uruguay win, Cape Verde competitive. BTTS No has +8.5% EV — one goal may decide this. Over 2.5 has -37.7% EV, the sharpest anti-signal in Group H.",
  },

  {
    matchId: "GS-G-4",
    matchScore: 92,
    radarSummary: "Egypt strong favourites — BTTS No dominant signal, market underprices Egypt result",
    divergence: "warning",
    divergenceNote: "Alpha strongly favours Egypt to win AND keep New Zealand from scoring. BTTS No scores 83 — highest confidence signal. All Egypt result markets show 25-50% positive EV at efficient odds.",
    topSignals: [
      { label: "BTTS No — New Zealand unlikely to score (Score 83)", ev: "+32.5%", confidence: "high" },
      { label: "Egypt win (1X2 Egypt, Score 83)", ev: "+25.5%", confidence: "high" },
      { label: "Egypt -0.75 handicap (Score 82)", ev: "+32.8%", confidence: "high" },
      { label: "Egypt -1 handicap (Score 76)", ev: "+42.3%", confidence: "high" },
    ],
    alphaPickExact: "0-2 Egypt",
    alphaPickNote: "Egypt win with New Zealand unlikely to score — BTTS No at Score 83 is the anchor signal. Egypt -1 handicap has +42% EV at 2.14 odds.",
  },

  // ── June 22 ──────────────────────────────────────────────

  {
    matchId: "GS-I-3",
    matchScore: 82,
    radarSummary: "France heavy favourites — Iraq a clear mismatch in class",
    divergence: "confirmed",
    divergenceNote: "Market and model agree France win by multiple goals. Iraq have the weakest defensive record in the group — France's attack should run free.",
    topSignals: [
      { label: "France win by 2+ goals", ev: "+8.2%", confidence: "high" },
      { label: "France win by 3+ goals", ev: "+11.4%", confidence: "high" },
      { label: "Iraq don't score (BTTS No)", ev: "+12.7%", confidence: "high" },
      { label: "Over 3.5 total goals", ev: "+6.5%", confidence: "medium" },
    ],
    alphaPickExact: "4-0 France",
    alphaPickNote: "Highest match score (90) of the tournament at time of read. All large handicap markets show 24-34% EV — market underestimates French margin. Iraq 0 goals confirmed by BTTS No Score 79. Mbappé motivated to break all-time WC scoring record. Model said 3-0, alpha said 4-0 — model was correct. Key calibration: when model and alpha agree on direction, use model scoreline. Alpha pick overextended the large-margin signal by 1 goal.",
  },

  {
    matchId: "GS-I-4",
    matchScore: 87,
    radarSummary: "Norway significantly undervalued — market systematically mispricing Norwegian dominance",
    divergence: "warning",
    divergenceNote: "Model sees 50/50 but alpha disagrees strongly. Norway 1X2 has +29.3% EV, Norway -1 handicap has +50.6% EV — one of the strongest result signals of the tournament. Senegal has zero positive EV markets. Market overrating Senegal, underrating Haaland's Norway.",
    topSignals: [
      { label: "Norway win (1X2)", ev: "+29.3%", confidence: "high" },
      { label: "Norway -0.75 Asian Handicap", ev: "+37.2%", confidence: "high" },
      { label: "Norway -1 Asian Handicap", ev: "+50.6%", confidence: "medium" },
      { label: "Norway 0 (draw no bet)", ev: "+22.2%", confidence: "high" },
      { label: "Correct Score 2-0 Norway", ev: "+21.6%", confidence: "medium" },
    ],
    alphaPickExact: "2-0 Norway",
    alphaPickNote: "Strongest result signal of the day. Market mispricing Norwegian superiority — all handicap markets from 0 to -1.25 show 22-50% positive EV. Senegal zero value markets. BTTS No positive EV confirms clean sheet likely. Haaland vs Senegal defense = 2-0.",
  },

  {
    matchId: "GS-J-4",
    matchDate: "2026-06-22",
    homeTeamId: "JOR",
    awayTeamId: "DZA",
    overallScore: 95,
    alphaPickExact: "3-0 Algeria",
    alphaPickNote: "Highest score read of the tournament at time of read (95). Algeria win signals overwhelming — 1X2 Score 90, AH -0.5 Score 90, AH -1 Score 83 cascading down to AH -1.5 Score 68. High-scoring signal also strong: Over 2 Score 91, Over 2.5 Score 80, Over 3 Score 62 — market massively underpriced total goals. BTTS No Score 11 — not trusted (Rule 2, below threshold). Alpha pick: 3-0 Algeria. Result: 1-2 Algeria — direction correct, both scorelines wrong. Jordan led 1-0 at HT before two Algeria set-piece corners in 69' and 82'. Total goals = 3 ✅ (Over 2 Score 91 landed). Algeria win ✅. Model pick was 2-0 Algeria — also correct direction. Key calibration: extreme high-scoring signals (Over 3 Score 62) were directionally right (3 total goals) but scoreline distribution was inverted — Jordan scored first against the run of play.",
    signalOutcome: "partial",
    signalNote: "Direction hit (Algeria win ✅). Over 2 goals hit ✅ (3 total). Exact scoreline miss — Jordan scored, Algeria only got 2 not 3. High EV goal signals correct in aggregate, wrong in distribution.",
  },

  {
    matchId: "GS-J-3",
    matchScore: 80,
    radarSummary: "Low-scoring grind — market overpricing goal volume after Messi hat-trick",
    divergence: "warning",
    divergenceNote: "Market expects Argentina to run riot after 3-0 vs Algeria; alpha strongly disagrees — all high-EV signals point to under 3 goals, BTTS No, and Austria staying competitive. Magnitude mismatch: Argentina win is not in question, the goal count is.",
    topSignals: [
      { label: "Under 3 total goals", ev: "+23%", confidence: "high" },
      { label: "Under 2.5 total goals", ev: "+28.8%", confidence: "high" },
      { label: "BTTS No (clean sheet likely)", ev: "+14.4%", confidence: "high" },
      { label: "Austria +1 handicap has value", ev: "+4.2%", confidence: "medium" },
    ],
    alphaPickExact: "1-0 Argentina",
    alphaPickNote: "Tight Argentina win zone. Market over-pricing open game after Messi hat-trick. Austria (Rangnick press) will suppress volume. 1-0 is the highest-EV correct score in the entire read.",
  },

  // ── June 23 ──────────────────────────────────────────────

  {
    matchId: "GS-K-2",
    matchDate: "2026-06-23",
    homeTeamId: "POR",
    awayTeamId: "UZB",
    overallScore: 82,
    alphaPickExact: "3-0 Portugal",
    alphaPickNote: "Portugal win signals strong: AH -0.5 Score 82, AH -0.75 Score 81, AH -1 Score 75. Multi-goal margin supported: AH -2 Score 69, AH -1.75 Score 65. BTTS No Score 72 — above Rule 2 threshold (>60), clean sheet signal trusted. Over 4.5 Score 17 and Over 2 Score 37 — both below threshold, high-scoring signals ignored. Alpha confirms Portugal win + clean sheet. Model pick was 2-0 (deflated by Portugal 0.79 xG vs DR Congo, form override 38/100). Alpha adds one goal per Rule 3 (max ±1 from model). Alpha pick: 3-0 Portugal.",
    signalOutcome: "hit",
    signalNote: "Direction correct ✅ (Portugal win). Clean sheet ✅ (BTTS No Score 72 landed). Portugal won 5-0 — both model (2-0) and alpha pick (3-0) severely underpredicted the margin. AH -2 Score 69 and AH -2.5 Score 55 were pointing at blowout territory that we capped at ±1 from model. Key calibration: when form depression is traceable to a single outlier match AND Elo gap >400 AND motivation spike exists, model underestimates — alpha cascade depth to AH -2.5+ should override Rule 3 cap. New Rule 6 established.",
  },

  {
    matchId: "GS-L-3",
    matchDate: "2026-06-23",
    homeTeamId: "ENG",
    awayTeamId: "GHA",
    overallScore: 83,
    alphaPickExact: "2-0 England",
    alphaPickNote: "Two reads taken 16 min apart — Score 82→83, structure identical. England win signals strong: AH -0.5 Score 80, AH -0.75 Score 75, AH -2 Score 64, 1X2 England Score 63, AH -1 Score 61. Cascade drops sharply after -2 (Score 53 at -2.25, 43 at -2.5) — market does not price a 3-goal margin efficiently. BTTS No Score 72 (strengthened from 68 in first read) — above Rule 2 threshold, Ghana clean sheet trusted. No high-scoring EV signals — every Over market negative EV. Alpha reads controlled England win, not a blowout. Model pick (app + chat): 3-0. Alpha pick: 2-0 England — 1 goal below model, supported by shallow cascade depth and BTTS No 72.",
  },

];

/** Get alphametrico data for a specific match. Returns undefined if not available. */
export function getAlphaData(matchId: string): AlphaMatchData | undefined {
  return alphaMatchData.find((d) => d.matchId === matchId);
}
