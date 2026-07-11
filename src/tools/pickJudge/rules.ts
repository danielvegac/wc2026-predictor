import type { PickJudgeInput, RuleCheck } from './types';

const NOISE_FLOOR = 60; // Rule 2: below this Score = noise, ignore

// ─── VETO RULES (run before tier classification) ───────────────────

/**
 * Rule 16a — Tournament form veto of Tier 3
 * Fires when: home (or strong favorite) has perfect/near-perfect tournament
 * record + multiple clean sheets, away classified fragile, knockout stage,
 * no documented rotation/demoralization.
 * Effect: Caps tier at 2. Alpha cannot redirect the winner.
 *
 * NOTE: This check only reports whether the *conditions* are met. The engine
 * only lets the veto CAP the tier when an actual Tier 3 alpha override
 * (Rule 14 / Rule 12) is present — otherwise there is nothing to veto and
 * normal evaluation continues. (Rule 16a is defined as a "veto of Tier 3".)
 */
export function checkRule16a(input: PickJudgeInput): RuleCheck {
  const { homeTournament, awayTournament, homeIsCoHost,
          homeElo, awayElo, stage, hasDocumentedRotation,
          hasDocumentedDemoralization, playingAtIconicHomeStadium } = input;

  if (stage !== 'knockout') return { ruleId: 'Rule16a', triggered: false, reason: 'Not knockout stage' };

  // Only a true 3W-0D-0L record with 2+ CS qualifies — draws disqualify (ENG-COD lesson)
  const homePerfect = homeTournament.losses === 0 && homeTournament.draws === 0 && homeTournament.wins >= 3 && homeTournament.cleanSheets >= 2;
  const awayFragile = awayTournament.losses >= 1 || (awayTournament.wins <= 1 && awayTournament.draws >= 1);
  const homeAdvantage = homeIsCoHost || playingAtIconicHomeStadium || (homeElo - awayElo) > 100;
  const noOverride = !hasDocumentedRotation && !hasDocumentedDemoralization;

  const triggered = homePerfect && awayFragile && homeAdvantage && noOverride;
  return {
    ruleId: 'Rule16a',
    triggered,
    reason: triggered
      ? `${input.homeTeam} ${homeTournament.wins}W-${homeTournament.draws}D-${homeTournament.losses}L ` +
        `(${homeTournament.cleanSheets} clean sheets, ${homeTournament.goalsConceded} conceded). ` +
        `${input.awayTeam} fragile record. ` +
        `${homeIsCoHost ? 'Co-host. ' : ''}${playingAtIconicHomeStadium ? 'Iconic home stadium. ' : ''}` +
        `No documented rotation or demoralization. Tier 3 VETOED.`
      : 'Rule 16a conditions not met'
  };
}

/**
 * Rule 16b — ENG-COD lesson (July 1, 2026): BTTS No 60-79 + genuine away threat = BTTS compression
 * When: BTTS No score is moderate (not dominant), away team's adjusted lambda > 0.45,
 * AND away scored in 2+ of 3 group matches (≥2 total goals as proxy).
 * Effect: Do NOT pick home clean sheet. Apply BTTS Tier 2 compression instead of clean sheet.
 * Overrides Rule 13's league-suppression relaxation.
 */
export function checkRule16b(input: PickJudgeInput): RuleCheck {
  const { alpha, awayTournament } = input;
  const bttsNoModerate = alpha.bttsNoScore >= 60 && alpha.bttsNoScore < 80;
  const awayLambdaThreat = (alpha.awayAdjustedLambda ?? 0) > 0.45;
  const awayScoredMultipleMatches = awayTournament.goalsScored >= 2;

  const triggered = bttsNoModerate && awayLambdaThreat && awayScoredMultipleMatches;
  return {
    ruleId: 'Rule16b',
    triggered,
    reason: triggered
      ? `BTTS No Score ${alpha.bttsNoScore} (60-79 — moderate, not dominant). ` +
        `Away λ ${(alpha.awayAdjustedLambda ?? 0).toFixed(2)} > 0.45 — genuine scoring threat. ` +
        `${input.awayTeam} scored in 2+/3 group matches (${awayTournament.goalsScored} total). ` +
        `Do NOT pick home clean sheet — apply BTTS compression.`
      : 'Rule 16b not triggered'
  };
}

