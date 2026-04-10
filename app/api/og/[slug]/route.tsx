import { ImageResponse } from "@vercel/og";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const profile = await prisma.profile.findUnique({
    where: { slug },
    select: {
      displayName: true,
      title: true,
      company: true,
      globalNumber: true,
      headline: true,
    },
  });

  if (!profile) {
    return new Response("Not found", { status: 404 });
  }

  const memberNo = `No. ${String(profile.globalNumber).padStart(3, "0")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0A0A0A",
          color: "#F5F0E8",
          padding: "60px",
          fontFamily: "serif",
        }}
      >
        {/* Gold top line */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            background: "linear-gradient(90deg, transparent, #B8944F 30%, #E8D5A0 50%, #B8944F 70%, transparent)",
          }}
        />

        {/* Top row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontSize: "13px",
              color: "#B8944F",
              letterSpacing: "0.25em",
              textTransform: "uppercase",
            }}
          >
            FOUNDING MEMBER
          </span>
          <span style={{ fontSize: "13px", color: "#B8944F", letterSpacing: "0.2em" }}>
            {memberNo}
          </span>
        </div>

        {/* Main content */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div
            style={{
              fontSize: "64px",
              fontWeight: 700,
              color: "#FEFCF7",
              lineHeight: 1.1,
            }}
          >
            {profile.displayName}
          </div>
          <div
            style={{
              fontSize: "26px",
              color: "rgba(232,226,216,0.7)",
            }}
          >
            {profile.title} · {profile.company}
          </div>
          {profile.headline && (
            <div
              style={{
                fontSize: "18px",
                color: "rgba(232,226,216,0.5)",
                fontStyle: "italic",
                marginTop: "4px",
              }}
            >
              &ldquo;{profile.headline}&rdquo;
            </div>
          )}
        </div>

        {/* Bottom row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontSize: "16px",
              color: "rgba(232,226,216,0.4)",
              letterSpacing: "0.05em",
            }}
          >
            chief.me/{slug}
          </span>
          <span
            style={{
              fontSize: "20px",
              fontWeight: 700,
              color: "#FEFCF7",
            }}
          >
            chief<span style={{ color: "#B8944F" }}>.me</span>
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
