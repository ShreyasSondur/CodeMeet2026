"use client";

import Link from "next/link";
import { ArrowLeft, MapPin, Phone, Mail, Globe, Clock, ExternalLink } from "lucide-react";
import { soundFX } from "@/lib/audio";

export default function ContactPage() {
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
            <Phone className="w-3.5 h-3.5" />
            <span>OFFICIAL HELPDESK &amp; CAMPUS LIAISON</span>
          </div>
          <h1 className="font-[family-name:var(--font-orbitron)] font-black text-3xl sm:text-4xl text-white">
            Contact &amp; Support
          </h1>
          <p className="text-zinc-400 font-mono text-xs sm:text-sm">
            Have questions about registration, delegate fee payment, or campus accommodation? Get in touch with our student and faculty coordinators.
          </p>
        </div>

        {/* Contact Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
          
          {/* Institutional Address */}
          <div className="p-6 rounded-2xl bg-zinc-950/80 border border-white/10 space-y-3">
            <div className="flex items-center gap-2.5 text-[#ccff00] font-bold text-sm">
              <MapPin className="w-4 h-4" />
              <span>INSTITUTION VENUE</span>
            </div>
            <div className="text-zinc-200 font-bold text-sm">
              Srinivas University Institute of Engineering &amp; Technology (SUIET)
            </div>
            <p className="text-zinc-400 leading-relaxed text-xs">
              Mukka Campus, NH-66, Surathkal, Mangaluru, Karnataka 574146, India.
            </p>
            <a
              href="https://maps.app.goo.gl/xNcc8sYnQu73zw9eA"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => soundFX.playClick()}
              className="inline-flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 font-bold pt-2 transition-colors"
            >
              <span>View On Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Email Support */}
          <div className="p-6 rounded-2xl bg-zinc-950/80 border border-white/10 space-y-3">
            <div className="flex items-center gap-2.5 text-cyan-400 font-bold text-sm">
              <Mail className="w-4 h-4" />
              <span>EMAIL COMMUNICATIONS</span>
            </div>
            <p className="text-zinc-400 leading-relaxed text-xs">
              For registration inquiries, payment support, sponsorships, and official communication:
            </p>
            <div className="space-y-1.5 pt-1">
              <div>
                <span className="text-zinc-500 block text-[10px]">ORGANIZING COMMUNITY:</span>
                <a
                  href="mailto:webflowcommunity@srinivasuniversity.edu.in"
                  className="font-bold text-white hover:text-[#ccff00] transition-colors break-all"
                >
                  webflowcommunity@srinivasuniversity.edu.in
                </a>
              </div>
            </div>
          </div>

          {/* Phone Coordinators */}
          <div className="p-6 rounded-2xl bg-zinc-950/80 border border-white/10 space-y-3">
            <div className="flex items-center gap-2.5 text-amber-400 font-bold text-sm">
              <Phone className="w-4 h-4" />
              <span>STUDENT LEAD COORDINATORS</span>
            </div>
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <div>
                  <div className="font-bold text-white">Shreyas Sondur</div>
                  <div className="text-[10px] text-zinc-500">Lead Organizer &amp; Technical Head</div>
                </div>
                <a
                  href="tel:+918660415798"
                  onClick={() => soundFX.playClick()}
                  className="font-bold text-[#ccff00] hover:underline"
                >
                  +91 86604 15798
                </a>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">Abir</div>
                  <div className="text-[10px] text-zinc-500">Operations &amp; Logistics Head</div>
                </div>
                <a
                  href="tel:+919108907485"
                  onClick={() => soundFX.playClick()}
                  className="font-bold text-[#ccff00] hover:underline"
                >
                  +91 91089 07485
                </a>
              </div>
            </div>
          </div>

          {/* Helpdesk Timings */}
          <div className="p-6 rounded-2xl bg-zinc-950/80 border border-white/10 space-y-3">
            <div className="flex items-center gap-2.5 text-emerald-400 font-bold text-sm">
              <Clock className="w-4 h-4" />
              <span>HELPDESK OPERATIONAL HOURS</span>
            </div>
            <p className="text-zinc-400 leading-relaxed text-xs">
              Student response desk is actively monitored:
            </p>
            <ul className="space-y-1 text-zinc-300 pt-1">
              <li>• <strong>Monday – Saturday:</strong> 9:00 AM – 7:00 PM IST</li>
              <li>• <strong>During Event Days:</strong> 24/7 Active Control Room</li>
            </ul>
          </div>

        </div>

        {/* Navigation Footer */}
        <div className="pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-zinc-500">
          <div>© 2026 Srinivas University (SUIET) • CODEMEET</div>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="hover:text-[#ccff00] transition-colors">Terms &amp; Conditions</Link>
            <Link href="/privacy" className="hover:text-[#ccff00] transition-colors">Privacy Policy</Link>
            <Link href="/refund-policy" className="hover:text-[#ccff00] transition-colors">Refund Policy</Link>
            <Link href="/about" className="hover:text-[#ccff00] transition-colors">About &amp; Pricing</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
