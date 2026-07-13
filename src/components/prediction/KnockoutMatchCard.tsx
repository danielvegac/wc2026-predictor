import { useState } from "react";
import type { Team } from "../../types";
import type { KnockoutMatch } from "../../data/knockoutMatches";
import type { ModelPrediction } from "../../store/modelPredictionStore";
import { getFlagClass } from "../../data/flags";
import { getResultBorderClass } from "../../utils/matchResult";
import { ScoreInput } from "./ScoreInput";
import { usePredictionStore } from "../../store/predictionStore";
import { useResultsStore } from "../../store/resultsStore";
import { ScorelineMatrix } from "./ScorelineMatrix";

interface KnockoutMatchCardProps {
  ko: KnockoutMatch;
  homeTeam: Team;
  awayTeam: Team;
  modelPred: ModelPrediction | undefined;
}

const ROUND_LABELS: Record<string, string> = {
  R32: "R32",
  R16: "R16",
  QF: "QF",
  SF: "SF",
  "3P": "3rd Place",
  F: "Final",
};

export function KnockoutMatchCard({ ko, homeTeam, awayTeam, modelPred }: KnockoutMatchCardProps) {
  const prediction = usePredictionStore((s) => s.predictions[ko.matchId]);
  const setPrediction = usePredictionStore((s) => s.setPrediction);
  const locked = usePredictionStore((s) => s.locked);
  const liveResult = useResultsStore((s) => s.getResultForMatch(ko.matchId));

  const showMatrixToggle = modelPred?.expectedHomeGoals != null && modelPred?.expectedAwayGoals != null;
  const [matrixOpen, setMatrixOpen] = useState(false);

  const homeGoals = prediction?.homeGoals ?? null;
  const awayGoals = prediction?.awayGoals ?? null;

  // Live result takes priority over static data
  const isCompleted = ko.status === "completed" || liveResult?.completed === true;
  const displayHomeGoals = liveResult?.completed ? liveResult.homeScore : ko.homeGoals;
  const displayAwayGoals = liveResult?.completed ? liveResult.awayScore : ko.awayGoals;

  const handleHomeChange = (goals: number) => {
    setPrediction(ko.matchId, goals, awayGoals ?? 0);
  };
  const handleAwayChange = (goals: number) => {
    setPrediction(ko.matchId, homeGoals ?? 0, goals);
  };

  // Border color based on completion
  let resultBorder = "border-border";
  if (isCompleted) {
    resultBorder = "border-accent-green/40";
  } else if (homeGoals !== null && awayGoals !== null) {
    resultBorder = getResultBorderClass(homeGoals, awayGoals);
  }

  return (
    <div
      className={`rounded-md border ${resultBorder} px-4 py-3 transition-colors`}
      style={{ background: "var(--color-bg-surface)" }}
    >
      {/* Top row: R32 badge + date + kickoff */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider bg-accent-gold/10 text-accent-gold px-2 py-0.5 rounded-full">
            {ROUND_LABELS[ko.round] ?? ko.round}
          </span>
          <span className="text-[11px] font-mono text-text-muted">
            {ko.kickoffCOT} COT
          </span>
        </div>
        {isCompleted && (
          <span className="text-[10px] font-bold text-text-secondary">FT</span>
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
          <ScoreInput value={homeGoals} onChange={handleHomeChange} disabled={locked} />
          <span className="text-text-muted font-medium text-sm">–</span>
          <ScoreInput value={awayGoals} onChange={handleAwayChange} disabled={locked} />
        </div>

        {/* Away team */}
        <div className="flex items-center gap-2 flex-1 justify-end">
          <span className="text-[0.82rem] leading-tight font-medium text-text-primary text-right">
            {awayTeam.name}
          </span>
          <span className={`${getFlagClass(awayTeam.id)} text-base shrink-0`} />
        </div>
      </div>

      {/* Venue */}
      <div className="mt-1 text-center">
        <span className="text-[10px] text-text-muted">{ko.venue}</span>
      </div>

      {/* Model prediction */}
      {modelPred && (
        <>
          {/* Expected goals */}
          {modelPred.expectedHomeGoals != null && (
            <div className="mt-1.5 flex items-center justify-center gap-1.5" style={{ fontSize: "0.7rem" }}>
              <span className="text-text-muted font-medium">Exp. goals</span>
              <span className="font-mono font-semibold" style={{ color: "var(--color-info)" }}>
                {modelPred.expectedHomeGoals.toFixed(1)} – {modelPred.expectedAwayGoals.toFixed(1)}
              </span>
            </div>
          )}

          {/* Model score + AET indicator */}
          <div className="mt-1.5 flex items-center justify-center gap-2">
            <span className="text-[10px] uppercase tracking-wider font-medium" style={{ color: "var(--color-info)" }}>
              Model
            </span>
            <span className="font-mono text-xs font-semibold" style={{ color: "var(--color-info)" }}>
              {modelPred.homeGoals} – {modelPred.awayGoals}
            </span>
            {modelPred.aetLikely && (
              <span className="text-[10px] font-semibold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded-full border border-amber-500/30">
                → AET/Pens
              </span>
            )}
          </div>

          {/* Advance probability */}
          {modelPred.koAdvanceProbability != null && (
            <div className="mt-1 flex items-center justify-center gap-1.5" style={{ fontSize: "0.7rem" }}>
              <span className="text-text-muted font-medium">Win to advance:</span>
              <span className="font-mono font-semibold text-accent-green">
                {homeTeam.shortName} {(modelPred.koAdvanceProbability * 100).toFixed(0)}%
              </span>
              <span className="text-text-muted">·</span>
              <span className="font-mono font-semibold text-accent-red">
                {awayTeam.shortName} {((1 - modelPred.koAdvanceProbability) * 100).toFixed(0)}%
              </span>
            </div>
          )}
        </>
      )}

      {/* Actual result (completed matches) */}
      {isCompleted && displayHomeGoals != null && displayAwayGoals != null && (
        <div className="mt-1.5 pt-1.5 border-t border-border/50 flex items-center justify-center gap-2">
          <span className="text-[10px] uppercase tracking-wider text-text-muted font-medium">
            Final
          </span>
          <span className="font-mono text-sm font-bold text-text-primary">
            {displayHomeGoals} – {displayAwayGoals}
          </span>
        </div>
      )}

      {/* Scoreline matrix toggle */}
      {showMatrixToggle && (
        <div className="mt-3 border-t border-border pt-3">
          <button
            onClick={() => setMatrixOpen((o) => !o)}
            className="w-full flex items-center justify-center gap-1.5 text-xs text-text-muted hover:text-text-secondary transition-colors"
          >
            <span>📊 Model Score Matrix</span>
            <span>{matrixOpen ? "▴" : "▾"}</span>
          </button>
          {matrixOpen && (
            <div className="mt-3">
              <ScorelineMatrix
                homeTeamName={homeTeam.name}
                awayTeamName={awayTeam.name}
                lambdaHome={modelPred.expectedHomeGoals}
                lambdaAway={modelPred.expectedAwayGoals}
                homeWinProb={modelPred.homeWinProb}
                drawProb={modelPred.drawProb}
                awayWinProb={modelPred.awayWinProb}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
