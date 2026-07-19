// ============================================================
// Tournament Bracket Bonus — Champion / Runner-up / Third Place
// ============================================================
// Pre-tournament bracket picks, scored per src/utils/scoring.ts
// point values (champion 15, runner-up 10, third place 5).

export interface BracketPick {
  champion: string;
  runnerUp: string;
  thirdPlace: string;
}

export const actualFinalResults: BracketPick = {
  champion: "Spain",
  runnerUp: "Argentina",
  thirdPlace: "England",
};

// Both the user and the model are treated as having made identical
// pre-tournament bracket picks for this bonus category.
export const bracketPick: BracketPick = {
  champion: "Spain",
  runnerUp: "Argentina",
  thirdPlace: "France",
};

export interface TournamentBonusResult {
  championCorrect: boolean;
  runnerUpCorrect: boolean;
  thirdPlaceCorrect: boolean;
  championPoints: number;
  runnerUpPoints: number;
  thirdPlacePoints: number;
  totalBonusPoints: number;
}

export function computeTournamentBonus(
  pick: BracketPick,
  actual: BracketPick
): TournamentBonusResult {
  const championCorrect = pick.champion === actual.champion;
  const runnerUpCorrect = pick.runnerUp === actual.runnerUp;
  const thirdPlaceCorrect = pick.thirdPlace === actual.thirdPlace;

  const championPoints = championCorrect ? 15 : 0;
  const runnerUpPoints = runnerUpCorrect ? 10 : 0;
  const thirdPlacePoints = thirdPlaceCorrect ? 5 : 0;

  return {
    championCorrect,
    runnerUpCorrect,
    thirdPlaceCorrect,
    championPoints,
    runnerUpPoints,
    thirdPlacePoints,
    totalBonusPoints: championPoints + runnerUpPoints + thirdPlacePoints,
  };
}
