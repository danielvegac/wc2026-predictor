import { useEffect, useMemo, useState } from "react";
import { useMonteCarloWorker } from "../../hooks/useMonteCarloWorker";
import { usePredictionStore } from "../../store/predictionStore";
import { useResultsStore } from "../../store/resultsStore";
import { useModelPredictionStore } from "../../store/modelPredictionStore";
import { useLiveEloStore } from "../../store/liveEloStore";
import { getFlagClass } from "../../data/flags";
import { getTeamMap, teams } from "../../data/teams";
import { groups } from "../../data/groups";
import { optaPredictions, runHealthCheck } from "../../data/opta";
import { pelePredictions } from "../../data/pele";
import { polymarketPredictions } from "../../data/polymarket";
import { calculateStrengthFromElo } from "../../engine/strengthCalculator";
import { simulateGroup } from "../../engine/groupSimulator";
import { analyzeMatch } from "../../engine/matchSimulator";
import { groupStageSchedule } from "../../data/schedule";
import { scoreMatch } from "../../utils/scoring";
import { expertPicks, calculateExpertAccuracy } from "../../data/expertPicks";
import type { MonteCarloResults, Prediction } from "../../types";

const NUM_SIMS = 10_000;

export function Dashboard() {
  const { results, running, progress, run } = useMonteCarloWorker();
  const predictions = usePredictionStore((s) => s.predictions);
  const getTotalProgress = usePredictionStore((s) => s.getTotalProgress);
  const getGroupStandings = usePredictionStore((s) => s.getGroupStandings);

  const { completed } = getTotalProgress();

  // Auto-run simulation on mount
  useEffect(() => {
    run(NUM_SIMS);
  }, [run]);

  if (running || !results) {
    return <LoadingState progress={progress} />;
  }

  return (
    <div className="flex flex-col gap-8">
      <EloUpdateIndicator />
      <ModelTrackRecord predictions={predictions} />
      <ExpertAccuracyTracker predictions={predictions} />
      <ChampionshipComparison
        results={results}
        getGroupStandings={getGroupStandings}
      />
      <HealthCheck results={results} />
      {completed > 0 && (
        <>
          <GroupStageComparison
            getGroupStandings={getGroupStandings}
          />
          <ScoreAccuracy predictions={predictions} />
        </>
      )}
    </div>
  );
}

// ─── Loading State ──────────────────────────────────────────

