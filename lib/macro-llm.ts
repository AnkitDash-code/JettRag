/**
 * Macro Game Review powered by LLM
 * Generates structured post-match review agenda
 */

import { generateText } from './llm-engine';

export async function generateMacroReviewWithLLM(
  matchData: any,
  useAPI: boolean = false
): Promise<string> {
  const metrics = matchData.metrics;

  const prompt = `You are a professional VALORANT coach creating a detailed post-match review agenda for Cloud9.

MATCH DATA:
- Team: ${matchData.team_name}
- Matches Analyzed: ${matchData.matches_analyzed}
- Overall Win Rate: ${metrics.win_rate?.toFixed(1)}%
- Playstyle: ${metrics.aggression?.style}
- Average Round Duration: ${metrics.aggression?.avg_duration?.toFixed(1)}s
- Rush Rate: ${metrics.aggression?.rush_rate?.toFixed(1)}%

MAP PERFORMANCE:
${Object.entries(metrics.win_rate_by_map || {}).map(([map, rate]: [string, any]) =>
  `- ${map}: ${rate.toFixed(1)}% WR ${rate < 45 ? '🔴' : rate > 60 ? '✅' : '⚠'}`
).join('\n')}

SITE ATTACK DISTRIBUTION:
${Object.entries(metrics.site_preferences || {}).map(([site, rate]: [string, any]) =>
  `- ${site} Site: ${rate.toFixed(1)}%`
).join('\n')}

TOP AGENTS:
${(metrics.agent_composition || []).slice(0, 5).map((a: any) =>
  `- ${a.agent}: ${a.pick_rate}% pick rate`
).join('\n')}

PLAYER STATS (Top 3):
${(metrics.player_tendencies || []).slice(0, 3).map((p: any) =>
  `- ${p.player}: ${p.kd_ratio?.toFixed(2)} K/D, ${p.first_kill_rate?.toFixed(1)}% FK rate, ${p.top_agent} main`
).join('\n')}

YOUR TASK:
Create a COMPREHENSIVE and DETAILED 6-section post-match review agenda with markdown tables, statistics, and actionable recommendations. MANDATORY: This MUST be 500-700 words minimum (not including tables).

## FORMAT REQUIREMENTS:

# CLOUD9 MACRO REVIEW AGENDA

## 1. Pistol Round Performance (80-100 words)
- Create a markdown table showing pistol round win rates by map
- Analyze pistol round site preferences and attack patterns
- Compare vs team's overall win rate
- Flag critical issues with 🔴, concerns with ⚠️, strengths with ✅
- Provide 2-3 specific drills or strategy adjustments

Example table:
| Map | Pistol WR | Overall WR | Difference | Status |
|-----|-----------|------------|------------|--------|
| Haven | 45% | 50% | -5% | ⚠️ |

## 2. Economy Management (100-120 words)
- Analyze overall win rate and economic discipline
- If <50% win rate, flag as 🔴 CRITICAL and explain economic cascades
- Discuss force buy patterns, eco discipline, and bonus round conversion
- Compare economic decisions across different maps
- Provide specific economic guidelines (when to force, when to save)
- Include a table of win rates by economy type if data available

## 3. Mid-Round Execution & Timing (80-100 words)
- Analyze average round duration (${metrics.aggression?.avg_duration?.toFixed(1)}s) - flag if >50s or <35s
- Break down rush rate (${metrics.aggression?.rush_rate?.toFixed(1)}%) - ideal is 25-35%
- Discuss site hit timing, default setups, and adaptation speed
- Analyze playstyle (${metrics.aggression?.style}) effectiveness
- Recommend specific timing adjustments and practice scenarios
- Include comparison to pro team benchmarks

## 4. Site Selection Strategy (80-100 words)
- Create a markdown table of site attack distribution
- Flag heavy bias to one site (>40%) as ⚠️ predictable
- Flag underutilized sites (<25%) as missed opportunities
- Analyze correlation between site preference and win rate
- Recommend site diversification strategies
- Suggest fake/pressure plays to keep opponents guessing

## 5. Map Pool & Performance (100-120 words)
- Create comprehensive table of map performance with the following columns:
  - Map name
  - Win Rate %
  - Matches Played
  - Status (🔴 <45%, ⚠️ 45-55%, ✅ >55%)
  - Priority Level (High/Medium/Low)
- For each weak map (<45% WR): provide 2-3 specific issues and practice recommendations
- For each strong map (>60% WR): identify what's working and how to maintain it
- Recommend map veto strategy for upcoming matches

## 6. Agent Composition & Role Distribution (60-80 words)
- Analyze top 5 agents and their pick rates
- Identify composition gaps or over-reliance on specific agents
- Compare agent performance to team success
- Recommend agent pool expansions for flexibility
- Suggest alternative compositions for struggling maps

---
## 📊 PRIORITY ACTION ITEMS

**🔴 Critical (Must Fix This Week):**
1. [Highest severity issue with specific metric]
2. [Second critical issue]

**⚠️ High Priority (Address in Next 2 Weeks):**
1. [Important issue]
2. [Important issue]

**💡 Optimization Opportunities:**
1. [Enhancement suggestion]
2. [Enhancement suggestion]

---
## 🎯 NEXT PRACTICE FOCUS

**This Week's Drills:**
- [Specific drill name]: [30-50 words describing exact drill, duration, success metrics]
- [Specific drill name]: [30-50 words describing exact drill, duration, success metrics]
- [Specific drill name]: [30-50 words describing exact drill, duration, success metrics]

**VOD Review Focus:**
- [Specific rounds/situations to review]

---

CRITICAL REQUIREMENTS - YOU MUST FOLLOW THESE EXACTLY:
- MANDATORY: Use markdown tables extensively (minimum 4 tables across all sections)
- MANDATORY: Include specific percentages and numbers in EVERY single section
- MANDATORY: Be brutally honest about weaknesses with data to back it up
- MANDATORY: Provide actionable drills with specific success metrics and time durations
- MANDATORY: Total length MUST be 500-700 words minimum (not counting table content)
- MANDATORY: Use 🔴 for critical issues (<45% WR), ⚠️ for concerns (45-55% WR), ✅ for strengths (>55% WR)
- MANDATORY: Every section must have detailed analysis, not just bullet points
- MANDATORY: Priority Action Items section must list at least 2 critical, 2 high priority, and 2 optimization items
- MANDATORY: Practice drills section must have at least 3 specific drills with exact durations and success criteria

Generate the complete detailed agenda now. Make it comprehensive and thorough.`;

  try {
    const agenda = await generateText(prompt, {
      useGroq: useAPI,
    });

    return `${agenda}\n\n---\n🤖 Generated by Cloud9 AI Assistant Coach`;
  } catch (error) {
    console.error('Macro review generation failed:', error);
    throw error;
  }
}
