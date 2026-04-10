import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import Link from "next/link";
import { Check, Shield } from "lucide-react";
import DoorplateClient, { ShareToolbar } from "./DoorplateClient";

// ─── Types ─────────────────────────────────────────────────────────────────────

type Props = { params: Promise<{ slug: string }> };

// ─── Company size labels ────────────────────────────────────────────────────────

const COMPANY_SIZE_LABELS: Record<string, string> = {
  SEED: "Seed Stage",
  SERIES_A_B: "Series A/B",
  SERIES_C_PLUS: "Series C+",
  PUBLIC: "Public Co",
  ENTERPRISE: "Enterprise",
  FORTUNE_500: "Fortune 500",
};

// ─── SEO Metadata ───────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const profile = await prisma.profile.findUnique({
    where: { slug },
    select: {
      displayName: true,
      title: true,
      company: true,
      headline: true,
      bio: true,
    },
  });
  if (!profile) return { title: "Not Found" };
  return {
    title: `${profile.displayName} | ${profile.title} @ ${profile.company} | Chief.me`,
    description:
      profile.headline ?? profile.bio?.slice(0, 160) ?? `${profile.title} at ${profile.company}`,
    openGraph: {
      title: `${profile.displayName} — ${profile.title} @ ${profile.company}`,
      images: [`/api/og/${slug}`],
      type: "profile",
    },
  };
}

// ─── Page ───────────────────────────────────────────────────────────────────────

