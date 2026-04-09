"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const VALID_CODES = ["CHIEF2026", "FOUNDERS", "EARLYBIRD"];

const copy = {
  en: {
    back: "Back",
    title: "Claim your doorplate",
    sub: "Enter your invitation code to get started.",
    placeholder: "Invitation code",
    invalid: "Invalid code. Please check and try again.",
    codeLabel: "Invitation Code",
    next: "Continue",
    orSign: "Sign in with Google to continue",
    google: "Continue with Google",
    noCode: "Don't have a code?",
    contact: "Contact us",
    founding: "Founding Member",
    seats: "1,000 seats · VP+ only · Free forever",
  },
  zh: {
    back: "返回",
    title: "认领你的数字门牌",
    sub: "输入邀请码开始使用。",
    placeholder: "邀请码",
    invalid: "邀请码无效，请检查后重试。",
    codeLabel: "邀请码",
    next: "继续",
    orSign: "使用 Google 账号登录",
    google: "通过 Google 继续",
    noCode: "没有邀请码？",
    contact: "联系我们",
    founding: "创始成员",
    seats: "1,000 席位 · 仅限 VP+ · 永久免费",
  },
};

export default function JoinPage() {
  const { lang } = useLanguage();
  const t = copy[lang];
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleVerify() {
    if (VALID_CODES.includes(code.trim().toUpperCase())) {
      setVerified(true);
      setError("");
    } else {
      setError(t.invalid);
    }
  }

  async function handleGoogle() {
    setLoading(true);
    signIn("google", { callbackUrl: "/onboarding" });
  }

  return (
    <main className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center px-6 relative">
      {/* bg glow */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 60% 50% at 50% 40%, rgba(184,148,79,0.07) 0%, transparent 70%)" }} />

      {/* back */}
      <Link href="/" className="absolute top-6 left-6 flex items-center gap-2 font-body text-sm text-[#555555] hover:text-[#E8E2D8] transition-colors">
        <ArrowLeft className="w-4 h-4" /> {t.back}
      </Link>

      <div className="relative w-full max-w-md">
        {/* logo */}
        <div className="text-center mb-10">
          <div className="font-display text-3xl font-bold text-[#FEFCF7] mb-1">
            chief<span className="text-[#B8944F]">.me</span>
          </div>
          <div className="text-[10px] font-body tracking-[0.25em] text-[#B8944F] uppercase">{t.founding}</div>
        </div>

        {/* card */}
        <div className="rounded-[20px] p-8" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(184,148,79,0.15)" }}>
          <h1 className="font-display text-2xl font-bold text-[#FEFCF7] mb-2">{t.title}</h1>
          <p className="font-body text-[#555555] text-sm mb-8">{t.sub}</p>

          {!verified ? (
            <div className="space-y-4">
              <div>
                <label className="font-body text-xs text-[#E8E2D8]/60 tracking-widest uppercase block mb-2">{t.codeLabel}</label>
                <input
                  type="text"
                  value={code}
                  onChange={e => { setCode(e.target.value); setError(""); }}
                  onKeyDown={e => e.key === "Enter" && handleVerify()}
                  placeholder={t.placeholder}
                  className="w-full bg-[#FEFCF7]/5 border border-[#E8E2D8]/10 rounded-[12px] px-4 py-3 font-body text-[#FEFCF7] text-sm placeholder:text-[#555555] focus:outline-none focus:border-[#B8944F]/50 transition-colors tracking-widest uppercase"
                />
                {error && <p className="font-body text-red-400 text-xs mt-2">{error}</p>}
              </div>
              <button
                onClick={handleVerify}
                className="w-full bg-[#B8944F] hover:bg-[#9d7c3e] text-[#FEFCF7] font-body font-medium rounded-full py-3 text-sm transition-colors"
              >
                {t.next}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="font-body text-[#E8E2D8]/70 text-sm text-center mb-6">{t.orSign}</p>
              <button
                onClick={handleGoogle}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-[#FEFCF7] hover:bg-[#E8E2D8] text-[#0A0A0A] font-body font-medium rounded-full py-3 text-sm transition-colors disabled:opacity-60"
              >
                {loading ? "..." : t.google}
              </button>
            </div>
          )}
        </div>

        <p className="text-center font-body text-[#555555] text-xs mt-6">
          {t.seats}
        </p>
        <p className="text-center font-body text-[#555555] text-xs mt-2">
          {t.noCode}{" "}
          <a href="mailto:hello@chief.me" className="text-[#B8944F] hover:underline">{t.contact}</a>
        </p>
      </div>
    </main>
  );
}
