import { useState } from "react";
import {
  signalAccuracyData,
  getSignalAccuracySummary,
  computeCloserSignal,
} from "../../data/signalAccuracy";
import type { SignalAccuracyEntry, ScorelineProbability } from "../../data/signalAccuracy";
import { useResultsStore } from "../../store/resultsStore";
import { pickJudgeAuditData, getPickJudgeAuditSummary } from "../../data/pickJudgeAudit";
import type { PickJudgeAuditEntry } from "../../data/pickJudgeAudit";

type Round = "All" | "R32" | "R16" | "QF" | "SF" | "3P" | "F";
const ROUNDS: Round[] = ["All", "R32", "R16", "QF", "SF", "3P", "F"];

const isActualResult = (
  row: ScorelineProbability,
  regulationResult: { home: number; away: number } | null
) =>
  regulationResult != null &&
  row.home === regulationResult.home &&
  row.away === regulationResult.away;

export function SignalAccuracyTracker() {
  const [activeRound, setActiveRound] = useState<Round>("All");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [auditExpanded, setAuditExpanded] = useState(false);
  const [auditRowId, setAuditRowId] = useState<string | null>(null);

  const summary = getSignalAccuracySummary();
  const filtered =
    activeRound === "All"
      ? signalAccuracyData
      : signalAccuracyData.filter((e) => e.round === activeRound);

  return (
    <div className="bg-bg-secondary rounded-xl border border-border p-6">
      <h2 className="text-lg font-bold text-text-primary mb-1">
        Signal Accuracy Tracker
      </h2>
      <p className="text-sm text-text-muted mb-5">
        Alpha vs Model vs actual result — who read the knockout matches better
      </p>

      {/* Summary bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <StatCard label="Alpha closer" value={summary.alphaCloser} color="text-violet-400" />
        <StatCard label="Model closer" value={summary.modelCloser} color="text-accent-green" />
        <StatCard label="Tie" value={summary.tie} color="text-text-secondary" />
        <StatCard label="Excluded (AET)" value={summary.aetExcluded} color="text-text-muted" />
      </div>

      {/* Rule 23 badge */}
      {summary.rule23TriggeredCount > 0 && (
        <div className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10">
          <span className="text-xs font-bold text-amber-400">Rule 23</span>
          <span className="text-xs text-text-secondary">
            {summary.rule23TriggeredCount}x triggered — Alpha {summary.rule23Breakdown.alpha} · Tie{" "}
            {summary.rule23Breakdown.tie} · Model {summary.rule23Breakdown.model}
          </span>
        </div>
      )}

      {/* Round filter */}
      <div className="flex flex-wrap gap-2 mb-4">
        {ROUNDS.map((r) => (
          <button
            key={r}
            onClick={() => {
              setActiveRound(r);
              setExpandedId(null);
            }}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              activeRound === r
                ? "bg-accent-gold text-bg-primary"
                : "bg-bg-tertiary text-text-secondary hover:text-text-primary border border-border"
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <p className="text-sm text-text-muted py-6 text-center">
          No matches recorded yet for this round
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-text-secondary">
                <th className="py-2 pr-2 font-medium">Match</th>
                <th className="py-2 px-2 font-medium text-center">Result</th>
                <th className="py-2 px-2 font-medium text-center">α Rank</th>
                <th className="py-2 px-2 font-medium text-center">Model Rank</th>
                <th className="py-2 px-2 font-medium text-center">Closer</th>
                <th className="py-2 pl-2 font-medium text-center">Flags</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((entry) => (
                <MatchRow
                  key={entry.matchId}
                  entry={entry}
                  expanded={expandedId === entry.matchId}
                  onToggle={() =>
                    setExpandedId((id) =>
                      id === entry.matchId ? null : entry.matchId
                    )
                  }
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pick Judge Audit — collapsible, below the main tracker */}
      <PickJudgeAuditSection
        expanded={auditExpanded}
        onToggle={() => setAuditExpanded((v) => !v)}
        expandedRowId={auditRowId}
        onToggleRow={(id) => setAuditRowId((cur) => (cur === id ? null : id))}
      />
    </div>
  );
}

function PickJudgeAuditSection({
  expanded,
  onToggle,
  expandedRowId,
  onToggleRow,
}: {
  expanded: boolean;
  onToggle: () => void;
  expandedRowId: string | null;
  onToggleRow: (id: string) => void;
}) {
  const summary = getPickJudgeAuditSummary();

  return (
    <div className="mt-6 pt-5 border-t border-border">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between text-left"
      >
        <div>
          <h3 className="text-base font-bold text-text-primary">
            Pick Judge Audit
          </h3>
          <p className="text-xs text-text-muted mt-0.5">
            Before/after verification — original pick vs actual result, R32 → QF
          </p>
        </div>
        <span className="text-text-muted text-sm">{expanded ? "▾" : "▸"}</span>
      </button>

      {expanded && (
        <div className="mt-4">
          {/* Summary strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <StatCard label="Audited" value={summary.total} color="text-text-secondary" />
            <StatCard label="Exact" value={summary.exact} color="text-accent-green" />
            <StatCard label="Miss" value={summary.miss} color="text-red-400" />
            <StatCard label="Patches proposed" value={summary.patchesProposed} color="text-amber-400" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-text-secondary">
                  <th className="py-2 pr-2 font-medium">Match</th>
                  <th className="py-2 px-2 font-medium text-center">Actual</th>
                  <th className="py-2 px-2 font-medium text-center">CLI Pick</th>
                  <th className="py-2 px-2 font-medium text-center">Status</th>
                  <th className="py-2 pl-2 font-medium">Proposed Patch</th>
                </tr>
              </thead>
              <tbody>
                {pickJudgeAuditData.map((entry) => (
                  <PickJudgeAuditRow
                    key={entry.matchId}
                    entry={entry}
                    expanded={expandedRowId === entry.matchId}
                    onToggle={() => onToggleRow(entry.matchId)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function AuditStatusBadge({ status }: { status: PickJudgeAuditEntry["status"] }) {
  if (status === "exact") {
    return (
      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-accent-green/10 text-accent-green border border-accent-green/30">
        ✅ Exact
      </span>
    );
  }
  if (status === "miss") {
    return (
      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/30">
        ❌ Miss
      </span>
    );
  }
  return (
    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-bg-tertiary text-text-muted border border-border">
      Unverified
    </span>
  );
}

function PickJudgeAuditRow({
  entry,
  expanded,
  onToggle,
}: {
  entry: PickJudgeAuditEntry;
  expanded: boolean;
  onToggle: () => void;
}) {
  const pick = entry.originalPick;
  const pickStr = pick
    ? `${pick.home}-${pick.away}${pick.tier != null ? ` (Tier ${pick.tier})` : ""}`
    : "—";

  return (
    <>
      <tr
        className="border-b border-border/30 hover:bg-bg-tertiary/50 cursor-pointer"
        onClick={onToggle}
      >
        <td className="py-2 pr-2">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-mono text-text-muted">{entry.matchId}</span>
            <span className="text-xs font-medium text-text-primary">{entry.homeTeamId}</span>
            <span className="text-text-muted text-xs">vs</span>
            <span className="text-xs font-medium text-text-primary">{entry.awayTeamId}</span>
            <span className="text-text-muted text-xs ml-1">{expanded ? "▾" : "▸"}</span>
          </div>
        </td>
        <td className="py-2 px-2 text-center font-mono text-xs text-text-primary">
          {entry.actualResult.home}-{entry.actualResult.away}
        </td>
        <td className="py-2 px-2 text-center font-mono text-xs text-text-secondary">
          {pickStr}
        </td>
        <td className="py-2 px-2 text-center">
          <AuditStatusBadge status={entry.status} />
        </td>
        <td className="py-2 pl-2 text-xs text-text-secondary max-w-xs">
          {entry.proposedPatch ? (
            <div className="flex items-center gap-1.5">
              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/30 whitespace-nowrap">
                Candidate — not applied
              </span>
              <span className="truncate">{entry.proposedPatch}</span>
            </div>
          ) : (
            <span className="text-text-muted">—</span>
          )}
        </td>
      </tr>
      {expanded && (
        <tr className="border-b border-border/30">
          <td colSpan={5} className="py-3 px-4 bg-bg-tertiary/40 text-xs">
            {pick && pick.rulesTriggered.length > 0 && (
              <div className="mb-2">
                <span className="text-text-muted">Rules triggered: </span>
                <span className="text-text-secondary font-mono">
                  {pick.rulesTriggered.join(", ")}
                </span>
              </div>
            )}
            {entry.beforePickUnverified && (
              <div className="mb-2 text-amber-400">
                Before pick unverified from existing artifacts.
              </div>
            )}
            {entry.patchVerifiedResult && (
              <div className="mb-2">
                <span className="text-text-muted">Patch-verified result: </span>
                <span className="text-accent-green font-mono font-bold">
                  {entry.patchVerifiedResult.home}-{entry.patchVerifiedResult.away}
                </span>
                <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  Candidate — not applied to live engine
                </span>
              </div>
            )}
            {entry.auditNote && (
              <div className="text-text-secondary italic leading-relaxed">{entry.auditNote}</div>
            )}
          </td>
        </tr>
      )}
    </>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="bg-bg-tertiary rounded-lg p-3 text-center">
      <div className={`text-2xl font-mono font-bold ${color}`}>{value}</div>
      <div className="text-xs text-text-muted mt-1">{label}</div>
    </div>
  );
}

function CloserBadge({
  signal,
  rule25Flagged,
  isPending,
}: {
  signal?: string;
  rule25Flagged?: boolean;
  isPending?: boolean;
}) {
  if (isPending) {
    return (
      <span className="px-2 py-0.5 rounded-full text-xs font-medium border border-border text-text-muted">
        Pending
      </span>
    );
  }
  if (rule25Flagged) {
    return (
      <span className="px-2 py-0.5 rounded-full text-xs font-medium border border-amber-500/40 text-amber-400">
        AET excl.
      </span>
    );
  }
  if (signal === "alpha") {
    return (
      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-violet-500/10 text-violet-400 border border-violet-500/30">
        Alpha
      </span>
    );
  }
  if (signal === "model") {
    return (
      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-accent-green/10 text-accent-green border border-accent-green/30">
        Model
      </span>
    );
  }
  if (signal === "tie") {
    return (
      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-bg-tertiary text-text-muted border border-border">
        Tie
      </span>
    );
  }
  return null;
}

function MatchRow({
  entry,
  expanded,
  onToggle,
}: {
  entry: SignalAccuracyEntry;
  expanded: boolean;
  onToggle: () => void;
}) {
  // Same pattern as KnockoutMatchCard: fall back to the ESPN live results
  // store when this match hasn't had its result manually backfilled yet.
  const liveResult = useResultsStore((s) => s.getResultForMatch(entry.matchId));
  const finalResult =
    entry.finalResult ??
    (liveResult ? { home: liveResult.homeScore, away: liveResult.awayScore } : null);
  const regulationResult = entry.regulationResult ?? finalResult;
  const isPending = finalResult == null;

  const resultStr = isPending
    ? "Pending"
    : entry.wentToExtraTime && regulationResult
    ? `90' ${regulationResult.home}-${regulationResult.away} → 120' ${finalResult.home}-${finalResult.away}${entry.penaltyWinner ? ` (${entry.penaltyWinner} pens)` : ""}`
    : `${finalResult.home}-${finalResult.away}`;

  const signal = isPending ? undefined : computeCloserSignal(entry);

  return (
    <>
      <tr
        className="border-b border-border/30 hover:bg-bg-tertiary/50 cursor-pointer"
        onClick={onToggle}
      >
        <td className="py-2 pr-2">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-mono text-text-muted">
              {entry.matchId}
            </span>
            <span className="text-xs font-medium text-text-primary">
              {entry.homeTeamId}
            </span>
            <span className="text-text-muted text-xs">vs</span>
            <span className="text-xs font-medium text-text-primary">
              {entry.awayTeamId}
            </span>
            <span className="text-text-muted text-xs ml-1">
              {expanded ? "▾" : "▸"}
            </span>
          </div>
        </td>
        <td className="py-2 px-2 text-center font-mono text-xs text-text-primary">
          {resultStr}
        </td>
        <td className="py-2 px-2 text-center font-mono text-xs text-text-secondary">
          {entry.alphaActualRank != null ? `#${entry.alphaActualRank}` : "—"}
        </td>
        <td className="py-2 px-2 text-center font-mono text-xs text-text-secondary">
          {entry.modelActualRank != null ? `#${entry.modelActualRank}` : "—"}
        </td>
        <td className="py-2 px-2 text-center">
          <CloserBadge
            signal={signal}
            rule25Flagged={entry.rule25Flagged}
            isPending={isPending}
          />
        </td>
        <td className="py-2 pl-2 text-center">
          <div className="flex gap-1 justify-center">
            {entry.rule23Triggered && (
              <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/30">
                R23
              </span>
            )}
            {entry.rule25Flagged && (
              <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-bg-tertiary text-text-muted border border-border">
                R25
              </span>
            )}
          </div>
        </td>
      </tr>
      {expanded && (
        <tr className="border-b border-border/30">
          <td colSpan={6} className="py-3 px-4 bg-bg-tertiary/40">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Alpha scorelines */}
              <div>
                <div className="font-bold text-violet-400 mb-1.5">
                  Alpha Top Scorelines
                </div>
                {entry.alphaTopScorelines.map((s, i) => (
                  <div
                    key={i}
                    className="flex justify-between font-mono text-text-secondary py-0.5"
                  >
                    <span>
                      #{i + 1} {s.home}-{s.away}
                    </span>
                    <span
                      className={
                        isActualResult(s, regulationResult)
                          ? "text-accent-green font-bold"
                          : "text-text-muted"
                      }
                    >
                      {s.probability}%
                      {isActualResult(s, regulationResult) && " ✓"}
                    </span>
                  </div>
                ))}
                {entry.alphaImpliedLambdaHome != null && (
                  <div className="text-text-muted mt-1.5">
                    Implied λ: {entry.alphaImpliedLambdaHome.toFixed(2)} /{" "}
                    {entry.alphaImpliedLambdaAway?.toFixed(2)}
                  </div>
                )}
              </div>
              {/* Model scorelines */}
              <div>
                <div className="font-bold text-accent-green mb-1.5">
                  Model Top Scorelines (λ {entry.modelLambdaHome.toFixed(2)} /{" "}
                  {entry.modelLambdaAway.toFixed(2)})
                </div>
                {entry.modelTopScorelines.map((s, i) => (
                  <div
                    key={i}
                    className="flex justify-between font-mono text-text-secondary py-0.5"
                  >
                    <span>
                      #{i + 1} {s.home}-{s.away}
                    </span>
                    <span
                      className={
                        isActualResult(s, regulationResult)
                          ? "text-accent-green font-bold"
                          : "text-text-muted"
                      }
                    >
                      {s.probability}%
                      {isActualResult(s, regulationResult) && " ✓"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Always-visible actual result summary */}
            <div className="mt-3 pt-2 border-t border-border/50 bg-bg-secondary/40 rounded px-2 py-1.5 text-xs font-mono">
              {regulationResult == null ? (
                <span className="text-text-muted">Match not yet played</span>
              ) : (
                <>
                  <span className="text-text-muted">Resultado real </span>
                  <span className="text-text-primary font-bold">
                    {regulationResult.home}-{regulationResult.away}
                  </span>
                  <span className="text-text-muted">: </span>
                  <span className="text-violet-400">
                    Alpha {entry.alphaActualProbability != null ? `${entry.alphaActualProbability}%` : "—"}
                    {" "}(#{entry.alphaActualRank != null ? entry.alphaActualRank : "—"})
                  </span>
                  <span className="text-text-muted"> · </span>
                  <span className="text-accent-green">
                    Modelo {entry.modelActualProbability != null ? `${entry.modelActualProbability}%` : "—"}
                    {" "}(#{entry.modelActualRank != null ? entry.modelActualRank : "—"})
                  </span>
                </>
              )}
            </div>

            {/* Override reason (shown when closerSignalOverride is present) —
                this is the "AET Final Closer" verdict: who was closer to the
                scoreline that quiniela points actually get scored on. */}
            {entry.closerSignalOverride && (
              <div className="mt-2 pl-2 border-l-2 border-amber-500/50 text-xs text-text-secondary italic">
                <span className="text-amber-400 not-italic font-medium">
                  AET Final Closer (manual judgment):{" "}
                </span>
                {entry.closerSignalOverride.reason}
              </div>
            )}

            {/* Regulation-time (90') dimension — separate from AET Final Closer
                above. Only alpha gets a closer/rank verdict here since its
                markets price regulation time only; the model's single pick
                targets the final result, so it gets an explanatory note. */}
            {entry.wentToExtraTime && entry.regulationResult && (
              <div className="mt-2 pl-2 border-l-2 border-sky-500/50 text-xs text-text-secondary">
                <div className="text-sky-400 font-medium mb-1">
                  Regulation Closer (90' {entry.regulationResult.home}-{entry.regulationResult.away}):
                </div>
                <div className="text-violet-400">
                  Alpha: {entry.alphaRegulationRank != null ? `#${entry.alphaRegulationRank}` : "—"}
                  {entry.alphaRegulationCloser && " ✓ closer"}
                </div>
                {entry.modelRegulationNote && (
                  <div className="text-text-muted italic mt-1">{entry.modelRegulationNote}</div>
                )}
              </div>
            )}

            {entry.notes && (
              <div className="mt-3 pt-2 border-t border-border/30 text-xs text-text-secondary italic">
                {entry.notes}
              </div>
            )}
          </td>
        </tr>
      )}
    </>
  );
}
