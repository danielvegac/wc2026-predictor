import type { PickJudgeInput } from '../types';

/**
 * R32-05: Ivory Coast vs Norway
 * Alpha read #2 (final read before kickoff) — this is the one that flipped:
 * Norway AH cascade Score 70-83, zero CIV value markets,
 * initial model pick was 1-1, chat incorrectly recommended 0-1 (shutout).
 * Daniel picked 1-2 Norway — EXACT. Rule 14 explains why 1-2 > 0-1.
 *
 * Alpha read used for this fixture: the FINAL read showing Norway cascade.
 * Norway AH 0 Score=83, +0.25 Score=82, DC Draw/Norway Score=80,
 * +0.5 Score=79, +0.75 Score=79, -0.25 Score=77, 1X2 Norway Score=70
 * Result Norway: 7 lines Score>70, tight lines (0, +0.25, +0.5)
 * Result CIV: zero value markets (48 evaluated)
 * BTTS No: Score=61 (just above noise floor)
 * Actual result: 1-2 Norway ✓
 */
export const civ_nor: PickJudgeInput = {
  matchId: 'R32-05',
  homeTeam: 'Ivory Coast',
  awayTeam: 'Norway',
  stage: 'knockout',

  modelPick: { home: 1, away: 1 }, // model was 1-1 draw
  homeElo: 1660,
  awayElo: 1720,

  homeTournament: { wins: 1, draws: 1, losses: 1, cleanSheets: 0, goalsConceded: 3, goalsScored: 3 },
  awayTournament: { wins: 2, draws: 0, losses: 1, cleanSheets: 1, goalsConceded: 5, goalsScored: 7 },
  homeFormMultiplier: 0.97,
  awayFormMultiplier: 1.12,

  homeIsCoHost: false,
  awayIsCoHost: false,
  playingAtIconicHomeStadium: false,
  hasDocumentedRotation: false,
  hasDocumentedDemoralization: false,

  alpha: {
    underTopScore: 34,           // Under 3 Score=34 — BELOW noise floor (irrelevant)
    bttsNoScore: 61,             // Score=61 — barely above floor, weak signal

    bttsYesScore: 0,
    overTopScore: 0,

    // CIV AH cascade — INITIAL read only (first read showed CIV edge)
    // In FINAL read (the one we use), CIV cascade disappeared
    homeAHBestScore: 0,          // Final read: zero value for CIV Result
    homeAHBestLine: 0,
    homeAHConsecutiveAbove80: 0,

    // Norway AH cascade — FINAL read (this is what drove the pick)
    awayAHBestScore: 83,         // Norway AH 0 Score=83 (tightest line, most confident)
    awayAHBestLine: 0.0,         // AH 0 = Norway wins outright (tight line)
    awayAHConsecutiveAbove80: 5, // 0, +0.25, DC Draw/NOR, +0.5, +0.75 all Score 79-83

    homeWinScore: 0,
    awayWinScore: 70,            // 1X2 Norway Score=70
    homeValueMarketsFound: 0,    // ZERO value for CIV Result (48 evaluated)
    awayValueMarketsFound: 9,    // Norway Result: 7+ lines with value

    cs00Score: 1,
    csHomeCleanSheetScore: 1,    // CS 1_0 Score=1, CS 2_0 Score=0 — negligible
    csAwayCleanSheetScore: 2,    // CS 0_1 Score=2, CS 0_2 Score=2 — very low
    csHighScoringHomeScore: 0,

    alphaHomeWinPct: 34.6,       // league context match projection
    alphaDrawPct: 29.2,
    alphaAwayWinPct: 36.2,

    leagueBttsPct: 44.4,
    matchProjectedBttsPct: 49.9,
    leagueOver25Pct: 47.0,
    matchProjectedOver25Pct: 43.4,
    projectedGoalsPerMatch: 2.41,

    climateNetFactor: 1.0,
  },

  fieldTopPick: { home: 1, away: 0 },
  fieldTopPickPct: 0.32,
};
// Expected: 1-2 Norway (Tier 3, Rule 14)
// Actual: 1-2 Norway ✓


