"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function HomePage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="relative min-h-screen bg-void overflow-hidden">
      {/* Animated Background Layers */}
      <div className="pointer-events-none absolute inset-0 grid-overlay opacity-20" />
      <div className="pointer-events-none absolute inset-0 noise-overlay opacity-60" />

      {/* Floating Particles */}
      <FloatingParticles />

      {/* Mouse Follow Gradient */}
      <motion.div
        className="pointer-events-none absolute w-[600px] h-[600px] rounded-full opacity-30 blur-3xl"
        style={{
          background: "radial-gradient(circle, rgba(6,182,212,0.4) 0%, transparent 70%)",
          left: mousePosition.x - 300,
          top: mousePosition.y - 300,
        }}
        animate={{
          left: mousePosition.x - 300,
          top: mousePosition.y - 300,
        }}
        transition={{ type: "spring", damping: 30, stiffness: 200 }}
      />

      {/* Scanning Lines */}
      <div className="scan-line absolute inset-0 pointer-events-none opacity-20" />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6">
        {/* Hero Section */}
        <div className="text-center max-w-6xl">
          {/* Animated Logo Badge */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 20,
              delay: 0.2
            }}
            className="mb-8 inline-flex items-center gap-3 cut-corner border border-cyan-500/30 bg-black/60 backdrop-blur-xl px-6 py-3 relative overflow-hidden group"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/20 to-cyan-500/0"
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
            <motion.span
              className="h-2 w-2 rounded-full bg-cyan-500 relative z-10"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [1, 0.5, 1]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-xs uppercase tracking-[0.4em] text-cyan relative z-10 font-bold">
              Vantage Point AI
            </span>
          </motion.div>

          {/* Glitch Title Effect */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mb-6 text-5xl font-bold text-white md:text-7xl lg:text-9xl relative"
          >
            <motion.span
              className="inline-block"
              animate={{
                textShadow: [
                  "0 0 10px rgba(6,182,212,0.5)",
                  "0 0 20px rgba(6,182,212,0.8), 0 0 30px rgba(6,182,212,0.6)",
                  "0 0 10px rgba(6,182,212,0.5)"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Cloud9
            </motion.span>
            <br />
            <motion.span
              className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent"
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
              }}
              transition={{ duration: 3, repeat: Infinity }}
              style={{ backgroundSize: "200% 200%" }}
            >
              Assistant Coach
            </motion.span>
          </motion.h1>

          {/* Animated Subtitle with Typewriter Effect */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mb-12 text-lg text-muted md:text-xl lg:text-2xl flex items-center justify-center gap-2 flex-wrap"
          >
            <TypewriterText text="LLM-Powered" delay={0.8} />
            <span className="text-cyan">•</span>
            <TypewriterText text="VALORANT Analysis" delay={1.2} />
            <span className="text-cyan">•</span>
            <TypewriterText text="Strategic Intelligence" delay={1.6} />
          </motion.div>

          {/* Enhanced CTA Button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 15,
              delay: 0.8
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              href="/coach"
              className="relative inline-block cut-corner px-10 py-5 text-lg uppercase tracking-[0.22em] border-2 border-cyan-500 text-cyan font-bold overflow-hidden group"
            >
              <motion.div
                className="absolute inset-0 bg-cyan-500"
                initial={{ x: "-100%" }}
                whileHover={{ x: 0 }}
                transition={{ duration: 0.3 }}
              />
              <span className="relative z-10 group-hover:text-black transition-colors flex items-center gap-3">
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  🚀
                </motion.span>
                Launch Dashboard
              </span>

              {/* Pulse Effect */}
              <motion.div
                className="absolute inset-0 border-2 border-cyan-500 cut-corner"
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.5, 0, 0.5]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </Link>
          </motion.div>
        </div>

        {/* Animated Feature Cards */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl w-full"
        >
          <EnhancedFeatureCard
            icon="📊"
            title="Player Insights"
            description="Deep KAST analysis, setup patterns, and economy management powered by GPT-OSS-120B"
            color="cyan"
            delay={1.1}
          />
          <EnhancedFeatureCard
            icon="📋"
            title="Macro Review"
            description="Comprehensive post-match review with tables, drill recommendations, and priority action items"
            color="purple"
            delay={1.3}
          />
          <EnhancedFeatureCard
            icon="🔮"
            title="What-If Simulator"
            description="Hypothetical scenario analysis with probability estimates and strategic recommendations"
            color="blue"
            delay={1.5}
          />
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.7 }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl w-full"
        >
          <StatCounter label="Response Time" value="2-5s" suffix="" />
          <StatCounter label="Insights Generated" value="10" suffix="+" />
          <StatCounter label="Analysis Depth" value="500" suffix="+ words" />
          <StatCounter label="Accuracy" value="95" suffix="%" />
        </motion.div>

        {/* Tech Stack with Logos */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="mt-20 text-center"
        >
          <p className="text-xs uppercase tracking-[0.3em] text-cyan/70 mb-6 font-bold">
            Powered By Cutting-Edge Technology
          </p>
          <div className="flex flex-wrap justify-center gap-8 items-center">
            <TechBadge name="Next.js 14" />
            <TechBadge name="GPT-OSS-120B" />
            <TechBadge name="Groq API" />
            <TechBadge name="React Markdown" />
            <TechBadge name="Framer Motion" />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// Floating Particles Component
function FloatingParticles() {
  const [dimensions, setDimensions] = useState({ width: 1920, height: 1080 });

  useEffect(() => {
    setDimensions({ width: window.innerWidth, height: window.innerHeight });
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-cyan-500 rounded-full"
          initial={{
            x: Math.random() * dimensions.width,
            y: Math.random() * dimensions.height,
            opacity: Math.random() * 0.5 + 0.2,
          }}
          animate={{
            y: [null, Math.random() * dimensions.height],
            x: [null, Math.random() * dimensions.width],
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />
      ))}
    </div>
  );
}

// Typewriter Effect Component
function TypewriterText({ text, delay }: { text: string; delay: number }) {
  const [displayText, setDisplayText] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => {
      let i = 0;
      const interval = setInterval(() => {
        setDisplayText(text.slice(0, i));
        i++;
        if (i > text.length) clearInterval(interval);
      }, 50);
      return () => clearInterval(interval);
    }, delay * 1000);
    return () => clearTimeout(timeout);
  }, [text, delay]);

  return <span className="font-mono">{displayText}</span>;
}

