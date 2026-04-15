"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
  CreditCard,
  FileDown,
  CalendarDays,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SocialLinks {
  linkedin?: string;
  twitter?: string;
  website?: string;
  calendly?: string;
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

interface Endorsement {
  id: string;
  content: string;
  relationship: string;
  endorser: {
    displayName: string;
    title: string;
    company: string;
    slug: string;
    globalNumber: number;
  };
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
  endorsements?: Endorsement[];
  viewCount: number;
  connectionCount: number;
  calendlyUrl?: string;
  isOwner?: boolean;
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
  const { t } = useLanguage();
  const dp = t.doorplate;
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
              {dp.requestSent}
            </h3>
            <p className="font-body text-sm" style={{ color: "#E8E2D8" }}>
              {dp.requestSent} {receiverName}.
            </p>
            <button
              onClick={onClose}
              className="mt-6 px-6 py-2.5 rounded-full font-body text-sm font-medium transition-opacity hover:opacity-80"
              style={{ background: "#B8944F", color: "#0A0A0A" }}
            >
              {dp.done}
            </button>
          </div>
        ) : (
          <>
            <h3
              className="font-display text-xl font-bold mb-1"
              style={{ color: "#FEFCF7" }}
            >
              {dp.requestConnect}
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
              {dp.introduceYourself}
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder={dp.introducePlaceholder}
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
                ? dp.sending
                : status === "unauthenticated"
                ? dp.signInToConnect
                : dp.sendRequest}
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
            <div
              className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: "#B8944F", borderTopColor: "transparent" }}
            />
          ) : qrDataUrl ? (
            <img src={qrDataUrl} alt="QR Code" className="w-full h-full rounded-[12px]" />
          ) : (
            <p className="font-body text-xs" style={{ color: "rgba(232,226,216,0.4)" }}>
              Failed to generate
            </p>
          )}
        </div>
        <p className="font-body text-xs mt-4" style={{ color: "rgba(232,226,216,0.4)" }}>
          {url}
        </p>
        {qrDataUrl && (
          <a
            href={qrDataUrl}
            download={`chief-qr.png`}
            className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-full font-body text-xs font-medium transition-opacity hover:opacity-80"
            style={{ background: "rgba(184,148,79,0.15)", color: "#B8944F", border: "1px solid rgba(184,148,79,0.25)" }}
          >
            Download PNG
          </a>
        )}
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
  const { t } = useLanguage();
  const dp = t.doorplate;
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
          {dp.emailSignature}
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
          {copied ? dp.copied : dp.copyHtml}
        </button>
      </div>
    </div>
  );
}

// ─── Share Toolbar ─────────────────────────────────────────────────────────────

