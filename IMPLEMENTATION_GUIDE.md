# Implementation Guide: Frontend-Only Assistant Coach

## Quick Start

1. **Initialize Next.js**:
```bash
cd AI_Cat-1-Analyzer
npx create-next-app@latest . --typescript --tailwind --app
```

2. **Copy precomputed data**:
```bash
cp -r ../code/frontend/public/precomputed ./public/data
```

3. **Copy existing UI components**:
```bash
cp -r ../code/frontend/src/app/coach ./app/coach
```

4. **Install dependencies**:
```bash
npm install framer-motion
```

## Key Implementation Files

### 1. KAST Analyzer (`lib/kast-analyzer.ts`)

```typescript
export interface PlayerStats {
  player: string;
  avg_kills: number;
  avg_deaths: number;
  kd_ratio: number;
  first_kill_rate: number;
}

export interface KASTInsight {
  type: string;
  player?: string;
  data: string;
  recommendation: string;
  severity: "critical" | "high" | "medium" | "low";
  loss_rate?: number;
}

export function calculateKASTInsights(data: any): KASTInsight[] {
  const insights: KASTInsight[] = [];
  const players = data.metrics?.player_tendencies || [];

  // Analyze each player
  players.forEach((player: PlayerStats) => {
    // High death rate = vulnerability
    if (player.avg_deaths > 16 && player.kd_ratio < 1.0) {
      insights.push({
        type: "high_death_rate",
        player: player.player,
        data: `${player.player} averages ${player.avg_deaths.toFixed(1)} deaths per match (K/D: ${player.kd_ratio.toFixed(2)})`,
        recommendation: `Focus on positioning and survival for ${player.player}. Review VODs for overextension patterns.`,
        severity: player.avg_deaths > 17 ? "critical" : "high",
        loss_rate: Math.round((1 - player.kd_ratio) * 100),
      });
    }

    // Low first kill rate for entry fraggers
    if (player.first_kill_rate < 10 && player.avg_kills > 15) {
      insights.push({
        type: "low_first_kill",
        player: player.player,
        data: `${player.player} has ${player.first_kill_rate.toFixed(1)}% first kill rate despite high kills`,
        recommendation: `${player.player} should take more opening duels. Strong aim but not creating early advantages.`,
        severity: "medium",
      });
    }
  });

  return insights;
}
```

### 2. Macro Review Generator (`lib/macro-review.ts`)

```typescript
export function generateMacroReview(data: any): string {
  const metrics = data.metrics;
  const winRate = metrics.win_rate;
  const mapWinRates = metrics.win_rate_by_map;
  const sitePrefs = metrics.site_preferences;
  const aggression = metrics.aggression;

  let agenda = `# MACRO REVIEW: ${data.team_name}\\n\\n`;

  // 1. Pistol Round Analysis
  agenda += `## 1. Pistol Round Performance\\n\\n`;
  if (metrics.pistol_site_preferences && Object.keys(metrics.pistol_site_preferences).length > 0) {
    agenda += `Site Distribution:\\n`;
    Object.entries(metrics.pistol_site_preferences).forEach(([site, rate]: [string, any]) => {
      agenda += `- ${site} Site: ${rate.toFixed(1)}%\\n`;
    });
  } else {
    agenda += `⚠ No clear pistol site preference detected. Consider developing default pistol setups.\\n`;
  }
  agenda += `\\n`;

  // 2. Economy Management
  agenda += `## 2. Economy Management\\n\\n`;
  agenda += `Overall Win Rate: ${winRate.toFixed(1)}%\\n\\n`;
  if (winRate < 50) {
    agenda += `⚠ **CRITICAL**: Below 50% win rate. Review force buy decisions and save rounds.\\n`;
  }
  agenda += `\\n`;

  // 3. Mid-Round Execution
  agenda += `## 3. Mid-Round Execution & Timing\\n\\n`;
  agenda += `Playstyle: ${aggression.style}\\n`;
  agenda += `Average Round Duration: ${aggression.avg_duration.toFixed(1)}s\\n`;
  agenda += `Rush Rate: ${aggression.rush_rate.toFixed(1)}%\\n\\n`;

  if (aggression.style === "Slow/Default" && aggression.avg_duration > 140) {
    agenda += `⚠ Very slow executes (>${aggression.avg_duration.toFixed(0)}s avg). Consider faster site hits to avoid retake scenarios.\\n`;
  }
  agenda += `\\n`;

  // 4. Site Selection
  agenda += `## 4. Site Attack Distribution\\n\\n`;
  Object.entries(sitePrefs).forEach(([site, rate]: [string, any]) => {
    agenda += `- ${site} Site: ${rate.toFixed(1)}%\\n`;
  });
  agenda += `\\n`;
  const siteEntries = Object.entries(sitePrefs);
  if (siteEntries.length > 0) {
    const maxSite = siteEntries.reduce((a, b) => a[1] > b[1] ? a : b);
    if (maxSite[1] > 45) {
      agenda += `⚠ Heavy bias towards ${maxSite[0]} site (${(maxSite[1] as number).toFixed(1)}%). Opponents may adapt.\\n`;
    }
  }
  agenda += `\\n`;

  // 5. Map-Specific Issues
  agenda += `## 5. Map Performance\\n\\n`;
  const weakMaps = Object.entries(mapWinRates)
    .filter(([_, rate]: [string, any]) => rate < 45)
    .sort((a, b) => (a[1] as number) - (b[1] as number));

  if (weakMaps.length > 0) {
    agenda += `**Weak Maps** (Priority for practice):\\n`;
    weakMaps.forEach(([map, rate]: [string, any]) => {
      agenda += `- ${map}: ${rate.toFixed(1)}% WR 🔴\\n`;
    });
  }

  const strongMaps = Object.entries(mapWinRates)
    .filter(([_, rate]: [string, any]) => rate > 60)
    .sort((a, b) => (b[1] as number) - (a[1] as number));

  if (strongMaps.length > 0) {
    agenda += `\\n**Strong Maps** (Comfort picks):\\n`;
    strongMaps.forEach(([map, rate]: [string, any]) => {
      agenda += `- ${map}: ${rate.toFixed(1)}% WR ✅\\n`;
    });
  }

  agenda += `\\n---\\n`;
  agenda += `\\n🤖 Generated with Cloud9 Assistant Coach\\n`;

  return agenda;
}
```

### 3. Simple What-If Analyzer (`lib/what-if.ts`)

```typescript
export interface WhatIfQuery {
  query: string;
  matchContext: any;
}