/**
 * Rule 15 — Clean sheet convergence blocks Rule 11b override
 * When: model predicts clean sheet + home value markets = 0 +
 * away AH cascade on WIDE lines only (≥+1.5) + BTTS Yes only moderate (Score 60-69)
 * Effect: Rule 11b (don't assume opponent's first shutout) does NOT apply.
 * Tier 1 (model clean sheet) is confirmed.
 */
export function checkRule15(input: PickJudgeInput): RuleCheck {
  const { modelPick, alpha } = input;
  const modelPredictsCleenSheet = modelPick.away === 0 || modelPick.home === 0;
  const zeroHomeValueMarkets = alpha.homeValueMarketsFound === 0 && alpha.awayValueMarketsFound === 0;
  const awayOnlyWideCascade = alpha.awayAHBestLine >= 1.5 && alpha.awayAHBestScore < 65;
  const bttsYesOnlyModerate = alpha.bttsYesScore >= 60 && alpha.bttsYesScore <= 69;

  const triggered = modelPredictsCleenSheet && zeroHomeValueMarkets &&
                    (awayOnlyWideCascade || bttsYesOnlyModerate);
  return {
    ruleId: 'Rule15',
    triggered,
    reason: triggered
      ? `Model predicts clean sheet. Both Result markets = 0 value. ` +
        `Away cascade only on wide lines (${alpha.awayAHBestLine}+, Score ${alpha.awayAHBestScore}). ` +
        `BTTS Yes moderate (Score ${alpha.bttsYesScore}). Rule 11b overridden — clean sheet confirmed.`
      : 'Rule 15 convergence not met'
  };
}

// ─── TIER 3 TRIGGER RULES ──────────────────────────────────────────

/**
 * Rule 14 — Away AH cascade + zero home value = BTTS split (not clean sheet)
 * When: away cascade Score 85+ on 5+ consecutive lines including tight lines (≤+0.75)
 * AND home value markets found = 0
 * AND Rule 16a not triggered
 * Effect: Direction flip toward away team. Pick BTTS scoreline (e.g. 1-2),
 * NOT clean sheet (e.g. 0-1/0-2), because cascade signals away winning by margin,
 * not shutout.
 */
export function checkRule14(input: PickJudgeInput): RuleCheck {
  const { alpha } = input;
  const strongCascade = alpha.awayAHBestScore >= 83 && alpha.awayAHConsecutiveAbove80 >= 4;
  const tightLines = alpha.awayAHBestLine <= 0.75; // tight lines = market confident
  const zeroHomeValue = alpha.homeValueMarketsFound === 0;

  const triggered = strongCascade && tightLines && zeroHomeValue;
  return {
    ruleId: 'Rule14',
    triggered,
    reason: triggered
      ? `Away AH cascade: ${input.awayTeam} best Score ${alpha.awayAHBestScore} on line ` +
        `+${alpha.awayAHBestLine}, ${alpha.awayAHConsecutiveAbove80} consecutive lines Score>80. ` +
        `Tight lines signal adjusted margin. Home value markets = 0. ` +
        `Pick BTTS scoreline for away (not shutout).`
      : 'Rule 14 not triggered'
  };
}

/**
 * Rule 12 — Underdog cascade + outright match outcome = draw as primary
 * When: underdog AH cascade Score 85+ AND underdog outright win% ≥ favorite win%
 * in Match Outcome chart.
 * Effect: Draw becomes primary pick if draw% is substantial (>28%).
 * Rule 7 (margin compression only) applies when favorite still leads outright.
 */
