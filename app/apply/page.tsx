"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

const copy = {
  en: {
    title: "Apply for membership",
    sub: "Tell us about yourself. Approved immediately.",
    nameLabel: "Full Name",
    namePlaceholder: "Sarah Chen",
    titleLabel: "Job Title",
    titlePlaceholder: "VP of Product / CTO",
    companyLabel: "Company",
    companyPlaceholder: "Luminex AI",
    linkedinLabel: "LinkedIn Profile URL",
    linkedinPlaceholder: "https://linkedin.com/in/yourname",
    linkedinHint: "Must include linkedin.com/in/",
    submit: "Submit Application",
    submitting: "Submitting...",
    successTitle: "Welcome to Chief.me",
    successSub: "Your membership is confirmed. Your doorplate is now live.",
    goDashboard: "Go to Dashboard",
    required: "All fields are required",
  },
  zh: {
    title: "申请会员资格",
    sub: "填写以下信息，提交即视为通过。",
    nameLabel: "姓名",
    namePlaceholder: "陈思远",
    titleLabel: "职位",
    titlePlaceholder: "VP of Product / CTO",
    companyLabel: "公司",
    companyPlaceholder: "星云科技",
    linkedinLabel: "LinkedIn 主页 URL",
    linkedinPlaceholder: "https://linkedin.com/in/yourname",
    linkedinHint: "必须包含 linkedin.com/in/",
    submit: "提交申请",
    submitting: "提交中...",
    successTitle: "欢迎加入 Chief.me",
    successSub: "会员资格已确认，您的数字门牌已上线。",
    goDashboard: "进入控制台",
    required: "所有字段均为必填项",
  },
};

const inputClass =
  "w-full bg-[#FEFCF7]/5 border border-[#E8E2D8]/10 rounded-[12px] px-4 py-3 font-body text-[#FEFCF7] text-sm placeholder:text-[#555555] focus:outline-none focus:border-[#B8944F]/50 transition-colors";

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="font-body text-xs text-[#E8E2D8]/60 tracking-widest uppercase block mb-2">
        {label} <span className="text-[#B8944F]">*</span>
      </label>
      {children}
      {hint && !error && <p className="font-body text-[10px] text-[#555555] mt-1">{hint}</p>}
      {error && <p className="font-body text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}

export default function ApplyPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [lang, setLang] = useState<"en" | "zh">("en");
  const t = copy[lang];

  const [form, setForm] = useState({ displayName: "", title: "", company: "", linkedinUrl: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("chief-lang") as "en" | "zh" | null;
    if (saved === "en" || saved === "zh") setLang(saved);
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/join");
    if (status === "authenticated" && session.user.profile) router.replace("/dashboard");
  }, [status, session, router]);

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: "" }));
    setGlobalError("");
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.displayName.trim()) e.displayName = t.required;
    if (!form.title.trim()) e.title = t.required;
    if (!form.company.trim()) e.company = t.required;
    if (!form.linkedinUrl.trim()) e.linkedinUrl = t.required;
    else if (!/linkedin\.com\/in\//i.test(form.linkedinUrl)) e.linkedinUrl = t.linkedinHint;
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitting(true);
    setGlobalError("");
    try {
      const res = await fetch("/api/profile/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setGlobalError(data.error ?? "Something went wrong"); setSubmitting(false); return; }
      await update();
      setDone(true);
    } catch {
      setGlobalError("Network error. Please try again.");
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

  return (
    <main className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center px-6 relative">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 60% 50% at 50% 40%, rgba(184,148,79,0.07) 0%, transparent 70%)" }}
      />
      <Link href="/" className="absolute top-6 left-6 flex items-center gap-2 font-body text-sm text-[#555555] hover:text-[#E8E2D8] transition-colors">
        <ArrowLeft className="w-4 h-4" />
      </Link>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Image src="/logo.png" alt="chief.me" height={358} width={623} style={{ height: "56px", width: "auto", filter: "brightness(0) invert(1)" }} />
          <div className="text-[10px] font-body tracking-[0.25em] text-[#B8944F] uppercase mt-1">Founding Member</div>
        </div>

        <div className="rounded-[20px] p-8" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(184,148,79,0.15)" }}>
          {done ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full bg-[#B8944F]/15 flex items-center justify-center mx-auto mb-5">
                <Check className="w-7 h-7 text-[#B8944F]" />
              </div>
              <h1 className="font-display text-2xl font-bold text-[#FEFCF7] mb-2">{t.successTitle}</h1>
              <p className="font-body text-[#555555] text-sm mb-8">{t.successSub}</p>
              <Link href="/dashboard" className="block w-full text-center bg-[#B8944F] hover:bg-[#9d7c3e] text-[#FEFCF7] font-body font-medium rounded-full py-3 text-sm transition-colors">
                {t.goDashboard}
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <h1 className="font-display text-2xl font-bold text-[#FEFCF7] mb-1">{t.title}</h1>
              <p className="font-body text-[#555555] text-sm mb-6">{t.sub}</p>

              {globalError && (
                <div className="mb-4 p-3 rounded-[10px] bg-red-500/10 border border-red-500/20">
                  <p className="font-body text-red-400 text-xs">{globalError}</p>
                </div>
              )}

              <div className="space-y-4">
                <Field label={t.nameLabel} error={errors.displayName}>
                  <input value={form.displayName} onChange={(e) => set("displayName", e.target.value)} placeholder={t.namePlaceholder} className={inputClass} />
                </Field>
                <Field label={t.titleLabel} error={errors.title}>
                  <input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder={t.titlePlaceholder} className={inputClass} />
                </Field>
                <Field label={t.companyLabel} error={errors.company}>
                  <input value={form.company} onChange={(e) => set("company", e.target.value)} placeholder={t.companyPlaceholder} className={inputClass} />
                </Field>
                <Field label={t.linkedinLabel} hint={t.linkedinHint} error={errors.linkedinUrl}>
                  <input
                    value={form.linkedinUrl}
                    onChange={(e) => set("linkedinUrl", e.target.value)}
                    placeholder={t.linkedinPlaceholder}
                    type="url"
                    className={inputClass}
                  />
                </Field>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="mt-6 w-full flex items-center justify-center gap-2 bg-[#B8944F] hover:bg-[#9d7c3e] disabled:opacity-60 text-[#FEFCF7] font-body font-medium rounded-full py-3 text-sm transition-colors cursor-pointer"
              >
                {submitting ? (
                  <span className="w-4 h-4 border-2 border-[#FEFCF7] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>{t.submit} <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </form>
          )}
        </div>

        <p className="text-center font-body text-[#555555] text-xs mt-6">
          10,000 seats · VP+ only · Free forever
        </p>
      </div>
    </main>
  );
}
