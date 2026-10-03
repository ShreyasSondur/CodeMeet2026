"use client";

import { useState, useRef, useEffect, MouseEvent } from "react";
import { motion } from "framer-motion";
import { soundFX } from "@/lib/audio";
import {
  Terminal,
  Sparkles,
  Building2,
  GraduationCap,
  HeartPulse,
  Radio,
} from "lucide-react";

export interface ProblemStatement {
  id: string;
  problemNum: number;
  label: string;
  title: string;
  category: "CIVIC TECH" | "AI & EDTECH" | "HEALTHCARE AI" | "DISASTER RESPONSE";
  categoryKey: "all" | "civic" | "edtech" | "health" | "disaster";
  shortDesc: string;
  recommendedStack: string[];
  impactScore: string;
  icon: typeof Building2;
  themeColor: {
    accent: string;
    border: string;
    glow: string;
    badge: string;
    gradient: string;
    tabGlow: string;
  };
}

export const problemStatementsData: ProblemStatement[] = [
  {
    id: "problem-1",
    problemNum: 1,
    label: "Problem 1",
    title: "Smart Civic Issue Reporting",
    category: "CIVIC TECH",
    categoryKey: "civic",
    shortDesc:
      "Local issues like potholes, garbage, and broken streetlights often go unaddressed due to lack of visibility and feedback. There is a need for a transparent platform where citizens can report such problems, track their status, and help authorities prioritize them.",
    recommendedStack: ["Next.js", "Computer Vision", "Geolocation", "PostGIS"],
    impactScore: "High Municipal Impact",
    icon: Building2,
    themeColor: {
      accent: "#a855f7",
      border: "rgba(168, 85, 247, 0.45)",
      glow: "rgba(168, 85, 247, 0.35)",
      badge: "bg-purple-500/15 text-purple-300 border-purple-500/40",
      gradient: "from-purple-500/20 via-transparent to-transparent",
      tabGlow: "shadow-[0_0_20px_rgba(168,85,247,0.4)]",
    },
  },
  {
    id: "problem-2",
    problemNum: 2,
    label: "Problem 2",
    title: "Personalized Learning Assistant",
    category: "AI & EDTECH",
    categoryKey: "edtech",
    shortDesc:
      "Students face challenges because one-size-fits-all teaching does not match their individual strengths and weaknesses. There is a need for an intelligent assistant that adapts to learners, providing tailored study plans and real-time feedback.",
    recommendedStack: ["React 19", "LLM Agents", "Knowledge Graphs", "Speech AI"],
    impactScore: "Global EdTech Shift",
    icon: GraduationCap,
    themeColor: {
      accent: "#38bdf8",
      border: "rgba(56, 189, 248, 0.45)",
      glow: "rgba(56, 189, 248, 0.35)",
      badge: "bg-sky-500/15 text-sky-300 border-sky-500/40",
      gradient: "from-sky-500/20 via-transparent to-transparent",
      tabGlow: "shadow-[0_0_20px_rgba(56,189,248,0.4)]",
    },
  },
  {
    id: "problem-3",
    problemNum: 3,
    label: "Problem 3",
    title: "AI for Early Disease Detection",
    category: "HEALTHCARE AI",
    categoryKey: "health",
    shortDesc:
      "Critical illnesses often go undiagnosed until too late, due to limited resources and delays in analysis. There is a need for AI-based solutions that can detect diseases early from minimal patient data or imaging, enabling faster and more accurate diagnosis.",
    recommendedStack: ["PyTorch", "Medical CNNs", "Edge AI", "DICOM"],
    impactScore: "Life-Saving Potential",
    icon: HeartPulse,
    themeColor: {
      accent: "#f43f5e",
      border: "rgba(244, 63, 94, 0.45)",
      glow: "rgba(244, 63, 94, 0.35)",
      badge: "bg-rose-500/15 text-rose-300 border-rose-500/40",
      gradient: "from-rose-500/20 via-transparent to-transparent",
      tabGlow: "shadow-[0_0_20px_rgba(244,63,94,0.4)]",
    },
  },
  {
    id: "problem-4",
    problemNum: 4,
    label: "Problem 4",
    title: "Smart Disaster Response Platform",
    category: "DISASTER RESPONSE",
    categoryKey: "disaster",
    shortDesc:
      "During floods, landslides, and urban disasters, victims and responders struggle with poor coordination and slow resource allocation. There is a need for a system that enables quick reporting of emergencies, real-time resource matching, and clear guidance on safe zones for effective disaster relief.",
    recommendedStack: ["WebRTC", "P2P Mesh", "GIS Mapping", "SOS Triage"],
    impactScore: "Crisis Critical Mission",
    icon: Radio,
    themeColor: {
      accent: "#ccff00",
      border: "rgba(204, 255, 0, 0.45)",
      glow: "rgba(204, 255, 0, 0.35)",
      badge: "bg-[#ccff00]/15 text-[#ccff00] border-[#ccff00]/40",
      gradient: "from-[#ccff00]/20 via-transparent to-transparent",
      tabGlow: "shadow-[0_0_20px_rgba(204,255,0,0.4)]",
    },
  },
];

