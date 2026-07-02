import type { PickJudgeInput, PickJudgeOutput, RuleCheck } from './types';
import {
  checkRule16a, checkRule16b, checkRule15,
  checkRule14, checkRule12,
  checkRule13, checkRule11b, checkRule9, checkRule7,
  checkRule17,
  NOISE_FLOOR
} from './rules';

/**
 * Compress model pick total by exactly 1 goal.
 * Reduces the winning team's margin by 1 (floor 0).
 * If draw predicted, reduces total by 1 (e.g. 1-1 → 0-0 or 1-0).
 */
function compressTier2(modelPick: { home: number; away: number }): { home: number; away: number } {
  const { home, away } = modelPick;
  if (home > away) {
    // Home winning — remove 1 goal from total, keeping home win direction
    // e.g. 2-1 → 2-0 (reduce away), or 3-0 → 2-0 (reduce home)
    if (away > 0) return { home, away: away - 1 };
    else return { home: home - 1, away: 0 };
  } else if (away > home) {
    // Away winning
    if (home > 0) return { home: home - 1, away };
    else return { home: 0, away: away - 1 };
  } else {
    // Draw predicted — reduce total by 1 (e.g. 1-1 → 0-0)
    return { home: Math.max(0, home - 1), away: Math.max(0, away - 1) };
  }
}

