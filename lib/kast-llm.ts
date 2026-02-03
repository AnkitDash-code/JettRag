/**
 * KAST Analysis powered by LLM
 * Analyzes player performance using AI reasoning
 */

import { generateText } from './llm-engine';

export interface KASTInsight {
  type: string;
  player?: string;
  data: string;
  recommendation: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  loss_rate?: number;
  sample_size?: number;
}

export interface InsightsData {
  kast_correlations: KASTInsight[];
  setup_patterns: KASTInsight[];
  economy_patterns: KASTInsight[];
  timing_patterns?: KASTInsight[];
}

/**
 * Use LLM to analyze player KAST performance
 */
export async function analyzeKASTWithLLM(
  matchData: any,
  useAPI: boolean = false
): Promise<InsightsData> {
  const players = matchData.metrics?.player_tendencies || [];
  const winRate = matchData.metrics?.win_rate || 0;
  const aggression = matchData.metrics?.aggression || {};
  const sitePrefs = matchData.metrics?.site_preferences || {};

  const prompt = `You are an expert VALORANT coach analyzing Cloud9's performance data.

TEAM OVERVIEW:
- Team: Cloud9
- Matches Analyzed: ${matchData.matches_analyzed}
- Overall Win Rate: ${winRate.toFixed(1)}%
- Playstyle: ${aggression.style || 'Unknown'}
- Avg Round Duration: ${aggression.avg_duration?.toFixed(1)}s

PLAYER STATISTICS:
${players.map((p: any) => `
${p.player}:
  - K/D Ratio: ${p.kd_ratio?.toFixed(2)}
  - Avg Kills: ${p.avg_kills?.toFixed(1)} per match
  - Avg Deaths: ${p.avg_deaths?.toFixed(1)} per match
  - First Kill Rate: ${p.first_kill_rate?.toFixed(1)}%
  - Top Agent: ${p.top_agent} (${p.top_agent_rate?.toFixed(0)}% pick rate)
  - Role: ${getRoleFromAgent(p.top_agent)}
`).join('')}

SITE ATTACK DISTRIBUTION:
${Object.entries(sitePrefs).map(([site, rate]: [string, any]) => `- ${site} Site: ${rate.toFixed(1)}%`).join('\n')}

YOUR TASK:
Analyze this data and generate EXACTLY 12 detailed, actionable insights distributed across all categories. Be comprehensive and thorough:

1. KAST CORRELATIONS (player survivability and impact) - GENERATE EXACTLY 3 INSIGHTS:
   - Identify players with concerning K/D ratios (below 0.9)
   - Players dying early in rounds without trading
   - Players not creating opening advantages (low first kill rate)
   - Role-specific effectiveness issues
   - Compare players to their role expectations

2. SETUP PATTERNS - GENERATE EXACTLY 3 INSIGHTS:
   - Identify predictable attack patterns
   - Site preference imbalances (>40% on one site or <20% on another)
   - Composition problems
   - Agent pick rate issues
   - Map-specific struggles

3. ECONOMY PATTERNS - GENERATE EXACTLY 3 INSIGHTS:
   - Overall win rate issues (if <50%)
   - Force buy tendencies
   - Economic decision-making problems
   - Round win conversion rates

4. TIMING PATTERNS - GENERATE EXACTLY 3 INSIGHTS:
   - Execute speed issues (too slow >50s or too fast <30s)
   - Rush rate problems
   - Late-round vulnerabilities

FORMAT EACH INSIGHT EXACTLY LIKE THIS (no markdown, no extra formatting):
---
CATEGORY: kast_correlations
PLAYER: OXY
SEVERITY: high
DATA: OXY has a 0.85 K/D ratio with 14.2 kills and 16.7 deaths per match, dying 2.5 times more than creating opening kills (first kill rate: 8.3%), which is below the expected 15%+ for a Duelist role.
RECOMMENDATION: Focus on positioning in post-plant situations and entry timing drills. Review VODs of early deaths to identify pattern recognition issues. Consider agent switch from Jett to Raze for more survivability on Haven/Bind.
LOSS_RATE: 62
---

CRITICAL REQUIREMENTS - YOU MUST FOLLOW THESE EXACTLY:
- MANDATORY: Generate EXACTLY 12 insights total (3 per category, no exceptions)
- MANDATORY: Each category (kast_correlations, setup_patterns, economy_patterns, timing_patterns) must have EXACTLY 3 insights
- MANDATORY: Be VERY specific with numbers from the data in every insight
- MANDATORY: Each DATA field must be 2-3 complete sentences with concrete statistics and percentages
- MANDATORY: Each RECOMMENDATION must be at least 50 words with detailed, actionable advice including specific drills or strategies
- MANDATORY: Compare players against role benchmarks (Duelists: 15%+ first kill rate, 1.1+ K/D; Controllers: 0.9+ K/D; Initiators: 12%+ FK, 1.0+ K/D; Sentinels: 0.95+ K/D)
- MANDATORY: Use exact numbers provided in the statistics above
- MANDATORY: SEVERITY levels must be accurate: critical (game-losing issues), high (major problems), medium (needs attention), low (minor tweaks)
- MANDATORY: Each insight must have clear CATEGORY, SEVERITY, DATA, RECOMMENDATION, and LOSS_RATE fields

Generate all 12 insights now (3 kast_correlations + 3 setup_patterns + 3 economy_patterns + 3 timing_patterns).`;

  try {
    const response = await generateText(prompt, {
      useGroq: useAPI,
    });

    return parseLLMInsights(response);
  } catch (error) {
    console.error('LLM analysis failed:', error);
    throw error;
  }
}