function LoadingState({
  progress,
}: {
  progress: { completed: number; total: number } | null;
}) {
  const pct = progress
    ? Math.round((progress.completed / progress.total) * 100)
    : 0;

  return (
    <div className="flex flex-col items-center justify-center py-32 gap-4">
      <div className="w-16 h-16 border-4 border-bg-tertiary border-t-accent-gold rounded-full animate-spin" />
      <p className="text-lg font-bold text-text-primary">
        Running {(progress?.total ?? NUM_SIMS).toLocaleString()} simulations...
      </p>
      {progress && (
        <div className="w-64">
          <div className="h-2 bg-bg-tertiary rounded-full overflow-hidden">
            <div
              className="h-full bg-accent-gold rounded-full transition-all duration-200"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-xs text-text-muted text-center mt-1">
            {progress.completed.toLocaleString()} /{" "}
            {progress.total.toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Model colors & metadata ────────────────────────────────

const MODEL_COLORS = {
  ours: "#3B82F6",
  opta: "#F59E0B",
  pele: "#8B5CF6",
  polymarket: "#10B981",
} as const;

const MODEL_META = [
  { key: "ours", label: "Our Model", color: MODEL_COLORS.ours, source: "10K Poisson/Elo sims" },
  { key: "opta", label: "Opta", color: MODEL_COLORS.opta, source: "25K simulations" },
  { key: "pele", label: "PELE", color: MODEL_COLORS.pele, source: "100K simulations — Nate Silver" },
  { key: "polymarket", label: "Polymarket", color: MODEL_COLORS.polymarket, source: "$1.26B trading volume — live market" },
] as const;

// ─── Elo Update Indicator ──────────────────────────────────

function EloUpdateIndicator() {
  const recentChanges = useLiveEloStore((s) => s.recentChanges);
  const lastSyncAt = useLiveEloStore((s) => s.lastSyncAt);
  const teamMap = getTeamMap();

  if (recentChanges.length === 0) return null;

  const uniqueTeams = new Map<string, { before: number; after: number }>();
  for (const c of recentChanges) {
    uniqueTeams.set(c.teamId, { before: c.before, after: c.after });
  }

  const syncTime = lastSyncAt
    ? new Date(lastSyncAt).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      })
    : "—";

  return (
    <div className="bg-white rounded-xl border border-border shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-text-primary">
            Elo updated: {uniqueTeams.size} team{uniqueTeams.size !== 1 ? "s" : ""}
          </span>
          <span className="text-[10px] text-text-muted">(last sync: {syncTime})</span>
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        {[...uniqueTeams.entries()].map(([teamId, { before, after }]) => {
          const team = teamMap.get(teamId);
          const diff = after - before;
          return (
            <div
              key={teamId}
              className="flex items-center gap-1.5 bg-bg-secondary rounded-lg px-3 py-1.5"
            >
              <span className={`${getFlagClass(teamId)} text-sm`} />
              <span className="text-xs font-medium">{team?.shortName ?? teamId}</span>
              <span className="font-mono text-[10px] text-text-muted">{before}</span>
              <span className="text-text-muted text-xs">&rarr;</span>
              <span className="font-mono text-[10px] font-bold text-text-primary">{after}</span>
              <span
                className={`font-mono text-[10px] font-bold ${
                  diff > 0 ? "text-accent-green" : diff < 0 ? "text-accent-red" : "text-text-muted"
                }`}
              >
                ({diff > 0 ? "+" : ""}{diff})
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Expert Accuracy Tracker ───────────────────────────────

function ExpertAccuracyTracker({
  predictions,
}: {
  predictions: Record<string, Prediction>;
}) {
  const results = useResultsStore((s) => s.results);
  const getResult = useResultsStore((s) => s.getResultForMatch);
  const modelPredictions = useModelPredictionStore((s) => s.predictions);

  const rows = useMemo(() => {
    // Build actual results map
    const actualMap: Record<string, { homeGoals: number; awayGoals: number }> = {};
    for (const match of groupStageSchedule) {
      const actual = getResult(match.id);
      if (actual) {
        actualMap[match.id] = { homeGoals: actual.homeScore, awayGoals: actual.awayScore };
      }
    }

    if (Object.keys(actualMap).length === 0) return null;

    // Expert accuracy
    const expertRows = calculateExpertAccuracy(expertPicks, actualMap);

    // Model accuracy
    let modelCorrect = 0;
    let modelExact = 0;
    let modelTotal = 0;
    for (const [matchId, actual] of Object.entries(actualMap)) {
      const model = modelPredictions[matchId];
      if (!model) continue;
      modelTotal++;
      const mResult = model.homeGoals > model.awayGoals ? "home" : model.homeGoals < model.awayGoals ? "away" : "draw";
      const aResult = actual.homeGoals > actual.awayGoals ? "home" : actual.homeGoals < actual.awayGoals ? "away" : "draw";
      if (mResult === aResult) modelCorrect++;
      if (model.homeGoals === actual.homeGoals && model.awayGoals === actual.awayGoals) modelExact++;
    }

    // User accuracy
    let userCorrect = 0;
    let userExact = 0;
    let userTotal = 0;
    for (const [matchId, actual] of Object.entries(actualMap)) {
      const userPred = predictions[matchId];
      if (!userPred) continue;
      userTotal++;
      const uResult = userPred.homeGoals > userPred.awayGoals ? "home" : userPred.homeGoals < userPred.awayGoals ? "away" : "draw";
      const aResult = actual.homeGoals > actual.awayGoals ? "home" : actual.homeGoals < actual.awayGoals ? "away" : "draw";
      if (uResult === aResult) userCorrect++;
      if (userPred.homeGoals === actual.homeGoals && userPred.awayGoals === actual.awayGoals) userExact++;
    }

    // Combine all rows
    const all: Array<{ source: string; totalPicks: number; correctResults: number; exactScores: number; isSpecial?: string }> = [
      ...expertRows,
    ];

    if (modelTotal > 0) {
      all.push({ source: "Our Model", totalPicks: modelTotal, correctResults: modelCorrect, exactScores: modelExact, isSpecial: "model" });
    }
    if (userTotal > 0) {
      all.push({ source: "You", totalPicks: userTotal, correctResults: userCorrect, exactScores: userExact, isSpecial: "user" });
    }

    // Sort by accuracy % descending
    all.sort((a, b) => {
      const pctA = a.totalPicks > 0 ? a.correctResults / a.totalPicks : 0;
      const pctB = b.totalPicks > 0 ? b.correctResults / b.totalPicks : 0;
      return pctB - pctA;
    });

    return all;
  }, [results, getResult, modelPredictions, predictions]);

  if (!rows || rows.length === 0) return null;

  // Check if any expert pick has a corresponding result
  const hasExpertWithResult = rows.some((r) => !r.isSpecial && r.totalPicks > 0);
  if (!hasExpertWithResult) return null;

  return (
    <div className="bg-white rounded-xl border border-border shadow-sm p-6">
      <h2 className="text-lg font-bold text-text-primary mb-1">
        Expert Accuracy Tracker
      </h2>
      <p className="text-sm text-text-muted mb-5">
        How expert predictions compare against actual results — including our model and your picks.
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-text-secondary">
              <th className="py-2 pr-2 font-medium">Source</th>
              <th className="py-2 px-2 font-medium text-center">Picks</th>
              <th className="py-2 px-2 font-medium text-center">Correct Results</th>
              <th className="py-2 px-2 font-medium text-center">Exact Scores</th>
              <th className="py-2 pl-2 font-medium text-center">Accuracy</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const pct = r.totalPicks > 0 ? ((r.correctResults / r.totalPicks) * 100).toFixed(0) : "—";
              const isModel = (r as { isSpecial?: string }).isSpecial === "model";
              const isUser = (r as { isSpecial?: string }).isSpecial === "user";

              return (
                <tr
                  key={r.source}
                  className={`border-b border-border/30 hover:bg-bg-secondary/50 ${
                    isModel ? "bg-blue-50/50" : isUser ? "bg-accent-gold/5" : ""
                  }`}
                >
                  <td className="py-2 pr-2">
                    <span
                      className={`font-medium ${
                        isModel
                          ? "text-blue-500"
                          : isUser
                          ? "text-accent-gold"
                          : "text-text-primary"
                      }`}
                    >
                      {r.source}
                    </span>
                  </td>
                  <td className="py-2 px-2 text-center font-mono text-xs">{r.totalPicks}</td>
                  <td className="py-2 px-2 text-center font-mono text-xs">{r.correctResults}</td>
                  <td className="py-2 px-2 text-center font-mono text-xs">{r.exactScores}</td>
                  <td className="py-2 pl-2 text-center">
                    <span
                      className={`font-mono text-xs font-bold ${
                        isModel
                          ? "text-blue-500"
                          : isUser
                          ? "text-accent-gold"
                          : "text-text-primary"
                      }`}
                    >
                      {pct}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Section 0: Model Track Record ─────────────────────────

function ModelTrackRecord({
  predictions,
}: {
  predictions: Record<string, Prediction>;
}) {
  const results = useResultsStore((s) => s.results);
  const getResult = useResultsStore((s) => s.getResultForMatch);
  const modelPredictions = useModelPredictionStore((s) => s.predictions);
  const teamMap = getTeamMap();

  const rows = useMemo(() => {
    const out: Array<{
      matchId: string;
      homeTeamId: string;
      awayTeamId: string;
      userHome: number | null;
      userAway: number | null;
      modelHome: number;
      modelAway: number;
      actualHome: number;
      actualAway: number;
      userPts: number;
      modelPts: number;
      userCat: string;
      modelCat: string;
    }> = [];

    for (const match of groupStageSchedule) {
      const actual = getResult(match.id);
      if (!actual) continue;

      const model = modelPredictions[match.id];
      if (!model) continue;

      const userPred = predictions[match.id];

      // Score model vs actual
      const modelScore = scoreMatch(
        { matchId: match.id, homeGoals: model.homeGoals, awayGoals: model.awayGoals, source: "model" },
        { matchId: match.id, homeGoals: actual.homeScore, awayGoals: actual.awayScore, source: "model" }
      );

      // Score user vs actual
      let userPts = 0;
      let userCat = "none";
      if (userPred) {
        const userScore = scoreMatch(
          userPred,
          { matchId: match.id, homeGoals: actual.homeScore, awayGoals: actual.awayScore, source: "model" }
        );
        userPts = userScore.points;
        userCat = userScore.category;
      }

      out.push({
        matchId: match.id,
        homeTeamId: match.homeTeamId,
        awayTeamId: match.awayTeamId,
        userHome: userPred?.homeGoals ?? null,
        userAway: userPred?.awayGoals ?? null,
        modelHome: model.homeGoals,
        modelAway: model.awayGoals,
        actualHome: actual.homeScore,
        actualAway: actual.awayScore,
        userPts,
        modelPts: modelScore.points,
        userCat,
        modelCat: modelScore.category,
      });
    }

    return out;
  }, [predictions, results, getResult, modelPredictions]);

  if (rows.length === 0) return null;

  const userTotal = rows.reduce((s, r) => s + r.userPts, 0);
  const modelTotal = rows.reduce((s, r) => s + r.modelPts, 0);
  const userCorrect = rows.filter((r) => r.userCat !== "wrong" && r.userCat !== "none").length;
  const userExact = rows.filter((r) => r.userCat === "exact").length;
  const modelCorrect = rows.filter((r) => r.modelCat !== "wrong").length;
  const modelExact = rows.filter((r) => r.modelCat === "exact").length;
  const userPredicted = rows.filter((r) => r.userHome !== null).length;

  const diff = userTotal - modelTotal;
  const verdict =
    diff > 0
      ? `You're ahead by ${diff} point${diff !== 1 ? "s" : ""} 🎉`
      : diff < 0
      ? `The model is ahead by ${Math.abs(diff)} point${Math.abs(diff) !== 1 ? "s" : ""}`
      : "It's a tie";

  function catIcon(cat: string) {
    if (cat === "exact") return <span className="text-accent-gold">⭐</span>;
    if (cat === "goal_diff" || cat === "result") return <span className="text-accent-green">✓</span>;
    if (cat === "wrong") return <span className="text-accent-red">✗</span>;
    return <span className="text-text-muted">—</span>;
  }

  return (
    <div className="bg-white rounded-xl border border-border shadow-sm p-6">
      <h2 className="text-lg font-bold text-text-primary mb-1">
        Model Track Record
      </h2>
      <p className="text-sm text-text-muted mb-5">
        Your predictions vs. the model's predictions, scored against actual results.
      </p>

      {/* Match rows */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-text-secondary">
              <th className="py-2 pr-2 font-medium">Match</th>
              <th className="py-2 px-2 font-medium text-center">Your Guess</th>
              <th className="py-2 px-2 font-medium text-center text-blue-500">Model</th>
              <th className="py-2 px-2 font-medium text-center">Actual</th>
              <th className="py-2 px-2 font-medium text-center">You</th>
              <th className="py-2 pl-2 font-medium text-center text-blue-500">Model</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const home = teamMap.get(r.homeTeamId);
              const away = teamMap.get(r.awayTeamId);
              return (
                <tr key={r.matchId} className="border-b border-border/30 hover:bg-bg-secondary/50">
                  <td className="py-2 pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className={`${getFlagClass(r.homeTeamId)} text-sm`} />
                      <span className="text-xs font-medium">{home?.shortName}</span>
                      <span className="text-text-muted text-xs">vs</span>
                      <span className="text-xs font-medium">{away?.shortName}</span>
                      <span className={`${getFlagClass(r.awayTeamId)} text-sm`} />
                    </div>
                  </td>
                  <td className="py-2 px-2 text-center font-mono text-xs">
                    {r.userHome !== null ? `${r.userHome}–${r.userAway}` : "—"}
                  </td>
                  <td className="py-2 px-2 text-center font-mono text-xs text-blue-500">
                    {r.modelHome}–{r.modelAway}
                  </td>
                  <td className="py-2 px-2 text-center font-mono text-xs font-bold">
                    {r.actualHome}–{r.actualAway}
                  </td>
                  <td className="py-2 px-2 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {catIcon(r.userCat)}
                      <span className="font-mono text-xs">{r.userHome !== null ? r.userPts : "—"}</span>
                    </div>
                  </td>
                  <td className="py-2 pl-2 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {catIcon(r.modelCat)}
                      <span className="font-mono text-xs text-blue-500">{r.modelPts}</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Running totals */}
      <div className="mt-5 pt-4 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="text-sm text-text-secondary">
          <span className="font-medium">Your accuracy:</span>{" "}
          {userCorrect}/{userPredicted} correct results, {userExact} exact score{userExact !== 1 ? "s" : ""}
          {" "}— <span className="font-mono font-bold text-accent-gold">{userTotal} pts</span>
        </div>
        <div className="text-sm text-text-secondary">
          <span className="font-medium text-blue-500">Model accuracy:</span>{" "}
          {modelCorrect}/{rows.length} correct results, {modelExact} exact score{modelExact !== 1 ? "s" : ""}
          {" "}— <span className="font-mono font-bold text-blue-500">{modelTotal} pts</span>
        </div>
      </div>

      <div className="mt-3 text-center">
        <span className="text-sm font-bold text-text-primary">{verdict}</span>
      </div>
    </div>
  );
}

// ─── Section 1: Championship Comparison ─────────────────────

function ChampionshipComparison({
  results,
  getGroupStandings,
}: {
  results: MonteCarloResults;
  getGroupStandings: (group: string) => import("../../types").GroupStanding[] | null;
}) {
  const teamMap = getTeamMap();

  // Build lookup maps for all models
  const optaMap = new Map(optaPredictions.map((o) => [o.teamId, o.championshipProb]));
  const peleMap = new Map(pelePredictions.map((p) => [p.teamId, p.championshipProb]));
  const polyMap = new Map(polymarketPredictions.map((p) => [p.teamId, p.championshipProb]));

  // Our model's #1
  const modelSorted = Object.entries(results.championProbs).sort(([, a], [, b]) => b - a);
  const modelFavoriteId = modelSorted[0]?.[0];
  const modelFavoriteProb = modelSorted[0]?.[1] ?? 0;
  const modelFavorite = teamMap.get(modelFavoriteId ?? "");

  // Opta's #1
  const optaSorted = [...optaPredictions].sort((a, b) => b.championshipProb - a.championshipProb);
  const optaFavorite = teamMap.get(optaSorted[0]?.teamId ?? "");
  const optaFavoriteProb = optaSorted[0]?.championshipProb ?? 0;

  // Polymarket's #1
  const polySorted = [...polymarketPredictions].sort((a, b) => b.championshipProb - a.championshipProb);
  const polyFavorite = teamMap.get(polySorted[0]?.teamId ?? "");
  const polyFavoriteProb = polySorted[0]?.championshipProb ?? 0;

  // User's champion pick
  const userChampion = getUserChampionPick(getGroupStandings);
  const userChampionTeam = userChampion ? teamMap.get(userChampion) : null;

  // Top 20 union for bar chart (union of all teams in top 20 of any model)
  const top20Ids = new Set<string>();
  modelSorted.slice(0, 20).forEach(([id]) => top20Ids.add(id));
  optaSorted.slice(0, 20).forEach((o) => top20Ids.add(o.teamId));
  pelePredictions.slice(0, 20).forEach((p) => top20Ids.add(p.teamId));
  polymarketPredictions.slice(0, 20).forEach((p) => top20Ids.add(p.teamId));

  // Sort union by average across all models for chart ordering
  const chartTeams = [...top20Ids]
    .map((id) => ({
      id,
      avg:
        ((results.championProbs[id] ?? 0) * 100 +
          (optaMap.get(id) ?? 0) +
          (peleMap.get(id) ?? 0) +
          (polyMap.get(id) ?? 0)) /
        4,
    }))
    .sort((a, b) => b.avg - a.avg)
    .slice(0, 20);

  const maxProb = Math.max(
    ...chartTeams.map(({ id }) =>
      Math.max(
        (results.championProbs[id] ?? 0) * 100,
        optaMap.get(id) ?? 0,
        peleMap.get(id) ?? 0,
        polyMap.get(id) ?? 0
      )
    )
  );

  // Build 4 independently sorted ranked lists
  const modelTop20 = modelSorted.slice(0, 20).map(([id, p]) => ({ id, pct: p * 100 }));
  const optaTop20 = [...optaPredictions].sort((a, b) => b.championshipProb - a.championshipProb).slice(0, 20).map((o) => ({ id: o.teamId, pct: o.championshipProb }));
  const peleTop20 = [...pelePredictions].sort((a, b) => b.championshipProb - a.championshipProb).slice(0, 20).map((p) => ({ id: p.teamId, pct: p.championshipProb }));
  const polyTop20 = [...polymarketPredictions].sort((a, b) => b.championshipProb - a.championshipProb).slice(0, 20).map((p) => ({ id: p.teamId, pct: p.championshipProb }));

  return (
    <div className="flex flex-col gap-6">
      {/* ── 4-column header ── */}
      <div className="bg-white rounded-xl border border-border shadow-sm p-6">
        <h2 className="text-lg font-bold text-text-primary mb-6">
          Championship Comparison
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Your Pick */}
          <div className="flex flex-col items-center gap-2 p-4 bg-bg-secondary rounded-xl">
            <span className="text-xs font-medium text-text-muted uppercase tracking-wider">
              Your Pick
            </span>
            {userChampionTeam ? (
              <>
                <span className={`${getFlagClass(userChampion!)} text-4xl`} />
                <span className="font-bold text-text-primary text-sm text-center">
                  {userChampionTeam.name}
                </span>
              </>
            ) : (
              <>
                <div className="w-10 h-10 rounded-full bg-bg-tertiary flex items-center justify-center text-text-muted text-lg">
                  ?
                </div>
                <span className="text-text-muted text-xs text-center">
                  Fill in predictions
                </span>
              </>
            )}
          </div>

          {/* Our Model */}
          <div className="flex flex-col items-center gap-2 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <span className="text-xs font-medium uppercase tracking-wider" style={{ color: MODEL_COLORS.ours }}>
              Model Favorite
            </span>
            {modelFavorite && (
              <>
                <span className={`${getFlagClass(modelFavoriteId!)} text-4xl`} />
                <span className="font-bold text-text-primary text-sm text-center">
                  {modelFavorite.name}
                </span>
                <span className="font-mono text-sm font-medium" style={{ color: MODEL_COLORS.ours }}>
                  {(modelFavoriteProb * 100).toFixed(1)}%
                </span>
              </>
            )}
            <span className="text-[10px] text-text-muted">10K Poisson/Elo sims</span>
          </div>

          {/* Opta */}
          <div className="flex flex-col items-center gap-2 p-4 bg-amber-50 rounded-xl border border-amber-100">
            <span className="text-xs font-medium uppercase tracking-wider" style={{ color: MODEL_COLORS.opta }}>
              Opta Supercomputer
            </span>
            {optaFavorite && (
              <>
                <span className={`${getFlagClass(optaSorted[0].teamId)} text-4xl`} />
                <span className="font-bold text-text-primary text-sm text-center">
                  {optaFavorite.name}
                </span>
                <span className="font-mono text-sm font-medium" style={{ color: MODEL_COLORS.opta }}>
                  {optaFavoriteProb.toFixed(1)}%
                </span>
              </>
            )}
            <span className="text-[10px] text-text-muted">25K simulations</span>
          </div>

          {/* Polymarket */}
          <div className="flex flex-col items-center gap-2 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
            <span className="text-xs font-medium uppercase tracking-wider" style={{ color: MODEL_COLORS.polymarket }}>
              Polymarket
            </span>
            {polyFavorite && (
              <>
                <span className={`${getFlagClass(polySorted[0].teamId)} text-4xl`} />
                <span className="font-bold text-text-primary text-sm text-center">
                  {polyFavorite.name}
                </span>
                <span className="font-mono text-sm font-medium" style={{ color: MODEL_COLORS.polymarket }}>
                  {polyFavoriteProb.toFixed(1)}%
                </span>
              </>
            )}
            <span className="text-[10px] text-text-muted">$1.26B trading volume — live market</span>
          </div>
        </div>
      </div>

      {/* ── 4-bar chart ── */}
      <div className="bg-white rounded-xl border border-border shadow-sm p-6">
        <h3 className="text-base font-bold text-text-primary mb-1">
          Championship Probability — 4 Models Compared
        </h3>
        <p className="text-sm text-text-muted mb-4">
          Each bar shows a model's championship probability for that team. Sorted by cross-model average.
        </p>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 mb-4 pb-3 border-b border-border">
          {MODEL_META.map((m) => (
            <div key={m.key} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: m.color }} />
              <span className="text-xs text-text-muted">{m.label}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          {chartTeams.map(({ id }) => {
            const team = teamMap.get(id);
            if (!team) return null;
            const modelPct = (results.championProbs[id] ?? 0) * 100;
            const optaPct = optaMap.get(id) ?? 0;
            const pelePct = peleMap.get(id) ?? 0;
            const polyPct = polyMap.get(id) ?? 0;
            const scale = maxProb > 0 ? 100 / maxProb : 1;

            return (
              <div key={id} className="flex items-center gap-2">
                <span className={`${getFlagClass(id)} text-base shrink-0`} />
                <span className="w-28 text-xs font-medium text-text-primary truncate shrink-0">
                  {team.name}
                </span>
                <div className="flex-1 flex flex-col gap-0.5">
                  <div className="h-2.5 bg-bg-tertiary rounded-sm overflow-hidden">
                    <div className="h-full rounded-sm" style={{ width: `${modelPct * scale}%`, backgroundColor: MODEL_COLORS.ours }} />
                  </div>
                  <div className="h-2.5 bg-bg-tertiary rounded-sm overflow-hidden">
                    <div className="h-full rounded-sm" style={{ width: `${optaPct * scale}%`, backgroundColor: MODEL_COLORS.opta }} />
                  </div>
                  <div className="h-2.5 bg-bg-tertiary rounded-sm overflow-hidden">
                    <div className="h-full rounded-sm" style={{ width: `${pelePct * scale}%`, backgroundColor: MODEL_COLORS.pele }} />
                  </div>
                  <div className="h-2.5 bg-bg-tertiary rounded-sm overflow-hidden">
                    <div className="h-full rounded-sm" style={{ width: `${polyPct * scale}%`, backgroundColor: MODEL_COLORS.polymarket }} />
                  </div>
                </div>
                <div className="w-28 shrink-0 flex flex-col text-right">
                  <span className="font-mono text-[10px]" style={{ color: MODEL_COLORS.ours }}>{modelPct.toFixed(1)}%</span>
                  <span className="font-mono text-[10px]" style={{ color: MODEL_COLORS.opta }}>{optaPct.toFixed(1)}%</span>
                  <span className="font-mono text-[10px]" style={{ color: MODEL_COLORS.pele }}>{pelePct.toFixed(1)}%</span>
                  <span className="font-mono text-[10px]" style={{ color: MODEL_COLORS.polymarket }}>{polyPct.toFixed(1)}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 4 independent ranked lists ── */}
      <div className="bg-white rounded-xl border border-border shadow-sm p-6">
        <h3 className="text-base font-bold text-text-primary mb-1">
          Championship Probability — 4 Models Compared
        </h3>
        <p className="text-sm text-text-muted mb-5">
          Each model ranked independently. Divergences reveal where models disagree — use your football knowledge to judge.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <RankedList title="Our Model Top 20" color={MODEL_COLORS.ours} source="10K Poisson/Elo sims" items={modelTop20} teamMap={teamMap} />
          <RankedList title="Opta Top 20" color={MODEL_COLORS.opta} source="25K simulations" items={optaTop20} teamMap={teamMap} />
          <RankedList title="PELE Top 20" color={MODEL_COLORS.pele} source="100K simulations — Nate Silver" items={peleTop20} teamMap={teamMap} />
          <RankedList title="Polymarket Top 20" color={MODEL_COLORS.polymarket} source="$1.26B trading volume — live market" items={polyTop20} teamMap={teamMap} />
        </div>
      </div>
    </div>
  );
}

function RankedList({
  title,
  color,
  source,
  items,
  teamMap,
}: {
  title: string;
  color: string;
  source: string;
  items: { id: string; pct: number }[];
  teamMap: Map<string, import("../../types").Team>;
}) {
  const maxPct = items[0]?.pct ?? 1;

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="px-3 py-2 border-b border-border" style={{ backgroundColor: `${color}08` }}>
        <h4 className="font-bold text-sm" style={{ color }}>{title}</h4>
        <p className="text-[10px] text-text-muted">{source}</p>
      </div>
      <div className="divide-y divide-border/40">
        {items.map((item, i) => {
          const team = teamMap.get(item.id);
          return (
            <div key={item.id} className="flex items-center gap-1.5 px-2 py-1">
              <span className="w-5 text-right text-[10px] text-text-muted font-mono shrink-0">
                {i + 1}
              </span>
              <span className={`${getFlagClass(item.id)} text-sm shrink-0`} />
              <span className="text-xs font-medium text-text-primary truncate flex-1">
                {team?.shortName ?? item.id}
              </span>
              <div className="w-16 h-1.5 bg-bg-tertiary rounded-full overflow-hidden shrink-0">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${(item.pct / maxPct) * 100}%`, backgroundColor: color }}
                />
              </div>
              <span className="font-mono text-[10px] w-10 text-right shrink-0" style={{ color }}>
                {item.pct.toFixed(1)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Derive user's implicit champion pick from their group predictions.
 * Find the group winner with the best performance across completed groups.
 */
function getUserChampionPick(
  getGroupStandings: (group: string) => import("../../types").GroupStanding[] | null
): string | null {
  let bestTeam: string | null = null;
  let bestScore = -1;

  for (const group of groups) {
    const standings = getGroupStandings(group.name);
    if (!standings) continue;

    const winner = standings[0];
    const score = winner.points * 10 + winner.goalDifference;
    if (score > bestScore) {
      bestScore = score;
      bestTeam = winner.teamId;
    }
  }

  return bestTeam;
}

// ─── Section 2: Model Health Check ──────────────────────────

function HealthCheck({ results }: { results: MonteCarloResults }) {
  const healthResults = useMemo(
    () => runHealthCheck(results.championProbs),
    [results]
  );

  const flagged = healthResults.filter(
    (r) => r.severity === "flag" || r.severity === "mild"
  );
  const teamMap = getTeamMap();

  return (
    <div className="bg-white rounded-xl border border-border shadow-sm p-6">
      <h2 className="text-lg font-bold text-text-primary mb-1">
        Model Health Check — Where we disagree with Opta
      </h2>
      <p className="text-sm text-text-muted mb-5">
        These are teams where our Poisson/Elo model diverges significantly from
        Opta's 25,000-simulation supercomputer. Not errors — just different
        inputs. Use your football knowledge to judge.
      </p>

      {flagged.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-accent-green font-medium">
            All clear — our model closely matches Opta across the board.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="py-2 pr-2 w-8" />
                <th className="py-2 px-2 font-medium text-text-secondary">
                  Team
                </th>
                <th className="py-2 px-2 font-medium text-text-secondary text-right">
                  Our Model
                </th>
                <th className="py-2 px-2 font-medium text-text-secondary text-right">
                  Opta
                </th>
                <th className="py-2 px-2 font-medium text-text-secondary text-right">
                  Difference
                </th>
                <th className="py-2 pl-2 font-medium text-text-secondary text-center">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {flagged.map((r) => {
                const team = teamMap.get(r.teamId);
                return (
                  <tr
                    key={r.teamId}
                    className="border-b border-border/50 hover:bg-bg-secondary/50"
                  >
                    <td className="py-2 pr-2">
                      <span className={`${getFlagClass(r.teamId)} text-base`} />
                    </td>
                    <td className="py-2 px-2 font-medium text-text-primary">
                      {team?.name ?? r.teamId}
                    </td>
                    <td className="py-2 px-2 text-right font-mono text-accent-blue">
                      {r.ourValue.toFixed(1)}%
                    </td>
                    <td className="py-2 px-2 text-right font-mono text-accent-gold">
                      {r.optaValue.toFixed(1)}%
                    </td>
                    <td className="py-2 px-2 text-right font-mono text-text-secondary">
                      {r.divergence > 0 ? "+" : ""}
                      {r.divergence.toFixed(1)}%
                    </td>
                    <td className="py-2 pl-2 text-center">
                      {r.severity === "flag" ? (
                        <span title="Significant divergence (>5%)">🔴</span>
                      ) : (
                        <span title="Mild divergence (>3%)">🟡</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Section 3: Group Stage Comparison ──────────────────────

function GroupStageComparison({
  getGroupStandings,
}: {
  getGroupStandings: (group: string) => import("../../types").GroupStanding[] | null;
}) {
  const teamMap = getTeamMap();

  // Run a single group simulation for model standings
  const modelGroupStandings = useMemo(() => {
    const strengths = calculateStrengthFromElo(teams);
    const strengthMap = new Map(strengths.map((s) => [s.teamId, s]));
    const standings: Record<string, import("../../types").GroupStanding[]> = {};
    for (const group of groups) {
      standings[group.name] = simulateGroup(group.teamIds, teamMap, strengthMap);
    }
    return standings;
  }, [teamMap]);

  // Only show groups where user has complete predictions
  const completedGroups = groups.filter(
    (g) => getGroupStandings(g.name) !== null
  );

  if (completedGroups.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-border shadow-sm p-6">
      <h2 className="text-lg font-bold text-text-primary mb-1">
        Group Stage Comparison
      </h2>
      <p className="text-sm text-text-muted mb-5">
        Your predicted standings vs. the model's predicted standings for
        completed groups.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {completedGroups.map((group) => {
          const userStandings = getGroupStandings(group.name)!;
          const modelStandings = modelGroupStandings[group.name];

          // Build model position map
          const modelPosMap = new Map(
            modelStandings.map((s) => [s.teamId, s.position])
          );

          return (
            <div
              key={group.name}
              className="border border-border rounded-lg p-3"
            >
              <h4 className="font-bold text-sm text-text-primary mb-2">
                Group {group.name}
              </h4>
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-text-muted border-b border-border/50">
                    <th className="py-1 text-left font-medium">Your Pos</th>
                    <th className="py-1 text-left font-medium">Team</th>
                    <th className="py-1 text-right font-medium">Model Pos</th>
                  </tr>
                </thead>
                <tbody>
                  {userStandings.map((s) => {
                    const team = teamMap.get(s.teamId);
                    const modelPos = modelPosMap.get(s.teamId) ?? "-";
                    const match = s.position === modelPos;
                    return (
                      <tr
                        key={s.teamId}
                        className={`border-b border-border/30 ${
                          match ? "bg-accent-green/5" : ""
                        }`}
                      >
                        <td className="py-1.5 font-mono font-medium">
                          {s.position}
                        </td>
                        <td className="py-1.5">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`${getFlagClass(s.teamId)} text-sm`}
                            />
                            <span className="font-medium text-text-primary">
                              {team?.name ?? s.teamId}
                            </span>
                          </div>
                        </td>
                        <td
                          className={`py-1.5 text-right font-mono font-medium ${
                            match
                              ? "text-accent-green"
                              : "text-text-secondary"
                          }`}
                        >
                          {modelPos}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Section 4: Score & Accuracy ────────────────────────────

interface ScoringResult {
  totalPoints: number;
  correctResults: number;
  correctScores: number;
  matchesScored: number;
}

function useModelScoring(predictions: Record<string, Prediction>): ScoringResult {
  return useMemo(() => {
    const teamMap = getTeamMap();
    const strengths = calculateStrengthFromElo(teams);
    const strengthMap = new Map(strengths.map((s) => [s.teamId, s]));

    let totalPoints = 0;
    let correctResults = 0;
    let correctScores = 0;
    let matchesScored = 0;

    for (const [matchId, userPred] of Object.entries(predictions)) {
      const match = groupStageSchedule.find((m) => m.id === matchId);
      if (!match) continue;

      const homeTeam = teamMap.get(match.homeTeamId);
      const awayTeam = teamMap.get(match.awayTeamId);
      const homeStr = strengthMap.get(match.homeTeamId);
      const awayStr = strengthMap.get(match.awayTeamId);
      if (!homeTeam || !awayTeam || !homeStr || !awayStr) continue;

      const simResult = analyzeMatch(matchId, homeTeam, awayTeam, homeStr, awayStr);
      const modelPred: Prediction = {
        matchId,
        homeGoals: simResult.mostLikelyScore[0],
        awayGoals: simResult.mostLikelyScore[1],
        source: "model",
      };

      const score = scoreMatch(userPred, modelPred);
      totalPoints += score.points;
      if (score.category !== "wrong") correctResults++;
      if (score.category === "exact") correctScores++;
      matchesScored++;
    }

    return { totalPoints, correctResults, correctScores, matchesScored };
  }, [predictions]);
}

function useActualScoring(predictions: Record<string, Prediction>): ScoringResult & { hasActual: boolean } {
  const results = useResultsStore((s) => s.results);
  const getResult = useResultsStore((s) => s.getResultForMatch);

  return useMemo(() => {
    let totalPoints = 0;
    let correctResults = 0;
    let correctScores = 0;
    let matchesScored = 0;

    for (const [matchId, userPred] of Object.entries(predictions)) {
      const actual = getResult(matchId);
      if (!actual) continue;

      const actualPred: Prediction = {
        matchId,
        homeGoals: actual.homeScore,
        awayGoals: actual.awayScore,
        source: "model",
      };

      const score = scoreMatch(userPred, actualPred);
      totalPoints += score.points;
      if (score.category !== "wrong") correctResults++;
      if (score.category === "exact") correctScores++;
      matchesScored++;
    }

    return {
      totalPoints,
      correctResults,
      correctScores,
      matchesScored,
      hasActual: results.some((r) => r.completed),
    };
  }, [predictions, results, getResult]);
}

function ScoreAccuracy({
  predictions,
}: {
  predictions: Record<string, Prediction>;
}) {
  const [mode, setMode] = useState<"model" | "actual">("model");
  const modelScoring = useModelScoring(predictions);
  const actualScoring = useActualScoring(predictions);

  const scoring = mode === "actual" && actualScoring.hasActual ? actualScoring : modelScoring;

  if (scoring.matchesScored === 0) return null;

  const maxPoints = 586;
  const pct = (scoring.totalPoints / maxPoints) * 100;

  let message: string;
  if (pct > 80) message = "You might actually be a football genius 🧠";
  else if (pct > 60)
    message = "Solid predictions — your football knowledge shows";
  else if (pct > 40)
    message = "Decent start — the model respects your picks";
  else message = "The math is beating you right now 😅";

  return (
    <div className="bg-white rounded-xl border border-border shadow-sm p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-text-primary">
          Score & Accuracy
        </h2>

        {/* Mode toggle */}
        {actualScoring.hasActual && (
          <div className="flex bg-bg-secondary rounded-lg p-0.5">
            <button
              onClick={() => setMode("model")}
              className={`text-xs px-3 py-1 rounded-md cursor-pointer transition-colors ${
                mode === "model"
                  ? "bg-white text-text-primary font-medium shadow-sm"
                  : "text-text-muted hover:text-text-secondary"
              }`}
            >
              vs Model
            </button>
            <button
              onClick={() => setMode("actual")}
              className={`text-xs px-3 py-1 rounded-md cursor-pointer transition-colors ${
                mode === "actual"
                  ? "bg-white text-text-primary font-medium shadow-sm"
                  : "text-text-muted hover:text-text-secondary"
              }`}
            >
              vs Actual Results
            </button>
          </div>
        )}
      </div>

      {mode === "actual" && (
        <p className="text-xs text-text-muted mb-4">
          Scoring your predictions against real match results ({actualScoring.matchesScored} completed matches)
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="text-center p-4 bg-bg-secondary rounded-xl">
          <p className="text-3xl font-extrabold font-mono text-accent-gold">
            {scoring.totalPoints}
          </p>
          <p className="text-xs text-text-muted mt-1">Total Points</p>
        </div>
        <div className="text-center p-4 bg-bg-secondary rounded-xl">
          <p className="text-3xl font-extrabold font-mono text-accent-green">
            {scoring.correctResults}
          </p>
          <p className="text-xs text-text-muted mt-1">Correct Results</p>
        </div>
        <div className="text-center p-4 bg-bg-secondary rounded-xl">
          <p className="text-3xl font-extrabold font-mono text-accent-blue">
            {scoring.correctScores}
          </p>
          <p className="text-xs text-text-muted mt-1">Exact Scores</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-text-muted mb-1.5">
          <span>{scoring.totalPoints} pts</span>
          <span>{maxPoints} max</span>
        </div>
        <div className="h-3 bg-bg-tertiary rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.min(pct, 100)}%`,
              background: "linear-gradient(90deg, #F59E0B, #10B981)",
            }}
          />
        </div>
      </div>

      <p className="text-sm text-text-secondary text-center italic">
        {message}
      </p>
    </div>
  );
}
