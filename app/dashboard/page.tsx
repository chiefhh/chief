"use client";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  LogOut,
  ExternalLink,
  Settings,
  ArrowRight,
  Users,
  FileText,
  Briefcase,
  Sparkles,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface ProfileData {
  slug: string;
  globalNumber: number;
  displayName: string;
  title: string;
  company: string;
  headline: string | null;
  viewCount: number;
  connectionCount: number;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t, lang } = useLanguage();
  const d = t.dashboard;
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [copied, setCopied] = useState(false);

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

  const inviteCode = profile
    ? `CHIEF-${profile.slug.slice(0, 4).toUpperCase()}-${String(profile.globalNumber).padStart(4, "0")}`
    : null;

  function handleCopy() {
    if (!inviteCode) return;
    navigator.clipboard.writeText(inviteCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const quickActions = [
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
  ];

  return (
    <main className="min-h-screen bg-[#0A0A0A] px-6 py-12">
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
          <Link href="/" className="font-display text-xl font-bold text-[#FEFCF7]">
            chief<span className="text-[#B8944F]">.me</span>
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
              href="/onboarding"
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
            {quickActions.filter((a) => a.showAlways).map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="rounded-[14px] p-5 group"
                style={{
                  background: "rgba(184,148,79,0.06)",
                  border: "1px solid rgba(184,148,79,0.15)",
                }}
              >
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
              </Link>
            ))}
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
            <div
              className="text-center"
              style={{
                borderLeft: "1px solid rgba(184,148,79,0.1)",
                borderRight: "1px solid rgba(184,148,79,0.1)",
              }}
            >
              <p className="font-display text-2xl font-bold" style={{ color: "#FEFCF7" }}>
                {pendingCount}
              </p>
              <p className="font-body text-xs mt-1" style={{ color: "#555555" }}>
                {d.pendingRequests}
              </p>
            </div>
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

        {/* Invite Code Module — coming soon */}
        {profile && inviteCode && (
          <div
            className="rounded-[16px] p-6 mb-6 opacity-50"
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(184,148,79,0.08)",
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <p className="font-body text-[10px] tracking-widest uppercase" style={{ color: "#555555" }}>
                {d.inviteCode}
              </p>
              <span
                className="font-body text-[9px] tracking-widest uppercase px-2 py-0.5 rounded-full"
                style={{ background: "rgba(184,148,79,0.1)", color: "rgba(184,148,79,0.6)", border: "1px solid rgba(184,148,79,0.15)" }}
              >
                {lang === "zh" ? "即将推出" : "Coming Soon"}
              </span>
            </div>
            <p className="font-mono text-2xl font-bold mb-1" style={{ color: "rgba(184,148,79,0.4)" }}>
              {inviteCode}
            </p>
            <p className="font-body text-xs mb-4" style={{ color: "#555555" }}>
              {d.inviteDesc}
            </p>
            <button
              disabled
              className="inline-flex items-center gap-2 font-body font-medium rounded-full px-5 py-2 text-sm cursor-not-allowed"
              style={{ background: "rgba(184,148,79,0.06)", color: "rgba(184,148,79,0.4)" }}
            >
              {d.copyCode}
            </button>
          </div>
        )}

        <p className="text-center font-body text-[#555555] text-xs mt-2">
          {d.foundingFine}
        </p>
      </div>
    </main>
  );
}
