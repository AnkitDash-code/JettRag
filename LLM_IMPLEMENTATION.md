# LLM-Powered Assistant Coach Implementation

## Overview
All analysis is done by **LLM** - zero manual processing. Uses browser-based AI for privacy and speed.

## Architecture

```
User Query → Load Match Data → LLM Prompt → LLM Analysis → Display Results
```

**No** rule-based logic, **no** manual calculations - **pure LLM reasoning**.

## Setup Options

### Option 1: Browser-Based (Transformers.js) - **RECOMMENDED**
- Runs 100% in browser
- No API keys needed
- Privacy-first
- Works offline
- Uses Xenova/LaMini-Flan-T5-783M or similar

### Option 2: OpenAI API (Requires key)
- More powerful reasoning
- Need API key (user provides)
- Faster responses

### Option 3: Hugging Face Inference API
- Free tier available
- Good middle ground

## File Structure

```
lib/
├── llm-engine.ts          # Core LLM integration
├── kast-llm.ts           # KAST analysis via LLM
├── macro-llm.ts          # Macro review via LLM
└── whatif-llm.ts         # What-if simulator via LLM

app/
├── coach/
│   ├── page.tsx          # Main dashboard
│   └── components/
│       ├── InsightsTab.tsx
│       ├── MacroReviewTab.tsx
│       └── WhatIfSimulator.tsx

public/
└── data/
    ├── manifest.json
    └── teams/
        └── cloud9.json
```

## Implementation

### 1. LLM Engine (`lib/llm-engine.ts`)

```typescript
import { pipeline } from '@xenova/transformers';

export class LLMEngine {
  private static instance: LLMEngine | null = null;
  private model: any = null;
  private loading: boolean = false;

  static async getInstance(): Promise<LLMEngine> {
    if (!LLMEngine.instance) {
      LLMEngine.instance = new LLMEngine();
      await LLMEngine.instance.initialize();
    }
    return LLMEngine.instance;
  }

  private async initialize() {
    if (this.model || this.loading) return;

    this.loading = true;
    console.log('Loading LLM model...');

    // Use text-generation model (smaller, faster)
    this.model = await pipeline(
      'text2text-generation',
      'Xenova/LaMini-Flan-T5-783M'
    );

    this.loading = false;
    console.log('LLM model loaded!');
  }

  async generate(prompt: string, maxTokens: number = 500): Promise<string> {
    if (!this.model) {
      await this.initialize();
    }

    const result = await this.model(prompt, {
      max_new_tokens: maxTokens,
      temperature: 0.7,
      top_p: 0.9,
    });

    return result[0].generated_text;
  }
}

// Alternative: OpenAI Integration (if user wants better quality)
export async function generateWithOpenAI(
  prompt: string,
  apiKey: string
): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1000,
      temperature: 0.7,
    }),
  });

  const data = await response.json();
  return data.choices[0].message.content;
}
```

### 2. KAST Analysis via LLM (`lib/kast-llm.ts`)

```typescript
import { LLMEngine } from './llm-engine';

export interface KASTInsight {
  type: string;
  player?: string;
  data: string;
  recommendation: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
}

export async function analyzeKASTWithLLM(matchData: any): Promise<KASTInsight[]> {
  const llm = await LLMEngine.getInstance();

  // Prepare context for LLM
  const players = matchData.metrics?.player_tendencies || [];
  const winRate = matchData.metrics?.win_rate || 0;

  const prompt = `You are an expert VALORANT coach analyzing Cloud9's performance.

TEAM DATA:
- Overall Win Rate: ${winRate.toFixed(1)}%
- Matches Analyzed: ${matchData.matches_analyzed}

PLAYER STATISTICS:
${players.map((p: any) => `
- ${p.player}:
  * K/D Ratio: ${p.kd_ratio?.toFixed(2) || 'N/A'}
  * Avg Kills: ${p.avg_kills?.toFixed(1) || 'N/A'}
  * Avg Deaths: ${p.avg_deaths?.toFixed(1) || 'N/A'}
  * First Kill Rate: ${p.first_kill_rate?.toFixed(1) || 'N/A'}%
  * Top Agent: ${p.top_agent || 'N/A'}
`).join('')}

TASK:
Analyze each player's performance and identify 3-5 critical insights about player survivability, impact, and effectiveness. Focus on:
1. Players dying too frequently (high deaths, low K/D)
2. Players not creating enough opening advantages (low first kill rate)
3. Role-specific effectiveness issues

Format each insight as:
INSIGHT: [brief description]
PLAYER: [player name]
SEVERITY: [critical/high/medium/low]
RECOMMENDATION: [specific actionable advice]

Generate insights now:`;

  const response = await llm.generate(prompt, 800);

  // Parse LLM response into structured insights
  return parseLLMInsights(response, players);
}

function parseLLMInsights(llmOutput: string, players: any[]): KASTInsight[] {
  const insights: KASTInsight[] = [];

  // Simple parsing logic (you can enhance this)
  const lines = llmOutput.split('\\n');
  let currentInsight: Partial<KASTInsight> = {};

  lines.forEach(line => {
    if (line.startsWith('INSIGHT:')) {
      if (currentInsight.data) {
        insights.push(currentInsight as KASTInsight);
      }
      currentInsight = {
        type: 'llm_analysis',
        data: line.replace('INSIGHT:', '').trim(),
      };
    } else if (line.startsWith('PLAYER:')) {
      currentInsight.player = line.replace('PLAYER:', '').trim();
    } else if (line.startsWith('SEVERITY:')) {
      const sev = line.replace('SEVERITY:', '').trim().toLowerCase();
      currentInsight.severity = ['critical', 'high', 'medium', 'low'].includes(sev)
        ? sev as any
        : 'medium';
    } else if (line.startsWith('RECOMMENDATION:')) {
      currentInsight.recommendation = line.replace('RECOMMENDATION:', '').trim();
    }
  });

  if (currentInsight.data) {
    insights.push(currentInsight as KASTInsight);
  }

  return insights.filter(i => i.data && i.recommendation);
}
```

