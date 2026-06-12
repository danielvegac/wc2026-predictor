import type { Match, Team, Prediction } from "../../types";
import { getFlagClass } from "../../data/flags";
import { formatMatchDate } from "../../data/schedule";
import { useResultsStore } from "../../store/resultsStore";
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
  const actualResult = useResultsStore((s) => s.getResultForMatch)(match.id);

  const handleHomeChange = (goals: number) => {
    onScoreChange(match.id, goals, awayGoals ?? 0);
  };

  const handleAwayChange = (goals: number) => {
    onScoreChange(match.id, homeGoals ?? 0, goals);
  };

  // Accuracy indicator when actual result exists
  let accuracyIcon = "";
  let accuracyColor = "";
  if (actualResult && homeGoals !== null && awayGoals !== null) {
    const exactMatch =
      homeGoals === actualResult.homeScore &&
      awayGoals === actualResult.awayScore;
    const userResult =
      homeGoals > awayGoals ? "H" : homeGoals < awayGoals ? "A" : "D";
    const actualRes =
      actualResult.homeScore > actualResult.awayScore
        ? "H"
        : actualResult.homeScore < actualResult.awayScore
        ? "A"
        : "D";
    const correctResult = userResult === actualRes;

    if (exactMatch) {
      accuracyIcon = "⭐";
      accuracyColor = "text-accent-gold";
    } else if (correctResult) {
      accuracyIcon = "✓";
      accuracyColor = "text-accent-green";
    } else {
      accuracyIcon = "✗";
      accuracyColor = "text-accent-red";
    }
  }

  // Result indicator colors
  let resultBorder = "border-transparent";
  if (actualResult && homeGoals !== null && awayGoals !== null) {
    // Color based on accuracy vs actual
    if (accuracyIcon === "⭐") resultBorder = "border-accent-gold/50";
    else if (accuracyIcon === "✓") resultBorder = "border-accent-green/40";
    else if (accuracyIcon === "✗") resultBorder = "border-accent-red/40";
  } else if (homeGoals !== null && awayGoals !== null) {
    if (homeGoals > awayGoals) resultBorder = "border-accent-green/40";
    else if (homeGoals < awayGoals) resultBorder = "border-accent-red/40";
    else resultBorder = "border-accent-gold/40";
  }

  return (
    <div
      className={`bg-white rounded-lg border ${resultBorder} px-4 py-3
        shadow-sm hover:shadow-md transition-shadow`}
    >
      {/* Date label + accuracy icon */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-mono text-text-muted">
          {formatMatchDate(match.date)}
        </span>
        {accuracyIcon && (
          <span className={`text-sm font-bold ${accuracyColor}`} title={
            accuracyIcon === "⭐" ? "Exact score!" :
            accuracyIcon === "✓" ? "Correct result" : "Wrong prediction"
          }>
            {accuracyIcon}
          </span>
        )}
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

      {/* Actual result row (when available) */}
      {actualResult && (
        <div className="mt-2 pt-2 border-t border-border/50 flex items-center justify-center gap-2">
          <span className="text-[10px] uppercase tracking-wider text-text-muted font-medium">
            Actual
          </span>
          <span className="font-mono text-sm font-bold text-text-primary">
            {actualResult.homeScore} – {actualResult.awayScore}
          </span>
        </div>
      )}
    </div>
  );
}
