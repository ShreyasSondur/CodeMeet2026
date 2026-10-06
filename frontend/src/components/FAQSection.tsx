"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { soundFX } from "@/lib/audio";
import {
  HelpCircle,
  Shield,
  ArrowUp,
  Sparkles,
  ExternalLink,
  Phone,
  Navigation,
  ShieldAlert,
  Heart,
  MapPin,
} from "lucide-react";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    id: "faq-1",
    question: "WHO CAN PARTICIPATE IN CODE MEET HACKATHON 2026?",
    answer:
      "The hackathon is open to all undergraduate and postgraduate  students from any stream or institution with a valid student ID. Whether you are a freshman writing your first line of code or a senior building distributed systems, all skill levels are welcome!",
  },
  {
    id: "faq-2",
    question: "WHAT IS THE TEAM SIZE?",
    answer:
      "Teams can consist of 3 to 4 members. You can register as a team or form a team before the event starts. Individual participation is not Allowed by our organizing team.",
  },
  {
    id: "faq-3",
    question: "IS THERE A REGISTRATION FEE?",
    answer:
      "Registration fee is ₹100 per team for Round 1 (Online Idea Screening & Abstract Submission). After the shortlisting round, only the shortlisted teams advancing to Round 2 (24-Hour Offline Grand Sprint at campus) will pay the registration fee of ₹500 per team. All registrations, team submissions, and payments are managed securely on hackathon.suiet.website.",
  },
  {
    id: "faq-4",
    question: "DO I NEED TO HAVE A WORKING PROTOTYPE AT SUBMISSION?",
    answer:
      "Yes! By the end of the 30-hour hacking period, teams are expected to present a functional prototype along with source code and a presentation demo for the judging panel.",
  },
  {
    id: "faq-5",
    question: "CAN I BEGIN WORKING ON MY PROJECT BEFORE THE EVENT?",
    answer:
      "No. All code, design, and implementation must be built during the official 30-hour hacking window. Pre-built projects or code templates are strictly prohibited and subject to disqualification.",
  },
  {
    id: "faq-6",
    question: "WHAT SHOULD I BRING TO THE VENUE?",
    answer:
      "Bring your laptop, charger, valid college ID card, extension cord, personal essentials, and your endless creativity! High-speed Wi-Fi, power outlets, some refreshments and resting areas will be provided to the participants during the event.",
  },
];

