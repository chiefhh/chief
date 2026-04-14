"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 40);
}

const copy = {
  en: {
    founding: "Founding Member",
    step1Title: "Claim your doorplate",
    step1Sub: (slug: string) => `Your public URL will be chief.me/${slug || "your-name"}`,
    displayName: "Display Name",
    title: "Title",
    company: "Company",
    yourUrl: "Your URL",
    continue: "Continue",
    step2Title: "Your story",
    step2Sub: "Optional — you can always add this later.",
    headline: "Headline",
    headlinePh: "Building AI infrastructure for the next decade",
    bio: "Bio",
    bioPh: "A few sentences about your background, expertise, and what you stand for.",
    aiGenerate: "✨ AI Generate",
    generating: "Generating...",
    back: "Back",
    claim: "Claim my page",
    submitting: "Saving...",
    doneTitle: "Your doorplate is live",
    doneSub: "Your public page is now at:",
    viewPage: "View my page",
    dashboard: "Go to Dashboard",
    seats: "10,000 seats · VP+ only · Free forever",
  },
  zh: {
    founding: "创始成员",
    step1Title: "认领你的数字门牌",
    step1Sub: (slug: string) => `你的公开链接将是 chief.me/${slug || "your-name"}`,
    displayName: "显示名称",
    title: "职位",
    company: "公司",
    yourUrl: "你的链接",
    continue: "继续",
    step2Title: "你的故事",
    step2Sub: "选填——你可以随时补充。",
    headline: "一句话介绍",
    headlinePh: "用一句话概括你的核心价值",
    bio: "个人简介",
    bioPh: "几句话介绍你的背景、专长和你坚持的信念。",
    aiGenerate: "✨ AI 生成",
    generating: "生成中...",
    back: "返回",
    claim: "认领我的主页",
    submitting: "保存中...",
    doneTitle: "你的数字门牌已上线",
    doneSub: "你的公开主页现在位于：",
    viewPage: "查看我的主页",
    dashboard: "进入控制台",
    seats: "10,000 个席位 · 仅限 VP+ · 永久免费",
  },
};

