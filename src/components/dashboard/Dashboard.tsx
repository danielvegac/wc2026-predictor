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
import { indexBy, toMap, sortByDesc } from "../../utils/collections";
import { extractScoreline } from "../../utils/matchResult";
import { matchInsights, getTeamFormMultipliers } from "../../data/matchInsights";
import { EngineDiagnosticsPanel } from "./EngineDiagnosticsPanel";
import { SignalAccuracyTracker } from "./SignalAccuracyTracker";
import { calculateFormRankings } from "../../engine/formRankingEngine";
import { formOverrides } from "../../data/formOverrides";
import {
  Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ComposedChart, Line,
} from "recharts";
import type { TooltipContentProps } from "recharts";
import type { ValueType, NameType } from "recharts/types/component/DefaultTooltipContent";
import { getAlphaData } from "../../data/alphametrico";
import { knockoutMatches } from "../../data/knockoutMatches";
import { getAlphaResultForMatch } from "../../data/alphaMatchOutcomes";
import { bracketPick, actualFinalResults, computeTournamentBonus } from "../../data/tournamentBonus";
import {
  poolTotalParticipants,
  danielOfficialScore,
  danielOfficialRank,
  computeQuinielaPlacement,
} from "../../data/quinielaPoolBenchmark";
import type { MonteCarloResults, Prediction, Stage } from "../../types";
import {
  getMatchDateStageMap,
  formatShortDate,
  aggregateByMatchday,
  aggregateByStage,
  STAGE_ORDER,
  STAGE_LABELS,
  type AggregatedChartPoint,
} from "../../utils/trackRecordAggregation";

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
      <SignalAccuracyTracker />
      <FormInsights />
      <TournamentFormRankings />
      <EngineDiagnosticsPanel />
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
    <div className="bg-bg-secondary rounded-xl border border-border p-4">
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

// ─── Form Insights ────────────────────────────────────────

// ─── Tournament Form Power Rankings ──────────────────────────

