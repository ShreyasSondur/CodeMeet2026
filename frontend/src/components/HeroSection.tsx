"use client";

import HeroQuantumCanvas from "./HeroQuantumCanvas";
import SecondSection from "./SecondSection";
import TimelineSection from "./TimelineSection";
import RegistrationSection from "./RegistrationSection";
import EventCountdown from "./EventCountdown";
import AudioController from "./AudioController";
import IbmLogo from "./IbmLogo";
import { soundFX } from "@/lib/audio";
import { Terminal, ChevronDown, ArrowRight, Sparkles } from "lucide-react";

import { motion } from "framer-motion";
import ProblemStatementsSection from "./ProblemStatementsSection";
import FAQSection from "./FAQSection";

interface HeroSectionProps {
  isLoaded?: boolean;
}

export default function HeroSection({ isLoaded = true }: HeroSectionProps) {
  const handleRegisterClick = () => {
    soundFX.playClick();
    const registrationSection = document.getElementById("registration");
    if (registrationSection) {
      registrationSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const scrollDown = () => {
    soundFX.playClick();
    const secondSection = document.getElementById("about");
    if (secondSection) {
      secondSection.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollTo({
        top: window.innerHeight,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="relative w-full bg-[#050507] text-white flex flex-col overflow-x-hidden selection:bg-[#ccff00] selection:text-black">

      {/* 1. Primary Hero Section (Quantum Core Scene) */}
      <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden py-12">
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute inset-0 bg-radial from-transparent via-[#050507]/30 to-[#050507] pointer-events-none z-10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#ccff00]/6 rounded-full blur-[220px] pointer-events-none z-0" />

        {/* Top Minimal Bar */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={isLoaded ? { opacity: 1, y: 0 } : { opacity: 0, y: -15 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="absolute top-6 left-0 right-0 z-30 w-full px-6 sm:px-12 flex items-center justify-between pointer-events-none"
        >
          <div className="flex items-center gap-2 font-mono text-xs text-zinc-400 pointer-events-auto">
            <span className="w-2 h-2 rounded-full bg-[#ccff00] animate-pulse" />
            <span className="text-zinc-300 font-semibold tracking-wider">CODEMEET 2026</span>
          </div>

          <div className="pointer-events-auto">
            <AudioController />
          </div>
        </motion.div>

        {/* Clean 3D Quantum Canvas */}
        <div className="absolute inset-0 pointer-events-auto">
          <HeroQuantumCanvas />
        </div>

        {/* Hero Centerpiece */}
        <main className="relative z-20 w-full max-w-4xl mx-auto px-4 flex flex-col items-center justify-center text-center space-y-6 pointer-events-none select-none py-6">
          
          {/* Top Hackathon Tag Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={isLoaded ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            onMouseEnter={() => soundFX.playHover()}
            className="pointer-events-auto inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/60 border border-[#ccff00]/40 text-[#ccff00] text-xs font-mono backdrop-blur-md shadow-[0_0_15px_rgba(204,255,0,0.15)]"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span className="font-bold tracking-widest">&lt;/&gt; #24hrs_Hackathon</span>
          </motion.div>

          {/* CODE MEET 2026 Minimalist Master Typography */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={isLoaded ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="relative flex flex-col items-center pointer-events-none"
          >
            <h1 className="font-[family-name:var(--font-orbitron)] font-black text-6xl sm:text-7xl md:text-8xl lg:text-9xl tracking-tight leading-[0.9] text-white drop-shadow-[0_15px_35px_rgba(0,0,0,0.9)]">
              CODE
            </h1>

            <div className="font-[family-name:var(--font-orbitron)] font-black text-6xl sm:text-7xl md:text-8xl lg:text-9xl tracking-tight leading-[0.9] text-[#ccff00] drop-shadow-[0_0_40px_rgba(204,255,0,0.6)] glow-text-lime">
              MEET
            </div>

            <div className="font-[family-name:var(--font-orbitron)] font-black text-5xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight leading-[0.9] text-stroke-cyber text-transparent drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">
              2026
            </div>
          </motion.div>

          {/* Live Event Countdown */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={isLoaded ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="w-full pt-1"
          >
            <EventCountdown />
          </motion.div>

          {/* CTA & Register Button Section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={isLoaded ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="pointer-events-auto flex flex-col items-center pt-2"
          >
            <button
              onClick={handleRegisterClick}
              onMouseEnter={() => soundFX.playHover()}
              className="relative group px-8 py-3.5 sm:px-10 sm:py-4 rounded-xl bg-[#ccff00] hover:bg-[#d9ff33] active:scale-95 text-black font-[family-name:var(--font-orbitron)] font-bold text-sm sm:text-base tracking-wider uppercase transition-all duration-300 flex items-center gap-3 cursor-pointer overflow-hidden shadow-[0_0_25px_rgba(204,255,0,0.4)]"
            >
              <span>REGISTER NOW</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-black group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>

          {/* Big Clean Sponsor Spotlight: POWERED BY IBM (Right After Register Now) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={isLoaded ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.6, delay: 0.58 }}
            className="pointer-events-auto flex flex-col items-center justify-center gap-2 pt-2 select-none"
          >
            <div className="flex items-center gap-2 font-mono text-xs sm:text-sm tracking-[0.25em] text-zinc-400 font-bold uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ccff00] animate-pulse" />
              <span>POWERED BY</span>
            </div>
            
            <div className="hover:scale-105 transition-transform duration-300 cursor-pointer">
              <img
                src="/images/ibm-logo-clean.png"
                alt="IBM"
                className="h-10 sm:h-12 md:h-14 w-auto object-contain drop-shadow-[0_0_25px_rgba(255,255,255,0.4)]"
              />
            </div>
          </motion.div>

          {/* Scroll Prompt Indicator */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={isLoaded ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.5, delay: 0.65 }}
            onClick={scrollDown}
            onMouseEnter={() => soundFX.playHover()}
            className="pointer-events-auto flex flex-col items-center gap-1 text-zinc-500 hover:text-[#ccff00] transition-colors cursor-pointer group pt-3"
          >
            <span className="text-[10px] font-mono tracking-widest uppercase text-zinc-500 group-hover:text-[#ccff00] transition-colors">
              SCROLL
            </span>
            <ChevronDown className="w-4 h-4 text-zinc-500 group-hover:text-[#ccff00]" />
          </motion.button>
        </main>
      </div>

      {/* 2. Section 02 (About & Mission) */}
      <SecondSection />

      {/* 3. Section 03 (Event Registration & Tracks) */}
      <RegistrationSection />

      {/* 4. Section 04 (Hackathon Timeline & Roadmap) */}
      <TimelineSection />

      {/* 5. Section 05 (Hackathon Problem Statements) */}
      <ProblemStatementsSection />

      {/* 6. Section 06 (FAQ & Knowledge Base + Master Footer) */}
      <FAQSection />
    </div>
  );
}



