#!/usr/bin/env node
/// <reference types="node" />
import { judgePickInput } from './engine';
import { civ_nor, fra_swe, mex_ecu, eng_cod, bel_sen } from './__tests__/historicalFixtures';
import type { PickJudgeInput } from './types';

const fixtures: Record<string, PickJudgeInput> = {
  'R32-05': civ_nor,
  'R32-06': fra_swe,
  'R32-07': mex_ecu,
  'R32-08': eng_cod,
  'R32-09': bel_sen,
};

const matchId = process.argv[2]?.replace('--match', '').replace('=', '').trim() || 'R32-07';
const input = fixtures[matchId];

if (!input) {
  console.error(`Unknown match: ${matchId}. Available: ${Object.keys(fixtures).join(', ')}`);
  process.exit(1);
}

const result = judgePickInput(input);

console.log('\n' + '═'.repeat(56));
console.log(`  PICK JUDGE — ${input.homeTeam} vs ${input.awayTeam} (${matchId})`);
console.log('═'.repeat(56));
console.log('\n📊 MODEL INPUT');
console.log(`  Model pick:    ${input.homeTeam} ${input.modelPick.home}-${input.modelPick.away} ${input.awayTeam}`);
console.log(`  Elo:           ${input.homeTeam} ${input.homeElo} vs ${input.awayTeam} ${input.awayElo}`);
console.log(`  Form:          ×${input.homeFormMultiplier} vs ×${input.awayFormMultiplier}`);
console.log(`  Tournament:    ${input.homeTeam} ${input.homeTournament.wins}W-${input.homeTournament.draws}D-${input.homeTournament.losses}L (${input.homeTournament.cleanSheets} CS)`);
console.log(`                 ${input.awayTeam} ${input.awayTournament.wins}W-${input.awayTournament.draws}D-${input.awayTournament.losses}L (${input.awayTournament.cleanSheets} CS)`);

console.log('\n🔍 RULE CHECKS');
result.rulesTriggered.forEach(r => console.log(`  ✅ ${r}`));

console.log('\n📋 REASONING');
result.reasoning.forEach((line, i) => console.log(`  ${i + 1}. ${line}`));

console.log('\n⚖️  TIER CLASSIFICATION');
console.log(`  Final tier:    ${result.tier}`);
if (result.tierWouldHaveBeen) console.log(`  Would have been: Tier ${result.tierWouldHaveBeen} (blocked by ${result.vetoedBy})`);

console.log('\n🎯 FINAL PICK: ' +
  `${input.homeTeam} ${result.finalPick.home}-${result.finalPick.away} ${input.awayTeam} ` +
  `[Tier ${result.tier}] [Confidence: ${result.confidence}]`);
console.log('═'.repeat(56) + '\n');
