import { useEffect, useMemo } from "react";
import { useMonteCarloWorker } from "../../hooks/useMonteCarloWorker";
import { usePredictionStore } from "../../store/predictionStore";
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

function ScoreAccuracy({
  predictions,
}: {
  predictions: Record<string, Prediction>;
}) {
  // Score user predictions against model's most likely scores
  const scoring = useMemo(() => {
    const teamMap = getTeamMap();
    const strengths = calculateStrengthFromElo(teams);
    const strengthMap = new Map(strengths.map((s) => [s.teamId, s]));

    let totalPoints = 0;
    let correctResults = 0;
    let correctScores = 0;
    let matchesScored = 0;

    // For each user prediction, compare against model's most likely score
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
      <h2 className="text-lg font-bold text-text-primary mb-5">
        Score & Accuracy
      </h2>

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
