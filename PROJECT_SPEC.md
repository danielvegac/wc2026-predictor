# WC2026 Predictor — Project Specification

## Overview

A full-bracket World Cup 2026 match predictor and simulator. Users predict all 104 matches upfront (scores + outcomes), then compare their guesses against a Monte Carlo simulation engine powered by Elo ratings, Poisson goal-scoring models, and squad strength data.

**Core value prop:** "Your football brain vs. the math — who predicts the World Cup better?"

---

## Tournament Structure

### Format
- **48 teams** in **12 groups** of 4
- **Group stage:** 72 matches (6 per group)
- **Round of 32:** 16 matches (top 2 per group + 8 best third-place teams)
- **Round of 16:** 8 matches
- **Quarter-finals:** 4 matches
- **Semi-finals:** 2 matches
- **Third-place playoff:** 1 match
- **Final:** 1 match
- **Total: 104 matches**

### Advancement Rules
- Top 2 per group advance automatically
- 8 best third-place teams also advance (ranked by: points → goal difference → goals scored → team conduct → FIFA ranking)
- Knockout matches: extra time + penalties if drawn after 90 minutes

### Groups

```
Group A: Mexico, South Korea, South Africa, Czechia
Group B: Canada, Qatar, Switzerland, Bosnia and Herzegovina
Group C: Brazil, Morocco, Haiti, Scotland
Group D: United States, Paraguay, Australia, Türkiye
Group E: Germany, Ecuador, Ivory Coast, Curaçao
Group F: Netherlands, Japan, Sweden, Tunisia
Group G: Belgium, Egypt, Iran, New Zealand
Group H: Spain, Uruguay, Saudi Arabia, Cape Verde
Group I: France, Senegal, Norway, Iraq
Group J: Argentina, Austria, Algeria, Jordan
Group K: Colombia, Portugal, Uzbekistan, DR Congo
Group L: England, Croatia, Panama, Ghana
```

### Group Stage Schedule (Match Days)

Each group has 3 match days with 2 matches per day:
- MD1: Team1 vs Team2, Team3 vs Team4
- MD2: Team1 vs Team3, Team2 vs Team4
- MD3: Team1 vs Team4, Team2 vs Team3

Standard FIFA World Cup pairing: Pot positions define matchups.

---

## Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Framework | React 19 + Vite | Matches Daniel's existing stack (Panini tracker) |
| Styling | Tailwind CSS 4 | Familiar, fast iteration |
| Language | TypeScript | Type safety for complex data models |
| State | Zustand | Lightweight, no boilerplate |
| Simulation | Client-side JS | Poisson + Monte Carlo runs fine in-browser |
| Data refresh | Vercel API routes | Serverless functions for Fotmob/FIFA data pulls |
| Hosting | Vercel | Existing deployment workflow |
| Storage | localStorage + optional Supabase | Persist user predictions across sessions |

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    FRONTEND (React)                  │
│                                                     │
│  ┌──────────┐  ┌──────────┐  ┌───────────────────┐  │
│  │ Bracket  │  │ Simulator│  │   Comparison      │  │
│  │ Input    │  │ Results  │  │   Dashboard       │  │
│  │ (User    │  │ (Model   │  │   (User vs Model) │  │
│  │ Guesses) │  │ Predict) │  │                   │  │
│  └──────────┘  └──────────┘  └───────────────────┘  │
│         │              │               │             │
│         ▼              ▼               ▼             │
│  ┌─────────────────────────────────────────────┐     │
│  │          ZUSTAND STORE                      │     │
│  │  - userPredictions: Match[]                 │     │
│  │  - simulationResults: SimResult[]           │     │
│  │  - teamData: Team[]                         │     │
│  │  - tournamentState: TournamentState         │     │
│  └─────────────────────────────────────────────┘     │
│                        │                             │
│         ┌──────────────┼──────────────┐              │
│         ▼              ▼              ▼              │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐        │
│  │ Poisson   │  │ Elo       │  │ Monte     │        │
│  │ Engine    │  │ Calculator│  │ Carlo Sim │        │
│  └───────────┘  └───────────┘  └───────────┘        │
│                                                     │
└─────────────────────────────────────────────────────┘
         │
         ▼ (optional live refresh)
