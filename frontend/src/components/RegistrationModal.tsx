"use client";

import { useState } from "react";
import { soundFX } from "@/lib/audio";
import confetti from "canvas-confetti";
import { X, Sparkles, CheckCircle2, ShieldCheck, Terminal, Users, User, Mail, School, ArrowRight } from "lucide-react";

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RegistrationModal({ isOpen, onClose }: RegistrationModalProps) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    college: "",
    teamName: "",
    teamSize: "4",
    track: "AI & Neural Networks",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#ccff00", "#00f0ff", "#ffffff", "#8b5cf6"],
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    soundFX.playClick();

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      soundFX.playSuccess();
      triggerConfetti();
    }, 800);
  };

  const handleClose = () => {
    soundFX.playClick();
    onClose();
    setTimeout(() => setIsSubmitted(false), 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-[#090b10] border border-[#ccff00]/40 rounded-2xl shadow-[0_0_50px_rgba(204,255,0,0.25)] p-6 sm:p-8 text-white overflow-hidden"
      >
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-24 bg-[#ccff00]/15 blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={handleClose}
          onMouseEnter={() => soundFX.playHover()}
          className="absolute top-4 right-4 p-2 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-white/10 hover:border-white/20 transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {!isSubmitted ? (
          <div>
            {/* Header */}
            <div className="flex items-center gap-2 text-[#ccff00] font-mono text-xs mb-1">
              <Terminal className="w-4 h-4" />
              <span>CODEMEET 2026 // CANDIDATE REGISTRATION</span>
            </div>
            <h2 className="font-[family-name:var(--font-orbitron)] font-black text-2xl sm:text-3xl tracking-tight text-white mb-2">
              CLAIM YOUR <span className="text-[#ccff00]">SLOT</span>
            </h2>
            <p className="text-xs text-zinc-400 font-mono mb-6 leading-relaxed">
              Join the 24-hour national hackathon. Prize pool ₹50,000. Limited slots available.
            </p>

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono text-zinc-300 mb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#ccff00]" />
                  LEADER FULL NAME *
                </label>
                <input
                  required
                  type="text"
                  placeholder="Enter full name"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-black/60 border border-white/15 focus:border-[#ccff00] focus:ring-1 focus:ring-[#ccff00] text-sm text-white placeholder:text-zinc-600 outline-none font-mono transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-zinc-300 mb-1 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#ccff00]" />
                  EMAIL ADDRESS *
                </label>
                <input
                  required
                  type="email"
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-black/60 border border-white/15 focus:border-[#ccff00] focus:ring-1 focus:ring-[#ccff00] text-sm text-white placeholder:text-zinc-600 outline-none font-mono transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-zinc-300 mb-1 flex items-center gap-1.5">
                    <School className="w-3.5 h-3.5 text-cyan-400" />
                    COLLEGE / INST. *
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="Enter college / institute name"
                    value={formData.college}
                    onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-black/60 border border-white/15 focus:border-[#ccff00] focus:ring-1 focus:ring-[#ccff00] text-sm text-white placeholder:text-zinc-600 outline-none font-mono transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-zinc-300 mb-1 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-cyan-400" />
                    TEAM NAME *
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="Enter team name"
                    value={formData.teamName}
                    onChange={(e) => setFormData({ ...formData, teamName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-black/60 border border-white/15 focus:border-[#ccff00] focus:ring-1 focus:ring-[#ccff00] text-sm text-white placeholder:text-zinc-600 outline-none font-mono transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-zinc-300 mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#ccff00]" />
                  SELECT HACK TRACK
                </label>
                <select
                  value={formData.track}
                  onChange={(e) => setFormData({ ...formData, track: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-black/60 border border-white/15 focus:border-[#ccff00] text-sm text-white outline-none font-mono transition-all"
                >
                  <option value="AI & Neural Networks" className="bg-zinc-900">AI & Neural Intelligence</option>
                  <option value="Web3 & Decentralized Systems" className="bg-zinc-900">Web3 & Decentralized Tech</option>
                  <option value="Cloud & Cyber Defense" className="bg-zinc-900">Cloud & Cyber Defense</option>
                  <option value="Open Innovation" className="bg-zinc-900">Open Innovation & IoT</option>
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  onMouseEnter={() => soundFX.playHover()}
                  className="w-full py-3 px-6 rounded-xl bg-[#ccff00] hover:bg-[#b8e600] active:scale-[0.98] text-black font-[family-name:var(--font-orbitron)] font-bold text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(204,255,0,0.4)] transition-all cursor-pointer"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2 font-mono">
                      <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      ENCRYPTING REGISTRATION...
                    </span>
                  ) : (
                    <>
                      <span>CONFIRM & REGISTER NOW</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="text-center py-6 space-y-4 animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full bg-[#ccff00]/15 border-2 border-[#ccff00] flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(204,255,0,0.5)]">
              <CheckCircle2 className="w-8 h-8 text-[#ccff00]" />
            </div>

            <h3 className="font-[family-name:var(--font-orbitron)] font-black text-2xl text-white">
              ACCESS PASS GRANTED!
            </h3>

            <p className="text-xs font-mono text-zinc-300 max-w-sm mx-auto leading-relaxed">
              Registration received for <strong className="text-[#ccff00]">{formData.teamName}</strong>. A confirmation pass and hacker kit info has been dispatched to <strong className="text-white">{formData.email}</strong>.
            </p>

            <div className="p-3.5 rounded-xl bg-black/60 border border-[#ccff00]/30 font-mono text-[11px] text-zinc-400 flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>PASSPORT CODE: CM26-HYPER-{Math.floor(1000 + Math.random() * 9000)}</span>
            </div>

            <button
              onClick={handleClose}
              onMouseEnter={() => soundFX.playHover()}
              className="mt-4 px-6 py-2.5 rounded-xl bg-zinc-900 border border-white/20 hover:border-[#ccff00] text-zinc-200 hover:text-white font-mono text-xs transition-all cursor-pointer"
            >
              CLOSE TERMINAL
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
