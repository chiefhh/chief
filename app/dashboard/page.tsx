"use client";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { LogOut, ExternalLink, Settings, ArrowRight, Users } from "lucide-react";

interface ProfileData {
  slug: string;
  globalNumber: number;
  displayName: string;
  title: string;
  company: string;
  headline: string | null;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/join");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/profile/setup")
      .then((r) => r.json())
      .then((d) => setProfile(d.profile ?? null))
      .finally(() => setLoadingProfile(false));
  }, [status]);

  if (status === "loading" || loadingProfile) {
    return (
      <main className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#B8944F] border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  const user = session?.user;
  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "?";

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
            Sign out
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
              Claim your doorplate
            </h2>
            <p className="font-body text-[#555555] text-sm mb-6">
              Set up your public profile page at chief.me/your-name — takes less than 2 minutes.
            </p>
            <Link
              href="/onboarding"
              className="inline-flex items-center gap-2 bg-[#B8944F] hover:bg-[#9d7c3e] text-[#FEFCF7] font-body font-medium rounded-full px-6 py-3 text-sm transition-colors"
            >
              Set up my profile <ArrowRight className="w-4 h-4" />
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
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <span className="font-body text-sm text-[#E8E2D8]/60">
                chief.me/{profile.slug}
              </span>
              <Link
                href={`/chief/${profile.slug}`}
                target="_blank"
                className="flex items-center gap-1.5 font-body text-xs text-[#B8944F] hover:text-[#E8D5A0] transition-colors"
              >
                View <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>
        )}

        {/* Action cards */}
        <div className="grid md:grid-cols-2 gap-4">
          {profile && (
            <Link
              href="/onboarding"
              className="rounded-[16px] p-6 transition-colors hover:border-[#B8944F]/30 group"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div className="w-9 h-9 rounded-[10px] bg-[#B8944F]/10 flex items-center justify-center mb-4 group-hover:bg-[#B8944F]/20 transition-colors">
                <Settings className="w-4 h-4 text-[#B8944F]" />
              </div>
              <h3 className="font-body font-semibold text-[#FEFCF7] text-sm mb-1">Edit Profile</h3>
              <p className="font-body text-[#555555] text-xs leading-relaxed">
                Update your bio, headline, and public information.
              </p>
            </Link>
          )}

          <Link
            href="/members"
            className="rounded-[16px] p-6 transition-colors hover:border-[#B8944F]/30 group"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div className="w-9 h-9 rounded-[10px] bg-[#B8944F]/10 flex items-center justify-center mb-4 group-hover:bg-[#B8944F]/20 transition-colors">
              <Users className="w-4 h-4 text-[#B8944F]" />
            </div>
            <h3 className="font-body font-semibold text-[#FEFCF7] text-sm mb-1">Member Directory</h3>
            <p className="font-body text-[#555555] text-xs leading-relaxed">
              Browse all founding members of chief.me.
            </p>
          </Link>
        </div>

        <p className="text-center font-body text-[#555555] text-xs mt-10">
          Founding Member · 1,000 seats · VP+ only · Free forever
        </p>
      </div>
    </main>
  );
}
