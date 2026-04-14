"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Check } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

// ─── Constants ─────────────────────────────────────────────────────────────────

const INDUSTRIES = [
  "Technology",
  "Finance",
  "Healthcare",
  "Consulting",
  "Manufacturing",
  "Media & Entertainment",
  "Retail & E-commerce",
  "Energy",
  "Real Estate",
  "Education",
  "Logistics",
  "Telecommunications",
  "Consumer Goods",
  "Legal",
  "Government",
];

const COMPANY_SIZES = [
  { value: "UNKNOWN", labelEn: "Select...", labelZh: "请选择..." },
  { value: "SEED", labelEn: "Seed Stage", labelZh: "种子轮" },
  { value: "SERIES_A_B", labelEn: "Series A/B", labelZh: "A/B 轮" },
  { value: "SERIES_C_PLUS", labelEn: "Series C+", labelZh: "C 轮以上" },
  { value: "PUBLIC", labelEn: "Public Co", labelZh: "上市公司" },
  { value: "ENTERPRISE", labelEn: "Enterprise", labelZh: "大型企业" },
  { value: "FORTUNE_500", labelEn: "Fortune 500", labelZh: "财富500强" },
];

const copy = {
  en: {
    title: "Edit Profile",
    back: "Back to Dashboard",
    saveChanges: "Save Changes",
    saving: "Saving...",
    saved: "Saved",
    displayName: "Display Name",
    jobTitle: "Job Title",
    company: "Company",
    headline: "Headline",
    headlinePlaceholder: "Building AI infrastructure for the next decade",
    bio: "Bio",
    bioPlaceholder: "A few sentences about your background, expertise, and what you stand for.",
    aiGenerate: "✨ AI Generate",
    generating: "Generating...",
    industries: "Industries",
    industriesHint: "Select up to 5",
    companySize: "Company Size",
    socialLinks: "Social Links",
    linkedin: "LinkedIn URL",
    twitter: "Twitter / X URL",
    website: "Personal Website",
    calendly: "Calendly URL",
    required: "Required fields",
  },
  zh: {
    title: "编辑资料",
    back: "返回控制台",
    saveChanges: "保存更改",
    saving: "保存中...",
    saved: "已保存",
    displayName: "显示名称",
    jobTitle: "职位",
    company: "公司",
    headline: "一句话介绍",
    headlinePlaceholder: "用一句话概括你的核心价值",
    bio: "个人简介",
    bioPlaceholder: "介绍你的背景、专长以及你坚持的信念。",
    aiGenerate: "✨ AI 生成",
    generating: "生成中...",
    industries: "所在行业",
    industriesHint: "最多选择 5 个",
    companySize: "企业规模",
    socialLinks: "社交链接",
    linkedin: "LinkedIn 主页",
    twitter: "Twitter / X 主页",
    website: "个人网站",
    calendly: "Calendly 预约链接",
    required: "必填字段",
  },
};

// ─── Component ─────────────────────────────────────────────────────────────────