┌─────────────────────────┐
│  Vercel API Routes      │
│  /api/refresh-elo       │
│  /api/refresh-fotmob    │
│  /api/refresh-rankings  │
└─────────────────────────┘
```

---

## Data Model

### Team

```typescript
interface Team {
  id: string;                    // ISO 3166 alpha-3 (e.g. "COL", "ARG")
  name: string;                  // Full name
  shortName: string;             // 3-letter code
  group: string;                 // "A" through "L"
  confederation: Confederation;  // AFC, CAF, CONCACAF, CONMEBOL, OFC, UEFA
  fifaRanking: number;
  eloRating: number;

  // Strength metrics (derived from data)
  attackStrength: number;        // Goals scored per match, weighted recent
  defenseStrength: number;       // Goals conceded per match, weighted recent
  squadStrengthIndex: number;    // % of squad in top-5 leagues (0-1)
  formIndex: number;             // Weighted W/D/L from last 10 matches (0-1)

  // Historical data
  last50Matches: MatchRecord[];  // Simplified match history
  qualificationRecord: QualRecord;

  // Meta
  flagEmoji: string;
  primaryColor: string;
  isHost: boolean;               // USA, MEX, CAN
}

type Confederation = "AFC" | "CAF" | "CONCACAF" | "CONMEBOL" | "OFC" | "UEFA";

interface MatchRecord {
  opponent: string;              // Team ID
  date: string;                  // ISO date
  goalsFor: number;
  goalsAgainst: number;
  venue: "home" | "away" | "neutral";
  competition: string;           // "WCQ", "Friendly", "Nations League", etc.
  weight: number;                // Recency weight (1.0 = most recent, decays)
}

interface QualRecord {
  confederation: Confederation;
  groupPosition: number | null;  // 1st, 2nd, 3rd in qual group
  matchesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  qualifiedVia: "auto" | "group" | "playoff" | "host";
}
```

### Match / Prediction

```typescript
interface Match {
  id: string;                    // "GS-A-1", "R32-1", "QF-3", "F"
  stage: Stage;
  group?: string;                // Only for group stage
  homeTeam: string;              // Team ID (or TBD for knockout)
  awayTeam: string;
  matchday?: number;             // 1, 2, 3 for group stage
  date: string;                  // Scheduled date
  venue: string;
}

type Stage = "group" | "round32" | "round16" | "quarterfinal" | "semifinal" | "third_place" | "final";

interface Prediction {
  matchId: string;
  homeGoals: number;
  awayGoals: number;
  source: "user" | "model";
  // For knockout stages with draws:
  penaltyWinner?: string;        // Team ID if match drawn in knockout
}

interface SimulationResult {
  matchId: string;
  homeWinProbability: number;    // 0-1
  drawProbability: number;       // 0-1
  awayWinProbability: number;    // 0-1
  expectedHomeGoals: number;     // Lambda for Poisson
  expectedAwayGoals: number;
  mostLikelyScore: [number, number];
  scoreDistribution: Map<string, number>; // "2-1" -> 0.08
}
```

### Tournament State

```typescript
interface TournamentState {
  groupStandings: Record<string, GroupStanding[]>;  // group letter -> standings
  knockoutBracket: KnockoutMatch[];
  champion: string | null;
  runnerUp: string | null;
  thirdPlace: string | null;

  // Monte Carlo aggregate (from N simulations)
  championProbabilities: Record<string, number>;     // team -> probability
  podiumProbabilities: Record<string, { champion: number; runnerUp: number; thirdPlace: number }>;
  advancementProbabilities: Record<string, Record<Stage, number>>; // team -> stage -> prob
}

