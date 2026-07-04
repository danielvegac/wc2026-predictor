import { useMemo, useRef, useEffect, useState } from "react";
import { knockoutMatches, type KnockoutMatch } from "../../data/knockoutMatches";
import { getTeamMap } from "../../data/teams";
import { useModelPredictionStore } from "../../store/modelPredictionStore";
import { KnockoutMatchCard } from "./KnockoutMatchCard";
import { getTodayCOT, formatDateLabelCOT, parseKickoffMinutesCOT } from "../../utils/timezone";

const teamMap = getTeamMap();

interface DateGroup {
  date: string;
  label: string;
  matches: KnockoutMatch[];
  isToday: boolean;
}

function RoundSection({
  title,
  badge,
  matches,
  defaultCollapsed = false,
}: {
  title: string;
  badge: string;
  matches: KnockoutMatch[];
  defaultCollapsed?: boolean;
}) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const predictions = useModelPredictionStore((s) => s.predictions);
  const todayRef = useRef<HTMLDivElement>(null);

  const dateGroups = useMemo(() => {
    const today = getTodayCOT();

    const sorted = [...matches].sort((a, b) => {
      const dateCmp = a.date.localeCompare(b.date);
      if (dateCmp !== 0) return dateCmp;
      return parseKickoffMinutesCOT(a.kickoffCOT) - parseKickoffMinutesCOT(b.kickoffCOT);
    });

    const map = new Map<string, KnockoutMatch[]>();
    for (const m of sorted) {
      const list = map.get(m.date) ?? [];
      list.push(m);
      map.set(m.date, list);
    }

    const groups: DateGroup[] = [];
    for (const [date, matchList] of map) {
      groups.push({ date, label: formatDateLabelCOT(date), matches: matchList, isToday: date === today });
    }

    return groups;
  }, [matches]);

  useEffect(() => {
    if (todayRef.current) {
      todayRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  if (matches.length === 0) return null;

  return (
    <div className="mt-10">
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="flex items-center gap-3 mb-6 cursor-pointer group w-full"
      >
        <h2 className="text-xl font-bold text-text-primary group-hover:text-accent-gold transition-colors">
          {title}
        </h2>
        <span className="text-[10px] font-bold uppercase tracking-wider bg-accent-gold/10 text-accent-gold px-2.5 py-1 rounded-full">
          {badge}
        </span>
        <span className="text-xs text-text-muted">
          · {matches.length} matches
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

export function KnockoutSection() {
  const r32Matches = useMemo(() => knockoutMatches.filter((m) => m.round === "R32"), []);
  const r16Matches = useMemo(() => knockoutMatches.filter((m) => m.round === "R16"), []);

  return (
    <>
      <RoundSection
        title="Round of 16"
        badge="Knockout Stage"
        matches={r16Matches}
      />
      <RoundSection
        title="Round of 32"
        badge="Knockout Stage"
        matches={r32Matches}
        defaultCollapsed={true}
      />
    </>
  );
}
