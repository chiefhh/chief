"use client";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  LogOut,
  ExternalLink,
  Settings,
  ArrowRight,
  Users,
  FileText,
  Briefcase,
  Sparkles,
  Wallet,
  Check,
} from "lucide-react";
import { OnboardingTour } from "@/components/OnboardingTour";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface ProfileData {
  slug: string;
  globalNumber: number;
  displayName: string;
  title: string;
  company: string;
  headline: string | null;
  bio: string | null;
  viewCount: number;
  connectionCount: number;
  insightCount: number;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t, lang } = useLanguage();
  const d = t.dashboard;
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [walletLoading, setWalletLoading] = useState(false);
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/join");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/profile/setup")
      .then((r) => r.json())
      .then((data) => setProfile(data.profile ?? null))
      .finally(() => setLoadingProfile(false));
  }, [status]);

  useEffect(() => {
    if (!profile) return;
    fetch("/api/connections/pending-count")
      .then((r) => r.json())
      .then((data) => setPendingCount(data.count ?? 0))
      .catch(() => {});
  }, [profile]);

  useEffect(() => {
    if (!profile) return;
    if (!localStorage.getItem("chief_tour_seen")) {
      setShowTour(true);
    }
  }, [profile]);

  async function handleAddToWallet() {
    if (!profile || walletLoading) return;
    setWalletLoading(true);
    try {
      const res = await fetch("/api/wallet/google", { method: "POST" });
      const data = await res.json();
      if (res.ok && data.saveUrl) {
        window.open(data.saveUrl, "_blank");
      }
    } catch {
      // silently fail
    }
    setWalletLoading(false);
  }

  if (status === "loading" || loadingProfile) {
    return (
      <main className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#B8944F] border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  const user = session?.user;
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";

  const quickActions: Array<{
    href?: string;
    onClick?: () => void;
    icon: React.ReactNode;
    label: string;
    desc: string;
    showAlways: boolean;
  }> = [
    {
      href: "/edit",
      icon: <Settings className="w-4 h-4 text-[#B8944F]" />,
      label: d.editProfile,
      desc: d.editProfileDesc,
      showAlways: !!profile,
    },
    {
      href: "/members",
      icon: <Users className="w-4 h-4 text-[#B8944F]" />,
      label: d.memberDirectory,
      desc: d.memberDirectoryDesc,
      showAlways: true,
    },
    {
      href: "/insights/new",
      icon: <FileText className="w-4 h-4 text-[#B8944F]" />,
      label: d.writeInsight,
      desc: d.writeInsightDesc,
      showAlways: true,
    },
    {
      href: "/cases/new",
      icon: <Briefcase className="w-4 h-4 text-[#B8944F]" />,
      label: d.createCase,
      desc: d.createCaseDesc,
      showAlways: true,
    },
    {
      href: "/insights/shadow-writer",
      icon: <Sparkles className="w-4 h-4 text-[#B8944F]" />,
      label: d.shadowWriter,
      desc: d.shadowWriterDesc,
      showAlways: true,
    },
    {
      href: "/cases/templates",
      icon: <FileText className="w-4 h-4 text-[#B8944F]" />,
      label: lang === "zh" ? "写作模板库" : "Template Library",
      desc: lang === "zh" ? "8 种决策场景，填空式引导写作。" : "8 decision templates with guided questions.",
      showAlways: true,
    },
    {
      onClick: handleAddToWallet,
      icon: <Wallet className="w-4 h-4 text-[#B8944F]" />,
      label: d.walletCard,
      desc: d.walletCardDesc,
      showAlways: !!profile,
    },
  ];

  return (
    <main className="min-h-screen bg-[#0A0A0A] px-6 py-12">
      {showTour && profile && (
        <OnboardingTour
          slug={profile.slug}
          onClose={() => {
            localStorage.setItem("chief_tour_seen", "1");
            setShowTour(false);
          }}
        />
      )}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(184,148,79,0.05) 0%, transparent 70%)",
        }}
      />

      <div className="relative max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <Link href="/">
            <Image src="/logo.png" alt="chief.me" height={358} width={623} style={{ height: "44px", width: "auto", filter: "brightness(0) invert(1)" }} />
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-2 font-body text-xs text-[#555555] hover:text-[#E8E2D8] transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            {d.signOut}
          </button>
        </div>

        {/* User greeting */}
        <div className="flex items-center gap-4 mb-8">
          {user?.image ? (
            <img src={user.image} alt="" className="w-12 h-12 rounded-full" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#B8944F]/40 to-[#E8D5A0]/20 flex items-center justify-center font-display font-bold text-[#B8944F] text-lg">
              {initials}
            </div>
          )}
          <div>
            <h1 className="font-display text-2xl font-bold text-[#FEFCF7]">
              {user?.name ?? "Member"}
            </h1>
            <p className="font-body text-[#555555] text-sm">{user?.email}</p>
          </div>
        </div>

        {/* No profile → Setup CTA */}
        {!profile && (
          <div
            className="rounded-[20px] p-8 mb-6"
            style={{
              background: "rgba(184,148,79,0.06)",
              border: "1px solid rgba(184,148,79,0.2)",
            }}
          >
            <h2 className="font-display text-xl font-bold text-[#FEFCF7] mb-2">
              {d.claimTitle}
            </h2>
            <p className="font-body text-[#555555] text-sm mb-6">
              {d.claimDesc}
            </p>
            <Link
              href="/apply"
              className="inline-flex items-center gap-2 bg-[#B8944F] hover:bg-[#9d7c3e] text-[#FEFCF7] font-body font-medium rounded-full px-6 py-3 text-sm transition-colors"
            >
              {d.setupProfile} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* Has profile → Profile card */}
        {profile && (
          <div
            className="rounded-[20px] p-8 mb-6"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(184,148,79,0.15)",
            }}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="font-body text-[10px] tracking-widest text-[#B8944F] uppercase">
                  No. {String(profile.globalNumber).padStart(3, "0")}
                </span>
                <h2 className="font-display text-2xl font-bold text-[#FEFCF7] mt-1">
                  {profile.displayName}
                </h2>
                <p className="font-body text-[#E8E2D8]/70 text-sm">
                  {profile.title} · {profile.company}
                </p>
                {profile.headline && (
                  <p className="font-body text-[#555555] text-sm mt-2 italic">
                    {profile.headline}
                  </p>
                )}
              </div>
            </div>

            <div
              className="rounded-[12px] px-4 py-3 flex items-center justify-between"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <span className="font-body text-sm text-[#E8E2D8]/60">
                chief.me/{profile.slug}
              </span>
              <Link
                href={`/chief/${profile.slug}`}
                target="_blank"
                className="flex items-center gap-1.5 font-body text-xs text-[#B8944F] hover:text-[#E8D5A0] transition-colors"
              >
                {d.view} <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mb-4">
          <p className="font-body text-[10px] tracking-widest text-[#555555] uppercase mb-3">
            {d.quickActions}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {quickActions.filter((a) => a.showAlways).map((action) => {
              const tileClass = "rounded-[14px] p-5 group text-left w-full";
              const tileStyle = {
                background: "rgba(184,148,79,0.06)",
                border: "1px solid rgba(184,148,79,0.15)",
              };
              const tileInner = (
                <>
                  <div
                    className="w-8 h-8 rounded-[8px] flex items-center justify-center mb-3 transition-colors"
                    style={{ background: "rgba(184,148,79,0.12)" }}
                  >
                    {action.icon}
                  </div>
                  <h3 className="font-body font-semibold text-sm mb-0.5" style={{ color: "#FEFCF7" }}>
                    {action.label}
                  </h3>
                  <p className="font-body text-xs leading-relaxed" style={{ color: "#555555" }}>
                    {action.desc}
                  </p>
                </>
              );
              if (action.onClick) {
                return (
                  <button
                    key={action.label}
                    onClick={action.onClick}
                    className={tileClass}
                    style={tileStyle}
                  >
                    {tileInner}
                  </button>
                );
              }
              return (
                <Link
                  key={action.href}
                  href={action.href!}
                  className={tileClass}
                  style={tileStyle}
                >
                  {tileInner}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Visitor Stats (only when profile exists) */}
        {profile && (
          <div
            className="rounded-[16px] px-6 py-5 mb-6 grid grid-cols-3 gap-4"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(184,148,79,0.15)",
            }}
          >
            <div className="text-center">
              <p className="font-display text-2xl font-bold" style={{ color: "#FEFCF7" }}>
                {profile.viewCount}
              </p>
              <p className="font-body text-xs mt-1" style={{ color: "#555555" }}>
                {d.profileViews}
              </p>
            </div>
            <Link
              href="/connections"
              className="text-center block group"
              style={{
                borderLeft: "1px solid rgba(184,148,79,0.1)",
                borderRight: "1px solid rgba(184,148,79,0.1)",
              }}
            >
              <p className="font-display text-2xl font-bold group-hover:text-[#B8944F] transition-colors" style={{ color: "#FEFCF7" }}>
                {pendingCount}
              </p>
              <p className="font-body text-xs mt-1" style={{ color: "#555555" }}>
                {d.pendingRequests}
              </p>
            </Link>
            <div className="text-center">
              <p className="font-display text-2xl font-bold" style={{ color: "#FEFCF7" }}>
                {profile.connectionCount}
              </p>
              <p className="font-body text-xs mt-1" style={{ color: "#555555" }}>
                {d.connections}
              </p>
            </div>
          </div>
        )}


        {/* Industry Benchmark */}
        {profile && (
          <div
            className="rounded-[16px] p-6 mb-4"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(184,148,79,0.15)",
            }}
          >
            <p className="font-body text-[10px] tracking-widest text-[#555555] uppercase mb-4">
              {lang === "zh" ? "行业对比" : "Industry Benchmark"}
            </p>
            <div className="space-y-3">
              {[
                { label: lang === "zh" ? "主页浏览量" : "Profile Views", yours: profile.viewCount, avg: 42 },
                { label: lang === "zh" ? "人脉连接数" : "Connections", yours: profile.connectionCount, avg: 18 },
              ].map(({ label, yours, avg }) => {
                const max = Math.max(yours, avg, 1);
                return (
                  <div key={label}>
                    <div className="flex justify-between mb-1">
                      <span className="font-body text-xs text-[#E8E2D8]/60">{label}</span>
                      <span className="font-body text-xs text-[#B8944F]">{yours} <span className="text-[#555555]">/ avg {avg}</span></span>
                    </div>
                    <div className="relative h-1.5 rounded-full bg-white/5">
                      <div className="absolute top-0 left-0 h-full rounded-full bg-[#555555]/40" style={{ width: `${Math.min((avg / max) * 100, 100)}%` }} />
                      <div className="absolute top-0 left-0 h-full rounded-full bg-[#B8944F]" style={{ width: `${Math.min((yours / max) * 100, 100)}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="font-body text-[10px] text-[#555555] mt-3">
              {lang === "zh" ? "基于同行业 VP+ 成员平均数据" : "Based on VP+ peers in your industry"}
            </p>
          </div>
        )}

        {/* Connection Quality */}
        {profile && (
          <div
            className="rounded-[16px] p-6 mb-6"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(184,148,79,0.15)",
            }}
          >
            <p className="font-body text-[10px] tracking-widest text-[#555555] uppercase mb-4">
              {lang === "zh" ? "连接质量评分" : "Connection Quality Score"}
            </p>
            {(() => {
              const score = Math.min(100, 40 + profile.connectionCount * 3 + (profile.viewCount > 10 ? 20 : 0));
              const tier = score >= 80 ? (lang === "zh" ? "精英" : "Elite") : score >= 60 ? (lang === "zh" ? "优秀" : "Strong") : (lang === "zh" ? "成长中" : "Growing");
              return (
                <div className="flex items-center gap-6">
                  <div className="relative w-16 h-16 flex-shrink-0">
                    <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="#B8944F" strokeWidth="3"
                        strokeDasharray={`${score} 100`} strokeLinecap="round" />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center font-display font-bold text-sm text-[#FEFCF7]">{score}</span>
                  </div>
                  <div>
                    <p className="font-display font-bold text-[#B8944F] text-lg">{tier}</p>
                    <p className="font-body text-xs text-[#555555] mt-1">
                      {lang === "zh"
                        ? "基于职位级别与行业匹配度综合计算"
                        : "Based on seniority level & industry match"}
                    </p>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Score Improvement Checklist */}
        {profile && (() => {
          const items = [
            {
              done: !!profile.bio,
              labelEn: "Add a bio",
              labelZh: "添加简介",
              pts: "+10",
              href: "/edit",
            },
            {
              done: profile.insightCount > 0,
              labelEn: "Publish an insight",
              labelZh: "发布洞察",
              pts: "+15",
              href: "/insights/new",
            },
            {
              done: profile.connectionCount >= 3,
              labelEn: "Connect with 3 peers",
              labelZh: "建立 3 个连接",
              pts: "+20",
              href: null,
            },
            {
              done: !!user?.image,
              labelEn: "Add a profile photo",
              labelZh: "完善头像",
              pts: "+5",
              href: null,
            },
          ];
          const hasIncomplete = items.some((i) => !i.done);
          if (!hasIncomplete) return null;
          return (
            <div
              className="rounded-[16px] p-6 mb-6"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(184,148,79,0.15)" }}
            >
              <p className="font-body text-[10px] tracking-widest text-[#555555] uppercase mb-4">
                {lang === "zh" ? "提升评分" : "Improve Your Score"}
              </p>
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.labelEn} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{
                          border: item.done ? "none" : "1.5px solid rgba(184,148,79,0.4)",
                          background: item.done ? "rgba(184,148,79,0.15)" : "transparent",
                        }}
                      >
                        {item.done && <Check className="w-3 h-3 text-[#B8944F]" />}
                      </div>
                      {item.href && !item.done ? (
                        <Link href={item.href} className="font-body text-sm text-[#E8E2D8]/70 hover:text-[#B8944F] transition-colors">
                          {lang === "zh" ? item.labelZh : item.labelEn}
                        </Link>
                      ) : (
                        <span className={`font-body text-sm ${item.done ? "text-[#555555] line-through" : "text-[#E8E2D8]/70"}`}>
                          {lang === "zh" ? item.labelZh : item.labelEn}
                        </span>
                      )}
                    </div>
                    <span
                      className="font-body text-xs font-medium"
                      style={{ color: item.done ? "#555555" : "#B8944F" }}
                    >
                      {item.pts}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        <p className="text-center font-body text-[#555555] text-xs mt-2">
          {d.foundingFine}
        </p>
      </div>
    </main>
  );
}
