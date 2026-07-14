#!/usr/bin/env node
/// <reference types="node" />
import { judgePickInput } from './engine';
import { civ_nor, fra_swe, mex_ecu, eng_cod, bel_sen, usa_bih, esp_aut, por_cro, sui_alg, aus_egy, arg_cpv, col_gha, can_mar, par_fra, mex_eng, bra_nor, sui_col, fra_mar, por_esp, usa_bel, arg_egy, esp_bel, nor_eng, arg_sui, fra_esp } from './__tests__/historicalFixtures';
import type { PickJudgeInput } from './types';
import { signalAccuracyData, getSignalAccuracySummary } from '../../data/signalAccuracy';
import { knockoutMatches } from '../../data/knockoutMatches';
import { formOverrides } from '../../data/formOverrides';
import { teams } from '../../data/teams';

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
  'R16-5': por_esp,
  'R16-6': usa_bel,
  'R16-7': arg_egy,
  'R16-8': sui_col,
  'QF-1': fra_mar,
  'QF-2': esp_bel,
  'QF-3': nor_eng,
  'QF-4': arg_sui,
  'SF-1': fra_esp,
};

// ── Accuracy CLI flags ────────────────────────────────────────────────
const cliFlag = process.argv[2] ?? '';

if (cliFlag === '--accuracy-summary') {
  const s = getSignalAccuracySummary();
  console.log('\n' + '═'.repeat(56));
  console.log('  SIGNAL ACCURACY SUMMARY — Alpha vs Model');
  console.log('═'.repeat(56));
  console.log(`\n📊 TOTALS`);
  console.log(`  Total matches tracked:   ${s.totalMatches}`);
  console.log(`  Comparable (no AET):     ${s.comparableMatches}`);
  console.log(`  Excluded (AET chaos):    ${s.aetExcluded}`);
  console.log(`\n🏆 SIGNAL SCORECARD`);
  console.log(`  Alpha closer:            ${s.alphaCloser}`);
  console.log(`  Model closer:            ${s.modelCloser}`);
  console.log(`  Tie:                     ${s.tie}`);
  console.log(`\n⚠️  RULE 23 (Lambda Disagreement)`);
  console.log(`  Triggered:               ${s.rule23TriggeredCount}x`);
  console.log(`  Alpha ${s.rule23Breakdown.alpha} · Tie ${s.rule23Breakdown.tie} · Model ${s.rule23Breakdown.model}`);
  console.log('═'.repeat(56) + '\n');
  process.exit(0);
}

if (cliFlag === '--accuracy') {
  const targetId = process.argv[3];
  if (!targetId) {
    console.error('Usage: --accuracy <matchId>  (e.g. --accuracy R16-02)');
    console.error('Available: ' + signalAccuracyData.map(e => e.matchId).join(', '));
    process.exit(1);
  }
  const entry = signalAccuracyData.find(e => e.matchId === targetId);
  if (!entry) {
    console.error(`Unknown matchId: ${targetId}`);
    console.error('Available: ' + signalAccuracyData.map(e => e.matchId).join(', '));
    process.exit(1);
  }
  console.log('\n' + '═'.repeat(56));
  console.log(`  SIGNAL ACCURACY — ${entry.homeTeamId} vs ${entry.awayTeamId} (${entry.matchId})`);
  console.log('═'.repeat(56));
  const resultStr = !entry.finalResult
    ? 'Pending'
    : entry.wentToExtraTime && entry.regulationResult
    ? `90' ${entry.regulationResult.home}-${entry.regulationResult.away} → 120' ${entry.finalResult.home}-${entry.finalResult.away}${entry.penaltyWinner ? ` (${entry.penaltyWinner} pens)` : ''}`
    : `${entry.finalResult.home}-${entry.finalResult.away}`;
  console.log(`\n📋 RESULT:  ${resultStr}`);
  console.log(`\n🔮 ALPHA TOP SCORELINES`);
  entry.alphaTopScorelines.forEach((s, i) => console.log(`  #${i + 1}  ${s.home}-${s.away}  ${s.probability}%`));
  if (entry.alphaImpliedLambdaHome != null) {
    console.log(`  Implied λ: ${entry.alphaImpliedLambdaHome.toFixed(2)} / ${entry.alphaImpliedLambdaAway?.toFixed(2)}`);
  }
  console.log(`  Actual rank: ${entry.alphaActualRank != null ? '#' + entry.alphaActualRank : '—'}  (${entry.alphaActualProbability ?? 0}%)`);
  console.log(`\n🤖 MODEL TOP SCORELINES (λ ${entry.modelLambdaHome.toFixed(2)} / ${entry.modelLambdaAway.toFixed(2)})`);
  entry.modelTopScorelines.forEach((s, i) => console.log(`  #${i + 1}  ${s.home}-${s.away}  ${s.probability}%`));
  console.log(`  Actual rank: ${entry.modelActualRank != null ? '#' + entry.modelActualRank : '—'}  (${entry.modelActualProbability ?? 0}%)`);
  console.log(`\n⚖️  CLOSER SIGNAL: ${entry.closerSignal ?? '—'}`);
  const flags: string[] = [];
  if (entry.rule23Triggered) flags.push(`Rule23 (divergence ${entry.lambdaDivergencePct}%)`);
  if (entry.rule25Flagged) flags.push('Rule25 (AET excluded)');
  if (flags.length) console.log(`   Flags: ${flags.join(', ')}`);
  if (entry.notes) console.log(`\n📝 NOTES: ${entry.notes}`);
  console.log('═'.repeat(56) + '\n');
  process.exit(0);
}

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

