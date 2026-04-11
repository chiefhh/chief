"use client";
import { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Suspense } from "react";

const copy = {
  en: {
    back: "Back",
    title: "Claim your doorplate",
    sub: "Sign in with Google to get started — it takes less than 2 minutes.",
    orSign: "Sign in with Google to continue",
    google: "Continue with Google",
    founding: "Founding Member",
    seats: "10,000 Founding Seats · VP+ only · Free forever",
  },
  zh: {
    back: "返回",
    title: "认领你的数字门牌",
    sub: "使用 Google 账号登录即可开始 — 不到 2 分钟完成。",
    orSign: "使用 Google 账号登录",
    google: "通过 Google 继续",
    founding: "创始成员",
    seats: "10,000 个创始席位 · 仅限 VP+ · 永久免费",
  },
};

function JoinForm() {
  const { lang } = useLanguage();
  const t = copy[lang];
  const searchParams = useSearchParams();
  const router = useRouter();
  const { status } = useSession();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Already logged in → go to dashboard
  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [status, router]);

  // Show NextAuth error if redirected back with ?error=
  useEffect(() => {
    const err = searchParams.get("error");
    if (err) {
      setError(`Auth error: ${err}. Check Vercel env vars & Google OAuth callback URL.`);
    }
  }, [searchParams]);

  async function handleGoogle() {
    setLoading(true);
    signIn("google", { callbackUrl: "/onboarding" });
  }

  return (
    <div className="relative w-full max-w-md">
      {/* Logo */}
      <div className="text-center mb-10">
        <div className="font-display text-3xl font-bold text-[#FEFCF7] mb-1">
          chief<span className="text-[#B8944F]">.me</span>
        </div>
        <div className="text-[10px] font-body tracking-[0.25em] text-[#B8944F] uppercase">
          {t.founding}
        </div>
      </div>

      {/* Card */}
      <div
        className="rounded-[20px] p-8"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(184,148,79,0.15)",
        }}
      >
        <h1 className="font-display text-2xl font-bold text-[#FEFCF7] mb-2">{t.title}</h1>
        <p className="font-body text-[#555555] text-sm mb-8">{t.sub}</p>

        {error && (
          <div className="mb-6 p-3 rounded-[10px] bg-red-500/10 border border-red-500/20">
            <p className="font-body text-red-400 text-xs">{error}</p>
          </div>
        )}

        <p className="font-body text-[#E8E2D8]/70 text-sm text-center mb-6">{t.orSign}</p>

        <button
          onClick={handleGoogle}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-[#FEFCF7] hover:bg-[#E8E2D8] text-[#0A0A0A] font-body font-medium rounded-full py-3 text-sm transition-colors disabled:opacity-60 cursor-pointer"
        >
          {!loading && (
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
          )}
          {loading ? (lang === "zh" ? "跳转中..." : "Redirecting...") : t.google}
        </button>
      </div>

      <p className="text-center font-body text-[#555555] text-xs mt-6">{t.seats}</p>
    </div>
  );
}

export default function JoinPage() {
  return (
    <main className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center px-6 relative">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 40%, rgba(184,148,79,0.07) 0%, transparent 70%)",
        }}
      />
      <Link
        href="/"
        className="absolute top-6 left-6 flex items-center gap-2 font-body text-sm text-[#555555] hover:text-[#E8E2D8] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
      </Link>
      <Suspense fallback={null}>
        <JoinForm />
      </Suspense>
    </main>
  );
}