export function checkRule12(input: PickJudgeInput): RuleCheck {
  const { alpha } = input;
  const awayDominatesOutright = alpha.alphaAwayWinPct >= alpha.alphaHomeWinPct;
  const strongCascade = alpha.awayAHBestScore >= 85;
  const drawSubstantial = alpha.alphaDrawPct >= 28;

  const triggered = awayDominatesOutright && strongCascade && drawSubstantial;
  return {
    ruleId: 'Rule12',
    triggered,
    reason: triggered
      ? `Away outright ${alpha.alphaAwayWinPct}% > Home ${alpha.alphaHomeWinPct}%. ` +
        `Cascade Score ${alpha.awayAHBestScore}. Draw ${alpha.alphaDrawPct}%. ` +
        `Draw as primary — check scoreline matrix modal cell.`
      : 'Rule 12 not triggered'
  };
}

// ─── TIER 2 COMPRESSION RULES ──────────────────────────────────────

/**
 * Rule 13 — BTTS No 60-79 without scoring suppression → prefer BTTS, not clean sheet
 * When compressing total: if BTTS No 60-79 AND scoring is not clearly suppressed,
 * do NOT pick clean sheet. Both teams score.
 *
 * Suppression is measured on BOTH the league average AND this match's projection:
 * a defensively dominant matchup (e.g. Mexico 3 clean sheets, match BTTS 28.4%)
 * IS suppressed even if the league average is high, so the clean sheet stands.
 */
export function checkRule13(input: PickJudgeInput): RuleCheck {
  const { alpha } = input;
  const bttsNoModerate = alpha.bttsNoScore >= 60 && alpha.bttsNoScore <= 79;
  const scoringNotSuppressed = alpha.leagueBttsPct >= 35 && alpha.matchProjectedBttsPct >= 35;

  const triggered = bttsNoModerate && scoringNotSuppressed;
  return {
    ruleId: 'Rule13',
    triggered,
    reason: triggered
      ? `BTTS No Score ${alpha.bttsNoScore} (60-79 range). ` +
        `League BTTS ${alpha.leagueBttsPct}%, match BTTS ${alpha.matchProjectedBttsPct}% (not suppressed). ` +
        `Prefer BTTS split over clean sheet when compressing total.`
      : 'Rule 13 not triggered'
  };
}

/**
 * Rule 26 — True Scoring History Flag
 * Reads TournamentRecord.scoredEveryMatch when explicitly set (verified from
 * matchInsights.ts per-match data). Falls back to the old aggregate proxy
 * (goalsScored / matchesPlayed >= 1) only when the flag is not provided, so
 * legacy fixtures keep working without a full re-verification pass.
 *
 * Fixes a false positive seen in R16-5 (POR-ESP): the proxy said "Portugal
 * scored in every match" (8 goals / 3 matches) but Portugal was actually held
 * scoreless 0-0 vs Colombia — the proxy can't see that because Portugal's other
 * matches (5-0 UZB) hide the zero in the aggregate.
 */
export function resolveScoredEveryMatch(record: PickJudgeInput['homeTournament']): boolean {
  if (record.scoredEveryMatch != null) return record.scoredEveryMatch;
  const matchesPlayed = record.wins + record.draws + record.losses;
  return matchesPlayed > 0 && record.goalsScored >= matchesPlayed;
}

/**
 * Rule 11b — Don't assume opponent's first shutout
 * When: team scored in every group match AND BTTS No < 80 AND league BTTS not suppressed
 * Effect: Avoid picking scoreline that requires this team's first scoreless match.
 * BLOCKED by Rule 15 when clean sheet convergence is present.
 * Scoring history now sourced via Rule 26 (resolveScoredEveryMatch) instead of
 * the raw aggregate proxy.
 */