function downloadDigitalCard(name: string, title: string, company: string, slug: string) {
  const W = 800, H = 450;
  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // Background
  ctx.fillStyle = "#0A0A0A";
  ctx.fillRect(0, 0, W, H);

  // Gold border
  ctx.strokeStyle = "rgba(184,148,79,0.4)";
  ctx.lineWidth = 1;
  ctx.strokeRect(1, 1, W - 2, H - 2);

  // Subtle gradient glow
  const grad = ctx.createRadialGradient(W / 2, H * 0.3, 0, W / 2, H * 0.3, W * 0.6);
  grad.addColorStop(0, "rgba(184,148,79,0.08)");
  grad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // chief.me label (top-left)
  ctx.fillStyle = "rgba(184,148,79,0.7)";
  ctx.font = "600 13px 'DM Sans', sans-serif";
  ctx.fillText("chief.me", 48, 52);

  // Name
  ctx.fillStyle = "#FEFCF7";
  ctx.font = "bold 44px 'Playfair Display', serif";
  ctx.fillText(name, 48, 210);

  // Title · Company
  ctx.fillStyle = "rgba(232,226,216,0.6)";
  ctx.font = "400 22px 'DM Sans', sans-serif";
  ctx.fillText(`${title}  ·  ${company}`, 48, 258);

  // Gold divider
  ctx.fillStyle = "#B8944F";
  ctx.fillRect(48, 295, 60, 2);

  // URL
  ctx.fillStyle = "rgba(184,148,79,0.8)";
  ctx.font = "400 16px 'DM Sans', sans-serif";
  ctx.fillText(`chief.me/${slug}`, 48, 330);

  // Download
  const link = document.createElement("a");
  link.download = `${slug}-chief-card.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

function ShareToolbar({
  slug,
  name,
  title,
  company,
  isOwner,
}: {
  slug: string;
  name: string;
  title: string;
  company: string;
  isOwner?: boolean;
}) {
  const { t } = useLanguage();
  const dp = t.doorplate;
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [showSig, setShowSig] = useState(false);
  const [walletLoading, setWalletLoading] = useState(false);
  const url =
    typeof window !== "undefined"
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
          {copied ? dp.copied : dp.copyLink}
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
          {dp.emailSignature}
        </button>
        {isOwner && (
          <button
            onClick={async () => {
              setWalletLoading(true);
              try {
                const res = await fetch("/api/wallet/google", { method: "POST" });
                const data = await res.json();
                if (data.url) window.open(data.url, "_blank");
              } catch { /* silently fail */ } finally { setWalletLoading(false); }
            }}
            disabled={walletLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-body text-xs transition-all hover:opacity-80 disabled:opacity-50"
            style={{ background: "rgba(66,133,244,0.1)", border: "1px solid rgba(66,133,244,0.25)", color: "#4285F4" }}
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
            </svg>
            {walletLoading ? "…" : (dp.addToWallet ?? "Add to Google Wallet")}
          </button>
        )}
        <button
          onClick={() => downloadDigitalCard(name, title, company, slug)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-body text-xs transition-all hover:opacity-80"
          style={{
            background: "rgba(184,148,79,0.1)",
            border: "1px solid rgba(184,148,79,0.2)",
            color: "#B8944F",
          }}
        >
          <CreditCard className="w-3.5 h-3.5" />
          {dp.digitalCard ?? "Digital Card"}
        </button>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-body text-xs transition-all hover:opacity-80"
          style={{
            background: "rgba(184,148,79,0.1)",
            border: "1px solid rgba(184,148,79,0.2)",
            color: "#B8944F",
          }}
        >
          <FileDown className="w-3.5 h-3.5" />
          {dp.exportPdf ?? "Export PDF"}
        </button>
        <a
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-body text-xs transition-all hover:opacity-80"
          style={{
            background: "rgba(10,102,194,0.1)",
            border: "1px solid rgba(10,102,194,0.25)",
            color: "#0A66C2",
          }}
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
          LinkedIn
        </a>
        <a
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out ${name}'s digital doorplate on Chief.me`)}&url=${encodeURIComponent(url)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-body text-xs transition-all hover:opacity-80"
          style={{
            background: "rgba(0,0,0,0.15)",
            border: "1px solid rgba(232,226,216,0.15)",
            color: "rgba(232,226,216,0.7)",
          }}
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
          X
        </a>
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
  const { t } = useLanguage();
  const dp = t.doorplate;

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
            {dp.achievements}
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
  const { t } = useLanguage();
  const dp = t.doorplate;

  if (cases.length === 0) {
    return (
      <div className="text-center py-12">
        <p
          className="font-display text-base italic"
          style={{ color: "rgba(232,226,216,0.3)" }}
        >
          {dp.noCases}
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
  const { t } = useLanguage();
  const dp = t.doorplate;

  if (insights.length === 0) {
    return (
      <div className="text-center py-12">
        <p
          className="font-display text-base italic"
          style={{ color: "rgba(232,226,216,0.3)" }}
        >
          {dp.noInsights}
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
                    {dp.loginToRead}
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
  endorsements = [],
  viewCount,
  connectionCount,
  calendlyUrl,
  isOwner,
}: DoorplateClientProps) {
  const { data: session } = useSession();
  const { t } = useLanguage();
  const dp = t.doorplate;
  const [activeTab, setActiveTab] = useState<"about" | "cases" | "insights" | "endorsements">("about");
  const [showConnect, setShowConnect] = useState(false);
  const isLoggedIn = !!session;

  const tabs: { key: "about" | "cases" | "insights" | "endorsements"; label: string }[] = [
    { key: "about", label: dp.about },
    { key: "cases", label: `${dp.cases}${cases.length > 0 ? ` (${cases.length})` : ""}` },
    { key: "insights", label: `${dp.insights}${insights.length > 0 ? ` (${insights.length})` : ""}` },
    { key: "endorsements", label: `背书${endorsements.length > 0 ? ` (${endorsements.length})` : ""}` },
  ];

  return (
    <>
      {/* Stats Bar */}
      <div
        className="grid grid-cols-3 divide-x"
        style={{
          borderColor: "rgba(184,148,79,0.15)",
          border: "1px solid rgba(184,148,79,0.15)",
          borderRadius: "16px",
          overflow: "hidden",
        }}
      >
        {[
          { label: dp.views, value: viewCount.toLocaleString() },
          { label: dp.insights, value: insights.length.toString() },
          { label: dp.connections, value: connectionCount.toLocaleString() },
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
              color: activeTab === tab.key ? "#FEFCF7" : "rgba(232,226,216,0.4)",
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
        {activeTab === "endorsements" && (
          <div className="space-y-4 py-4">
            {endorsements.length > 0 ? (
              endorsements.map((e) => (
                <div
                  key={e.id}
                  className="rounded-[14px] p-5"
                  style={{
                    background: "rgba(184,148,79,0.05)",
                    border: "1px solid rgba(184,148,79,0.15)",
                  }}
                >
                  <p
                    className="font-body italic mb-3 text-sm leading-relaxed"
                    style={{ color: "rgba(232,226,216,0.8)" }}
                  >
                    &ldquo;{e.content}&rdquo;
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link
                      href={`/chief/${e.endorser.slug}`}
                      className="font-body text-sm font-medium transition-colors hover:opacity-80"
                      style={{ color: "#B8944F" }}
                    >
                      {e.endorser.displayName}
                    </Link>
                    <span
                      className="font-body text-sm"
                      style={{ color: "rgba(232,226,216,0.4)" }}
                    >
                      · {e.endorser.title} @ {e.endorser.company}
                    </span>
                  </div>
                  {e.relationship && (
                    <div
                      className="font-body text-xs mt-1"
                      style={{ color: "rgba(232,226,216,0.3)" }}
                    >
                      {e.relationship}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p
                className="text-sm py-8 text-center font-body"
                style={{ color: "rgba(232,226,216,0.3)" }}
              >
                暂无背书
              </p>
            )}
          </div>
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
        {isOwner ? (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/edit">
              <button
                className="w-full sm:w-auto px-6 py-2.5 rounded-full font-body text-sm font-semibold transition-opacity hover:opacity-80 cursor-pointer"
                style={{ border: "1px solid #B8944F", color: "#B8944F" }}
              >
                编辑资料
              </button>
            </Link>
            <Link href="/dashboard">
              <button
                className="w-full sm:w-auto px-6 py-2.5 rounded-full font-body text-sm font-semibold transition-opacity hover:opacity-80 cursor-pointer"
                style={{ background: "rgba(255,255,255,0.06)", color: "rgba(232,226,216,0.7)" }}
              >
                控制台
              </button>
            </Link>
          </div>
        ) : (
          <>
            <p
              className="font-body text-xs mb-4"
              style={{ color: "rgba(232,226,216,0.4)" }}
            >
              {dp.contactPrivate}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => setShowConnect(true)}
                className="w-full sm:w-auto px-6 py-2.5 rounded-full font-body text-sm font-semibold transition-opacity hover:opacity-80 cursor-pointer"
                style={{ background: "#B8944F", color: "#0A0A0A" }}
              >
                {dp.requestConnect}
              </button>
              {calendlyUrl && (
                <a
                  href={calendlyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-full font-body text-sm font-semibold transition-opacity hover:opacity-80"
                  style={{ border: "1px solid rgba(184,148,79,0.4)", color: "#B8944F" }}
                >
                  <CalendarDays className="w-4 h-4" />
                  {dp.bookMeeting ?? "Book a Meeting"}
                </a>
              )}
            </div>
          </>
        )}
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
