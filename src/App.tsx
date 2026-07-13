import { useState, useCallback, useEffect } from "react";
import { runMonteCarlo } from "./engine";
import { calculateStrengthFromElo } from "./engine/strengthCalculator";
import { teams, getTeamMap } from "./data/teams";
import { getFlagClass } from "./data/flags";
import { groups } from "./data/groups";
import { GroupStage } from "./components/bracket/GroupStage";
import { MatchesByDate } from "./components/prediction/MatchesByDate";
import { KnockoutSection } from "./components/prediction/KnockoutSection";
import { Dashboard } from "./components/dashboard/Dashboard";
import { usePredictionStore } from "./store/predictionStore";
import { initModelPredictions } from "./store/modelPredictionStore";
import { useLiveData } from "./hooks/useLiveData";
import type { MonteCarloResults } from "./types";

type View = "predictions" | "simulation" | "dashboard";

function App() {
  const [view, setView] = useState<View>("predictions");
  const [results, setResults] = useState<MonteCarloResults | null>(null);
  const [running, setRunning] = useState(false);
  const [simError, setSimError] = useState<string | null>(null);
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    return (localStorage.getItem("wc2026-theme") as "dark" | "light") || "dark";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("wc2026-theme", theme);
  }, [theme]);
  const [simCount, setSimCount] = useState(10_000);
  const locked = usePredictionStore((s) => s.locked);
  const lockPredictions = usePredictionStore((s) => s.lockPredictions);
  const unlockPredictions = usePredictionStore((s) => s.unlockPredictions);
  const clearAllPredictions = usePredictionStore((s) => s.clearAllPredictions);
  const getTotalProgress = usePredictionStore((s) => s.getTotalProgress);

  const { completed, total } = getTotalProgress();

  // Initialize model predictions on first load
  useEffect(() => {
    initModelPredictions();
  }, []);

  // Live data integration
  const { isLive, lastUpdated, loading: liveLoading, refresh: refreshLive } = useLiveData();

  const runSimulation = useCallback(() => {
    setRunning(true);
    setSimError(null);
    setTimeout(() => {
      try {
        const teamMap = getTeamMap();
        const strengths = calculateStrengthFromElo(teams);
        const strengthMap = new Map(strengths.map((s) => [s.teamId, s]));
        const mcResults = runMonteCarlo(groups, teamMap, strengthMap, simCount);
        setResults(mcResults);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        console.error("[runSimulation] Monte Carlo failed:", err);
        setSimError(message);
      } finally {
        setRunning(false);
      }
    }, 50);
  }, [simCount]);

  const sorted = results
    ? Object.entries(results.championProbs)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 20)
    : [];

  const teamMap = getTeamMap();

  return (
    <div className="min-h-screen bg-bg-secondary text-text-primary font-body">
      {/* Header */}
      <header className="bg-bg-secondary border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-text-primary">
                WC2026
                <span className="text-accent-gold ml-2">Predictor</span>
              </h1>
              <p className="text-text-muted text-xs mt-0.5">
                Your football brain vs. the math
              </p>
            </div>

            {/* Live badge */}
            {isLive && (
              <div className="flex items-center gap-1.5 bg-accent-green/10 text-accent-green px-2.5 py-1 rounded-full">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-green opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-green" />
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider">Live</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            {/* Theme toggle */}
            <button
              onClick={() => setTheme(t => t === "dark" ? "light" : "dark")}
              className="text-text-muted hover:text-text-primary transition-colors text-xs font-mono"
              title="Toggle theme"
            >
              {theme === "dark" ? "☀" : "☾"}
            </button>

            {/* Last updated */}
            {lastUpdated && (
              <button
                onClick={refreshLive}
                disabled={liveLoading}
                className="hidden sm:flex items-center gap-1 text-[10px] text-text-muted hover:text-text-secondary transition-colors cursor-pointer"
                title="Click to refresh live data"
              >
                {liveLoading ? (
                  <span className="animate-spin">↻</span>
                ) : (
                  <span>↻</span>
                )}
                <span>
                  Updated {formatTimeAgo(lastUpdated)}
                </span>
              </button>
            )}

            {/* Progress badge */}
            <div className="hidden sm:flex items-center gap-2 text-xs bg-bg-secondary rounded-full px-3 py-1.5">
              <span className="text-text-muted">Predictions:</span>
              <span className="font-mono text-accent-gold font-bold">
                {completed}
              </span>
              <span className="font-mono text-text-muted">/ {total}</span>
            </div>

            {/* Lock/Unlock */}
            {completed === total && total > 0 && (
              <button
                onClick={locked ? unlockPredictions : lockPredictions}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${
                  locked
                    ? "bg-accent-red/10 text-accent-red hover:bg-accent-red/20"
                    : "bg-accent-green/10 text-accent-green hover:bg-accent-green/20"
                }`}
              >
                {locked ? "Unlock" : "Lock All"}
              </button>
            )}
          </div>
        </div>

        {/* Navigation tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <nav className="flex gap-1">
            {(
              [
                { key: "predictions", label: "Matches" },
                { key: "simulation", label: "Simulation" },
                { key: "dashboard", label: "Dashboard" },
              ] as const
            ).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setView(key)}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                  view === key
                    ? "border-accent-gold text-accent-gold"
                    : "border-transparent text-text-secondary hover:text-text-primary"
                }`}
              >
                {label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {view === "predictions" && (
          <MatchesView
            completed={completed}
            locked={locked}
            clearAllPredictions={clearAllPredictions}
          />
        )}

        {view === "simulation" && (
          <div>
            <div className="flex items-center gap-4 mb-8">
              <label className="text-text-secondary text-sm flex items-center gap-2">
                Simulations:
                <select
                  value={simCount}
                  onChange={(e) => setSimCount(Number(e.target.value))}
                  className="bg-bg-tertiary text-text-primary border border-border
                    rounded-lg px-3 py-1.5 font-mono text-sm"
                >
                  <option value={1000}>1,000</option>
                  <option value={5000}>5,000</option>
                  <option value={10000}>10,000</option>
                  <option value={25000}>25,000</option>
                </select>
              </label>
              <button
                onClick={runSimulation}
                disabled={running}
                className={`px-5 py-2 rounded-lg font-bold text-sm transition-colors cursor-pointer ${
                  running
                    ? "bg-bg-tertiary text-text-muted cursor-wait"
                    : "bg-accent-gold text-white hover:bg-accent-gold/90"
                }`}
              >
                {running ? "Simulating..." : "Run Simulation"}
              </button>
            </div>

            {simError && (
              <div className="bg-bg-secondary rounded-xl border border-accent-red/40 p-4 text-accent-red text-sm">
                Simulation failed: {simError}
              </div>
            )}

            {results && (
              <div className="bg-bg-secondary rounded-xl border border-border p-6">
                <h2 className="text-lg font-bold text-text-primary mb-1">
                  Championship Probabilities
                </h2>
                <p className="text-text-muted text-sm mb-6">
                  {results.numSimulations.toLocaleString()} Monte Carlo simulations
                </p>

                <div className="flex flex-col gap-2">
                  {sorted.map(([teamId, prob], i) => {
                    const team = teamMap.get(teamId);
                    if (!team) return null;
                    const pct = (prob * 100).toFixed(1);
                    const barWidth = `${prob * 100 * 5}%`;

                    return (
                      <div
                        key={teamId}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg ${
                          i < 3 ? "bg-bg-secondary" : ""
                        }`}
                      >
                        <span className="w-6 text-right text-text-muted font-mono text-xs">
                          {i + 1}
                        </span>
                        <span className={`${getFlagClass(teamId)} text-lg`} />
                        <span className="w-40 font-medium text-sm">
                          {team.name}
                        </span>
                        <div className="flex-1 h-5 bg-bg-tertiary rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{
                              width: barWidth,
                              background:
                                i === 0
                                  ? "#D97706"
                                  : i < 3
                                  ? "#2563EB"
                                  : "#9CA3AF",
                            }}
                          />
                        </div>
                        <span
                          className={`font-mono text-sm w-14 text-right font-medium ${
                            i < 3 ? "text-accent-gold" : "text-text-secondary"
                          }`}
                        >
                          {pct}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {!results && !simError && (
              <div className="text-center py-24">
                <p className="text-lg text-text-secondary mb-2">
                  No simulation results yet
                </p>
                <p className="text-sm text-text-muted">
                  Click "Run Simulation" to generate championship probabilities
                </p>
              </div>
            )}
          </div>
        )}

        {view === "dashboard" && <Dashboard />}
      </main>
    </div>
  );
}

type MatchesViewMode = "date" | "group";

const MATCHES_VIEW_KEY = "wc2026-matches-view";

function MatchesView({
  completed,
  locked,
  clearAllPredictions,
}: {
  completed: number;
  locked: boolean;
  clearAllPredictions: () => void;
}) {
  const [mode, setMode] = useState<MatchesViewMode>(() => {
    try {
      const stored = localStorage.getItem(MATCHES_VIEW_KEY);
      return stored === "group" ? "group" : "date";
    } catch {
      return "date";
    }
  });

  const switchMode = (m: MatchesViewMode) => {
    setMode(m);
    try {
      localStorage.setItem(MATCHES_VIEW_KEY, m);
    } catch {}
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-text-primary">Group Stage</h2>
        <div className="flex items-center gap-3">
          {completed > 0 && !locked && (
            <button
              onClick={clearAllPredictions}
              className="text-xs text-text-muted hover:text-accent-red transition-colors cursor-pointer"
            >
              Clear all
            </button>
          )}
          {/* View toggle */}
          <div className="flex bg-bg-tertiary rounded-lg p-0.5">
            <button
              onClick={() => switchMode("date")}
              className={`text-xs px-3 py-1.5 rounded-md cursor-pointer transition-colors ${
                mode === "date"
                  ? "bg-bg-tertiary text-text-primary font-medium shadow-sm"
                  : "text-text-muted hover:text-text-secondary"
              }`}
            >
              By Date
            </button>
            <button
              onClick={() => switchMode("group")}
              className={`text-xs px-3 py-1.5 rounded-md cursor-pointer transition-colors ${
                mode === "group"
                  ? "bg-bg-tertiary text-text-primary font-medium shadow-sm"
                  : "text-text-muted hover:text-text-secondary"
              }`}
            >
              By Group
            </button>
          </div>
        </div>
      </div>
      {mode === "date" ? <MatchesByDate /> : <GroupStage />}
      <KnockoutSection />
    </div>
  );
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

export default App;
