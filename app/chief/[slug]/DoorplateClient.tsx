"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  ExternalLink,
  AtSign,
  Globe,
  Lock,
  Copy,
  Check,
  QrCode,
  Mail,
  X,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SocialLinks {
  linkedin?: string;
  twitter?: string;
  website?: string;
}

interface DecisionCase {
  id: string;
  template: string;
  title: string;
  outcome: string;
  tags: string[];
}

interface Insight {
  id: string;
  title: string;
  summary: string | null;
  content: string;
  createdAt: string;
}

interface DoorplateClientProps {
  slug: string;
  profileId: string;
  displayName: string;
  title: string;
  company: string;
  headline: string | null;
  bio: string | null;
  achievements: string[];
  socialLinks: SocialLinks;
  cases: DecisionCase[];
  insights: Insight[];
  viewCount: number;
  connectionCount: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TEMPLATE_LABELS: Record<string, string> = {
  CRISIS_MANAGEMENT: "Crisis Management",
  ORG_RESTRUCTURING: "Org Restructuring",
  STRATEGIC_PIVOT: "Strategic Pivot",
  SCALING_CHALLENGE: "Scaling Challenge",
  PRODUCT_LAUNCH: "Product Launch",
  TALENT_STRATEGY: "Talent Strategy",
  FUNDRAISING: "Fundraising",
  TECHNOLOGY_BET: "Technology Bet",
  MARKET_ENTRY: "Market Entry",
  CUSTOM: "Custom",
};

// ─── Connect Modal ────────────────────────────────────────────────────────────

function ConnectModal({
  receiverProfileId,
  receiverName,
  onClose,
}: {
  receiverProfileId: string;
  receiverName: string;
  onClose: () => void;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    if (status === "unauthenticated") {
      router.push("/join");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/connections/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverProfileId, message }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Something went wrong. Please try again.");
      } else {
        setSuccess(true);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
    >
      <div
        className="relative w-full max-w-md rounded-[20px] p-8"
        style={{
          background: "#111",
          border: "1px solid rgba(184,148,79,0.25)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/40 hover:text-white/70 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {success ? (
          <div className="text-center py-4">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: "rgba(184,148,79,0.15)" }}
            >
              <Check className="w-6 h-6" style={{ color: "#B8944F" }} />
            </div>
            <h3
              className="font-display text-xl font-bold mb-2"
              style={{ color: "#FEFCF7" }}
            >
              Request Sent
            </h3>
            <p className="font-body text-sm" style={{ color: "#E8E2D8" }}>
              Your connection request has been sent to {receiverName}.
            </p>
            <button
              onClick={onClose}
              className="mt-6 px-6 py-2.5 rounded-full font-body text-sm font-medium transition-opacity hover:opacity-80"
              style={{ background: "#B8944F", color: "#0A0A0A" }}
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <h3
              className="font-display text-xl font-bold mb-1"
              style={{ color: "#FEFCF7" }}
            >
              Request to Connect
            </h3>
            <p
              className="font-body text-sm mb-6"
              style={{ color: "rgba(232,226,216,0.6)" }}
            >
              with {receiverName}
            </p>

            <label
              className="block font-body text-xs tracking-widest mb-2 uppercase"
              style={{ color: "#B8944F" }}
            >
              Introduce yourself (optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder="Share a brief introduction or context for connecting…"
              className="w-full rounded-[12px] p-4 font-body text-sm resize-none outline-none transition-colors"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(184,148,79,0.2)",
                color: "#E8E2D8",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "rgba(184,148,79,0.5)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "rgba(184,148,79,0.2)";
              }}
            />

            {error && (
              <p className="font-body text-xs mt-2" style={{ color: "#e87070" }}>
                {error}
              </p>
            )}

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="mt-4 w-full py-3 rounded-full font-body text-sm font-semibold transition-opacity disabled:opacity-50"
              style={{ background: "#B8944F", color: "#0A0A0A" }}
            >
              {submitting
                ? "Sending…"
                : status === "unauthenticated"
                ? "Sign in to Connect"
                : "Send Request"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── QR Modal ─────────────────────────────────────────────────────────────────

function QRModal({ url, onClose }: { url: string; onClose: () => void }) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // Generate QR code client-side
  useEffect(() => {
    import("qrcode").then((QRCode) => {
      QRCode.toDataURL(url, {
        color: { dark: "#B8944F", light: "#0A0A0A" },
        width: 200,
        margin: 2,
      })
        .then((dataUrl: string) => {
          setQrDataUrl(dataUrl);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    });
  }, [url]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
    >
      <div
        className="relative w-full max-w-xs rounded-[20px] p-8 text-center"
        style={{
          background: "#111",
          border: "1px solid rgba(184,148,79,0.25)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/40 hover:text-white/70 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        <h3
          className="font-display text-lg font-bold mb-4"
          style={{ color: "#FEFCF7" }}
        >
          QR Code
        </h3>
        <div
          className="w-[200px] h-[200px] mx-auto rounded-[12px] flex items-center justify-center"
          style={{ background: "#0A0A0A", border: "1px solid rgba(184,148,79,0.2)" }}
        >
          {loading ? (
            <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "#B8944F", borderTopColor: "transparent" }} />
          ) : qrDataUrl ? (
            <img src={qrDataUrl} alt="QR Code" className="w-full h-full rounded-[12px]" />
          ) : (
            <p className="font-body text-xs" style={{ color: "rgba(232,226,216,0.4)" }}>Failed to generate</p>
          )}
        </div>
        <p className="font-body text-xs mt-4" style={{ color: "rgba(232,226,216,0.4)" }}>
          {url}
        </p>
      </div>
    </div>
  );
}

// ─── Email Signature Modal ─────────────────────────────────────────────────────

function EmailSignatureModal({
  name,
  title,
  company,
  slug,
  onClose,
}: {
  name: string;
  title: string;
  company: string;
  slug: string;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const snippet = `<table cellpadding="0" cellspacing="0" border="0" style="font-family:DM Sans,Helvetica Neue,sans-serif;font-size:13px;color:#333;">
  <tr>
    <td style="padding-right:16px;border-right:2px solid #B8944F;">&nbsp;</td>
    <td style="padding-left:16px;">
      <strong style="font-size:15px;color:#0A0A0A;">${name}</strong><br/>
      <span style="color:#555;">${title} &middot; ${company}</span><br/>
      <a href="https://chief.me/chief/${slug}" style="color:#B8944F;text-decoration:none;">chief.me/${slug}</a>
    </td>
  </tr>
</table>`;

  function copySnippet() {
    navigator.clipboard.writeText(snippet).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
    >
      <div
        className="relative w-full max-w-lg rounded-[20px] p-8"
        style={{
          background: "#111",
          border: "1px solid rgba(184,148,79,0.25)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/40 hover:text-white/70 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        <h3
          className="font-display text-xl font-bold mb-4"
          style={{ color: "#FEFCF7" }}
        >
          Email Signature
        </h3>
        <pre
          className="rounded-[12px] p-4 text-xs overflow-x-auto font-mono"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(184,148,79,0.15)",
            color: "rgba(232,226,216,0.7)",
            whiteSpace: "pre-wrap",
            wordBreak: "break-all",
          }}
        >
          {snippet}
        </pre>
        <button
          onClick={copySnippet}
          className="mt-4 flex items-center gap-2 px-5 py-2.5 rounded-full font-body text-sm font-medium transition-opacity hover:opacity-80"
          style={{ background: "#B8944F", color: "#0A0A0A" }}
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? "Copied!" : "Copy HTML"}
        </button>
      </div>
    </div>
  );
}

// ─── Share Toolbar ─────────────────────────────────────────────────────────────

function ShareToolbar({
  slug,
  name,
  title,
  company,
}: {
  slug: string;
  name: string;
  title: string;
  company: string;
}) {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [showSig, setShowSig] = useState(false);
  const url = typeof window !== "undefined"
    ? `${window.location.origin}/chief/${slug}`
    : `https://chief.me/chief/${slug}`;

  function copyLink() {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <>
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setShowQR(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-body text-xs transition-all hover:opacity-80"
          style={{
            background: "rgba(184,148,79,0.1)",
            border: "1px solid rgba(184,148,79,0.2)",
            color: "#B8944F",
          }}
        >
          <QrCode className="w-3.5 h-3.5" />
          QR Code
        </button>
        <button
          onClick={copyLink}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-body text-xs transition-all hover:opacity-80"
          style={{
            background: "rgba(184,148,79,0.1)",
            border: "1px solid rgba(184,148,79,0.2)",
            color: "#B8944F",
          }}
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? "Copied!" : "Copy Link"}
        </button>
        <button
          onClick={() => setShowSig(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-body text-xs transition-all hover:opacity-80"
          style={{
            background: "rgba(184,148,79,0.1)",
            border: "1px solid rgba(184,148,79,0.2)",
            color: "#B8944F",
          }}
        >
          <Mail className="w-3.5 h-3.5" />
          Email Signature
        </button>
      </div>

      {showQR && <QRModal url={url} onClose={() => setShowQR(false)} />}
      {showSig && (
        <EmailSignatureModal
          name={name}
          title={title}
          company={company}
          slug={slug}
          onClose={() => setShowSig(false)}
        />
      )}
    </>
  );
}

// ─── Tab Content ──────────────────────────────────────────────────────────────

function AboutTab({
  headline,
  bio,
  achievements,
  socialLinks,
}: {
  headline: string | null;
  bio: string | null;
  achievements: string[];
  socialLinks: SocialLinks;
}) {
  return (
    <div className="space-y-6">
      {headline && (
        <p
          className="font-display text-lg italic leading-relaxed"
          style={{ color: "#E8E2D8" }}
        >
          &ldquo;{headline}&rdquo;
        </p>
      )}

      {bio && (
        <p
          className="font-body text-sm leading-relaxed"
          style={{ color: "rgba(232,226,216,0.7)" }}
        >
          {bio}
        </p>
      )}

      {achievements.length > 0 && (
        <div>
          <h4
            className="font-body text-[10px] tracking-[0.25em] uppercase mb-3"
            style={{ color: "#B8944F" }}
          >
            Achievements
          </h4>
          <ul className="space-y-2">
            {achievements.map((a, i) => (
              <li key={i} className="flex items-start gap-3">
                <span
                  className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0"
                  style={{ background: "#B8944F" }}
                />
                <span
                  className="font-body text-sm leading-relaxed"
                  style={{ color: "rgba(232,226,216,0.7)" }}
                >
                  {a}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {(socialLinks.linkedin || socialLinks.twitter || socialLinks.website) && (
        <div className="flex items-center gap-3 pt-2">
          {socialLinks.linkedin && (
            <a
              href={socialLinks.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 font-body text-xs transition-opacity hover:opacity-70"
              style={{ color: "#B8944F" }}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              LinkedIn
            </a>
          )}
          {socialLinks.twitter && (
            <a
              href={socialLinks.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 font-body text-xs transition-opacity hover:opacity-70"
              style={{ color: "#B8944F" }}
            >
              <AtSign className="w-3.5 h-3.5" />
              Twitter
            </a>
          )}
          {socialLinks.website && (
            <a
              href={socialLinks.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 font-body text-xs transition-opacity hover:opacity-70"
              style={{ color: "#B8944F" }}
            >
              <Globe className="w-3.5 h-3.5" />
              Website
            </a>
          )}
        </div>
      )}
    </div>
  );
}

function CasesTab({ cases }: { cases: DecisionCase[] }) {
  if (cases.length === 0) {
    return (
      <div className="text-center py-12">
        <p
          className="font-display text-base italic"
          style={{ color: "rgba(232,226,216,0.3)" }}
        >
          No cases shared yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {cases.map((c) => (
        <div
          key={c.id}
          className="rounded-[16px] p-5"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(184,148,79,0.15)",
          }}
        >
          <div className="flex items-start gap-3">
            <div
              className="mt-0.5 w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center font-body text-xs font-semibold"
              style={{
                background: "rgba(184,148,79,0.12)",
                color: "#B8944F",
              }}
            >
              {c.template.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <span
                className="inline-block font-body text-[10px] tracking-widest uppercase mb-1"
                style={{ color: "rgba(184,148,79,0.6)" }}
              >
                {TEMPLATE_LABELS[c.template] ?? c.template}
              </span>
              <h4
                className="font-display text-sm font-semibold leading-snug mb-2"
                style={{ color: "#FEFCF7" }}
              >
                {c.title}
              </h4>
              <p
                className="font-body text-xs leading-relaxed line-clamp-2"
                style={{ color: "rgba(232,226,216,0.5)" }}
              >
                {c.outcome}
              </p>
              {c.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {c.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="font-body text-[10px] px-2 py-0.5 rounded-full"
                      style={{
                        background: "rgba(184,148,79,0.08)",
                        color: "rgba(184,148,79,0.6)",
                        border: "1px solid rgba(184,148,79,0.12)",
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function InsightsTab({
  insights,
  isLoggedIn,
}: {
  insights: Insight[];
  isLoggedIn: boolean;
}) {
  const router = useRouter();

  if (insights.length === 0) {
    return (
      <div className="text-center py-12">
        <p
          className="font-display text-base italic"
          style={{ color: "rgba(232,226,216,0.3)" }}
        >
          No insights published yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {insights.map((insight) => {
        const preview = insight.summary || insight.content.slice(0, 120);
        const blurred = !isLoggedIn && preview.length > 50;
        const visibleText = blurred ? preview.slice(0, 50) : preview;

        return (
          <div
            key={insight.id}
            className="rounded-[16px] p-5"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(184,148,79,0.15)",
            }}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <h4
                className="font-display text-sm font-semibold leading-snug"
                style={{ color: "#FEFCF7" }}
              >
                {insight.title}
              </h4>
              <span
                className="flex-shrink-0 font-body text-[10px]"
                style={{ color: "rgba(184,148,79,0.5)" }}
              >
                {new Date(insight.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
            <div className="relative">
              <p
                className="font-body text-xs leading-relaxed"
                style={{ color: "rgba(232,226,216,0.6)" }}
              >
                {visibleText}
                {blurred && "…"}
              </p>
              {blurred && (
                <div
                  className="mt-2 rounded-[10px] p-3 flex items-center gap-2 cursor-pointer"
                  style={{
                    background: "rgba(184,148,79,0.06)",
                    border: "1px solid rgba(184,148,79,0.12)",
                  }}
                  onClick={() => router.push("/join")}
                >
                  <Lock className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#B8944F" }} />
                  <span className="font-body text-xs" style={{ color: "rgba(184,148,79,0.8)" }}>
                    Login to read full insights
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Client Component ─────────────────────────────────────────────────────

export default function DoorplateClient({
  slug,
  profileId,
  displayName,
  title,
  company,
  headline,
  bio,
  achievements,
  socialLinks,
  cases,
  insights,
  viewCount,
  connectionCount,
}: DoorplateClientProps) {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<"about" | "cases" | "insights">("about");
  const [showConnect, setShowConnect] = useState(false);
  const isLoggedIn = !!session;

  const tabs: { key: "about" | "cases" | "insights"; label: string }[] = [
    { key: "about", label: "About" },
    { key: "cases", label: `Cases${cases.length > 0 ? ` (${cases.length})` : ""}` },
    { key: "insights", label: `Insights${insights.length > 0 ? ` (${insights.length})` : ""}` },
  ];

  return (
    <>
      {/* Stats Bar */}
      <div
        className="grid grid-cols-3 divide-x"
        style={{ borderColor: "rgba(184,148,79,0.15)", border: "1px solid rgba(184,148,79,0.15)", borderRadius: "16px", overflow: "hidden", marginBottom: "0" }}
      >
        {[
          { label: "Views", value: viewCount.toLocaleString() },
          { label: "Insights", value: insights.length.toString() },
          { label: "Connections", value: connectionCount.toLocaleString() },
        ].map((stat, i) => (
          <div
            key={i}
            className="flex flex-col items-center py-4 px-2"
            style={{
              background: "rgba(255,255,255,0.02)",
              borderRight: i < 2 ? "1px solid rgba(184,148,79,0.15)" : "none",
            }}
          >
            <span
              className="font-display text-xl font-bold"
              style={{ color: "#B8944F" }}
            >
              {stat.value}
            </span>
            <span
              className="font-body text-[10px] tracking-widest uppercase mt-0.5"
              style={{ color: "rgba(232,226,216,0.4)" }}
            >
              {stat.label}
            </span>
          </div>
        ))}
      </div>

      {/* Tab Nav */}
      <div
        className="flex mt-6"
        style={{ borderBottom: "1px solid rgba(184,148,79,0.15)" }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="relative pb-3 mr-6 font-body text-sm transition-colors"
            style={{
              color:
                activeTab === tab.key
                  ? "#FEFCF7"
                  : "rgba(232,226,216,0.4)",
            }}
          >
            {tab.label}
            {activeTab === tab.key && (
              <span
                className="absolute bottom-0 left-0 right-0 h-0.5"
                style={{ background: "#B8944F" }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === "about" && (
          <AboutTab
            headline={headline}
            bio={bio}
            achievements={achievements}
            socialLinks={socialLinks}
          />
        )}
        {activeTab === "cases" && <CasesTab cases={cases} />}
        {activeTab === "insights" && (
          <InsightsTab insights={insights} isLoggedIn={isLoggedIn} />
        )}
      </div>

      {/* Contact Section */}
      <div
        className="mt-8 rounded-[16px] p-6 text-center"
        style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(184,148,79,0.15)",
        }}
      >
        <p
          className="font-body text-xs mb-4"
          style={{ color: "rgba(232,226,216,0.4)" }}
        >
          Contact details are private
        </p>
        <button
          onClick={() => setShowConnect(true)}
          className="px-6 py-2.5 rounded-full font-body text-sm font-semibold transition-opacity hover:opacity-80"
          style={{ background: "#B8944F", color: "#0A0A0A" }}
        >
          Request to Connect
        </button>
      </div>

      {/* Connect Modal */}
      {showConnect && (
        <ConnectModal
          receiverProfileId={profileId}
          receiverName={displayName}
          onClose={() => setShowConnect(false)}
        />
      )}
    </>
  );
}

// ─── Export ShareToolbar separately so server page can include it ──────────────
export { ShareToolbar };
