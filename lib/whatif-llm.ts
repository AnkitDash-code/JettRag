/**
 * What-If Scenario Simulator powered by LLM
 * Analyzes hypothetical strategic decisions
 */

import { generateText } from './llm-engine';

export async function simulateWhatIfWithLLM(
  query: string,
  matchData: any,
  useAPI: boolean = false
): Promise<string> {
  const metrics = matchData.metrics;

  const prompt = `You are an expert VALORANT strategist and analyst with deep knowledge of competitive play, win probabilities, and tactical decision-making.

CLOUD9 TEAM CONTEXT:
- Overall Win Rate: ${metrics.win_rate?.toFixed(1)}%
- Playstyle: ${metrics.aggression?.style}
- Avg Round Duration: ${metrics.aggression?.avg_duration?.toFixed(1)}s
- Rush Rate: ${metrics.aggression?.rush_rate?.toFixed(1)}%

BEST/WORST MAPS:
${Object.entries(metrics.win_rate_by_map || {})
  .sort((a, b) => (b[1] as number) - (a[1] as number))
  .slice(0, 3)
  .map(([map, rate]: [string, any]) => `- ${map}: ${rate.toFixed(1)}% WR`)
  .join('\n')}

PLAYER OVERVIEW (Top performers):
${(metrics.player_tendencies || []).slice(0, 3).map((p: any) =>
  `- ${p.player}: ${p.kd_ratio?.toFixed(2)} K/D, ${p.first_kill_rate?.toFixed(1)}% FK rate`
).join('\n')}

USER'S HYPOTHETICAL QUESTION:
"${query}"

YOUR TASK:
Analyze this hypothetical scenario and provide a detailed strategic analysis.

## FORMAT YOUR RESPONSE AS:

# WHAT-IF ANALYSIS

## SCENARIO UNDERSTANDING
[Parse and clarify what the user is asking about. Extract key details: round number, player counts, site, time remaining, economy state if mentioned]

## GAME STATE ANALYSIS
[Analyze the situation mentioned in the query. What were the key factors?]
- Player Count: [e.g., "3v5 disadvantage"]
- Economy Impact: [Consider weapon values, next round economy]
- Time Pressure: [If mentioned, analyze time constraints]
- Site/Position: [Tactical position analysis]

## ACTUAL DECISION ANALYSIS
What was done: [Describe the actual decision from the query]
Win Probability: [Estimate based on VALORANT knowledge, e.g., "3v5 retake ~12-18%"]
Risks:
- [List specific risks of this decision]
- [Economic consequences]
- [Tactical downsides]

## ALTERNATIVE SCENARIO
Suggested Alternative: [The alternative being proposed]
Win Probability: [Estimate probability, e.g., "Save → guarantee full buy next round"]
Benefits:
- [List specific benefits]
- [Economic advantages]
- [Strategic positioning for next round]

## RECOMMENDATION
**Verdict:** [Which decision was better and why]

**Reasoning:**
[Explain the strategic principle behind your recommendation. Reference Cloud9's specific stats if relevant]

**General Principle:**
[State the broader VALORANT strategic lesson]

---

Generate a thorough analysis. Use specific VALORANT knowledge about retake probabilities, economy rules, and tactical principles. Be definitive in your recommendation.`;

  try {
    const analysis = await generateText(prompt, {
      useGroq: useAPI,
    });

    return analysis;
  } catch (error) {
    console.error('What-if simulation failed:', error);
    throw error;
  }
}
