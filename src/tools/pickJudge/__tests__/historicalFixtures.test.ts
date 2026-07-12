import { describe, it, expect } from 'vitest';
import { judgePickInput } from '../engine';
import { civ_nor, fra_swe, mex_ecu, eng_cod, bel_sen, esp_aut, por_cro, sui_alg, par_fra, arg_sui } from './historicalFixtures';
import type { PickJudgeInput } from '../types';

describe('Pick Judge — Historical Fixtures (R32 2026)', () => {

  describe('R32-05: Ivory Coast vs Norway', () => {
    it('outputs 1-2 Norway (Tier 3, Rule 14)', () => {
      const result = judgePickInput(civ_nor);
      expect(result.finalPick).toEqual({ home: 1, away: 2 });
      expect(result.tier).toBe(3);
      expect(result.rulesTriggered).toContain('Rule14');
    });

    it('does NOT output a CIV win or draw', () => {
      const result = judgePickInput(civ_nor);
      expect(result.finalPick.away).toBeGreaterThan(result.finalPick.home);
    });
  });

  describe('R32-06: France vs Sweden', () => {
    it('outputs 3-0 France (Tier 1, Rule 15 blocks Rule 11b)', () => {
      const result = judgePickInput(fra_swe);
      expect(result.finalPick).toEqual({ home: 3, away: 0 });
      expect(result.tier).toBe(1);
    });

    it('triggers Rule 15 (clean sheet convergence confirmed)', () => {
      const result = judgePickInput(fra_swe);
      expect(result.rulesTriggered).toContain('Rule15');
    });

    it('does NOT output a scoreline with Sweden scoring', () => {
      const result = judgePickInput(fra_swe);
      expect(result.finalPick.away).toBe(0); // Sweden scores 0
    });

    it('does NOT flip to away win or draw', () => {
      const result = judgePickInput(fra_swe);
      expect(result.finalPick.home).toBeGreaterThan(result.finalPick.away);
    });
  });

  describe('R32-07: Mexico vs Ecuador (THE KEY TEST)', () => {
    it('outputs 2-0 Mexico — NOT 0-1 Ecuador (Rule 16a veto)', () => {
      const result = judgePickInput(mex_ecu);
      expect(result.finalPick).toEqual({ home: 2, away: 0 });
    });

    it('tier is 2 (Rule 16a caps at Tier 2)', () => {
      const result = judgePickInput(mex_ecu);
      expect(result.tier).toBe(2);
    });

    it('Rule 16a fires and blocks Tier 3', () => {
      const result = judgePickInput(mex_ecu);
      expect(result.rulesTriggered).toContain('Rule16a');
      expect(result.vetoedBy).toBe('Rule16a');
      expect(result.tierWouldHaveBeen).toBe(3);
    });

    it('NEVER outputs Ecuador winning', () => {
      const result = judgePickInput(mex_ecu);
      expect(result.finalPick.away).toBeLessThan(result.finalPick.home);
    });

    it('reasoning chain mentions Rule 16a veto explicitly', () => {
      const result = judgePickInput(mex_ecu);
      const text = result.reasoning.join(' ');
      expect(text).toContain('Rule 16a');
      expect(text.toLowerCase()).toContain('veto');
    });
  });

  describe('R32-08: England vs Congo DR (Rule 16b lesson)', () => {
    it('R32-08 ENG-COD: Rule 16b fires → 2-1 England (not 2-0)', () => {
      const result = judgePickInput(eng_cod);
      expect(result.finalPick).toEqual({ home: 2, away: 1 });
      expect(result.tier).toBe(2);
      expect(result.rulesTriggered).toContain('Rule16b');
    });

    it('outputs 2-1 England — NOT 2-0 (Rule 16b BTTS compression)', () => {
      const result = judgePickInput(eng_cod);
      expect(result.finalPick).toEqual({ home: 2, away: 1 });
    });

    it('tier is 2 (Tier 2 compression)', () => {
      const result = judgePickInput(eng_cod);
      expect(result.tier).toBe(2);
    });

    it('Rule 16b fires (BTTS No 74 + awayλ 0.47 + COD scored 2/3)', () => {
      const result = judgePickInput(eng_cod);
      expect(result.rulesTriggered).toContain('Rule16b');
    });

    it('Rule 16a does NOT veto (England 2W-1D-0L is not a perfect record)', () => {
      const result = judgePickInput(eng_cod);
      // Rule 16a may trigger but veto is moot (no Tier 3 to block)
      // What matters: NOT vetoed by Rule 16a
      expect(result.vetoedBy).not.toBe('Rule16a');
    });

    it('NEVER outputs Congo DR winning', () => {
      const result = judgePickInput(eng_cod);
      expect(result.finalPick.home).toBeGreaterThan(result.finalPick.away);
    });
  });

  describe('R32-09: Belgium vs Senegal (Rule 12 + Rule 11b)', () => {
    it('R32-09 BEL-SEN: Rule 12 + Rule 11b → 1-1 Draw (Tier 1)', () => {
      const result = judgePickInput(bel_sen);
      expect(result.finalPick).toEqual({ home: 1, away: 1 });
      expect(result.tier).toBe(1);
      expect(result.rulesTriggered).toContain('Rule12');
      expect(result.rulesTriggered).toContain('Rule11b');
    });

    it('outputs 1-1 Draw — Tier 1 (model confirmed, no compression signal)', () => {
      const result = judgePickInput(bel_sen);
      expect(result.finalPick).toEqual({ home: 1, away: 1 });
      expect(result.tier).toBe(1);
    });

    it('Rule 12 fires (Senegal outright ahead + cascade 86 + draw% 28%)', () => {
      const result = judgePickInput(bel_sen);
      expect(result.rulesTriggered).toContain('Rule12');
    });

    it('Rule 11b fires (Senegal scored in all 3 group matches)', () => {
      const result = judgePickInput(bel_sen);
      expect(result.rulesTriggered).toContain('Rule11b');
    });

    it('Rule 14 does NOT fire (best cascade line +1.00 is not tight ≤ 0.75)', () => {
      const result = judgePickInput(bel_sen);
      expect(result.rulesTriggered).not.toContain('Rule14');
    });

    it('Rule 16a does NOT fire (Belgium has draws — not a perfect 3W-0D-0L record)', () => {
      const result = judgePickInput(bel_sen);
      expect(result.rulesTriggered).not.toContain('Rule16a');
    });

    it('NEVER outputs a Belgium clean sheet (Rule 11b: Senegal scored every group match)', () => {
      const result = judgePickInput(bel_sen);
      expect(result.finalPick.away).toBeGreaterThan(0);
    });
  });

  describe('R32-11: Spain vs Austria (Tier 1 — no qualifying alpha signals)', () => {
    it('R32-11 ESP-AUT: 3-0 Spain (Tier 1, model confirmed)', () => {
      const result = judgePickInput(esp_aut);
      expect(result.finalPick).toEqual({ home: 3, away: 0 });
      expect(result.tier).toBe(1);
    });

    it('Rule 14 does NOT fire (cascade 70 < 83, wide line +2.0 not tight)', () => {
      const result = judgePickInput(esp_aut);
      expect(result.rulesTriggered).not.toContain('Rule14');
    });

    it('Rule 17 does NOT fire (away λ=0.75 > 0.45)', () => {
      const result = judgePickInput(esp_aut);
      expect(result.rulesTriggered).not.toContain('Rule17');
    });

    it('Rule 16a does NOT fire (Spain 2W-1D-0L — draws=1, not perfect)', () => {
      const result = judgePickInput(esp_aut);
      expect(result.rulesTriggered).not.toContain('Rule16a');
    });

    it('Rule 15 does NOT fire (awayValueMarketsFound=1 — not zero)', () => {
      const result = judgePickInput(esp_aut);
      expect(result.rulesTriggered).not.toContain('Rule15');
    });

    it('NEVER outputs Austria winning', () => {
      const result = judgePickInput(esp_aut);
      expect(result.finalPick.home).toBeGreaterThan(result.finalPick.away);
    });
  });

  describe('R32-12: Portugal vs Croatia (Rule 11b blocks Under subthreshold compression)', () => {
    it('R32-12 POR-CRO: 2-1 Portugal (Tier 1, Rule 11b blocks Under compression)', () => {
      const result = judgePickInput(por_cro);
      expect(result.finalPick).toEqual({ home: 2, away: 1 });
      expect(result.tier).toBe(1);
    });

    it('Rule 11b fires (CRO scored in all 3 group matches)', () => {
      const result = judgePickInput(por_cro);
      expect(result.rulesTriggered).toContain('Rule11b');
    });

    it('Rule 14 does NOT fire (cascade 66 < 83, wide line +1.0)', () => {
      const result = judgePickInput(por_cro);
      expect(result.rulesTriggered).not.toContain('Rule14');
    });

    it('NEVER outputs Croatia winning', () => {
      const result = judgePickInput(por_cro);
      expect(result.finalPick.home).toBeGreaterThan(result.finalPick.away);
    });

    it('NEVER outputs a Croatia clean sheet (Rule 11b)', () => {
      const result = judgePickInput(por_cro);
      expect(result.finalPick.away).toBeGreaterThan(0);
    });
  });

  describe('R32-13: Switzerland vs Algeria (Rule 18 Form Anchor blocks alpha override)', () => {
    it('R32-13 SUI-ALG: 2-0 Switzerland (Tier 1, Rule 18 form anchor)', () => {
      const result = judgePickInput(sui_alg);
      expect(result.finalPick).toEqual({ home: 2, away: 0 });
      expect(result.tier).toBe(1);
    });

    it('Rule 18 fires (homeλ=1.80 ≥ 1.0 + awayλ=0.80 < 1.0 + SUI win% 62% > 55%)', () => {
      const result = judgePickInput(sui_alg);
      expect(result.rulesTriggered).toContain('Rule18');
    });

    it('Rule 14 does NOT fire (cascade 79 < 83 threshold)', () => {
      const result = judgePickInput(sui_alg);
      expect(result.rulesTriggered).not.toContain('Rule14');
    });

    it('NEVER outputs Algeria winning', () => {
      const result = judgePickInput(sui_alg);
      expect(result.finalPick.home).toBeGreaterThan(result.finalPick.away);
    });
  });

  describe('Rule 20 — λ Cap Override', () => {
    // Synthetic test: expectedHomeGoals=0.57, expectedAwayGoals=3.8, underScore=84, bttsNoScore=45, modelPick {0,3}
    const rule20TestInput: PickJudgeInput = {
      matchId: 'Rule20-test',
      homeTeam: 'Home',
      awayTeam: 'Away',
      stage: 'knockout',
      modelPick: { home: 0, away: 3 },
      homeElo: 1620,
      awayElo: 2015,
      homeTournament: { wins: 0, draws: 0, losses: 1, cleanSheets: 0, goalsScored: 0, goalsConceded: 3 },
      awayTournament: { wins: 1, draws: 0, losses: 0, cleanSheets: 1, goalsScored: 1, goalsConceded: 0 },
      homeFormMultiplier: 0.65,
      awayFormMultiplier: 1.40,
      homeIsCoHost: false,
      awayIsCoHost: false,
      playingAtIconicHomeStadium: false,
      hasDocumentedRotation: false,
      hasDocumentedDemoralization: false,
      alpha: {
        underTopScore: 84,
        bttsNoScore: 45,
        bttsYesScore: 0,
        overTopScore: 0,
        homeAHBestScore: 0,
        homeAHBestLine: 0,
        homeAHConsecutiveAbove80: 0,
        awayAHBestScore: 0,
        awayAHBestLine: 0,
        awayAHConsecutiveAbove80: 0,
        homeWinScore: 0,
        awayWinScore: 0,
        homeValueMarketsFound: 0,
        awayValueMarketsFound: 0,
        cs00Score: 0,
        csHomeCleanSheetScore: 0,
        csAwayCleanSheetScore: 0,
        csHighScoringHomeScore: 0,
        alphaHomeWinPct: 5.0,
        alphaDrawPct: 15.0,
        alphaAwayWinPct: 80.0,
        leagueBttsPct: 45.0,
        matchProjectedBttsPct: 25.0,
        leagueOver25Pct: 47.0,
        matchProjectedOver25Pct: 90.0,
        projectedGoalsPerMatch: 4.37,
        climateNetFactor: 1.0,
        homeAdjustedLambda: 0.57,
        awayAdjustedLambda: 3.8,
      },
    };

    it('Rule 20 fires when awayλ=3.8 ≥ 3.5 AND underScore=84 ≥ 80 AND modelPick total=3', () => {
      const result = judgePickInput(rule20TestInput);
      expect(result.rulesTriggered).toContain('Rule20');
    });

    it('pick compressed to total ≤ 2 after Rule 20 + Tier 2', () => {
      const result = judgePickInput(rule20TestInput);
      expect(result.finalPick.home + result.finalPick.away).toBeLessThanOrEqual(2);
    });

    it('away team still wins after compression', () => {
      const result = judgePickInput(rule20TestInput);
      expect(result.finalPick.away).toBeGreaterThan(result.finalPick.home);
    });

    it('Rule 20 fires and pick compressed to {0,2} before Tier 2 further compresses to {0,1}', () => {
      const result = judgePickInput(rule20TestInput);
      // Rule 20 fires → workingPick {0,2}; Tier 2 (under=84) further compresses → {0,1}
      expect(result.finalPick).toEqual({ home: 0, away: 1 });
      expect(result.tier).toBe(2);
    });

    it('R16-2 PAR-FRA: Rule 20 fires and final pick is 0-1 France (matches actual result)', () => {
      const result = judgePickInput(par_fra);
      expect(result.rulesTriggered).toContain('Rule20');
      expect(result.finalPick).toEqual({ home: 0, away: 1 });
      expect(result.tier).toBe(2);
    });

    it('Rule 20 does NOT fire when awayλ=2.26 < 3.5 (CAN-MAR post-fix)', () => {
      // Use par_fra as template but with λ below cap
      const belowCapInput: PickJudgeInput = {
        ...rule20TestInput,
        alpha: { ...rule20TestInput.alpha, awayAdjustedLambda: 2.26, homeAdjustedLambda: 0.73 },
      };
      const result = judgePickInput(belowCapInput);
      expect(result.rulesTriggered).not.toContain('Rule20');
    });
  });

  describe('Cross-fixture: tier distribution', () => {
    it('CIV-NOR is Tier 3 (alpha override)', () => {
      expect(judgePickInput(civ_nor).tier).toBe(3);
    });
    it('FRA-SWE is Tier 1 (model confirmed)', () => {
      expect(judgePickInput(fra_swe).tier).toBe(1);
    });
    it('MEX-ECU is Tier 2 (Rule 16a compressed)', () => {
      expect(judgePickInput(mex_ecu).tier).toBe(2);
    });
    it('ENG-COD is Tier 2 (Rule 16b BTTS compressed)', () => {
      expect(judgePickInput(eng_cod).tier).toBe(2);
    });
    it('BEL-SEN is Tier 1 (Rule 12 draw confirmed, no compression)', () => {
      expect(judgePickInput(bel_sen).tier).toBe(1);
    });
    it('ESP-AUT is Tier 1 (model confirmed, no qualifying alpha signals)', () => {
      expect(judgePickInput(esp_aut).tier).toBe(1);
    });
    it('POR-CRO is Tier 1 (Rule 11b blocks Under subthreshold compression)', () => {
      expect(judgePickInput(por_cro).tier).toBe(1);
    });
    it('SUI-ALG is Tier 1 (Rule 18 form anchor confirmed)', () => {
      expect(judgePickInput(sui_alg).tier).toBe(1);
    });
  });

  describe('Rule 31 — Underdog Resilience Floor (QF-4 ARG-SUI)', () => {
    it('outputs Argentina 3-1 Switzerland — Rule 28 floor + Rule 31 resilience bump', () => {
      const result = judgePickInput(arg_sui);
      expect(result.finalPick).toEqual({ home: 3, away: 1 });
      expect(result.tier).toBe(1);
      expect(result.rulesTriggered).toContain('Rule28');
      expect(result.rulesTriggered).toContain('Rule31');
    });

    it('does NOT fire without the prior-round resilience flag', () => {
      const noResilience: PickJudgeInput = {
        ...arg_sui,
        awayWentToExtraTimeOrPenaltiesPriorRound: false,
      };
      const result = judgePickInput(noResilience);
      expect(result.rulesTriggered).not.toContain('Rule31');
      expect(result.finalPick).toEqual({ home: 3, away: 0 });
    });

    it('does NOT fire when BTTS No Score is outside the 50-59 band', () => {
      const bttsTooLow: PickJudgeInput = {
        ...arg_sui,
        alpha: { ...arg_sui.alpha, bttsNoScore: 49 },
      };
      expect(judgePickInput(bttsTooLow).rulesTriggered).not.toContain('Rule31');

      const bttsTooHigh: PickJudgeInput = {
        ...arg_sui,
        alpha: { ...arg_sui.alpha, bttsNoScore: 60 },
      };
      expect(judgePickInput(bttsTooHigh).rulesTriggered).not.toContain('Rule31');
    });

    it('does NOT fire when Rule 28 has not triggered (no established pattern)', () => {
      const noPattern: PickJudgeInput = {
        ...arg_sui,
        homeGoalPatternMatches: 0,
        homeGoalPatternValue: 0,
      };
      const result = judgePickInput(noPattern);
      expect(result.rulesTriggered).not.toContain('Rule28');
      expect(result.rulesTriggered).not.toContain('Rule31');
    });
  });
});
