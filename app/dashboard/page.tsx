"use client";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { User, LogOut, ExternalLink, Clock } from "lucide-react";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/join");
    }
  }, [status, router]);

  if (status === "loading") {
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
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(184,148,79,0.06) 0%, transparent 70%)",
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

        {/* Welcome card */}
        <div
          className="rounded-[20px] p-8 mb-6"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(184,148,79,0.15)",
          }}
        >
          <div className="flex items-center gap-4 mb-6">
            {user?.image ? (
              <img src={user.image} alt="" className="w-14 h-14 rounded-full" />
            ) : (
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#B8944F]/40 to-[#E8D5A0]/20 flex items-center justify-center font-display font-bold text-[#B8944F] text-xl">
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

          <div
            className="rounded-[12px] px-5 py-4 flex items-center gap-3"
            style={{ background: "rgba(184,148,79,0.08)", border: "1px solid rgba(184,148,79,0.2)" }}
          >
            <Clock className="w-4 h-4 text-[#B8944F] flex-shrink-0" />
            <p className="font-body text-sm text-[#E8E2D8]/70">
              Your profile page is being set up. Full profile editing coming soon.
            </p>
          </div>
        </div>

        {/* Action cards */}
        <div className="grid md:grid-cols-2 gap-4">
          <div
            className="rounded-[16px] p-6"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div className="w-9 h-9 rounded-[10px] bg-[#B8944F]/10 flex items-center justify-center mb-4">
              <User className="w-4 h-4 text-[#B8944F]" />
            </div>
            <h2 className="font-body font-semibold text-[#FEFCF7] text-sm mb-1">Your Profile</h2>
            <p className="font-body text-[#555555] text-xs leading-relaxed">
              Public doorplate page at chief.me/your-slug. Setup coming soon.
            </p>
          </div>

          <Link
            href="/members"
            className="rounded-[16px] p-6 transition-colors hover:border-[#B8944F]/30"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div className="w-9 h-9 rounded-[10px] bg-[#B8944F]/10 flex items-center justify-center mb-4">
              <ExternalLink className="w-4 h-4 text-[#B8944F]" />
            </div>
            <h2 className="font-body font-semibold text-[#FEFCF7] text-sm mb-1">Member Directory</h2>
            <p className="font-body text-[#555555] text-xs leading-relaxed">
              Browse founding members of chief.me.
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
