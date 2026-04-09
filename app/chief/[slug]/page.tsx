import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import Link from "next/link";
import { Shield, Check } from "lucide-react";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const profile = await prisma.profile.findUnique({
    where: { slug },
    select: { displayName: true, title: true, company: true, headline: true },
  });
  if (!profile) return { title: "Not Found" };
  return {
    title: `${profile.displayName} — chief.me`,
    description: profile.headline ?? `${profile.title} at ${profile.company}`,
  };
}

export default async function ProfilePage({ params }: Props) {
  const { slug } = await params;

  const profile = await prisma.profile.findUnique({
    where: { slug },
    select: {
      slug: true,
      globalNumber: true,
      displayName: true,
      title: true,
      company: true,
      headline: true,
      bio: true,
      industries: true,
      verified: true,
      user: { select: { image: true, name: true } },
    },
  });

  if (!profile) notFound();

  const initials = profile.displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <main className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center px-6 py-16">
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 30%, rgba(184,148,79,0.07) 0%, transparent 70%)",
        }}
      />

      <div className="relative w-full max-w-md">
        {/* Doorplate card */}
        <div
          className="rounded-[24px] overflow-hidden"
          style={{
            background: "#0F0F0F",
            border: "1px solid rgba(184,148,79,0.2)",
            boxShadow: "0 32px 80px rgba(0,0,0,0.4)",
          }}
        >
          {/* Gold line top */}
          <div
            className="h-0.5 w-full"
            style={{
              background:
                "linear-gradient(90deg, transparent, #B8944F 30%, #E8D5A0 50%, #B8944F 70%, transparent)",
            }}
          />

          <div className="p-8">
            {/* Number */}
            <div className="flex items-center justify-between mb-6">
              <span className="font-body text-[10px] tracking-[0.3em] text-[#B8944F] uppercase">
                Founding Member
              </span>
              <span className="font-body text-[10px] tracking-[0.3em] text-[#B8944F]">
                No. {String(profile.globalNumber).padStart(3, "0")}
              </span>
            </div>

            {/* Avatar + name */}
            <div className="flex items-start gap-4 mb-6">
              {profile.user.image ? (
                <img
                  src={profile.user.image}
                  alt={profile.displayName}
                  className="w-16 h-16 rounded-full ring-2 ring-[#B8944F]/20"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#B8944F]/40 to-[#E8D5A0]/20 flex items-center justify-center font-display font-bold text-[#B8944F] text-2xl flex-shrink-0">
                  {initials}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h1 className="font-display text-2xl font-bold text-[#FEFCF7] leading-tight">
                    {profile.displayName}
                  </h1>
                  {profile.verified && (
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#B8944F]/20 flex items-center justify-center">
                      <Check className="w-3 h-3 text-[#B8944F]" />
                    </span>
                  )}
                </div>
                <p className="font-body text-[#E8E2D8]/70 text-sm">
                  {profile.title}
                </p>
                <p className="font-body text-[#555555] text-sm">
                  {profile.company}
                </p>
              </div>
            </div>

            {/* Tags */}
            {profile.industries.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-5">
                {profile.industries.map((ind) => (
                  <span
                    key={ind}
                    className="font-body text-[10px] tracking-widest bg-[#B8944F]/10 text-[#B8944F] px-2.5 py-1 rounded-full"
                  >
                    {ind}
                  </span>
                ))}
              </div>
            )}

            {/* Headline */}
            {profile.headline && (
              <p className="font-body text-[#E8E2D8]/80 text-sm leading-relaxed italic mb-5">
                &ldquo;{profile.headline}&rdquo;
              </p>
            )}

            {/* Bio */}
            {profile.bio && (
              <p className="font-body text-[#555555] text-sm leading-relaxed mb-5">
                {profile.bio}
              </p>
            )}
          </div>

          {/* Gold line bottom */}
          <div
            className="h-0.5 w-full"
            style={{
              background:
                "linear-gradient(90deg, transparent, #B8944F 30%, #E8D5A0 50%, #B8944F 70%, transparent)",
            }}
          />

          <div className="px-8 py-4 flex items-center justify-between">
            <span className="font-body text-[10px] tracking-widest text-[#555555]">
              chief.me/{profile.slug}
            </span>
            <div className="flex items-center gap-1.5 font-body text-[10px] text-[#555555]">
              <Shield className="w-3 h-3 text-[#B8944F]" />
              VP+ Verified
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="font-display text-sm font-bold text-[#FEFCF7]/40 hover:text-[#B8944F] transition-colors"
          >
            chief<span className="text-[#B8944F]/60">.me</span>
          </Link>
          <p className="font-body text-[#555555]/50 text-[10px] mt-1 tracking-wide">
            The digital doorplate for VP+ executives
          </p>
        </div>
      </div>
    </main>
  );
}
