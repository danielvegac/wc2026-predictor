import { useState, useMemo } from "react";
import { useLiveEloStore } from "../../store/liveEloStore";
import { teams } from "../../data/teams";
import { getTeamFormMultipliers } from "../../data/matchInsights";
import { getFlagClass } from "../../data/flags";

type SortKey = "team" | "baseline" | "live" | "delta" | "atk" | "def";
type SortDir = "asc" | "desc";

interface Row {
  id: string;
  flag: string;
  shortName: string;
  baseline: number;
  live: number;
  delta: number;
  atk: number;
  def: number;
}

export function EngineDiagnosticsPanel() {
  const [open, setOpen] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("live");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const ratings = useLiveEloStore((s) => s.ratings);

  const rows: Row[] = useMemo(() => {
    return teams.map((t) => {
      const live = ratings[t.id] ?? t.eloRating;
      const { attackMultiplier, defenseMultiplier } = getTeamFormMultipliers(t.id);
      return {
        id: t.id,
        flag: t.flagEmoji,
        shortName: t.shortName,
        baseline: t.eloRating,
        live,
        delta: live - t.eloRating,
        atk: attackMultiplier,
        def: defenseMultiplier,
      };
    });
  }, [ratings]);

  const sorted = useMemo(() => {
    return [...rows].sort((a, b) => {
      let av: number | string;
      let bv: number | string;
      switch (sortKey) {
        case "team":     av = a.shortName; bv = b.shortName; break;
        case "baseline": av = a.baseline;  bv = b.baseline;  break;
        case "live":     av = a.live;      bv = b.live;      break;
        case "delta":    av = a.delta;     bv = b.delta;     break;
        case "atk":      av = a.atk;       bv = b.atk;       break;
        case "def":      av = a.def;       bv = b.def;       break;
      }
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [rows, sortKey, sortDir]);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  function indicator(key: SortKey) {
    if (sortKey !== key) return <span className="text-zinc-600 ml-0.5">⇅</span>;
    return <span className="ml-0.5">{sortDir === "asc" ? "▲" : "▼"}</span>;
  }

  function deltaColor(d: number) {
    if (d > 0) return "text-green-400";
    if (d < 0) return "text-red-400";
    return "text-zinc-500";
  }

  function atkColor(v: number) {
    if (v > 1.1) return "text-amber-400";
    if (v < 0.9) return "text-red-400";
    return "text-zinc-400";
  }

  function defColor(v: number) {
    if (v > 1.1) return "text-amber-400";
    if (v < 0.9) return "text-red-400";
    return "text-zinc-400";
  }

  const th =
    "py-2 px-2 text-xs uppercase tracking-wide text-zinc-400 font-medium cursor-pointer select-none hover:text-zinc-200 whitespace-nowrap";

  return (
    <div className="bg-bg-secondary rounded-xl border border-border">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-6 py-4 text-left"
      >
        <div>
          <span className="text-base font-bold text-text-primary">Engine Diagnostics</span>
          <span className="ml-3 text-xs text-zinc-500">
            Live Elo · Form Multipliers · Active teams only
          </span>
        </div>
        <span className="text-zinc-400 text-sm">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="px-6 pb-6 overflow-x-auto">
          <table className="w-full text-sm min-w-[560px]">
            <thead>
              <tr className="border-b border-border">
                <th className={`${th} text-left`} onClick={() => handleSort("team")}>
                  Team {indicator("team")}
                </th>
                <th className={`${th} text-right`} onClick={() => handleSort("baseline")}>
                  Baseline {indicator("baseline")}
                </th>
                <th className={`${th} text-right`} onClick={() => handleSort("live")}>
                  Live Elo {indicator("live")}
                </th>
                <th className={`${th} text-right`} onClick={() => handleSort("delta")}>
                  ΔElo {indicator("delta")}
                </th>
                <th className={`${th} text-right`} onClick={() => handleSort("atk")}>
                  Atk × {indicator("atk")}
                </th>
                <th className={`${th} text-right`} onClick={() => handleSort("def")}>
                  Def × {indicator("def")}
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((r, i) => (
                <tr
                  key={r.id}
                  className={`border-b border-border/30 hover:bg-zinc-800/40 ${
                    i % 2 === 0 ? "bg-zinc-950/30" : "bg-zinc-900/20"
                  }`}
                >
                  <td className="py-1.5 px-2">
                    <div className="flex items-center gap-1.5">
                      <span className={`${getFlagClass(r.id)} text-sm`} />
                      <span className="font-medium text-text-primary text-xs">{r.shortName}</span>
                    </div>
                  </td>
                  <td className="py-1.5 px-2 text-right font-mono text-xs text-zinc-400">
                    {r.baseline}
                  </td>
                  <td className="py-1.5 px-2 text-right font-mono text-xs font-bold text-text-primary">
                    {r.live}
                  </td>
                  <td className={`py-1.5 px-2 text-right font-mono text-xs font-bold ${deltaColor(r.delta)}`}>
                    {r.delta > 0 ? "+" : ""}{r.delta}
                  </td>
                  <td className={`py-1.5 px-2 text-right font-mono text-xs ${atkColor(r.atk)}`}>
                    {r.atk.toFixed(2)}
                  </td>
                  <td className={`py-1.5 px-2 text-right font-mono text-xs ${defColor(r.def)}`}>
                    {r.def.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
