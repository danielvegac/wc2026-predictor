import { useMemo, useRef, useEffect } from "react";
import { groupStageSchedule } from "../../data/schedule";
import { getTeamMap } from "../../data/teams";
import { usePredictionStore } from "../../store/predictionStore";
import { MatchCard } from "./MatchCard";
import type { Match } from "../../types";

const teamMap = getTeamMap();

/** Parse kickoffCOT like "2:00 PM" into minutes since midnight for sorting */
function parseKickoffMinutes(kickoff?: string): number {
  if (!kickoff) return 720; // default to noon
  const match = kickoff.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return 720;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3].toUpperCase();
  if (period === "AM" && hours === 12) hours = 0;
  if (period === "PM" && hours !== 12) hours += 12;
  return hours * 60 + minutes;
}

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
  matches: Match[];
  isToday: boolean;
}

export function MatchesByDate() {
  const predictions = usePredictionStore((s) => s.predictions);
  const setPrediction = usePredictionStore((s) => s.setPrediction);
  const locked = usePredictionStore((s) => s.locked);
  const todayRef = useRef<HTMLDivElement>(null);

  const dateGroups = useMemo(() => {
    const today = getTodayStr();

    // Sort all matches by date then by kickoff time
    const sorted = [...groupStageSchedule].sort((a, b) => {
      const dateCmp = a.date.localeCompare(b.date);
      if (dateCmp !== 0) return dateCmp;
      return parseKickoffMinutes(a.kickoffCOT) - parseKickoffMinutes(b.kickoffCOT);
    });

    // Group by date
    const map = new Map<string, Match[]>();
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
  }, []);

  // Scroll today's section into view on mount
  useEffect(() => {
    if (todayRef.current) {
      todayRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  return (
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
            {group.matches.map((match) => {
              const homeTeam = teamMap.get(match.homeTeamId);
              const awayTeam = teamMap.get(match.awayTeamId);
              if (!homeTeam || !awayTeam) return null;

              return (
                <MatchCard
                  key={match.id}
                  match={match}
                  homeTeam={homeTeam}
                  awayTeam={awayTeam}
                  prediction={predictions[match.id]}
                  onScoreChange={setPrediction}
                  disabled={locked}
                />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
