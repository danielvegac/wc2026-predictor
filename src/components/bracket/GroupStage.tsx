import { groups } from "../../data/groups";
import { getTeamMap } from "../../data/teams";
import { getFlagClass } from "../../data/flags";
import {
  usePredictionStore,
  GROUP_STAGE_MATCHES,
} from "../../store/predictionStore";
import { MatchCard } from "../prediction/MatchCard";
import { GroupTable } from "./GroupTable";

const teamMap = getTeamMap();

// Alphabetical group order
const orderedGroups = [...groups].sort((a, b) =>
  a.name.localeCompare(b.name)
);

export function GroupStage() {
  const predictions = usePredictionStore((s) => s.predictions);
  const setPrediction = usePredictionStore((s) => s.setPrediction);
  const locked = usePredictionStore((s) => s.locked);
  const getGroupStandings = usePredictionStore((s) => s.getGroupStandings);
  const getTotalProgress = usePredictionStore((s) => s.getTotalProgress);

  const { completed, total } = getTotalProgress();
  const progressPct = total > 0 ? (completed / total) * 100 : 0;

  return (
    <div>
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-text-secondary">
            Group Stage Predictions
          </span>
          <span className="font-mono text-sm">
            <span className="text-accent-gold font-bold">{completed}</span>
            <span className="text-text-muted"> / {total}</span>
          </span>
        </div>
        <div className="h-2 bg-bg-tertiary rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${progressPct}%`,
              background:
                completed === total
                  ? "#059669"
                  : "linear-gradient(90deg, #2563EB, #D97706)",
            }}
          />
        </div>
      </div>

      {/* Groups grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {orderedGroups.map((group) => {
          const groupMatches = GROUP_STAGE_MATCHES.filter(
            (m) => m.group === group.name
          );
          const groupPredCount = groupMatches.filter(
            (m) => predictions[m.id]
          ).length;
          const isComplete = groupPredCount === 6;
          const standings = getGroupStandings(group.name);

          return (
            <div
              key={group.name}
              className="rounded-xl border border-border bg-white shadow-sm overflow-hidden"
            >
              {/* Group header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-border-light bg-bg-secondary">
                <div className="flex items-center gap-3">
                  <span className="text-base font-bold text-text-primary">
                    Group {group.name}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {group.teamIds.map((id) => (
                      <span
                        key={id}
                        className={`${getFlagClass(id)} text-sm`}
                        title={teamMap.get(id)?.name}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-text-muted">
                    {groupPredCount}/6
                  </span>
                  {isComplete && (
                    <span className="text-accent-green text-sm font-bold">
                      &#10003;
                    </span>
                  )}
                </div>
              </div>

              {/* Matches */}
              <div className="p-3 space-y-2">
                {groupMatches.map((match) => {
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

              {/* Standings table */}
              <div className="px-3 pb-4 pt-1 border-t border-border-light">
                <GroupTable
                  standings={standings}
                  teams={teamMap}
                  groupName={group.name}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