/**
 * R32-06: France vs Sweden
 * Model pick: 3-0 France
 * Chat incorrectly picked 3-1 (applied Rule 11b — "Sweden scored in all group matches").
 * Rule 15 should have blocked Rule 11b:
 *   - Both Result markets = zero value (Result France: only CS 3_2 Score=0, CS 4_2 Score=0)
 *   - Sweden AH cascade WIDE (best: +2 Score=55, +1.5 Score=53) — not tight lines
 *   - BTTS Yes Score=65 — moderate only (not 80+)
 * High scoring signals (Over 2 Score=75, BTTS Yes Score=65) should NOT
 * override clean sheet when Rule 15 convergence fires.
 * Actual result: 3-0 France ✓
 */
export const fra_swe: PickJudgeInput = {
  matchId: 'R32-06',
  homeTeam: 'France',
  awayTeam: 'Sweden',
  stage: 'knockout',

  modelPick: { home: 3, away: 0 }, // model predicted 3-0 France
  homeElo: 2010,
  awayElo: 1710,

  homeTournament: { wins: 3, draws: 0, losses: 0, cleanSheets: 2, goalsConceded: 1, goalsScored: 10 },
  awayTournament: { wins: 2, draws: 0, losses: 1, cleanSheets: 1, goalsConceded: 3, goalsScored: 5 },
  homeFormMultiplier: 1.30,
  awayFormMultiplier: 1.05,

  homeIsCoHost: false,
  awayIsCoHost: false,
  playingAtIconicHomeStadium: false,
  hasDocumentedRotation: false,
  hasDocumentedDemoralization: false,

  alpha: {
    underTopScore: 0,            // No Low Scoring value markets found at all
    bttsNoScore: 0,              // No BTTS No signal

    bttsYesScore: 65,            // MODERATE — Score=65 (60-69 range)
    overTopScore: 75,            // Over 2 Score=75

    // France Result — only 2 CS markets found, both Score=0
    homeAHBestScore: 0,
    homeAHBestLine: 0,
    homeAHConsecutiveAbove80: 0,

    // Sweden AH — WIDE lines only, low scores
    awayAHBestScore: 55,         // Best: Sweden +2 Score=55 — well below 80
    awayAHBestLine: 2.0,         // Wide line (+2) = not confident
    awayAHConsecutiveAbove80: 0, // ZERO consecutive lines Score>80

    homeWinScore: 0,             // Result France: CS 3_2 Score=0, CS 4_2 Score=0
    awayWinScore: 2,             // 1X2 Sweden Score=2 — essentially zero
    homeValueMarketsFound: 0,    // ZERO meaningful value for France Result
    awayValueMarketsFound: 0,    // ZERO meaningful value for Sweden Result

    cs00Score: 0,
    csHomeCleanSheetScore: 0,    // No clean sheet CS signal
    csAwayCleanSheetScore: 0,
    csHighScoringHomeScore: 0,   // CS 3_2 Score=0 — essentially noise

    alphaHomeWinPct: 67.8,       // France dominant in Match Outcome
    alphaDrawPct: 17.7,
    alphaAwayWinPct: 14.5,

    leagueBttsPct: 44.4,
    matchProjectedBttsPct: 63.7, // High projected BTTS (league context)
    leagueOver25Pct: 47.0,
    matchProjectedOver25Pct: 72.2,
    projectedGoalsPerMatch: 3.74, // High-scoring projection

    // Climate: very hot (33°C) favors France ×1.41, low humidity favors Sweden ×1.63
    // Net: roughly balanced, slight Sweden climate edge
    climateNetFactor: 0.94,      // france ×0.942 net factor from dashboard
  },

  fieldTopPick: { home: 3, away: 1 },
  fieldTopPickPct: 0.26,
};
// Expected: 3-0 France (Tier 1, Rule 15 confirms clean sheet, blocks Rule 11b)
// Actual: 3-0 France ✓


