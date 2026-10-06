"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { soundFX } from "@/lib/audio";
import {
  Terminal,
  Lock,
  Unlock,
  KeyRound,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Zap,
  Keyboard,
  Compass,
  Gamepad2,
  Users,
  UserPlus,
  Download,
  Search,
  RefreshCw,
  Trash2,
  Eye,
  X,
  CheckCircle2,
  AlertCircle,
  Building2,
  Mail,
  Phone,
  Calendar,
  Layers,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
  Send,
  Timer,
  UploadCloud,
  FileText,
  CreditCard,
  Sparkles,
  ExternalLink,
  FileCheck,
  SlidersHorizontal,
  Save,
} from "lucide-react";

interface Member {
  name: string;
  email: string;
  phone: string;
  is_leader?: boolean;
}

interface Registration {
  id: string;
  event_id: string;
  event_name: string;
  team_name: string;
  college_name: string;
  leader_name: string;
  leader_email: string;
  leader_phone: string;
  members: Member[];
  is_solo: boolean;
  total_members: number;
  payment_status: string;
  payment_id?: string;
  amount_paid?: string;
  created_at: string;
}

interface StatsData {
  total: number;
  by_event: {
    hackathon: number;
    "speed-typing": number;
    "treasure-hunt": number;
    "free-fire": number;
  };
}

interface EventPricing {
  event_id: string;
  event_name: string;
  amount_inr: number;
  amount_paise: number;
  currency: string;
  updated_at: string;
}

interface RulebookMeta {
  exists: boolean;
  filename: string;
  saved_filename?: string;
  size_bytes: number;
  size_formatted: string;
  updated_at: string | null;
  is_default: boolean;
}

const EVENT_CONFIGS: Record<string, { name: string; tag: string; color: string; icon: any; isSolo: boolean; min: number; max: number }> = {
  hackathon: {
    name: "24H National Hackathon",
    tag: "FLAGSHIP ARENA",
    color: "#ccff00",
    icon: Zap,
    isSolo: false,
    min: 3,
    max: 4,
  },
  "speed-typing": {
    name: "Speed Typing Showdown",
    tag: "SPEED & ACCURACY",
    color: "#f59e0b",
    icon: Keyboard,
    isSolo: true,
    min: 1,
    max: 1,
  },
  "treasure-hunt": {
    name: "Treasure Hunt Cyber Quest",
    tag: "CAMPUS QUEST",
    color: "#00f0ff",
    icon: Compass,
    isSolo: false,
    min: 4,
    max: 4,
  },
  "free-fire": {
    name: "Free Fire Esports Arena",
    tag: "ESPORTS COMBAT",
    color: "#ff007f",
    icon: Gamepad2,
    isSolo: false,
    min: 4,
    max: 4,
  },
};