export function checkRule11b(input: PickJudgeInput): RuleCheck {
  const { awayTournament, alpha } = input;
  const awayMatchesPlayed = awayTournament.wins + awayTournament.draws + awayTournament.losses;
  const awayScoredEveryMatch = resolveScoredEveryMatch(awayTournament);
  const bttsNoWeak = alpha.bttsNoScore < 80;
  const leagueNotSuppressed = alpha.leagueBttsPct >= 35;

  const triggered = awayScoredEveryMatch && bttsNoWeak && leagueNotSuppressed;
  return {
    ruleId: 'Rule11b',
    triggered,
    reason: triggered
      ? `${input.awayTeam} scored in all ${awayMatchesPlayed} group matches ` +
        `(${awayTournament.goalsScored} goals). BTTS No Score ${alpha.bttsNoScore} (<80). ` +
        `League BTTS ${alpha.leagueBttsPct}% (not suppressed). ` +
        `Avoid clean sheet against this team unless Rule 15 overrides.`
      : 'Rule 11b not triggered'
  };
}

/**
 * Rule 9 — CS 0-0 as primary pick
 * When: CS 0-0 EV >40% AND BTTS No Score >60
 * Effect: 0-0 becomes valid primary pick — evaluate against model EV directly.
 */
export function checkRule9(input: PickJudgeInput): RuleCheck {
  const { alpha } = input;
  const triggered = alpha.cs00Score > 40 && alpha.bttsNoScore > 60;
  return {
    ruleId: 'Rule9',
    triggered,
    reason: triggered
      ? `CS 0-0 Score ${alpha.cs00Score} (>40) + BTTS No Score ${alpha.bttsNoScore}. ` +
        `0-0 is a valid primary pick — evaluate directly.`
      : 'Rule 9 not triggered'
  };
}

/**
 * Rule 7 — Margin compression only when favorite still leads outright
 * When: underdog AH cascade fires BUT home win% in Match Outcome still clearly ahead.
 * Effect: Compress margin by 1 goal, don't flip direction.
 */
export function checkRule7(input: PickJudgeInput): RuleCheck {
  const { alpha } = input;
  const favoriteClearlyAhead = alpha.alphaHomeWinPct > alpha.alphaAwayWinPct + 10;
  const awayCascadePresent = alpha.awayAHBestScore >= 70;

  const triggered = favoriteClearlyAhead && awayCascadePresent;
  return {
    ruleId: 'Rule7',
    triggered,
    reason: triggered
      ? `Home win ${alpha.alphaHomeWinPct}% clearly ahead of away ${alpha.alphaAwayWinPct}%. ` +
        `Away cascade Score ${alpha.awayAHBestScore} present. ` +
        `Margin compression only — don't flip direction.`
      : 'Rule 7 not triggered'
  };
}

/**
 * Rule 17 — USA-BIH lesson: clean sheet override when away team's goal distribution
 * peaks at zero AND home win probability is dominant AND away adjusted lambda is low.
 * Fires BEFORE the BTTS evaluation step, overriding league BTTS context (Rule 13).
 * Conditions: awayAdjustedLambda ≤ 0.45 + awayPeakAtZeroPct ≥ 35% + homeWinPct ≥ 55%.
 * Effect: Tier 2 compressed margin output as clean sheet (away goals forced to 0).
 * Does NOT override Rule 12 (draw primary) or Rule 14 (Tier 3 direction flip).
 */
export function checkRule17(input: PickJudgeInput): RuleCheck {
  const { alpha } = input;
  const awayLambdaLow = (alpha.awayAdjustedLambda ?? 1.0) <= 0.45;
  const awayGoalDistPeaksAtZero = (alpha.goalDistribution?.awayPeakAtZeroPct ?? 0) >= 35;
  const homeWinDominant = alpha.alphaHomeWinPct >= 55.0;

  const triggered = awayLambdaLow && awayGoalDistPeaksAtZero && homeWinDominant;
  return {
    ruleId: 'Rule17',
    triggered,
    reason: triggered
      ? `Away λ ${(alpha.awayAdjustedLambda ?? 0).toFixed(2)} ≤ 0.45. ` +
        `Away goal dist 0-peak ${alpha.goalDistribution?.awayPeakAtZeroPct}% ≥ 35%. ` +
        `Home win% ${alpha.alphaHomeWinPct}% ≥ 55%. ` +
        `Clean sheet override — BTTS league context invalid.`
      : 'Rule 17 not triggered'
  };
}

