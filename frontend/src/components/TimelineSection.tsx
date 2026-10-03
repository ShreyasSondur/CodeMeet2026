"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { soundFX } from "@/lib/audio";
import Timeline3DCanvas from "./Timeline3DCanvas";
import {
  Terminal,
  Clock,
  Sparkles,
  Zap,
  Award,
  CheckCircle2,
  Calendar,
  Layers,
  MapPin,
  Trophy,
  Flame,
  ArrowRight,
  ShieldAlert,
  Shield,
  ArrowUp,
} from "lucide-react";

interface Milestone {
  id: string;
  phase: number;
  time: string;
  date: string;
  title: string;
  subtitle: string;
  description: string;
  fee?: string;
  tag: string;
  color: "lime" | "cyan" | "amber";
  align?: "top" | "bottom";
}

const milestones: Milestone[] = [
  // Phase 1: Registration & Virtual Screening (Top Rail)
  {
    id: "m1",
    phase: 1,
    time: "PORTAL LAUNCH",
    date: "OCTOBER 01",
    title: "Registration Begins",
    subtitle: "ROUND 1 ONLINE ENTRY",
    description: "Official registration opens for Round 1 online screening round across national colleges.",
    fee: "₹100 / Team",
    tag: "PORTAL OPEN",
    color: "lime",
    align: "top",
  },
  {
    id: "m2",
    phase: 1,
    time: "11:59 PM IST",
    date: "OCTOBER 22",
    title: "Registration Closes",
    subtitle: "SUBMISSION DEADLINE",
    description: "Final deadline for Round 1 online team registration and initial submissions.",
    tag: "DEADLINE",
    color: "lime",
    align: "bottom",
  },
  {
    id: "m3",
    phase: 1,
    time: "48H SPRINT",
    date: "OCTOBER 23 - 24",
    title: "Round 1: Online Hack",
    subtitle: "ONLINE SCREENING ROUND",
    description: "Round 1 online hackathon screening challenge where teams build and submit their digital prototype.",
    tag: "VIRTUAL ROUND",
    color: "lime",
    align: "top",
  },

  // Phase 2: Results & Finalist Slot Confirmation (Middle Rail)
  {
    id: "m4",
    phase: 2,
    time: "OFFICIAL LIST",
    date: "OCTOBER 25",
    title: "Round 1 Results Out",
    subtitle: "TOP 30 TEAMS ANNOUNCED",
    description: "Jury announces the Top 30 shortlisted teams advancing to the 24-hour offline grand finale.",
    tag: "RESULTS",
    color: "cyan",
    align: "bottom",
  },
  {
    id: "m5",
    phase: 2,
    time: "SEAT CONFIRMATION",
    date: "OCTOBER 25 - 30",
    title: "Round 2 Registration",
    subtitle: "OFFLINE PASS CONFIRMATION",
    description: "Shortlisted Top 30 finalist teams confirm their 24H offline seats and complete check-in formalities.",
    fee: "₹500 / Team",
    tag: "FINALISTS ONLY",
    color: "cyan",
    align: "top",
  },

  // Phase 3: 24H Offline Grand Finale (Bottom Rail)
  {
    id: "m6",
    phase: 3,
    time: "9:30 AM KICKOFF",
    date: "NOVEMBER 01",
    title: "Round 2: 24H Offline Begins",
    subtitle: "OFFLINE SPRINT AT SUIET",
    description: "The 24-hour non-stop national offline coding battle begins on-campus with mentorship and meals.",
    tag: "24H BUILD",
    color: "amber",
    align: "bottom",
  },
  {
    id: "m7",
    phase: 3,
    time: "9:30 AM - 1:00 PM",
    date: "NOVEMBER 02",
    title: "Judging & Demos",
    subtitle: "PROJECT PRESENTATIONS",
    description: "Teams pitch working prototypes to industry judges, technical evaluation, and live Q&A.",
    tag: "EVALUATION",
    color: "amber",
    align: "top",
  },
  {
    id: "m8",
    phase: 3,
    time: "4:00 PM CEREMONY",
    date: "NOVEMBER 02",
    title: "Grand Results & Awards",
    subtitle: "WINNER FELICITATION",
    description: "Grand closing ceremony & winner felicitation. 1st Place: ₹20,000, 2nd Place: ₹10,000 with trophies and official medals.",
    fee: "1ST: ₹20,000 | 2ND: ₹10,000",
    tag: "VICTORY ARENA",
    color: "lime",
    align: "bottom",
  },
];

