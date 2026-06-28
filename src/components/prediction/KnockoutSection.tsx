import { useMemo, useRef, useEffect, useState } from "react";
import { knockoutMatches, type KnockoutMatch } from "../../data/knockoutMatches";
import { getTeamMap } from "../../data/teams";
import { useModelPredictionStore } from "../../store/modelPredictionStore";
import { KnockoutMatchCard } from "./KnockoutMatchCard";

const teamMap = getTeamMap();

/** Get today's date as YYYY-MM-DD in local timezone */
function getTodayStr(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

interface DateGroup {
  date: string;
  label: string;
  matches: KnockoutMatch[];
  isToday: boolean;
}

/** Parse kickoffET "15:00" into minutes since midnight for sorting */
function parseKickoffMinutes(et: string): number {
  const [h, m] = et.split(":").map(Number);
  return h * 60 + m;
}

export function KnockoutSection() {
  const [collapsed, setCollapsed] = useState(false);
  const predictions = useModelPredictionStore((s) => s.predictions);
  const todayRef = useRef<HTMLDivElement>(null);

  const r32Matches = useMemo(() => {
    return knockoutMatches.filter((m) => m.round === "R32");
  }, []);

  const dateGroups = useMemo(() => {
    const today = getTodayStr();

    const sorted = [...r32Matches].sort((a, b) => {
      const dateCmp = a.date.localeCompare(b.date);
      if (dateCmp !== 0) return dateCmp;
      return parseKickoffMinutes(a.kickoffET) - parseKickoffMinutes(b.kickoffET);
    });

    const map = new Map<string, KnockoutMatch[]>();
    for (const m of sorted) {
      const list = map.get(m.date) ?? [];
      list.push(m);
      map.set(m.date, list);
    }

    const groups: DateGroup[] = [];
    for (const [date, matches] of map) {
      const d = new Date(date + "T12:00:00");
      const label = d.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      });
      groups.push({ date, label, matches, isToday: date === today });
    }

    return groups;
  }, [r32Matches]);

  // Scroll today's R32 section into view if there are matches today
  useEffect(() => {
    if (todayRef.current) {
      todayRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  if (r32Matches.length === 0) return null;

  return (
    <div className="mt-10">
      {/* Section header */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="flex items-center gap-3 mb-6 cursor-pointer group w-full"
      >
        <h2 className="text-xl font-bold text-text-primary group-hover:text-accent-gold transition-colors">
          Round of 32
        </h2>
        <span className="text-[10px] font-bold uppercase tracking-wider bg-accent-gold/10 text-accent-gold px-2.5 py-1 rounded-full">
          Knockout Stage
        </span>
        <span className="text-xs text-text-muted">
          · {r32Matches.length} matches
        </span>
        <span className="ml-auto text-text-muted text-sm">
          {collapsed ? "▸" : "▾"}
        </span>
      </button>

      {!collapsed && (
        <div className="flex flex-col gap-6">
          {dateGroups.map((group) => (
            <div
              key={group.date}
              ref={group.isToday ? todayRef : undefined}
            >
              {/* Date header */}
              <div
                className={`flex items-center gap-2 mb-3 px-1 ${
                  group.isToday ? "sticky top-[105px] z-[5] bg-bg-secondary py-2 -mx-1 px-2 rounded-lg" : ""
                }`}
              >
                <h3
                  className={`text-sm font-bold ${
                    group.isToday ? "text-accent-gold" : "text-text-primary"
                  }`}
                >
                  {group.label}
                </h3>
                {group.isToday && (
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-accent-gold/10 text-accent-gold px-2 py-0.5 rounded-full">
                    Today
                  </span>
                )}
                <span className="text-xs text-text-muted">
                  · {group.matches.length} match{group.matches.length !== 1 ? "es" : ""}
                </span>
              </div>

              {/* Match cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {group.matches.map((ko) => {
                  const homeTeam = teamMap.get(ko.homeTeamId);
                  const awayTeam = teamMap.get(ko.awayTeamId);
                  if (!homeTeam || !awayTeam) return null;

                  return (
                    <KnockoutMatchCard
                      key={ko.matchId}
                      ko={ko}
                      homeTeam={homeTeam}
                      awayTeam={awayTeam}
                      modelPred={predictions[ko.matchId]}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