export default async function ProfilePage({ params }: Props) {
  const { slug } = await params;

  const profile = await prisma.profile.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      globalNumber: true,
      displayName: true,
      title: true,
      company: true,
      companySize: true,
      headline: true,
      bio: true,
      industries: true,
      socialLinks: true,
      achievements: true,
      verified: true,
      viewCount: true,
      connectionCount: true,
      user: { select: { image: true } },
      decisionCases: {
        where: { isPublic: true },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          template: true,
          title: true,
          outcome: true,
          tags: true,
        },
      },
      insights: {
        where: { isPublic: true, isDraft: false },
        orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
        select: {
          id: true,
          title: true,
          content: true,
          summary: true,
          createdAt: true,
        },
      },
    },
  });

  if (!profile) notFound();

  // Parse JSON fields
  const socialLinks =
    profile.socialLinks &&
    typeof profile.socialLinks === "object" &&
    !Array.isArray(profile.socialLinks)
      ? (profile.socialLinks as { linkedin?: string; twitter?: string; website?: string })
      : {};

  const achievements: string[] = Array.isArray(profile.achievements)
    ? (profile.achievements as string[])
    : [];

  const initials = profile.displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const companySizeLabel = COMPANY_SIZE_LABELS[profile.companySize] ?? null;

  // JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.displayName,
    jobTitle: profile.title,
    worksFor: { "@type": "Organization", name: profile.company },
    url: `https://www.chief.me/chief/${slug}`,
  };

  // Serialize insights dates for client
  const insightsForClient = profile.insights.map((i) => ({
    ...i,
    createdAt: i.createdAt.toISOString(),
  }));

  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main
        className="min-h-screen"
        style={{ background: "#0A0A0A" }}
      >
        {/* Ambient glow */}
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 50% 20%, rgba(184,148,79,0.06) 0%, transparent 70%)",
          }}
        />

        <div className="relative w-full max-w-xl mx-auto px-4 pb-16">
          {/* ── DARK HEADER CARD ── */}
          <div
            className="rounded-b-[24px] overflow-hidden"
            style={{
              background: "#0F0F0F",
              border: "1px solid rgba(184,148,79,0.2)",
              borderTop: "none",
              boxShadow: "0 24px 60px rgba(0,0,0,0.4)",
            }}
          >
            {/* 3px gold top line */}
            <div
              style={{
                height: "3px",
                background:
                  "linear-gradient(90deg, transparent, #B8944F 30%, #E8D5A0 50%, #B8944F 70%, transparent)",
              }}
            />

            <div className="px-8 pt-6 pb-7">
              {/* Founding member + number row */}
              <div className="flex items-center justify-between mb-6">
                <span
                  className="font-body text-[10px] tracking-[0.3em] uppercase"
                  style={{ color: "#B8944F" }}
                >
                  Founding Member
                </span>
                <span
                  className="font-body text-[10px] tracking-[0.3em]"
                  style={{ color: "#B8944F" }}
                >
                  No. {String(profile.globalNumber).padStart(3, "0")}
                </span>
              </div>

              {/* Avatar + name + title */}
              <div className="flex items-start gap-4 mb-5">
                {profile.user.image ? (
                  <img
                    src={profile.user.image}
                    alt={profile.displayName}
                    width={72}
                    height={72}
                    className="rounded-full flex-shrink-0"
                    style={{
                      width: 72,
                      height: 72,
                      objectFit: "cover",
                      boxShadow: "0 0 0 2px rgba(184,148,79,0.3)",
                    }}
                  />
                ) : (
                  <div
                    className="flex-shrink-0 rounded-full flex items-center justify-center font-display font-bold text-2xl"
                    style={{
                      width: 72,
                      height: 72,
                      background:
                        "linear-gradient(135deg, rgba(184,148,79,0.35) 0%, rgba(232,213,160,0.15) 100%)",
                      color: "#B8944F",
                      boxShadow: "0 0 0 2px rgba(184,148,79,0.2)",
                    }}
                  >
                    {initials}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <h1
                      className="font-display text-2xl font-bold leading-tight"
                      style={{ color: "#FEFCF7" }}
                    >
                      {profile.displayName}
                    </h1>
                    {profile.verified && (
                      <span
                        className="flex-shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-full font-body text-[10px] tracking-widest uppercase"
                        style={{
                          background: "rgba(184,148,79,0.15)",
                          border: "1px solid rgba(184,148,79,0.3)",
                          color: "#B8944F",
                        }}
                      >
                        <Check className="w-2.5 h-2.5" />
                        Verified
                      </span>
                    )}
                  </div>
                  <p className="font-body text-sm" style={{ color: "rgba(232,226,216,0.7)" }}>
                    {profile.title}
                    {profile.company && (
                      <span style={{ color: "rgba(232,226,216,0.4)" }}>
                        {" · "}
                        {profile.company}
                      </span>
                    )}
                  </p>

                  {/* Company size badge */}
                  {companySizeLabel && (
                    <span
                      className="inline-block mt-1.5 font-body text-[10px] tracking-widest uppercase px-2.5 py-0.5 rounded-full"
                      style={{
                        background: "rgba(184,148,79,0.08)",
                        border: "1px solid rgba(184,148,79,0.18)",
                        color: "rgba(184,148,79,0.7)",
                      }}
                    >
                      {companySizeLabel}
                    </span>
                  )}
                </div>
              </div>

              {/* Industry tags */}
              {profile.industries.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {profile.industries.map((ind) => (
                    <span
                      key={ind}
                      className="font-body text-[10px] tracking-widest uppercase px-2.5 py-1 rounded-full"
                      style={{
                        background: "rgba(184,148,79,0.08)",
                        border: "1px solid rgba(184,148,79,0.15)",
                        color: "#B8944F",
                      }}
                    >
                      {ind}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── MAIN CONTENT ── */}
          <div className="mt-6 space-y-6">
            <DoorplateClient
              slug={profile.slug}
              profileId={profile.id}
              displayName={profile.displayName}
              title={profile.title}
              company={profile.company}
              headline={profile.headline}
              bio={profile.bio}
              achievements={achievements}
              socialLinks={socialLinks}
              cases={profile.decisionCases}
              insights={insightsForClient}
              viewCount={profile.viewCount}
              connectionCount={profile.connectionCount}
            />
          </div>

          {/* ── SHARE TOOLBAR ── */}
          <div className="mt-8 flex items-center gap-3 flex-wrap">
            <span
              className="font-body text-[10px] tracking-widest uppercase mr-1"
              style={{ color: "rgba(184,148,79,0.5)" }}
            >
              Share
            </span>
            <ShareToolbar
              slug={profile.slug}
              name={profile.displayName}
              title={profile.title}
              company={profile.company}
            />
          </div>

          {/* ── FOOTER BAR ── */}
          <div
            className="mt-8 flex items-center justify-between"
            style={{ borderTop: "1px solid rgba(184,148,79,0.1)", paddingTop: "16px" }}
          >
            <Link
              href="/"
              className="font-body text-xs transition-colors"
              style={{ color: "rgba(184,148,79,0.6)" }}
            >
              chief.me/{profile.slug}
            </Link>
            <div className="flex items-center gap-1.5">
              <Shield className="w-3 h-3" style={{ color: "#B8944F" }} />
              <span
                className="font-body text-[10px] tracking-widest"
                style={{ color: "rgba(232,226,216,0.3)" }}
              >
                VP+ Network
              </span>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