### 3. Macro Review via LLM (`lib/macro-llm.ts`)

```typescript
import { LLMEngine } from './llm-engine';

export async function generateMacroReviewWithLLM(matchData: any): Promise<string> {
  const llm = await LLMEngine.getInstance();

  const metrics = matchData.metrics;

  const prompt = `You are a professional VALORANT coach creating a post-match review agenda for Cloud9.

MATCH DATA:
- Team: ${matchData.team_name}
- Matches Analyzed: ${matchData.matches_analyzed}
- Overall Win Rate: ${metrics.win_rate?.toFixed(1)}%
- Playstyle: ${metrics.aggression?.style}
- Average Round Duration: ${metrics.aggression?.avg_duration?.toFixed(1)}s

MAP PERFORMANCE:
${Object.entries(metrics.win_rate_by_map || {}).map(([map, rate]: [string, any]) =>
  `- ${map}: ${rate.toFixed(1)}% WR`
).join('\\n')}

SITE ATTACK DISTRIBUTION:
${Object.entries(metrics.site_preferences || {}).map(([site, rate]: [string, any]) =>
  `- ${site} Site: ${rate.toFixed(1)}%`
).join('\\n')}

TASK:
Create a structured 5-section post-match review agenda covering:

1. **Pistol Round Performance** - Analyze pistol strategies and outcomes
2. **Economy Management** - Identify force buy patterns and eco round decisions
3. **Mid-Round Execution & Timing** - Review execute speed and timing issues
4. **Site Selection Strategy** - Evaluate attack distribution and predictability
5. **Map-Specific Issues** - Highlight weak maps needing practice

For each section:
- Identify specific problems
- Provide actionable recommendations
- Flag critical issues with ⚠

Generate the complete review agenda now:`;

  const agenda = await llm.generate(prompt, 1200);

  return `# CLOUD9 MACRO REVIEW AGENDA\\n\\n${agenda}\\n\\n---\\n🤖 Generated by AI Coach`;
}
```

### 4. What-If Simulator via LLM (`lib/whatif-llm.ts`)

```typescript
import { LLMEngine } from './llm-engine';

export async function simulateWhatIfWithLLM(
  query: string,
  matchData: any
): Promise<string> {
  const llm = await LLMEngine.getInstance();

  const metrics = matchData.metrics;

  const prompt = `You are an expert VALORANT strategist analyzing hypothetical scenarios for Cloud9.

TEAM CONTEXT:
- Win Rate: ${metrics.win_rate?.toFixed(1)}%
- Playstyle: ${metrics.aggression?.style}
- Average Round Duration: ${metrics.aggression?.avg_duration?.toFixed(1)}s
- Best Map: ${Object.entries(metrics.win_rate_by_map || {}).reduce((a, b) => a[1] > b[1] ? a : b)[0]}

PLAYER OVERVIEW:
${(metrics.player_tendencies || []).slice(0, 3).map((p: any) =>
  `- ${p.player}: ${p.kd_ratio?.toFixed(2)} K/D, ${p.first_kill_rate?.toFixed(1)}% FK`
).join('\\n')}

USER QUESTION:
"${query}"

TASK:
Analyze this hypothetical scenario and provide:

1. **GAME STATE ANALYSIS**
   - Interpret the situation from the query
   - Identify key factors (player numbers, economy, time, etc.)

2. **ACTUAL DECISION ANALYSIS**
   - Analyze what was actually done
   - Calculate approximate win probability
   - Identify risks and downsides

3. **ALTERNATIVE SCENARIO**
   - Model the suggested alternative
   - Calculate alternative win probability
   - Explain economic/strategic impact

4. **RECOMMENDATION**
   - Recommend the better decision
   - Explain reasoning
   - Provide general strategic principle

Be specific and use VALORANT tactics. Estimate probabilities based on general VALORANT knowledge.

Generate analysis now:`;

  const analysis = await llm.generate(prompt, 1500);

  return analysis;
}
```

## Usage in Components

### In `InsightsTab.tsx`:

```typescript
import { analyzeKASTWithLLM } from '@/lib/kast-llm';

const fetchInsights = async () => {
  setLoading(true);
  try {
    // Load precomputed data
    const response = await fetch('/data/teams/cloud9.json');
    const data = await response.json();

    // Let LLM analyze
    const kast_correlations = await analyzeKASTWithLLM(data);

    setInsights({
      team: 'Cloud9',
      matches_analyzed: data.matches_analyzed,
      insights: {
        kast_correlations,
        setup_patterns: [],
        economy_patterns: [],
      },
    });
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
```

## Benefits

✅ **Zero manual processing** - LLM does all reasoning
✅ **Privacy-first** - Runs in browser with Transformers.js
✅ **No backend** - Pure frontend deployment
✅ **Flexible** - Easy to switch between local/API models
✅ **Upgradeable** - Can use GPT-4 if user provides API key

## Next Steps

1. Run `npm install` to get dependencies
2. Copy match data to `/public/data/`
3. Implement the LLM engine files
4. Update UI components to call LLM functions
5. Deploy to Vercel/Netlify

**The LLM does ALL the thinking!** 🤖
