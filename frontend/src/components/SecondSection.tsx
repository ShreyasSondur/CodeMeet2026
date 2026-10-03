"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { soundFX } from "@/lib/audio";
import HoloModelCanvas from "./HoloModelCanvas";
import {
  Terminal,
  Download,
  CheckCircle2,
} from "lucide-react";

export default function SecondSection() {
  const [downloadNotice, setDownloadNotice] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadRulebook = () => {
    soundFX.playClick();
    soundFX.playSuccess();
    setIsDownloading(true);
    setDownloadNotice(true);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
    // Trigger download via invisible link
    const link = document.createElement("a");
    link.href = `${apiUrl}/api/rulebook/download`;
    link.setAttribute("download", "CODEMEET_2026_Official_Rulebook.pdf");
    link.setAttribute("target", "_blank");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      setIsDownloading(false);
      setTimeout(() => setDownloadNotice(false), 3000);
    }, 1000);
  };

  return (
    <section id="about" className="relative min-h-screen w-full bg-[#050507] text-white flex flex-col justify-between p-5 sm:p-8 lg:p-14 border-t border-white/10 cyber-grid overflow-hidden selection:bg-[#ccff00] selection:text-black">
      {/* Atmospheric Lighting & Subtle Glow Blobs */}
      <div className="absolute inset-0 scanline-effect opacity-20 pointer-events-none" />
      <div className="absolute -top-40 left-1/4 w-96 h-96 bg-[#ccff00]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Telemetry Header Bar */}
      <div className="relative z-10 w-full mx-auto flex items-center justify-between border-b border-white/10 pb-4 mb-8 sm:mb-10">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ccff00] animate-pulse" />
          <span className="font-mono text-xs sm:text-sm font-bold tracking-widest text-[#ccff00] uppercase">
            // 02. ABOUT THE EVENT & MISSION
          </span>
        </div>
      </div>

      {/* Main Content Grid: Bi-directional scroll animation */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.08, margin: "0px 0px -40px 0px" }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-7xl mx-auto my-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center"
      >
        {/* Left Column: Clean Minimal 3D Hologram (Desktop Only, Hidden on Phone width) */}
        <div className="hidden lg:flex lg:col-span-5 flex-col items-center justify-center">
          <div className="relative group w-full max-w-sm rounded-2xl bg-[#090b10]/80 border border-white/10 hover:border-[#ccff00]/50 transition-all duration-500 p-2 shadow-[0_0_35px_rgba(0,0,0,0.8)] backdrop-blur-xl">
            {/* Minimalist Cyber Corner Notches */}
            <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-[#ccff00]/60 rounded-tl-sm" />
            <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 border-[#ccff00]/60 rounded-tr-sm" />
            <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2 border-[#ccff00]/60 rounded-bl-sm" />
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 border-[#ccff00]/60 rounded-br-sm" />

            {/* Clean 3D Viewport */}
            <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-black/60 flex items-center justify-center">
              <HoloModelCanvas />
            </div>
          </div>
        </div>

        {/* Right Column: Narrative Starting Directly with Welcome Heading on All Devices */}
        <div className="col-span-1 lg:col-span-7 flex flex-col space-y-5 select-none">
          {/* Main Headline */}
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-black/80 border border-[#ccff00]/40 text-[#ccff00] text-xs font-mono shadow-[0_0_15px_rgba(204,255,0,0.2)] mb-3">
              <Terminal className="w-3.5 h-3.5" />
              <span>SRINIVAS INSTITUTE OF ENGINEERING & TECHNOLOGY</span>
            </div>

            <h2 className="font-[family-name:var(--font-orbitron)] font-black text-3xl sm:text-5xl lg:text-6xl tracking-tight text-white leading-tight drop-shadow-[0_10px_30px_rgba(0,0,0,0.9)]">
              WELCOME TO <span className="text-[#ccff00] glow-text-lime">CODEMEET 2026</span>. WHERE IDEAS TURN INTO <span className="text-cyan-400">REAL IMPACT</span>.
            </h2>
          </div>

          {/* Highlighted Lead Box */}
          <div className="p-4 sm:p-5 rounded-xl bg-black/75 border-l-4 border-l-[#ccff00] border-y border-r border-white/10 backdrop-blur-md shadow-[0_0_25px_rgba(0,0,0,0.6)]">
            <p className="font-mono text-xs sm:text-sm text-zinc-200 leading-relaxed">
              Join us for an electrifying <strong className="text-[#ccff00]">24-hour offline hackathon</strong> at <strong className="text-white">Srinivas University Institute of Engineering and Technology (SUIET)</strong>, proudly presented in collaboration with the <strong className="text-cyan-400">Webflow Community</strong> from <strong className="text-[#ccff00]">October 31 to November 2, 2026</strong>.
            </p>
          </div>

          {/* Detailed Event Flow */}
          <div className="space-y-3.5 font-mono text-xs sm:text-sm text-zinc-400 leading-relaxed">
            <p>
              The event kicks off with <strong className="text-white">two master workshops on October 31</strong> covering essential tech stacks and modern developer frameworks. This is followed by the core hack session commencing at <strong className="text-[#ccff00] font-bold">9:30 AM on November 1</strong>.
            </p>
            <p>
              Participants will work on any one of the <strong className="text-white">four predefined problem statements</strong>, advancing through the structured stages of design, development, and final presentations.
            </p>
            <p>
              With carefully curated challenges designed to engage all skill levels, this is a unique opportunity to showcase creativity, teamwork, and high-impact engineering!
            </p>
          </div>

          {/* Download Rulebook CTA Button & Status Notice */}
          <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <button
              onClick={handleDownloadRulebook}
              onMouseEnter={() => soundFX.playHover()}
              className="group relative px-7 py-3.5 rounded-xl bg-zinc-900 hover:bg-black border border-[#ccff00]/50 hover:border-[#ccff00] text-white font-[family-name:var(--font-orbitron)] font-bold text-xs sm:text-sm tracking-wider uppercase flex items-center gap-3 transition-all duration-300 shadow-[0_0_25px_rgba(204,255,0,0.15)] hover:shadow-[0_0_30px_rgba(204,255,0,0.4)] cursor-pointer overflow-hidden"
            >
              {/* Shimmer Light Bar */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-[#ccff00]/20 to-transparent pointer-events-none" />

              <Download className="w-4 h-4 text-[#ccff00] group-hover:-translate-y-0.5 transition-transform" />
              <span>DOWNLOAD RULEBOOK</span>
              <span className="text-[10px] font-mono text-zinc-500 group-hover:text-zinc-300">
                [PDF]
              </span>
            </button>

            {downloadNotice && (
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#ccff00]/10 border border-[#ccff00]/40 text-[#ccff00] font-mono text-xs animate-in fade-in slide-in-from-left-2 duration-300">
                <CheckCircle2 className="w-4 h-4" />
                <span>OFFICIAL RULEBOOK DISPATCH INCOMING // READY SOON</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
