#!/usr/bin/env node
/// <reference types="node" />
import { judgePickInput } from './engine';
import { civ_nor, fra_swe, mex_ecu, eng_cod, bel_sen, usa_bih, esp_aut, por_cro, sui_alg, aus_egy, arg_cpv, col_gha, can_mar, par_fra, mex_eng, bra_nor } from './__tests__/historicalFixtures';
import type { PickJudgeInput } from './types';

const fixtures: Record<string, PickJudgeInput> = {
  'R32-05': civ_nor,
  'R32-06': fra_swe,
  'R32-07': mex_ecu,
  'R32-08': eng_cod,
  'R32-09': bel_sen,
  'R32-10': usa_bih,
  'R32-11': esp_aut,
  'R32-12': por_cro,
  'R32-13': sui_alg,
  'R32-14': aus_egy,
  'R32-15': arg_cpv,
  'R32-16': col_gha,
  'R16-1': can_mar,
  'R16-2': par_fra,
  'R16-3': bra_nor,
  'R16-4': mex_eng,
};

// Support both --match=R32-11 and --match R32-11
const matchArg = process.argv[2] ?? '';
const matchId = matchArg.includes('=')
  ? matchArg.split('=')[1].trim()
  : (process.argv[3]?.trim() || 'R32-07');
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
console.log('═'.repeat(56));

// ── RULE 21 (HSCM): High-Scoring Competitive Match flag ──────────
const homeMatchesPlayed = input.homeTournament.wins + input.homeTournament.draws + input.homeTournament.losses;
const awayMatchesPlayed = input.awayTournament.wins + input.awayTournament.draws + input.awayTournament.losses;

const homeScoredEveryMatch = homeMatchesPlayed > 0 && input.homeTournament.goalsScored >= homeMatchesPlayed;
const awayScoredEveryMatch = awayMatchesPlayed > 0 && input.awayTournament.goalsScored >= awayMatchesPlayed;

const rule21_bothScoredEveryMatch = homeScoredEveryMatch && awayScoredEveryMatch;
const rule21_competitiveElo = Math.abs(input.homeElo - input.awayElo) <= 200;
const lambdaTotal = (input.alpha.homeAdjustedLambda ?? 0) + (input.alpha.awayAdjustedLambda ?? 0);
const rule21_highLambda = lambdaTotal >= 3.5;
const rule21_awayTeamRecentlyScored = (input.awayTournament.wins + input.awayTournament.draws) >= 2;
// Recency-adjusted: even teams with strong overall CS records trigger after 4+ matches played
const rule21_homeDefenseVulnerable = input.homeTournament.cleanSheets <= 2 || homeMatchesPlayed >= 4;

const rule21Fires =
  rule21_bothScoredEveryMatch &&
  rule21_competitiveElo &&
  rule21_highLambda &&
  rule21_awayTeamRecentlyScored &&
  rule21_homeDefenseVulnerable;

console.log('\n🧪 RULE 21 TRACE (HSCM)');
console.log(`  bothScoredEveryMatch:    ${rule21_bothScoredEveryMatch} (${input.homeTeam} ${input.homeTournament.goalsScored}G/${homeMatchesPlayed}M, ${input.awayTeam} ${input.awayTournament.goalsScored}G/${awayMatchesPlayed}M)`);
console.log(`  competitiveElo:          ${rule21_competitiveElo} (gap ${Math.abs(input.homeElo - input.awayElo)} ≤ 200)`);
console.log(`  highLambda:              ${rule21_highLambda} (λ total ${lambdaTotal.toFixed(2)} ≥ 3.5)`);
console.log(`  awayTeamRecentlyScored:  ${rule21_awayTeamRecentlyScored} (${input.awayTeam} ${input.awayTournament.wins}W+${input.awayTournament.draws}D ≥ 2)`);
console.log(`  homeDefenseVulnerable:   ${rule21_homeDefenseVulnerable} (${input.homeTournament.cleanSheets} CS, ${homeMatchesPlayed} matches — fires if CS≤2 OR matches≥4)`);
console.log(`  ─────────────────────────────────────────────────`);
console.log(`  RULE 21 FIRES:           ${rule21Fires}`);

if (rule21Fires) {
  const primaryPick = result.finalPick;
  // HSCM candidate: same winner, higher scoring. If away wins → add 1 to home (close gap).
  // If home wins or draw → add 1 to each (maintain margin, more goals).
  const hscmPick = primaryPick.away > primaryPick.home
    ? { home: primaryPick.home + 1, away: primaryPick.away }
    : { home: primaryPick.home + 1, away: primaryPick.away + 1 };

  const eloDiff = Math.abs(input.homeElo - input.awayElo);
  console.log('\n⚠️  RULE 21 (HSCM): High-Scoring Competitive Match flag fired.');
  console.log(`    Primary pick:   ${input.homeTeam} ${primaryPick.home}-${primaryPick.away} ${input.awayTeam}`);
  console.log(`    HSCM candidate: ${input.homeTeam} ${hscmPick.home}-${hscmPick.away} ${input.awayTeam}`);
  console.log(`    Conditions: both teams scored every match, Elo gap ${eloDiff}, λ total ${lambdaTotal.toFixed(2)}, home defense vulnerable (${input.homeTournament.cleanSheets} CS in ${homeMatchesPlayed} matches)`);
  console.log(`    → Evaluate both. HSCM candidate favored when both teams have elite individual attackers.`);
}
console.log('═'.repeat(56) + '\n');