export default function EditPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { lang } = useLanguage();
  const t = copy[lang];

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const [error, setError] = useState("");
  const [generatingBio, setGeneratingBio] = useState(false);

  const [form, setForm] = useState({
    displayName: "",
    title: "",
    company: "",
    headline: "",
    bio: "",
    industries: [] as string[],
    companySize: "UNKNOWN",
    linkedin: "",
    twitter: "",
    website: "",
    calendly: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/join");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/profile/setup")
      .then((r) => r.json())
      .then((d) => {
        const p = d.profile;
        if (!p) {
          router.replace("/onboarding");
          return;
        }
        const links = (p.socialLinks && typeof p.socialLinks === "object" && !Array.isArray(p.socialLinks))
          ? p.socialLinks as { linkedin?: string; twitter?: string; website?: string; calendly?: string }
          : {};
        setForm({
          displayName: p.displayName ?? "",
          title: p.title ?? "",
          company: p.company ?? "",
          headline: p.headline ?? "",
          bio: p.bio ?? "",
          industries: Array.isArray(p.industries) ? p.industries : [],
          companySize: p.companySize ?? "UNKNOWN",
          linkedin: links.linkedin ?? "",
          twitter: links.twitter ?? "",
          website: links.website ?? "",
          calendly: links.calendly ?? "",
        });
      })
      .finally(() => setLoading(false));
  }, [status, router]);

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function toggleIndustry(ind: string) {
    setForm((f) => {
      const next = f.industries.includes(ind)
        ? f.industries.filter((i) => i !== ind)
        : f.industries.length < 5
        ? [...f.industries, ind]
        : f.industries;
      return { ...f, industries: next };
    });
  }

  async function handleGenerateBio() {
    setGeneratingBio(true);
    try {
      const res = await fetch("/api/ai/generate-bio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.displayName,
          title: form.title,
          company: form.company,
          language: lang,
        }),
      });
      const data = await res.json();
      if (res.ok && data.bio) set("bio", data.bio);
    } catch {
      // silently fail
    }
    setGeneratingBio(false);
  }

  async function handleSave() {
    if (!form.displayName.trim() || !form.title.trim() || !form.company.trim()) return;
    setSubmitting(true);
    setError("");
    setSaveState("saving");
    try {
      const res = await fetch("/api/profile/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: form.displayName,
          title: form.title,
          company: form.company,
          headline: form.headline,
          bio: form.bio,
          industries: form.industries,
          companySize: form.companySize,
          socialLinks: {
            linkedin: form.linkedin || undefined,
            twitter: form.twitter || undefined,
            website: form.website || undefined,
            calendly: form.calendly || undefined,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        setSaveState("idle");
      } else {
        setSaveState("saved");
        setTimeout(() => {
          router.push("/dashboard");
        }, 800);
      }
    } catch {
      setError("Network error. Please try again.");
      setSaveState("idle");
    }
    setSubmitting(false);
  }

  if (status === "loading" || loading) {
    return (
      <main className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#B8944F] border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  const inputClass =
    "w-full bg-[#FEFCF7]/5 border border-[#E8E2D8]/10 rounded-[12px] px-4 py-3 font-body text-[#FEFCF7] text-sm placeholder:text-[#555555] focus:outline-none focus:border-[#B8944F]/50 transition-colors";

  return (
    <main className="min-h-screen bg-[#0A0A0A] px-6 py-12">
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(184,148,79,0.05) 0%, transparent 70%)",
        }}
      />

      <div className="relative max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <Link href="/">
            <Image src="/logo.png" alt="chief.me" height={358} width={623} style={{ height: "44px", width: "auto", filter: "brightness(0) invert(1)" }} />
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 font-body text-xs text-[#555555] hover:text-[#E8E2D8] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            {t.back}
          </Link>
        </div>

        <h1 className="font-display text-3xl font-bold text-[#FEFCF7] mb-8">{t.title}</h1>

        {error && (
          <div className="mb-6 p-3 rounded-[10px] bg-red-500/10 border border-red-500/20">
            <p className="font-body text-red-400 text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-6">
          {/* Basic Info */}
          <Section>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label={t.displayName} required>
                <input
                  value={form.displayName}
                  onChange={(e) => set("displayName", e.target.value)}
                  placeholder="Sarah Chen"
                  className={inputClass}
                />
              </Field>
              <Field label={t.jobTitle} required>
                <input
                  value={form.title}
                  onChange={(e) => set("title", e.target.value)}
                  placeholder="CTO"
                  className={inputClass}
                />
              </Field>
            </div>
            <Field label={t.company} required>
              <input
                value={form.company}
                onChange={(e) => set("company", e.target.value)}
                placeholder="Luminex AI"
                className={inputClass}
              />
            </Field>
          </Section>

          {/* Bio */}
          <Section>
            <Field label={t.headline}>
              <input
                value={form.headline}
                onChange={(e) => set("headline", e.target.value)}
                placeholder={t.headlinePlaceholder}
                className={inputClass}
              />
            </Field>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="font-body text-xs text-[#E8E2D8]/60 tracking-widest uppercase">
                  {t.bio}
                </label>
                <button
                  type="button"
                  onClick={handleGenerateBio}
                  disabled={generatingBio || !form.displayName || !form.title || !form.company}
                  className="text-[10px] font-body text-[#B8944F] hover:text-[#E8D5A0] tracking-widest transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  {generatingBio ? (
                    <>
                      <span className="w-3 h-3 border border-[#B8944F] border-t-transparent rounded-full animate-spin inline-block" />
                      {t.generating}
                    </>
                  ) : (
                    t.aiGenerate
                  )}
                </button>
              </div>
              <textarea
                value={form.bio}
                onChange={(e) => set("bio", e.target.value)}
                placeholder={t.bioPlaceholder}
                rows={5}
                className={inputClass + " resize-none"}
              />
            </div>
          </Section>

          {/* Industries */}
          <Section>
            <div className="flex items-center justify-between mb-3">
              <label className="font-body text-xs text-[#E8E2D8]/60 tracking-widest uppercase">
                {t.industries}
              </label>
              <span className="font-body text-[10px] text-[#555555]">
                {t.industriesHint} ({form.industries.length}/5)
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {INDUSTRIES.map((ind) => {
                const selected = form.industries.includes(ind);
                const disabled = !selected && form.industries.length >= 5;
                return (
                  <button
                    key={ind}
                    type="button"
                    onClick={() => toggleIndustry(ind)}
                    disabled={disabled}
                    className="px-3 py-1.5 rounded-full font-body text-xs transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                    style={{
                      background: selected ? "rgba(184,148,79,0.2)" : "rgba(255,255,255,0.04)",
                      border: selected
                        ? "1px solid rgba(184,148,79,0.5)"
                        : "1px solid rgba(255,255,255,0.08)",
                      color: selected ? "#B8944F" : "rgba(232,226,216,0.5)",
                    }}
                  >
                    {ind}
                  </button>
                );
              })}
            </div>
          </Section>

          {/* Company Size */}
          <Section>
            <Field label={t.companySize}>
              <select
                value={form.companySize}
                onChange={(e) => set("companySize", e.target.value)}
                className={inputClass}
                style={{ appearance: "none" }}
              >
                {COMPANY_SIZES.map((s) => (
                  <option key={s.value} value={s.value} style={{ background: "#1a1a1a" }}>
                    {lang === "zh" ? s.labelZh : s.labelEn}
                  </option>
                ))}
              </select>
            </Field>
          </Section>

          {/* Social Links */}
          <Section>
            <p className="font-body text-xs text-[#E8E2D8]/60 tracking-widest uppercase mb-4">
              {t.socialLinks}
            </p>
            <div className="space-y-3">
              <Field label={t.linkedin}>
                <input
                  value={form.linkedin}
                  onChange={(e) => set("linkedin", e.target.value)}
                  placeholder="https://linkedin.com/in/your-name"
                  className={inputClass}
                  type="url"
                />
              </Field>
              <Field label={t.twitter}>
                <input
                  value={form.twitter}
                  onChange={(e) => set("twitter", e.target.value)}
                  placeholder="https://x.com/your-handle"
                  className={inputClass}
                  type="url"
                />
              </Field>
              <Field label={t.website}>
                <input
                  value={form.website}
                  onChange={(e) => set("website", e.target.value)}
                  placeholder="https://yoursite.com"
                  className={inputClass}
                  type="url"
                />
              </Field>
              <Field label={t.calendly}>
                <input
                  value={form.calendly}
                  onChange={(e) => set("calendly", e.target.value)}
                  placeholder="https://calendly.com/your-link"
                  className={inputClass}
                  type="url"
                />
              </Field>
            </div>
          </Section>
        </div>

        {/* Save Button */}
        <div className="mt-8 flex items-center gap-4">
          <button
            onClick={handleSave}
            disabled={submitting || !form.displayName || !form.title || !form.company}
            className="flex items-center gap-2 bg-[#B8944F] hover:bg-[#9d7c3e] disabled:opacity-40 disabled:cursor-not-allowed text-[#FEFCF7] font-body font-medium rounded-full px-8 py-3 text-sm transition-colors cursor-pointer"
          >
            {saveState === "saved" ? (
              <>
                <Check className="w-4 h-4" />
                {t.saved}
              </>
            ) : saveState === "saving" ? (
              <>
                <span className="w-4 h-4 border-2 border-[#FEFCF7] border-t-transparent rounded-full animate-spin" />
                {t.saving}
              </>
            ) : (
              t.saveChanges
            )}
          </button>
          <Link
            href="/dashboard"
            className="font-body text-sm text-[#555555] hover:text-[#E8E2D8] transition-colors"
          >
            {lang === "zh" ? "取消" : "Cancel"}
          </Link>
        </div>
      </div>
    </main>
  );
}

function Section({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-[20px] p-6 space-y-4"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(184,148,79,0.12)",
      }}
    >
      {children}
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="font-body text-xs text-[#E8E2D8]/60 tracking-widest uppercase block mb-2">
        {label}
        {required && <span className="text-[#B8944F] ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}
