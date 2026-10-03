"use client";

import { useEffect, useState } from "react";
import { soundFX } from "@/lib/audio";
import { Zap } from "lucide-react";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function EventCountdown() {
  // Set target date for CodeMeet 2026 (October 31, 2026 00:00:00 IST)
  const targetDate = new Date("2026-10-31T00:00:00+05:30").getTime();

  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [mounted, setMounted] = useState(false);
  const [isTick, setIsTick] = useState(false);

  useEffect(() => {
    setMounted(true);
    const calculateTime = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor(
          (difference % (1000 * 60 * 60)) / (1000 * 60)
        );
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
        setIsTick((prev) => !prev);
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  if (!mounted) {
    return (
      <div className="w-full max-w-xl mx-auto h-24 rounded-2xl bg-black/40 border border-white/10 animate-pulse backdrop-blur-md" />
    );
  }

  const timeUnits = [
    { label: "DAYS", value: timeLeft.days, tag: "DD" },
    { label: "HOURS", value: timeLeft.hours, tag: "HH" },
    { label: "MINUTES", value: timeLeft.minutes, tag: "MM" },
    { label: "SECONDS", value: timeLeft.seconds, tag: "SS" },
  ];

  return (
    <div className="relative w-full max-w-2xl mx-auto flex flex-col items-center gap-3 select-none pointer-events-auto">
      {/* Cyber Telemetry Header Label */}
      <div className="flex items-center gap-2 px-4 py-1 rounded-full bg-black/70 border border-[#ccff00]/30 shadow-[0_0_15px_rgba(204,255,0,0.15)] backdrop-blur-md">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ccff00] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ccff00]"></span>
        </span>
        <span className="font-mono text-[10px] sm:text-xs font-bold tracking-widest text-[#ccff00] uppercase">
          EVENT LAUNCH COUNTDOWN
        </span>
      </div>

      {/* Countdown Digits Grid */}
      <div className="grid grid-cols-4 gap-2 sm:gap-4 w-full px-2">
        {timeUnits.map((unit, index) => {
          const formattedValue = String(unit.value).padStart(2, "0");
          return (
            <div
              key={unit.label}
              onMouseEnter={() => soundFX.playHover()}
              className="relative group flex flex-col items-center justify-center py-2.5 sm:py-3.5 px-2 rounded-xl bg-black/75 border border-white/10 hover:border-[#ccff00]/60 transition-all duration-300 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.85)] hover:shadow-[0_0_25px_rgba(204,255,0,0.25)] hover:-translate-y-0.5"
            >
              {/* Subtle glowing corner accents */}
              <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-[#ccff00]/40 group-hover:border-[#ccff00] rounded-tl-sm transition-colors" />
              <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-[#ccff00]/40 group-hover:border-[#ccff00] rounded-tr-sm transition-colors" />
              <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-[#ccff00]/40 group-hover:border-[#ccff00] rounded-bl-sm transition-colors" />
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-[#ccff00]/40 group-hover:border-[#ccff00] rounded-br-sm transition-colors" />

              {/* Unit Tag badge */}
              <span className="absolute top-1.5 right-2 font-mono text-[9px] text-zinc-500 group-hover:text-cyan-400 transition-colors">
                {unit.tag}
              </span>

              {/* Number Digit with Neon Glow */}
              <div className="font-[family-name:var(--font-orbitron)] font-black text-2xl sm:text-4xl md:text-5xl tracking-tight text-white group-hover:text-[#ccff00] transition-colors leading-none my-1 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] group-hover:drop-shadow-[0_0_20px_rgba(204,255,0,0.6)]">
                {formattedValue}
              </div>

              {/* Unit Label */}
              <span className="font-mono text-[9px] sm:text-[11px] tracking-wider text-zinc-400 group-hover:text-white uppercase transition-colors">
                {unit.label}
              </span>

              {/* Bottom Cyber Pulse Bar */}
              <div className="w-6 h-0.5 bg-zinc-800 group-hover:bg-[#ccff00] mt-1.5 rounded-full transition-colors group-hover:shadow-[0_0_8px_#ccff00]" />
            </div>
          );
        })}
      </div>

      {/* Cyber Status Sub-banner */}
      <div className="flex items-center justify-center gap-2 font-mono text-[10px] text-zinc-400">
        <Zap className="w-3 h-3 text-[#ccff00]" />
        <span>STARTS: <strong className="text-zinc-200">OCTOBER 31, 2026</strong></span>
        <span className="text-zinc-700">•</span>
        <span className="text-cyan-400">VENUE: SUIET CAMPUS</span>
      </div>
    </div>
  );
}
