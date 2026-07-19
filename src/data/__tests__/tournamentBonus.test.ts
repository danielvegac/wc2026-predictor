import { describe, it, expect } from 'vitest';
import { computeTournamentBonus } from '../tournamentBonus';
import type { BracketPick } from '../tournamentBonus';

const actual: BracketPick = {
  champion: 'Spain',
  runnerUp: 'Argentina',
  thirdPlace: 'England',
};

describe('computeTournamentBonus', () => {
  it('awards only champion points when only champion is correct', () => {
    const result = computeTournamentBonus(
      { champion: 'Spain', runnerUp: 'France', thirdPlace: 'Belgium' },
      actual
    );
    expect(result.championCorrect).toBe(true);
    expect(result.runnerUpCorrect).toBe(false);
    expect(result.thirdPlaceCorrect).toBe(false);
    expect(result.totalBonusPoints).toBe(15);
  });

  it('awards only runner-up points when only runner-up is correct', () => {
    const result = computeTournamentBonus(
      { champion: 'France', runnerUp: 'Argentina', thirdPlace: 'Belgium' },
      actual
    );
    expect(result.runnerUpCorrect).toBe(true);
    expect(result.totalBonusPoints).toBe(10);
  });

  it('awards only third place points when only third place is correct', () => {
    const result = computeTournamentBonus(
      { champion: 'France', runnerUp: 'Belgium', thirdPlace: 'England' },
      actual
    );
    expect(result.thirdPlaceCorrect).toBe(true);
    expect(result.totalBonusPoints).toBe(5);
  });

  it('awards all 30 points when everything is correct', () => {
    const result = computeTournamentBonus(actual, actual);
    expect(result.championCorrect).toBe(true);
    expect(result.runnerUpCorrect).toBe(true);
    expect(result.thirdPlaceCorrect).toBe(true);
    expect(result.totalBonusPoints).toBe(30);
  });

  it('awards 0 points when everything is incorrect', () => {
    const result = computeTournamentBonus(
      { champion: 'France', runnerUp: 'Belgium', thirdPlace: 'Morocco' },
      actual
    );
    expect(result.championCorrect).toBe(false);
    expect(result.runnerUpCorrect).toBe(false);
    expect(result.thirdPlaceCorrect).toBe(false);
    expect(result.totalBonusPoints).toBe(0);
  });

  it('scores the actual WC2026 bracket pick: champion + runner-up correct, third place wrong', () => {
    const pick: BracketPick = {
      champion: 'Spain',
      runnerUp: 'Argentina',
      thirdPlace: 'France',
    };
    const result = computeTournamentBonus(pick, actual);
    expect(result.championCorrect).toBe(true);
    expect(result.runnerUpCorrect).toBe(true);
    expect(result.thirdPlaceCorrect).toBe(false);
    expect(result.championPoints).toBe(15);
    expect(result.runnerUpPoints).toBe(10);
    expect(result.thirdPlacePoints).toBe(0);
    expect(result.totalBonusPoints).toBe(25);
  });
});
