// ============================================================
// Pick Judge Audit — SANDBOX rule patches (retrospective, R32-QF)
// ============================================================
// CRITICAL: This file is a SANDBOX. It contains isolated, modified copies
// of rule logic for the sole purpose of retrospectively testing candidate
// patches against historical miss fixtures. It is NEVER imported by
// src/tools/pickJudge/rules.ts, engine.ts, or cli.ts, and none of the
// functions here affect the live prediction path. Only src/data/
// pickJudgeAudit.ts imports from this file, to compute patchVerifiedResult
// values for the audit dashboard.
//
// Every function below is a standalone reproduction of specific rule
// conditions (copied, not referenced, from rules.ts as it existed at
// audit time) plus the minimal scaffolding needed to turn a fixture's
// PickJudgeInput + known historical "before" pick into a candidate
// "after" scoreline. Nothing here modifies rules.ts or cli.ts.

import type { PickJudgeInput } from '../types';

const NOISE_FLOOR = 60;

export interface SandboxPatchResult {
  patchedPick: { home: number; away: number };
  rationale: string;
}

// ── QF-2 (ESP-BEL): Rule 30 — Favorite Lambda Floor ─────────────────
// Rule 30 already exists in production rules.ts (added after this exact
// lesson) but esp_bel is not covered by historicalFixtures.test.ts, so
// there is no test-verified "post-fix" pick for it. This reproduces
// Rule 30's isolated logic here and applies it to esp_bel's own fixture
// data to check whether the fix (already shipped for future matches)
// would also have recovered this historical miss.
function checkRule7Sandbox(input: PickJudgeInput): boolean {
  const favoriteClearlyAhead = input.alpha.alphaHomeWinPct > input.alpha.alphaAwayWinPct + 10;
  const awayCascadePresent = input.alpha.awayAHBestScore >= 70;
  return favoriteClearlyAhead && awayCascadePresent;
}

function checkRule30Sandbox(input: PickJudgeInput): boolean {
  const rule7 = checkRule7Sandbox(input);
  const homeIsFavorite = input.alpha.alphaHomeWinPct >= input.alpha.alphaAwayWinPct;
  const favoriteLambda = homeIsFavorite ? input.homeLambda : input.awayLambda;
  const favoriteForm = homeIsFavorite ? input.homeFormMultiplier : input.awayFormMultiplier;
  const underModerate = input.alpha.underTopScore >= NOISE_FLOOR && input.alpha.underTopScore < 80;

  return rule7 && (favoriteLambda ?? 0) >= 1.7 && favoriteForm >= 1.40 && underModerate;
}

export function applyRule30Patch(input: PickJudgeInput): SandboxPatchResult {
  const triggered = checkRule30Sandbox(input);
  if (!triggered) {
    return {
      patchedPick: { home: 0, away: 0 },
      rationale: 'Rule 30 conditions not met on this fixture — no patch applies.',
    };
  }

  const homeIsFavorite = input.alpha.alphaHomeWinPct >= input.alpha.alphaAwayWinPct;
  const favoriteLambda = (homeIsFavorite ? input.homeLambda : input.awayLambda) ?? 0;
  const favoriteGoals = Math.round(favoriteLambda);
  const underdogGoals = Math.max(0, favoriteGoals - 1);

  const patchedPick = homeIsFavorite
    ? { home: favoriteGoals, away: underdogGoals }
    : { home: underdogGoals, away: favoriteGoals };

  return {
    patchedPick,
    rationale:
      `Rule 30 (Favorite Lambda Floor) fires: Rule 7 active + favorite λ=${favoriteLambda.toFixed(2)} ` +
      `>= 1.7 + favorite form at/near cap + Under Score=${input.alpha.underTopScore} only moderate ` +
      `(60-79). Floors the favorite's goals at round(λ)=${favoriteGoals} instead of letting Tier 2's ` +
      `moderate-Under compression suppress it toward the original 1-0 pick; underdog set to favorite-1.`,
  };
}

