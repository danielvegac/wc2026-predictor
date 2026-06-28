import type { Team } from "../../types";
import type { KnockoutMatch } from "../../data/knockoutMatches";
import type { ModelPrediction } from "../../store/modelPredictionStore";
import { getFlagClass } from "../../data/flags";
import { ScoreInput } from "./ScoreInput";
import { usePredictionStore } from "../../store/predictionStore";

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

/** Format kickoffET like "15:00" into "3:00 PM ET" */
function formatKickoffET(et: string): string {
  const [hStr, mStr] = et.split(":");
  let h = parseInt(hStr, 10);
  const m = mStr;
  const period = h >= 12 ? "PM" : "AM";
  if (h > 12) h -= 12;
  if (h === 0) h = 12;
  return `${h}:${m} ${period} ET`;
}

export function KnockoutMatchCard({ ko, homeTeam, awayTeam, modelPred }: KnockoutMatchCardProps) {
  const prediction = usePredictionStore((s) => s.predictions[ko.matchId]);
  const setPrediction = usePredictionStore((s) => s.setPrediction);
  const locked = usePredictionStore((s) => s.locked);

  const homeGoals = prediction?.homeGoals ?? null;
  const awayGoals = prediction?.awayGoals ?? null;
  const isCompleted = ko.status === "completed";

  const handleHomeChange = (goals: number) => {
    setPrediction(ko.matchId, goals, awayGoals ?? 0);
  };
  const handleAwayChange = (goals: number) => {
    setPrediction(ko.matchId, homeGoals ?? 0, goals);
  };

  // Border color based on completion
  let resultBorder = "border-transparent";
  if (isCompleted) {
    resultBorder = "border-accent-green/40";
  } else if (homeGoals !== null && awayGoals !== null) {
    if (homeGoals > awayGoals) resultBorder = "border-accent-green/40";
    else if (homeGoals < awayGoals) resultBorder = "border-accent-red/40";
    else resultBorder = "border-accent-gold/40";
  }

  return (
    <div className={`bg-white rounded-lg border ${resultBorder} px-4 py-3 shadow-sm hover:shadow-md transition-shadow`}>
      {/* Top row: R32 badge + date + kickoff */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider bg-accent-gold/10 text-accent-gold px-2 py-0.5 rounded-full">
            {ROUND_LABELS[ko.round] ?? ko.round}
          </span>
          <span className="text-[11px] font-mono text-text-muted">
            {formatKickoffET(ko.kickoffET)}
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
          <ScoreInput value={homeGoals} onChange={handleHomeChange} disabled={locked || isCompleted} />
          <span className="text-text-muted font-medium text-sm">–</span>
          <ScoreInput value={awayGoals} onChange={handleAwayChange} disabled={locked || isCompleted} />
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
              <span className="font-mono font-semibold text-blue-400">
                {modelPred.expectedHomeGoals.toFixed(1)} – {modelPred.expectedAwayGoals.toFixed(1)}
              </span>
            </div>
          )}

          {/* Model score + AET indicator */}
          <div className="mt-1.5 flex items-center justify-center gap-2">
            <span className="text-[10px] uppercase tracking-wider text-blue-400 font-medium">
              Model
            </span>
            <span className="font-mono text-xs font-semibold text-blue-500">
              {modelPred.homeGoals} – {modelPred.awayGoals}
            </span>
            {modelPred.aetLikely && (
              <span className="text-[10px] font-semibold text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded-full border border-amber-200">
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
      {isCompleted && ko.homeGoals != null && ko.awayGoals != null && (
        <div className="mt-1.5 pt-1.5 border-t border-border/50 flex items-center justify-center gap-2">
          <span className="text-[10px] uppercase tracking-wider text-text-muted font-medium">
            Final
          </span>
          <span className="font-mono text-sm font-bold text-text-primary">
            {ko.homeGoals} – {ko.awayGoals}
          </span>
        </div>
      )}
    </div>
  );
}
