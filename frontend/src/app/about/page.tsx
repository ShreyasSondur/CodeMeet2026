"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

import { ArrowLeft, Building2, Trophy, Tag, Sparkles, CheckCircle2 } from "lucide-react";
import { soundFX } from "@/lib/audio";

export default function AboutPricingPage() {
  const [pricings, setPricings] = useState<Record<string, { amount_inr: number }>>({});
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

  useEffect(() => {
    fetch(`${apiUrl}/api/events/pricing`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.pricing) {
          setPricings(data.pricing);
        }
      })
      .catch(() => {});
  }, [apiUrl]);

  const eventsPricing = [
    {
      id: "hackathon",
      name: "24H National Hackathon",
      category: "Academic Coding & Innovation Sprint",
      teamSize: "3 to 4 Members",
      fee: `₹${pricings["hackathon"]?.amount_inr ?? 100} per team`,
      inclusions: "24H high-speed lab access, overnight mentoring, electricity, meal passes, delegate badge & certificate.",
      color: "#ccff00",
    },
    {
      id: "speed-typing",
      name: "Speed Typing Showdown",
      category: "Keyboard Reflex & Syntax Blitz",
      teamSize: "Solo Participant (1P)",
      fee: `₹${pricings["speed-typing"]?.amount_inr ?? 100} per person`,
      inclusions: "Dedicated mechanical keyboard terminal, software bench testing, digital certificate & trophy entry.",
      color: "#f59e0b",
    },
    {
      id: "treasure-hunt",
      name: "Treasure Hunt Cyber Quest",
      category: "Campus Cipher & Cryptographic Quest",
      teamSize: "4 Members",
      fee: `₹${pricings["treasure-hunt"]?.amount_inr ?? 200} per team`,
      inclusions: "Campus quest map, cipher kit, clue tracking badge, participation certificates.",
      color: "#00f0ff",
    },
    {
      id: "free-fire",
      name: "Free Fire eSports Battle",
      category: "Student Tactical Gaming Arena",
      teamSize: "4 Members (Squad)",
      fee: `₹${pricings["free-fire"]?.amount_inr ?? 200} per squad`,
      inclusions: "Dedicated LAN router bandwidth, live stream projection, winner trophy entry & certificates.",
      color: "#ef4444",
    },
  ];


  return (
    <div className="min-h-screen bg-[#050507] text-white selection:bg-[#ccff00] selection:text-black">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-[#050507]/80 border-b border-white/10 px-4 sm:px-8 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            onClick={() => soundFX.playClick()}
            className="inline-flex items-center gap-2 text-xs font-mono text-zinc-400 hover:text-[#ccff00] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>BACK TO HOME</span>
          </Link>
          <div className="font-[family-name:var(--font-orbitron)] font-bold text-sm tracking-wider">
            CODE<span className="text-[#ccff00]">MEET</span> 2026
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-10">
        <div className="space-y-3 text-center sm:text-left border-b border-white/10 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ccff00]/10 border border-[#ccff00]/30 text-[#ccff00] text-xs font-mono font-bold">
            <Building2 className="w-3.5 h-3.5" />
            <span>INSTITUTION &amp; TRANSPARENT PRICING</span>
          </div>
          <h1 className="font-[family-name:var(--font-orbitron)] font-black text-3xl sm:text-4xl text-white">
            About CODEMEET 2026 &amp; Pricing
          </h1>
          <p className="text-zinc-400 font-mono text-xs sm:text-sm">
            Organized by Srinivas University Institute of Engineering and Technology (SUIET) in collaboration with the Webflow Student Community.
          </p>
        </div>

        {/* About Section */}
        <section className="space-y-4 p-6 sm:p-8 rounded-2xl bg-zinc-950/80 border border-white/10 font-mono text-xs sm:text-sm leading-relaxed text-zinc-300">
          <h2 className="font-[family-name:var(--font-orbitron)] text-lg text-white font-bold flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#ccff00]" />
            <span>About The Symposium</span>
          </h2>
          <p>
            <strong>CODEMEET 2026</strong> is the premier national-level student technical fest and 24-hour coding hackathon held at the sprawling coastal campus of <strong>Srinivas University Institute of Engineering and Technology (SUIET)</strong>, Mukka, Mangaluru.
          </p>
          <p>
            The symposium is aimed at fostering practical engineering problem solving, software engineering prowess, cyber security puzzles, and collaborative tech development among undergraduate and postgraduate engineering students from across India.
          </p>
        </section>

        {/* Pricing Schedule */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-white font-[family-name:var(--font-orbitron)] font-bold text-lg">
            <Tag className="w-4 h-4 text-[#ccff00]" />
            <span>Official Event Registration Fees &amp; Inclusions</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {eventsPricing.map((item, i) => (
              <div
                key={i}
                className="p-5 rounded-2xl bg-black/60 border border-white/10 space-y-3 font-mono"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm">{item.name}</span>
                  <span
                    className="px-2.5 py-1 rounded-full text-xs font-bold"
                    style={{ backgroundColor: `${item.color}20`, color: item.color }}
                  >
                    {item.fee}
                  </span>
                </div>
                <div className="text-[11px] text-zinc-400">
                  <strong>Format:</strong> {item.teamSize} • {item.category}
                </div>
                <div className="text-[11px] text-zinc-300 bg-white/5 p-2.5 rounded-lg border border-white/5">
                  <strong className="text-white block mb-1">Inclusions:</strong>
                  {item.inclusions}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Navigation Footer */}
        <div className="pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-zinc-500">
          <div>© 2026 Srinivas University (SUIET) • CODEMEET</div>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="hover:text-[#ccff00] transition-colors">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-[#ccff00] transition-colors">Privacy Policy</Link>
            <Link href="/refund-policy" className="hover:text-[#ccff00] transition-colors">Refund Policy</Link>
            <Link href="/contact" className="hover:text-[#ccff00] transition-colors">Contact Us</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
