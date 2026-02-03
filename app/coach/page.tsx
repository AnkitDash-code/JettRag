"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import InsightsTab from "./components/InsightsTab";
import MacroReviewTab from "./components/MacroReviewTab";
import WhatIfSimulator from "./components/WhatIfSimulator";

type TabId = "insights" | "macro" | "whatif";

export default function CoachDashboard() {
  const [activeTab, setActiveTab] = useState<TabId>("insights");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tabs = [
    { id: "insights" as TabId, label: "Player Insights", icon: "📊" },
    { id: "macro" as TabId, label: "Macro Review", icon: "📋" },
    { id: "whatif" as TabId, label: "What-If Simulator", icon: "🔮" },
  ];

  return (
    <div className="relative min-h-screen bg-void">
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0 grid-overlay opacity-30" />
      <div className="pointer-events-none absolute inset-0 noise-overlay opacity-70" />
      <div className="pointer-events-none absolute inset-0 gradient-halo opacity-90" />

      <div className="relative z-10">
        {/* Header */}
        <motion.nav
          className="sticky top-4 z-20 mx-auto flex max-w-7xl items-center justify-between px-6 py-4 backdrop-blur-md bg-[rgba(10,14,20,0.65)] border border-white/10 shadow-[0_12px_35px_rgba(0,0,0,0.35)] cut-corner"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-3">
            <span className="h-2 w-2 rounded-full bg-[rgba(6,182,212,0.8)]" />
            <span className="text-sm uppercase tracking-[0.4em] text-muted">
              Vantage Point | Assistant Coach
            </span>
          </div>
          <a
            href="/"
            className="text-xs uppercase tracking-[0.2em] text-muted hover:text-white transition-colors"
          >
            ← Back to Home
          </a>
        </motion.nav>

        {/* Main Content */}
        <motion.div
          className="mx-auto max-w-7xl px-6 py-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          {/* Title Section */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white md:text-5xl">
              Comprehensive Assistant Coach
            </h1>
            <p className="mt-3 text-lg text-muted">
              Cloud9 Performance Analysis & Strategic Intelligence
            </p>
          </div>


          {/* Tab Navigation */}
          <div className="mb-6 flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`cut-corner px-6 py-3 text-sm uppercase tracking-[0.22em] transition-all ${
                  activeTab === tab.id
                    ? "border-2 border-cyan-400 bg-[rgba(6,182,212,0.15)] text-cyan glow-cyan"
                    : "border border-ethereal text-muted hover:text-white hover:border-white/20"
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="cut-corner border border-ethereal-strong bg-glass p-8 min-h-[600px]">
            {error && (
              <div className="mb-6 p-4 border border-red/50 bg-red/10 text-red rounded">
                <strong>Error:</strong> {error}
              </div>
            )}

            {activeTab === "insights" && (
              <InsightsTab
                loading={loading}
                setLoading={setLoading}
                setError={setError}
              />
            )}

            {activeTab === "macro" && (
              <MacroReviewTab
                loading={loading}
                setLoading={setLoading}
                setError={setError}
              />
            )}

            {activeTab === "whatif" && (
              <WhatIfSimulator
                loading={loading}
                setLoading={setLoading}
                setError={setError}
              />
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
