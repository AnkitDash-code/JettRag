"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { analyzeKASTWithLLM } from "@/lib/kast-llm";

interface Insight {
  type: string;
  player?: string;
  data: string;
  recommendation: string;
  severity: "critical" | "high" | "medium" | "low";
  loss_rate?: number;
  sample_size?: number;
}

interface InsightsData {
  kast_correlations: Insight[];
  setup_patterns: Insight[];
  economy_patterns: Insight[];
  timing_patterns?: Insight[];
}

interface InsightsResponse {
  team: string;
  matches_analyzed: number;
  insights: InsightsData;
}

interface InsightsTabProps {
  loading: boolean;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export default function InsightsTab({
  loading,
  setLoading,
  setError,
}: InsightsTabProps) {
  const [insights, setInsights] = useState<InsightsResponse | null>(null);
  const [numMatches, setNumMatches] = useState(50);

  const fetchInsights = async () => {
    setLoading(true);
    setError(null);

    try {
      // Load precomputed Cloud9 data (20 matches)
      const response = await fetch('/data/teams/cloud9-20.json');
      if (!response.ok) {
        throw new Error("Failed to load Cloud9 data");
      }
      const matchData = await response.json();

      // Use LLM to analyze the data
      console.log('🤖 Analyzing with LLM...');
      const insightsData = await analyzeKASTWithLLM(matchData, true); // true = use API if available

      setInsights({
        team: 'Cloud9',
        matches_analyzed: matchData.matches_analyzed,
        insights: insightsData,
      });
    } catch (err: any) {
      setError(err.message || "Failed to generate insights");
      console.error("Error fetching insights:", err);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "border-red-500/50 bg-red-500/10 text-red-400";
      case "high":
        return "border-orange-500/50 bg-orange-500/10 text-orange-400";
      case "medium":
        return "border-yellow-500/50 bg-yellow-500/10 text-yellow-400";
      default:
        return "border-blue-500/50 bg-blue-500/10 text-blue-400";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return "🔴";
      case "high":
        return "🟠";
      case "medium":
        return "🟡";
      default:
        return "🔵";
    }
  };

  const renderInsightCard = (insight: Insight, index: number) => (
    <motion.div
      key={`${insight.type}-${index}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className={`cut-corner border p-5 ${getSeverityColor(insight.severity)}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{getSeverityIcon(insight.severity)}</span>
          <span className="text-xs uppercase tracking-[0.3em] font-mono">
            {insight.severity}
          </span>
        </div>
        {insight.loss_rate && (
          <span className="text-sm font-bold">
            {insight.loss_rate}% Loss Rate
          </span>
        )}
      </div>

      {insight.player && (
        <div className="text-cyan font-bold text-sm mb-2">
          🎮 {insight.player}
        </div>
      )}

      <h3 className="text-base font-semibold text-white mb-3 leading-relaxed">
        {insight.data}
      </h3>

      <div className="bg-black/30 p-3 rounded border-l-2 border-cyan-500/50">
        <div className="text-xs uppercase tracking-wider text-cyan/70 mb-1">
          💡 Recommendation
        </div>
        <p className="text-sm text-muted leading-relaxed">{insight.recommendation}</p>
      </div>

      {insight.sample_size && (
        <div className="text-xs text-muted/70">
          Sample: {insight.sample_size} rounds
        </div>
      )}
    </motion.div>
  );

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">
          Personalized Player Insights
        </h2>
        <p className="text-sm text-muted">
          KAST correlations, setup patterns, and economy analysis for Cloud9
        </p>
      </div>

      {/* Controls */}
      <div className="mb-6 flex items-end gap-4">
        <div className="flex items-center gap-3 cut-corner border border-ethereal bg-black/30 px-4 py-3">
          <span className="text-xs uppercase tracking-[0.3em] text-muted">
            Dataset:
          </span>
          <span className="text-sm font-bold text-cyan">
            20 Matches Available
          </span>
        </div>

        <button
          onClick={fetchInsights}
          disabled={loading}
          className="cut-corner px-6 py-2.5 text-sm uppercase tracking-[0.22em] border-2 border-cyan-500/50 text-cyan glow-cyan hover:bg-cyan-500/10 hover:border-cyan-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-bold"
        >
          {loading ? "🤖 Analyzing..." : "🚀 Generate Insights"}
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent"></div>
            <p className="mt-4 text-sm text-muted">
              Analyzing Cloud9 matches...
            </p>
          </div>
        </div>
      )}

