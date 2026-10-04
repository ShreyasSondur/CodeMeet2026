"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";
import {
  Rocket,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Sparkles,
  RotateCcw,
  Terminal,
  ShieldCheck,
  Zap,
  Globe,
  Award,
  Radio,
  ArrowRight,
} from "lucide-react";
import { soundFX } from "@/lib/audio";
import LaunchQuantumCanvas, { LaunchPhase } from "@/components/LaunchQuantumCanvas";
import HeroSection from "@/components/HeroSection";

interface IntroSlide {
  tag: string;
  title: string;
  subtitle?: string;
  highlight?: boolean;
}

const INITIAL_SLIDE: IntroSlide = {
  tag: "// CEREMONY INITIALIZATION",
  title: "INITIALIZING CEREMONY PROTOCOL...",
  subtitle: "AUTHENTICATING STAGE CONTROL & SECURE NETWORK",
};

export default function LaunchPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<LaunchPhase>("idle");
  const [countdown, setCountdown] = useState<number>(5);
  const [activeMessage, setActiveMessage] = useState<string>("");
  const [introSlide, setIntroSlide] = useState<IntroSlide>(INITIAL_SLIDE);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [showWebsite, setShowWebsite] = useState(false);
  const [isWarpingFlash, setIsWarpingFlash] = useState(false);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  const addTimeout = (fn: () => void, delay: number) => {
    const timer = setTimeout(fn, delay);
    timeoutsRef.current.push(timer);
    return timer;
  };

  const clearAllTimeouts = () => {
    timeoutsRef.current.forEach((t) => clearTimeout(t));
    timeoutsRef.current = [];
  };

  // Clean up any pending timeouts on unmount
  useEffect(() => {
    return () => {
      clearAllTimeouts();
    };
  }, []);

  // Subscribe to audio state
  useEffect(() => {
    const unsub = soundFX.subscribe((playing) => {
      setAudioEnabled(playing);
    });
    return () => unsub();
  }, []);

  // Handle Fullscreen toggle for stage projector
  const toggleFullscreen = () => {
    soundFX.playClick();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => { });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => { });
      }
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Multi-stage confetti celebration
  const fireLaunchConfetti = useCallback(() => {
    const duration = 4.5 * 1000;
    const animationEnd = Date.now() + duration;
    const colors = ["#ccff00", "#00f0ff", "#ffffff", "#eab308", "#a855f7"];

    // Initial blast
    confetti({
      particleCount: 120,
      spread: 100,
      origin: { y: 0.6 },
      colors: colors,
      startVelocity: 45,
    });

    const interval: NodeJS.Timeout = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) {
        return clearInterval(interval);
      }
      const particleCount = 40 * (timeLeft / duration);

      // Fire from both bottom corners
      confetti({
        particleCount,
        angle: 60,
        spread: 70,
        origin: { x: 0, y: 0.75 },
        colors: colors,
      });
      confetti({
        particleCount,
        angle: 120,
        spread: 70,
        origin: { x: 1, y: 0.75 },
        colors: colors,
      });
    }, 250);
  }, []);

  // Main Launch Execution Sequence
  const startLaunchSequence = () => {
    clearAllTimeouts();
    soundFX.playClick();
    soundFX.startBGM();
    soundFX.playLaunchRiser();

    // Slide 1: Initializing Ceremony Protocol
    setPhase("intro");
    setIntroSlide({
      tag: "// CEREMONY INITIALIZATION",
      title: "INITIALIZING CEREMONY PROTOCOL...",
      subtitle: "AUTHENTICATING STAGE CONTROL & SECURE CAMPUS NETWORK",
    });

    // Slide 2: Srinivas Institute of Engineering and Technology
    addTimeout(() => {
      setIntroSlide({
        tag: "// HOST INSTITUTION",
        title: "SRINIVAS INSTITUTE OF ENGINEERING & TECHNOLOGY",
        subtitle: "Srinivas University Mukka • Department of Computer Science & Engineering",
      });
    }, 1500);

    // Slide 3: In Collaboration With
    addTimeout(() => {
      setIntroSlide({
        tag: "// IN PARTNERSHIP",
        title: "IN COLLABORATION WITH",
        subtitle: "Leading Developer & Innovation Ecosystem",
      });
    }, 2900);

    // Slide 4: Webflow Community
    addTimeout(() => {
      setIntroSlide({
        tag: "// GLOBAL COMMUNITY",
        title: "WEBFLOW COMMUNITY",
        subtitle: "Empowering Next-Gen Creators & Engineers Worldwide",
      });
    }, 4200);

    // Slide 5: PRESENTS
    addTimeout(() => {
      setIntroSlide({
        tag: "// INAUGURATION CEREMONY",
        title: "PRESENTS",
        subtitle: "CODEMEET 2026 • NATIONAL LEVEL 24-HOUR HACKATHON",
        highlight: true,
      });
    }, 5500);

    // Slide 6: Countdown starts with "THE OFFICIAL WEBSITE LAUNCHES IN"
    addTimeout(() => {
      setActiveMessage("THE OFFICIAL WEBSITE LAUNCHES IN");
      setPhase("countdown");
      setCountdown(5);
      soundFX.playLaunchCountdown(5);
    }, 6900);

    // Countdown sequence (5, 4, 3, 2, 1) - paced at 1.3s per step
    addTimeout(() => {
      setCountdown(4);
      soundFX.playLaunchCountdown(4);
    }, 8200);

    addTimeout(() => {
      setCountdown(3);
      soundFX.playLaunchCountdown(3);
    }, 9500);

    addTimeout(() => {
      setCountdown(2);
      soundFX.playLaunchCountdown(2);
    }, 10800);

    addTimeout(() => {
      setCountdown(1);
      soundFX.playLaunchCountdown(1);
    }, 12100);

    // Ignition Moment (0 / NOW LIVE!)
    addTimeout(() => {
      setCountdown(0);
      setPhase("ignite");
      setIsWarpingFlash(true);
      soundFX.playBassDrop();
      soundFX.playLaunchFanfare();
      fireLaunchConfetti();

      // Flash fade out
      addTimeout(() => {
        setIsWarpingFlash(false);
      }, 700);

      // Transition into live synchronized Hero / Website
      addTimeout(() => {
        setPhase("live");
        setShowWebsite(true);

        // Auto re-navigate to the home page after 5 seconds delay
        addTimeout(() => {
          router.push("/");
        }, 5000);
      }, 2800);
    }, 13400);
  };

  // Reset sequence (for presenters to re-launch if needed)
  const resetLaunch = () => {
    clearAllTimeouts();
    soundFX.playClick();
    setPhase("idle");
    setCountdown(5);
    setActiveMessage("");
    setIntroSlide(INITIAL_SLIDE);
    setShowWebsite(false);
    setIsWarpingFlash(false);
  };

  return (
    <main className="relative min-h-screen w-full bg-[#050507] text-white overflow-x-hidden selection:bg-[#ccff00] selection:text-black">
      {/* 1. Persistent 3D Quantum Launch Canvas (Background & Foreground Integration) */}
      {!showWebsite && (
        <div className="fixed inset-0 z-0">
          <LaunchQuantumCanvas phase={phase} countdownNumber={countdown} />
        </div>
      )}

      {/* 2. Top Stage Control HUD */}
      <header className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-8 py-4 flex items-center justify-between pointer-events-none bg-gradient-to-b from-[#050507]/90 via-[#050507]/40 to-transparent backdrop-blur-[2px]">
        {/* Left: Branding & Status */}
        <div className="flex items-center gap-3 font-mono pointer-events-auto">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 border border-[#ccff00]/30 backdrop-blur-md">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ccff00] animate-ping" />
            <span className="text-xs sm:text-sm font-bold text-white tracking-widest">
              CODEMEET 2026
            </span>
          </div>

          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 border border-white/10 text-xs text-zinc-400">
            <Radio className="w-3.5 h-3.5 text-[#00f0ff] animate-pulse" />
            <span>INAUGURATION STAGE MODE</span>
          </div>
        </div>

        {/* Right: Stage Controls (Audio, Fullscreen, Reset) */}
        <div className="flex items-center gap-2.5 pointer-events-auto">
          {showWebsite && (
            <button
              onClick={resetLaunch}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/70 border border-white/20 hover:border-[#ccff00]/60 text-xs font-mono text-zinc-300 hover:text-[#ccff00] transition-all cursor-pointer shadow-[0_0_15px_rgba(0,0,0,0.5)]"
              title="Replay Official Launch Sequence"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">REPLAY LAUNCH</span>
            </button>
          )}

          <button
            onClick={() => {
              soundFX.playClick();
              soundFX.toggleBGM();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border backdrop-blur-md text-xs font-mono transition-all cursor-pointer ${
              audioEnabled
                ? "bg-[#ccff00]/15 border-[#ccff00] text-[#ccff00] shadow-[0_0_15px_rgba(204,255,0,0.3)]"
                : "bg-black/60 border-white/15 text-zinc-400 hover:text-white"
            }`}
            title="Toggle Stage Audio"
          >
            {audioEnabled ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-[#ccff00]" />
                <span className="hidden sm:inline">AUDIO ON</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">AUDIO OFF</span>
              </>
            )}
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2 sm:px-3 sm:py-1.5 rounded-full bg-black/60 border border-white/15 hover:border-[#ccff00]/50 text-zinc-300 hover:text-[#ccff00] backdrop-blur-md transition-all cursor-pointer flex items-center gap-1.5 text-xs font-mono"
            title="Toggle Fullscreen for Projector"
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-3.5 h-3.5 text-[#ccff00]" />
                <span className="hidden sm:inline">EXIT FULLSCREEN</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">FULLSCREEN</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* 3. Stage Launching Overlay UI */}
      <AnimatePresence>
        {!showWebsite && (
          <div className="relative z-20 min-h-screen w-full flex flex-col items-center justify-between p-6 sm:p-12 overflow-hidden pointer-events-none">
            {/* Top Spacer for Header */}
            <div className="h-16 w-full" />

            {/* Center Stage Arena */}
            <div className="relative w-full max-w-4xl mx-auto flex flex-col items-center justify-center text-center my-auto">
              {/* IDLE STATE: Launch Cockpit & Big Button */}
              {phase === "idle" && (
                <motion.div
                  key="idle-state"
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -20 }}
                  transition={{ duration: 0.6 }}
                  className="flex flex-col items-center space-y-8 pointer-events-auto"
                >
                  {/* Top University & Partner Badges */}
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <div className="px-4 py-1.5 rounded-full bg-black/60 border border-white/15 backdrop-blur-md flex items-center gap-2 text-xs font-mono text-zinc-300">
                      <ShieldCheck className="w-4 h-4 text-[#ccff00]" />
                      <span>SRINIVAS UNIVERSITY (SUIET MUKKA)</span>
                    </div>

                    <div className="px-4 py-1.5 rounded-full bg-black/60 border border-[#00f0ff]/30 backdrop-blur-md flex items-center gap-2 text-xs font-mono text-[#00f0ff]">
                      <Zap className="w-4 h-4 text-[#00f0ff]" />
                      <span>POWERED BY IBM</span>
                    </div>
                  </div>

                  {/* Main Event Titles */}
                  <div className="space-y-3">
                    <div className="text-xs sm:text-sm font-mono tracking-[0.35em] text-[#ccff00] uppercase font-semibold">
                      // OFFICIAL INAUGURATION CEREMONY
                    </div>

                    <h1 className="font-[family-name:var(--font-orbitron)] font-black text-5xl sm:text-7xl md:text-8xl tracking-tight text-white drop-shadow-[0_15px_30px_rgba(0,0,0,0.9)]">
                      CODE<span className="text-[#ccff00] glow-text-lime">MEET</span>
                      <span className="block text-4xl sm:text-6xl md:text-7xl text-stroke-cyber mt-1">
                        2026
                      </span>
                    </h1>

                    <p className="text-zinc-300 font-mono text-xs sm:text-base max-w-xl mx-auto pt-2">
                      National Level 24-Hour Hackathon • Srinivas University Institute of Engineering & Technology
                    </p>
                  </div>

                  {/* Big Cyber Launch Button */}
                  <div className="pt-4 relative group">
                    {/* Glowing background ring pulse */}
                    <div className="absolute -inset-2 bg-gradient-to-r from-[#ccff00] via-[#00f0ff] to-[#ccff00] rounded-2xl blur-xl opacity-75 group-hover:opacity-100 animate-pulse transition duration-500" />

                    <button
                      onClick={startLaunchSequence}
                      onMouseEnter={() => soundFX.playHover()}
                      className="relative px-8 py-5 sm:px-14 sm:py-6 rounded-2xl bg-[#050507] border-2 border-[#ccff00] text-white font-[family-name:var(--font-orbitron)] font-black text-lg sm:text-2xl tracking-widest uppercase transition-all duration-300 transform group-hover:scale-105 active:scale-95 flex items-center gap-4 cursor-pointer shadow-[0_0_35px_rgba(204,255,0,0.6)]"
                    >
                      <Rocket className="w-6 h-6 sm:w-8 sm:h-8 text-[#ccff00] group-hover:rotate-12 transition-transform duration-300 animate-bounce" />
                      <span className="bg-gradient-to-r from-white via-[#ccff00] to-white bg-clip-text text-transparent">
                        LAUNCH OFFICIAL PORTAL
                      </span>
                      <Sparkles className="w-5 h-5 text-[#00f0ff] animate-spin" />
                    </button>
                  </div>

                  {/* System Status readout */}
                  <div className="flex items-center gap-4 text-[11px] font-mono text-zinc-500 pt-2">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#ccff00] animate-ping" />
                      CEREMONY STATUS: READY
                    </span>
                    <span>•</span>
                    <span>VENUE: AUDITORIUM STAGE</span>
                    <span>•</span>
                    <span className="text-[#00f0ff]">ONLINE</span>
                  </div>
                </motion.div>
              )}

              {/* INTRO PHASE: Dramatic Teaser Messages */}
              {phase === "intro" && (
                <motion.div
                  key="intro-state"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
                  transition={{ duration: 0.5 }}
                  className="space-y-6 flex flex-col items-center max-w-4xl mx-auto"
                >
                  <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-black/80 border border-[#00f0ff]/50 text-[#00f0ff] text-xs font-mono animate-pulse shadow-[0_0_20px_rgba(0,240,255,0.25)] backdrop-blur-md">
                    <Terminal className="w-3.5 h-3.5" />
                    <span>{introSlide.tag}</span>
                  </div>

                  <div className="min-h-[160px] flex flex-col items-center justify-center text-center">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={introSlide.title}
                        initial={{ opacity: 0, y: 18, filter: "blur(6px)", scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)", scale: 1 }}
                        exit={{ opacity: 0, y: -18, filter: "blur(6px)", scale: 1.04 }}
                        transition={{ duration: 0.35, ease: "easeOut" }}
                        className="space-y-3"
                      >
                        <h2 className="font-[family-name:var(--font-orbitron)] font-black text-2xl sm:text-4xl md:text-5xl text-white tracking-wide leading-tight drop-shadow-[0_0_40px_rgba(204,255,0,0.5)] max-w-4xl px-4">
                          {introSlide.highlight ? (
                            <span className="text-[#ccff00] glow-text-lime tracking-[0.25em] uppercase text-4xl sm:text-6xl md:text-7xl block">
                              PRESENTS
                            </span>
                          ) : (
                            introSlide.title
                          )}
                        </h2>

                        {introSlide.subtitle && (
                          <p className="text-zinc-400 font-mono text-xs sm:text-sm tracking-widest uppercase">
                            {introSlide.subtitle}
                          </p>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  <div className="w-72 h-1.5 bg-zinc-800/80 rounded-full overflow-hidden border border-white/10">
                    <motion.div
                      className="h-full bg-gradient-to-r from-[#ccff00] via-[#00f0ff] to-[#ccff00]"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 6.8, ease: "easeInOut" }}
                    />
                  </div>
                </motion.div>
              )}

              {/* COUNTDOWN PHASE: 5, 4, 3, 2, 1 */}
              {phase === "countdown" && (
                <motion.div
                  key={`countdown-state-${countdown}`}
                  initial={{ opacity: 0, scale: 1.4, filter: "blur(8px)" }}
                  animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, scale: 0.6, filter: "blur(6px)" }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className="flex flex-col items-center space-y-6"
                >
                  {/* Highlighted Launch Announcement Banner */}
                  <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-black/80 border-2 border-[#00f0ff] text-[#00f0ff] font-mono font-bold text-xs sm:text-base md:text-lg tracking-[0.25em] uppercase shadow-[0_0_30px_rgba(0,240,255,0.5)] backdrop-blur-md animate-pulse">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#00f0ff] animate-ping" />
                    <span>{activeMessage}</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#00f0ff] animate-ping" />
                  </div>

                  {/* Giant Glowing 3D Countdown Number */}
                  <div className="relative flex items-center justify-center my-2">
                    <div className="font-[family-name:var(--font-orbitron)] font-black text-8xl sm:text-9xl md:text-[14rem] leading-none text-[#ccff00] drop-shadow-[0_0_90px_rgba(204,255,0,0.9)] glow-text-lime select-none">
                      {countdown}
                    </div>

                    {/* Shockwave Rings */}
                    <div className="absolute inset-0 -m-8 rounded-full border-2 border-[#ccff00]/40 animate-ping pointer-events-none" />
                  </div>

                  {/* Dynamic Sub-Status per number (No prize pool) */}
                  <div className="px-6 py-2.5 rounded-full bg-black/90 border border-white/20 backdrop-blur-md text-xs sm:text-sm md:text-base font-mono text-zinc-200 shadow-[0_0_20px_rgba(0,0,0,0.8)]">
                    {countdown === 5 && "✦ SYNCHRONIZING SUIET CAMPUS NETWORK ✦"}
                    {countdown === 4 && "✦ POWERED BY IBM CLOUD & WATSONX ✦"}
                    {countdown === 3 && "✦ 24-HOUR NATIONAL ARENA INITIALIZED ✦"}
                    {countdown === 2 && "✦ INNOVATION TRACKS ACTIVATED ✦"}
                    {countdown === 1 && "✦ MAXIMUM POWER • READY FOR LAUNCH ✦"}
                  </div>
                </motion.div>
              )}

              {/* IGNITE PHASE: Launch Moment */}
              {phase === "ignite" && (
                <motion.div
                  key="ignite-state"
                  initial={{ opacity: 0, scale: 0.5, y: 30 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-6 flex flex-col items-center"
                >
                  <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-[#ccff00] text-black font-mono font-bold text-xs sm:text-sm tracking-widest uppercase shadow-[0_0_30px_rgba(204,255,0,0.8)]">
                    <Sparkles className="w-4 h-4" />
                    <span>PORTAL DEPLOYED SUCCESSFULLY</span>
                  </div>

                  <h1 className="font-[family-name:var(--font-orbitron)] font-black text-5xl sm:text-7xl md:text-8xl text-white tracking-tight drop-shadow-[0_0_60px_rgba(204,255,0,0.9)]">
                    WEBSITE IS <span className="text-[#ccff00] glow-text-lime">NOW LIVE!</span>
                  </h1>

                  <p className="text-sm sm:text-xl font-mono text-zinc-300 max-w-xl">
                    WELCOME TO CODEMEET 2026 • SRINIVAS UNIVERSITY
                  </p>
                </motion.div>
              )}
            </div>

            {/* Bottom University & Tech Footer */}
            <footer className="w-full max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-zinc-500 pt-6 border-t border-white/10 pointer-events-auto">
              <div className="flex items-center gap-2 text-zinc-400">
                <Globe className="w-4 h-4 text-[#ccff00]" />
                <span>SRINIVAS UNIVERSITY INSTITUTE OF ENGINEERING & TECHNOLOGY (SUIET)</span>
              </div>
              <div className="flex items-center gap-4">
                <span>IN COLLABORATION WITH WEBFLOW COMMUNITY</span>
                <span>•</span>
                <span className="text-[#ccff00]">2026 EDITION</span>
              </div>
            </footer>
          </div>
        )}
      </AnimatePresence>

      {/* 4. Warp Flash Effect during Ignition */}
      <AnimatePresence>
        {isWarpingFlash && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.85 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-40 bg-white pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* 5. Synchronized Live Website (Hero Section + Full Experience) */}
      {showWebsite && (
        <motion.div
          key="live-website"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-30 w-full"
        >
          {/* Top Stage Launch Success Banner */}
          <div className="w-full bg-gradient-to-r from-[#ccff00] via-[#00f0ff] to-[#ccff00] text-black py-2 px-4 text-center font-mono font-bold text-xs sm:text-sm tracking-wider flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(204,255,0,0.5)]">
            <Sparkles className="w-4 h-4" />
            <span>✦ CODEMEET 2026 OFFICIAL WEBSITE IS NOW LIVE • REGISTRATIONS ARE OPEN ✦</span>
            <Sparkles className="w-4 h-4" />
          </div>

          {/* Master Live Hero & All Sections */}
          <HeroSection isLoaded={true} />
        </motion.div>
      )}
    </main>
  );
}
