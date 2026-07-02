import { describe, it, expect } from 'vitest';
import { judgePickInput } from '../engine';
import { civ_nor, fra_swe, mex_ecu, eng_cod, bel_sen, esp_aut } from './historicalFixtures';

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
  });
});
