import type React from "react";
import { scoreDistribution } from "../../engine/poisson";

interface ScorelineMatrixProps {
  homeTeamName: string;
  awayTeamName: string;
  lambdaHome: number;
  lambdaAway: number;
  homeWinProb: number;
  drawProb: number;
  awayWinProb: number;
}

export function ScorelineMatrix({
  homeTeamName,
  awayTeamName,
  lambdaHome,
  lambdaAway,
  homeWinProb,
  drawProb,
  awayWinProb,
}: ScorelineMatrixProps) {
  const dist = scoreDistribution(lambdaHome, lambdaAway);

  // Build 5×5 grid values
  const grid: number[][] = Array.from({ length: 5 }, (_, h) =>
    Array.from({ length: 5 }, (_, a) => dist[`${h}-${a}`] ?? 0)
  );

  const maxProb = Math.max(...grid.flat());

  function cellClass(prob: number): string {
    const intensity = maxProb > 0 ? prob / maxProb : 0;
    if (intensity > 0.75) return "bg-amber-500 text-white font-bold";
    return "";
  }

  function cellStyle(prob: number): React.CSSProperties {
    const intensity = maxProb > 0 ? prob / maxProb : 0;
    if (intensity > 0.75) return {};
    if (intensity >= 0.4) return { background: "rgba(240,180,41,0.25)", color: "rgb(252,211,77)" };
    if (intensity >= 0.15) return { background: "rgba(240,180,41,0.08)", color: "var(--color-text-muted)" };
    return { background: "transparent", color: "var(--color-text-muted)" };
  }

  // Top 3 scorelines
  const top3 = Object.entries(dist)
    .filter(([key]) => {
      const [h, a] = key.split("-").map(Number);
      return h <= 4 && a <= 4;
    })
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  const homeWinPct = Math.round(homeWinProb * 100);
  const drawPct = Math.round(drawProb * 100);
  const awayWinPct = Math.round(awayWinProb * 100);

  return (
    <div
      className="rounded-md p-2.5"
      style={{ background: "var(--color-bg-elevated)", border: "1px solid var(--color-border)" }}
    >
      {/* xG header */}
      <p className="text-center text-[10px] text-text-muted mb-2">
        xG modelo: {lambdaHome.toFixed(2)} – {lambdaAway.toFixed(2)}
      </p>

      <div className="flex items-center gap-1">
        {/* Vertical axis label */}
        <div className="flex items-center justify-center shrink-0" style={{ width: 16 }}>
          <span
            className="text-[9px] text-text-muted whitespace-nowrap"
            style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
          >
            ↓ goles {homeTeamName}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          {/* Horizontal axis label */}
          <p className="text-center text-[9px] text-text-muted mb-1">
            ← goles {awayTeamName} →
          </p>

          {/* Grid */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-center" style={{ tableLayout: "fixed" }}>
              <thead>
                <tr>
                  <th className="w-6" />
                  {[0, 1, 2, 3, 4].map((a) => (
                    <th key={a} className="text-[10px] font-semibold text-text-muted pb-0.5 w-12">
                      {a}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[0, 1, 2, 3, 4].map((h) => (
                  <tr key={h}>
                    <td className="text-[10px] font-semibold text-text-muted pr-1">{h}</td>
                    {[0, 1, 2, 3, 4].map((a) => {
                      const prob = grid[h][a];
                      return (
                        <td
                          key={a}
                          className={`rounded text-center py-1 px-0.5 ${cellClass(prob)}`}
                          style={cellStyle(prob)}
                        >
                          <div className="text-[10px] font-bold leading-tight">{h}-{a}</div>
                          <div className="text-[9px] leading-tight">{(prob * 100).toFixed(1)}%</div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Top 3 scorelines strip */}
      <p className="text-center text-[10px] text-text-secondary mt-2">
        {top3.map(([key, prob], i) => (
          <span key={key}>
            {i > 0 && <span className="mx-1">·</span>}
            <span className="font-semibold text-text-primary">{key}</span>{" "}
            {(prob * 100).toFixed(1)}%
          </span>
        ))}
      </p>

      {/* Outcome bar */}
      <div className="mt-1.5 grid grid-cols-3 text-[10px] text-text-secondary">
        <span className="text-left">
          <span className="font-bold">1</span> {homeTeamName} {homeWinPct}%
        </span>
        <span className="text-center">
          <span className="font-bold">X</span> {drawPct}%
        </span>
        <span className="text-right">
          {awayWinPct}% {awayTeamName} <span className="font-bold">2</span>
        </span>
      </div>
    </div>
  );
}
