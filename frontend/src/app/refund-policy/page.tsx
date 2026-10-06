"use client";

import Link from "next/link";
import { ArrowLeft, AlertTriangle, RefreshCw, CheckCircle2 } from "lucide-react";
import { soundFX } from "@/lib/audio";

export default function RefundPolicyPage() {
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>FINANCIAL &amp; CANCELLATION POLICIES</span>
          </div>
          <h1 className="font-[family-name:var(--font-orbitron)] font-black text-3xl sm:text-4xl text-white">
            Cancellation &amp; Refund Policy
          </h1>
          <p className="text-zinc-400 font-mono text-xs sm:text-sm">
            Last Updated: October 2026 • Official Financial Guidelines for CODEMEET 2026 Registrations
          </p>
        </div>

        {/* Prominent Policy Warning Alert */}
        <div className="p-6 rounded-2xl bg-amber-500/10 border-2 border-amber-500/40 space-y-2">
          <div className="flex items-center gap-2 text-amber-300 font-bold font-mono text-sm">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>REGISTRATION FEE POLICY NOTICE</span>
          </div>
          <p className="text-zinc-300 font-mono text-xs leading-relaxed">
            All registration and delegate entry fees collected for CODEMEET 2026 events and technical workshops are allocated directly towards participant kits, computational infrastructure, server hosting, and venue arrangements. As such, all standard registrations are <strong>final and non-refundable</strong> except in the specific circumstances outlined below.
          </p>
        </div>

        <div className="space-y-8 text-zinc-300 font-mono text-xs sm:text-sm leading-relaxed">
          {/* Section 1 */}
          <section className="space-y-3 p-6 rounded-2xl bg-zinc-950/80 border border-white/10">
            <h2 className="font-[family-name:var(--font-orbitron)] text-lg text-white font-bold flex items-center gap-2">
              <span className="text-amber-400">01.</span> Standard Non-Refundable Policy
            </h2>
            <p>
              Once a payment has been successfully completed and confirmed via the Cashfree payment gateway, no refunds or voluntary cancellations will be entertained if a participant or team chooses to withdraw or fails to report at the venue.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3 p-6 rounded-2xl bg-zinc-950/80 border border-white/10">
            <h2 className="font-[family-name:var(--font-orbitron)] text-lg text-white font-bold flex items-center gap-2">
              <span className="text-amber-400">02.</span> Event Cancellation by Organizer
            </h2>
            <p>
              In the unlikely event of an unforeseen cancellation or indefinite postponement of the entire symposium by Srinivas University (SUIET) due to force majeure, natural calamity, or unavoidable administrative circumstances:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-zinc-400">
              <li>100% of the registration fee will be refunded back to the original source bank account / UPI ID.</li>
              <li>Refund processing will be initiated within <strong>5–7 business days</strong> of official cancellation announcement.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3 p-6 rounded-2xl bg-zinc-950/80 border border-white/10">
            <h2 className="font-[family-name:var(--font-orbitron)] text-lg text-white font-bold flex items-center gap-2">
              <span className="text-amber-400">03.</span> Duplicate Transactions &amp; Technical Glitches
            </h2>
            <p>
              If an applicant is charged more than once due to a banking network glitch or duplicate checkout submission:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-zinc-400">
              <li>The duplicate amount will be verified against our transaction ledger and refunded in full.</li>
              <li>Please email our helpdesk at <a href="mailto:webflowcommunity@srinivasuniversity.edu.in" className="text-amber-400 underline">webflowcommunity@srinivasuniversity.edu.in</a> with your Cashfree Payment / Order ID and bank statement snippet.</li>
              <li>Authorized duplicate refunds will reflect in your source account within <strong>5–7 business days</strong> via Cashfree Payments.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3 p-6 rounded-2xl bg-zinc-950/80 border border-white/10">
            <h2 className="font-[family-name:var(--font-orbitron)] text-lg text-white font-bold flex items-center gap-2">
              <span className="text-amber-400">04.</span> Team Member Substitutions
            </h2>
            <p>
              If a registered team member is unable to attend due to medical or academic emergencies, teams may request a substitute participant by informing the student coordinators at least <strong>48 hours prior</strong> to the event start date without incurring any fee penalties.
            </p>
          </section>
        </div>

        {/* Navigation Footer */}
        <div className="pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-zinc-500">
          <div>© 2026 Srinivas University (SUIET) • CODEMEET</div>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="hover:text-[#ccff00] transition-colors">Terms &amp; Conditions</Link>
            <Link href="/privacy" className="hover:text-[#ccff00] transition-colors">Privacy Policy</Link>
            <Link href="/contact" className="hover:text-[#ccff00] transition-colors">Contact Us</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