      {/* Results */}
      {!loading && insights && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Summary Stats */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="cut-corner border border-ethereal bg-black/30 p-4">
              <div className="text-xs uppercase tracking-[0.3em] text-muted">
                Matches Analyzed
              </div>
              <div className="text-3xl font-bold text-white mt-2">
                {insights.matches_analyzed}
              </div>
            </div>
            <div className="cut-corner border border-ethereal bg-black/30 p-4">
              <div className="text-xs uppercase tracking-[0.3em] text-muted">
                Total Insights
              </div>
              <div className="text-3xl font-bold text-white mt-2">
                {Object.values(insights.insights).reduce(
                  (sum, arr) => sum + arr.length,
                  0
                )}
              </div>
            </div>
            <div className="cut-corner border border-ethereal bg-black/30 p-4">
              <div className="text-xs uppercase tracking-[0.3em] text-muted">
                Critical Issues
              </div>
              <div className="text-3xl font-bold text-red-400 mt-2">
                {(Object.values(insights.insights) as Insight[][]).reduce(
                  (sum, arr) =>
                    sum + arr.filter((i: Insight) => i.severity === "critical").length,
                  0
                )}
              </div>
            </div>
          </div>

          {/* KAST Correlations */}
          {insights.insights.kast_correlations.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span>📊</span>
                KAST Correlation Analysis
              </h3>
              <p className="text-sm text-muted mb-4">
                Rounds lost when players die without KAST (Kill, Assist,
                Survived, Traded)
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {insights.insights.kast_correlations.map((insight, idx) =>
                  renderInsightCard(insight, idx)
                )}
              </div>
            </div>
          )}

          {/* Setup Patterns */}
          {insights.insights.setup_patterns.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span>🎯</span>
                Setup & Composition Patterns
              </h3>
              <p className="text-sm text-muted mb-4">
                Starting positions and agent compositions that correlate with
                losses
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {insights.insights.setup_patterns.map((insight, idx) =>
                  renderInsightCard(insight, idx)
                )}
              </div>
            </div>
          )}

          {/* Economy Patterns */}
          {insights.insights.economy_patterns.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span>💰</span>
                Economy Management
              </h3>
              <p className="text-sm text-muted mb-4">
                Force buy cascades and economic decision patterns
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {insights.insights.economy_patterns.map((insight, idx) =>
                  renderInsightCard(insight, idx)
                )}
              </div>
            </div>
          )}

          {/* Timing Patterns */}
          {insights.insights.timing_patterns &&
            insights.insights.timing_patterns.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <span>⏱️</span>
                  Timing & Execution
                </h3>
                <p className="text-sm text-muted mb-4">
                  Late executes and fast round vulnerabilities
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {insights.insights.timing_patterns.map((insight, idx) =>
                    renderInsightCard(insight, idx)
                  )}
                </div>
              </div>
            )}

          {/* No Insights Found */}
          {Object.values(insights.insights).every((arr) => arr.length === 0) && (
            <div className="text-center py-12">
              <span className="text-6xl mb-4 block">✅</span>
              <h3 className="text-xl font-bold text-white mb-2">
                No Critical Issues Detected
              </h3>
              <p className="text-muted">
                Cloud9's performance appears consistent across analyzed matches.
              </p>
            </div>
          )}
        </motion.div>
      )}

      {/* Empty State */}
      {!loading && !insights && (
        <div className="text-center py-20">
          <span className="text-6xl mb-4 block">📊</span>
          <h3 className="text-xl font-bold text-white mb-2">
            Ready to Analyze
          </h3>
          <p className="text-muted mb-6">
            Click "Generate Insights" to analyze Cloud9's recent matches
          </p>
        </div>
      )}
    </div>
  );
}