/**
 * Rule 20 — λ Cap Override (Paraguay-France lesson, July 4 2026)
 * When: either team's adjusted lambda hits or approaches the engine cap (≥3.5),
 * indicating structural inflation rather than real predictive power, AND the
 * alpha Under cascade is strong (Score ≥80 on Under 3 or lower).
 * Effect: Fires BEFORE tier logic. Compresses the model pick so the winning
 * team's goals are capped at 2 (e.g. 0-3 → 0-2, 0-4 → 0-2). Subsequent Tier 2
 * compression can still apply on top (e.g. 0-2 → 0-1 if Under signal is active).
 */
export function checkRule20(input: PickJudgeInput): RuleCheck {
  const { alpha, modelPick } = input;
  const lambdaCapHit =
    (alpha.homeAdjustedLambda ?? 0) >= 3.5 ||
    (alpha.awayAdjustedLambda ?? 0) >= 3.5;
  const underSignalStrong = alpha.underTopScore >= 80;
  const pickHasHighTotal = modelPick.home + modelPick.away >= 3;

  const triggered = lambdaCapHit && underSignalStrong && pickHasHighTotal;

  const capSide =
    (alpha.awayAdjustedLambda ?? 0) >= 3.5
      ? `awayλ=${(alpha.awayAdjustedLambda ?? 0).toFixed(2)}`
      : `homeλ=${(alpha.homeAdjustedLambda ?? 0).toFixed(2)}`;

  return {
    ruleId: 'Rule20',
    triggered,
    reason: triggered
      ? `[Rule 20] λ cap detected (${capSide} >= 3.5) + Under Score=${alpha.underTopScore} >= 80 → compressed total to ≤2`
      : 'Rule 20 not triggered',
  };
}

/**
 * Rule 23 — Lambda Disagreement Flag
 * When: |model total lambda - alpha implied total lambda| / model total lambda > 50%
 * Effect: Treat alpha's implied total as a compression ceiling. When triggered,
 * the model's raw scoreline matrix should NOT be trusted for margin — defer to
 * alpha's implied direction + margin instead.
 * Validated retrospectively on 4 R16 matches (PAR-FRA, POR-ESP, ARG-EGY, SUI-COL,
 * WC2026): in all 4 cases with divergence >50%, alpha's scoreline was closer to
 * the actual result than the model's own matrix. See src/data/signalAccuracy.ts.
 */
export function checkRule23(input: PickJudgeInput): RuleCheck {
  const modelTotal = (input.homeLambda ?? 0) + (input.awayLambda ?? 0);
  const alphaTotal = (input.alpha.alphaImpliedHomeLambda ?? 0) + (input.alpha.alphaImpliedAwayLambda ?? 0);

  if (modelTotal === 0 || input.alpha.alphaImpliedHomeLambda == null) {
    return { ruleId: 'Rule23', triggered: false, reason: 'Alpha implied lambda not available' };
  }

  const divergencePct = Math.abs(modelTotal - alphaTotal) / modelTotal * 100;
  const triggered = divergencePct > 50;

  return {
    ruleId: 'Rule23',
    triggered,
    reason: triggered
      ? `Model total lambda ${modelTotal.toFixed(2)} vs alpha implied total ${alphaTotal.toFixed(2)} ` +
        `— divergence ${divergencePct.toFixed(0)}% (>50%). Treat alpha-implied total as compression ceiling. ` +
        `Do not trust model matrix margin — defer to alpha direction + margin.`
      : `Divergence ${divergencePct.toFixed(0)}% — within normal range`
  };
}

/**
 * Rule 28 — Established Scoring Pattern Floor
 * When: the home team has scored the exact same goal total in 2+ PRIOR
 * tournament matches (not counting the current fixture) — an established
 * pattern, not noise.
 * Effect: Relaxes Rule 20's compression ceiling. The compressed total cannot
 * be pushed below homeGoalPatternValue, even when Under Score >= 80 would
 * otherwise force further compression.
 * Lesson (R16-7 ARG-EGY, July 7 2026): Argentina scored exactly 3 goals in
 * 3 prior tournament matches (3-0 ALG, 0-3 JOR, 3-2 CPV AET) before Rule 20
 * compressed the model's 3-0 anchor down to 2-0. Actual result was 3-2.
 */
