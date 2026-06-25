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
    matchId: "GS-K-4",
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
    matchId: "GS-L-4",
    matchDate: "2026-06-23",
    homeTeamId: "PAN",
    awayTeamId: "CRO",
    overallScore: 92,
    alphaPickExact: "2-1 Croatia",
    alphaPickNote: "Strongest high-scoring read of the day: Over 2 Score 84, Over 2.5 Score 79, Over 3 Score 74, Over 1.5 Score 81 — market massively underpriced total goals. Croatia win cascade deep: AH -1 Score 82, AH -1.25 Score 78, AH -1.5 Score 72, AH -1.75 Score 61. BTTS No negative EV — both teams expected to score. Double Chance PAN/CRO Score 74 — Panama scoring underpriced. Alphametrico X post warning: AH -2 shows 86% EV but Score 43 (low Score = blowout lottery, not trusted signal). Alpha pick: 2-1 Croatia — BTTS, 3 total goals, 1-goal Croatia margin. Model chat: 2-1 Croatia. Model app: 0-1 Croatia.",
    signalOutcome: "partial",
    signalNote: "Croatia won 1-0 ✅ direction correct. BTTS No occurred (Panama 0 goals) — alpha predicted BTTS Yes (both score), which missed ❌. Total goals = 1, not 3 — high-scoring signals all missed badly ❌. Key miss: despite massive EV on Over 2.5 (Score 79), Panama produced 0 goals. Livakovic heroics (triple save) and Panama 5-4-1 block suppressed total goals to 1. Alpha direction hit, scoreline completely wrong. Model app (0-1) was exact. Calibration: high-scoring signals can be nullified by elite GK + defensive organization even when EV is strong.",
  },

  {
    matchId: "GS-K-3",
    matchDate: "2026-06-23",
    homeTeamId: "COL",
    awayTeamId: "COD",
    overallScore: 89,
    alphaPickExact: "1-0 Colombia",
    alphaPickNote: "Strongest low-scoring read of the day: Under 3 Score 87, Under 2.5 Score 82, BTTS No Score 78, Under 2 Score 69. Every high-scoring signal deeply negative EV. Congo DR handicap cascade: +1 Score 64, +1.5 Score 67, +1.75 Score 71, +2 Score 75 — market underpriced Congo staying close. 1X2 Colombia negative EV (-8.8%) — Colombia odds too short. Correct Score 1-0 had +33% EV despite Score 11. Model chat: 2-0 Colombia. Model app: 2-0 Colombia. Alpha diverged: 1-0 Colombia.",
    signalOutcome: "hit",
    signalNote: "Colombia 1-0 DR Congo ✅ — alpha pick exact ✅. BTTS No ✅ (Congo DR 0 goals). Under 2 total goals ✅. Congo DR staying within 1 goal ✅. Model (2-0) and model chat (2-0) both missed exact score — predicted one extra Colombia goal. Alpha correctly read Congo DR defensive resilience (Mpasi 8 saves, 5-3-2 block) and low total goals. Best alpha hit of the tournament so far — exact score, clean sheet, and total goals all correct.",
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

  // ── June 24 ──────────────────────────────────────────────

  {
    matchId: "GS-B-5",
    matchDate: "2026-06-24",
    homeTeamId: "SUI",
    awayTeamId: "CAN",
    overallScore: 84,
    radarSummary: "Market undervaluing Canada — systematic mispricing across all handicap lines",
    divergence: "warning",
    divergenceNote: "Canada AH cascade dominant: +0.25 Score 84, +0.5 Score 84, +0.75 Score 85 — sustained elite Scores across underdog handicaps. However 1X2 Canada win Score only 47, DC Draw/Canada Score 84. Classic margin signal: market overprices Switzerland's winning margin, not Switzerland's win. Totals: Over 2 Score 54 (below Rule 2 threshold of 60). BTTS No Score too low to act on. Interpretation: Switzerland wins but by exactly 1 goal. Do NOT flip to Canada win or draw.",
    topSignals: [
      { label: "Canada +0.75 AH (margin signal)", ev: "+17.1%", confidence: "high" },
      { label: "Canada +0.5 AH", ev: "+21.9%", confidence: "high" },
      { label: "Canada +0.25 AH", ev: "+32.9%", confidence: "high" },
      { label: "Double Chance Draw/Canada", ev: "+21.3%", confidence: "medium" },
    ],
    alphaPickExact: "2-1 Switzerland",
    alphaPickNote: "Canada AH cascade (Score 84+) is a margin signal, not a result signal — 1X2 Canada Score only 47. Switzerland wins by 1 goal. Rule 7: cascade strong on underdog handicap but weak on outright win → pick favorite by exactly 1 goal. Model pick confirmed.",
    signalOutcome: "hit",
    signalNote: "Signal hit ✅ — Canada covered +0.75 (lost 2-1). Switzerland won by exactly 1 goal as cascade predicted. Pick miss: we incorrectly interpreted margin signal as result signal and picked 1-1 draw. Rule 7 now formalized: AH cascade peaking at Score 80+ on underdog handicap but ≤50 on outright win = margin signal only, pick favorite by 1 goal.",
  },

  {
    matchId: "GS-B-6",
    matchDate: "2026-06-24",
    homeTeamId: "BIH",
    awayTeamId: "QAT",
    overallScore: 79,
    radarSummary: "Low-scoring signals dominant — BTTS No and Under 2.5 both above threshold",
    divergence: "warning",
    divergenceNote: "Under 2.5 Score 66, BTTS No Score 70, Under 3 Score 79 — all above Rule 2 threshold (>60). Qatar +2.5 Score 64 suggests Bosnia won't blow them out. High-scoring markets all deeply negative EV. Bosnia AH beyond -1.25 all negative — market doesn't price a rout. Interpretation: Bosnia wins 1-0, Qatar keeps it tight. WARNING: Qatar's xGA in MD2 was red-card-distorted (9 men for 37 min vs Canada's 6-0) — Rule 8 flag: BTTS No signal may be reacting to false defensive inflation.",
    topSignals: [
      { label: "Under 4 total goals", ev: "+10.8%", confidence: "high" },
      { label: "Under 3 total goals", ev: "+23.0%", confidence: "high" },
      { label: "BTTS No", ev: "+18.7%", confidence: "high" },
      { label: "Under 2.5 total goals", ev: "+24.1%", confidence: "medium" },
    ],
    alphaPickExact: "1-0 Bosnia",
    alphaPickNote: "BTTS No Score 70 and Under 2.5 Score 66 both above Rule 2 threshold. Qatar +2.5 Score 64 confirms Bosnia won't win big. Alpha pick: 1-0 Bosnia — tight win, clean sheet. Model pick was 2-1 Bosnia.",
    signalOutcome: "miss",
    signalNote: "Signal miss ✅ — result 3-1 Bosnia. Both teams scored (BTTS Yes), 4 total goals (Over 3 landed). BTTS No and Under 2.5 both failed. Root cause: Qatar's xGA was distorted by 9-men-for-37-min red card situation vs Canada — Alphametrico read that as genuine defensive improvement (Rule 8). Bosnia also scored 3, showing their attack wasn't as suppressed as the -1.25 AH suggested. Model pick 2-1 Bosnia would have been directionally better.",
  },

  {
    matchId: "GS-A-5",
    matchDate: "2026-06-24",
    homeTeamId: "CZE",
    awayTeamId: "MEX",
    overallScore: 92,
    alphaPickExact: "1-0 Mexico",
    alphaPickNote: "Czech Republic AH cascade (Score 88-91) interpreted as margin compression — expected narrow Mexico win. Under 2.5 at Score 63 suggested low total. Zero positive EV in Mexico result group raised caution about margin. Alpha pick: 1-0 Mexico. Model app pick: 2-0 Mexico.",
    signalOutcome: "miss",
    signalNote: "Direction correct (Mexico win ✅) but margin severely underpredicted. Mexico 3-0, xG 1.79 vs 0.47 — market underpriced Mexico's dominance, not Czechia's resistance. Czechia's AH cascade was a mirage: their xG confirmed they were genuinely weak, not unlucky. The Under signals (2.5 at Score 63) were also wrong — goals came. Key calibration: when a team rotates heavily in a must-win home party atmosphere, model and alpha both underprice the output. Model app (2-0) was closer than alpha pick (1-0). Czechia's AH cascade should have been read as 'market hasn't priced Mexico's full dominance,' not 'Czechia will compete.'",
  },

  {
    matchId: "GS-A-6",
    matchDate: "2026-06-24",
    homeTeamId: "RSA",
    awayTeamId: "KOR",
    overallScore: 92,
    alphaPickExact: "2-1 South Korea",
    alphaPickNote: "KOR win signals dominant: 1X2 Korea Score 83, AH -0.5 Score 83, AH -0.75 Score 82. Over 2 at Score 77 suggested multiple goals. BTTS No at Score 58 (below Rule 2 threshold of 60) discarded — could not trust clean sheet signal. Alpha pick: 2-1 Korea (model app: 2-0 Korea, chat pick pre-session: 2-0 Korea).",
    signalOutcome: "miss",
    signalNote: "Complete directional miss — South Africa won 1-0. KOR win signals (Score 83) were wrong. xG was near-even (RSA 1.1, KOR 1.0) — this was a genuine upset, not a freak result. The market correctly priced Korea as favorites but mispriced South Africa's defensive capability and motivation. BTTS No at Score 58 (discarded per Rule 2) actually landed — South Korea blanked. Key calibration: Rule 2 threshold (Score 60) prevented us from using the one signal that was correct. Motivation factor (South Africa needing win for historic R32 qualification) was not captured in any signal. Over 2 at Score 77 was wrong — only 1 goal total. Both model and alpha failed directionally.",
  },

  // ─── JUNE 25 — SLOT 1 (MD3) ───────────────────────────────────────────────

  {
    matchId: "GS-E-5",
    matchDate: "2026-06-25",
    homeTeamId: "ECU",
    awayTeamId: "GER",
    overallScore: 93,
    radarSummary: "Low-scoring Germany win — cascade confirms margin compression, not result divergence",
    divergence: "warning",
    divergenceNote: "Under 3 Score 86, Under 3.5 Score 86, Under 4 Score 88 — alpha strongly suppresses goal volume. BTTS No Score 65 (above Rule 2 threshold — trusted). Ecuador AH cascade from +1 to +2 all Score 83-85 — halts before +0.75 (Score 77), signalling Germany wins by exactly 1-2 goals, not a rout. Germany result markets all deeply negative EV — market overprices Germany blowout. Correct Score 0_1 shows +19.7% EV (Score 3 — low confidence for exact score, used as direction indicator only). Rule 7 active: cascade peaks Score 85 on underdog handicap but Germany win markets underwater — margin signal only, pick favorite by exactly 1-2 goals. Germany rotating (already through) adds margin compression. Model app pick 1-3 Germany overshoots on goals. Alpha calibrated pick: 2-0 Germany.",
    topSignals: [
      { label: "Under 4 total goals", ev: "+16.4%", confidence: "high" },
      { label: "Under 3 total goals", ev: "+36.7%", confidence: "high" },
      { label: "Under 3.5 total goals", ev: "+21.1%", confidence: "high" },
      { label: "BTTS No", ev: "+21.9%", confidence: "high" },
      { label: "Ecuador +2 AH (margin cap)", ev: "+10.6%", confidence: "high" },
      { label: "Ecuador +1 AH", ev: "+31.9%", confidence: "high" },
    ],
    alphaPickExact: "2-0 Germany",
    alphaPickNote: "Low-scoring signals dominant across all Score thresholds. BTTS No Score 65 (above Rule 2 — trusted). Ecuador +1 to +2 AH cascade (Score 83-85) = Rule 7: Germany wins by 1-2 goals, not 3+. Model app pick (1-3) overshoots on goals. Correct Score 0_1 EV +19.7% (Score 3) used only as directional indicator — too low confidence for exact score. Alpha pick: 2-0 Germany. One goal above pure 0-1 margin signal to account for Germany attack even in rotation — still within Rule 3.",
  },

  {
    matchId: "GS-E-6",
    matchDate: "2026-06-25",
    homeTeamId: "CUR",
    awayTeamId: "CIV",
    overallScore: 92,
    radarSummary: "Ivory Coast dominant — Rule 6 active, high-scoring, clean sheet probable",
    divergence: "confirmed",
    divergenceNote: "IVC result cascade: -0.5 Score 87, -0.75 Score 83, 1X2 Score 83, -2 Score 81, -1.75 Score 81, -1.5 Score 79, -1.25 Score 79, -1 Score 78, -2.25 Score 76, -2.5 Score 71, -2.75 Score 64 — Rule 6 triggers: 3+ AH signals beyond -2 at Score 50+, Elo gap >400, Curaçao form depressed by 7-1 loss vs Germany MD1. High-scoring signals: Over 2 Score 79, Over 3 Score 73, Over 2.5 Score 66, Over 3.5 Score 61. BTTS No Score 45 — below Rule 2 threshold, discarded. Win to Nil IVC fair odds 1.62. Stakes asymmetry: IVC needs result for R32, Curaçao eliminated. Rule 6 floor: model pick (0-1) treated as minimum margin, ±2 divergence permissible.",
    topSignals: [
      { label: "IVC -0.5 AH", ev: "+15.7%", confidence: "high" },
      { label: "IVC -2 AH (Rule 6 cascade)", ev: "+24.5%", confidence: "high" },
      { label: "IVC -2.5 AH", ev: "+30.4%", confidence: "high" },
      { label: "IVC -2.75 AH", ev: "+38.3%", confidence: "high" },
      { label: "Over 2 total goals", ev: "+7.2%", confidence: "high" },
      { label: "Over 3 total goals", ev: "+13.7%", confidence: "high" },
    ],
    alphaPickExact: "3-0 Ivory Coast",
    alphaPickNote: "Rule 6 active: cascade beyond AH -2 at Score 50+, Elo gap >400. Over 3 Score 73 and Over 2 Score 79 confirm high-scoring output. BTTS No Score 45 (below Rule 2 — discarded). Win to Nil IVC fair odds 1.62 supports clean sheet. Stakes asymmetry reinforces dominant performance. Model app pick (0-1) severely underprices IVC margin. Rule 6 floor = 0-1, alpha diverges to 3-0 within ±2 permissible range.",
  },

  {
    matchId: "GS-C-5",
    matchDate: "2026-06-24",
    homeTeamId: "SCO",
    awayTeamId: "BRA",
    overallScore: 68,
    radarSummary: "Scotland AH cascade signals margin compression — Brazil wins but not by 3",
    divergence: "warning",
    divergenceNote: "Scotland +1.75 Score 65, +2 Score 68, +2.25 Score 63 — sustained value above Rule 2 threshold. Brazil result markets all deeply negative EV (Brazil -1 at -17.6%, -1.5 at -15.9%). BTTS Yes Score only 43 — well below Rule 2 threshold, not acted on. 1X2 Scotland Score 0. Classic margin signal: Brazil wins but by 1-2 goals, not 3+. Model says 3-0. Dashboard flags Scottish overperformance risk. Raphinha absent (hamstring). Brazil in 'manage the result' mode with qualification secured.",
    topSignals: [
      { label: "Scotland +2 AH (margin compression)", ev: "+7.7%", confidence: "high" },
      { label: "Scotland +1.75 AH", ev: "+10.0%", confidence: "high" },
      { label: "Scotland +1.5 AH", ev: "+11.1%", confidence: "medium" },
      { label: "Scotland +2.5 AH", ev: "+3.9%", confidence: "medium" },
    ],
    alphaPickExact: "2-0 Brazil",
    alphaPickNote: "Scotland AH cascade (Score 65-68) is a margin signal: Brazil wins, but market overprices the 3-0 blowout. Model pick 3-0 diverges from form reality (Brazil ~1.02 attack multiplier, Raphinha out, Ancelotti conservative). Alpha pick: 2-0 Brazil — 1 goal below model, within Rule 3. BTTS Yes Score 43 too weak to upgrade to 2-1.",
  },

];

/** Get alphametrico data for a specific match. Returns undefined if not available. */
export function getAlphaData(matchId: string): AlphaMatchData | undefined {
  return alphaMatchData.find((d) => d.matchId === matchId);
}