interface GroupStanding {
  teamId: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  position: number;
}
```

---

## Statistical Model

### 1. Elo Rating System

Each team starts with their current Elo rating. Match expectations:

```
E_home = 1 / (1 + 10^((elo_away - elo_home - HOME_ADVANTAGE) / 400))
```

- `HOME_ADVANTAGE = 0` for neutral venues (all World Cup matches)
- K-factor varies by competition: World Cup = 60, Qualifiers = 40, Friendlies = 20

### 2. Attack/Defense Strength (Dixon-Coles Inspired)

For each team, calculate:

```
attack_strength = (team_goals_scored / team_matches) / league_average_goals
defense_strength = (team_goals_conceded / team_matches) / league_average_goals
```

Where "league average goals" is the global average across all 48 teams' recent matches.

Weight recent matches more heavily:
```
weight(match) = e^(-decay * days_since_match)
decay = 0.003  // Half-life ≈ 230 days
```

### 3. Poisson Goal Model

Expected goals for a match:

```
lambda_home = attack_home * defense_away * tournament_avg_goals * elo_adjustment
lambda_away = attack_away * defense_home * tournament_avg_goals * elo_adjustment
```

Where:
- `tournament_avg_goals ≈ 1.35` (per team per match, historical World Cup average)
- `elo_adjustment` scales lambda based on Elo difference

Probability of a specific score (h, a):

```
P(h, a) = (e^(-λ_h) * λ_h^h / h!) * (e^(-λ_a) * λ_a^a / a!)
```

### 4. Monte Carlo Tournament Simulation

Run N = 10,000 full tournament simulations:

1. **Group stage:** Simulate all 72 matches using Poisson. Compute standings.
2. **Determine third-place qualifiers:** Rank all 12 third-place teams, pick top 8.
3. **Knockout bracket:** Map teams to R32 slots per FIFA's bracket structure.
4. **Simulate knockout:** For each match, if drawn → generate penalty winner based on Elo-weighted coin flip (slight favorite bias).
5. **Record results:** Champion, runner-up, third place per simulation.
6. **Aggregate:** Championship probability = count / N for each team.

### 5. Qualitative Adjustments (Optional Layer)

Allow manual overrides or LLM-generated adjustments:
- Manager factor (new manager boost/penalty)
- Key player injury multiplier (e.g., reduce attack strength by X%)
- Tournament experience factor (World Cup appearances)
- Host nation boost (for USA, Mexico, Canada matches in their territory)
- "Dark horse" factor (user-defined confidence adjustment)

---

## UI Design Concept

### Design Direction: "Broadcast Data Room"

Inspired by the data overlays you see on football broadcasts (Sky Sports, ESPN match centers) crossed with a dark-mode tactical board. Not the generic dashboard look — think of the aesthetic of a football analytics studio.

### Color Palette

```
--bg-primary: #0A0E17        // Deep navy-black (broadcast backdrop)
--bg-secondary: #111827      // Card surfaces
--bg-tertiary: #1E293B       // Hover/active states
--accent-gold: #F59E0B       // Winner highlights, champion
--accent-green: #10B981      // Correct predictions, goals for
--accent-red: #EF4444        // Wrong predictions, goals against
--accent-blue: #3B82F6       // Model predictions, probabilities
--text-primary: #F8FAFC      // Main text
--text-secondary: #94A3B8    // Labels, metadata
--text-muted: #475569        // Disabled, tertiary info
--pitch-green: #15803D       // Pitch-colored accents (sparingly)
```

### Typography
- Display: **Inter** (700/800 weight) — clean, data-forward
- Body: **Inter** (400/500) — consistency
- Data/Monospace: **JetBrains Mono** — scores, probabilities, stats

### Key Screens

#### 1. Full Bracket View (Primary Screen)
- All 12 groups displayed as compact tables (2 columns of 6)
- Each group shows: team flags, user's predicted scores, model scores side by side
- Color-coded: green border = user matches model, amber = close, red = divergent
- Below groups: knockout bracket visualization (tournament tree)
- Sticky header: overall accuracy score, champion pick comparison

#### 2. Match Prediction Card
- When clicking a match: expanded card with:
  - Team flags, names, Elo ratings
  - Score input (user guess): two number inputs with +/- steppers
  - Model prediction: displayed alongside with probability bar
  - Score probability heatmap (small grid showing P for each scoreline)
  - "Lock prediction" button

#### 3. Comparison Dashboard (MVP Priority #1)
- Split view: left = user bracket, right = model bracket
- Summary stats at top:
  - Correct results (W/D/L): X/72 group, X/32 knockout
  - Exact scores predicted: X/104
  - Points system: 3 pts correct result, 5 pts exact score
  - Champion/runner-up/third accuracy
- Divergence highlights: "Your biggest disagreements with the model"
- Leaderboard potential (for shareable predictions feature later)

#### 4. Simulation Dashboard
- Championship probability bar chart (all 48 teams, sorted)
- Advancement probability heatmap (team × stage)
- "Run simulation" button (re-runs Monte Carlo with current parameters)
- Distribution charts for finalist matchups

---

## Implementation Phases

### Phase 1: Core Engine + Data (Local, CLI-testable)
- [ ] Set up Vite + React + TypeScript + Tailwind project
- [ ] Define all TypeScript interfaces
- [ ] Create static team data JSON (48 teams with Elo, FIFA rank, strength metrics)
- [ ] Implement Poisson probability calculator
- [ ] Implement single match simulator
- [ ] Implement full group stage simulator
- [ ] Implement knockout bracket generator (including 3rd-place logic)
- [ ] Implement Monte Carlo tournament simulator (10K runs)
- [ ] Unit tests for simulation engine

### Phase 2: User Prediction Input
- [ ] Group stage prediction UI (all 72 matches)
- [ ] Knockout bracket prediction UI (auto-fills teams from group predictions)
- [ ] Score input components with validation
- [ ] Persist predictions to localStorage
- [ ] "Lock all predictions" flow

### Phase 3: Comparison Dashboard (MVP)
- [ ] Side-by-side user vs model display
- [ ] Scoring system implementation
- [ ] Divergence analysis
- [ ] Group standings comparison
- [ ] Champion/runner-up/third comparison

### Phase 4: Live Data + Deployment
- [ ] Vercel API routes for data refresh
- [ ] Fotmob unofficial API integration (match results, team stats)
- [ ] FIFA ranking refresh endpoint
- [ ] Auto-update Elo after real matches are played
- [ ] Deploy to Vercel

### Phase 5: Polish + Share
- [ ] Shareable prediction links (URL-encoded or Supabase-stored)
- [ ] Real match results integration (as WC progresses)
- [ ] Accuracy tracking vs actual results
- [ ] Mobile-responsive design
- [ ] PWA support

---

## File Structure

```
wc2026-predictor/
├── public/
│   └── flags/                    # SVG flags for all 48 teams
├── src/
│   ├── components/
│   │   ├── bracket/
│   │   │   ├── GroupTable.tsx
│   │   │   ├── GroupStage.tsx
│   │   │   ├── KnockoutBracket.tsx
│   │   │   └── MatchCard.tsx
│   │   ├── prediction/
│   │   │   ├── ScoreInput.tsx
│   │   │   ├── PredictionCard.tsx
│   │   │   └── LockPredictions.tsx
│   │   ├── dashboard/
│   │   │   ├── ComparisonView.tsx
│   │   │   ├── AccuracyScore.tsx
│   │   │   ├── DivergencePanel.tsx
│   │   │   └── ChampionProbChart.tsx
│   │   ├── simulation/
│   │   │   ├── SimulationControls.tsx
│   │   │   ├── ProbabilityHeatmap.tsx
│   │   │   └── ScoreDistribution.tsx
│   │   └── ui/
│   │       ├── TeamBadge.tsx
│   │       ├── ProgressBar.tsx
│   │       └── Tooltip.tsx
│   ├── engine/
│   │   ├── poisson.ts             # Poisson probability calculator
│   │   ├── elo.ts                 # Elo rating system
│   │   ├── matchSimulator.ts      # Single match simulation
│   │   ├── groupSimulator.ts      # Full group stage simulation
│   │   ├── knockoutSimulator.ts   # Knockout bracket + simulation
│   │   ├── monteCarlo.ts          # Full tournament Monte Carlo
│   │   └── strengthCalculator.ts  # Team strength metrics
│   ├── data/
│   │   ├── teams.ts               # All 48 teams with static data
│   │   ├── groups.ts              # Group compositions
│   │   ├── schedule.ts            # Match schedule with dates/venues
│   │   └── bracketStructure.ts    # R32 bracket mapping rules
│   ├── store/
│   │   ├── predictionStore.ts     # User predictions (Zustand)
│   │   ├── simulationStore.ts     # Model results (Zustand)
│   │   └── tournamentStore.ts     # Combined tournament state
│   ├── hooks/
│   │   ├── useSimulation.ts
│   │   ├── usePredictions.ts
│   │   └── useComparison.ts
│   ├── types/
│   │   └── index.ts               # All TypeScript interfaces
│   ├── utils/
│   │   ├── scoring.ts             # Points calculation (user vs model)
│   │   ├── formatting.ts          # Score display, probability formatting
│   │   └── thirdPlaceRanking.ts   # 3rd-place team ranking logic
│   ├── api/                       # Vercel serverless functions
│   │   ├── refresh-elo.ts
│   │   ├── refresh-fotmob.ts
│   │   └── refresh-rankings.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── tests/
│   ├── engine/
│   │   ├── poisson.test.ts
│   │   ├── matchSimulator.test.ts
│   │   └── monteCarlo.test.ts
│   └── utils/
│       └── scoring.test.ts
├── PROJECT_SPEC.md                # This file
├── AGENTS.md                      # Claude Code instructions (symlink or copy)
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
├── vercel.json
└── .env.example
```

---

## Initial Team Data (Baseline)

Elo ratings approximate as of June 2026. These serve as the static baseline.
Attack/defense strength and form index should be calculated from the last50Matches data.

| Team | Group | Confed | Approx Elo | FIFA Rank (approx) |
|------|-------|--------|-----------|-------------------|
| Argentina | J | CONMEBOL | 2060 | 2 |
| France | I | UEFA | 2010 | 4 |
| Spain | H | UEFA | 2040 | 1 |
| England | L | UEFA | 1980 | 5 |
| Brazil | C | CONMEBOL | 1970 | 3 |
| Germany | E | UEFA | 1940 | 8 |
| Netherlands | F | UEFA | 1930 | 7 |
| Portugal | K | UEFA | 1950 | 6 |
| Belgium | G | UEFA | 1900 | 9 |
| Colombia | K | CONMEBOL | 1890 | 10 |
| Croatia | L | UEFA | 1880 | 11 |
| Uruguay | H | CONMEBOL | 1870 | 12 |
| Japan | F | AFC | 1840 | 13 |
| Morocco | C | CAF | 1830 | 14 |
| United States | D | CONCACAF | 1820 | 15 |
| Mexico | A | CONCACAF | 1810 | 16 |
| Senegal | I | CAF | 1790 | 17 |
| Switzerland | B | UEFA | 1800 | 18 |
| Austria | J | UEFA | 1770 | 19 |
| Türkiye | D | UEFA | 1760 | 20 |
| South Korea | A | AFC | 1750 | 22 |
| Ecuador | E | CONMEBOL | 1730 | 24 |
| Norway | I | UEFA | 1720 | 25 |
| Sweden | F | UEFA | 1710 | 26 |
| Egypt | G | CAF | 1700 | 28 |
| Algeria | J | CAF | 1690 | 29 |
| Australia | D | AFC | 1680 | 23 |
| Iran | G | AFC | 1670 | 21 |
| Ivory Coast | E | CAF | 1660 | 30 |
| Canada | B | CONCACAF | 1650 | 35 |
| Czechia | A | UEFA | 1660 | 31 |
| Tunisia | F | CAF | 1640 | 33 |
| Qatar | B | AFC | 1620 | 37 |
| Paraguay | D | CONMEBOL | 1630 | 34 |
| Scotland | C | UEFA | 1610 | 36 |
| Ghana | L | CAF | 1600 | 38 |
| Saudi Arabia | H | AFC | 1590 | 40 |
| Panama | L | CONCACAF | 1560 | 42 |
| South Africa | A | CAF | 1550 | 43 |
| Uzbekistan | K | AFC | 1540 | 44 |
| Bosnia and Herzegovina | B | UEFA | 1570 | 41 |
| Iraq | I | AFC | 1530 | 46 |
| Jordan | J | AFC | 1500 | 52 |
| New Zealand | G | OFC | 1460 | 60 |
| DR Congo | K | CAF | 1510 | 50 |
| Haiti | C | CONCACAF | 1440 | 65 |
| Cape Verde | H | CAF | 1420 | 68 |
| Curaçao | E | CONCACAF | 1380 | 78 |

> **Note:** These Elo/ranking values are approximations for the static baseline.
> The live refresh feature will pull current values from FIFA and Elo rating sources.
> Attack strength, defense strength, form index, and squad strength index must be
> computed from match data — they are NOT hardcoded.

---

## Scoring System (User vs Model)

Points awarded per match prediction:

| Outcome | Points |
|---------|--------|
| Wrong result (W/D/L) | 0 |
| Correct result, wrong score | 3 |
| Correct result + goal difference | 4 |
| Exact score | 5 |
| Correct knockout advancement | 2 (bonus) |
| Correct champion | 10 (bonus) |
| Correct runner-up | 7 (bonus) |
| Correct third place | 5 (bonus) |

Max theoretical score: (104 × 5) + (32 × 2) + 10 + 7 + 5 = 586 points

---

## API Routes (Vercel Serverless)

### `GET /api/refresh-elo`
- Source: eloratings.net or clubelo.com
- Returns: Updated Elo ratings for all 48 teams
- Cache: 24 hours

### `GET /api/refresh-fotmob`
- Source: Unofficial Fotmob API (`https://www.fotmob.com/api`)
- Endpoints used:
  - `/matches?date=YYYYMMDD` — recent match results
  - `/teams?id=XXXX` — team stats and form
  - `/leagues?id=XXXX` — qualification data
