import { describe, it, expect } from 'vitest';
import { judgePickInput } from '../engine';
import { civ_nor, fra_swe, mex_ecu } from './historicalFixtures';

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
  });
});
