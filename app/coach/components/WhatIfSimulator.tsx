"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { simulateWhatIfWithLLM } from "@/lib/whatif-llm";

interface WhatIfResponse {
  match_id: string;
  query: string;
  analysis: string;
}

interface WhatIfSimulatorProps {
  loading: boolean;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export default function WhatIfSimulator({
  loading,
  setLoading,
  setError,
}: WhatIfSimulatorProps) {
  const [query, setQuery] = useState("");
  const [analysis, setAnalysis] = useState<WhatIfResponse | null>(null);

  const exampleQueries = [
    "On Round 22 (score 10-11) on Haven, we attempted a 3v5 retake on C-site and lost. Would it have been better to save our weapons?",
    "Round 15 (8-6): We forced a 4v5 retake on A-site with 25 seconds left. Should we have saved?",
    "Round 8: 2v4 situation on B-site. We attempted retake and lost. Was saving the better call?",
  ];

  const simulateWhatIf = async () => {
    if (!query.trim()) {
      setError("Please enter a question");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Load precomputed Cloud9 data
      const response = await fetch('/data/teams/cloud9-20.json');
      if (!response.ok) {
        throw new Error("Failed to load Cloud9 data");
      }
      const matchData = await response.json();

      // Use LLM to simulate what-if scenario
      console.log('🤖 Simulating scenario with LLM...');
      const analysisText = await simulateWhatIfWithLLM(query.trim(), matchData, true); // true = use API if available

      setAnalysis({
        match_id: 'cloud9-analysis',
        query: query.trim(),
        analysis: analysisText,
      });
    } catch (err: any) {
      setError(err.message || "Failed to simulate what-if scenario");
      console.error("Error simulating what-if:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatAnalysis = (analysisText: string) => {
    const sections = analysisText.split("\n\n");
    return sections.map((section, idx) => {
      const lines = section.split("\n");
      const isHeader = lines[0]?.includes("ANALYZING") || lines[0]?.includes("GAME STATE");
      const isActualDecision = section.includes("ACTUAL DECISION");
      const isAlternative = section.includes("ALTERNATIVE");
      const isRecommendation = section.includes("RECOMMENDATION");

      return (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: idx * 0.1 }}
          className={`mb-4 ${
            isHeader
              ? "border-l-4 border-cyan-500 pl-4"
              : isActualDecision
              ? "border-l-4 border-orange-500 pl-4 bg-orange-500/5 p-4 rounded-r"
              : isAlternative
              ? "border-l-4 border-green-500 pl-4 bg-green-500/5 p-4 rounded-r"
              : isRecommendation
              ? "border-l-4 border-blue-500 pl-4 bg-blue-500/10 p-4 rounded-r"
              : ""
          }`}
        >
          {lines.map((line, lineIdx) => {
            const isWarning = line.includes("⚠");
            const isSuccess = line.includes("✓");
            const isBullet = line.trim().startsWith("-");

            let className = "text-muted";
            if (isHeader && lineIdx === 0) {
              className = "text-xl font-bold text-white";
            } else if (line.includes(":") && !isBullet) {
              className = "text-white font-semibold";
            } else if (isWarning) {
              className = "text-orange-400";
            } else if (isSuccess) {
              className = "text-green-400";
            }

            return (
              <div
                key={lineIdx}
                className={`font-mono text-sm ${className} leading-relaxed ${
                  isBullet ? "ml-4" : ""
                }`}
              >
                {line}
              </div>
            );
          })}
        </motion.div>
      );
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">
          Hypothetical Outcome Predictor
        </h2>
        <p className="text-sm text-muted">
          Ask "what if" questions about past strategic decisions
        </p>
      </div>

      {/* Query Input */}
      <div className="mb-6">
        <label className="block text-xs uppercase tracking-[0.3em] text-muted mb-3">
          Your Question
        </label>
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Example: On Round 22 (score 10-11) on Haven, we attempted a 3v5 retake on C-site and lost. Would it have been better to save our weapons?"
          rows={4}
          className="w-full cut-corner border border-cyan-500/30 bg-black/50 px-4 py-3 text-sm font-mono text-white placeholder:text-muted/50 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/20 focus:outline-none resize-none"
        />

        <div className="flex items-center gap-4 mt-3">
          <button
            onClick={simulateWhatIf}
            disabled={loading || !query.trim()}
            className="cut-corner px-6 py-2.5 text-sm uppercase tracking-[0.22em] border border-cyan-500/30 text-cyan glow-cyan hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Analyzing..." : "Simulate Scenario"}
          </button>

          <button
            onClick={() => setQuery("")}
            className="text-xs uppercase tracking-[0.22em] text-muted hover:text-white transition-colors"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Example Queries */}
      <div className="mb-8">
        <div className="text-xs uppercase tracking-[0.3em] text-muted mb-3">
          Example Questions
        </div>
        <div className="space-y-2">
          {exampleQueries.map((example, idx) => (
            <button
              key={idx}
              onClick={() => setQuery(example)}
              className="w-full text-left cut-corner border border-ethereal bg-black/20 p-3 text-xs font-mono text-muted hover:text-white hover:border-white/20 transition-all"
            >
              {example}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent"></div>
            <p className="mt-4 text-sm text-muted">
              Simulating alternative scenario...
            </p>
          </div>
        </div>
      )}

      {/* Results */}
      {!loading && analysis && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* Query Echo */}
          <div className="cut-corner border border-ethereal-strong bg-black/40 p-6">
            <div className="text-xs uppercase tracking-[0.3em] text-muted mb-2">
              Your Question
            </div>
            <div className="text-sm text-white font-mono italic">
              "{analysis.query}"
            </div>
          </div>

          {/* Analysis - Markdown Rendered */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="cut-corner border border-ethereal bg-black/30 p-6"
          >
            <div className="prose prose-invert max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({node, ...props}) => <h1 className="text-3xl font-bold text-white mb-4 mt-6" {...props} />,
                  h2: ({node, ...props}) => <h2 className="text-2xl font-bold text-cyan mb-3 mt-5 border-l-4 border-cyan-500/50 pl-4" {...props} />,
                  h3: ({node, ...props}) => <h3 className="text-xl font-bold text-white mb-2 mt-4" {...props} />,
                  p: ({node, ...props}) => <p className="text-muted mb-3 leading-relaxed" {...props} />,
                  ul: ({node, ...props}) => <ul className="list-disc list-inside text-muted space-y-1 mb-4" {...props} />,
                  ol: ({node, ...props}) => <ol className="list-decimal list-inside text-muted space-y-1 mb-4" {...props} />,
                  li: ({node, ...props}) => <li className="text-muted" {...props} />,
                  strong: ({node, ...props}) => <strong className="text-white font-semibold" {...props} />,
                  em: ({node, ...props}) => <em className="text-cyan-400" {...props} />,
                  code: ({node, ...props}) => <code className="bg-black/50 text-cyan px-2 py-1 rounded font-mono text-sm" {...props} />,
                  pre: ({node, ...props}) => <pre className="bg-black/50 p-4 rounded overflow-x-auto mb-4" {...props} />,
                  table: ({node, ...props}) => (
                    <div className="overflow-x-auto mb-4">
                      <table className="min-w-full border-collapse border border-ethereal" {...props} />
                    </div>
                  ),
                  thead: ({node, ...props}) => <thead className="bg-black/50" {...props} />,
                  tbody: ({node, ...props}) => <tbody {...props} />,
                  tr: ({node, ...props}) => <tr className="border-b border-ethereal hover:bg-cyan-500/5" {...props} />,
                  th: ({node, ...props}) => <th className="border border-ethereal px-4 py-2 text-left text-cyan font-semibold" {...props} />,
                  td: ({node, ...props}) => <td className="border border-ethereal px-4 py-2 text-muted" {...props} />,
                  blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-orange-500 pl-4 italic text-muted my-4" {...props} />,
                  a: ({node, ...props}) => <a className="text-cyan hover:text-cyan-400 underline" {...props} />,
                }}
              >
                {analysis.analysis}
              </ReactMarkdown>
            </div>
          </motion.div>

          {/* Export Options */}
          <div className="flex gap-4">
            <button
              onClick={() => {
                const fullText = `QUERY:\n${analysis.query}\n\nANALYSIS:\n${analysis.analysis}`;
                navigator.clipboard.writeText(fullText);
                alert("Analysis copied to clipboard!");
              }}
              className="cut-corner px-4 py-2 text-xs uppercase tracking-[0.22em] border border-ethereal text-muted hover:text-white hover:border-white/30 transition-all"
            >
              📋 Copy Analysis
            </button>
            <button
              onClick={() => {
                const fullText = `QUERY:\n${analysis.query}\n\nANALYSIS:\n${analysis.analysis}`;
                const blob = new Blob([fullText], { type: "text/plain" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `c9-whatif-${analysis.match_id}.txt`;
                a.click();
              }}
              className="cut-corner px-4 py-2 text-xs uppercase tracking-[0.22em] border border-ethereal text-muted hover:text-white hover:border-white/30 transition-all"
            >
              💾 Download Analysis
            </button>
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {!loading && !analysis && (
        <div className="text-center py-20">
          <span className="text-6xl mb-4 block">🔮</span>
          <h3 className="text-xl font-bold text-white mb-2">
            Ready to Predict
          </h3>
          <p className="text-muted mb-6">
            Ask a question about past decisions to see alternative outcomes
          </p>
          <div className="cut-corner border border-ethereal bg-black/20 p-6 max-w-2xl mx-auto">
            <h4 className="text-sm uppercase tracking-[0.3em] text-muted mb-3">
              Analysis Includes:
            </h4>
            <ul className="text-sm text-muted space-y-2 text-left">
              <li>• Game state analysis (player counts, time, utility)</li>
              <li>• Probability of actual decision success</li>
              <li>• Probability of alternative scenario</li>
              <li>• Economic impact comparison</li>
              <li>• Strategic recommendation with reasoning</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
