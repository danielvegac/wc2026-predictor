import { useState, useCallback } from "react";
import { runMonteCarlo } from "./engine";
import { calculateStrengthFromElo } from "./engine/strengthCalculator";
import { teams, getTeamMap } from "./data/teams";
import { getFlagClass } from "./data/flags";
import { groups } from "./data/groups";
import { GroupStage } from "./components/bracket/GroupStage";
import { Dashboard } from "./components/dashboard/Dashboard";
import { usePredictionStore } from "./store/predictionStore";
import type { MonteCarloResults } from "./types";

type View = "predictions" | "simulation" | "dashboard";

function App() {
  const [view, setView] = useState<View>("predictions");
  const [results, setResults] = useState<MonteCarloResults | null>(null);
  const [running, setRunning] = useState(false);
  const [simCount, setSimCount] = useState(10_000);
  const locked = usePredictionStore((s) => s.locked);
  const lockPredictions = usePredictionStore((s) => s.lockPredictions);
  const unlockPredictions = usePredictionStore((s) => s.unlockPredictions);
  const clearAllPredictions = usePredictionStore((s) => s.clearAllPredictions);
  const getTotalProgress = usePredictionStore((s) => s.getTotalProgress);

  const { completed, total } = getTotalProgress();

  const runSimulation = useCallback(() => {
    setRunning(true);
    setTimeout(() => {
      const teamMap = getTeamMap();
      const strengths = calculateStrengthFromElo(teams);
      const strengthMap = new Map(strengths.map((s) => [s.teamId, s]));
      const mcResults = runMonteCarlo(groups, teamMap, strengthMap, simCount);
      setResults(mcResults);
      setRunning(false);
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
      <header className="bg-white border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-text-primary">
              WC2026
              <span className="text-accent-gold ml-2">Predictor</span>
            </h1>
            <p className="text-text-muted text-xs mt-0.5">
              Your football brain vs. the math
            </p>
          </div>

          <div className="flex items-center gap-4">
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
                { key: "predictions", label: "Predictions" },
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
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-text-primary">
                Group Stage
              </h2>
              {completed > 0 && !locked && (
                <button
                  onClick={clearAllPredictions}
                  className="text-xs text-text-muted hover:text-accent-red transition-colors cursor-pointer"
                >
                  Clear all
                </button>
              )}
            </div>
            <GroupStage />
          </div>
        )}

        {view === "simulation" && (
          <div>
            <div className="flex items-center gap-4 mb-8">
              <label className="text-text-secondary text-sm flex items-center gap-2">
                Simulations:
                <select
                  value={simCount}
                  onChange={(e) => setSimCount(Number(e.target.value))}
                  className="bg-white text-text-primary border border-border
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

            {results && (
              <div className="bg-white rounded-xl border border-border shadow-sm p-6">
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

            {!results && (
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

export default App;
