import { useState } from "react";
import type { Match, Team, Prediction } from "../../types";
import { getFlagClass } from "../../data/flags";
import { formatMatchDate } from "../../data/schedule";
import { useResultsStore } from "../../store/resultsStore";
import { useModelPredictionStore, useBaselinePrediction } from "../../store/modelPredictionStore";
import { getExpertPicksForMatch } from "../../data/expertPicks";
import { getTeamInsights } from "../../data/matchInsights";
import { getOddsForMatch, noVigProbs } from "../../data/matchOdds";
import { getAlphaData } from "../../data/alphametrico";
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
  const baselinePred = useBaselinePrediction(match.id);

  // MD2+ check: does either team already have a matchInsight from a previous match?
  const homeHasForm = getTeamInsights(match.homeTeamId).length > 0;
  const awayHasForm = getTeamInsights(match.awayTeamId).length > 0;
  const isMD2Plus = homeHasForm || awayHasForm;

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

      {/* Expected goals rows (unplayed matches only) */}
      {!actualResult && modelPred && modelPred.expectedHomeGoals != null && (
        isMD2Plus && baselinePred && baselinePred.expectedHomeGoals != null ? (
          <div className="mt-1.5 space-y-0.5">
            <div className="flex items-center justify-center gap-1.5" style={{ fontSize: "0.72rem" }}>
              <span className="text-text-muted font-medium">⚽ Pre-tournament:</span>
              <span className="font-mono font-semibold text-gray-400">
                {baselinePred.expectedHomeGoals.toFixed(1)} – {baselinePred.expectedAwayGoals.toFixed(1)}
              </span>
            </div>
            <div className="flex items-center justify-center gap-1.5" style={{ fontSize: "0.72rem" }}>
              <span className="text-blue-500 font-medium">⚽ Current form:</span>
              <span className="font-mono font-semibold text-blue-400">
                {modelPred.expectedHomeGoals.toFixed(1)} – {modelPred.expectedAwayGoals.toFixed(1)}
              </span>
            </div>
          </div>
        ) : (
          <div className="mt-1.5 flex items-center justify-center gap-1.5" style={{ fontSize: "0.7rem" }}>
            <span className="text-text-muted font-medium">Exp. goals</span>
            <span className="font-mono font-semibold text-blue-400">
              {modelPred.expectedHomeGoals.toFixed(1)} – {modelPred.expectedAwayGoals.toFixed(1)}
            </span>
          </div>
        )
      )}

      {/* Market odds row (unplayed matches only) */}
      <MarketOddsRow matchId={match.id} hasResult={!!actualResult} />

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

      {/* Alpha exact pick — visible pre-match and post-match as calibration */}
      {(() => {
        const alpha = getAlphaData(match.id);
        if (!alpha?.alphaPickExact) return null;
        const outcome = actualResult ? alpha.signalOutcome : null;
        const outcomeBadge =
          outcome === "hit" ? (
            <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-200 whitespace-nowrap">
              ✓ Hit
            </span>
          ) : outcome === "partial" ? (
            <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-yellow-100 text-yellow-700 border border-yellow-200 whitespace-nowrap">
              ~ Partial
            </span>
          ) : outcome === "miss" ? (
            <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-red-100 text-red-600 border border-red-200 whitespace-nowrap">
              ✗ Miss
            </span>
          ) : null;
        return (
          <div className="mt-0.5 flex items-center justify-center gap-2">
            <span className="text-[10px] uppercase tracking-wider text-violet-400 font-medium">
              α Pick
            </span>
            <span className="font-mono text-xs font-semibold text-violet-500">
              {alpha.alphaPickExact.match(/\d+\s*[-–]\s*\d+/)?.[0] ?? alpha.alphaPickExact}
            </span>
            {outcomeBadge}
          </div>
        );
      })()}

      {/* Expert picks row */}
      <ExpertPicksRow matchId={match.id} />

      {/* alphametrico signal — always visible */}
      <AlphaSignalRow matchId={match.id} actualResult={actualResult ?? undefined} />

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