export function analyzeWhatIf(query: string, data: any): string {
  // Simple keyword-based analysis (can be enhanced with LLM)
  const queryLower = query.toLowerCase();
  const metrics = data.metrics;

  let analysis = `# WHAT-IF ANALYSIS\\n\\n`;
  analysis += `**Your Question:** "${query}"\\n\\n`;
  analysis += `---\\n\\n`;

  // Detect scenario type
  if (queryLower.includes("retake") || queryLower.includes("save")) {
    analysis += `## Retake vs Save Decision\\n\\n`;
    analysis += `**Context:**\\n`;
    analysis += `- Team overall win rate: ${metrics.win_rate.toFixed(1)}%\\n`;
    analysis += `- Playstyle: ${metrics.aggression.style}\\n\\n`;

    analysis += `**Analysis:**\\n`;
    if (metrics.win_rate < 50) {
      analysis += `⚠ Given current <50% win rate, **saving weapons** in low-probability retakes is recommended.\\n`;
      analysis += `→ Better to guarantee full buy next round than risk losing weapons in unfavorable situation.\\n`;
    } else {
      analysis += `→ With ${metrics.win_rate.toFixed(1)}% win rate, team has momentum. Retake attempts can be worth the risk if utility is available.\\n`;
    }
  } else if (queryLower.includes("site") || queryLower.includes("attack")) {
    analysis += `## Site Selection Analysis\\n\\n`;
    analysis += `**Current Site Distribution:**\\n`;
    Object.entries(metrics.site_preferences).forEach(([site, rate]: [string, any]) => {
      analysis += `- ${site} Site: ${rate.toFixed(1)}%\\n`;
    });
    analysis += `\\n**Recommendation:**\\n`;
    analysis += `→ Consider diversifying site attacks to avoid predictability.\\n`;
  } else {
    analysis += `## General Strategic Analysis\\n\\n`;
    analysis += `Based on Cloud9's data:\\n`;
    analysis += `- Win Rate: ${metrics.win_rate.toFixed(1)}%\\n`;
    analysis += `- Playstyle: ${metrics.aggression.style}\\n`;
    analysis += `- Best Map: ${Object.entries(metrics.win_rate_by_map).reduce((a, b) => a[1] > b[1] ? a : b)[0]}\\n`;
  }

  analysis += `\\n---\\n`;
  analysis += `\\n🤖 Note: For more accurate scenario modeling, specific round context (player counts, economy, time remaining) would improve analysis.\\n`;

  return analysis;
}
```

## Next Steps

1. Run `npm install` in AI_Cat-1-Analyzer
2. Copy these implementations into `lib/` folder
3. Update coach dashboard to use these local functions instead of API calls
4. Test with Cloud9 precomputed data
5. Deploy to Vercel/Netlify

All analysis runs 100% in the browser - no backend needed!