export default function AdminPage() {
  // 2FA Flow States: 'password' | 'otp' | 'authenticated'
  const [authStep, setAuthStep] = useState<"password" | "otp" | "authenticated">("password");
  const [password, setPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [authError, setAuthError] = useState("");
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);
  const [countdown, setCountdown] = useState(300);

  // Navigation Tabs: 'registrations' | 'pricing' | 'rulebook'
  const [adminTab, setAdminTab] = useState<"registrations" | "pricing" | "rulebook">("registrations");

  const [stats, setStats] = useState<StatsData>({
    total: 0,
    by_event: { hackathon: 0, "speed-typing": 0, "treasure-hunt": 0, "free-fire": 0 },
  });
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Dynamic Event Pricing States
  const [eventPricings, setEventPricings] = useState<Record<string, EventPricing>>({});
  const [inputPrices, setInputPrices] = useState<Record<string, string>>({});
  const [isSavingPrice, setIsSavingPrice] = useState<Record<string, boolean>>({});
  const [priceNotice, setPriceNotice] = useState<Record<string, string>>({});

  // Rulebook Management States
  const [rulebookMeta, setRulebookMeta] = useState<RulebookMeta>({
    exists: false,
    filename: "CODEMEET_2026_Official_Rulebook.pdf",
    size_bytes: 0,
    size_formatted: "0 KB",
    updated_at: null,
    is_default: true,
  });
  const [selectedRulebookFile, setSelectedRulebookFile] = useState<File | null>(null);
  const [isUploadingRulebook, setIsUploadingRulebook] = useState(false);
  const [isDeletingRulebook, setIsDeletingRulebook] = useState(false);
  const [rulebookNotice, setRulebookNotice] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedRegDetails, setSelectedRegDetails] = useState<Registration | null>(null);
  const [deleteCandidateId, setDeleteCandidateId] = useState<string | null>(null);

  // New Participant Form
  const [newEventId, setNewEventId] = useState<string>("hackathon");
  const [newTeamName, setNewTeamName] = useState("");
  const [newCollegeName, setNewCollegeName] = useState("");
  const [newMembers, setNewMembers] = useState<Member[]>([
    { name: "", email: "", phone: "", is_leader: true },
    { name: "", email: "", phone: "", is_leader: false },
    { name: "", email: "", phone: "", is_leader: false },
    { name: "", email: "", phone: "", is_leader: false },
  ]);
  const [isSubmittingNew, setIsSubmittingNew] = useState(false);
  const [addSuccessMsg, setAddSuccessMsg] = useState("");

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

  const getAdminToken = (): string => {
    if (typeof window === "undefined") return "";
    return (
      localStorage.getItem("codemeet_admin_session_token") ||
      sessionStorage.getItem("codemeet_admin_session_token") ||
      ""
    );
  };

  const saveAdminToken = (token: string) => {
    try {
      localStorage.setItem("codemeet_admin_session_token", token);
      sessionStorage.setItem("codemeet_admin_session_token", token);
    } catch {
      // ignore
    }
  };

  const clearAdminToken = () => {
    try {
      localStorage.removeItem("codemeet_admin_session_token");
      sessionStorage.removeItem("codemeet_admin_session_token");
    } catch {
      // ignore
    }
  };

  const handleUnauthorized = () => {
    clearAdminToken();
    setAuthStep("password");
    setAuthError("Your admin session has expired. Please enter your Security Key & OTP to log in.");
    soundFX.playClick();
  };

  // Check saved session on mount
  useEffect(() => {
    const savedToken = getAdminToken();
    if (savedToken && savedToken.startsWith("cm26_sec_")) {
      setAuthStep("authenticated");
      fetchStats(savedToken);
      fetchRegistrations("all", savedToken);
      fetchPricingData();
      fetchRulebookMeta();
    }
  }, []);

  // OTP Countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (authStep === "otp" && countdown > 0) {
      timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [authStep, countdown]);

  const getAuthHeaders = (overrideToken?: string) => ({
    "Content-Type": "application/json",
    "x-admin-token": overrideToken || getAdminToken(),
  });

  // Step 1: Request OTP
  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    soundFX.playClick();
    setAuthError("");
    setIsLoadingAuth(true);

    try {
      const res = await fetch(`${apiUrl}/api/admin/request-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: password.trim() }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setMaskedEmail(data.masked_email || "your registered admin email");
        setAuthStep("otp");
        setCountdown(300);
        soundFX.playSuccess();
      } else {
        setAuthError(data.detail || "Access Denied: Invalid Security Key");
        soundFX.playClick();
      }
    } catch (err) {
      setAuthError("Failed to connect to backend authentication server. Make sure backend is running.");
    } finally {
      setIsLoadingAuth(false);
    }
  };

  // Step 2: Verify 6-digit OTP
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    soundFX.playClick();
    setAuthError("");
    setIsLoadingAuth(true);

    try {
      const res = await fetch(`${apiUrl}/api/admin/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: password.trim(),
          otp: otpCode.trim(),
        }),
      });

      const data = await res.json();

      if (res.ok && data.token) {
        saveAdminToken(data.token);
        setAuthStep("authenticated");
        soundFX.playSuccess();
        fetchStats(data.token);
        fetchRegistrations("all", data.token);
        fetchPricingData();
        fetchRulebookMeta();
      } else {
        setAuthError(data.detail || "Invalid or Expired OTP code. Please retry.");
        soundFX.playClick();
      }
    } catch (err) {
      setAuthError("Error verifying OTP with security server.");
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const handleLogout = () => {
    soundFX.playClick();
    fetch(`${apiUrl}/api/admin/logout`, {
      method: "POST",
      headers: getAuthHeaders(),
    }).catch(() => {});
    clearAdminToken();
    setAuthStep("password");
    setPassword("");
    setOtpCode("");
  };

  const fetchStats = async (tokenOverride?: string) => {
    try {
      const res = await fetch(`${apiUrl}/api/admin/stats`, {
        headers: getAuthHeaders(tokenOverride),
      });
      if (res.status === 401) {
        handleUnauthorized();
        return;
      }
      if (res.ok) {
        const data = await res.json();
        if (data.stats) setStats(data.stats);
      }
    } catch (e) {
      console.warn("Could not fetch stats:", e);
    }
  };

  const fetchRegistrations = async (eventId?: string, tokenOverride?: string) => {
    setIsLoadingData(true);
    const targetEvent = eventId !== undefined ? eventId : selectedEvent;
    try {
      const url =
        targetEvent && targetEvent !== "all"
          ? `${apiUrl}/api/admin/registrations?event_id=${targetEvent}`
          : `${apiUrl}/api/admin/registrations`;

      const res = await fetch(url, { headers: getAuthHeaders(tokenOverride) });
      if (res.status === 401) {
        handleUnauthorized();
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setRegistrations(data.registrations || []);
      }
    } catch (e) {
      console.warn("Could not fetch registrations:", e);
    } finally {
      setIsLoadingData(false);
    }
  };

  // Pricing API Fetcher
  const fetchPricingData = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/events/pricing`);
      if (res.ok) {
        const data = await res.json();
        if (data.pricing) {
          setEventPricings(data.pricing);
          const initialInputs: Record<string, string> = {};
          Object.entries(data.pricing).forEach(([k, v]: [string, any]) => {
            initialInputs[k] = String(v.amount_inr);
          });
          setInputPrices(initialInputs);
        }
      }
    } catch (err) {
      console.warn("Failed to fetch event pricing:", err);
    }
  };

  // Update Event Fee in Backend
  const handleUpdatePrice = async (eventId: string) => {
    soundFX.playClick();
    const rawVal = inputPrices[eventId];
    const amountInr = parseFloat(rawVal);

    if (isNaN(amountInr) || amountInr < 1.0) {
      setPriceNotice((prev) => ({ ...prev, [eventId]: "Error: Amount must be at least ₹1.00" }));
      setTimeout(() => setPriceNotice((prev) => ({ ...prev, [eventId]: "" })), 3500);
      return;
    }

    setIsSavingPrice((prev) => ({ ...prev, [eventId]: true }));
    setPriceNotice((prev) => ({ ...prev, [eventId]: "" }));

    try {
      const res = await fetch(`${apiUrl}/api/admin/events/pricing`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          event_id: eventId,
          amount_inr: amountInr,
        }),
      });

      const data = await res.json();
      if (res.status === 401) {
        handleUnauthorized();
        return;
      }
      if (res.ok && data.success) {
        soundFX.playSuccess();
        setEventPricings((prev) => ({ ...prev, [eventId]: data.pricing }));
        setPriceNotice((prev) => ({
          ...prev,
          [eventId]: `Success! Fee updated to ₹${amountInr.toFixed(2)} & synced with Cashfree PG gateway.`,
        }));
        setTimeout(() => setPriceNotice((prev) => ({ ...prev, [eventId]: "" })), 4000);
      } else {
        setPriceNotice((prev) => ({ ...prev, [eventId]: data.detail || "Failed to update price" }));
      }
    } catch (err) {
      setPriceNotice((prev) => ({ ...prev, [eventId]: "Network error connecting to pricing API." }));
    } finally {
      setIsSavingPrice((prev) => ({ ...prev, [eventId]: false }));
    }
  };

  // Rulebook Info Fetcher
  const fetchRulebookMeta = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/rulebook/info`);
      if (res.ok) {
        const data = await res.json();
        setRulebookMeta(data);
      }
    } catch (err) {
      console.warn("Failed to fetch rulebook info:", err);
    }
  };

  // Upload Rulebook
  const handleUploadRulebook = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedRulebookFile) {
      setRulebookNotice("Please select a file to upload.");
      return;
    }

    soundFX.playClick();
    setIsUploadingRulebook(true);
    setRulebookNotice("");

    const formData = new FormData();
    formData.append("file", selectedRulebookFile);

    const token = sessionStorage.getItem("codemeet_admin_session_token") || "";

    try {
      const res = await fetch(`${apiUrl}/api/admin/rulebook/upload`, {
        method: "POST",
        headers: {
          "x-admin-token": token,
        },
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        soundFX.playSuccess();
        setRulebookMeta(data.meta);
        setSelectedRulebookFile(null);
        setRulebookNotice(`Rulebook '${data.meta.filename}' uploaded and active for all site visitors!`);
        setTimeout(() => setRulebookNotice(""), 5000);
      } else {
        setRulebookNotice(data.detail || "Failed to upload rulebook.");
      }
    } catch (err) {
      setRulebookNotice("Upload failed. Make sure backend is running.");
    } finally {
      setIsUploadingRulebook(false);
    }
  };

  // Delete Rulebook (Revert to Default)
  const handleDeleteRulebook = async () => {
    if (!confirm("Are you sure you want to delete the active custom rulebook and revert to default?")) return;

    soundFX.playClick();
    setIsDeletingRulebook(true);
    setRulebookNotice("");

    try {
      const res = await fetch(`${apiUrl}/api/admin/rulebook`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        soundFX.playSuccess();
        setRulebookMeta(data.meta);
        setRulebookNotice("Custom rulebook removed. Reverted to default.");
        setTimeout(() => setRulebookNotice(""), 4000);
      } else {
        setRulebookNotice(data.detail || "Failed to delete rulebook.");
      }
    } catch (err) {
      setRulebookNotice("Error deleting rulebook.");
    } finally {
      setIsDeletingRulebook(false);
    }
  };

  const handleSelectEventTab = (evId: string) => {
    soundFX.playClick();
    setSelectedEvent(evId);
    fetchRegistrations(evId);
  };

  const handleExportExcel = () => {
    soundFX.playClick();
    const token = sessionStorage.getItem("codemeet_admin_session_token") || "";
    const eventParam = selectedEvent !== "all" ? `?event_id=${selectedEvent}` : "";
    
    fetch(`${apiUrl}/api/admin/export/excel${eventParam}`, {
      headers: { "x-admin-token": token },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Export failed");
        return res.blob();
      })
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `codemeet2026_registrations_${selectedEvent}.xlsx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        soundFX.playSuccess();
      })
      .catch((err) => {
        console.error("Export error:", err);
        alert("Failed to export Excel file. Ensure backend is running.");
      });
  };

  const handleDeleteRegistration = async (regId: string) => {
    soundFX.playClick();
    try {
      const res = await fetch(`${apiUrl}/api/admin/registrations/${regId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (res.status === 401) {
        handleUnauthorized();
        return;
      }
      if (res.ok) {
        soundFX.playSuccess();
        setRegistrations((prev) => prev.filter((r) => r.id !== regId));
        setDeleteCandidateId(null);
        fetchStats();
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const handleAddMemberChange = (idx: number, field: keyof Member, val: string) => {
    let cleanVal = val;
    if (field === "phone") {
      cleanVal = val.replace(/\D/g, "").slice(0, 10);
    }
    setNewMembers((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: cleanVal };
      return copy;
    });
  };

  const handleCreateRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    soundFX.playClick();
    setIsSubmittingNew(true);
    setAddSuccessMsg("");

    const config = EVENT_CONFIGS[newEventId];
    const isSolo = config.isSolo;

    const validMembers = isSolo
      ? [{ ...newMembers[0], is_leader: true }]
      : newMembers.filter((m) => m.name.trim() !== "");

    // Validate 10-digit phone numbers (numbers only)
    for (let i = 0; i < validMembers.length; i++) {
      const m = validMembers[i];
      if (!/^\d{10}$/.test(m.phone)) {
        setIsSubmittingNew(false);
        setAddSuccessMsg(`Participant 0${i + 1} phone number must be exactly 10 digits.`);
        return;
      }
    }

    const payload = {
      event_id: newEventId,
      event_name: config.name,
      team_name: isSolo ? "" : newTeamName,
      college_name: newCollegeName,
      is_solo: isSolo,
      members: validMembers,
      payment_id: "ADMIN_MANUAL",
      amount_paid: "1",
    };

    try {
      const res = await fetch(`${apiUrl}/api/admin/registrations`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (res.status === 401) {
        handleUnauthorized();
        setIsAddModalOpen(false);
        return;
      }

      if (res.ok) {
        soundFX.playSuccess();
        setAddSuccessMsg("Registration successfully created! Confirmation emails sent to all team members.");
        setTimeout(() => {
          setIsAddModalOpen(false);
          setAddSuccessMsg("");
          // Reset form
          setNewTeamName("");
          setNewCollegeName("");
          setNewMembers([
            { name: "", email: "", phone: "", is_leader: true },
            { name: "", email: "", phone: "", is_leader: false },
            { name: "", email: "", phone: "", is_leader: false },
            { name: "", email: "", phone: "", is_leader: false },
          ]);
          fetchStats();
          fetchRegistrations(selectedEvent);
        }, 1000);
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.detail || "Failed to add participant. Please verify fields.");
      }
    } catch (err) {
      console.error("Add error:", err);
      alert("Error adding participant. Ensure backend is running.");
    } finally {
      setIsSubmittingNew(false);
    }
  };

  // Filtered registrations
  const filteredRegistrations = useMemo(() => {
    if (!searchQuery.trim()) return registrations;
    const q = searchQuery.toLowerCase().trim();
    return registrations.filter((r) => {
      return (
        r.id.toLowerCase().includes(q) ||
        r.team_name.toLowerCase().includes(q) ||
        r.college_name.toLowerCase().includes(q) ||
        r.leader_name.toLowerCase().includes(q) ||
        r.leader_email.toLowerCase().includes(q) ||
        r.leader_phone.toLowerCase().includes(q) ||
        (r.payment_id && r.payment_id.toLowerCase().includes(q)) ||
        r.members.some((m) => m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q))
      );
    });
  }, [registrations, searchQuery]);

  // Stage 1 & 2: 2FA Authentication Screens
  if (authStep === "password" || authStep === "otp") {
    return (
      <div className="min-h-screen w-full bg-[#050507] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden cyber-grid selection:bg-[#ccff00] selection:text-black">
        {/* Glow Blob */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#ccff00]/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="relative z-10 w-full max-w-md bg-black/85 border border-white/15 rounded-3xl p-8 shadow-[0_0_50px_rgba(0,0,0,0.95)] backdrop-blur-2xl">
          {authStep === "password" ? (
            /* STEP 1: PASSWORD */
            <div className="space-y-6">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-[#ccff00]/15 border border-[#ccff00]/40 flex items-center justify-center text-[#ccff00] shadow-[0_0_25px_rgba(204,255,0,0.3)]">
                  <KeyRound className="w-8 h-8" />
                </div>

                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-zinc-400 mb-2">
                    <Terminal className="w-3 h-3 text-[#ccff00]" />
                    <span>RESTRICTED ACCESS PORTAL</span>
                  </div>
                  <h1 className="font-[family-name:var(--font-orbitron)] font-black text-2xl tracking-tight text-white">
                    ADMIN <span className="text-[#ccff00]">CONSOLE</span>
                  </h1>
                  <p className="text-xs text-zinc-400 font-mono mt-1">
                    Step 1 of 2: Enter Master Security Key to generate OTP
                  </p>
                </div>
              </div>

              <form onSubmit={handleRequestOTP} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-zinc-300 font-bold mb-1.5 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-[#ccff00]" />
                    <span>Master Security Key</span>
                  </label>
                  <input
                    type="password"
                    required
                    autoFocus
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter security key..."
                    className="w-full px-4 py-3 rounded-xl bg-black/90 border border-white/15 focus:border-[#ccff00] focus:ring-1 focus:ring-[#ccff00] text-sm text-white font-mono placeholder:text-zinc-600 outline-none transition-all tracking-wider"
                  />
                </div>

                {authError && (
                  <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    <span>{authError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoadingAuth}
                  onMouseEnter={() => soundFX.playHover()}
                  className="w-full py-3.5 rounded-xl bg-[#ccff00] hover:bg-[#d9ff33] active:scale-[0.98] text-black font-[family-name:var(--font-orbitron)] font-black text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(204,255,0,0.3)] transition-all cursor-pointer disabled:opacity-50"
                >
                  {isLoadingAuth ? (
                    <span className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      GENERATING 2FA OTP...
                    </span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>REQUEST 2FA OTP CODE</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : (
            /* STEP 2: 2FA OTP CODE */
            <div className="space-y-6 animate-in zoom-in-95 duration-200">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-cyan-500/15 border border-cyan-400/40 flex items-center justify-center text-cyan-400 shadow-[0_0_25px_rgba(0,240,255,0.3)]">
                  <ShieldCheck className="w-8 h-8" />
                </div>

                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-[10px] font-mono text-cyan-300 mb-2">
                    <Shield className="w-3 h-3 text-cyan-400" />
                    <span>2FA VERIFICATION CODE SENT</span>
                  </div>
                  <h1 className="font-[family-name:var(--font-orbitron)] font-black text-2xl tracking-tight text-white">
                    ENTER <span className="text-cyan-400">OTP</span>
                  </h1>
                  <p className="text-xs text-zinc-400 font-mono mt-1">
                    6-digit security code sent to <strong className="text-white">{maskedEmail}</strong>
                  </p>
                </div>
              </div>

              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[11px] font-mono uppercase text-zinc-300 font-bold">
                      6-Digit Security OTP
                    </label>
                    <div className="flex items-center gap-1 text-[11px] font-mono text-amber-400">
                      <Timer className="w-3 h-3" />
                      <span>{Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, "0")}</span>
                    </div>
                  </div>

                  <input
                    type="text"
                    required
                    maxLength={6}
                    autoFocus
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="• • • • • •"
                    className="w-full px-4 py-3 rounded-xl bg-black/90 border border-cyan-400/40 focus:border-[#ccff00] focus:ring-1 focus:ring-[#ccff00] text-center text-2xl font-mono tracking-[0.5em] text-[#ccff00] placeholder:text-zinc-700 outline-none transition-all font-black"
                  />
                </div>

                {authError && (
                  <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    <span>{authError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoadingAuth || otpCode.length < 6}
                  onMouseEnter={() => soundFX.playHover()}
                  className="w-full py-3.5 rounded-xl bg-[#ccff00] hover:bg-[#d9ff33] active:scale-[0.98] text-black font-[family-name:var(--font-orbitron)] font-black text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(204,255,0,0.3)] transition-all cursor-pointer disabled:opacity-50"
                >
                  {isLoadingAuth ? (
                    <span className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      VERIFYING SECURITY TOKEN...
                    </span>
                  ) : (
                    <>
                      <Unlock className="w-4 h-4" />
                      <span>VERIFY & ENTER PORTAL</span>
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between text-xs font-mono pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthStep("password");
                      setOtpCode("");
                      setAuthError("");
                    }}
                    className="text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    ← Back to Security Key
                  </button>

                  <button
                    type="button"
                    onClick={handleRequestOTP}
                    className="text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    Resend OTP
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-zinc-500">
            <Link
              href="/"
              onClick={() => soundFX.playClick()}
              className="hover:text-zinc-300 flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Site</span>
            </Link>
            <span>CODEMEET 2026</span>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated Admin Dashboard
  return (
    <div className="min-h-screen w-full bg-[#050507] text-white py-8 px-4 sm:px-6 lg:px-10 relative overflow-hidden cyber-grid selection:bg-[#ccff00] selection:text-black">
      {/* Glow Blobs */}
      <div className="absolute top-20 right-10 w-96 h-96 bg-[#ccff00]/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-cyan-500/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#ccff00]/20 border border-[#ccff00]/50 flex items-center justify-center text-[#ccff00]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-[family-name:var(--font-orbitron)] font-black text-xl sm:text-2xl text-white">
                  CODEMEET <span className="text-[#ccff00]">ADMIN</span>
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  2FA SECURE SESSION
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-mono">
                Registrations Portal • SUIET Mukka 2026
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => {
                soundFX.playClick();
                fetchStats();
                fetchRegistrations(selectedEvent);
              }}
              onMouseEnter={() => soundFX.playHover()}
              className="px-3.5 py-2 rounded-xl bg-zinc-900 border border-white/10 hover:border-white/25 text-xs font-mono text-zinc-300 hover:text-white flex items-center gap-2 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingData ? "animate-spin text-[#ccff00]" : ""}`} />
              <span>Refresh</span>
            </button>

            <button
              onClick={() => {
                soundFX.playClick();
                setIsAddModalOpen(true);
              }}
              onMouseEnter={() => soundFX.playHover()}
              className="px-4 py-2 rounded-xl bg-[#ccff00] hover:bg-[#d9ff33] text-black font-[family-name:var(--font-orbitron)] font-black text-xs tracking-wider uppercase flex items-center gap-2 shadow-[0_0_15px_rgba(204,255,0,0.3)] transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Add Participant / Team</span>
            </button>

            <button
              onClick={handleExportExcel}
              onMouseEnter={() => soundFX.playHover()}
              className="px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-mono text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Export Excel (.xlsx)</span>
            </button>

            <button
              onClick={handleLogout}
              onMouseEnter={() => soundFX.playHover()}
              className="px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-mono transition-all cursor-pointer"
            >
              Logout Session
            </button>
          </div>
        </div>

        {/* Navigation Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-4 overflow-x-auto scrollbar-none">
          <button
            onClick={() => {
              soundFX.playClick();
              setAdminTab("registrations");
            }}
            className={`px-5 py-2.5 rounded-xl font-[family-name:var(--font-orbitron)] font-bold text-xs tracking-wider uppercase transition-all flex items-center gap-2.5 shrink-0 cursor-pointer ${
              adminTab === "registrations"
                ? "bg-[#ccff00] text-black shadow-[0_0_20px_rgba(204,255,0,0.3)]"
                : "bg-zinc-900 text-zinc-400 hover:text-white border border-white/10"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>01. REGISTRATIONS & DATABASE</span>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${adminTab === "registrations" ? "bg-black/20 text-black" : "bg-white/10 text-zinc-300"}`}>
              {stats.total}
            </span>
          </button>

          <button
            onClick={() => {
              soundFX.playClick();
              setAdminTab("pricing");
              fetchPricingData();
            }}
            className={`px-5 py-2.5 rounded-xl font-[family-name:var(--font-orbitron)] font-bold text-xs tracking-wider uppercase transition-all flex items-center gap-2.5 shrink-0 cursor-pointer ${
              adminTab === "pricing"
                ? "bg-[#ccff00] text-black shadow-[0_0_20px_rgba(204,255,0,0.3)]"
                : "bg-zinc-900 text-zinc-400 hover:text-white border border-white/10"
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>02. EVENT PRICING SETTINGS</span>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${adminTab === "pricing" ? "bg-black/20 text-black" : "bg-white/10 text-zinc-300"}`}>
              CASHFREE SYNC
            </span>
          </button>

          <button
            onClick={() => {
              soundFX.playClick();
              setAdminTab("rulebook");
              fetchRulebookMeta();
            }}
            className={`px-5 py-2.5 rounded-xl font-[family-name:var(--font-orbitron)] font-bold text-xs tracking-wider uppercase transition-all flex items-center gap-2.5 shrink-0 cursor-pointer ${
              adminTab === "rulebook"
                ? "bg-[#ccff00] text-black shadow-[0_0_20px_rgba(204,255,0,0.3)]"
                : "bg-zinc-900 text-zinc-400 hover:text-white border border-white/10"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>03. RULEBOOK MANAGER</span>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${rulebookMeta.exists ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40" : "bg-white/10 text-zinc-300"}`}>
              {rulebookMeta.exists ? "CUSTOM PDF ACTIVE" : "DEFAULT"}
            </span>
          </button>
        </div>

        {/* ======================================================== */}
        {/* TAB 1: REGISTRATIONS & STATS                             */}
        {/* ======================================================== */}
        {adminTab === "registrations" && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Metric Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
              {/* Total */}
              <div
                onClick={() => handleSelectEventTab("all")}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  selectedEvent === "all"
                    ? "bg-zinc-900 border-[#ccff00] shadow-[0_0_20px_rgba(204,255,0,0.2)]"
                    : "bg-black/60 border-white/10 hover:border-white/20"
                }`}
              >
                <div className="flex items-center justify-between text-zinc-400 mb-2">
                  <span className="text-[11px] font-mono uppercase font-bold">Total Entries</span>
                  <Layers className="w-4 h-4 text-[#ccff00]" />
                </div>
                <div className="font-[family-name:var(--font-orbitron)] font-black text-2xl sm:text-3xl text-white">
                  {stats.total}
                </div>
                <div className="text-[10px] font-mono text-zinc-500 mt-1">Across all tracks</div>
              </div>

              {/* Hackathon */}
              <div
                onClick={() => handleSelectEventTab("hackathon")}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  selectedEvent === "hackathon"
                    ? "bg-zinc-900 border-[#ccff00] shadow-[0_0_20px_rgba(204,255,0,0.2)]"
                    : "bg-black/60 border-white/10 hover:border-white/20"
                }`}
              >
                <div className="flex items-center justify-between text-zinc-400 mb-2">
                  <span className="text-[11px] font-mono uppercase font-bold">Hackathon</span>
                  <Zap className="w-4 h-4 text-[#ccff00]" />
                </div>
                <div className="font-[family-name:var(--font-orbitron)] font-black text-2xl sm:text-3xl text-[#ccff00]">
                  {stats.by_event.hackathon || 0}
                </div>
                <div className="text-[10px] font-mono text-zinc-500 mt-1">Teams registered</div>
              </div>

              {/* Speed Typing */}
              <div
                onClick={() => handleSelectEventTab("speed-typing")}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  selectedEvent === "speed-typing"
                    ? "bg-zinc-900 border-[#f59e0b] shadow-[0_0_20px_rgba(245,158,11,0.2)]"
                    : "bg-black/60 border-white/10 hover:border-white/20"
                }`}
              >
                <div className="flex items-center justify-between text-zinc-400 mb-2">
                  <span className="text-[11px] font-mono uppercase font-bold">Speed Typing</span>
                  <Keyboard className="w-4 h-4 text-[#f59e0b]" />
                </div>
                <div className="font-[family-name:var(--font-orbitron)] font-black text-2xl sm:text-3xl text-[#f59e0b]">
                  {stats.by_event["speed-typing"] || 0}
                </div>
                <div className="text-[10px] font-mono text-zinc-500 mt-1">Solo contestants</div>
              </div>

              {/* Treasure Hunt */}
              <div
                onClick={() => handleSelectEventTab("treasure-hunt")}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  selectedEvent === "treasure-hunt"
                    ? "bg-zinc-900 border-[#00f0ff] shadow-[0_0_20px_rgba(0,240,255,0.2)]"
                    : "bg-black/60 border-white/10 hover:border-white/20"
                }`}
              >
                <div className="flex items-center justify-between text-zinc-400 mb-2">
                  <span className="text-[11px] font-mono uppercase font-bold">Treasure Hunt</span>
                  <Compass className="w-4 h-4 text-[#00f0ff]" />
                </div>
                <div className="font-[family-name:var(--font-orbitron)] font-black text-2xl sm:text-3xl text-[#00f0ff]">
                  {stats.by_event["treasure-hunt"] || 0}
                </div>
                <div className="text-[10px] font-mono text-zinc-500 mt-1">Squads registered</div>
              </div>

              {/* Free Fire */}
              <div
                onClick={() => handleSelectEventTab("free-fire")}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  selectedEvent === "free-fire"
                    ? "bg-zinc-900 border-[#ff007f] shadow-[0_0_20px_rgba(255,0,127,0.2)]"
                    : "bg-black/60 border-white/10 hover:border-white/20"
                }`}
              >
                <div className="flex items-center justify-between text-zinc-400 mb-2">
                  <span className="text-[11px] font-mono uppercase font-bold">Free Fire</span>
                  <Gamepad2 className="w-4 h-4 text-[#ff007f]" />
                </div>
                <div className="font-[family-name:var(--font-orbitron)] font-black text-2xl sm:text-3xl text-[#ff007f]">
                  {stats.by_event["free-fire"] || 0}
                </div>
                <div className="text-[10px] font-mono text-zinc-500 mt-1">Esports squads</div>
              </div>
            </div>

            {/* Filter Tabs + Search Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
                <button
                  onClick={() => handleSelectEventTab("all")}
                  className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all shrink-0 cursor-pointer ${
                    selectedEvent === "all"
                      ? "bg-[#ccff00] text-black shadow-[0_0_15px_rgba(204,255,0,0.3)]"
                      : "bg-zinc-900 text-zinc-400 hover:text-white border border-white/10"
                  }`}
                >
                  ALL EVENTS ({stats.total})
                </button>
                {Object.entries(EVENT_CONFIGS).map(([key, cfg]) => {
                  const count = stats.by_event[key as keyof typeof stats.by_event] || 0;
                  const isSelected = selectedEvent === key;
                  return (
                    <button
                      key={key}
                      onClick={() => handleSelectEventTab(key)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? "text-black shadow-lg"
                          : "bg-zinc-900 text-zinc-400 hover:text-white border border-white/10"
                      }`}
                      style={{
                        backgroundColor: isSelected ? cfg.color : undefined,
                      }}
                    >
                      <span>{cfg.name}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded ${isSelected ? "bg-black/20 text-black" : "bg-white/10 text-zinc-300"}`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Search Box */}
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search team, college, lead, ID, payment..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/60 border border-white/15 focus:border-[#ccff00] focus:ring-1 focus:ring-[#ccff00] text-xs font-mono text-white placeholder:text-zinc-600 outline-none transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Registrations List View */}
            <div className="rounded-2xl bg-black/70 border border-white/10 overflow-hidden backdrop-blur-xl shadow-2xl">
              <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-zinc-950/60">
                <div className="font-mono text-xs font-bold text-zinc-300 flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-[#ccff00]" />
                  <span>
                    SHOWING {filteredRegistrations.length} OF {registrations.length} RECORDS
                  </span>
                </div>
                <div className="text-[11px] font-mono text-zinc-500">
                  {selectedEvent === "all" ? "All Events" : EVENT_CONFIGS[selectedEvent]?.name}
                </div>
              </div>

              {isLoadingData ? (
                <div className="py-20 text-center space-y-3">
                  <RefreshCw className="w-8 h-8 text-[#ccff00] animate-spin mx-auto" />
                  <p className="font-mono text-xs text-zinc-400">Loading registrations from database...</p>
                </div>
              ) : filteredRegistrations.length === 0 ? (
                <div className="py-20 text-center space-y-3">
                  <AlertCircle className="w-10 h-10 text-zinc-600 mx-auto" />
                  <h3 className="font-[family-name:var(--font-orbitron)] font-bold text-sm text-zinc-400">
                    NO REGISTRATIONS FOUND
                  </h3>
                  <p className="font-mono text-xs text-zinc-600 max-w-sm mx-auto">
                    No participants registered for this event or matching search criteria yet. Click &apos;+ Add Participant&apos; to create one.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left font-mono text-xs">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/5 text-zinc-400 text-[11px] uppercase">
                        <th className="py-3 px-4">Ref ID</th>
                        <th className="py-3 px-4">Event</th>
                        <th className="py-3 px-4">Team / Name</th>
                        <th className="py-3 px-4">College / University</th>
                        <th className="py-3 px-4">Leader / Contact</th>
                        <th className="py-3 px-4 text-center">Fee / Status</th>
                        <th className="py-3 px-4 text-center">Members</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredRegistrations.map((reg) => {
                        const cfg = EVENT_CONFIGS[reg.event_id] || {
                          name: reg.event_name,
                          color: "#ccff00",
                          tag: "EVENT",
                        };
                        return (
                          <tr
                            key={reg.id}
                            className="hover:bg-white/[0.03] transition-colors group"
                          >
                            {/* ID */}
                            <td className="py-3.5 px-4 font-bold text-white whitespace-nowrap">
                              <span className="px-2 py-0.5 rounded bg-black/60 border border-white/10 text-[11px]">
                                {reg.id}
                              </span>
                            </td>

                            {/* Event */}
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <span
                                className="px-2 py-0.5 rounded text-[10px] font-bold border"
                                style={{
                                  backgroundColor: `${cfg.color}15`,
                                  borderColor: `${cfg.color}40`,
                                  color: cfg.color,
                                }}
                              >
                                {cfg.name}
                              </span>
                            </td>

                            {/* Team Name */}
                            <td className="py-3.5 px-4 font-bold text-white">
                              <div>{reg.team_name || reg.leader_name}</div>
                              {reg.is_solo && (
                                <span className="text-[10px] text-zinc-500 font-normal">Solo Participant</span>
                              )}
                            </td>

                            {/* College */}
                            <td className="py-3.5 px-4 text-zinc-300 max-w-xs truncate">
                              {reg.college_name}
                            </td>

                            {/* Leader */}
                            <td className="py-3.5 px-4">
                              <div className="text-white font-semibold">{reg.leader_name}</div>
                              <div className="text-zinc-500 text-[10px]">
                                {reg.leader_email} • {reg.leader_phone}
                              </div>
                            </td>

                            {/* Fee & Payment Status */}
                            <td className="py-3.5 px-4 text-center whitespace-nowrap">
                              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>₹{reg.amount_paid || "1"} PAID</span>
                              </span>
                            </td>

                            {/* Members count */}
                            <td className="py-3.5 px-4 text-center">
                              <span className="px-2 py-1 rounded-full bg-zinc-900 border border-white/10 text-[11px] text-zinc-300">
                                {reg.total_members} {reg.total_members === 1 ? "Member" : "Members"}
                              </span>
                            </td>

                            {/* Actions */}
                            <td className="py-3.5 px-4 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => {
                                    soundFX.playClick();
                                    setSelectedRegDetails(reg);
                                  }}
                                  className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-all cursor-pointer"
                                  title="View Full Details"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  onClick={() => {
                                    soundFX.playClick();
                                    setDeleteCandidateId(reg.id);
                                  }}
                                  className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 transition-all cursor-pointer"
                                  title="Delete Registration"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: DYNAMIC EVENT PRICING & CASHFREE GATEWAY          */}
        {/* ======================================================== */}
        {adminTab === "pricing" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header Telemetry */}
            <div className="p-6 rounded-3xl bg-zinc-950/80 border border-white/15 backdrop-blur-xl shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-[#ccff00]/10 rounded-full blur-[100px] pointer-events-none" />
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                <div className="space-y-1 max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ccff00]/10 border border-[#ccff00]/30 text-[#ccff00] text-xs font-mono font-bold">
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>DYNAMIC ENTRY FEE CONFIGURATOR</span>
                  </div>
                  <h2 className="font-[family-name:var(--font-orbitron)] font-black text-2xl text-white">
                    EVENT ENTRY FEES & CASHFREE GATEWAY SYNC
                  </h2>
                  <p className="text-xs text-zinc-400 font-mono leading-relaxed">
                    Update the registration entry fee for any track. Changes are stored in the server database and instantly reflected in live Cashfree checkout orders and on the <strong className="text-white">/register</strong> page.
                  </p>
                </div>

                <button
                  onClick={() => {
                    soundFX.playClick();
                    fetchPricingData();
                  }}
                  className="px-4 py-2.5 rounded-xl bg-zinc-900 border border-white/15 hover:border-[#ccff00] text-xs font-mono text-zinc-300 hover:text-white flex items-center gap-2 transition-all shrink-0 cursor-pointer self-start md:self-auto"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-[#ccff00]" />
                  <span>Reload Live Prices</span>
                </button>
              </div>
            </div>

            {/* Event Pricing Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(EVENT_CONFIGS).map(([eventId, cfg]) => {
                const EvIcon = cfg.icon;
                const currentPricing = eventPricings[eventId];
                const currentAmountInr = currentPricing?.amount_inr ?? 100;
                const inputValue = inputPrices[eventId] !== undefined ? inputPrices[eventId] : String(currentAmountInr);
                const isSaving = isSavingPrice[eventId] || false;
                const notice = priceNotice[eventId] || "";

                return (
                  <div
                    key={eventId}
                    className="p-6 rounded-3xl bg-black/75 border border-white/10 hover:border-white/20 transition-all duration-300 backdrop-blur-xl shadow-xl flex flex-col justify-between space-y-6 relative overflow-hidden"
                  >
                    {/* Corner Cyber Accents */}
                    <div
                      className="absolute top-0 right-0 w-24 h-24 pointer-events-none opacity-10 blur-xl rounded-full"
                      style={{ backgroundColor: cfg.color }}
                    />

                    <div className="space-y-4">
                      {/* Top Meta Bar */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center border"
                            style={{
                              backgroundColor: `${cfg.color}15`,
                              borderColor: `${cfg.color}40`,
                              color: cfg.color,
                            }}
                          >
                            <EvIcon className="w-5 h-5" />
                          </div>
                          <div>
                            <span
                              className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border"
                              style={{
                                backgroundColor: `${cfg.color}10`,
                                borderColor: `${cfg.color}30`,
                                color: cfg.color,
                              }}
                            >
                              {cfg.tag}
                            </span>
                            <h3 className="font-[family-name:var(--font-orbitron)] font-bold text-lg text-white mt-0.5">
                              {cfg.name}
                            </h3>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-[10px] font-mono text-zinc-500 uppercase">ACTIVE LIVE FEE</div>
                          <div className="font-[family-name:var(--font-orbitron)] font-black text-xl text-[#ccff00]">
                            ₹{currentAmountInr}
                          </div>
                        </div>
                      </div>

                      {/* Quick Presets */}
                      <div>
                        <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-2">
                          QUICK PRESETS:
                        </label>
                        <div className="flex items-center gap-2 flex-wrap">
                          {[1, 50, 100, 200, 500, 1000].map((preset) => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => {
                                soundFX.playClick();
                                setInputPrices((prev) => ({ ...prev, [eventId]: String(preset) }));
                              }}
                              className={`px-3 py-1 rounded-lg font-mono text-xs transition-all cursor-pointer border ${
                                inputValue === String(preset)
                                  ? "bg-[#ccff00]/20 border-[#ccff00] text-[#ccff00] font-bold"
                                  : "bg-zinc-900/80 border-white/10 text-zinc-400 hover:text-white hover:border-white/30"
                              }`}
                            >
                              {preset === 1 ? "₹1 (Test Mode)" : `₹${preset}`}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Custom Input */}
                      <div>
                        <label className="block text-[11px] font-mono text-zinc-300 uppercase font-bold mb-1.5">
                          Set Entry Fee (₹ INR) *
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[#ccff00] font-mono">
                            ₹
                          </span>
                          <input
                            type="number"
                            min="1"
                            step="1"
                            value={inputValue}
                            onChange={(e) =>
                              setInputPrices((prev) => ({ ...prev, [eventId]: e.target.value }))
                            }
                            placeholder="Enter amount in Rupees"
                            className="w-full pl-9 pr-4 py-3 rounded-xl bg-black/80 border border-white/15 focus:border-[#ccff00] focus:ring-1 focus:ring-[#ccff00] text-sm font-mono font-bold text-white outline-none transition-all"
                          />
                        </div>
                        <div className="text-[10px] font-mono text-zinc-500 mt-1 flex justify-between">
                          <span>Min: ₹1.00</span>
                          <span>Cashfree Order Fee: ₹{parseFloat(inputValue) || 0}</span>
                        </div>
                      </div>

                      {notice && (
                        <div
                          className={`p-3 rounded-xl font-mono text-xs border flex items-center gap-2 ${
                            notice.startsWith("Success")
                              ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
                              : "bg-red-500/15 border-red-500/40 text-red-300"
                          }`}
                        >
                          {notice.startsWith("Success") ? (
                            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                          ) : (
                            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                          )}
                          <span>{notice}</span>
                        </div>
                      )}
                    </div>

                    {/* Action Bar */}
                    <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                      <div className="text-[10px] font-mono text-zinc-500">
                        {currentPricing?.updated_at
                          ? `Last updated ${new Date(currentPricing.updated_at).toLocaleTimeString()}`
                          : "Default Preset"}
                      </div>

                      <button
                        onClick={() => handleUpdatePrice(eventId)}
                        disabled={isSaving}
                        className="px-6 py-2.5 rounded-xl bg-[#ccff00] hover:bg-[#d9ff33] text-black font-[family-name:var(--font-orbitron)] font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-[0_0_15px_rgba(204,255,0,0.2)] disabled:opacity-50"
                      >
                        {isSaving ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin text-black" />
                            <span>SAVING...</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-3.5 h-3.5" />
                            <span>UPDATE & PUBLISH</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: RULEBOOK MANAGEMENT ENGINE                        */}
        {/* ======================================================== */}
        {adminTab === "rulebook" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header Telemetry */}
            <div className="p-6 rounded-3xl bg-zinc-950/80 border border-white/15 backdrop-blur-xl shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                <div className="space-y-1 max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold">
                    <FileText className="w-3.5 h-3.5" />
                    <span>PUBLIC DISTRIBUTION FILE ENGINE</span>
                  </div>
                  <h2 className="font-[family-name:var(--font-orbitron)] font-black text-2xl text-white">
                    COMPETITION RULEBOOK MANAGER
                  </h2>
                  <p className="text-xs text-zinc-400 font-mono leading-relaxed">
                    Upload, inspect, download, or delete the official CODEMEET 2026 rulebook. The active document is dynamically delivered to all visitors when clicking <strong className="text-white">&apos;DOWNLOAD RULEBOOK&apos;</strong> on the second section of the landing page.
                  </p>
                </div>

                <button
                  onClick={() => {
                    soundFX.playClick();
                    fetchRulebookMeta();
                  }}
                  className="px-4 py-2.5 rounded-xl bg-zinc-900 border border-white/15 hover:border-cyan-400 text-xs font-mono text-zinc-300 hover:text-white flex items-center gap-2 transition-all shrink-0 cursor-pointer self-start md:self-auto"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Refresh File Status</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Current Active Rulebook Card */}
              <div className="lg:col-span-6 p-6 sm:p-8 rounded-3xl bg-black/75 border border-white/10 backdrop-blur-xl shadow-xl space-y-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="font-mono text-xs font-bold text-zinc-400 uppercase tracking-wider">
                      // CURRENT PUBLISHED RULEBOOK
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold border ${
                        rulebookMeta.exists
                          ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/40"
                          : "bg-amber-500/15 text-amber-400 border-amber-500/40"
                      }`}
                    >
                      {rulebookMeta.exists ? "● CUSTOM PDF ACTIVE" : "● DEFAULT STARTER RULEBOOK"}
                    </span>
                  </div>

                  {/* File Metadata Box */}
                  <div className="p-5 rounded-2xl bg-zinc-900/80 border border-white/10 space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div className="space-y-1 min-w-0">
                        <div className="text-xs font-mono text-zinc-500">DOCUMENT FILENAME</div>
                        <div className="font-[family-name:var(--font-orbitron)] font-bold text-base text-white truncate">
                          {rulebookMeta.filename}
                        </div>
                        <div className="text-xs font-mono text-zinc-400 flex items-center gap-3">
                          <span>Size: <strong className="text-white">{rulebookMeta.size_formatted}</strong></span>
                          <span>•</span>
                          <span>Format: <strong className="text-[#ccff00]">PDF / DOCX</strong></span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-white/10 text-[11px] font-mono text-zinc-400 flex items-center justify-between">
                      <span className="text-zinc-500">LAST PUBLISHED:</span>
                      <span className="text-zinc-300">
                        {rulebookMeta.updated_at
                          ? new Date(rulebookMeta.updated_at).toLocaleString()
                          : "Built-in System Starter Rulebook"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    <a
                      href={`${apiUrl}/api/rulebook/download`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => {
                        soundFX.playClick();
                        soundFX.playSuccess();
                      }}
                      className="flex-1 px-5 py-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-[family-name:var(--font-orbitron)] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(6,182,212,0.15)] cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>VIEW / DOWNLOAD RULEBOOK</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    {rulebookMeta.exists && (
                      <button
                        onClick={handleDeleteRulebook}
                        disabled={isDeletingRulebook}
                        className="px-4 py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                        title="Delete custom rulebook"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>{isDeletingRulebook ? "Deleting..." : "Delete Rulebook"}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Upload New Rulebook */}
              <div className="lg:col-span-6 p-6 sm:p-8 rounded-3xl bg-black/75 border border-white/10 backdrop-blur-xl shadow-xl space-y-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="font-mono text-xs font-bold text-[#ccff00] uppercase tracking-wider">
                    // UPLOAD & PUBLISH NEW RULEBOOK
                  </div>

                  {/* Dropzone Area */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragOver(true);
                    }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragOver(false);
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        soundFX.playClick();
                        setSelectedRulebookFile(e.dataTransfer.files[0]);
                      }
                    }}
                    className={`p-8 rounded-2xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center text-center cursor-pointer space-y-3 ${
                      isDragOver
                        ? "border-[#ccff00] bg-[#ccff00]/10"
                        : selectedRulebookFile
                        ? "border-[#ccff00]/60 bg-black/80"
                        : "border-white/15 bg-black/50 hover:border-white/30"
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.docx,.doc,.zip"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          soundFX.playClick();
                          setSelectedRulebookFile(e.target.files[0]);
                        }
                      }}
                      className="hidden"
                    />

                    <div className="w-14 h-14 rounded-2xl bg-[#ccff00]/10 border border-[#ccff00]/30 flex items-center justify-center text-[#ccff00] shadow-[0_0_25px_rgba(204,255,0,0.2)]">
                      <UploadCloud className="w-7 h-7" />
                    </div>

                    <div>
                      <div className="font-[family-name:var(--font-orbitron)] font-bold text-sm text-white">
                        {selectedRulebookFile ? selectedRulebookFile.name : "CHOOSE OR DRAG & DROP RULEBOOK FILE"}
                      </div>
                      <p className="text-xs text-zinc-400 font-mono mt-1">
                        {selectedRulebookFile
                          ? `Ready to upload (${(selectedRulebookFile.size / (1024 * 1024)).toFixed(2)} MB)`
                          : "Supports PDF, DOCX, DOC files up to 30 MB"}
                      </p>
                    </div>
                  </div>

                  {rulebookNotice && (
                    <div
                      className={`p-3.5 rounded-xl font-mono text-xs border flex items-center gap-2 animate-in fade-in duration-200 ${
                        rulebookNotice.includes("uploaded") || rulebookNotice.includes("removed")
                          ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
                          : "bg-red-500/15 border-red-500/40 text-red-300"
                      }`}
                    >
                      {rulebookNotice.includes("uploaded") || rulebookNotice.includes("removed") ? (
                        <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                      ) : (
                        <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                      )}
                      <span>{rulebookNotice}</span>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleUploadRulebook()}
                  disabled={!selectedRulebookFile || isUploadingRulebook}
                  className="w-full py-3.5 rounded-xl bg-[#ccff00] hover:bg-[#d9ff33] text-black font-[family-name:var(--font-orbitron)] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_0_20px_rgba(204,255,0,0.3)] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isUploadingRulebook ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-black" />
                      <span>UPLOADING & DEPLOYING...</span>
                    </>
                  ) : (
                    <>
                      <FileCheck className="w-4 h-4" />
                      <span>UPLOAD & PUBLISH TO SITE</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 1. Modal: View Registration Details */}
      {selectedRegDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl bg-[#090b10] border border-[#ccff00]/40 rounded-3xl p-6 sm:p-8 text-white shadow-[0_0_50px_rgba(204,255,0,0.2)] max-h-[90vh] overflow-y-auto"
          >
            <button
              onClick={() => setSelectedRegDetails(null)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-white/10 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-[#ccff00] mb-1">
                  <Terminal className="w-4 h-4" />
                  <span>REGISTRATION DOSSIER • {selectedRegDetails.id}</span>
                </div>
                <h2 className="font-[family-name:var(--font-orbitron)] font-black text-2xl text-white">
                  {selectedRegDetails.team_name || selectedRegDetails.leader_name}
                </h2>
                <div className="text-xs text-zinc-400 font-mono mt-1">
                  {selectedRegDetails.event_name} • Registered {new Date(selectedRegDetails.created_at).toLocaleString()}
                </div>
              </div>

              {/* Institution & Payment Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-1">
                  <div className="text-[11px] font-mono text-zinc-500 uppercase">College / University Institution</div>
                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#ccff00]" />
                    <span className="truncate">{selectedRegDetails.college_name}</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-1">
                  <div className="text-[11px] font-mono text-zinc-500 uppercase">Cashfree Payment Telemetry</div>
                  <div className="text-xs font-mono text-white flex items-center justify-between">
                    <span className="text-emerald-400 font-bold">₹{selectedRegDetails.amount_paid || "1"} (PAID)</span>
                    <span className="text-zinc-400 text-[10px] truncate max-w-[140px]">
                      {selectedRegDetails.payment_id || "pay_verified"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Members breakdown */}
              <div className="space-y-3">
                <div className="font-mono text-xs font-bold text-[#ccff00] uppercase tracking-wider flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>// PARTICIPANTS SPECIFICATIONS ({selectedRegDetails.members.length})</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedRegDetails.members.map((m, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-black/60 border border-white/10 space-y-2 relative"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                          {idx === 0 ? "LEADER / CONTACT" : `MEMBER 0${idx + 1}`}
                        </span>
                        {idx === 0 && <span className="text-[10px] font-mono text-[#ccff00]">PRIMARY</span>}
                      </div>
                      <div className="font-bold text-white text-sm">{m.name}</div>
                      <div className="space-y-1 font-mono text-xs text-zinc-400">
                        <div className="flex items-center gap-1.5 truncate">
                          <Mail className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                          <span className="truncate">{m.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                          <span>{m.phone}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-end">
                <button
                  onClick={() => setSelectedRegDetails(null)}
                  className="px-6 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-mono text-xs font-bold border border-white/10 transition-all cursor-pointer"
                >
                  Close Dossier
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Modal: Add Participant / Team Manually */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl bg-[#090b10] border border-[#ccff00]/40 rounded-3xl p-6 sm:p-8 text-white shadow-[0_0_50px_rgba(204,255,0,0.2)] max-h-[90vh] overflow-y-auto"
          >
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-white/10 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-[#ccff00] mb-1">
                  <UserPlus className="w-4 h-4" />
                  <span>ADMIN ENTRY DISPATCH</span>
                </div>
                <h2 className="font-[family-name:var(--font-orbitron)] font-black text-2xl text-white">
                  ADD NEW PARTICIPANT / TEAM
                </h2>
                <p className="text-xs text-zinc-400 font-mono mt-1">
                  Manually register a team or solo candidate directly into the database.
                </p>
              </div>

              {addSuccessMsg && (
                <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-mono text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{addSuccessMsg}</span>
                </div>
              )}

              <form onSubmit={handleCreateRegistration} className="space-y-5">
                {/* Event Select */}
                <div>
                  <label className="block text-[11px] font-mono text-zinc-300 uppercase font-bold mb-1.5">
                    Target Event Track *
                  </label>
                  <select
                    value={newEventId}
                    onChange={(e) => setNewEventId(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-black/80 border border-white/15 focus:border-[#ccff00] text-sm text-white font-mono outline-none cursor-pointer"
                  >
                    {Object.entries(EVENT_CONFIGS).map(([k, v]) => (
                      <option key={k} value={k} className="bg-zinc-900">
                        {v.name} ({v.isSolo ? "Solo" : "Team"})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {!EVENT_CONFIGS[newEventId].isSolo && (
                    <div>
                      <label className="block text-[11px] font-mono text-zinc-300 uppercase font-bold mb-1.5">
                        Team Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={newTeamName}
                        onChange={(e) => setNewTeamName(e.target.value)}
                        placeholder="Enter team name"
                        className="w-full px-4 py-2.5 rounded-xl bg-black/80 border border-white/15 focus:border-[#ccff00] text-xs font-mono text-white placeholder:text-zinc-600 outline-none"
                      />
                    </div>
                  )}

                  <div className={EVENT_CONFIGS[newEventId].isSolo ? "sm:col-span-2" : ""}>
                    <label className="block text-[11px] font-mono text-zinc-300 uppercase font-bold mb-1.5">
                      College / University Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={newCollegeName}
                      onChange={(e) => setNewCollegeName(e.target.value)}
                      placeholder="Enter college / university name"
                      className="w-full px-4 py-2.5 rounded-xl bg-black/80 border border-white/15 focus:border-[#ccff00] text-xs font-mono text-white placeholder:text-zinc-600 outline-none"
                    />
                  </div>
                </div>

                {/* Participant Fields */}
                <div className="space-y-4 pt-2">
                  <div className="font-mono text-xs font-bold text-[#ccff00] uppercase tracking-wider">
                    {EVENT_CONFIGS[newEventId].isSolo
                      ? "// SOLO PARTICIPANT CREDENTIALS"
                      : "// TEAM MEMBERS SPECIFICATIONS"}
                  </div>

                  {(EVENT_CONFIGS[newEventId].isSolo ? [newMembers[0]] : newMembers).map((m, idx) => {
                    const isRequired =
                      newEventId === "hackathon" ? idx < 3 : EVENT_CONFIGS[newEventId].isSolo ? idx === 0 : true;

                    return (
                      <div
                        key={idx}
                        className="p-4 rounded-xl bg-black/60 border border-white/10 space-y-3"
                      >
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="font-bold text-white">
                            {idx === 0
                              ? "PARTICIPANT 01 (LEAD CONTACT)"
                              : `PARTICIPANT 0${idx + 1}`}
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded ${isRequired ? "bg-red-500/15 text-red-400" : "bg-zinc-800 text-zinc-400"}`}>
                            {isRequired ? "REQUIRED" : "OPTIONAL"}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <input
                            type="text"
                            required={isRequired}
                            value={m.name}
                            onChange={(e) => handleAddMemberChange(idx, "name", e.target.value)}
                            placeholder="Enter full name"
                            className="px-3 py-2 rounded-lg bg-black/80 border border-white/10 focus:border-[#ccff00] text-xs font-mono text-white placeholder:text-zinc-600 outline-none"
                          />
                          <input
                            type="email"
                            required={isRequired}
                            value={m.email}
                            onChange={(e) => handleAddMemberChange(idx, "email", e.target.value)}
                            placeholder="Enter email address"
                            className="px-3 py-2 rounded-lg bg-black/80 border border-white/10 focus:border-[#ccff00] text-xs font-mono text-white placeholder:text-zinc-600 outline-none"
                          />
                          <input
                            type="tel"
                            required={isRequired}
                            inputMode="numeric"
                            pattern="[0-9]{10}"
                            maxLength={10}
                            minLength={10}
                            value={m.phone}
                            onChange={(e) => handleAddMemberChange(idx, "phone", e.target.value)}
                            placeholder="10-digit mobile number"
                            className="px-3 py-2 rounded-lg bg-black/80 border border-white/10 focus:border-[#ccff00] text-xs font-mono text-white placeholder:text-zinc-600 outline-none"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-mono text-xs transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingNew}
                    className="px-7 py-2.5 rounded-xl bg-[#ccff00] hover:bg-[#d9ff33] text-black font-[family-name:var(--font-orbitron)] font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-[0_0_20px_rgba(204,255,0,0.3)] disabled:opacity-50"
                  >
                    {isSubmittingNew ? "SAVING..." : "COMMIT REGISTRATION"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 3. Modal: Confirm Delete */}
      {deleteCandidateId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md bg-[#090b10] border border-red-500/40 rounded-3xl p-6 text-white shadow-[0_0_50px_rgba(239,68,68,0.2)] text-center space-y-4"
          >
            <div className="w-14 h-14 rounded-full bg-red-500/15 border border-red-500/40 flex items-center justify-center text-red-400 mx-auto">
              <Trash2 className="w-7 h-7" />
            </div>

            <div>
              <h3 className="font-[family-name:var(--font-orbitron)] font-black text-xl text-white">
                DELETE REGISTRATION?
              </h3>
              <p className="font-mono text-xs text-zinc-400 mt-1">
                Are you sure you want to permanently delete registration record{" "}
                <strong className="text-white">{deleteCandidateId}</strong> from the database?
              </p>
            </div>

            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                onClick={() => setDeleteCandidateId(null)}
                className="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-mono text-xs transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteRegistration(deleteCandidateId)}
                className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-bold transition-all cursor-pointer shadow-lg shadow-red-600/30"
              >
                Yes, Delete Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