const colorTheme = {
  lime: {
    glow: "rgba(204, 255, 0, 0.4)",
    glowColor: "#ccff00",
    accentHex: "#ccff00",
    border: "border-[#ccff00]/40 hover:border-[#ccff00]",
    node: "bg-[#ccff00] border-lime-200 shadow-[0_0_18px_#ccff00]",
    badge: "bg-[#ccff00]/15 text-[#ccff00] border-[#ccff00]/40",
    text: "text-[#ccff00]",
    dateBg: "bg-[#ccff00]/20 text-[#ccff00] border-[#ccff00]/60 shadow-[0_0_20px_rgba(204,255,0,0.3)]",
    railGlow: "from-[#ccff00] via-[#84ff00] to-cyan-400",
  },
  cyan: {
    glow: "rgba(0, 240, 255, 0.4)",
    glowColor: "#00f0ff",
    accentHex: "#00f0ff",
    border: "border-cyan-400/40 hover:border-cyan-400",
    node: "bg-cyan-400 border-cyan-200 shadow-[0_0_18px_#00f0ff]",
    badge: "bg-cyan-500/15 text-cyan-300 border-cyan-400/40",
    text: "text-cyan-400",
    dateBg: "bg-cyan-500/20 text-cyan-200 border-cyan-400/60 shadow-[0_0_20px_rgba(0,240,255,0.3)]",
    railGlow: "from-cyan-500 via-teal-400 to-[#ccff00]",
  },
  amber: {
    glow: "rgba(245, 158, 11, 0.4)",
    glowColor: "#f59e0b",
    accentHex: "#fbbf24",
    border: "border-amber-400/40 hover:border-amber-400",
    node: "bg-amber-400 border-amber-200 shadow-[0_0_18px_#f59e0b]",
    badge: "bg-amber-500/15 text-amber-300 border-amber-400/40",
    text: "text-amber-400",
    dateBg: "bg-amber-500/20 text-amber-200 border-amber-400/60 shadow-[0_0_20px_rgba(245,158,11,0.3)]",
    railGlow: "from-amber-500 via-yellow-400 to-[#ccff00]",
  },
};

