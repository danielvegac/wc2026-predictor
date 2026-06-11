import type { GroupStanding, Team } from "../../types";
import { getFlagClass } from "../../data/flags";

interface GroupTableProps {
  standings: GroupStanding[] | null;
  teams: Map<string, Team>;
  groupName: string;
}

export function GroupTable({ standings, teams }: GroupTableProps) {
  if (!standings) {
    return (
      <div className="text-center py-3 text-text-muted text-xs">
        Predict all 6 matches to see standings
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="text-text-muted uppercase tracking-wider border-b border-border-light">
            <th className="text-left py-2 pl-3 pr-1 font-medium">#</th>
            <th className="text-left py-2 pr-2 font-medium">Team</th>
            <th className="text-center py-2 px-1 font-medium">P</th>
            <th className="text-center py-2 px-1 font-medium">W</th>
            <th className="text-center py-2 px-1 font-medium">D</th>
            <th className="text-center py-2 px-1 font-medium">L</th>
            <th className="text-center py-2 px-1 font-medium">GD</th>
            <th className="text-right py-2 pr-3 font-medium">Pts</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((s) => {
            const team = teams.get(s.teamId);
            if (!team) return null;

            const qualifyColor =
              s.position <= 2
                ? "border-l-2 border-l-accent-green"
                : s.position === 3
                ? "border-l-2 border-l-accent-gold"
                : "border-l-2 border-l-transparent";

            return (
              <tr
                key={s.teamId}
                className={`${qualifyColor} hover:bg-bg-tertiary/50 transition-colors`}
              >
                <td className="py-2 pl-3 pr-1 font-mono text-text-muted">
                  {s.position}
                </td>
                <td className="py-2 pr-2">
                  <div className="flex items-center gap-2">
                    <span className={`${getFlagClass(team.id)} text-sm`} />
                    <span className="font-medium text-text-primary">
                      {team.name}
                    </span>
                  </div>
                </td>
                <td className="text-center py-2 px-1 font-mono text-text-secondary">
                  {s.played}
                </td>
                <td className="text-center py-2 px-1 font-mono text-text-secondary">
                  {s.won}
                </td>
                <td className="text-center py-2 px-1 font-mono text-text-secondary">
                  {s.drawn}
                </td>
                <td className="text-center py-2 px-1 font-mono text-text-secondary">
                  {s.lost}
                </td>
                <td
                  className={`text-center py-2 px-1 font-mono font-medium ${
                    s.goalDifference > 0
                      ? "text-accent-green"
                      : s.goalDifference < 0
                      ? "text-accent-red"
                      : "text-text-secondary"
                  }`}
                >
                  {s.goalDifference > 0 ? `+${s.goalDifference}` : s.goalDifference}
                </td>
                <td className="text-right py-2 pr-3 font-mono font-bold text-text-primary">
                  {s.points}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
