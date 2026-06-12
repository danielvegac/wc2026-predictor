import type { Match, Team, Prediction } from "../../types";
import { getFlagClass } from "../../data/flags";
import { formatMatchDate } from "../../data/schedule";
import { useResultsStore } from "../../store/resultsStore";
import { useModelPredictionStore } from "../../store/modelPredictionStore";
import { getExpertPicksForMatch } from "../../data/expertPicks";
import { ScoreInput } from "./ScoreInput";

interface MatchCardProps {
  match: Match;
  homeTeam: Team;
  awayTeam: Team;
  prediction: Prediction | undefined;
  onScoreChange: (matchId: string, homeGoals: number, awayGoals: number) => void;
  disabled?: boolean;
}

type AccuracyResult = { icon: string; color: string; title: string } | null;

function getAccuracy(
  predHome: number,
  predAway: number,
  actualHome: number,
  actualAway: number
): AccuracyResult {
  const exactMatch = predHome === actualHome && predAway === actualAway;
  const predResult = predHome > predAway ? "H" : predHome < predAway ? "A" : "D";
  const actualResult = actualHome > actualAway ? "H" : actualHome < actualAway ? "A" : "D";

  if (exactMatch) return { icon: "⭐", color: "text-accent-gold", title: "Exact score!" };
  if (predResult === actualResult) return { icon: "✓", color: "text-accent-green", title: "Correct result" };
  return { icon: "✗", color: "text-accent-red", title: "Wrong prediction" };
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
  const modelPred = useModelPredictionStore((s) => s.predictions[match.id]);

  const handleHomeChange = (goals: number) => {
    onScoreChange(match.id, goals, awayGoals ?? 0);
  };

  const handleAwayChange = (goals: number) => {
    onScoreChange(match.id, homeGoals ?? 0, goals);
  };

  // Accuracy: user vs actual
  const userAccuracy =
    actualResult && homeGoals !== null && awayGoals !== null
      ? getAccuracy(homeGoals, awayGoals, actualResult.homeScore, actualResult.awayScore)
      : null;

  // Accuracy: model vs actual
  const modelAccuracy =
    actualResult && modelPred
      ? getAccuracy(modelPred.homeGoals, modelPred.awayGoals, actualResult.homeScore, actualResult.awayScore)
      : null;

  // Result indicator colors
  let resultBorder = "border-transparent";
  if (userAccuracy) {
    if (userAccuracy.icon === "⭐") resultBorder = "border-accent-gold/50";
    else if (userAccuracy.icon === "✓") resultBorder = "border-accent-green/40";
    else resultBorder = "border-accent-red/40";
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
      {/* Date label + kickoff/FT + accuracy badges */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-mono text-text-muted">
          {formatMatchDate(match.date)}
          {actualResult
            ? <span className="ml-1 font-bold text-text-secondary">· FT</span>
            : match.kickoffCOT
              ? <span className="ml-1">· {match.kickoffCOT} COT</span>
              : null}
        </span>
        {actualResult && (
          <div className="flex items-center gap-2">
            {userAccuracy && (
              <span className={`text-sm font-bold ${userAccuracy.color}`} title={`You: ${userAccuracy.title}`}>
                {userAccuracy.icon}
              </span>
            )}
            {modelAccuracy && (
              <span
                className={`text-xs ${modelAccuracy.color}`}
                title={`Model: ${modelAccuracy.title}`}
                style={{ opacity: 0.7 }}
              >
                <span className="text-[9px] text-text-muted mr-0.5">M</span>
                {modelAccuracy.icon}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Match row — user prediction */}
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

      {/* Model prediction row (when available) */}
      {modelPred && (
        <div className="mt-1.5 flex items-center justify-center gap-2">
          <span className="text-[10px] uppercase tracking-wider text-blue-400 font-medium">
            Model
          </span>
          <span className="font-mono text-xs font-semibold text-blue-500">
            {modelPred.homeGoals} – {modelPred.awayGoals}
          </span>
        </div>
      )}

      {/* Expert picks row */}
      <ExpertPicksRow matchId={match.id} />

      {/* Actual result row (when available) */}
      {actualResult && (
        <div className="mt-1.5 pt-1.5 border-t border-border/50 flex items-center justify-center gap-2">
          <span className="text-[10px] uppercase tracking-wider text-text-muted font-medium">
            Final
          </span>
          <span className="font-mono text-sm font-bold text-text-primary">
            {actualResult.homeScore} – {actualResult.awayScore}
          </span>
        </div>
      )}
    </div>
  );
}

function ExpertPicksRow({ matchId }: { matchId: string }) {
  const picks = getExpertPicksForMatch(matchId);
  if (picks.length === 0) return null;

  return (
    <div className="mt-1 flex items-center justify-center gap-1.5 flex-wrap">
      {picks.map((pick, i) => (
        <span
          key={`${pick.source}-${i}`}
          className="inline-flex items-center gap-1 bg-bg-secondary text-text-secondary rounded px-1.5 py-0.5"
          style={{ fontSize: "0.7rem" }}
          title={pick.note ?? `${pick.source} prediction`}
        >
          <span className="font-medium text-text-muted">{pick.source}:</span>
          <span className="font-mono font-semibold">
            {pick.homeGoals}–{pick.awayGoals}
          </span>
        </span>
      ))}
    </div>
  );
}