export default function TimelineSection() {
  const [viewMode, setViewMode] = useState<"2D" | "3D">("2D");

  const handleToggleMode = (mode: "2D" | "3D") => {
    soundFX.playClick();
    setViewMode(mode);
  };

  const phase1 = milestones.filter((m) => m.phase === 1);
  const phase2 = milestones.filter((m) => m.phase === 2);
  const phase3 = milestones.filter((m) => m.phase === 3);

  return (
    <section
      id="timeline"
      className="relative min-h-screen w-full bg-[#050507] text-white flex flex-col justify-between p-4 sm:p-8 lg:p-12 border-t border-white/10 overflow-hidden selection:bg-[#ccff00] selection:text-black"
    >
      {/* Background Ambience & Cyber Grid Mesh */}
      <div className="absolute inset-0 scanline-effect opacity-15 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-[#ccff00]/5 rounded-full blur-[180px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-[600px] h-[500px] bg-cyan-500/5 rounded-full blur-[180px] pointer-events-none" />

      {/* Top Telemetry Header Bar */}
      <div className="relative z-10 w-full mx-auto flex items-center justify-between border-b border-white/10 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ccff00] animate-pulse" />
          <span className="font-mono text-xs sm:text-sm font-bold tracking-widest text-[#ccff00] uppercase">
            // 04. HACKATHON TIMELINE & ROADMAP
          </span>
        </div>
      </div>

      {/* Main Title & 2D / 3D Toggle Pill */}
      <div className="relative z-10 w-full max-w-4xl mx-auto text-center space-y-4 pt-2 mb-8 select-none">
        <h2 className="font-[family-name:var(--font-orbitron)] font-black text-4xl sm:text-6xl md:text-7xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#ccff00] via-[#a3ff00] to-[#00f0ff] drop-shadow-[0_0_35px_rgba(204,255,0,0.5)]">
          Hack-a-thon Timeline
        </h2>

        {/* 2D / 3D Switcher Toggle Pill (Electric Lime Active Theme) */}
        <div className="inline-flex items-center p-1 rounded-full bg-[#0d0f14] border border-white/15 backdrop-blur-md relative shadow-[0_0_20px_rgba(0,0,0,0.8)]">
          <button
            type="button"
            onClick={() => handleToggleMode("2D")}
            onMouseEnter={() => soundFX.playHover()}
            className={`px-6 py-1.5 rounded-full text-xs font-mono font-bold transition-all duration-300 cursor-pointer ${viewMode === "2D"
                ? "bg-[#ccff00] text-black font-black shadow-[0_0_15px_rgba(204,255,0,0.6)]"
                : "text-zinc-400 hover:text-white"
              }`}
          >
            2D
          </button>
          <button
            type="button"
            onClick={() => handleToggleMode("3D")}
            onMouseEnter={() => soundFX.playHover()}
            className={`px-6 py-1.5 rounded-full text-xs font-mono font-bold transition-all duration-300 cursor-pointer ${viewMode === "3D"
                ? "bg-[#ccff00] text-black font-black shadow-[0_0_15px_rgba(204,255,0,0.6)]"
                : "text-zinc-500 hover:text-zinc-300"
              }`}
          >
            3D
          </button>
        </div>
      </div>

      {/* 3D MODE: Immersive 3D Highway Scroll Experience (Wide & Expansive) */}
      {viewMode === "3D" ? (
        <div className="relative z-10 w-full max-w-[1700px] mx-auto my-4">
          <Timeline3DCanvas />
        </div>
      ) : (
        <>
          {/* ========================================================================= */}
          {/* DESKTOP CURVED WINDING ROADMAP (2D MODE) - S-Curve Path matching screenshot */}
          {/* ========================================================================= */}
          <div className="relative z-10 w-full max-w-7xl mx-auto hidden lg:block my-6 space-y-16">

            {/* -------------------- TRACK 1: PHASE 1 (TOP RAIL - LEFT TO RIGHT) -------------------- */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
              className="relative"
            >
              {/* Phase 1 Badge & Rail */}
              <div className="relative flex items-center justify-between mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0d0f14] border border-[#ccff00]/40 text-[#ccff00] text-xs font-mono shadow-[0_0_15px_rgba(204,255,0,0.25)]">
                  <span className="w-2 h-2 rounded-full bg-[#ccff00] animate-pulse" />
                  <span className="font-bold">PHASE 01: REGISTRATION & SCREENING</span>
                </div>
                <span className="text-xs font-mono text-zinc-400">ROUND 1 (VIRTUAL • ₹100)</span>
              </div>

              {/* Horizontal Glowing Track Rail */}
              <div className="relative h-1.5 w-full bg-gradient-to-r from-[#ccff00] via-[#84ff00] to-cyan-400 rounded-full shadow-[0_0_15px_rgba(204,255,0,0.5)]">
                {/* Right-hand downward connector curve leading to Track 2 */}
                <div className="absolute right-0 top-1/2 w-28 h-36 border-r-[3px] border-b-[3px] border-cyan-400/80 rounded-br-[60px] pointer-events-none shadow-[4px_4px_15px_rgba(0,240,255,0.3)]" />
              </div>

              {/* Phase 1 Milestones Grid along Rail */}
              <div className="grid grid-cols-3 gap-8 pt-6 relative">
                {phase1.map((item) => {
                  const theme = colorTheme[item.color];
                  const isTop = item.align === "top";
                  return (
                    <div
                      key={item.id}
                      className={`relative flex flex-col items-center ${isTop ? "-translate-y-32 mb-4" : "translate-y-4"
                        }`}
                    >
                      {/* Node Connector Pin to Rail */}
                      <div
                        className={`absolute left-1/2 -translate-x-1/2 w-0.5 bg-[#ccff00]/50 ${isTop ? "top-full h-8" : "bottom-full h-8"
                          }`}
                      />

                      {/* Beacon Node Dot on Rail */}
                      <div
                        className={`absolute left-1/2 -translate-x-1/2 w-5 h-5 rounded-full border-2 bg-black z-20 ${isTop ? "top-[calc(100%+22px)]" : "bottom-[calc(100%+22px)]"
                          } ${theme.node} flex items-center justify-center`}
                      >
                        <span className="w-2 h-2 rounded-full bg-[#ccff00] animate-pulse" />
                      </div>

                      {/* Milestone Card */}
                      <div
                        onMouseEnter={() => soundFX.playHover()}
                        className={`w-full max-w-[290px] p-4 sm:p-5 rounded-2xl bg-[#090b10]/95 border ${theme.border} backdrop-blur-xl shadow-[0_12px_35px_rgba(0,0,0,0.85)] hover:-translate-y-1 transition-all duration-300 group select-none`}
                      >
                        {/* High-Impact Highlighted Date Header */}
                        <div className="flex items-center justify-between gap-2 pb-3 mb-2.5 border-b border-white/10">
                          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border font-[family-name:var(--font-orbitron)] font-black text-xs sm:text-sm tracking-wider ${theme.dateBg}`}>
                            <Calendar className="w-3.5 h-3.5 text-[#ccff00]" />
                            <span>{item.date}</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${theme.badge}`}>
                            {item.tag}
                          </span>
                        </div>

                        <h4 className="font-[family-name:var(--font-orbitron)] font-bold text-sm sm:text-base text-white group-hover:text-[#ccff00] transition-colors mt-1">
                          {item.title}
                        </h4>
                        <div className="text-[10px] font-mono text-zinc-400 font-semibold mb-1">{item.subtitle}</div>
                        <p className="font-mono text-[11px] text-zinc-400 leading-relaxed">{item.description}</p>

                        {item.fee && (
                          <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono">
                            <span className="text-zinc-500">ENTRY FEE:</span>
                            <span className="text-[#ccff00] font-bold">{item.fee}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* -------------------- TRACK 2: PHASE 2 (MIDDLE RAIL - RIGHT TO LEFT) -------------------- */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
              className="relative pt-12"
            >
              {/* Phase 2 Badge & Rail */}
              <div className="relative flex items-center justify-between mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0d0f14] border border-cyan-400/40 text-cyan-300 text-xs font-mono shadow-[0_0_15px_rgba(0,240,255,0.25)]">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="font-bold">PHASE 02: SHORTLISTING & ADVANCEMENT</span>
                </div>
                <span className="text-xs font-mono text-zinc-400">TOP 30 TEAMS ADVANCE • ₹500</span>
              </div>

              {/* Horizontal Glowing Track Rail (Cyan to Lime) */}
              <div className="relative h-1.5 w-full bg-gradient-to-l from-cyan-400 via-teal-400 to-[#ccff00] rounded-full shadow-[0_0_15px_rgba(0,240,255,0.5)]">
                {/* Left-hand downward connector curve leading to Track 3 */}
                <div className="absolute left-0 top-1/2 w-28 h-36 border-l-[3px] border-b-[3px] border-amber-400/80 rounded-bl-[60px] pointer-events-none shadow-[-4px_4px_15px_rgba(245,158,11,0.3)]" />
              </div>

              {/* Phase 2 Milestones Grid along Rail */}
              <div className="grid grid-cols-2 gap-12 pt-6 max-w-2xl mx-auto relative">
                {phase2.map((item) => {
                  const theme = colorTheme[item.color];
                  const isTop = item.align === "top";
                  return (
                    <div
                      key={item.id}
                      className={`relative flex flex-col items-center ${isTop ? "-translate-y-32 mb-4" : "translate-y-4"
                        }`}
                    >
                      {/* Connector Pin */}
                      <div
                        className={`absolute left-1/2 -translate-x-1/2 w-0.5 bg-cyan-400/50 ${isTop ? "top-full h-8" : "bottom-full h-8"
                          }`}
                      />

                      {/* Beacon Node Dot */}
                      <div
                        className={`absolute left-1/2 -translate-x-1/2 w-5 h-5 rounded-full border-2 bg-black z-20 ${isTop ? "top-[calc(100%+22px)]" : "bottom-[calc(100%+22px)]"
                          } ${theme.node} flex items-center justify-center`}
                      >
                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                      </div>

                      {/* Card */}
                      <div
                        onMouseEnter={() => soundFX.playHover()}
                        className={`w-full max-w-[290px] p-4 sm:p-5 rounded-2xl bg-[#090b10]/95 border ${theme.border} backdrop-blur-xl shadow-[0_12px_35px_rgba(0,0,0,0.85)] hover:-translate-y-1 transition-all duration-300 group select-none`}
                      >
                        {/* High-Impact Highlighted Date Header */}
                        <div className="flex items-center justify-between gap-2 pb-3 mb-2.5 border-b border-white/10">
                          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border font-[family-name:var(--font-orbitron)] font-black text-xs sm:text-sm tracking-wider ${theme.dateBg}`}>
                            <Calendar className="w-3.5 h-3.5 text-cyan-300" />
                            <span>{item.date}</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${theme.badge}`}>
                            {item.tag}
                          </span>
                        </div>

                        <h4 className="font-[family-name:var(--font-orbitron)] font-bold text-sm sm:text-base text-white group-hover:text-cyan-300 transition-colors mt-1">
                          {item.title}
                        </h4>
                        <div className="text-[10px] font-mono text-zinc-400 font-semibold mb-1">{item.subtitle}</div>
                        <p className="font-mono text-[11px] text-zinc-400 leading-relaxed">{item.description}</p>

                        {item.fee && (
                          <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono">
                            <span className="text-zinc-500">FINALIST FEE:</span>
                            <span className="text-[#ccff00] font-bold">{item.fee}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* -------------------- TRACK 3: PHASE 3 (BOTTOM RAIL - LEFT TO RIGHT) -------------------- */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
              className="relative pt-12"
            >
              {/* Phase 3 Badge & Rail */}
              <div className="relative flex items-center justify-between mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0d0f14] border border-amber-400/40 text-amber-300 text-xs font-mono shadow-[0_0_15px_rgba(245,158,11,0.25)]">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <span className="font-bold">PHASE 03: 24H OFFLINE GRAND FINALE</span>
                </div>
                <span className="text-xs font-mono text-zinc-400">SUIET MUKKA CAMPUS • 24H SPRINT</span>
              </div>

              {/* Horizontal Glowing Track Rail (Gold / Amber) */}
              <div className="relative h-1.5 w-full bg-gradient-to-r from-amber-400 via-yellow-400 to-[#ccff00] rounded-full shadow-[0_0_15px_rgba(245,158,11,0.5)]" />

              {/* Phase 3 Milestones Grid along Rail */}
              <div className="grid grid-cols-3 gap-8 pt-6 relative">
                {phase3.map((item) => {
                  const theme = colorTheme[item.color];
                  const isTop = item.align === "top";
                  return (
                    <div
                      key={item.id}
                      className={`relative flex flex-col items-center ${isTop ? "-translate-y-32 mb-4" : "translate-y-4"
                        }`}
                    >
                      {/* Connector Pin */}
                      <div
                        className={`absolute left-1/2 -translate-x-1/2 w-0.5 bg-amber-400/50 ${isTop ? "top-full h-8" : "bottom-full h-8"
                          }`}
                      />

                      {/* Beacon Node Dot */}
                      <div
                        className={`absolute left-1/2 -translate-x-1/2 w-5 h-5 rounded-full border-2 bg-black z-20 ${isTop ? "top-[calc(100%+22px)]" : "bottom-[calc(100%+22px)]"
                          } ${theme.node} flex items-center justify-center`}
                      >
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                      </div>

                      {/* Card */}
                      <div
                        onMouseEnter={() => soundFX.playHover()}
                        className={`w-full max-w-[290px] p-4 sm:p-5 rounded-2xl bg-[#090b10]/95 border ${theme.border} backdrop-blur-xl shadow-[0_12px_35px_rgba(0,0,0,0.85)] hover:-translate-y-1 transition-all duration-300 group select-none`}
                      >
                        {/* High-Impact Highlighted Date Header */}
                        <div className="flex items-center justify-between gap-2 pb-3 mb-2.5 border-b border-white/10">
                          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border font-[family-name:var(--font-orbitron)] font-black text-xs sm:text-sm tracking-wider ${theme.dateBg}`}>
                            <Calendar className="w-3.5 h-3.5 text-amber-300" />
                            <span>{item.date}</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${theme.badge}`}>
                            {item.tag}
                          </span>
                        </div>

                        <h4 className="font-[family-name:var(--font-orbitron)] font-bold text-sm sm:text-base text-white group-hover:text-amber-300 transition-colors mt-1">
                          {item.title}
                        </h4>
                        <div className="text-[10px] font-mono text-zinc-400 font-semibold mb-1">{item.subtitle}</div>
                        <p className="font-mono text-[11px] text-zinc-400 leading-relaxed">{item.description}</p>
                        <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center gap-1.5 text-[10px] font-mono text-amber-300">
                          <Clock className="w-3 h-3" />
                          <span>{item.time}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* ========================================================================= */}
          {/* MOBILE / TABLET RESPONSIVE TIMELINE (VERTICAL SPINE WITH GLOWING NODES) */}
          {/* ========================================================================= */}
          <div className="relative z-10 w-full max-w-2xl mx-auto block lg:hidden my-6 space-y-10 px-1 sm:px-3">
            {[
              { title: "PHASE 01: REGISTRATION & SCREENING", items: phase1, color: "lime" as const },
              { title: "PHASE 02: SHORTLIST & ADVANCEMENT", items: phase2, color: "cyan" as const },
              { title: "PHASE 03: 24H OFFLINE GRAND FINALE", items: phase3, color: "amber" as const },
            ].map((phaseGroup, gIdx) => {
              const groupTheme = colorTheme[phaseGroup.color];
              return (
                <div key={gIdx} className="space-y-5">
                  {/* Phase Section Divider Badge */}
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0d0f14]/95 border text-xs font-mono shadow-[0_0_15px_rgba(0,0,0,0.8)] backdrop-blur-md"
                    style={{ borderColor: groupTheme.border }}
                  >
                    <span
                      className="w-2 h-2 rounded-full animate-pulse"
                      style={{ backgroundColor: groupTheme.glowColor, boxShadow: `0 0 10px ${groupTheme.glowColor}` }}
                    />
                    <span className="font-bold text-white tracking-wider">{phaseGroup.title}</span>
                  </motion.div>

                  {/* Vertical Glowing Spine Rail */}
                  <div
                    className="relative pl-6 sm:pl-8 border-l-2 space-y-5"
                    style={{
                      borderColor: `${groupTheme.glowColor}50`,
                      boxShadow: `-1px 0 12px ${groupTheme.glowColor}25`,
                    }}
                  >
                    {phaseGroup.items.map((item, idx) => {
                      const theme = colorTheme[item.color];
                      return (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: 18 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true, margin: "-40px" }}
                          transition={{
                            duration: 0.65,
                            delay: (idx % 3) * 0.07,
                            ease: [0.16, 1, 0.3, 1],
                          }}
                          onMouseEnter={() => soundFX.playHover()}
                          className="relative p-4 sm:p-5 rounded-2xl bg-[#090b14]/95 border border-white/15 hover:border-white/30 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.85)] transition-colors duration-300 group"
                        >
                          {/* Glowing Node Dot on left rail */}
                          <div
                            className="absolute -left-[31px] sm:-left-[39px] top-6 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border-2 bg-[#050507] flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                            style={{
                              borderColor: theme.glowColor,
                              boxShadow: `0 0 14px ${theme.glowColor}`,
                            }}
                          >
                            <span
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: theme.glowColor }}
                            />
                          </div>

                          {/* Top Date Header & Tag */}
                          <div className="flex items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-white/10">
                            <div
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border font-[family-name:var(--font-orbitron)] font-black text-xs sm:text-sm tracking-wider ${theme.dateBg}`}
                            >
                              <Calendar className="w-3.5 h-3.5" style={{ color: theme.accentHex }} />
                              <span>{item.date}</span>
                            </div>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${theme.badge}`}>
                              {item.tag}
                            </span>
                          </div>

                          {/* Milestone Title & Subtitle */}
                          <h4 className="font-[family-name:var(--font-orbitron)] font-bold text-base sm:text-lg text-white group-hover:text-[#ccff00] transition-colors mt-1">
                            {item.title}
                          </h4>
                          <div className="text-[11px] font-mono text-zinc-400 font-semibold mb-1">
                            {item.subtitle}
                          </div>

                          {/* Description */}
                          <p className="font-mono text-xs text-zinc-300 leading-relaxed">
                            {item.description}
                          </p>

                          {/* Footer Meta Details */}
                          <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-xs font-mono">
                            <div className="flex items-center gap-1.5 text-zinc-400">
                              <Clock className="w-3.5 h-3.5 text-[#ccff00]" />
                              <span>{item.time}</span>
                            </div>
                            {item.fee && (
                              <span className="text-[#ccff00] font-bold px-2 py-0.5 rounded bg-[#ccff00]/10 border border-[#ccff00]/30 text-[11px]">
                                {item.fee}
                              </span>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Bottom Summary Bar */}
      <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-black/60 border border-white/10 text-xs font-mono text-zinc-400 mt-6">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-[#ccff00]" />
          <span>2-ROUND STRUCTURE: <span className="text-white font-bold">ONLINE SCREENING + 24H OFFLINE FINALE</span></span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-cyan-400" />
          <span>VENUE: <span className="text-[#ccff00]">Srinivas University (SUIET), Mukka</span></span>
        </div>
      </div>
    </section>
  );
}
