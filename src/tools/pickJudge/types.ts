export interface TournamentRecord {
  wins: number;
  draws: number;
  losses: number;
  cleanSheets: number;
  goalsConceded: number;
  goalsScored: number;
}

export interface AlphaSignals {
  // LOW SCORING — use highest valid score (noise floor: 60)
  underTopScore: number;        // e.g. 82 for Under3 Score=82
  bttsNoScore: number;          // e.g. 79

  // HIGH SCORING
  bttsYesScore: number;         // e.g. 65 for FRA-SWE
  overTopScore: number;         // e.g. 75 for Over2 in FRA-SWE

  // HOME AH CASCADE
  homeAHBestScore: number;      // Best home AH line Score
  homeAHBestLine: number;       // e.g. -1.5 (negative = home giving goals)
  homeAHConsecutiveAbove80: number; // lines consecutively Score>80

  // AWAY AH CASCADE
  awayAHBestScore: number;      // Best away AH line Score
  awayAHBestLine: number;       // e.g. +1.0 (positive = away getting goals)
  awayAHConsecutiveAbove80: number;

  // OUTRIGHT RESULT
  homeWinScore: number;         // 1X2 Home Score (0 = no value found)
  awayWinScore: number;         // 1X2 Away Score
  homeValueMarketsFound: number; // count of Result Home markets with value
  awayValueMarketsFound: number;

  // CORRECT SCORE (explicit scoreline markets)
  cs00Score: number;            // Correct Score 0-0
  csHomeCleanSheetScore: number; // Best CS with home winning + away 0 (e.g. 1-0, 2-0)
  csAwayCleanSheetScore: number; // Best CS with away winning + home 0 (e.g. 0-1, 0-2)
  csHighScoringHomeScore: number; // CS home high-score (e.g. 3-2 Score=0 in FRA-SWE)

  // MATCH OUTCOME CHART (alpha's projected win% for 90min)
  alphaHomeWinPct: number;      // e.g. 18.4 for Mexico vs Ecuador
  alphaDrawPct: number;
  alphaAwayWinPct: number;

  // LEAGUE CONTEXT
  leagueBttsPct: number;        // historical league avg (e.g. 44.4)
  matchProjectedBttsPct: number; // this match projection (e.g. 28.4)
  leagueOver25Pct: number;
  matchProjectedOver25Pct: number;
  projectedGoalsPerMatch: number; // e.g. 3.74 for FRA-SWE, 1.60 for MEX-ECU

  // CLIMATE (net factor: >1.0 = favors home, <1.0 = favors away)
  climateNetFactor: number;     // homeClimate / awayClimate combined

  // EXPECTED GOALS (from Alphametrico adjusted dots)
  awayAdjustedLambda?: number;  // orange/adjusted away xG per match from Alphametrico

  // GOAL DISTRIBUTION (from Alphametrico goal distribution chart)
  goalDistribution?: {
    awayPeakAtZeroPct: number;  // % probability at 0 goals for away team
    homePeakAtZeroPct?: number; // optional
  };
}

export interface PickJudgeInput {
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  stage: 'group' | 'knockout';

  // MODEL
  modelPick: { home: number; away: number };
  homeElo: number;
  awayElo: number;
  // eloDiff = homeElo - awayElo (positive = home stronger)

  // TOURNAMENT FORM (WC2026 matches only, as of match day)
  homeTournament: TournamentRecord;
  awayTournament: TournamentRecord;
  homeFormMultiplier: number;   // from matchInsights.ts recency-weighted
  awayFormMultiplier: number;

  // CONTEXT FLAGS
  homeIsCoHost: boolean;        // USA, MEX, CAN
  awayIsCoHost: boolean;
  playingAtIconicHomeStadium: boolean; // Azteca etc.
  hasDocumentedRotation: boolean; // known rotation/rest by favorite
  hasDocumentedDemoralization: boolean; // opponent provably demoralized

  // ALPHA
  alpha: AlphaSignals;

  // FIELD CONSENSUS (optional tiebreaker)
  fieldTopPick?: { home: number; away: number };
  fieldTopPickPct?: number;     // % of field on that pick (e.g. 0.31 for 31%)
}

export interface RuleCheck {
  ruleId: string;
  triggered: boolean;
  reason: string;
}

export interface PickJudgeOutput {
  finalPick: { home: number; away: number };
  tier: 1 | 2 | 3;
  tierWouldHaveBeen?: 2 | 3;   // what tier alpha would have pushed to without veto
  vetoedBy?: string;            // rule that blocked the higher tier
  rulesTriggered: string[];
  reasoning: string[];          // ordered human-readable chain, one step per line
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
}