function TournamentFormRankings() {
  const teamMap = getTeamMap();
  const liveEloStore = useLiveEloStore();
  const [showAll, setShowAll] = useState(false);

  const rankings = useMemo(() => {
    const baselineElo: Record<string, number> = {};
    for (const t of teams) {
      baselineElo[t.id] = t.eloRating;
    }

    return calculateFormRankings(
      teams,
      matchInsights,
      liveEloStore.ratings,
      baselineElo,
      formOverrides
    );
  }, [liveEloStore.ratings]);

  const displayedRankings = showAll ? rankings : rankings.slice(0, 20);

  function getScoreColor(score: number) {
    if (score > 65) return "bg-accent-green/20 text-accent-green";
    if (score >= 40) return "bg-yellow-100 text-yellow-700";
    return "bg-red-100 text-red-600";
  }

  function getScoreBarWidth(score: number) {
    return `${Math.max(4, score)}%`;
  }

  function getScoreBarColor(score: number) {
    if (score > 65) return "bg-accent-green";
    if (score >= 40) return "bg-yellow-500";
    return "bg-red-500";
  }

  function getTrend(teamId: string) {
    const baseline = teams.find((t) => t.id === teamId)?.eloRating ?? 1500;
    const live = liveEloStore.ratings[teamId] ?? baseline;
    const delta = live - baseline;
    if (delta > 10) return <span className="text-accent-green font-bold">↑</span>;
    if (delta < -10) return <span className="text-accent-red font-bold">↓</span>;
    return <span className="text-text-muted">→</span>;
  }

  return (
    <div className="bg-bg-secondary rounded-xl border border-border p-6">
      <h2 className="text-lg font-bold text-text-primary mb-1">
        Tournament Form Power Rankings
      </h2>
      <p className="text-sm text-text-muted mb-5">
        Based on xG performance, results, and Elo change. All 48 teams ranked by current World Cup form.
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-text-secondary">
              <th className="py-2 pr-1 font-medium w-8 text-center">#</th>
              <th className="py-2 px-2 font-medium">Team</th>
              <th className="py-2 px-2 font-medium text-center w-36">Score</th>
              <th className="py-2 px-2 font-medium text-center w-16">MP</th>
              <th className="py-2 px-2 font-medium text-center w-12">Trend</th>
              <th className="py-2 pl-2 font-medium">Note</th>
            </tr>
          </thead>
          <tbody>
            {displayedRankings.map((r, idx) => {
              const team = teamMap.get(r.teamId);
              const note = r.manualNote
                ? r.manualNote.length > 60 ? r.manualNote.slice(0, 57) + "..." : r.manualNote
                : "";

              return (
                <tr key={r.teamId} className="border-b border-border/30 hover:bg-bg-secondary/50">
                  <td className="py-2 pr-1 text-center font-mono text-xs text-text-muted">
                    {idx + 1}
                  </td>
                  <td className="py-2 px-2">
                    <div className="flex items-center gap-1.5">
                      <span className={`${getFlagClass(r.teamId)} text-sm`} />
                      <span className="font-medium text-text-primary text-xs">
                        {team?.name ?? r.teamId}
                      </span>
                    </div>
                  </td>
                  <td className="py-2 px-2">
                    {r.matchesPlayed === 0 ? (
                      <span className="text-xs text-text-muted">--</span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-3 bg-bg-secondary rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${getScoreBarColor(r.finalScore)}`}
                            style={{ width: getScoreBarWidth(r.finalScore) }}
                          />
                        </div>
                        <span className={`font-mono text-xs font-bold px-1.5 py-0.5 rounded ${getScoreColor(r.finalScore)}`}>
                          {r.finalScore.toFixed(0)}
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="py-2 px-2 text-center font-mono text-xs">
                    {r.matchesPlayed || "--"}
                  </td>
                  <td className="py-2 px-2 text-center">
                    {r.matchesPlayed > 0 ? getTrend(r.teamId) : <span className="text-text-muted">--</span>}
                  </td>
                  <td className="py-2 pl-2 text-xs text-text-muted max-w-xs truncate">
                    {r.matchesPlayed === 0 ? "Not yet played" : note}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {!showAll && rankings.length > 20 && (
        <button
          onClick={() => setShowAll(true)}
          className="mt-4 w-full py-2 text-sm font-medium text-text-secondary hover:text-text-primary bg-bg-secondary hover:bg-bg-secondary/80 rounded-lg transition-colors"
        >
          Show all {rankings.length} teams
        </button>
      )}
      {showAll && (
        <button
          onClick={() => setShowAll(false)}
          className="mt-4 w-full py-2 text-sm font-medium text-text-secondary hover:text-text-primary bg-bg-secondary hover:bg-bg-secondary/80 rounded-lg transition-colors"
        >
          Show top 20 only
        </button>
      )}
    </div>
  );
}

function FormInsights() {
  const teamMap = getTeamMap();

  const rows = useMemo(() => {
    // Collect all unique teams that have played
    const teamIds = new Set<string>();
    for (const insight of matchInsights) {
      teamIds.add(insight.homeTeamId);
      teamIds.add(insight.awayTeamId);
    }

    return [...teamIds]
      .map((teamId) => {
        const team = teamMap.get(teamId);
        const mults = getTeamFormMultipliers(teamId);
        const attackDelta = (mults.attackMultiplier - 1) * 100;
        const defenseDelta = (mults.defenseMultiplier - 1) * 100;
        const matchCount = matchInsights.filter(
          (m) => m.homeTeamId === teamId || m.awayTeamId === teamId
        ).length;

        // Get latest note for this team
        const latestInsight = [...matchInsights]
          .reverse()
          .find((m) => m.homeTeamId === teamId || m.awayTeamId === teamId);
        const note = latestInsight?.notes ?? "";

        return {
          teamId,
          teamName: team?.name ?? teamId,
          matchCount,
          attackDelta,
          defenseDelta,
          totalAbsAdjust: Math.abs(attackDelta) + Math.abs(defenseDelta),
          note: note.length > 80 ? note.slice(0, 77) + "..." : note,
        };
      })
      .sort((a, b) => b.totalAbsAdjust - a.totalAbsAdjust);
  }, [teamMap]);

  if (rows.length === 0) return null;

  function deltaArrow(delta: number, invert = false) {
    // For defense, lower is better — so invert the color logic
    const threshold = 10;
    const isPositive = invert ? delta < -threshold : delta > threshold;
    const isNegative = invert ? delta > threshold : delta < -threshold;

    if (isPositive) return <span className="text-accent-green font-bold">↑</span>;
    if (isNegative) return <span className="text-accent-red font-bold">↓</span>;
    return <span className="text-text-muted">→</span>;
  }

  return (
    <div className="bg-bg-secondary rounded-xl border border-border p-6">
      <h2 className="text-lg font-bold text-text-primary mb-1">
        Tournament Form Insights
      </h2>
      <p className="text-sm text-text-muted mb-5">
        How the tournament is reshaping our model — performance adjustments from actual matches.
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-text-secondary">
              <th className="py-2 pr-2 font-medium">Team</th>
              <th className="py-2 px-2 font-medium text-center">Matches</th>
              <th className="py-2 px-2 font-medium text-center">Attack Δ</th>
              <th className="py-2 px-2 font-medium text-center">Defense Δ</th>
              <th className="py-2 pl-2 font-medium">Key Insight</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.teamId} className="border-b border-border/30 hover:bg-bg-secondary/50">
                <td className="py-2 pr-2">
                  <div className="flex items-center gap-1.5">
                    <span className={`${getFlagClass(r.teamId)} text-sm`} />
                    <span className="font-medium text-text-primary text-xs">
                      {r.teamName}
                    </span>
                  </div>
                </td>
                <td className="py-2 px-2 text-center font-mono text-xs">{r.matchCount}</td>
                <td className="py-2 px-2 text-center">
                  <div className="flex items-center justify-center gap-1">
                    {deltaArrow(r.attackDelta)}
                    <span
                      className={`font-mono text-xs font-bold ${
                        r.attackDelta > 10
                          ? "text-accent-green"
                          : r.attackDelta < -10
                          ? "text-accent-red"
                          : "text-text-secondary"
                      }`}
                    >
                      {r.attackDelta > 0 ? "+" : ""}{r.attackDelta.toFixed(0)}%
                    </span>
                  </div>
                </td>
                <td className="py-2 px-2 text-center">
                  <div className="flex items-center justify-center gap-1">
                    {deltaArrow(r.defenseDelta, true)}
                    <span
                      className={`font-mono text-xs font-bold ${
                        r.defenseDelta < -10
                          ? "text-accent-green"
                          : r.defenseDelta > 10
                          ? "text-accent-red"
                          : "text-text-secondary"
                      }`}
                    >
                      {r.defenseDelta > 0 ? "+" : ""}{r.defenseDelta.toFixed(0)}%
                    </span>
                  </div>
                </td>
                <td className="py-2 pl-2 text-xs text-text-muted max-w-xs truncate">
                  {r.note}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Section 0: Model Track Record ─────────────────────────

function UserGuessCell({
  matchId,
  storedHome,
  storedAway,
  draft,
  onDraftChange,
  onCommit,
}: {
  matchId: string;
  storedHome: number | null;
  storedAway: number | null;
  userIsExact: boolean;
  userIsResult: boolean;
  userPts: number;
  userBreakdown: string;
  draft: { home: string; away: string } | undefined;
  onDraftChange: (home: string, away: string) => void;
  onCommit: (home: number, away: number) => void;
}) {
  const homeVal = draft?.home ?? (storedHome !== null ? String(storedHome) : "");
  const awayVal = draft?.away ?? (storedAway !== null ? String(storedAway) : "");

  const inputClass =
    "font-mono text-xs text-center bg-transparent border-b border-border w-7 outline-none focus:border-accent-gold transition-colors";

  function handleBlur(side: "home" | "away", value: string, otherValue: string) {
    const parsed = parseInt(value, 10);
    const otherParsed = parseInt(otherValue, 10);
    const clamped = isNaN(parsed) ? (side === "home" ? (storedHome ?? 0) : (storedAway ?? 0)) : Math.min(9, Math.max(0, parsed));
    const otherClamped = isNaN(otherParsed) ? (side === "home" ? (storedAway ?? 0) : (storedHome ?? 0)) : Math.min(9, Math.max(0, otherParsed));
    const finalHome = side === "home" ? clamped : otherClamped;
    const finalAway = side === "away" ? clamped : otherClamped;
    onCommit(finalHome, finalAway);
  }

  return (
    <div className="flex items-center gap-1">
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]"
        value={homeVal}
        placeholder="–"
        className={inputClass}
        onChange={(e) => onDraftChange(e.target.value, awayVal)}
        onBlur={(e) => handleBlur("home", e.target.value, awayVal)}
        aria-label={`Home goals for ${matchId}`}
      />
      <span className="text-text-muted text-xs">–</span>
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]"
        value={awayVal}
        placeholder="–"
        className={inputClass}
        onChange={(e) => onDraftChange(homeVal, e.target.value)}
        onBlur={(e) => handleBlur("away", e.target.value, homeVal)}
        aria-label={`Away goals for ${matchId}`}
      />
    </div>
  );
}

function ModelTrackRecord({
  predictions,
}: {
  predictions: Record<string, Prediction>;
}) {
  const results = useResultsStore((s) => s.results);
  const getResult = useResultsStore((s) => s.getResultForMatch);
  const modelPredictions = useModelPredictionStore((s) => s.predictions);
  const overridePrediction = usePredictionStore((s) => s.overridePrediction);
  const teamMap = getTeamMap();

  // Local draft state for inputs while typing
  const [drafts, setDrafts] = useState<Record<string, { home: string; away: string }>>({});
  const [stageFilter, setStageFilter] = useState<Stage | "all">("all");

  const rows = useMemo(() => {
    const dateStageMap = getMatchDateStageMap();

    const out: Array<{
      matchId: string;
      date: string;
      stage: Stage;
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
      alphaPick: string | null;
      alphaPts: number | null;
      alphaIsExact: boolean;
      alphaIsResult: boolean;
      userBreakdown: string;
      modelBreakdown: string;
      userIsExact: boolean;
      userIsResult: boolean;
      modelIsExact: boolean;
      modelIsResult: boolean;
      alphaResultCorrect: boolean | null;
    }> = [];

    // Build a lookup of matchInsights by matchId for fallback actual scores
    const insightsByMatch = new Map(
      matchInsights.map((mi) => [mi.matchId, mi])
    );

    // Sort matches chronologically by date, then by kickoff time within each day
    const parseTime = (t: string) => {
      const [time, period] = t.split(" ");
      const [h, m] = time.split(":").map(Number);
      return (period === "PM" && h !== 12 ? h + 12 : period === "AM" && h === 12 ? 0 : h) * 60 + m;
    };
    const sortedSchedule = [...groupStageSchedule].sort((a, b) => {
      const dateDiff = new Date(a.date).getTime() - new Date(b.date).getTime();
      if (dateDiff !== 0) return dateDiff;
      return parseTime(a.kickoffCOT ?? "23:59 PM") - parseTime(b.kickoffCOT ?? "23:59 PM");
    });

    for (const match of sortedSchedule) {
      // Use ESPN result if available, otherwise fall back to matchInsights
      const espnResult = getResult(match.id);
      const insight = insightsByMatch.get(match.id);
      const actualHome = espnResult?.homeScore ?? insight?.homeGoals;
      const actualAway = espnResult?.awayScore ?? insight?.awayGoals;
      if (actualHome == null || actualAway == null) continue;

      const model = modelPredictions[match.id];
      if (!model) continue;

      const userPred = predictions[match.id];
      const actualPred = { matchId: match.id, homeGoals: actualHome, awayGoals: actualAway, source: "model" as const };

      // Score model vs actual
      const mb = scoreMatch(
        { matchId: match.id, homeGoals: model.homeGoals, awayGoals: model.awayGoals, source: "model" },
        actualPred
      );

      // Score user vs actual
      let userPts = 0;
      let userBreakdown = "";
      let userIsExact = false;
      let userIsResult = false;
      if (userPred) {
        const ub = scoreMatch(userPred, actualPred);
        userPts = ub.totalPoints;
        userIsExact = ub.isExactScore;
        userIsResult = ub.isCorrectResult;
        const parts: string[] = [];
        if (ub.exactScorePoints) parts.push(`${ub.exactScorePoints} exact`);
        if (ub.resultPoints) parts.push(`${ub.resultPoints} result`);
        if (ub.homeGoalsPoints || ub.awayGoalsPoints)
          parts.push(`${ub.homeGoalsPoints + ub.awayGoalsPoints} goals`);
        userBreakdown = parts.join(" + ");
      }

      const mParts: string[] = [];
      if (mb.exactScorePoints) mParts.push(`${mb.exactScorePoints} exact`);
      if (mb.resultPoints) mParts.push(`${mb.resultPoints} result`);
      if (mb.homeGoalsPoints || mb.awayGoalsPoints)
        mParts.push(`${mb.homeGoalsPoints + mb.awayGoalsPoints} goals`);

      // Alpha pick scoring
      let alphaPick: string | null = null;
      let alphaPts: number | null = null;
      let alphaIsExact = false;
      let alphaIsResult = false;
      const alphaData = getAlphaData(match.id);
      if (alphaData?.alphaPickExact) {
        alphaPick = alphaData.alphaPickExact;
        // Parse "1-0 Argentina" style: extract the two numbers
        const nums = alphaData.alphaPickExact.match(/(\d+)\s*[-–]\s*(\d+)/);
        if (nums) {
          // The score in alphaPickExact is written as "homeGoals-awayGoals teamName"
          // but sometimes it's "awayGoals-homeGoals awayTeam" — we just score it
          // as the two numbers in order against actual home-away
          const ab = scoreMatch(
            { matchId: match.id, homeGoals: parseInt(nums[1]), awayGoals: parseInt(nums[2]), source: "model" },
            actualPred
          );
          alphaPts = ab.totalPoints;
          alphaIsExact = ab.isExactScore;
          alphaIsResult = ab.isCorrectResult;
        }
      }

      const dsInfo = dateStageMap.get(match.id);
      if (!dsInfo) console.warn(`[ModelTrackRecord] missing date/stage for match ${match.id}`);

      out.push({
        matchId: match.id,
        date: dsInfo?.date ?? match.date,
        stage: dsInfo?.stage ?? match.stage,
        homeTeamId: match.homeTeamId,
        awayTeamId: match.awayTeamId,
        userHome: userPred?.homeGoals ?? null,
        userAway: userPred?.awayGoals ?? null,
        modelHome: model.homeGoals,
        modelAway: model.awayGoals,
        actualHome,
        actualAway,
        userPts,
        modelPts: mb.totalPoints,
        alphaPick,
        alphaPts,
        alphaIsExact,
        alphaIsResult,
        userBreakdown,
        modelBreakdown: mParts.join(" + "),
        userIsExact,
        userIsResult,
        modelIsExact: mb.isExactScore,
        modelIsResult: mb.isCorrectResult,
        alphaResultCorrect: null, // Alpha Result tracker only covers R32+
      });
    }

    // --- Knockout matches (completed; ESPN live result first, static fallback) ---
    const completedKO = knockoutMatches
      .map((ko) => {
        const espnResult = getResult(ko.matchId);
        const actualHome = espnResult?.homeScore ?? ko.homeGoals;
        const actualAway = espnResult?.awayScore ?? ko.awayGoals;
        return { ko, actualHome, actualAway };
      })
      .filter(
        (x): x is { ko: typeof x.ko; actualHome: number; actualAway: number } =>
          x.actualHome != null && x.actualAway != null
      )
      .sort((a, b) => new Date(a.ko.date).getTime() - new Date(b.ko.date).getTime());

    for (const { ko, actualHome, actualAway } of completedKO) {
      const model = modelPredictions[ko.matchId];
      if (!model) continue;

      const userPred = predictions[ko.matchId];
      const actualPred = { matchId: ko.matchId, homeGoals: actualHome, awayGoals: actualAway, source: "model" as const };

      const mb = scoreMatch(
        { matchId: ko.matchId, homeGoals: model.homeGoals, awayGoals: model.awayGoals, source: "model" },
        actualPred
      );

      let userPts = 0;
      let userBreakdown = "";
      let userIsExact = false;
      let userIsResult = false;
      if (userPred) {
        const ub = scoreMatch(userPred, actualPred);
        userPts = ub.totalPoints;
        userIsExact = ub.isExactScore;
        userIsResult = ub.isCorrectResult;
        const parts: string[] = [];
        if (ub.exactScorePoints) parts.push(`${ub.exactScorePoints} exact`);
        if (ub.resultPoints) parts.push(`${ub.resultPoints} result`);
        if (ub.homeGoalsPoints || ub.awayGoalsPoints)
          parts.push(`${ub.homeGoalsPoints + ub.awayGoalsPoints} goals`);
        userBreakdown = parts.join(" + ");
      }

      const mParts: string[] = [];
      if (mb.exactScorePoints) mParts.push(`${mb.exactScorePoints} exact`);
      if (mb.resultPoints) mParts.push(`${mb.resultPoints} result`);
      if (mb.homeGoalsPoints || mb.awayGoalsPoints)
        mParts.push(`${mb.homeGoalsPoints + mb.awayGoalsPoints} goals`);

      const koDsInfo = dateStageMap.get(ko.matchId);
      if (!koDsInfo) console.warn(`[ModelTrackRecord] missing date/stage for match ${ko.matchId}`);

      out.push({
        matchId: ko.matchId,
        date: koDsInfo?.date ?? ko.date,
        stage: koDsInfo?.stage ?? "round32",
        homeTeamId: ko.homeTeamId,
        awayTeamId: ko.awayTeamId,
        userHome: userPred?.homeGoals ?? null,
        userAway: userPred?.awayGoals ?? null,
        modelHome: model.homeGoals,
        modelAway: model.awayGoals,
        actualHome,
        actualAway,
        userPts,
        modelPts: mb.totalPoints,
        alphaPick: null,
        alphaPts: null,
        alphaIsExact: false,
        alphaIsResult: false,
        userBreakdown,
        modelBreakdown: mParts.join(" + "),
        userIsExact,
        userIsResult,
        modelIsExact: mb.isExactScore,
        modelIsResult: mb.isCorrectResult,
        alphaResultCorrect: getAlphaResultForMatch(ko.matchId)?.correct ?? null,
      });
    }

    return out;
  }, [predictions, results, getResult, modelPredictions]);

  if (rows.length === 0) return null;

  const filteredRows = stageFilter === "all" ? rows : rows.filter((r) => r.stage === stageFilter);

  const tournamentBonus = computeTournamentBonus(bracketPick, actualFinalResults);

  const userTotal = rows.reduce((s, r) => s + r.userPts, 0) + tournamentBonus.totalBonusPoints;
  const modelTotal = rows.reduce((s, r) => s + r.modelPts, 0) + tournamentBonus.totalBonusPoints;
  const alphaTotal = rows.reduce((s, r) => s + (r.alphaPts ?? 0), 0);
  const userCorrect = rows.filter((r) => r.userIsResult).length;
  const userExact = rows.filter((r) => r.userIsExact).length;
  const modelCorrect = rows.filter((r) => r.modelIsResult).length;
  const modelExact = rows.filter((r) => r.modelIsExact).length;
  const alphaCorrect = rows.filter((r) => r.alphaIsResult).length;
  const alphaExact = rows.filter((r) => r.alphaIsExact).length;
  const alphaPicked = rows.filter((r) => r.alphaPts !== null).length;
  const userPredicted = rows.filter((r) => r.userHome !== null).length;
  const maxPts = rows.length * 9 + 30;

  const alphaResultTracked = rows.filter((r) => r.alphaResultCorrect !== null);
  const alphaResultCorrectCount = alphaResultTracked.filter((r) => r.alphaResultCorrect === true).length;
  const alphaResultPct = alphaResultTracked.length > 0
    ? (alphaResultCorrectCount / alphaResultTracked.length) * 100
    : 0;

  const diff = userTotal - modelTotal;
  const verdict =
    diff > 0
      ? `You're ahead by ${diff} point${diff !== 1 ? "s" : ""}`
      : diff < 0
      ? `The model is ahead by ${Math.abs(diff)} point${Math.abs(diff) !== 1 ? "s" : ""}`
      : "It's a tie";

  function ptsIcon(isExact: boolean, isResult: boolean, hasPred: boolean) {
    if (!hasPred) return <span className="text-text-muted">—</span>;
    if (isExact) return <span className="text-accent-gold">⭐</span>;
    if (isResult) return <span className="text-accent-green">✓</span>;
    return <span className="text-accent-red">✗</span>;
  }

  return (
    <div className="bg-bg-secondary rounded-xl border border-border p-6">
      <h2 className="text-lg font-bold text-text-primary mb-1">
        Model Track Record
      </h2>
      <p className="text-sm text-text-muted mb-5">
        Your predictions vs. the model — quiniela scoring (max 9 pts/match).
      </p>

      {/* Stage filter */}
      <div className="flex items-center gap-2 mb-3">
        <label htmlFor="track-record-stage-filter" className="text-xs font-medium text-text-secondary">
          Stage:
        </label>
        <select
          id="track-record-stage-filter"
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value as Stage | "all")}
          className="text-xs bg-bg-tertiary border border-border rounded-md px-2 py-1 text-text-primary outline-none focus:border-accent-gold transition-colors"
        >
          <option value="all">All</option>
          {STAGE_ORDER.map((s) => (
            <option key={s} value={s}>
              {STAGE_LABELS[s]}
            </option>
          ))}
        </select>
        {stageFilter !== "all" && (
          <span className="text-xs text-text-muted">
            {filteredRows.length} of {rows.length} matches
          </span>
        )}
      </div>

      {/* Match rows */}
      <div className="overflow-auto max-h-[600px]">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10 bg-bg-secondary">
            <tr className="border-b border-border text-left text-text-secondary">
              <th className="py-2 pr-2 font-medium">Date</th>
              <th className="py-2 pr-2 font-medium">Stage</th>
              <th className="py-2 pr-2 font-medium">Match</th>
              <th className="py-2 px-2 font-medium text-center">Your Guess</th>
              <th className="py-2 px-2 font-medium text-center text-blue-500">Model</th>
              <th className="py-2 px-2 font-medium text-center text-violet-500">α Pick</th>
              <th className="py-2 px-2 font-medium text-center">Actual</th>
              <th className="py-2 px-2 font-medium text-center">Your pts</th>
              <th className="py-2 px-2 font-medium text-center text-blue-500">Model pts</th>
              <th className="py-2 px-2 font-medium text-center text-violet-500">α Pts</th>
              <th className="py-2 pl-2 font-medium text-center text-violet-500">Alpha Result</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((r) => {
              const home = teamMap.get(r.homeTeamId);
              const away = teamMap.get(r.awayTeamId);
              return (
                <tr key={r.matchId} className="border-b border-border/30 hover:bg-bg-secondary/50">
                  <td className="py-2 pr-2 text-xs text-text-muted whitespace-nowrap">
                    {formatShortDate(r.date)}
                  </td>
                  <td className="py-2 pr-2 text-xs text-text-muted whitespace-nowrap">
                    {STAGE_LABELS[r.stage]}
                  </td>
                  <td className="py-2 pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className={`${getFlagClass(r.homeTeamId)} text-sm`} />
                      <span className="text-xs font-medium">{home?.shortName}</span>
                      <span className="text-text-muted text-xs">vs</span>
                      <span className="text-xs font-medium">{away?.shortName}</span>
                      <span className={`${getFlagClass(r.awayTeamId)} text-sm`} />
                    </div>
                  </td>
                  <td className="py-2 px-2 text-center">
                    <UserGuessCell
                      matchId={r.matchId}
                      storedHome={r.userHome}
                      storedAway={r.userAway}
                      userIsExact={r.userIsExact}
                      userIsResult={r.userIsResult}
                      userPts={r.userPts}
                      userBreakdown={r.userBreakdown}
                      draft={drafts[r.matchId]}
                      onDraftChange={(home, away) =>
                        setDrafts((prev) => ({ ...prev, [r.matchId]: { home, away } }))
                      }
                      onCommit={(home, away) => {
                        overridePrediction(r.matchId, home, away);
                        setDrafts((prev) => {
                          const next = { ...prev };
                          delete next[r.matchId];
                          return next;
                        });
                      }}
                    />
                  </td>
                  <td className="py-2 px-2 text-center font-mono text-xs text-blue-500">
                    {r.modelHome}–{r.modelAway}
                  </td>
                  <td className="py-2 px-2 text-center font-mono text-xs text-violet-500">
                    {r.alphaPick ? extractScoreline(r.alphaPick) : "—"}
                  </td>
                  <td className="py-2 px-2 text-center font-mono text-xs font-bold">
                    {r.actualHome}–{r.actualAway}
                  </td>
                  <td className="py-2 px-2 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {ptsIcon(r.userIsExact, r.userIsResult, r.userHome !== null)}
                      {!(r.userHome !== null && r.userPts === 9) && (
                        <span
                          className="font-mono text-xs font-bold"
                          title={r.userBreakdown || undefined}
                        >
                          {r.userHome !== null ? r.userPts : "—"}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-2 px-2 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {ptsIcon(r.modelIsExact, r.modelIsResult, true)}
                      {r.modelPts !== 9 && (
                        <span
                          className="font-mono text-xs text-blue-500 font-bold"
                          title={r.modelBreakdown}
                        >
                          {r.modelPts}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-2 px-2 text-center">
                    {r.alphaPts !== null ? (
                      <div className="flex items-center justify-center gap-1">
                        {ptsIcon(r.alphaIsExact, r.alphaIsResult, true)}
                        {r.alphaPts !== 9 && (
                          <span className="font-mono text-xs text-violet-500 font-bold">
                            {r.alphaPts}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-text-muted text-xs">—</span>
                    )}
                  </td>
                  <td className="py-2 pl-2 text-center">
                    {r.alphaResultCorrect === true && (
                      <span className="text-accent-green" title="Alphametrico's Match Outcome chart correctly favored the actual result (verified pre-kickoff read)">✓</span>
                    )}
                    {r.alphaResultCorrect === false && (
                      <span className="text-accent-red" title="Alphametrico's Match Outcome chart did not favor the actual result (verified pre-kickoff read)">✗</span>
                    )}
                    {r.alphaResultCorrect === null && (
                      <span className="text-text-muted text-xs" title="N/A — Group Stage, or no verified pre-kickoff read available">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Running totals */}
      <div className="mt-5 pt-4 border-t border-border grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="text-sm text-text-secondary">
          <span className="font-medium">Your total:</span>{" "}
          <span className="font-mono font-bold text-accent-gold">{userTotal} / {maxPts} pts</span>
          <span className="text-text-muted"> ({((userTotal / maxPts) * 100).toFixed(1)}%)</span>
          <br />
          <span className="text-xs text-text-muted">
            Correct results: {userCorrect}/{userPredicted}, Exact scores: {userExact}/{userPredicted}
          </span>
        </div>
        <div className="text-sm text-text-secondary">
          <span className="font-medium text-blue-500">Model total:</span>{" "}
          <span className="font-mono font-bold text-blue-500">{modelTotal} / {maxPts} pts</span>
          <span className="text-text-muted"> ({((modelTotal / maxPts) * 100).toFixed(1)}%)</span>
          <br />
          <span className="text-xs text-text-muted">
            Correct results: {modelCorrect}/{rows.length}, Exact scores: {modelExact}/{rows.length}
          </span>
        </div>
        {alphaPicked > 0 && (
          <div className="text-sm text-text-secondary">
            <span className="font-medium text-purple-500">Alpha total:</span>{" "}
            <span className="font-mono font-bold text-purple-500">{alphaTotal} / {alphaPicked * 9} pts</span>
            <span className="text-text-muted"> ({(alphaPicked > 0 ? (alphaTotal / (alphaPicked * 9)) * 100 : 0).toFixed(1)}%)</span>
            <br />
            <span className="text-xs text-text-muted">
              Correct results: {alphaCorrect}/{alphaPicked}, Exact scores: {alphaExact}/{alphaPicked}
            </span>
          </div>
        )}
      </div>

      <div className="mt-3 text-center">
        <span className="text-sm font-bold text-text-primary">{verdict}</span>
      </div>

      {/* ─── Tournament Bracket Bonus ─────────────────────── */}
      <div className="mt-4 pt-4 border-t border-border">
        <h3 className="text-sm font-bold text-text-primary mb-2">Tournament Bracket Bonus</h3>
        <div className="bg-bg-tertiary rounded-lg border border-border p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          {(["You", "Model"] as const).map((who) => (
            <div key={who}>
              <div className={`font-medium mb-1 ${who === "You" ? "text-blue-500" : "text-amber-600"}`}>
                {who}
              </div>
              <div className="text-xs text-text-secondary space-y-0.5">
                <div>
                  Champion: {bracketPick.champion}{" "}
                  {tournamentBonus.championCorrect ? (
                    <span className="text-accent-green">✓ (+{tournamentBonus.championPoints})</span>
                  ) : (
                    <span className="text-accent-red">✗ (+0)</span>
                  )}
                </div>
                <div>
                  Runner-up: {bracketPick.runnerUp}{" "}
                  {tournamentBonus.runnerUpCorrect ? (
                    <span className="text-accent-green">✓ (+{tournamentBonus.runnerUpPoints})</span>
                  ) : (
                    <span className="text-accent-red">✗ (+0)</span>
                  )}
                </div>
                <div>
                  Third Place: {bracketPick.thirdPlace}{" "}
                  {tournamentBonus.thirdPlaceCorrect ? (
                    <span className="text-accent-green">✓ (+{tournamentBonus.thirdPlacePoints})</span>
                  ) : (
                    <span className="text-accent-red">✗ (+0)</span>
                  )}
                </div>
              </div>
              <div className="text-xs font-bold text-text-primary mt-1.5">
                Total: +{tournamentBonus.totalBonusPoints} pts
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Quiniela Standing (anonymized real pool benchmark) ─── */}
      <QuinielaStandingCard modelFinalTotal={modelTotal} />

      {/* ─── Alpha Result — verified pre-kickoff correct-result tracker ─── */}
      {alphaResultTracked.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="bg-bg-tertiary rounded-lg border border-border p-4 text-sm text-text-secondary">
            <span className="font-medium text-violet-500">Alpha correct results (verified pre-kickoff):</span>{" "}
            <span className="font-mono font-bold text-violet-500">
              {alphaResultCorrectCount} / {alphaResultTracked.length}
            </span>
            <span className="text-text-muted"> ({alphaResultPct.toFixed(1)}%)</span>
            <p className="text-xs text-text-muted mt-1">
              Excludes 2 matches without a verified pre-kickoff read (R32-15, R32-16),
              1 AET match (Switzerland vs Colombia, decided on penalties), and any
              match without a recorded result yet (e.g. R32-14).
            </p>
          </div>
        </div>
      )}

      {/* ─── Points by Matchday ─────────────────────────── */}
      <PointsByMatchday rows={rows} bonusPoints={tournamentBonus.totalBonusPoints} />
    </div>
  );
}

function QuinielaStandingCard({ modelFinalTotal }: { modelFinalTotal: number }) {
  const modelPlacement = computeQuinielaPlacement(modelFinalTotal);

  return (
    <div className="mt-4 pt-4 border-t border-border">
      <h3 className="text-sm font-bold text-text-primary mb-2">Quiniela Standing</h3>
      <p className="text-xs text-text-muted mb-3">
        Anonymized comparison against the real-world pool ({poolTotalParticipants} participants) —
        point thresholds only, no participant names.
      </p>
      <div className="bg-bg-tertiary rounded-lg border border-border p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <div>
          <div className="font-medium mb-1 text-blue-500">Daniel (official)</div>
          <div className="font-mono font-bold text-text-primary">
            {danielOfficialScore} pts
          </div>
          <div className="text-xs text-text-muted">{danielOfficialRank}th of {poolTotalParticipants}</div>
        </div>
        <div>
          <div className="font-medium mb-1 text-amber-600">Model (computed)</div>
          <div className="font-mono font-bold text-text-primary">
            {modelPlacement.total} pts
          </div>
          <div className="text-xs text-text-muted mb-1">{modelPlacement.estimatedRank}</div>
          {modelPlacement.wouldHaveWon ? (
            <div className="text-xs font-bold text-accent-gold">Would have won the pool 🏆</div>
          ) : (
            <p className="text-xs text-text-muted">{modelPlacement.note}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function PointsByMatchday({
  rows,
  bonusPoints,
}: {
  rows: Array<{
    matchId: string;
    userPts: number;
    modelPts: number;
    userHome: number | null;
    userIsResult: boolean;
    modelIsResult: boolean;
    alphaPts: number | null;
    alphaIsResult: boolean;
  }>;
  bonusPoints: number;
}) {
  const [view, setView] = useState<"matchday" | "stage">("matchday");

  // Build a date/stage lookup: matchId → { date, stage } (group stage + knockout)
  const dateStageMap = useMemo(() => getMatchDateStageMap(), []);

  const { chartData, tableRows, userGrandTotal, modelGrandTotal } = useMemo(() => {
    const base = view === "matchday"
      ? aggregateByMatchday(rows, dateStageMap)
      : aggregateByStage(rows, dateStageMap);

    if (bonusPoints === 0 || base.chartData.length === 0) return base;

    // Append a synthetic final data point for the tournament bracket bonus
    // (champion/runner-up/third place) so the cumulative lines step up
    // visibly at the end instead of the bonus staying invisible.
    const cumUser = base.userGrandTotal + bonusPoints;
    const cumModel = base.modelGrandTotal + bonusPoints;

    return {
      chartData: [
        ...base.chartData,
        {
          label: "Tournament Bonus",
          userPts: bonusPoints,
          modelPts: bonusPoints,
          cumUser,
          cumModel,
          matches: 0,
          maxPossible: 0,
          userPointsPct: 0,
          userCorrectResults: 0,
          userCorrectPct: 0,
          modelPointsPct: 0,
          modelCorrectResults: 0,
          modelCorrectPct: 0,
          alphaPicked: 0,
          alphaPtsTotal: 0,
          alphaMaxPossible: 0,
          alphaPointsPct: 0,
          alphaCorrectResults: 0,
          alphaCorrectPct: 0,
        },
      ],
      tableRows: [
        ...base.tableRows,
        {
          key: "tournament-bonus",
          label: "Tournament Bonus",
          matches: 0,
          userPts: bonusPoints,
          modelPts: bonusPoints,
          leader: "Tie" as const,
        },
      ],
      userGrandTotal: cumUser,
      modelGrandTotal: cumModel,
    };
  }, [rows, dateStageMap, view, bonusPoints]);

  if (chartData.length === 0) return null;

  const diff = userGrandTotal - modelGrandTotal;
  const totalMatches = rows.length;

  return (
    <div className="mt-6 pt-5 border-t border-border">
      <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
        <h3 className="text-sm font-bold text-text-primary">
          Points by {view === "matchday" ? "Matchday" : "Stage"}
        </h3>
        <div className="flex items-center gap-1 bg-bg-tertiary rounded-lg p-0.5">
          <button
            type="button"
            onClick={() => setView("matchday")}
            className={`text-xs font-medium px-2.5 py-1 rounded-md transition-colors ${
              view === "matchday"
                ? "bg-accent-gold text-bg-primary"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            By Matchday
          </button>
          <button
            type="button"
            onClick={() => setView("stage")}
            className={`text-xs font-medium px-2.5 py-1 rounded-md transition-colors ${
              view === "stage"
                ? "bg-accent-gold text-bg-primary"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            By Stage
          </button>
        </div>
      </div>
      <p className="text-xs text-text-muted mb-4">
        {view === "matchday"
          ? "Daily scoring breakdown — bars show points earned, lines show cumulative totals."
          : "Scoring breakdown by tournament stage — bars show points earned, lines show cumulative totals."}
      </p>

      {/* Chart */}
      <div className="w-full" style={{ height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} />
            <YAxis yAxisId="bars" tick={{ fontSize: 11 }} allowDecimals={false} />
            <YAxis yAxisId="line" orientation="right" tick={{ fontSize: 11 }} allowDecimals={false} hide />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8 }}
              content={
                view === "stage"
                  ? (props) => <StageTooltipContent {...props} />
                  : undefined
              }
              formatter={
                view === "matchday"
                  ? (value, name) => {
                      const labels: Record<string, string> = {
                        userPts: "Your pts",
                        modelPts: "Model pts",
                        cumUser: "Your cumulative",
                        cumModel: "Model cumulative",
                      };
                      return [String(value), labels[String(name)] ?? name];
                    }
                  : undefined
              }
            />
            <Legend
              formatter={(value: string) => {
                const labels: Record<string, string> = {
                  userPts: "You",
                  modelPts: "Model",
                  cumUser: "You (cumulative)",
                  cumModel: "Model (cumulative)",
                };
                return <span className="text-xs">{labels[value] ?? value}</span>;
              }}
            />
            <Bar yAxisId="bars" dataKey="userPts" fill="#3b82f6" radius={[3, 3, 0, 0]} barSize={20} />
            <Bar yAxisId="bars" dataKey="modelPts" fill="#d97706" radius={[3, 3, 0, 0]} barSize={20} />
            <Line yAxisId="line" type="monotone" dataKey="cumUser" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} strokeDasharray="5 3" />
            <Line yAxisId="line" type="monotone" dataKey="cumModel" stroke="#d97706" strokeWidth={2} dot={{ r: 3 }} strokeDasharray="5 3" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Summary table */}
      <div className="overflow-x-auto mt-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-text-secondary">
              <th className="py-2 pr-2 font-medium">{view === "matchday" ? "Matchday" : "Stage"}</th>
              <th className="py-2 px-2 font-medium text-center">Matches</th>
              <th className="py-2 px-2 font-medium text-center">Your pts</th>
              <th className="py-2 px-2 font-medium text-center text-amber-600">Model pts</th>
              <th className="py-2 pl-2 font-medium text-center">Leader</th>
            </tr>
          </thead>
          <tbody>
            {tableRows.map((r) => (
              <tr key={r.key} className="border-b border-border/30 hover:bg-bg-secondary/50">
                <td className="py-1.5 pr-2 font-medium text-xs">{r.label}</td>
                <td className="py-1.5 px-2 text-center font-mono text-xs">{r.matches}</td>
                <td className="py-1.5 px-2 text-center font-mono text-xs font-bold">{r.userPts}</td>
                <td className="py-1.5 px-2 text-center font-mono text-xs font-bold text-amber-600">{r.modelPts}</td>
                <td className="py-1.5 pl-2 text-center text-xs">
                  {r.leader === "You" && <span className="text-blue-500 font-medium">You</span>}
                  {r.leader === "Model" && <span className="text-amber-600 font-medium">Model</span>}
                  {r.leader === "Tie" && <span className="text-text-muted">Tie</span>}
                </td>
              </tr>
            ))}
            {/* Total row */}
            <tr className="border-t-2 border-border font-bold">
              <td className="py-2 pr-2 text-xs">TOTAL</td>
              <td className="py-2 px-2 text-center font-mono text-xs">{totalMatches}</td>
              <td className="py-2 px-2 text-center font-mono text-xs">{userGrandTotal}</td>
              <td className="py-2 px-2 text-center font-mono text-xs text-amber-600">{modelGrandTotal}</td>
              <td className="py-2 pl-2 text-center text-xs">
                {diff > 0 && <span className="text-blue-500">You +{diff}</span>}
                {diff < 0 && <span className="text-amber-600">Model +{Math.abs(diff)}</span>}
                {diff === 0 && <span className="text-text-muted">Tied</span>}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StageTooltipContent({
  active,
  payload,
  label,
}: TooltipContentProps<ValueType, NameType>) {
  if (!active || !payload || payload.length === 0) return null;
  const d = payload[0].payload as AggregatedChartPoint;

  const fmt = (pointsPct: number, earned: number, max: number, correctPct: number, correct: number, total: number) =>
    `${pointsPct.toFixed(1)}% pts (${earned}/${max})  |  ${correctPct.toFixed(1)}% results (${correct}/${total})`;

  return (
    <div className="bg-bg-secondary border border-border rounded-lg p-3 text-xs shadow-lg">
      <div className="font-bold text-text-primary mb-1.5">{label}</div>
      <div className="text-blue-500 mb-1">
        <span className="font-medium">You:</span>{" "}
        {fmt(d.userPointsPct, d.userPts, d.maxPossible, d.userCorrectPct, d.userCorrectResults, d.matches)}
      </div>
      <div className="text-amber-600 mb-1">
        <span className="font-medium">Model:</span>{" "}
        {fmt(d.modelPointsPct, d.modelPts, d.maxPossible, d.modelCorrectPct, d.modelCorrectResults, d.matches)}
      </div>
      {d.alphaPicked > 0 && (
        <div className="text-purple-500">
          <span className="font-medium">Alpha:</span>{" "}
          {fmt(
            d.alphaPointsPct,
            d.alphaPtsTotal,
            d.alphaMaxPossible,
            d.alphaCorrectPct,
            d.alphaCorrectResults,
            d.alphaPicked
          )}
        </div>
      )}
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
  const optaMap = toMap(optaPredictions, (o) => o.teamId, (o) => o.championshipProb);
  const peleMap = toMap(pelePredictions, (p) => p.teamId, (p) => p.championshipProb);
  const polyMap = toMap(polymarketPredictions, (p) => p.teamId, (p) => p.championshipProb);

  // Our model's #1
  const modelSorted = Object.entries(results.championProbs).sort(([, a], [, b]) => b - a);
  const modelFavoriteId = modelSorted[0]?.[0];
  const modelFavoriteProb = modelSorted[0]?.[1] ?? 0;
  const modelFavorite = teamMap.get(modelFavoriteId ?? "");

  // Opta's #1
  const optaSorted = sortByDesc(optaPredictions, (o) => o.championshipProb);
  const optaFavorite = teamMap.get(optaSorted[0]?.teamId ?? "");
  const optaFavoriteProb = optaSorted[0]?.championshipProb ?? 0;

  // Polymarket's #1
  const polySorted = sortByDesc(polymarketPredictions, (p) => p.championshipProb);
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
  const optaTop20 = sortByDesc(optaPredictions, (o) => o.championshipProb).slice(0, 20).map((o) => ({ id: o.teamId, pct: o.championshipProb }));
  const peleTop20 = sortByDesc(pelePredictions, (p) => p.championshipProb).slice(0, 20).map((p) => ({ id: p.teamId, pct: p.championshipProb }));
  const polyTop20 = sortByDesc(polymarketPredictions, (p) => p.championshipProb).slice(0, 20).map((p) => ({ id: p.teamId, pct: p.championshipProb }));

  return (
    <div className="flex flex-col gap-6">
      {/* ── 4-column header ── */}
      <div className="bg-bg-secondary rounded-xl border border-border p-6">
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
      <div className="bg-bg-secondary rounded-xl border border-border p-6">
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
      <div className="bg-bg-secondary rounded-xl border border-border p-6">
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
    <div className="bg-bg-secondary rounded-xl border border-border p-6">
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
    const strengthMap = indexBy(strengths, (s) => s.teamId);
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
    <div className="bg-bg-secondary rounded-xl border border-border p-6">
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
    const strengthMap = indexBy(strengths, (s) => s.teamId);

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

      const b = scoreMatch(userPred, modelPred);
      totalPoints += b.totalPoints;
      if (b.isCorrectResult) correctResults++;
      if (b.isExactScore) correctScores++;
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

    // Build knockout results lookup for fallback
    const koResultMap = new Map(
      knockoutMatches
        .filter((ko) => ko.status === "completed" && ko.homeGoals != null)
        .map((ko) => [ko.matchId, { homeScore: ko.homeGoals!, awayScore: ko.awayGoals! }])
    );

    for (const [matchId, userPred] of Object.entries(predictions)) {
      const espnResult = getResult(matchId);
      const koResult = koResultMap.get(matchId);
      const actualHome = espnResult?.homeScore ?? koResult?.homeScore;
      const actualAway = espnResult?.awayScore ?? koResult?.awayScore;
      if (actualHome == null || actualAway == null) continue;

      const actualPred: Prediction = {
        matchId,
        homeGoals: actualHome,
        awayGoals: actualAway,
        source: "model",
      };

      const b = scoreMatch(userPred, actualPred);
      totalPoints += b.totalPoints;
      if (b.isCorrectResult) correctResults++;
      if (b.isExactScore) correctScores++;
      matchesScored++;
    }

    const hasKOCompleted = knockoutMatches.some((ko) => ko.status === "completed");

    return {
      totalPoints,
      correctResults,
      correctScores,
      matchesScored,
      hasActual: results.some((r) => r.completed) || hasKOCompleted,
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

  const maxPoints = 678;
  const pct = (scoring.totalPoints / maxPoints) * 100;

  let message: string;
  if (pct > 80) message = "You might actually be a football genius 🧠";
  else if (pct > 60)
    message = "Solid predictions — your football knowledge shows";
  else if (pct > 40)
    message = "Decent start — the model respects your picks";
  else message = "The math is beating you right now 😅";

  return (
    <div className="bg-bg-secondary rounded-xl border border-border p-6">
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
                  ? "bg-bg-tertiary text-text-primary font-medium shadow-sm"
                  : "text-text-muted hover:text-text-secondary"
              }`}
            >
              vs Model
            </button>
            <button
              onClick={() => setMode("actual")}
              className={`text-xs px-3 py-1 rounded-md cursor-pointer transition-colors ${
                mode === "actual"
                  ? "bg-bg-tertiary text-text-primary font-medium shadow-sm"
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
