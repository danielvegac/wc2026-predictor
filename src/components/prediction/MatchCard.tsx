import type { Match, Team, Prediction } from "../../types";
import { getFlagClass } from "../../data/flags";
import { formatMatchDate } from "../../data/schedule";
import { ScoreInput } from "./ScoreInput";

interface MatchCardProps {
  match: Match;
  homeTeam: Team;
  awayTeam: Team;
  prediction: Prediction | undefined;
  onScoreChange: (matchId: string, homeGoals: number, awayGoals: number) => void;
  disabled?: boolean;
}

export function MatchCard({
  match,
  homeTeam,
  awayTeam,
  prediction,
  onScoreChange,
  disabled = false,
}: MatchCardProps) {
  const homeGoals = prediction?.homeGoals ?? null;
  const awayGoals = prediction?.awayGoals ?? null;

  const handleHomeChange = (goals: number) => {
    onScoreChange(match.id, goals, awayGoals ?? 0);
  };

  const handleAwayChange = (goals: number) => {
    onScoreChange(match.id, homeGoals ?? 0, goals);
  };

  // Result indicator colors
  let resultBorder = "border-transparent";
  if (homeGoals !== null && awayGoals !== null) {
    if (homeGoals > awayGoals) resultBorder = "border-accent-green/40";
    else if (homeGoals < awayGoals) resultBorder = "border-accent-red/40";
    else resultBorder = "border-accent-gold/40";
  }

  return (
    <div
      className={`bg-white rounded-lg border ${resultBorder} px-4 py-3
        shadow-sm hover:shadow-md transition-shadow`}
    >
      {/* Date label */}
      <div className="text-[11px] font-mono text-text-muted mb-2">
        {formatMatchDate(match.date)}
      </div>

      {/* Match row */}
      <div className="flex items-start gap-3">
        {/* Home team */}
        <div className="flex items-center gap-2 flex-1">
          <span className={`${getFlagClass(homeTeam.id)} text-base shrink-0`} />
          <span className="text-[0.82rem] leading-tight font-medium text-text-primary">
            {homeTeam.name}
          </span>
        </div>

        {/* Score inputs */}
        <div className="flex items-center gap-2 shrink-0 pt-0.5">
          <ScoreInput
            value={homeGoals}
            onChange={handleHomeChange}
            disabled={disabled}
          />
          <span className="text-text-muted font-medium text-sm">–</span>
          <ScoreInput
            value={awayGoals}
            onChange={handleAwayChange}
            disabled={disabled}
          />
        </div>

        {/* Away team */}
        <div className="flex items-center gap-2 flex-1 justify-end">
          <span className="text-[0.82rem] leading-tight font-medium text-text-primary text-right">
            {awayTeam.name}
          </span>
          <span className={`${getFlagClass(awayTeam.id)} text-base shrink-0`} />
        </div>
      </div>
    </div>
  );
}