export function judgePickInput(input: PickJudgeInput): PickJudgeOutput {
  const reasoning: string[] = [];
  const rulesTriggered: string[] = [];

  // ── STEP 1: Run all rule checks ──────────────────────────────────
  const rule16a = checkRule16a(input);
  const rule16b = checkRule16b(input);
  const rule15 = checkRule15(input);
  const rule14 = checkRule14(input);
  const rule12 = checkRule12(input);
  const rule13 = checkRule13(input);
  const rule11b = checkRule11b(input);
  const rule9 = checkRule9(input);
  const rule7 = checkRule7(input);
  const rule17 = checkRule17(input);

  const allChecks: RuleCheck[] = [rule16a, rule16b, rule15, rule14, rule12, rule13, rule11b, rule9, rule7, rule17];
  allChecks.filter(r => r.triggered).forEach(r => rulesTriggered.push(r.ruleId));

  reasoning.push(`STEP 1 — Model anchor: ${input.homeTeam} ${input.modelPick.home}-${input.modelPick.away} ${input.awayTeam}`);
  reasoning.push(`Elo: ${input.homeTeam} ${input.homeElo} vs ${input.awayTeam} ${input.awayElo} (diff: ${input.homeElo - input.awayElo > 0 ? '+' : ''}${input.homeElo - input.awayElo})`);
  reasoning.push(`Form: ${input.homeTeam} ×${input.homeFormMultiplier} | ${input.awayTeam} ×${input.awayFormMultiplier}`);

  // A Tier 3 alpha override = Rule 14 (direction flip) or Rule 12 (draw primary).
  const tier3TriggerPresent = rule14.triggered || rule12.triggered;

  // ── STEP 2: VETO CHECK — Rule 16a only CAPS when there is a Tier 3 to veto ──
  if (rule16a.triggered && tier3TriggerPresent) {
    reasoning.push(`STEP 2 — Rule 16a VETO TRIGGERED: ${rule16a.reason}`);
    reasoning.push(`→ Tier 3 blocked. Maximum tier = 2 (margin compression only).`);

    const tierWouldHaveBeen: 3 = 3; // Rule 14 / Rule 12 would have pushed to Tier 3

    // Apply Tier 2 compression
    let tier2pick = compressTier2(input.modelPick);

    // Rule 16b takes priority over Rule 13: genuine away threat → BTTS compression
    if (rule16b.triggered) {
      if (tier2pick.away === 0) {
        tier2pick = { home: tier2pick.home, away: 1 };
        reasoning.push(`Rule 16b fired: BTTS No 60-79 + away λ > 0.45 + away scored 2+/3 → BTTS compression → ${tier2pick.home}-${tier2pick.away}`);
      }
    } else if (rule13.triggered) {
      // Apply Rule 13: if compressing lands on clean sheet but BTTS No < 80 AND
      // scoring is not suppressed, prefer BTTS split.
      const compressed = tier2pick;
      if (compressed.home === 0 || compressed.away === 0) {
        if (input.alpha.bttsNoScore < 80) {
          const total = compressed.home + compressed.away;
          if (total >= 2) {
            tier2pick = { home: Math.ceil(total / 2), away: Math.floor(total / 2) };
            // Ensure direction matches model
            if (input.modelPick.home >= input.modelPick.away && tier2pick.home < tier2pick.away) {
              tier2pick = { home: tier2pick.away, away: tier2pick.home };
            }
          }
          reasoning.push(`Rule 13: BTTS No Score ${input.alpha.bttsNoScore} < 80 — prefer BTTS split over clean sheet → ${tier2pick.home}-${tier2pick.away}`);
        }
      }
    }

    reasoning.push(`STEP 3 — Tier 2 compression: ${input.modelPick.home}-${input.modelPick.away} → ${tier2pick.home}-${tier2pick.away}`);
    reasoning.push(`FINAL PICK: ${input.homeTeam} ${tier2pick.home}-${tier2pick.away} ${input.awayTeam} [Tier 2]`);

    return {
      finalPick: tier2pick,
      tier: 2,
      tierWouldHaveBeen,
      vetoedBy: 'Rule16a',
      rulesTriggered,
      reasoning,
      confidence: 'HIGH'
    };
  }

  if (rule16a.triggered) {
    reasoning.push(`STEP 2 — Rule 16a conditions met but no Tier 3 alpha override present — veto is moot. Continuing to alpha evaluation.`);
  } else {
    reasoning.push(`STEP 2 — Rule 16a: Not triggered. Proceeding to alpha evaluation.`);
  }

  // ── STEP 3: Check if alpha qualifies for Tier 2 or Tier 3 ────────
  const underSignalValid = input.alpha.underTopScore >= NOISE_FLOOR;
  const bttsNoSignalValid = input.alpha.bttsNoScore >= NOISE_FLOOR;
  const tier2Conditions = underSignalValid || bttsNoSignalValid;

  reasoning.push(`STEP 3 — Alpha signals: Under Score=${input.alpha.underTopScore} (valid: ${underSignalValid}), BTTS No Score=${input.alpha.bttsNoScore} (valid: ${bttsNoSignalValid})`);
  reasoning.push(`Away cascade: Score=${input.alpha.awayAHBestScore}, line=+${input.alpha.awayAHBestLine}, consecutive>80: ${input.alpha.awayAHConsecutiveAbove80}`);
  reasoning.push(`Match Outcome: Home ${input.alpha.alphaHomeWinPct}% / Draw ${input.alpha.alphaDrawPct}% / Away ${input.alpha.alphaAwayWinPct}%`);

  // ── STEP 4: Check Tier 3 triggers ────────────────────────────────
  if (rule14.triggered) {
    reasoning.push(`STEP 4 — Rule 14 TRIGGERED (Tier 3): ${rule14.reason}`);

    // Cascade signals away winning by ~1 goal, both teams score (BTTS per Rule 14).
    // Canonical Rule 14 output: away wins by a 1-goal BTTS margin.
    const tier3pick = { home: 1, away: 2 };

    reasoning.push(`Rule 14 pick: ${input.homeTeam} ${tier3pick.home}-${tier3pick.away} ${input.awayTeam} (BTTS, away wins by 1)`);
    reasoning.push(`STEP 5 — FINAL PICK: ${input.homeTeam} ${tier3pick.home}-${tier3pick.away} ${input.awayTeam} [Tier 3, Rule 14]`);

    return {
      finalPick: tier3pick,
      tier: 3,
      rulesTriggered,
      reasoning,
      confidence: 'HIGH'
    };
  }

  // ── STEP 5: Check Rule 15 (clean sheet convergence blocks Rule 11b) ──
  if (rule15.triggered) {
    reasoning.push(`STEP 4 — Rule 15 TRIGGERED: ${rule15.reason}`);
    reasoning.push(`Rule 11b is BLOCKED by Rule 15. Model clean sheet confirmed.`);

    const highScoringSignal = input.alpha.bttsYesScore >= 60 || input.alpha.overTopScore >= 60;
    const finalPick = { ...input.modelPick };

    if (highScoringSignal && input.alpha.projectedGoalsPerMatch > 3.0) {
      // High-scoring projection means the model's clean-sheet-with-high-total anchor
      // (e.g. 3-0) is correct — do NOT compress it down.
      reasoning.push(`High scoring signal (Over Score=${input.alpha.overTopScore}, projected ${input.alpha.projectedGoalsPerMatch} goals/match). Model pick maintained.`);
    }

    reasoning.push(`FINAL PICK: ${input.homeTeam} ${finalPick.home}-${finalPick.away} ${input.awayTeam} [Tier 1, Rule 15 confirmed clean sheet]`);
    return {
      finalPick,
      tier: 1,
      rulesTriggered,
      reasoning,
      confidence: 'HIGH'
    };
  }

  // ── STEP 5b: Rule 17 — clean sheet override (fires before BTTS evaluation) ──
  // Conditions: away λ ≤ 0.45 + goal dist 0-peak ≥ 35% + home win% ≥ 55%
  // Takes priority over Rule 13 (BTTS context). Does NOT override Rule 12 / Rule 14.
  if (rule17.triggered) {
    let tier2pick = compressTier2(input.modelPick);
    tier2pick = { home: tier2pick.home, away: 0 };
    reasoning.push(`STEP 5b — Rule 17 fired: away λ ≤0.45 + goal dist 0-peak ≥35% + home win% ≥55% → clean sheet override, BTTS league context invalid`);
    reasoning.push(`Tier 2 compression: ${input.modelPick.home}-${input.modelPick.away} → ${tier2pick.home}-${tier2pick.away} (clean sheet forced)`);
    reasoning.push(`FINAL PICK: ${input.homeTeam} ${tier2pick.home}-${tier2pick.away} ${input.awayTeam} [Tier 2]`);
    return {
      finalPick: tier2pick,
      tier: 2,
      rulesTriggered,
      reasoning,
      confidence: 'MEDIUM'
    };
  }

  // ── STEP 6: Tier 2 compression (no Tier 3, signals say fewer goals) ──
  if (tier2Conditions) {
    reasoning.push(`STEP 4 — Tier 2: Under/BTTS No signals valid. Compressing model pick total by 1 goal.`);
    let tier2pick = compressTier2(input.modelPick);

    // Rule 16b takes priority over Rule 13: genuine away threat → BTTS compression
    if (rule16b.triggered) {
      if (tier2pick.away === 0) {
        tier2pick = { home: tier2pick.home, away: 1 };
        reasoning.push(`Rule 16b fired: BTTS No 60-79 + away λ > 0.45 + away scored 2+/3 → BTTS compression → ${tier2pick.home}-${tier2pick.away}`);
      }
    } else if (rule13.triggered) {
      const compressed = tier2pick;
      if (compressed.home === 0 || compressed.away === 0) {
        if (input.alpha.bttsNoScore < 80) {
          const total = compressed.home + compressed.away;
          if (total >= 2) {
            const bttsVersion = {
              home: Math.ceil(total / 2),
              away: Math.floor(total / 2)
            };
            if (input.modelPick.home >= input.modelPick.away && bttsVersion.home < bttsVersion.away) {
              tier2pick = { home: bttsVersion.away, away: bttsVersion.home };
            } else {
              tier2pick = bttsVersion;
            }
          }
          reasoning.push(`Rule 13: Prefer BTTS split → ${tier2pick.home}-${tier2pick.away}`);
        }
      }
    }

    reasoning.push(`FINAL PICK: ${input.homeTeam} ${tier2pick.home}-${tier2pick.away} ${input.awayTeam} [Tier 2]`);
    return {
      finalPick: tier2pick,
      tier: 2,
      rulesTriggered,
      reasoning,
      confidence: 'MEDIUM'
    };
  }

  // ── STEP 7: Tier 1 — follow the model ────────────────────────────
  reasoning.push(`STEP 4 — No qualifying alpha signals. Tier 1: follow model pick.`);
  reasoning.push(`FINAL PICK: ${input.homeTeam} ${input.modelPick.home}-${input.modelPick.away} ${input.awayTeam} [Tier 1]`);
  return {
    finalPick: { ...input.modelPick },
    tier: 1,
    rulesTriggered,
    reasoning,
    confidence: 'HIGH'
  };
}