// Interactive 3D Tilt Card Component
function ProblemCard({ problem }: { problem: ProblemStatement }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);
  const IconComponent = problem.icon;

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rX = ((y - centerY) / centerY) * -6;
    const rY = ((x - centerX) / centerX) * 6;

    setRotateX(rX);
    setRotateY(rY);
    setMousePos({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
    });
  };

  const handleMouseEnter = () => {
    soundFX.playHover();
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: "1000px",
      }}
      className="relative w-full transition-transform duration-200 ease-out"
    >
      <div
        style={{
          transform: isHovered
            ? `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(8px)`
            : "rotateX(0deg) rotateY(0deg) translateZ(0px)",
          transition: isHovered ? "none" : "transform 0.5s ease",
        }}
        className="relative w-full flex flex-col group select-none"
      >
        {/* ========================================================================= */}
        {/* CUSTOM FOLDER TAB + CHAMFER BORDER SILHOUETTE (Exact Match to Reference) */}
        {/* ========================================================================= */}

        {/* Top Folder Tab Header */}
        <div className="relative flex items-end">
          {/* Left Tab Block */}
          <div
            className="relative px-5 py-2.5 rounded-t-xl bg-[#090b14]/95 border-t-2 border-l-2 border-r border-b-0 backdrop-blur-xl flex items-center gap-2.5 transition-all duration-300 z-10"
            style={{
              borderColor: isHovered ? problem.themeColor.accent : "rgba(255, 255, 255, 0.18)",
              boxShadow: isHovered ? `0 -5px 20px ${problem.themeColor.glow}` : "none",
            }}
          >
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: problem.themeColor.accent }}
            />
            <span className="font-mono text-xs sm:text-sm font-bold text-white tracking-wider">
              {problem.label}
            </span>
            <span
              className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ml-1 border ${problem.themeColor.badge}`}
            >
              {problem.category}
            </span>
          </div>

          {/* Chamfer Diagonal Connector */}
          <div className="relative -ml-px w-8 h-8 pointer-events-none overflow-hidden">
            <svg
              className="w-full h-full"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M 0 32 L 0 0 L 32 32 Z"
                fill="#090b14"
                fillOpacity="0.95"
              />
              <path
                d="M 0 0 L 32 32"
                stroke={isHovered ? problem.themeColor.accent : "rgba(255, 255, 255, 0.18)"}
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </div>

          {/* Rest of Top Horizontal Line */}
          <div
            className="flex-1 h-[2px] mb-0 transition-colors duration-300"
            style={{
              backgroundColor: isHovered ? problem.themeColor.accent : "rgba(255, 255, 255, 0.18)",
              boxShadow: isHovered ? `0 0 12px ${problem.themeColor.glow}` : "none",
            }}
          />
        </div>

        {/* Main Card Body */}
        <div
          className="relative -mt-[2px] p-6 sm:p-7 md:p-8 rounded-b-2xl rounded-tr-2xl bg-[#080911]/90 border-2 backdrop-blur-2xl transition-all duration-300 shadow-[0_20px_50px_rgba(0,0,0,0.85)] flex flex-col justify-between overflow-hidden min-h-[220px]"
          style={{
            borderColor: isHovered ? problem.themeColor.accent : "rgba(255, 255, 255, 0.15)",
            boxShadow: isHovered
              ? `0 15px 40px -10px ${problem.themeColor.glow}, 0 0 25px rgba(0,0,0,0.9)`
              : "0 10px 30px rgba(0,0,0,0.7)",
          }}
        >
          {/* Dynamic Interactive Spotlight Glare that tracks cursor */}
          <div
            className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              background: `radial-gradient(450px circle at ${mousePos.x}% ${mousePos.y}%, ${problem.themeColor.glow} 0%, transparent 70%)`,
            }}
          />

          {/* Subtle Cyber Grid Texture Inside Card */}
          <div className="absolute inset-0 cyber-grid opacity-10 pointer-events-none" />

          {/* Corner Cyber Accents */}
          <div
            className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 rounded-br-sm transition-colors duration-300"
            style={{ borderColor: isHovered ? problem.themeColor.accent : "rgba(255,255,255,0.2)" }}
          />
          <div
            className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 rounded-bl-sm transition-colors duration-300"
            style={{ borderColor: isHovered ? problem.themeColor.accent : "rgba(255,255,255,0.2)" }}
          />

          {/* Top Content: Title & Icon */}
          <div className="relative z-10">
            <div className="flex items-start justify-between gap-4 mb-3">
              <h3 className="font-[family-name:var(--font-orbitron)] font-bold text-xl sm:text-2xl text-white group-hover:text-white transition-colors leading-tight">
                {problem.title}
              </h3>
              <div
                className="p-2.5 rounded-xl bg-black/60 border border-white/10 shrink-0 group-hover:scale-110 transition-transform duration-300"
                style={{ color: problem.themeColor.accent }}
              >
                <IconComponent className="w-5 h-5" />
              </div>
            </div>

            {/* Problem Statement Core Text */}
            <p className="font-mono text-xs sm:text-sm text-zinc-300 group-hover:text-zinc-200 leading-relaxed transition-colors mt-2 mb-4">
              {problem.shortDesc}
            </p>
          </div>

          {/* Bottom Card Footer: Recommended Tech Stack Badges */}
          <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              {problem.recommendedStack.map((tech, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-0.5 rounded bg-black/60 border border-white/10 text-[10px] font-mono text-zinc-400 group-hover:text-zinc-300 transition-colors"
                >
                  #{tech}
                </span>
              ))}
            </div>
            <span
              className="text-[10px] font-mono font-bold uppercase tracking-wider hidden sm:inline"
              style={{ color: problem.themeColor.accent }}
            >
              {problem.impactScore}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Background Holographic Matrix Particle Canvas
function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 800);

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener("resize", handleResize);

    // Generate lightweight particle nodes
    const particleCount = Math.min(35, Math.floor(width / 35));
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: Math.random() * 1.5 + 0.8,
      alpha: Math.random() * 0.5 + 0.2,
      color: Math.random() > 0.6 ? "#ccff00" : Math.random() > 0.3 ? "#a855f7" : "#00f0ff",
    }));

    let isVisible = true;
    const observer = new IntersectionObserver(
      (entries) => {
        isVisible = entries[0].isIntersecting;
      },
      { threshold: 0.1 }
    );
    observer.observe(canvas);

    const render = () => {
      if (isVisible) {
        ctx.clearRect(0, 0, width, height);

        // Update and draw particles
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          p.x += p.vx;
          p.y += p.vy;

          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height;
          if (p.y > height) p.y = 0;

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.alpha;
          ctx.fill();

          // Connect adjacent particles
          for (let j = i + 1; j < particles.length; j++) {
            const p2 = particles[j];
            const dx = p.x - p2.x;
            const dy = p.y - p2.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 120) {
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.strokeStyle = p.color;
              ctx.globalAlpha = (1 - dist / 120) * 0.15;
              ctx.lineWidth = 0.8;
              ctx.stroke();
            }
          }
        }
      }
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animId);
      observer.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none opacity-40 z-0"
    />
  );
}

// Master Problem Statements Section
export default function ProblemStatementsSection() {
  const [selectedFilter, setSelectedFilter] = useState<"all" | "civic" | "edtech" | "health" | "disaster">("all");

  const filteredProblems =
    selectedFilter === "all"
      ? problemStatementsData
      : problemStatementsData.filter((p) => p.categoryKey === selectedFilter);

  const filterTabs = [
    { key: "all", label: "ALL TRACKS (4)" },
    { key: "civic", label: "CIVIC TECH" },
    { key: "edtech", label: "AI & EDTECH" },
    { key: "health", label: "HEALTHCARE AI" },
    { key: "disaster", label: "DISASTER RESPONSE" },
  ] as const;

  return (
    <section
      id="problems"
      className="relative min-h-screen w-full bg-[#050507] text-white flex flex-col justify-between p-5 sm:p-8 lg:p-14 border-t border-white/10 cyber-grid overflow-hidden selection:bg-[#ccff00] selection:text-black"
    >
      {/* Background Ambience & Lighting Glow Blobs */}
      <div className="absolute inset-0 scanline-effect opacity-20 pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-2/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#ccff00]/5 rounded-full blur-[180px] pointer-events-none" />

      {/* Floating 60fps Matrix Particle Canvas */}
      <ParticleCanvas />

      {/* Top Telemetry Header Bar */}
      <div className="relative z-10 w-full mx-auto flex items-center justify-between border-b border-white/10 pb-4 mb-8 sm:mb-10">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ccff00] animate-pulse" />
          <span className="font-mono text-xs sm:text-sm font-bold tracking-widest text-[#ccff00] uppercase">
            // 05. HACKATHON PROBLEM STATEMENTS
          </span>
        </div>
      </div>

      {/* Section Headline Centerpiece */}
      <div className="relative z-10 w-full max-w-5xl mx-auto text-center space-y-3 pt-2 mb-8 select-none">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/80 border border-purple-500/40 text-purple-300 text-xs font-mono shadow-[0_0_20px_rgba(168,85,247,0.25)]">
          <Terminal className="w-3.5 h-3.5 text-purple-400" />
          <span>OFFICIAL PROBLEM MATRIX // SELECT YOUR ARENA</span>
        </div>

        <h2 className="font-[family-name:var(--font-orbitron)] font-black text-3xl sm:text-5xl lg:text-6xl tracking-tight text-white drop-shadow-[0_10px_30px_rgba(0,0,0,0.9)]">
          Problem <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-[#ccff00] to-cyan-400">Statements</span>
        </h2>

        <p className="font-mono text-xs sm:text-sm text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          Teams must choose and engineer a working solution prototype for any <strong className="text-white">one</strong> of the four challenges below during the 24-hour sprint.
        </p>

        {/* Quick Filter Pill Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-3">
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                soundFX.playClick();
                setSelectedFilter(tab.key);
              }}
              onMouseEnter={() => soundFX.playHover()}
              className={`px-4 py-1.5 rounded-full text-xs font-mono font-bold transition-all duration-300 cursor-pointer border ${
                selectedFilter === tab.key
                  ? "bg-purple-600/30 border-purple-400 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                  : "bg-black/60 border-white/10 text-zinc-400 hover:text-zinc-200 hover:border-white/20"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2x2 Problem Cards Grid matching reference image layout */}
      <div className="relative z-10 w-full max-w-7xl mx-auto my-4 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 lg:gap-10">
        {filteredProblems.map((problem, idx) => (
          <motion.div
            key={problem.id}
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.05 }}
            transition={{
              duration: 0.65,
              delay: (idx % 2) * 0.08,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="w-full"
          >
            <ProblemCard problem={problem} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