function MarketOddsRow({ matchId, hasResult }: { matchId: string; hasResult: boolean }) {
  if (hasResult) return null;
  const odds = getOddsForMatch(matchId);
  if (!odds) return null;

  const probs = noVigProbs(odds);

  return (
    <div className="mt-1.5 flex items-center justify-center gap-1.5" style={{ fontSize: "0.7rem" }}>
      <span className="text-text-muted font-medium">Market odds</span>
      <span className="text-text-secondary">
        H {(probs.homeWin * 100).toFixed(0)}%
      </span>
      <span className="text-text-muted">|</span>
      <span className="text-text-secondary">
        D {(probs.draw * 100).toFixed(0)}%
      </span>
      <span className="text-text-muted">|</span>
      <span className="text-text-secondary">
        A {(probs.awayWin * 100).toFixed(0)}%
      </span>
      <span className="text-text-muted">({odds.source})</span>
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

function AlphaSignalRow({
  matchId,
  actualResult,
}: {
  matchId: string;
  actualResult?: { homeScore: number; awayScore: number };
}) {
  const [expanded, setExpanded] = useState(false);
  const alpha = getAlphaData(matchId);
  if (!alpha) return null;

  const isPostMatch = !!actualResult;

  // ── Outcome evaluation (post-match only) ──────────────────
  // Prefer manually curated signalOutcome from data; fall back to dynamic computation.
  let alphaOutcome: "hit" | "partial" | "miss" | null = null;
  let alphaOutcomeLabel = "";
  let alphaOutcomeColor = "";

  if (isPostMatch && actualResult) {
    if (alpha.signalOutcome) {
      // Use authoritative manually-set outcome
      alphaOutcome = alpha.signalOutcome;
      if (alphaOutcome === "hit") {
        alphaOutcomeLabel = "✓ Hit";
        alphaOutcomeColor = "bg-green-50 text-green-700 border-green-200";
      } else if (alphaOutcome === "partial") {
        alphaOutcomeLabel = "~ Partial";
        alphaOutcomeColor = "bg-yellow-50 text-yellow-700 border-yellow-200";
      } else {
        alphaOutcomeLabel = "✗ Miss";
        alphaOutcomeColor = "bg-red-50 text-red-600 border-red-200";
      }
    } else {
      // Dynamic fallback when signalOutcome not yet set
      const [pickHome, pickAway] = alpha.alphaPickExact
        .split(/[-–]/)
        .map((s) => parseInt(s.trim(), 10));
      const totalGoals = actualResult.homeScore + actualResult.awayScore;
      const exactHit =
        pickHome === actualResult.homeScore && pickAway === actualResult.awayScore;

      const primarySignal = alpha.topSignals?.[0];
      const primaryLabel = primarySignal?.label?.toLowerCase() ?? "";
      let primaryCorrect = false;

      if (primaryLabel.includes("under 3") && totalGoals < 3) primaryCorrect = true;
      else if (primaryLabel.includes("under 2.5") && totalGoals < 3) primaryCorrect = true;
      else if (primaryLabel.includes("under 2") && totalGoals < 2) primaryCorrect = true;
      else if (primaryLabel.includes("btts no") && !(actualResult.homeScore > 0 && actualResult.awayScore > 0)) primaryCorrect = true;
      else if (primaryLabel.includes("btts yes") && actualResult.homeScore > 0 && actualResult.awayScore > 0) primaryCorrect = true;
      else if (primaryLabel.includes("over 2.5") && totalGoals > 2) primaryCorrect = true;
      else if (primaryLabel.includes("over 3") && totalGoals > 3) primaryCorrect = true;
      else if (primaryLabel.includes("clean sheet") && (actualResult.awayScore === 0 || actualResult.homeScore === 0)) primaryCorrect = true;
      else if (primaryLabel.includes("win by 2") && Math.abs(actualResult.homeScore - actualResult.awayScore) >= 2) primaryCorrect = true;

      if (exactHit) {
        alphaOutcome = "hit";
        alphaOutcomeLabel = "✓ Hit";
        alphaOutcomeColor = "bg-green-50 text-green-700 border-green-200";
      } else if (primaryCorrect) {
        alphaOutcome = "partial";
        alphaOutcomeLabel = "~ Partial";
        alphaOutcomeColor = "bg-yellow-50 text-yellow-700 border-yellow-200";
      } else {
        alphaOutcome = "miss";
        alphaOutcomeLabel = "✗ Miss";
        alphaOutcomeColor = "bg-red-50 text-red-600 border-red-200";
      }
    }
  }

  // Badge color based on divergence
  const badgeStyles = {
    confirmed: "bg-green-100 text-green-700 border border-green-200",
    warning:   "bg-yellow-100 text-yellow-700 border border-yellow-200",
    neutral:   "bg-gray-100 text-gray-500 border border-gray-200",
  } as const;

  const badgeLabels = {
    confirmed: "✓ Confirmed",
    warning:   "⚠ Divergence",
    neutral:   "~ Neutral",
  } as const;

  const dotColor = {
    high:   "bg-green-500",
    medium: "bg-yellow-400",
    low:    "bg-gray-400",
  } as const;

  return (
    <div className={`mt-2 border-t pt-2 ${isPostMatch ? "border-border/30 opacity-90" : "border-border/40"}`}>

      {/* Collapsed row — always visible */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between gap-2 hover:opacity-80 transition-opacity"
      >
        {/* Left: α label + match score */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-text-muted">α</span>
          <span className="text-[10px] font-mono font-bold text-text-secondary">{alpha.matchScore}</span>
        </div>

        {/* Center: radar summary */}
        <span className="flex-1 text-[10px] text-text-muted text-center truncate px-1">
          {alpha.radarSummary}
        </span>

        {/* Right: outcome badge (post-match) or divergence badge (pre-match) */}
        {isPostMatch && alphaOutcome ? (
          <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full border whitespace-nowrap ${alphaOutcomeColor}`}>
            {alphaOutcomeLabel}
          </span>
        ) : (
          <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full whitespace-nowrap ${alpha.divergence ? badgeStyles[alpha.divergence] : ""}`}>
            {alpha.divergence ? badgeLabels[alpha.divergence] : ""}
          </span>
        )}
      </button>

      {/* Expanded panel */}
      {expanded && (
        <div className="mt-2 rounded-lg bg-bg-secondary border border-border/60 p-3 flex flex-col gap-2.5 text-left">

          {/* Post-match outcome summary */}
          {isPostMatch && alphaOutcome && (
            <div className={`rounded px-2 py-1.5 border text-xs ${alphaOutcomeColor}`}>
              <span className="font-semibold">Alpha pick: {alpha.alphaPickExact}</span>
              <span className="mx-1.5 text-text-muted">→</span>
              <span className="font-semibold">Actual: {actualResult?.homeScore}–{actualResult?.awayScore}</span>
              <span className="block mt-0.5 text-[10px] opacity-80">
                {alphaOutcome === "hit"
                  ? "Perfect — exact score matched."
                  : alphaOutcome === "partial"
                  ? "Primary market signal was directionally correct."
                  : "Pick and primary signal did not land."}
              </span>
            </div>
          )}

          {/* Divergence detail */}
          <div>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-text-muted block mb-0.5">
              {isPostMatch ? "Pre-match read" : "Model vs Market"}
            </span>
            <p className="text-xs text-text-secondary leading-snug">{alpha.divergenceNote}</p>
          </div>

          {/* Top signals */}
          <div>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-text-muted block mb-1">
              Key Signals
            </span>
            <div className="flex flex-col gap-1">
              {(alpha.topSignals ?? []).map((sig, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor[sig.confidence]}`} />
                  <span className="text-xs text-text-primary flex-1">{sig.label}</span>
                  <span className="text-[10px] font-mono text-green-600 font-semibold whitespace-nowrap">{sig.ev}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Alpha pick */}
          <div className="border-t border-border/50 pt-2">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-text-muted block mb-0.5">
              Alpha Pick
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-sm font-bold text-text-primary">
                {alpha.alphaPickExact.match(/\d+\s*[-–]\s*\d+/)?.[0] ?? alpha.alphaPickExact}
              </span>
              <span className="text-xs text-text-muted leading-snug">{alpha.alphaPickNote}</span>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