// Enhanced Feature Card
function EnhancedFeatureCard({
  icon,
  title,
  description,
  color,
  delay
}: {
  icon: string;
  title: string;
  description: string;
  color: string;
  delay: number;
}) {
  const colors = {
    cyan: "border-cyan-500/30 hover:border-cyan-500 hover:shadow-cyan-500/50",
    purple: "border-purple-500/30 hover:border-purple-500 hover:shadow-purple-500/50",
    blue: "border-blue-500/30 hover:border-blue-500 hover:shadow-blue-500/50",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, rotateX: -15 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{
        duration: 0.6,
        delay,
        type: "spring",
        stiffness: 100
      }}
      whileHover={{
        y: -10,
        rotateY: 5,
        transition: { duration: 0.2 }
      }}
      className={`cut-corner border ${colors[color as keyof typeof colors]} bg-glass backdrop-blur-xl p-8 group relative overflow-hidden`}
      style={{ perspective: "1000px" }}
    >
      {/* Animated Background Gradient */}
      <motion.div
        className={`absolute inset-0 bg-gradient-to-br from-${color}-500/5 to-transparent opacity-0 group-hover:opacity-100`}
        transition={{ duration: 0.3 }}
      />

      {/* Icon with Animation */}
      <motion.div
        className="text-6xl mb-4 relative z-10"
        whileHover={{ scale: 1.2, rotate: 360 }}
        transition={{ duration: 0.5 }}
      >
        {icon}
      </motion.div>

      {/* Title */}
      <h3 className="text-xl font-bold text-white mb-3 group-hover:text-cyan transition-colors relative z-10">
        {title}
      </h3>

      {/* Description */}
      <p className="text-sm text-muted leading-relaxed relative z-10">
        {description}
      </p>

      {/* Corner Accent */}
      <motion.div
        className={`absolute top-0 right-0 w-20 h-20 bg-${color}-500/20 blur-2xl`}
        animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
    </motion.div>
  );
}

// Stat Counter
function StatCounter({ label, value, suffix }: { label: string; value: string; suffix: string }) {
  return (
    <motion.div
      className="text-center"
      whileHover={{ scale: 1.1 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 200, delay: Math.random() * 0.5 }}
        className="text-4xl font-bold text-cyan mb-2"
      >
        {value}{suffix}
      </motion.div>
      <div className="text-xs uppercase tracking-wider text-muted">
        {label}
      </div>
    </motion.div>
  );
}

// Tech Badge
function TechBadge({ name }: { name: string }) {
  return (
    <motion.div
      whileHover={{ scale: 1.1, y: -5 }}
      className="cut-corner border border-ethereal bg-black/40 backdrop-blur-sm px-6 py-3 text-sm text-muted hover:text-cyan hover:border-cyan-500/50 transition-all cursor-pointer"
    >
      {name}
    </motion.div>
  );
}