export function checkRule28(input: PickJudgeInput): RuleCheck {
  const matches = input.homeGoalPatternMatches ?? 0;
  const value = input.homeGoalPatternValue ?? 0;
  const triggered = matches >= 2 && value > 0;

  return {
    ruleId: 'Rule28',
    triggered,
    reason: triggered
      ? `${input.homeTeam} scored exactly ${value} goals in ${matches} prior tournament matches ` +
        `— established pattern. Compression floor set at ${value}, overriding Rule 20's cap.`
      : 'Rule 28 not triggered'
  };
}

/**
 * Rule 29 — Symmetric Underdog BTTS Floor
 * Mirror of Rule 11b/13, protecting against the FAVORITE's clean-sheet pick:
 * if BTTS No Score is 60-79 (moderate, not dominant) AND the away team's
 * verified scoring history (Rule 26) shows they scored in every match, the
 * engine cannot output 0 goals for the away team — even if Rule 20/18 would
 * otherwise compress toward a home clean sheet.
 * Lesson (R16-7 ARG-EGY): bttsNoScore=78, Egypt scored in every match through
 * R16-7 → Rule 29 should have forced Egypt's goal output to >=1. Actual: 3-2.
 */
export function checkRule29(input: PickJudgeInput): RuleCheck {
  const { alpha, awayTournament } = input;
  const bttsNoModerate = alpha.bttsNoScore >= 60 && alpha.bttsNoScore <= 79;
  const awayScoredEveryMatch = resolveScoredEveryMatch(awayTournament);

  const triggered = bttsNoModerate && awayScoredEveryMatch;
  return {
    ruleId: 'Rule29',
    triggered,
    reason: triggered
      ? `BTTS No Score ${alpha.bttsNoScore} (60-79 — moderate, not dominant). ` +
        `${input.awayTeam} scored in every tournament match. ` +
        `Away goal output floored at 1 — home clean sheet not permitted.`
      : 'Rule 29 not triggered'
  };
}

/**
 * Rule 30 — ESP-BEL lesson (Favorite Lambda Floor)
 * When Rule 7 fires (favorite clearly ahead outright + underdog cascade is
 * margin-only, not a shutout threat) AND the favorite's own model lambda is
 * already high (>=1.7) AND the favorite's form multiplier is at/near the cap
 * (>=1.40), a merely MODERATE Under signal (NOISE_FLOOR to just under 80)
 * should not compress the favorite's own expected goal output below what its
 * own lambda implies. Only a STRONG Under signal (>=80) is trusted enough to
 * override this floor and allow full compression toward a low-scoring total.
 */
export function checkRule30(input: PickJudgeInput): RuleCheck {
  const rule7 = checkRule7(input);
  const homeIsFavorite = input.alpha.alphaHomeWinPct >= input.alpha.alphaAwayWinPct;
  const favoriteLambda = homeIsFavorite ? input.homeLambda : input.awayLambda;
  const favoriteForm = homeIsFavorite ? input.homeFormMultiplier : input.awayFormMultiplier;
  const underModerate = input.alpha.underTopScore >= NOISE_FLOOR && input.alpha.underTopScore < 80;

  const triggered =
    rule7.triggered &&
    (favoriteLambda ?? 0) >= 1.7 &&
    favoriteForm >= 1.40 &&
    underModerate;

  return {
    ruleId: 'Rule30',
    triggered,
    reason: triggered
      ? `Rule 7 active + favorite lambda=${favoriteLambda} >=1.7 + form x${favoriteForm} at/near cap + ` +
        `Under Score=${input.alpha.underTopScore} only moderate (60-79, not >=80 strong). ` +
        `Lambda floor override: favorite goals = round(lambda), underdog = favorite-1.`
      : 'Rule 30 not triggered'
  };
}

// Exported for engine noise-floor checks (Rule 2).
export { NOISE_FLOOR };
