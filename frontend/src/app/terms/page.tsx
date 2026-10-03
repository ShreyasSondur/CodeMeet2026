"use client";

import Link from "next/link";
import { ArrowLeft, ShieldCheck, FileText, CheckCircle2 } from "lucide-react";
import { soundFX } from "@/lib/audio";

export default function TermsPage() {
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
            <FileText className="w-3.5 h-3.5" />
            <span>LEGAL &amp; ACADEMIC POLICIES</span>
          </div>
          <h1 className="font-[family-name:var(--font-orbitron)] font-black text-3xl sm:text-4xl text-white">
            Terms and Conditions
          </h1>
          <p className="text-zinc-400 font-mono text-xs sm:text-sm">
            Last Updated: October 2026 • Official Terms of Participation for CODEMEET 2026
          </p>
        </div>

        <div className="space-y-8 text-zinc-300 font-mono text-xs sm:text-sm leading-relaxed">
          {/* Section 1 */}
          <section className="space-y-3 p-6 rounded-2xl bg-zinc-950/80 border border-white/10">
            <h2 className="font-[family-name:var(--font-orbitron)] text-lg text-white font-bold flex items-center gap-2">
              <span className="text-[#ccff00]">01.</span> Overview &amp; Eligibility
            </h2>
            <p>
              CODEMEET 2026 is an academic technical symposium, educational workshop, and hackathon series hosted and organized by the <strong>Srinivas University Institute of Engineering and Technology (SUIET)</strong>, Mukka, Mangaluru in collaboration with the Webflow Student Community.
            </p>
            <p>
              By registering for any event or workshop under CODEMEET 2026, you agree to comply with these terms, academic guidelines, venue regulations, and code of conduct set forth by the organizing institution.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3 p-6 rounded-2xl bg-zinc-950/80 border border-white/10">
            <h2 className="font-[family-name:var(--font-orbitron)] text-lg text-white font-bold flex items-center gap-2">
              <span className="text-[#ccff00]">02.</span> Delegate &amp; Participant Registration
            </h2>
            <ul className="list-disc list-inside space-y-2 text-zinc-400">
              <li>All participants must be active students enrolled in a recognized university, college, or polytechnic institution.</li>
              <li>A valid physical college ID card and registration confirmation pass must be produced at the check-in desk upon arrival at SUIET Mukka.</li>
              <li>Team sizes must strictly adhere to the limits declared for each individual event (e.g., 3-4 members for Hackathon, 1 member for Speed Typing).</li>
              <li>Registrations with fraudulent credentials or falsified student details are subject to immediate disqualification without refund.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3 p-6 rounded-2xl bg-zinc-950/80 border border-white/10">
            <h2 className="font-[family-name:var(--font-orbitron)] text-lg text-white font-bold flex items-center gap-2">
              <span className="text-[#ccff00]">03.</span> Code of Conduct &amp; Intellectual Property
            </h2>
            <p>
              Participants are expected to maintain the highest standards of integrity and sportsmanship. Any form of harassment, unauthorized network access, plagiarism, or tampering with university property will result in immediate expulsion and potential academic reporting.
            </p>
            <p>
              All projects, source code, and prototypes developed during CODEMEET 2026 remain the intellectual property of the respective student creators. However, organizers reserve the right to showcase projects for promotional and academic documentation purposes.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3 p-6 rounded-2xl bg-zinc-950/80 border border-white/10">
            <h2 className="font-[family-name:var(--font-orbitron)] text-lg text-white font-bold flex items-center gap-2">
              <span className="text-[#ccff00]">04.</span> Payment &amp; Transaction Terms
            </h2>
            <p>
              All entry fees are billed in Indian National Rupees (INR) and processed securely through RBI-compliant payment gateways (Razorpay). Successful completion of the payment generates an authentic Digital Entry ID and confirmation receipt delivered to registered email addresses.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3 p-6 rounded-2xl bg-zinc-950/80 border border-white/10">
            <h2 className="font-[family-name:var(--font-orbitron)] text-lg text-white font-bold flex items-center gap-2">
              <span className="text-[#ccff00]">05.</span> Jurisdiction &amp; Amendments
            </h2>
            <p>
              These Terms shall be governed by and interpreted in accordance with the laws of India, subject to the jurisdiction of the courts in Mangaluru, Karnataka. SUIET reserves the right to amend these guidelines with reasonable advance notice.
            </p>
          </section>
        </div>

        {/* Navigation Footer */}
        <div className="pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-zinc-500">
          <div>© 2026 Srinivas University (SUIET) • CODEMEET</div>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-[#ccff00] transition-colors">Privacy Policy</Link>
            <Link href="/refund-policy" className="hover:text-[#ccff00] transition-colors">Refund Policy</Link>
            <Link href="/contact" className="hover:text-[#ccff00] transition-colors">Contact Us</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