// ── R16-7 (ARG-EGY): Rule 28 + Rule 29 combo — partial, NOT exact ───
// Both rules already exist in production rules.ts, born from this exact
// match's lesson. Reproduced here to check how far they get the historical
// miss (2-0 ARG) toward the actual result (3-2). Documented as a NON-exact
// candidate — see auditNote in pickJudgeAudit.ts. Left in the sandbox for
// transparency about what was tried, not presented as a validated patch.
export function applyRule2829Combo(input: PickJudgeInput): SandboxPatchResult {
  const rule28Triggered = (input.homeGoalPatternMatches ?? 0) >= 2 && (input.homeGoalPatternValue ?? 0) > 0;
  const rule29Triggered =
    input.alpha.bttsNoScore >= 60 &&
    input.alpha.bttsNoScore <= 79 &&
    (input.awayTournament.scoredEveryMatch === true);

  // Rule 28: floor home goals at homeGoalPatternValue (relaxes Rule 20's cap of 2).
  const homeGoals = rule28Triggered ? (input.homeGoalPatternValue ?? input.modelPick.home) : input.modelPick.home;
  // Rule 29: floor away goals at >=1 (does not project the exact away total).
  const awayGoals = rule29Triggered ? Math.max(1, 0) : 0;

  return {
    patchedPick: { home: homeGoals, away: awayGoals },
    rationale:
      `Rule 28 (established scoring pattern, already in production) floors ${input.homeTeam} at ` +
      `${homeGoals} goals (${input.homeGoalPatternMatches} prior matches at this value), overriding ` +
      `Rule 20's compression to 2. Rule 29 (symmetric underdog BTTS floor, already in production) ` +
      `floors ${input.awayTeam} at >=1 goal (BTTS No Score=${input.alpha.bttsNoScore}, scored every ` +
      `match). Combined candidate: ${homeGoals}-${awayGoals}. This recovers the correct winner and ` +
      `total-goals ballpark but NOT the exact 3-2 — Rule 29's floor is deliberately a minimum of 1, ` +
      `not a projection of exactly 2, and no existing signal in this fixture justifies projecting a ` +
      `second Egypt goal specifically.`,
  };
}

// ── R16-1 (CAN-MAR): corrected-lambda Tier 2 compression — partial, NOT exact ─
// The historical fixture originally used a stale Morocco lambda (0.96); the
// current can_mar fixture in historicalFixtures.ts already carries the
// corrected value (awayAdjustedLambda: 2.26). This checks whether re-running
// just the standard Tier 2 compression step (not a new rule — the existing
// compressTier2 direction/floor logic, reproduced here) on the CORRECTED
// lambda would have flipped the original 0-0 draw pick toward Morocco.
export function applyCorrectedLambdaCompression(input: PickJudgeInput): SandboxPatchResult {
  const awayLambda = input.alpha.awayAdjustedLambda ?? 0;
  const homeLambda = input.alpha.homeAdjustedLambda ?? 0;
  const directionIsAway = awayLambda > homeLambda;

  if (!directionIsAway) {
    return {
      patchedPick: { home: 0, away: 0 },
      rationale: 'Corrected lambda does not favor the away team on this fixture — no direction change.',
    };
  }

  // Standard compressTier2 pattern used elsewhere in the engine: away>home, home=0 -> {0,1}.
  const patchedPick = { home: 0, away: 1 };

  return {
    patchedPick,
    rationale:
      `With the corrected Morocco λ (0.96 → 2.26, already reflected in the current can_mar fixture ` +
      `data) driving the direction check instead of the stale value used at pick time, standard ` +
      `Tier 2 compression flips the draw to ${patchedPick.home}-${patchedPick.away} Morocco. This ` +
      `recovers the correct WINNER but not the exact 0-3 scoreline — Morocco's 3rd goal was an ` +
      `explicitly-documented high-conversion outlier (3 goals from 0.85 xG, matchInsights.ts), not a ` +
      `projectable signal any compression rule is designed to anticipate.`,
  };
}
