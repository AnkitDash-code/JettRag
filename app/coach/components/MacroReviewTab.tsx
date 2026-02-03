"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { generateMacroReviewWithLLM } from "@/lib/macro-llm";

interface MacroReviewResponse {
  match_id: string;
  team_name: string;
  agenda: string;
}

interface MacroReviewTabProps {
  loading: boolean;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export default function MacroReviewTab({
  loading,
  setLoading,
  setError,
}: MacroReviewTabProps) {
  const [review, setReview] = useState<MacroReviewResponse | null>(null);

  const fetchMacroReview = async () => {
    setLoading(true);
    setError(null);

    try {
      // Load precomputed Cloud9 data
      const response = await fetch('/data/teams/cloud9-20.json');
      if (!response.ok) {
        throw new Error("Failed to load Cloud9 data");
      }
      const matchData = await response.json();

      // Use LLM to generate macro review
      console.log('🤖 Generating macro review with LLM...');
      const agenda = await generateMacroReviewWithLLM(matchData, true); // true = use API if available

      setReview({
        match_id: 'cloud9-analysis',
        team_name: 'Cloud9',
        agenda,
      });
    } catch (err: any) {
      setError(err.message || "Failed to generate macro review");
      console.error("Error fetching macro review:", err);
    } finally {
      setLoading(false);
    }
  };

  // Format the agenda text with proper styling
  const formatAgenda = (agendaText: string) => {
    const lines = agendaText.split("\n");
    const sections: { title: string; content: string[] }[] = [];
    let currentSection: { title: string; content: string[] } | null = null;

    lines.forEach((line) => {
      // Section headers (numbered sections)
      if (/^\d+\.\s+[A-Z]/.test(line)) {
        if (currentSection) {
          sections.push(currentSection);
        }
        currentSection = {
          title: line,
          content: [],
        };
      } else if (currentSection && line.trim()) {
        currentSection.content.push(line);
      }
    });

    if (currentSection) {
      sections.push(currentSection);
    }

    return sections;
  };

  const renderAgendaLine = (line: string, index: number) => {
    const isWarning = line.includes("⚠");
    const isSuccess = line.includes("✓");
    const isRecommendation = line.includes("→");

    let className = "text-muted";
    let icon = null;

    if (isWarning) {
      className = "text-orange-400";
      icon = "⚠";
    } else if (isSuccess) {
      className = "text-green-400";
      icon = "✓";
    } else if (isRecommendation) {
      className = "text-cyan-400";
      icon = "→";
    }

    return (
      <motion.div
        key={index}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
        className={`font-mono text-sm ${className} leading-relaxed`}
      >
        {line}
      </motion.div>
    );
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">
          Automated Macro Game Review
        </h2>
        <p className="text-sm text-muted">
          Post-match analysis agenda highlighting critical strategic moments
        </p>
      </div>

      {/* Controls */}
      <div className="mb-6">
        <button
          onClick={fetchMacroReview}
          disabled={loading}
          className="cut-corner px-6 py-2.5 text-sm uppercase tracking-[0.22em] border border-cyan-500/30 text-cyan glow-cyan hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Generating Review..." : "Generate Review Agenda"}
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent"></div>
            <p className="mt-4 text-sm text-muted">
              Analyzing match and generating review agenda...
            </p>
          </div>
        </div>
      )}

      {/* Results */}
      {!loading && review && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* Match Info Header */}
          <div className="cut-corner border border-ethereal-strong bg-black/40 p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-[0.3em] text-muted mb-2">
                  Match ID
                </div>
                <div className="text-lg font-mono text-white">
                  {review.match_id}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs uppercase tracking-[0.3em] text-muted mb-2">
                  Team
                </div>
                <div className="text-lg font-semibold text-cyan">
                  {review.team_name}
                </div>
              </div>
            </div>
          </div>

          {/* Agenda Sections - Markdown Rendered */}
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
                {review.agenda}
              </ReactMarkdown>
            </div>
          </motion.div>

          {/* Raw Agenda (Collapsible) */}
          <details className="cut-corner border border-ethereal bg-black/20 p-4">
            <summary className="cursor-pointer text-sm uppercase tracking-[0.3em] text-muted hover:text-white transition-colors">
              View Raw Agenda
            </summary>
            <pre className="mt-4 whitespace-pre-wrap font-mono text-xs text-muted leading-relaxed">
              {review.agenda}
            </pre>
          </details>

          {/* Export Options */}
          <div className="flex gap-4">
            <button
              onClick={() => {
                navigator.clipboard.writeText(review.agenda);
                alert("Agenda copied to clipboard!");
              }}
              className="cut-corner px-4 py-2 text-xs uppercase tracking-[0.22em] border border-ethereal text-muted hover:text-white hover:border-white/30 transition-all"
            >
              📋 Copy to Clipboard
            </button>
            <button
              onClick={() => {
                const blob = new Blob([review.agenda], { type: "text/plain" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `c9-review-${review.match_id}.txt`;
                a.click();
              }}
              className="cut-corner px-4 py-2 text-xs uppercase tracking-[0.22em] border border-ethereal text-muted hover:text-white hover:border-white/30 transition-all"
            >
              💾 Download as TXT
            </button>
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {!loading && !review && (
        <div className="text-center py-20">
          <span className="text-6xl mb-4 block">📋</span>
          <h3 className="text-xl font-bold text-white mb-2">
            Ready to Generate Review
          </h3>
          <p className="text-muted mb-6">
            Click "Generate Review Agenda" to analyze Cloud9's strategic decisions
          </p>
          <div className="cut-corner border border-ethereal bg-black/20 p-6 max-w-2xl mx-auto">
            <h4 className="text-sm uppercase tracking-[0.3em] text-muted mb-3">
              Agenda Sections Include:
            </h4>
            <ul className="text-sm text-muted space-y-2 text-left">
              <li>• Pistol Round Performance (R1, R13)</li>
              <li>• Economy Management (Force buys, eco rounds)</li>
              <li>• Mid-Round Execution (Timing, late plants)</li>
              <li>• Ultimate Economy (Orb collection)</li>
              <li>• Critical Moments (Momentum swings)</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