/**
 * R32-07: Mexico vs Ecuador
 * Model pick: 2-1 Mexico
 * Chat incorrectly picked 0-1 Ecuador (Tier 3 override based on Ecuador AH cascade).
 * Rule 16a should have VETOED Tier 3:
 *   - Mexico: co-host, 3W-0L, 3 clean sheets, 0 goals conceded in tournament
 *   - Ecuador: fragile (1W-1D-1L), classified 3rd, coach resigned after
 *   - Iconic stadium (Estadio Azteca, unbeaten in all WC matches ever)
 *   - No documented rotation or demoralization for Mexico
 * Even though Ecuador AH cascade was Score 86-91 across 6 lines,
 * Rule 16a caps at Tier 2 — compress model 2-1 → 2-0.
 * Actual result: 2-0 Mexico ✓
 */
export const mex_ecu: PickJudgeInput = {
  matchId: 'R32-07',
  homeTeam: 'Mexico',
  awayTeam: 'Ecuador',
  stage: 'knockout',

  modelPick: { home: 2, away: 1 }, // model predicted 2-1 Mexico
  homeElo: 1810,
  awayElo: 1730,

  homeTournament: { wins: 3, draws: 0, losses: 0, cleanSheets: 3, goalsConceded: 0, goalsScored: 6 },
  awayTournament: { wins: 1, draws: 1, losses: 1, cleanSheets: 1, goalsConceded: 2, goalsScored: 3 },
  homeFormMultiplier: 1.35,
  awayFormMultiplier: 0.92,

  homeIsCoHost: true,              // MEXICO IS CO-HOST
  awayIsCoHost: false,
  playingAtIconicHomeStadium: true, // ESTADIO AZTECA — unbeaten in all WC matches
  hasDocumentedRotation: false,
  hasDocumentedDemoralization: false,

  alpha: {
    underTopScore: 82,           // Under 3 Score=82 — strong
    bttsNoScore: 79,             // Score=79 — strong but below 80

    bttsYesScore: 0,
    overTopScore: 0,

    homeAHBestScore: 0,
    homeAHBestLine: 0,
    homeAHConsecutiveAbove80: 0,

    // Ecuador AH cascade — very strong, tight lines
    awayAHBestScore: 91,         // Handicap Ecuador +1 Score=91
    awayAHBestLine: 0.5,         // Tight lines (0/+0.25/+0.5 all Score 79-91)
    awayAHConsecutiveAbove80: 6, // 6 consecutive lines Score 86-91

    homeWinScore: 0,             // ZERO value markets for Mexico Result (45 evaluated)
    awayWinScore: 28,            // 1X2 Ecuador Score=28
    homeValueMarketsFound: 0,    // ZERO for Mexico
    awayValueMarketsFound: 8,    // Ecuador AH markets

    cs00Score: 9,                // Very low — below Rule 9 threshold
    csHomeCleanSheetScore: 0,
    csAwayCleanSheetScore: 4,    // CS 0_1 Score=4 — very low
    csHighScoringHomeScore: 0,

    alphaHomeWinPct: 18.4,       // INVERTED — Mexico only 18.4%
    alphaDrawPct: 35.0,
    alphaAwayWinPct: 46.5,       // Ecuador projected to win per alpha

    leagueBttsPct: 44.4,
    matchProjectedBttsPct: 28.4, // Low projected BTTS
    leagueOver25Pct: 47.0,
    matchProjectedOver25Pct: 21.8,
    projectedGoalsPerMatch: 1.60,

    // Climate: altitude 2245m favors Ecuador ×1.95 (very significant)
    // But Mexico plays here always — co-host effect overrides climate per Rule 16a
    climateNetFactor: 0.71,      // Mexico factor 0.707 vs Ecuador 1.414
  },

  fieldTopPick: { home: 2, away: 1 },
  fieldTopPickPct: 0.31,
};
// Expected: 2-0 Mexico (Tier 2, Rule 16a VETO of Tier 3)
// Rule 16a fires: co-host + perfect record + 3 CS + Ecuador fragile + iconic stadium
// Compression: 2-1 → 2-0 (reduce away goals, floor at 0)
// MUST NOT output Ecuador win in any form
// Actual: 2-0 Mexico ✓
