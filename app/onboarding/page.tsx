"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 40);
}

export default function OnboardingPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    displayName: "",
    title: "",
    company: "",
    slug: "",
    headline: "",
    bio: "",
  });
  const [slugEdited, setSlugEdited] = useState(false);
  const [slugError, setSlugError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [generatingBio, setGeneratingBio] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/join");
    if (status === "authenticated" && session.user.profile) {
      router.replace("/dashboard");
    }
  }, [status, session, router]);

  // Auto-generate slug from displayName
  useEffect(() => {
    if (!slugEdited && form.displayName) {
      setForm((f) => ({ ...f, slug: slugify(form.displayName) }));
    }
  }, [form.displayName, slugEdited]);

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    if (field === "slug") {
      setSlugEdited(true);
      setSlugError("");
    }
  }

  async function handleGenerateBio() {
    setGeneratingBio(true);
    try {
      const language = navigator.language?.startsWith('zh') ? 'zh' : 'en';
      const res = await fetch('/api/ai/generate-bio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.displayName,
          title: form.title,
          company: form.company,
          language,
        }),
      });
      const data = await res.json();
      if (res.ok && data.bio) {
        set('bio', data.bio);
      }
    } catch {
      // silently fail — user can still type manually
    }
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
        if (res.status === 409 && data.error?.includes("URL")) {
          setSlugError(data.error);
          setStep(1);
        } else {
          setError(data.error ?? "Something went wrong");
        }
        setSubmitting(false);
        return;
      }
      await update(); // refresh session with new profile
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

  return (
    <main className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center px-6 relative">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 40%, rgba(184,148,79,0.07) 0%, transparent 70%)",
        }}
      />

      {step < 3 && (
        <Link
          href="/dashboard"
          className="absolute top-6 left-6 flex items-center gap-2 font-body text-sm text-[#555555] hover:text-[#E8E2D8] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
      )}

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="mb-1">
            <Image src="/logo.png" alt="chief.me" height={1024} width={1024} style={{ height: "48px", width: "auto", filter: "brightness(0) invert(1)" }} />
          </div>
          <div className="text-[10px] font-body tracking-[0.25em] text-[#B8944F] uppercase">
            Founding Member
          </div>
        </div>

        {/* Step indicators */}
        {step < 3 && (
          <div className="flex items-center gap-2 justify-center mb-8">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-body transition-all ${
                    s < step
                      ? "bg-[#B8944F] text-[#0A0A0A]"
                      : s === step
                      ? "border border-[#B8944F] text-[#B8944F]"
                      : "border border-[#555555]/40 text-[#555555]"
                  }`}
                >
                  {s < step ? <Check className="w-3 h-3" /> : s}
                </div>
                {s < 2 && <div className="w-8 h-px bg-[#555555]/30" />}
              </div>
            ))}
          </div>
        )}

        {/* Card */}
        <div
          className="rounded-[20px] p-8"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(184,148,79,0.15)",
          }}
        >
          {/* Step 1: Basic info */}
          {step === 1 && (
            <>
              <h1 className="font-display text-2xl font-bold text-[#FEFCF7] mb-1">
                Claim your doorplate
              </h1>
              <p className="font-body text-[#555555] text-sm mb-6">
                Your public URL will be chief.me/{form.slug || "your-name"}
              </p>

              {error && (
                <div className="mb-4 p-3 rounded-[10px] bg-red-500/10 border border-red-500/20">
                  <p className="font-body text-red-400 text-xs">{error}</p>
                </div>
              )}

              <div className="space-y-4">
                <Field label="Display Name" required>
                  <input
                    value={form.displayName}
                    onChange={(e) => set("displayName", e.target.value)}
                    placeholder="Sarah Chen"
                    className={inputClass}
                  />
                </Field>

                <Field label="Title" required>
                  <input
                    value={form.title}
                    onChange={(e) => set("title", e.target.value)}
                    placeholder="CTO"
                    className={inputClass}
                  />
                </Field>

                <Field label="Company" required>
                  <input
                    value={form.company}
                    onChange={(e) => set("company", e.target.value)}
                    placeholder="Luminex AI"
                    className={inputClass}
                  />
                </Field>

                <Field label="Your URL" required error={slugError}>
                  <div className="flex items-center gap-0 rounded-[12px] overflow-hidden border border-[#E8E2D8]/10 focus-within:border-[#B8944F]/50 transition-colors">
                    <span className="font-body text-[#555555] text-sm px-3 py-3 bg-[#FEFCF7]/3 border-r border-[#E8E2D8]/10 whitespace-nowrap">
                      chief.me/
                    </span>
                    <input
                      value={form.slug}
                      onChange={(e) => set("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                      placeholder="your-name"
                      className="flex-1 bg-transparent px-3 py-3 font-body text-[#FEFCF7] text-sm focus:outline-none"
                    />
                  </div>
                </Field>
              </div>

              <button
                onClick={() => {
                  if (!form.displayName || !form.title || !form.company || !form.slug) return;
                  setStep(2);
                }}
                disabled={!form.displayName || !form.title || !form.company || !form.slug}
                className="mt-6 w-full flex items-center justify-center gap-2 bg-[#B8944F] hover:bg-[#9d7c3e] disabled:opacity-40 disabled:cursor-not-allowed text-[#FEFCF7] font-body font-medium rounded-full py-3 text-sm transition-colors cursor-pointer"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </>
          )}

          {/* Step 2: Bio */}
          {step === 2 && (
            <>
              <h1 className="font-display text-2xl font-bold text-[#FEFCF7] mb-1">
                Your story
              </h1>
              <p className="font-body text-[#555555] text-sm mb-6">
                Optional — you can always add this later.
              </p>

              {error && (
                <div className="mb-4 p-3 rounded-[10px] bg-red-500/10 border border-red-500/20">
                  <p className="font-body text-red-400 text-xs">{error}</p>
                </div>
              )}

              <div className="space-y-4">
                <Field label="Headline">
                  <input
                    value={form.headline}
                    onChange={(e) => set("headline", e.target.value)}
                    placeholder="Building AI infrastructure for the next decade"
                    className={inputClass}
                  />
                </Field>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="font-body text-xs text-[#E8E2D8]/60 tracking-widest uppercase">
                      Bio
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
                          Generating...
                        </>
                      ) : (
                        '✨ AI Generate'
                      )}
                    </button>
                  </div>
                  <textarea
                    value={form.bio}
                    onChange={(e) => set("bio", e.target.value)}
                    placeholder="A few sentences about your background, expertise, and what you stand for."
                    rows={4}
                    className={inputClass + " resize-none"}
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 border border-[#E8E2D8]/15 text-[#E8E2D8]/60 hover:text-[#E8E2D8] font-body font-medium rounded-full py-3 text-sm transition-colors cursor-pointer"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#B8944F] hover:bg-[#9d7c3e] disabled:opacity-60 text-[#FEFCF7] font-body font-medium rounded-full py-3 text-sm transition-colors cursor-pointer"
                >
                  {submitting ? (
                    <span className="w-4 h-4 border-2 border-[#FEFCF7] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>Claim my page <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              </div>
            </>
          )}

          {/* Step 3: Done */}
          {step === 3 && (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full bg-[#B8944F]/15 flex items-center justify-center mx-auto mb-5">
                <Check className="w-7 h-7 text-[#B8944F]" />
              </div>
              <h1 className="font-display text-2xl font-bold text-[#FEFCF7] mb-2">
                Your doorplate is live
              </h1>
              <p className="font-body text-[#555555] text-sm mb-2">
                Your public page is now at:
              </p>
              <p className="font-body text-[#B8944F] text-sm font-medium mb-8">
                chief.me/{form.slug}
              </p>
              <div className="space-y-3">
                <Link
                  href={`/chief/${form.slug}`}
                  className="block w-full text-center bg-[#B8944F] hover:bg-[#9d7c3e] text-[#FEFCF7] font-body font-medium rounded-full py-3 text-sm transition-colors"
                >
                  View my page
                </Link>
                <Link
                  href="/dashboard"
                  className="block w-full text-center border border-[#E8E2D8]/15 text-[#E8E2D8]/60 hover:text-[#E8E2D8] font-body font-medium rounded-full py-3 text-sm transition-colors"
                >
                  Go to Dashboard
                </Link>
              </div>
            </div>
          )}
        </div>

        <p className="text-center font-body text-[#555555] text-xs mt-6">
          10,000 seats · VP+ only · Free forever
        </p>
      </div>
    </main>
  );
}

const inputClass =
  "w-full bg-[#FEFCF7]/5 border border-[#E8E2D8]/10 rounded-[12px] px-4 py-3 font-body text-[#FEFCF7] text-sm placeholder:text-[#555555] focus:outline-none focus:border-[#B8944F]/50 transition-colors";

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="font-body text-xs text-[#E8E2D8]/60 tracking-widest uppercase block mb-2">
        {label}
        {required && <span className="text-[#B8944F] ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="font-body text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}