export default function FAQSection() {
  // First item open by default
  const [openId, setOpenId] = useState<string | null>("faq-1");

  const toggleFAQ = (id: string) => {
    soundFX.playClick();
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section
      id="faq"
      className="relative min-h-screen w-full bg-[#050507] text-white flex flex-col justify-between p-5 sm:p-8 lg:p-14 border-t border-white/10 cyber-grid overflow-hidden selection:bg-[#ccff00] selection:text-black"
    >
      {/* Ambient Neon Lime & Cyber Lighting Blobs */}
      <div className="absolute inset-0 scanline-effect opacity-15 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-[#ccff00]/6 rounded-full blur-[180px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-[500px] h-[400px] bg-cyan-500/5 rounded-full blur-[180px] pointer-events-none" />

      {/* Top Header & Telemetry Badge */}
      <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center text-center space-y-4 pt-4 mb-10 select-none">
        {/* Neon Lime HUD Knowledge Base Badge */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.05 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/80 border border-[#ccff00]/60 text-[#ccff00] text-xs font-mono shadow-[0_0_20px_rgba(204,255,0,0.25)]"
        >
          <HelpCircle className="w-3.5 h-3.5 text-[#ccff00]" />
          <span className="font-bold tracking-widest uppercase">// 06. KNOWLEDGE BASE</span>
        </motion.div>

        {/* Orbitron Dual-Tone Headline with Vibrant Neon Lime Glow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.05 }}
          transition={{ duration: 0.6, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-1"
        >
          <h2 className="font-[family-name:var(--font-orbitron)] font-black text-3xl sm:text-5xl lg:text-6xl tracking-wider text-white uppercase drop-shadow-[0_10px_25px_rgba(0,0,0,0.9)]">
            FREQUENTLY ASKED
          </h2>
          <div className="font-[family-name:var(--font-orbitron)] font-black text-3xl sm:text-5xl lg:text-6xl tracking-wider text-[#ccff00] uppercase drop-shadow-[0_0_35px_rgba(204,255,0,0.7)] glow-text-lime">
            QUESTIONS
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.05 }}
          transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="font-mono text-xs sm:text-sm text-zinc-400 max-w-md mx-auto"
        >
          Got questions? We have answers.
        </motion.p>
      </div>

      {/* FAQ Accordion List */}
      <div className="relative z-10 w-full max-w-4xl mx-auto my-2 space-y-4">
        {faqs.map((faq, idx) => {
          const isOpen = openId === faq.id;

          return (
            <motion.div
              key={faq.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.05 }}
              transition={{
                duration: 0.55,
                delay: (idx % 3) * 0.06,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="w-full"
            >
              <div
                onClick={() => toggleFAQ(faq.id)}
                onMouseEnter={() => soundFX.playHover()}
                className={`relative rounded-xl cursor-pointer transition-all duration-300 overflow-hidden select-none ${isOpen
                    ? "bg-[#090d0e]/95 border-2 border-[#ccff00] shadow-[3px_3px_0px_#ccff00,0_0_30px_rgba(204,255,0,0.22)]"
                    : "bg-[#090b14]/80 border border-white/15 hover:border-[#ccff00]/40 hover:bg-[#0c0e18]"
                  }`}
              >
                {/* Accordion Question Bar */}
                <div className="p-5 sm:p-6 flex items-center justify-between gap-4">
                  <h3
                    className={`font-[family-name:var(--font-orbitron)] font-bold text-xs sm:text-sm md:text-base tracking-wider uppercase transition-colors leading-snug ${isOpen ? "text-white" : "text-zinc-200 hover:text-white"
                      }`}
                  >
                    {faq.question}
                  </h3>

                  {/* Right [+]/[-] Neon Green Cyber Badge */}
                  <div
                    className={`shrink-0 px-2.5 py-1 rounded font-mono text-xs sm:text-sm font-black border transition-all duration-300 ${isOpen
                        ? "bg-[#ccff00]/20 text-[#ccff00] border-[#ccff00] shadow-[0_0_15px_rgba(204,255,0,0.45)]"
                        : "bg-black/60 text-zinc-400 border-white/20 group-hover:border-[#ccff00]/50 group-hover:text-[#ccff00]"
                      }`}
                  >
                    {isOpen ? "[-]" : "[+]"}
                  </div>
                </div>

                {/* Animated Collapsible Answer Body */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-1 text-zinc-300 font-mono text-xs sm:text-sm leading-relaxed border-t border-white/10">
                        {faq.id === "faq-3" ? (
                          <div className="space-y-3">
                            <p>{faq.answer}</p>
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#ccff00]/10 border border-[#ccff00]/30 text-[#ccff00] text-xs">
                              <span className="font-bold">Official Registration Portal:</span>
                              <a
                                href="https://hackathon.suiet.website"
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="underline hover:text-white flex items-center gap-1 font-bold"
                              >
                                hackathon.suiet.website
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          </div>
                        ) : (
                          faq.answer
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* MASTER FOOTER: CLEAN, SLEEK, MINIMAL & PROFESSIONAL */}
      {/* ========================================================================= */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto pt-16 mt-16 border-t border-white/10 select-none">
        {/* Main Content Grid: 3 Clean Minimal Columns */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 pb-8">

          {/* Col 1: Brand & Webflow Community attribution (5 cols) */}
          <div className="md:col-span-5 space-y-3.5">
            <div className="font-[family-name:var(--font-orbitron)] font-black text-2xl sm:text-3xl tracking-wider text-white">
              CODE<span className="text-[#ccff00]">MEET</span> <span className="text-zinc-500 font-normal text-lg sm:text-xl">2026</span>
            </div>

            <p className="font-mono text-xs text-zinc-400 max-w-sm leading-relaxed">
              National 24-Hour Hackathon hosted by Srinivas Institute of Engineering & Technology (SUIET), Mukka, Mangaluru.
            </p>

            {/* Webflow Community Partnership Badge */}
            <div className="inline-flex items-center gap-2.5 pt-1">
              <img
                src="/webflow-community-logo.png"
                alt="Webflow Community"
                className="h-5 w-auto object-contain invert brightness-200"
              />
              <span className="font-mono text-xs text-zinc-300">
                Made with <Heart className="w-3 h-3 text-[#ff007f] fill-[#ff007f] inline mx-0.5" /> by{" "}
                <span className="text-[#ccff00] font-bold">Webflow Community</span>
              </span>
            </div>
          </div>

          {/* Col 2: Venue & Location (4 cols) */}
          <div className="md:col-span-4 space-y-2.5 font-mono text-xs">
            <div className="text-[11px] font-bold tracking-widest text-[#ccff00] uppercase flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              <span>VENUE & LOCATION</span>
            </div>
            <div className="text-zinc-200 font-semibold leading-snug">
              SUIET Campus, Mukka
            </div>
            <div className="text-zinc-400 text-[11px] leading-relaxed">
              Surathkal, Mangaluru, Karnataka 574146
            </div>
            <a
              href="https://maps.app.goo.gl/xNcc8sYnQu73zw9eA"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => soundFX.playClick()}
              className="inline-flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 text-xs font-bold pt-1 transition-colors group"
            >
              <span>Open in Google Maps</span>
              <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </a>
          </div>

          {/* Col 3: Contacts & Helpdesk (3 cols) */}
          <div className="md:col-span-3 space-y-2.5 font-mono text-xs">
            <div className="text-[11px] font-bold tracking-widest text-[#ccff00] uppercase flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5" />
              <span>COORDINATORS</span>
            </div>
            <div className="space-y-1.5 text-zinc-300">
              <div className="flex items-center justify-between gap-2">
                <span className="text-zinc-400">Shreyas:</span>
                <a
                  href="tel:+918660415798"
                  onClick={() => soundFX.playClick()}
                  className="font-bold text-white hover:text-[#ccff00] transition-colors"
                >
                  +91 86604 15798
                </a>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-zinc-400">Abir:</span>
                <a
                  href="tel:+919108907485"
                  onClick={() => soundFX.playClick()}
                  className="font-bold text-white hover:text-[#ccff00] transition-colors"
                >
                  +91 91089 07485
                </a>
              </div>
            </div>
            <div className="pt-1 text-[11px] text-zinc-500">
              Portal:{" "}
              <a
                href="https://hackathon.suiet.website"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-300 hover:text-[#ccff00] font-bold"
              >
                hackathon.suiet.website
              </a>
            </div>
          </div>

        </div>

        {/* Mandatory Payment Gateway Compliance Policy Links */}
        <div className="py-4 px-4 rounded-xl bg-black/60 border border-white/10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-mono text-xs text-zinc-300 my-4">
          <Link
            href="/terms"
            onClick={() => soundFX.playClick()}
            className="hover:text-[#ccff00] transition-colors"
          >
            Terms &amp; Conditions
          </Link>
          <span className="text-zinc-600 hidden sm:inline">•</span>
          <Link
            href="/privacy"
            onClick={() => soundFX.playClick()}
            className="hover:text-[#ccff00] transition-colors"
          >
            Privacy Policy
          </Link>
          <span className="text-zinc-600 hidden sm:inline">•</span>
          <Link
            href="/refund-policy"
            onClick={() => soundFX.playClick()}
            className="hover:text-[#ccff00] transition-colors"
          >
            Cancellation &amp; Refund Policy
          </Link>
          <span className="text-zinc-600 hidden sm:inline">•</span>
          <Link
            href="/contact"
            onClick={() => soundFX.playClick()}
            className="hover:text-[#ccff00] transition-colors"
          >
            Contact Us
          </Link>
          <span className="text-zinc-600 hidden sm:inline">•</span>
          <Link
            href="/about"
            onClick={() => soundFX.playClick()}
            className="hover:text-[#ccff00] transition-colors"
          >
            About &amp; Pricing
          </Link>
        </div>

        {/* Bottom Copyright & Return to Top */}
        <div className="pt-4 pb-4 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-zinc-500 border-t border-white/5">
          <div>
            © 2026 CODEMEET • Srinivas University (SUIET). All rights reserved.
          </div>

          <button
            onClick={() => {
              soundFX.playClick();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            onMouseEnter={() => soundFX.playHover()}
            className="flex items-center gap-2 text-zinc-400 hover:text-[#ccff00] transition-colors cursor-pointer group font-mono text-xs"
          >
            <span>RETURN TO TOP</span>
            <ArrowUp className="w-3.5 h-3.5 text-[#ccff00] group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>
      </footer>
    </section>
  );
}