export default function OnboardingPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const { lang } = useLanguage();
  const t = copy[lang];

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ displayName: "", title: "", company: "", slug: "", headline: "", bio: "" });
  const [slugEdited, setSlugEdited] = useState(false);
  const [slugError, setSlugError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [generatingBio, setGeneratingBio] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/join");
    if (status === "authenticated" && session.user.profile) router.replace("/dashboard");
  }, [status, session, router]);

  useEffect(() => {
    if (!slugEdited && form.displayName) {
      setForm((f) => ({ ...f, slug: slugify(form.displayName) }));
    }
  }, [form.displayName, slugEdited]);

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    if (field === "slug") { setSlugEdited(true); setSlugError(""); }
  }

  async function handleGenerateBio() {
    setGeneratingBio(true);
    try {
      const language = navigator.language?.startsWith("zh") ? "zh" : "en";
      const res = await fetch("/api/ai/generate-bio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.displayName, title: form.title, company: form.company, language }),
      });
      const data = await res.json();
      if (res.ok && data.bio) set("bio", data.bio);
    } catch { /* silently fail */ }
    setGeneratingBio(false);
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/profile/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 409 && data.error?.includes("URL")) { setSlugError(data.error); setStep(1); }
        else setError(data.error ?? "Something went wrong");
        setSubmitting(false);
        return;
      }
      await update();
      setStep(3);
    } catch {
      setError("Network error. Please try again.");
    }
    setSubmitting(false);
  }

  if (status === "loading") {
    return (
      <main className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#B8944F] border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  const inputClass = "w-full bg-[#FEFCF7]/5 border border-[#E8E2D8]/10 rounded-[12px] px-4 py-3 font-body text-[#FEFCF7] text-sm placeholder:text-[#555555] focus:outline-none focus:border-[#B8944F]/50 transition-colors";

  return (
    <main className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center px-6 relative">
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 50% at 50% 40%, rgba(184,148,79,0.07) 0%, transparent 70%)" }} />

      {step < 3 && (
        <Link href="/dashboard" className="absolute top-6 left-6 flex items-center gap-2 font-body text-sm text-[#555555] hover:text-[#E8E2D8] transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
      )}

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Image src="/logo.png" alt="chief.me" height={358} width={623} style={{ height: "64px", width: "auto", filter: "brightness(0) invert(1)" }} />
          <div className="text-[10px] font-body tracking-[0.25em] text-[#B8944F] uppercase mt-1">{t.founding}</div>
        </div>

        {step < 3 && (
          <div className="flex items-center gap-2 justify-center mb-8">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-body transition-all ${s < step ? "bg-[#B8944F] text-[#0A0A0A]" : s === step ? "border border-[#B8944F] text-[#B8944F]" : "border border-[#555555]/40 text-[#555555]"}`}>
                  {s < step ? <Check className="w-3 h-3" /> : s}
                </div>
                {s < 2 && <div className="w-8 h-px bg-[#555555]/30" />}
              </div>
            ))}
          </div>
        )}

        <div className="rounded-[20px] p-8" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(184,148,79,0.15)" }}>
          {step === 1 && (
            <>
              <h1 className="font-display text-2xl font-bold text-[#FEFCF7] mb-1">{t.step1Title}</h1>
              <p className="font-body text-[#555555] text-sm mb-6">{t.step1Sub(form.slug)}</p>
              {error && <div className="mb-4 p-3 rounded-[10px] bg-red-500/10 border border-red-500/20"><p className="font-body text-red-400 text-xs">{error}</p></div>}
              <div className="space-y-4">
                {[
                  { label: t.displayName, field: "displayName", ph: "Sarah Chen" },
                  { label: t.title, field: "title", ph: "CTO" },
                  { label: t.company, field: "company", ph: "Luminex AI" },
                ].map(({ label, field, ph }) => (
                  <div key={field}>
                    <label className="font-body text-xs text-[#E8E2D8]/60 tracking-widest uppercase block mb-2">{label} <span className="text-[#B8944F]">*</span></label>
                    <input value={form[field as keyof typeof form]} onChange={e => set(field, e.target.value)} placeholder={ph} className={inputClass} />
                  </div>
                ))}
                <div>
                  <label className="font-body text-xs text-[#E8E2D8]/60 tracking-widest uppercase block mb-2">{t.yourUrl} <span className="text-[#B8944F]">*</span></label>
                  <div className="flex items-center rounded-[12px] overflow-hidden border border-[#E8E2D8]/10 focus-within:border-[#B8944F]/50 transition-colors">
                    <span className="font-body text-[#555555] text-sm px-3 py-3 bg-[#FEFCF7]/3 border-r border-[#E8E2D8]/10 whitespace-nowrap">chief.me/</span>
                    <input value={form.slug} onChange={e => set("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))} placeholder="your-name" className="flex-1 bg-transparent px-3 py-3 font-body text-[#FEFCF7] text-sm focus:outline-none" />
                  </div>
                  {slugError && <p className="font-body text-red-400 text-xs mt-1">{slugError}</p>}
                </div>
              </div>
              <button onClick={() => { if (!form.displayName || !form.title || !form.company || !form.slug) return; setStep(2); }}
                disabled={!form.displayName || !form.title || !form.company || !form.slug}
                className="mt-6 w-full flex items-center justify-center gap-2 bg-[#B8944F] hover:bg-[#9d7c3e] disabled:opacity-40 disabled:cursor-not-allowed text-[#FEFCF7] font-body font-medium rounded-full py-3 text-sm transition-colors cursor-pointer">
                {t.continue} <ArrowRight className="w-4 h-4" />
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <h1 className="font-display text-2xl font-bold text-[#FEFCF7] mb-1">{t.step2Title}</h1>
              <p className="font-body text-[#555555] text-sm mb-6">{t.step2Sub}</p>
              {error && <div className="mb-4 p-3 rounded-[10px] bg-red-500/10 border border-red-500/20"><p className="font-body text-red-400 text-xs">{error}</p></div>}
              <div className="space-y-4">
                <div>
                  <label className="font-body text-xs text-[#E8E2D8]/60 tracking-widest uppercase block mb-2">{t.headline}</label>
                  <input value={form.headline} onChange={e => set("headline", e.target.value)} placeholder={t.headlinePh} className={inputClass} />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="font-body text-xs text-[#E8E2D8]/60 tracking-widest uppercase">{t.bio}</label>
                    <button type="button" onClick={handleGenerateBio} disabled={generatingBio || !form.displayName || !form.title || !form.company}
                      className="text-[10px] font-body text-[#B8944F] hover:text-[#E8D5A0] tracking-widest transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1">
                      {generatingBio ? (<><span className="w-3 h-3 border border-[#B8944F] border-t-transparent rounded-full animate-spin inline-block" />{t.generating}</>) : t.aiGenerate}
                    </button>
                  </div>
                  <textarea value={form.bio} onChange={e => set("bio", e.target.value)} placeholder={t.bioPh} rows={4} className={inputClass + " resize-none"} />
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <button onClick={() => setStep(1)} className="flex-1 border border-[#E8E2D8]/15 text-[#E8E2D8]/60 hover:text-[#E8E2D8] font-body font-medium rounded-full py-3 text-sm transition-colors cursor-pointer">{t.back}</button>
                <button onClick={handleSubmit} disabled={submitting} className="flex-1 flex items-center justify-center gap-2 bg-[#B8944F] hover:bg-[#9d7c3e] disabled:opacity-60 text-[#FEFCF7] font-body font-medium rounded-full py-3 text-sm transition-colors cursor-pointer">
                  {submitting ? <span className="w-4 h-4 border-2 border-[#FEFCF7] border-t-transparent rounded-full animate-spin" /> : <>{t.claim} <ArrowRight className="w-4 h-4" /></>}
                </button>
              </div>
            </>
          )}

          {step === 3 && (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full bg-[#B8944F]/15 flex items-center justify-center mx-auto mb-5"><Check className="w-7 h-7 text-[#B8944F]" /></div>
              <h1 className="font-display text-2xl font-bold text-[#FEFCF7] mb-2">{t.doneTitle}</h1>
              <p className="font-body text-[#555555] text-sm mb-2">{t.doneSub}</p>
              <p className="font-body text-[#B8944F] text-sm font-medium mb-8">chief.me/{form.slug}</p>
              <div className="space-y-3">
                <Link href={`/chief/${form.slug}`} className="block w-full text-center bg-[#B8944F] hover:bg-[#9d7c3e] text-[#FEFCF7] font-body font-medium rounded-full py-3 text-sm transition-colors">{t.viewPage}</Link>
                <Link href="/dashboard" className="block w-full text-center border border-[#E8E2D8]/15 text-[#E8E2D8]/60 hover:text-[#E8E2D8] font-body font-medium rounded-full py-3 text-sm transition-colors">{t.dashboard}</Link>
              </div>
            </div>
          )}
        </div>

        <p className="text-center font-body text-[#555555] text-xs mt-6">{t.seats}</p>
      </div>
    </main>
  );
}
