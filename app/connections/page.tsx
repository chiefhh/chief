"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Check, X } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface ConnectionRequest {
  id: string;
  message: string | null;
  createdAt: string;
  sender: {
    displayName: string;
    title: string;
    company: string;
    slug: string;
  };
}

const copy = {
  en: {
    title: "Pending Requests",
    back: "Back to Dashboard",
    empty: "No pending requests",
    emptyDesc: "When someone requests to connect, it will appear here.",
    accept: "Accept",
    decline: "Decline",
  },
  zh: {
    title: "待处理请求",
    back: "返回控制台",
    empty: "暂无待处理请求",
    emptyDesc: "当有人发起连接请求时，将会显示在这里。",
    accept: "通过",
    decline: "拒绝",
  },
};

export default function ConnectionsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { lang } = useLanguage();
  const t = copy[lang];

  const [requests, setRequests] = useState<ConnectionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/join");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/connections/list")
      .then((r) => r.json())
      .then((data) => setRequests(data.requests ?? []))
      .finally(() => setLoading(false));
  }, [status]);

  async function respond(requestId: string, action: "ACCEPT" | "DECLINE") {
    setResponding(requestId);
    setRequests((prev) => prev.filter((r) => r.id !== requestId));
    try {
      await fetch("/api/connections/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, action }),
      });
    } catch {
      // silently fail — item already removed optimistically
    }
    setResponding(null);
  }

  if (status === "loading" || loading) {
    return (
      <main className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#B8944F] border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

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
            <Image
              src="/logo.png"
              alt="chief.me"
              height={358}
              width={623}
              style={{ height: "44px", width: "auto", filter: "brightness(0) invert(1)" }}
            />
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

        {requests.length === 0 ? (
          <div
            className="rounded-[20px] p-10 text-center"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(184,148,79,0.12)",
            }}
          >
            <p className="font-display text-lg font-bold text-[#FEFCF7] mb-2">{t.empty}</p>
            <p className="font-body text-sm text-[#555555]">{t.emptyDesc}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => {
              const initials = req.sender.displayName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase();
              return (
                <div
                  key={req.id}
                  className="rounded-[20px] p-6"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(184,148,79,0.15)",
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#B8944F]/40 to-[#E8D5A0]/20 flex items-center justify-center font-display font-bold text-[#B8944F] text-sm flex-shrink-0">
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/chief/${req.sender.slug}`}
                        target="_blank"
                        className="font-body font-semibold text-sm text-[#FEFCF7] hover:text-[#B8944F] transition-colors"
                      >
                        {req.sender.displayName}
                      </Link>
                      <p className="font-body text-xs text-[#555555] mt-0.5">
                        {req.sender.title} · {req.sender.company}
                      </p>
                      {req.message && (
                        <p className="font-body text-sm text-[#E8E2D8]/60 mt-2 italic">
                          &ldquo;{req.message}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3 mt-5">
                    <button
                      onClick={() => respond(req.id, "ACCEPT")}
                      disabled={responding === req.id}
                      className="flex items-center gap-1.5 bg-[#B8944F] hover:bg-[#9d7c3e] disabled:opacity-40 text-[#FEFCF7] font-body font-medium rounded-full px-5 py-2 text-sm transition-colors cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      {t.accept}
                    </button>
                    <button
                      onClick={() => respond(req.id, "DECLINE")}
                      disabled={responding === req.id}
                      className="flex items-center gap-1.5 font-body text-sm text-[#555555] hover:text-[#E8E2D8] transition-colors cursor-pointer disabled:opacity-40 rounded-full px-5 py-2"
                      style={{ border: "1px solid rgba(255,255,255,0.08)" }}
                    >
                      <X className="w-3.5 h-3.5" />
                      {t.decline}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