// ── RULE 27: Form Freshness Gate (preflight warning, not rule logic) ──────
// Resolves each team to its 3-letter code, finds the most recent COMPLETED
// knockoutMatches entry for that team (excluding this fixture), and checks
// whether formOverrides.ts was updated to reflect it (heuristic: the note
// mentions the opponent's code from that match).
function resolveTeamCode(name: string): string | undefined {
  if (teams.some(t => t.id === name)) return name;
  const match = teams.find(t => t.name.toLowerCase() === name.toLowerCase());
  return match?.id;
}

function checkRule27(teamName: string): void {
  const code = resolveTeamCode(teamName);
  if (!code) {
    console.log(`  ⚠️  RULE 27: Could not resolve team code for "${teamName}" — skipping freshness check.`);
    return;
  }

  const priorCompleted = knockoutMatches
    .filter(m => m.status === 'completed' && m.matchId !== matchId &&
      (m.homeTeamId === code || m.awayTeamId === code))
    .sort((a, b) => b.date.localeCompare(a.date));

  const mostRecent = priorCompleted[0];
  if (!mostRecent) return; // no prior knockout match — nothing to be stale against

  const opponentCode = mostRecent.homeTeamId === code ? mostRecent.awayTeamId : mostRecent.homeTeamId;
  const override = formOverrides[code];

  if (!override) {
    console.log(
      `  ⚠️  STALE FORM DATA: ${teamName} has no formOverride entry, but has a completed ` +
      `${mostRecent.round} match (${mostRecent.matchId} vs ${opponentCode}). Recompute before trusting this fixture's λ.`
    );
    return;
  }

  if (!override.note.includes(opponentCode)) {
    console.log(
      `  ⚠️  STALE FORM DATA: ${teamName} formOverride does not reference ${opponentCode} ` +
      `(most recent completed match: ${mostRecent.matchId}, ${mostRecent.round}). Recompute before trusting this fixture's λ.`
    );
  }
}

console.log('\n🧪 RULE 27 (Form Freshness Gate)');
checkRule27(input.homeTeam);
checkRule27(input.awayTeam);

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

// ── RULE 22 (Individual Ceiling): Single-player ceiling stress test ───────
const rule22Qualifying = (input.highCeilingPlayers ?? []).filter(
  p => p.tournamentGoals >= 5 || p.singleMatchBrace === true
);
const rule22Fires = rule22Qualifying.length > 0;

if (rule22Fires) {
  const primaryPick = result.finalPick;
  const isDual = rule22Qualifying.length >= 2;
  const rule22Header = isDual
    ? 'RULE 22 (Individual Ceiling — DUAL)'
    : 'RULE 22 (Individual Ceiling)';

  console.log(`\n⚠️  ${rule22Header}:`);

  type Candidate = { home: number; away: number; desc: string };
  const allCandidates: Candidate[] = [];

  for (const player of rule22Qualifying) {
    const playerTeam = player.teamId === 'home' ? input.homeTeam : input.awayTeam;
    const oppTeam   = player.teamId === 'home' ? input.awayTeam  : input.homeTeam;
    const braceNote = player.singleMatchBrace ? ', scored 2 in 1 match' : '';
    console.log(`    ${player.playerName} (${playerTeam}): ${player.tournamentGoals} tournament goals${braceNote}`);

    const H = primaryPick.home;
    const A = primaryPick.away;
    const onHome = player.teamId === 'home';
    const playerWins = onHome ? H > A : A > H;

    if (!playerWins) {
      // Player is on the underdog/drawing side → upset candidates
      // Tighten: player's team scores 1 more, opponent stays
      allCandidates.push({
        home: onHome ? H + 1 : H,
        away: onHome ? A     : A + 1,
        desc: `${player.playerName} scores — ${oppTeam} still leads (margin −1)`,
      });
      // Flip: underdog wins by 1 goal
      allCandidates.push({
        home: onHome ? Math.max(0, A)     : Math.max(0, H - 1),
        away: onHome ? Math.max(0, A - 1) : Math.max(0, H),
        desc: `${player.playerName} + ${oppTeam} lapse → ${playerTeam} wins by 1`,
      });
      // Brace flip: underdog wins by 2 goals
      if (player.singleMatchBrace) {
        allCandidates.push({
          home: onHome ? Math.max(0, A + 1) : Math.max(0, H - 1),
          away: onHome ? Math.max(0, A - 1) : Math.max(0, H + 1),
          desc: `${player.playerName} brace → ${playerTeam} wins by 2`,
        });
      }
    } else {
      // Player is on the winning side → confirms pick + adjacent variants
      // Primary confirmation
      allCandidates.push({
        home: H,
        away: A,
        desc: `${player.playerName}'s ceiling makes primary the likely floor`,
      });
      // Tighten: opponent also scores (high ceiling = more open game)
      allCandidates.push({
        home: onHome ? H     : H + 1,
        away: onHome ? A + 1 : A,
        desc: `${player.playerName}'s runs open space — ${oppTeam} also capitalizes`,
      });
      // Brace extend: winner scores one more
      if (player.singleMatchBrace) {
        allCandidates.push({
          home: onHome ? H + 1 : H,
          away: onHome ? A     : A + 1,
          desc: `${player.playerName} brace potential — ${playerTeam} extends lead`,
        });
      }
    }
  }

  // Deduplicate by scoreline
  const seen = new Set<string>();
  const uniqueCandidates = allCandidates.filter(c => {
    const key = `${c.home}-${c.away}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  console.log(`    Stress-test candidates:`);
  for (const c of uniqueCandidates) {
    console.log(`      → ${input.homeTeam} ${c.home}-${c.away} ${input.awayTeam}  (${c.desc})`);
  }
  console.log(`    Note: Primary pick stands. Evaluate before entering quiniela pick.`);
}

console.log('═'.repeat(56) + '\n');