- Returns: Recent match results, team form data
- Cache: 6 hours

### `GET /api/refresh-rankings`
- Source: FIFA ranking page or API
- Returns: Current FIFA rankings for all 48 teams
- Cache: Weekly

---

## Claude Code Instructions

When working on this project in Claude Code:

1. **Start with the engine.** The simulation engine (`src/engine/`) is the foundation. Build and test `poisson.ts` → `elo.ts` → `matchSimulator.ts` → `monteCarlo.ts` in order.

2. **Use the static data first.** Don't build API routes until the core simulation works with hardcoded data.

3. **Test the math.** The Poisson model should produce reasonable score distributions (most common scores: 1-0, 1-1, 2-1, 0-0). Argentina should have ~12-18% championship probability. Curaçao should have <0.1%.

4. **Sanity checks for the model:**
   - Group favorites should top their groups >60% of the time
   - Historical World Cup average goals per match ≈ 2.5-2.7
   - Top 5 championship favorites should hold ~60% combined probability
   - No team should have 0% advancement probability from group stage

5. **UI priority:** Build the comparison dashboard first (Phase 3) — it's the MVP.

6. **Don't over-engineer the data layer.** Start with a single `teams.ts` file exporting a const array. Refine later.

7. **Respect the design direction.** Dark mode, broadcast aesthetic, Inter font, gold/green/red accents. Not a generic dashboard template.
