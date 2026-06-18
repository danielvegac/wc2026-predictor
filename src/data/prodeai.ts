// ============================================================
// ProdeAI (Baseline) — Pre-tournament Poisson predictions
// ============================================================
// Uses calculateBaseStrengthFromElo (no form adjustments) to generate
// the most likely score for each played match. This represents what
// any pre-tournament AI predictor trained on Elo + Poisson would produce.

import { teams, getTeamMap } from "./teams";
import { groupStageSchedule } from "./schedule";
import { calculateBaseStrengthFromElo } from "../engine/strengthCalculator";
import { analyzeMatch } from "../engine/matchSimulator";
import type { ExpertPick } from "./expertPicks";

const playedMatchIds = new Set([
  "GS-A-1", "GS-A-2", "GS-B-1", "GS-B-2", "GS-C-1", "GS-C-2",
  "GS-D-1", "GS-D-2", "GS-E-1", "GS-E-2", "GS-F-1", "GS-F-2",
  "GS-G-1", "GS-G-2", "GS-H-1", "GS-H-2", "GS-I-1", "GS-I-2",
  "GS-J-1", "GS-J-2",
  "GS-K-1", "GS-K-2", "GS-L-1", "GS-L-2",
]);

let _cached: ExpertPick[] | null = null;

/** Generate ProdeAI baseline picks (computed once, then cached) */
export function getProdeAIPicks(): ExpertPick[] {
  if (_cached) return _cached;

  const teamMap = getTeamMap();
  const strengths = calculateBaseStrengthFromElo(teams);
  const strengthMap = new Map(strengths.map((s) => [s.teamId, s]));

  const picks: ExpertPick[] = [];

  for (const match of groupStageSchedule) {
    if (!playedMatchIds.has(match.id)) continue;

    const home = teamMap.get(match.homeTeamId);
    const away = teamMap.get(match.awayTeamId);
    const homeStr = strengthMap.get(match.homeTeamId);
    const awayStr = strengthMap.get(match.awayTeamId);
    if (!home || !away || !homeStr || !awayStr) continue;

    const result = analyzeMatch(match.id, home, away, homeStr, awayStr);

    picks.push({
      matchId: match.id,
      source: "Our Model (Pre-Tournament)",
      homeGoals: result.mostLikelyScore[0],
      awayGoals: result.mostLikelyScore[1],
      note: `${home.shortName} vs ${away.shortName} — pre-tournament Poisson baseline`,
    });
  }

  _cached = picks;
  return picks;
}
