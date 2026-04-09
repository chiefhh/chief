"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

export default function OnboardingPage() {
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

  return (
    <main className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center px-6 relative">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 40%, rgba(184,148,79,0.07) 0%, transparent 70%)",
        }}
      />

      <div className="relative w-full max-w-md text-center">
        {/* Logo */}
        <div className="font-display text-3xl font-bold text-[#FEFCF7] mb-1">
          chief<span className="text-[#B8944F]">.me</span>
        </div>
        <div className="text-[10px] font-body tracking-[0.25em] text-[#B8944F] uppercase mb-10">
          Founding Member
        </div>

        {/* Card */}
        <div
          className="rounded-[20px] p-8 text-left"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(184,148,79,0.15)",
          }}
        >
          <h1 className="font-display text-2xl font-bold text-[#FEFCF7] mb-2">
            Welcome{session?.user?.name ? `, ${session.user.name.split(" ")[0]}` : ""}
          </h1>
          <p className="font-body text-[#555555] text-sm mb-8">
            Your account has been created. Profile setup is coming soon.
          </p>

          <div className="space-y-3">
            <Link
              href="/"
              className="block w-full text-center bg-[#B8944F] hover:bg-[#9d7c3e] text-[#FEFCF7] font-body font-medium rounded-full py-3 text-sm transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>

        <p className="text-center font-body text-[#555555] text-xs mt-6">
          1,000 seats · VP+ only · Free forever
        </p>
      </div>
    </main>
  );
}
