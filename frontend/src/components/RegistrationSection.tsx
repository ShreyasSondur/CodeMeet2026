"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { soundFX } from "@/lib/audio";
import {
  Terminal,
  Zap,
  Keyboard,
  Compass,
  Gamepad2,
  Users,
  Calendar,
  Trophy,
  ArrowRight,
  Shield,
  ArrowUp,
  MapPin,
  Clock,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

interface EventCard {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  tagColor: "lime" | "amber" | "cyan" | "pink";
  date: string;
  teamSize: string;
  entryFee: string;
  feeSubtext?: string;
  description: string;
  icon: typeof Zap;
  registerUrl: string;
}

const eventCards: EventCard[] = [
  {
    id: "hackathon",
    title: "24H National Hackathon",
    subtitle: "FLAGSHIP CODE SPRINT",
    tag: "FLAGSHIP ARENA",
    tagColor: "lime",
    date: "OCT 23-24 (R1 ONLINE) • NOV 01-02 (R2 OFFLINE)",
    teamSize: "3 - 4 Members",
    entryFee: "₹100 (R1 ONLINE)",
    feeSubtext: "Top 30 Teams → ₹500 (R2 Offline)",
    description:
      "24-hour national hackathon. Round 1 online screening followed by the grand 24H offline build at SUIET Mukka for the Top 30 finalists.",
    icon: Zap,
    registerUrl: "/register?event=hackathon",
  },
  {
    id: "speed-typing",
    title: "Speed Typing Showdown",
    subtitle: "CODE SYNTAX & WPM BLITZ",
    tag: "SPEED & ACCURACY",
    tagColor: "amber",
    date: "OCTOBER 31 • 10:30 AM",
    teamSize: "Solo Developer (1P)",
    entryFee: "₹100 / Person",
    feeSubtext: "Solo Entry Fee",
    description:
      "Battle of developer reflexes and keyboard mastery. Compete in live syntax typing, WPM speed benchmarks, and coding sprints under pressure.",
    icon: Keyboard,
    registerUrl: "/register?event=speed-typing",
  },
  {
    id: "treasure-hunt",
    title: "Treasure Hunt Cyber Quest",
    subtitle: "CAMPUS CIPHER ADVENTURE",
    tag: "CAMPUS QUEST",
    tagColor: "cyan",
    date: "OCTOBER 31 • 2:30 PM",
    teamSize: "2 - 4 Members",
    entryFee: "₹200 / Team",
    feeSubtext: "Squad Entry Fee",
    description:
      "Campus-wide interactive adventure. Decode cryptic ciphers, hidden QR coordinates, logical riddles, and physical clue trails across SUIET.",
    icon: Compass,
    registerUrl: "/register?event=treasure-hunt",
  },
  {
    id: "free-fire",
    title: "Free Fire Esports Arena",
    subtitle: "BATTLE ROYALE TOURNAMENT",
    tag: "ESPORTS COMBAT",
    tagColor: "pink",
    date: "OCTOBER 31 • 10:30 AM",
    teamSize: "Squad (4 Players)",
    entryFee: "₹200 / Squad",
    feeSubtext: "Full Squad Entry",
    description:
      "High-adrenaline mobile esports showdown. Custom lobbies, tactical battle royale rounds, and ultimate campus gaming supremacy.",
    icon: Gamepad2,
    registerUrl: "/register?event=free-fire",
  },
];

export default function RegistrationSection() {
  const scrollToTop = () => {
    soundFX.playClick();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <section
      id="registration"
      className="relative min-h-screen w-full bg-[#050507] text-white flex flex-col justify-between p-5 sm:p-8 lg:p-14 border-t border-white/10 cyber-grid overflow-hidden selection:bg-[#ccff00] selection:text-black"
    >
      {/* Atmospheric Glow & Background Vignette */}
      <div className="absolute inset-0 scanline-effect opacity-20 pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#ccff00]/5 rounded-full blur-[180px] pointer-events-none" />
      <div className="absolute top-1/4 right-5 w-96 h-96 bg-[#00f0ff]/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-5 w-96 h-96 bg-[#ff007f]/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Top Telemetry Header Bar */}
      <div className="relative z-10 w-full mx-auto flex items-center justify-between border-b border-white/10 pb-4 mb-8 sm:mb-10">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ccff00] animate-pulse" />
          <span className="font-mono text-xs sm:text-sm font-bold tracking-widest text-[#ccff00] uppercase">
            // 03. EVENT REGISTRATION & TRACKS
          </span>
        </div>
      </div>

      {/* Section Headline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.08, margin: "0px 0px -30px 0px" }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-5xl mx-auto text-center space-y-3 pt-2 mb-10 select-none"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/80 border border-[#ccff00]/40 text-[#ccff00] text-xs font-mono shadow-[0_0_20px_rgba(204,255,0,0.2)]">
          <Terminal className="w-3.5 h-3.5" />
          <span>CHOOSE YOUR ARENA // CLAIM YOUR ACCESS PASS</span>
        </div>

        <h2 className="font-[family-name:var(--font-orbitron)] font-black text-3xl sm:text-5xl lg:text-6xl tracking-tight text-white drop-shadow-[0_10px_30px_rgba(0,0,0,0.9)]">
          EVENT <span className="text-[#ccff00] glow-text-lime">REGISTRATION</span> &{" "}
          <span className="text-cyan-400">TRACKS</span>
        </h2>

        <p className="font-mono text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto">
          Select from 4 competitive event tracks. Register your team or claim your solo pass below.
        </p>
      </motion.div>

      {/* 4 Registration Cards Grid */}
      <div className="relative z-10 w-full max-w-6xl mx-auto my-4 grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        {eventCards.map((card, idx) => {
          const IconComponent = card.icon;

          const colorStyles = {
            lime: {
              border: "border-[#ccff00]/30 hover:border-[#ccff00]",
              glow: "hover:shadow-[0_0_35px_rgba(204,255,0,0.25)]",
              badge: "bg-[#ccff00]/15 text-[#ccff00] border-[#ccff00]/40",
              btn: "bg-[#ccff00] hover:bg-[#d9ff33] text-black shadow-[0_0_20px_rgba(204,255,0,0.35)]",
              iconColor: "text-[#ccff00]",
              accentBorder: "border-t-2 border-l-2 border-[#ccff00]",
            },
            amber: {
              border: "border-amber-500/30 hover:border-amber-400",
              glow: "hover:shadow-[0_0_35px_rgba(245,158,11,0.25)]",
              badge: "bg-amber-500/15 text-amber-400 border-amber-400/40",
              btn: "bg-amber-400 hover:bg-amber-300 text-black shadow-[0_0_20px_rgba(245,158,11,0.35)]",
              iconColor: "text-amber-400",
              accentBorder: "border-t-2 border-l-2 border-amber-400",
            },
            cyan: {
              border: "border-cyan-500/30 hover:border-cyan-400",
              glow: "hover:shadow-[0_0_35px_rgba(0,240,255,0.25)]",
              badge: "bg-cyan-500/15 text-cyan-400 border-cyan-400/40",
              btn: "bg-cyan-400 hover:bg-cyan-300 text-black shadow-[0_0_20px_rgba(0,240,255,0.35)]",
              iconColor: "text-cyan-400",
              accentBorder: "border-t-2 border-l-2 border-cyan-400",
            },
            pink: {
              border: "border-[#ff007f]/30 hover:border-[#ff007f]",
              glow: "hover:shadow-[0_0_35px_rgba(255,0,127,0.25)]",
              badge: "bg-[#ff007f]/15 text-[#ff007f] border-[#ff007f]/40",
              btn: "bg-[#ff007f] hover:bg-[#ff3399] text-white shadow-[0_0_20px_rgba(255,0,127,0.35)]",
              iconColor: "text-[#ff007f]",
              accentBorder: "border-t-2 border-l-2 border-[#ff007f]",
            },
          }[card.tagColor];

          return (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.08, margin: "0px 0px -40px 0px" }}
              transition={{
                duration: 0.65,
                delay: (idx % 2) * 0.08,
                ease: [0.16, 1, 0.3, 1],
              }}
              onMouseEnter={() => soundFX.playHover()}
              className={`relative group rounded-2xl bg-[#090b10]/95 border ${colorStyles.border} ${colorStyles.glow} transition-colors duration-300 p-6 sm:p-7 flex flex-col justify-between backdrop-blur-xl shadow-[0_15px_40px_rgba(0,0,0,0.85)] hover:-translate-y-1 select-none`}
            >
              {/* Cyber Reticle Corner Accents */}
              <div className={`absolute top-0 left-0 w-3 h-3 ${colorStyles.accentBorder} rounded-tl-sm`} />
              <div className={`absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 ${colorStyles.border} rounded-tr-sm`} />
              <div className={`absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 ${colorStyles.border} rounded-bl-sm`} />
              <div className={`absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 ${colorStyles.border} rounded-br-sm`} />

              <div>
                {/* Top Card Header: Tag & Entry Fee */}
                <div className="flex items-center justify-between gap-2 pb-4 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg bg-black/60 border border-white/10 ${colorStyles.iconColor}`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider border ${colorStyles.badge}`}>
                        {card.tag}
                      </span>
                      <div className="text-[10px] font-mono text-zinc-500 mt-0.5">{card.subtitle}</div>
                    </div>
                  </div>

                  <div className="text-right font-mono">
                    <div className="text-xs font-bold text-white flex items-center gap-1 justify-end">
                      <span className="text-[10px] text-zinc-400">ENTRY:</span>
                      <span className="text-[#ccff00] font-black">{card.entryFee}</span>
                    </div>
                    {card.feeSubtext && (
                      <div className="text-[10px] text-zinc-400">{card.feeSubtext}</div>
                    )}
                  </div>
                </div>

                {/* Event Title */}
                <h3 className="font-[family-name:var(--font-orbitron)] font-black text-2xl sm:text-3xl text-white group-hover:text-white transition-colors mt-4 mb-2">
                  {card.title}
                </h3>

                {/* Event Description */}
                <p className="font-mono text-xs sm:text-sm text-zinc-400 leading-relaxed mb-4">
                  {card.description}
                </p>

                {/* Meta Details Pill (Team Size & Date) */}
                <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-black/60 border border-white/10 text-xs font-mono mb-6">
                  <div className="flex items-center gap-2 text-zinc-300">
                    <Users className="w-3.5 h-3.5 text-[#ccff00]" />
                    <span>{card.teamSize}</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-300">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="truncate">{card.date}</span>
                  </div>
                </div>
              </div>

              {/* Action Button linking to Separate Registration Page */}
              <div className="pt-3 border-t border-white/10">
                <Link
                  href={card.registerUrl}
                  onClick={() => soundFX.playClick()}
                  onMouseEnter={() => soundFX.playHover()}
                  className={`group/btn relative w-full py-3.5 px-5 rounded-xl ${colorStyles.btn} font-[family-name:var(--font-orbitron)] font-bold text-xs sm:text-sm tracking-wider uppercase flex items-center justify-center gap-2 transition-all duration-300 active:scale-[0.98] overflow-hidden`}
                >
                  {/* Shimmer Light Bar */}
                  <div className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/35 to-transparent pointer-events-none" />

                  <span>REGISTER NOW</span>
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