/**
 * Parse LLM output into structured insights
 */
function parseLLMInsights(llmOutput: string): InsightsData {
  const insights: InsightsData = {
    kast_correlations: [],
    setup_patterns: [],
    economy_patterns: [],
    timing_patterns: [],
  };

  // Split by insight delimiter
  const insightBlocks = llmOutput.split('---').filter(b => b.trim());

  insightBlocks.forEach(block => {
    const lines = block.split('\n').map(l => l.trim()).filter(l => l);

    const insight: Partial<KASTInsight> = {
      type: 'llm_analysis',
    };

    lines.forEach(line => {
      if (line.startsWith('CATEGORY:')) {
        const category = line.replace('CATEGORY:', '').trim().toLowerCase();
        insight.type = category;
      } else if (line.startsWith('PLAYER:')) {
        const player = line.replace('PLAYER:', '').trim();
        if (player !== 'Team') {
          insight.player = player;
        }
      } else if (line.startsWith('SEVERITY:')) {
        const sev = line.replace('SEVERITY:', '').trim().toLowerCase();
        insight.severity = (['critical', 'high', 'medium', 'low'].includes(sev)
          ? sev
          : 'medium') as any;
      } else if (line.startsWith('DATA:')) {
        insight.data = line.replace('DATA:', '').trim();
      } else if (line.startsWith('RECOMMENDATION:')) {
        insight.recommendation = line.replace('RECOMMENDATION:', '').trim();
      } else if (line.startsWith('LOSS_RATE:')) {
        const rate = line.replace('LOSS_RATE:', '').trim();
        insight.loss_rate = parseInt(rate) || 0;
      }
    });

    // Add to appropriate category if complete
    if (insight.data && insight.recommendation && insight.severity) {
      const category = insight.type as keyof InsightsData;
      if (category && insights[category]) {
        insights[category]!.push(insight as KASTInsight);
      }
    }
  });

  return insights;
}

/**
 * Helper to determine role from agent
 */
function getRoleFromAgent(agent: string): string {
  const roles: Record<string, string> = {
    jett: 'Duelist',
    raze: 'Duelist',
    phoenix: 'Duelist',
    reyna: 'Duelist',
    yoru: 'Duelist',
    neon: 'Duelist',
    omen: 'Controller',
    brimstone: 'Controller',
    viper: 'Controller',
    astra: 'Controller',
    harbor: 'Controller',
    clove: 'Controller',
    sova: 'Initiator',
    breach: 'Initiator',
    skye: 'Initiator',
    kayo: 'Initiator',
    fade: 'Initiator',
    gekko: 'Initiator',
    sage: 'Sentinel',
    cypher: 'Sentinel',
    killjoy: 'Sentinel',
    chamber: 'Sentinel',
    deadlock: 'Sentinel',
    vyse: 'Sentinel',
  };

  return roles[agent?.toLowerCase()] || 'Unknown';
}
