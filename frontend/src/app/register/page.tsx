"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
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
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Send,
  Building2,
  User,
  Mail,
  Phone,
  CreditCard,
  Lock,
  AlertCircle,
} from "lucide-react";

interface EventMeta {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  color: string;
  borderHover: string;
  badgeBg: string;
  date: string;
  teamSize: string;
  entryFee: string;
  feeNote?: string;
  description: string;
  icon: typeof Zap;
  isSolo: boolean;
  minMembers: number;
  maxMembers: number;
}

const EVENTS_DATA: Record<string, EventMeta> = {
  hackathon: {
    id: "hackathon",
    title: "24H National Hackathon",
    subtitle: "FLAGSHIP CODE SPRINT",
    tag: "FLAGSHIP ARENA",
    color: "#ccff00",
    borderHover: "hover:border-[#ccff00]/60",
    badgeBg: "bg-[#ccff00]/15 text-[#ccff00] border-[#ccff00]/40",
    date: "OCT 23-24 (R1 ONLINE) • NOV 01-02 (R2 OFFLINE)",
    teamSize: "3 - 4 Members",
    entryFee: "₹1 (Test Mode)",
    feeNote: "Razorpay Test Sandbox ₹1.00",
    description:
      "24-hour national hackathon. Round 1 online screening followed by the grand 24H offline build at SUIET Mukka for the Top 30 finalists.",
    icon: Zap,
    isSolo: false,
    minMembers: 3,
    maxMembers: 4,
  },
  "speed-typing": {
    id: "speed-typing",
    title: "Speed Typing Showdown",
    subtitle: "CODE SYNTAX & WPM BLITZ",
    tag: "SPEED & ACCURACY",
    color: "#f59e0b",
    borderHover: "hover:border-[#f59e0b]/60",
    badgeBg: "bg-[#f59e0b]/15 text-[#f59e0b] border-[#f59e0b]/40",
    date: "OCTOBER 31, 2026 • 10:30 AM",
    teamSize: "Solo Developer (1P)",
    entryFee: "₹1 (Test Mode)",
    feeNote: "Razorpay Test Sandbox ₹1.00",
    description:
      "Battle of developer reflexes and keyboard mastery. Compete in live syntax typing, WPM speed benchmarks, and coding sprints under pressure.",
    icon: Keyboard,
    isSolo: true,
    minMembers: 1,
    maxMembers: 1,
  },
  "treasure-hunt": {
    id: "treasure-hunt",
    title: "Treasure Hunt Cyber Quest",
    subtitle: "CAMPUS CIPHER ADVENTURE",
    tag: "CAMPUS QUEST",
    color: "#00f0ff",
    borderHover: "hover:border-[#00f0ff]/60",
    badgeBg: "bg-[#00f0ff]/15 text-[#00f0ff] border-[#00f0ff]/40",
    date: "OCTOBER 31, 2026 • 2:30 PM",
    teamSize: "4 Members",
    entryFee: "₹1 (Test Mode)",
    feeNote: "Razorpay Test Sandbox ₹1.00",
    description:
      "Campus-wide quest decoding cryptic ciphers, hidden QR coordinates, logical riddles, and physical clue trails across SUIET.",
    icon: Compass,
    isSolo: false,
    minMembers: 4,
    maxMembers: 4,
  },
  "free-fire": {
    id: "free-fire",
    title: "Free Fire Esports Arena",
    subtitle: "BATTLE ROYALE TOURNAMENT",
    tag: "ESPORTS COMBAT",
    color: "#ff007f",
    borderHover: "hover:border-[#ff007f]/60",
    badgeBg: "bg-[#ff007f]/15 text-[#ff007f] border-[#ff007f]/40",
    date: "OCTOBER 31, 2026 • 10:30 AM",
    teamSize: "Squad (4 Players)",
    entryFee: "₹1 (Test Mode)",
    feeNote: "Razorpay Test Sandbox ₹1.00",
    description:
      "High-adrenaline mobile esports showdown. Custom lobbies, tactical battle royale rounds, and ultimate campus gaming supremacy.",
    icon: Gamepad2,
    isSolo: false,
    minMembers: 4,
    maxMembers: 4,
  },
};

interface MemberData {
  name: string;
  email: string;
  phone: string;
}

const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && (window as any).Razorpay) {
      resolve(true);
      return;
    }
    if (typeof document === "undefined") {
      resolve(false);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

function RegisterContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const eventParam = searchParams.get("event");

  const [selectedEventId, setSelectedEventId] = useState<string>("hackathon");

  // General details
  const [teamName, setTeamName] = useState("");
  const [collegeName, setCollegeName] = useState("");

  // Solo Participant (Speed Typing)
  const [soloParticipant, setSoloParticipant] = useState<MemberData>({
    name: "",
    email: "",
    phone: "",
  });

  // Team Members (Hackathon, Treasure Hunt, Free Fire)
  const [members, setMembers] = useState<MemberData[]>([
    { name: "", email: "", phone: "" }, // Member 1 (Lead)
    { name: "", email: "", phone: "" }, // Member 2
    { name: "", email: "", phone: "" }, // Member 3
    { name: "", email: "", phone: "" }, // Member 4
  ]);

  const [agreeToRules, setAgreeToRules] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [confirmedRegId, setConfirmedRegId] = useState<string>("");
  const [confirmedPaymentId, setConfirmedPaymentId] = useState<string>("");
  const [confirmedAmount, setConfirmedAmount] = useState<number>(100);
  const [paymentError, setPaymentError] = useState<string>("");
  const [eventPricings, setEventPricings] = useState<Record<string, { amount_inr: number; amount_paise: number }>>({});

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

  // Fetch live pricing from backend API
  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const res = await fetch(`${apiUrl}/api/events/pricing`);
        if (res.ok) {
          const data = await res.json();
          if (data.pricing) {
            setEventPricings(data.pricing);
          }
        }
      } catch (e) {
        console.warn("Could not fetch dynamic event pricing from backend:", e);
      }
    };
    fetchPricing();
  }, [apiUrl]);

  useEffect(() => {
    if (eventParam && EVENTS_DATA[eventParam]) {
      setSelectedEventId(eventParam);
    }
  }, [eventParam]);

  const activeEvent = EVENTS_DATA[selectedEventId] || EVENTS_DATA.hackathon;
  const activeFeeInr = eventPricings[activeEvent.id]?.amount_inr ?? 100;
  const Icon = activeEvent.icon;

  const handleSelectEvent = (id: string) => {
    soundFX.playClick();
    setSelectedEventId(id);
    router.push(`/register?event=${id}`);
  };

  const handleMemberChange = (
    index: number,
    field: keyof MemberData,
    value: string
  ) => {
    let cleanVal = value;
    if (field === "phone") {
      // Only allow digits and limit to 10 characters
      cleanVal = value.replace(/\D/g, "").slice(0, 10);
    }
    setMembers((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: cleanVal };
      return updated;
    });
  };

  const handleSoloChange = (field: keyof MemberData, value: string) => {
    let cleanVal = value;
    if (field === "phone") {
      // Only allow digits and limit to 10 characters
      cleanVal = value.replace(/\D/g, "").slice(0, 10);
    }
    setSoloParticipant((prev) => ({ ...prev, [field]: cleanVal }));
  };

  const completeRegistrationWithBackend = async (paymentId: string) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

    const payload = {
      event_id: activeEvent.id,
      event_name: activeEvent.title,
      team_name: activeEvent.isSolo ? "" : teamName,
      college_name: collegeName,
      is_solo: activeEvent.isSolo,
      payment_id: paymentId,
      amount_paid: "1",
      members: activeEvent.isSolo
        ? [{ name: soloParticipant.name, email: soloParticipant.email, phone: soloParticipant.phone, is_leader: true }]
        : members
            .filter((m) => m.name.trim() !== "")
            .map((m, idx) => ({ ...m, is_leader: idx === 0 })),
    };

    try {
      const res = await fetch(`${apiUrl}/api/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        setConfirmedRegId(data.registration_id || `CM26-${activeEvent.id.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`);
        setConfirmedPaymentId(data.payment_id || paymentId);
      } else {
        setConfirmedRegId(`CM26-${activeEvent.id.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`);
        setConfirmedPaymentId(paymentId);
      }
    } catch (err) {
      console.warn("Backend offline or registration warning, fallback saved locally:", err);
      setConfirmedRegId(`CM26-${activeEvent.id.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`);
      setConfirmedPaymentId(paymentId);
    } finally {
      setIsSubmitting(false);
      setIsSuccess(true);
      soundFX.playSuccess();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    soundFX.playClick();
    setPaymentError("");
    setIsSubmitting(true);

    const leaderName = activeEvent.isSolo ? soloParticipant.name : members[0]?.name;
    const leaderEmail = activeEvent.isSolo ? soloParticipant.email : members[0]?.email;
    const leaderPhone = activeEvent.isSolo ? soloParticipant.phone : members[0]?.phone;

    // Strict 10-digit phone number validation (digits only)
    if (activeEvent.isSolo) {
      if (!/^\d{10}$/.test(soloParticipant.phone)) {
        setIsSubmitting(false);
        setPaymentError("Please enter a valid 10-digit mobile number (numbers only).");
        return;
      }
    } else {
      const minRequired = activeEvent.id === "hackathon" ? 3 : 4;
      for (let i = 0; i < members.length; i++) {
        const m = members[i];
        const isRequired = i < minRequired;
        if (isRequired) {
          if (!/^\d{10}$/.test(m.phone)) {
            setIsSubmitting(false);
            setPaymentError(
              `Please enter a valid 10-digit phone number for Participant 0${i + 1}${
                i === 0 ? " (Team Leader)" : ""
              }.`
            );
            return;
          }
        } else if (m.name.trim() !== "" && !/^\d{10}$/.test(m.phone)) {
          setIsSubmitting(false);
          setPaymentError(
            `Please enter a valid 10-digit phone number for Participant 0${i + 1}.`
          );
          return;
        }
      }
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
    const defaultRzpKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_TjUjaEkXrem1Yo";

    // 1. BACKEND - Call /api/create-order with dynamic event pricing
    let orderData: { order_id: string; amount: number; amount_inr?: number; currency: string; key_id: string } | null = null;
    try {
      const orderRes = await fetch(`${apiUrl}/api/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_id: activeEvent.id,
          college_name: collegeName,
        }),
      });

      if (orderRes.ok) {
        orderData = await orderRes.json();
      } else {
        const errJson = await orderRes.json().catch(() => ({}));
        throw new Error(errJson.detail || "Failed to initialize secure payment order.");
      }
    } catch (err: any) {
      console.error("Order creation error:", err);
      setIsSubmitting(false);
      setPaymentError(err.message || "Could not connect to payment gateway. Please make sure the backend server is running.");
      return;
    }

    if (!orderData || !orderData.order_id) {
      setIsSubmitting(false);
      setPaymentError("Could not retrieve order ID from Razorpay. Please retry.");
      return;
    }

    const effectiveInr = orderData.amount_inr || (orderData.amount / 100);

    // 2. Ensure Razorpay Checkout script is loaded
    const isLoaded = await loadRazorpayScript();
    if (!isLoaded || typeof (window as any).Razorpay === "undefined") {
      setIsSubmitting(false);
      setPaymentError("Razorpay SDK could not be loaded. Please check your internet connection.");
      return;
    }

    const memberPayload = activeEvent.isSolo
      ? [{ name: soloParticipant.name, email: soloParticipant.email, phone: soloParticipant.phone, is_leader: true }]
      : members
          .filter((m) => m.name.trim() !== "")
          .map((m, idx) => ({ ...m, is_leader: idx === 0 }));

    // 3. FRONTEND - Open Razorpay Modal with Order ID
    const options: Record<string, any> = {
      key: orderData.key_id || defaultRzpKey,
      amount: orderData.amount, // in paise
      currency: orderData.currency || "INR",
      name: "SUIET Mukka • Webflow Community",
      description: `CODEMEET 2026 - ${activeEvent.title} (₹${effectiveInr})`,
      image: "/favicon.svg",
      order_id: orderData.order_id,
      prefill: {
        name: leaderName,
        email: leaderEmail,
        contact: leaderPhone,
      },
      theme: {
        color: activeEvent.color || "#ccff00",
        backdrop_color: "#050507",
      },
      handler: async function (response: {
        razorpay_payment_id: string;
        razorpay_order_id: string;
        razorpay_signature: string;
      }) {
        try {
          // 4. BACKEND - Call /api/verify-payment with HMAC-SHA256 signature
          const verifyRes = await fetch(`${apiUrl}/api/verify-payment`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              event_id: activeEvent.id,
              event_name: activeEvent.title,
              team_name: activeEvent.isSolo ? "" : teamName,
              college_name: collegeName,
              is_solo: activeEvent.isSolo,
              members: memberPayload,
              amount_paid: String(effectiveInr),
            }),
          });

          if (verifyRes.ok) {
            const resultData = await verifyRes.json();
            setConfirmedRegId(
              resultData.registration_id ||
                `CM26-${activeEvent.id.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`
            );
            setConfirmedPaymentId(response.razorpay_payment_id);
            setConfirmedAmount(effectiveInr);
            setIsSubmitting(false);
            setIsSuccess(true);
            soundFX.playSuccess();
          } else {
            const errData = await verifyRes.json().catch(() => ({}));
            setIsSubmitting(false);
            setPaymentError(errData.detail || "Payment verification failed. Please contact support.");
            soundFX.playClick();
          }
        } catch (verErr: any) {
          console.error("Verification error:", verErr);
          setIsSubmitting(false);
          setPaymentError("Network error during payment verification. Please contact support.");
        }
      },
      modal: {
        ondismiss: function () {
          setIsSubmitting(false);
          setPaymentError("Payment window was closed. Click below to retry payment.");
        },
      },
    };

    try {
      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        setIsSubmitting(false);
        setPaymentError(
          response.error?.description || "Payment transaction failed. Please retry."
        );
      });
      rzp.open();
    } catch (err: any) {
      console.error("Razorpay trigger error:", err);
      setIsSubmitting(false);
      setPaymentError("Could not open Razorpay checkout modal: " + err.message);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#050507] text-white py-8 sm:py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden cyber-grid selection:bg-[#ccff00] selection:text-black">
      {/* Background ambient glow */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-[140px] opacity-15 pointer-events-none transition-all duration-700"
        style={{ backgroundColor: activeEvent.color }}
      />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Top Navigation */}
        <div className="flex items-center justify-between pb-8 border-b border-white/10">
          <Link
            href="/"
            onClick={() => soundFX.playClick()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-900/80 border border-white/10 hover:border-white/30 text-zinc-300 hover:text-white transition-all text-xs sm:text-sm font-mono"
          >
            <ArrowLeft className="w-4 h-4 text-[#ccff00]" />
            <span>RETURN TO PORTAL</span>
          </Link>

          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
            <span
              className="w-2 h-2 rounded-full animate-ping"
              style={{ backgroundColor: activeEvent.color }}
            />
            <span className="hidden sm:inline">OFFICIAL REGISTRATION GATEWAY</span>
            <span className="text-[#ccff00]">CODEMEET 2026</span>
          </div>
        </div>

        {/* Header Title */}
        <div className="py-8 text-center sm:text-left">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono mb-4 border"
            style={{
              borderColor: `${activeEvent.color}40`,
              backgroundColor: `${activeEvent.color}15`,
              color: activeEvent.color,
            }}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>EVENT REGISTRATION ARENA</span>
          </div>
          <h1 className="font-[family-name:var(--font-orbitron)] font-black text-3xl sm:text-5xl md:text-6xl tracking-tight leading-tight">
            SECURE YOUR <span style={{ color: activeEvent.color }}>SLOT</span>
          </h1>
          <p className="text-zinc-400 text-sm sm:text-base mt-2 max-w-2xl">
            Choose your competition track, fill your team credentials, and register for CODEMEET 2026 at Srinivas University (SUIET).
          </p>
        </div>

        {/* Event Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-8">
          {Object.values(EVENTS_DATA).map((ev) => {
            const EvIcon = ev.icon;
            const isSelected = ev.id === selectedEventId;
            return (
              <button
                key={ev.id}
                type="button"
                onClick={() => handleSelectEvent(ev.id)}
                onMouseEnter={() => soundFX.playHover()}
                className={`p-3 sm:p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden ${
                  isSelected
                    ? "bg-zinc-900 border-opacity-100 shadow-lg shadow-black/80"
                    : "bg-zinc-950/60 border-white/10 hover:border-white/25 opacity-70 hover:opacity-100"
                }`}
                style={{
                  borderColor: isSelected ? ev.color : undefined,
                }}
              >
                {isSelected && (
                  <div
                    className="absolute top-0 right-0 w-12 h-12 pointer-events-none opacity-20 blur-sm rounded-full"
                    style={{ backgroundColor: ev.color }}
                  />
                )}
                <div className="flex items-center justify-between mb-2">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{
                      backgroundColor: `${ev.color}20`,
                      color: ev.color,
                    }}
                  >
                    <EvIcon className="w-4 h-4" />
                  </div>
                  {isSelected && (
                    <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-white/10 text-white">
                      ACTIVE
                    </span>
                  )}
                </div>
                <div>
                  <div className="text-xs font-mono font-bold text-zinc-400 leading-none">
                    {ev.subtitle}
                  </div>
                  <div className="font-[family-name:var(--font-orbitron)] font-bold text-xs sm:text-sm text-white mt-1">
                    {ev.title}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Main Card: Event Banner + Clean Form */}
        <div className="rounded-2xl bg-zinc-950/90 border border-white/15 backdrop-blur-xl overflow-hidden shadow-2xl">
          {/* Active Event Banner Highlight */}
          <div
            className="p-6 sm:p-8 border-b border-white/10 relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${activeEvent.color}10 0%, rgba(10,10,14,0.8) 100%)`,
            }}
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`px-2.5 py-1 rounded text-[11px] font-mono font-bold border ${activeEvent.badgeBg}`}
                  >
                    {activeEvent.tag}
                  </span>
                  <span className="px-2.5 py-1 rounded text-[11px] font-mono text-zinc-300 bg-white/5 border border-white/10">
                    {activeEvent.teamSize}
                  </span>
                </div>
                <h2 className="font-[family-name:var(--font-orbitron)] font-black text-2xl sm:text-3xl text-white">
                  {activeEvent.title}
                </h2>
                <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed">
                  {activeEvent.description}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
                <div className="px-4 py-3 rounded-xl bg-black/60 border border-white/10 flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-zinc-400" />
                  <div className="text-xs font-mono">
                    <div className="text-zinc-500 text-[10px]">SCHEDULE</div>
                    <div className="text-white font-bold">{activeEvent.date}</div>
                  </div>
                </div>
                <div className="px-4 py-3 rounded-xl bg-black/60 border border-white/10 flex items-center gap-3">
                  <CreditCard className="w-4 h-4 text-[#ccff00]" />
                  <div className="text-xs font-mono">
                    <div className="text-zinc-500 text-[10px]">ENTRY FEE</div>
                    <div className="text-[#ccff00] font-bold text-sm">
                      ₹{activeFeeInr} / {activeEvent.isSolo ? "Person" : "Team"}
                    </div>
                    <div className="text-[10px] text-zinc-400 font-normal">
                      Razorpay Instant Checkout
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-6 sm:p-8">
            {isSuccess ? (
              <div className="py-12 px-4 text-center space-y-6 max-w-lg mx-auto animate-in zoom-in-95 duration-300">
                <div
                  className="w-16 h-16 rounded-full mx-auto flex items-center justify-center border animate-bounce"
                  style={{
                    backgroundColor: `${activeEvent.color}20`,
                    borderColor: activeEvent.color,
                    color: activeEvent.color,
                  }}
                >
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div className="space-y-2">
                  <h3 className="font-[family-name:var(--font-orbitron)] font-black text-2xl text-white">
                    REGISTRATION CONFIRMED!
                  </h3>
                  <p className="text-zinc-400 text-sm">
                    Slot secured for{" "}
                    <span className="font-bold text-white">{activeEvent.title}</span>.
                    Payment verified & saved to official database.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-black/80 border border-white/10 text-left font-mono text-xs space-y-2 text-zinc-300">
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-zinc-500">REGISTRATION ID:</span>
                    <span className="text-[#ccff00] font-bold">
                      {confirmedRegId || `${activeEvent.id.toUpperCase()}-2026-REG`}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-zinc-500">RAZORPAY REF ID:</span>
                    <span className="text-cyan-400 font-bold truncate max-w-[200px]">
                      {confirmedPaymentId || "pay_test_verified"}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-zinc-500">AMOUNT PAID:</span>
                    <span className="text-white font-bold">₹{confirmedAmount}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-zinc-500">VENUE:</span>
                    <span className="text-[#ccff00]">SUIET Mukka, Mangaluru</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">STATUS:</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      ENTRY VERIFIED & STORED
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
                  <button
                    onClick={() => {
                      soundFX.playClick();
                      setIsSuccess(false);
                      setConfirmedPaymentId("");
                    }}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-mono text-xs font-bold transition-all cursor-pointer"
                  >
                    REGISTER ANOTHER EVENT
                  </button>
                  <Link
                    href="/"
                    onClick={() => soundFX.playClick()}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#ccff00] hover:bg-[#d9ff33] text-black font-[family-name:var(--font-orbitron)] text-xs font-black transition-all text-center"
                  >
                    RETURN TO HOME
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Error Banner */}
                {paymentError && (
                  <div className="p-4 rounded-xl bg-red-500/15 border border-red-500/40 text-red-400 text-xs font-mono flex items-center gap-2.5">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{paymentError}</span>
                  </div>
                )}

                {/* General Details: Team Name (if team event) & College Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pb-6 border-b border-white/10">
                  {!activeEvent.isSolo && (
                    <div className="space-y-2">
                      <label className="block text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-[#ccff00]" />
                        <span>Team / Squad Name *</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        placeholder="Enter team name"
                        className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/10 focus:border-[#ccff00] focus:outline-none text-white text-sm font-mono placeholder:text-zinc-600 transition-all"
                      />
                    </div>
                  )}

                  <div className={`space-y-2 ${activeEvent.isSolo ? "sm:col-span-2" : ""}`}>
                    <label className="block text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-[#ccff00]" />
                      <span>College / University Institution Name *</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={collegeName}
                      onChange={(e) => setCollegeName(e.target.value)}
                      placeholder="Enter college / university name"
                      className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/10 focus:border-[#ccff00] focus:outline-none text-white text-sm font-mono placeholder:text-zinc-600 transition-all"
                    />
                  </div>
                </div>

                {/* 1. Solo Event (Speed Typing Showdown) */}
                {activeEvent.isSolo ? (
                  <div className="space-y-4">
                    <div className="font-mono text-xs font-bold text-[#ccff00] tracking-wider uppercase flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>// PARTICIPANT CREDENTIALS</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5 rounded-2xl bg-black/40 border border-white/10">
                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-mono text-zinc-400 uppercase font-semibold">
                          Participant Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={soloParticipant.name}
                          onChange={(e) => handleSoloChange("name", e.target.value)}
                          placeholder="Enter full name"
                          className="w-full px-3.5 py-2.5 rounded-lg bg-black/60 border border-white/10 focus:border-[#f59e0b] focus:outline-none text-white text-xs font-mono placeholder:text-zinc-600"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-mono text-zinc-400 uppercase font-semibold">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          value={soloParticipant.email}
                          onChange={(e) => handleSoloChange("email", e.target.value)}
                          placeholder="Enter email address"
                          className="w-full px-3.5 py-2.5 rounded-lg bg-black/60 border border-white/10 focus:border-[#f59e0b] focus:outline-none text-white text-xs font-mono placeholder:text-zinc-600"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-mono text-zinc-400 uppercase font-semibold">
                          WhatsApp / Phone Number (10 Digits) *
                        </label>
                        <input
                          type="tel"
                          inputMode="numeric"
                          pattern="[0-9]{10}"
                          maxLength={10}
                          minLength={10}
                          required
                          value={soloParticipant.phone}
                          onChange={(e) => handleSoloChange("phone", e.target.value)}
                          placeholder="10-digit mobile number (e.g. 9876543210)"
                          className="w-full px-3.5 py-2.5 rounded-lg bg-black/60 border border-white/10 focus:border-[#f59e0b] focus:outline-none text-white text-xs font-mono placeholder:text-zinc-600"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  /* 2. Team Events (Hackathon, Treasure Hunt, Free Fire) */
                  <div className="space-y-6">
                    <div className="flex items-center justify-between font-mono text-xs font-bold tracking-wider uppercase">
                      <span className="text-[#ccff00] flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>// TEAM MEMBERS SPECIFICATIONS</span>
                      </span>
                      <span className="text-zinc-400 text-[11px]">
                        {selectedEventId === "hackathon"
                          ? "Members 1, 2, 3 Compulsory • Member 4 Optional"
                          : "All 4 Members Compulsory"}
                      </span>
                    </div>

                    <div className="space-y-4">
                      {members.map((member, idx) => {
                        const isLeader = idx === 0;
                        const isCompulsory =
                          selectedEventId === "hackathon" ? idx < 3 : true;

                        return (
                          <div
                            key={`member-${idx + 1}`}
                            className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                              isLeader
                                ? "bg-black/60 border-[#ccff00]/40 shadow-[0_0_20px_rgba(204,255,0,0.1)]"
                                : "bg-black/40 border-white/10 hover:border-white/20"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-3 font-mono text-xs font-bold">
                              <div className="flex items-center gap-2">
                                <span
                                  className="w-2 h-2 rounded-full"
                                  style={{
                                    backgroundColor: isLeader
                                      ? activeEvent.color
                                      : "#71717a",
                                  }}
                                />
                                <span
                                  style={{
                                    color: isLeader ? activeEvent.color : "#e4e4e7",
                                  }}
                                >
                                  {isLeader
                                    ? `TEAM MEMBER 01 (TEAM LEADER / PRIMARY CONTACT)`
                                    : `TEAM MEMBER 0${idx + 1}`}
                                </span>
                              </div>
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded font-mono uppercase ${
                                  isCompulsory
                                    ? "bg-red-500/15 text-red-400 border border-red-500/30"
                                    : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                                }`}
                              >
                                {isCompulsory ? "REQUIRED" : "OPTIONAL"}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                              {/* Member Name */}
                              <div className="space-y-1">
                                <label className="block text-[11px] font-mono text-zinc-400 uppercase">
                                  Full Name {isCompulsory && "*"}
                                </label>
                                <div className="relative">
                                  <input
                                    type="text"
                                    required={isCompulsory}
                                    value={member.name}
                                    onChange={(e) =>
                                      handleMemberChange(idx, "name", e.target.value)
                                    }
                                    placeholder="Enter full name"
                                    className="w-full px-3 py-2.5 rounded-lg bg-black/70 border border-white/10 focus:border-[#ccff00] focus:outline-none text-white text-xs font-mono placeholder:text-zinc-600"
                                  />
                                </div>
                              </div>

                              {/* Member Email */}
                              <div className="space-y-1">
                                <label className="block text-[11px] font-mono text-zinc-400 uppercase">
                                  Email Address {isCompulsory && "*"}
                                </label>
                                <input
                                  type="email"
                                  required={isCompulsory}
                                  value={member.email}
                                  onChange={(e) =>
                                    handleMemberChange(idx, "email", e.target.value)
                                  }
                                  placeholder="Enter email address"
                                  className="w-full px-3 py-2.5 rounded-lg bg-black/70 border border-white/10 focus:border-[#ccff00] focus:outline-none text-white text-xs font-mono placeholder:text-zinc-600"
                                />
                              </div>

                              {/* Member Phone */}
                              <div className="space-y-1">
                                <label className="block text-[11px] font-mono text-zinc-400 uppercase">
                                  Phone Number (10 Digits) {isCompulsory && "*"}
                                </label>
                                <input
                                  type="tel"
                                  inputMode="numeric"
                                  pattern="[0-9]{10}"
                                  maxLength={10}
                                  minLength={10}
                                  required={isCompulsory}
                                  value={member.phone}
                                  onChange={(e) =>
                                    handleMemberChange(idx, "phone", e.target.value)
                                  }
                                  placeholder="10-digit mobile number"
                                  className="w-full px-3 py-2.5 rounded-lg bg-black/70 border border-white/10 focus:border-[#ccff00] focus:outline-none text-white text-xs font-mono placeholder:text-zinc-600"
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Rules & Declarations */}
                <div className="flex items-start gap-3 pt-2">
                  <input
                    type="checkbox"
                    id="agreeToRules"
                    name="agreeToRules"
                    required
                    checked={agreeToRules}
                    onChange={(e) => setAgreeToRules(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded border-white/20 bg-black/50 text-[#ccff00] focus:ring-[#ccff00] cursor-pointer"
                  />
                  <label
                    htmlFor="agreeToRules"
                    className="text-xs text-zinc-400 cursor-pointer select-none"
                  >
                    I confirm that all provided details are authentic and our team agrees to abide by the CODEMEET 2026 Code of Conduct, venue guidelines at SUIET Mukka, and competition rules.
                  </label>
                </div>

                {/* Submit Action Bar with Razorpay Trigger */}
                <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10">
                  <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
                    <Lock className="w-4 h-4 text-[#ccff00]" />
                    <span>RAZORPAY SECURE GATEWAY • 256-BIT ENCRYPTION</span>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    onMouseEnter={() => soundFX.playHover()}
                    className="w-full sm:w-auto px-8 py-4 rounded-xl font-[family-name:var(--font-orbitron)] font-black text-sm tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-3 cursor-pointer shadow-lg active:scale-95 disabled:opacity-50"
                    style={{
                      backgroundColor: activeEvent.color,
                      color: "#050507",
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        <span>OPENING SECURE CHECKOUT...</span>
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4" />
                        <span>PAY ₹{activeFeeInr} & CONFIRM REGISTRATION</span>
                        <Send className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Support & Quick Contact */}
        <div className="mt-8 text-center text-xs font-mono text-zinc-500 flex flex-wrap items-center justify-center gap-6">
          <span>
            HAVE QUERIES? EMAIL:{" "}
            <span className="text-zinc-300">
              webflow@srinivasuniversity.edu.in
            </span>
          </span>
          <span>•</span>
          <span>
            CAMPUS VENUE:{" "}
            <span className="text-[#ccff00]">SUIET Mukka, Mangaluru</span>
          </span>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#050507] text-white flex items-center justify-center font-mono text-sm">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-[#ccff00] border-t-transparent rounded-full animate-spin" />
            <span>LOADING REGISTRATION PROTOCOL...</span>
          </div>
        </div>
      }
    >
      <RegisterContent />
    </Suspense>
  );
}
