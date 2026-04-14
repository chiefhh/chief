"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft } from "lucide-react"
import { useLanguage } from "@/lib/i18n/LanguageContext"

const copy = {
  en: {
    back: "Back",
    title: "Write Insight",
    sub: "Share a thought, lesson, or perspective with the network.",
    titleLabel: "Title",
    titlePh: "Your insight title",
    contentLabel: "Content",
    contentPh: "Share your perspective, lesson learned, or observation…",
    summaryLabel: "Hook / Summary",
    summaryNote: "(optional)",
    summaryPh: "2-sentence hook (optional)",
    publish: "Publish Insight",
    publishing: "Publishing…",
    error: "Failed to publish insight. Please try again.",
  },
  zh: {
    back: "返回",
    title: "发布洞察",
    sub: "向网络分享你的想法、经验或观点。",
    titleLabel: "标题",
    titlePh: "洞察标题",
    contentLabel: "正文",
    contentPh: "分享你的观点、经验教训或观察…",
    summaryLabel: "钩子 / 摘要",
    summaryNote: "（选填）",
    summaryPh: "两句话的摘要（选填）",
    publish: "发布洞察",
    publishing: "发布中…",
    error: "发布洞察失败，请重试。",
  },
}

export default function NewInsightPage() {
  const { status } = useSession()
  const router = useRouter()
  const { lang } = useLanguage()
  const t = copy[lang]

  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [summary, setSummary] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/join")
  }, [status, router])

  if (status === "loading") {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ background: "#0A0A0A" }}>
        <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "#B8944F", borderTopColor: "transparent" }} />
      </main>
    )
  }

  const canSubmit = title.trim() && content.trim() && !submitting

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch("/api/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), content: content.trim(), summary: summary.trim() || undefined, source: "MANUAL", isDraft: false, isPublic: true }),
      })
      if (!res.ok) throw new Error("Failed to publish")
      router.push("/dashboard")
    } catch {
      setError(t.error)
      setSubmitting(false)
    }
  }

  const taBase = "w-full rounded-[12px] px-4 py-3 font-body text-sm outline-none transition-colors"
  const taStyle = { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#F5F0E8" }
  const focus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => (e.currentTarget.style.borderColor = "rgba(184,148,79,0.4)")
  const blur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")

  return (
    <main className="min-h-screen px-6 py-12" style={{ background: "#0A0A0A" }}>
      <div className="fixed inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(184,148,79,0.05) 0%, transparent 70%)" }} />

      <div className="relative max-w-[600px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <Link href="/dashboard" className="flex items-center gap-2 transition-colors" style={{ color: "#555555" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#E8E2D8")}
            onMouseLeave={e => (e.currentTarget.style.color = "#555555")}>
            <ArrowLeft className="w-4 h-4" />
            <span className="font-body text-sm">{t.back}</span>
          </Link>
          <Link href="/">
            <Image src="/logo.png" alt="chief.me" height={358} width={623} style={{ height: "44px", width: "auto", filter: "brightness(0) invert(1)" }} />
          </Link>
          <div className="w-16" />
        </div>

        <h1 className="font-display text-3xl font-bold mb-2" style={{ color: "#FEFCF7" }}>{t.title}</h1>
        <p className="font-body text-sm mb-8" style={{ color: "#555555" }}>{t.sub}</p>

        {error && (
          <div className="rounded-[12px] px-4 py-3 mb-6 font-body text-sm" style={{ background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.3)", color: "#fca5a5" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div>
            <label className="block font-body text-xs tracking-widest uppercase mb-2" style={{ color: "#B8944F" }}>{t.titleLabel} *</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder={t.titlePh} required
              className={taBase} style={taStyle} onFocus={focus} onBlur={blur} />
          </div>

          <div>
            <label className="block font-body text-xs tracking-widest uppercase mb-2" style={{ color: "#B8944F" }}>{t.contentLabel} *</label>
            <textarea rows={8} value={content} onChange={e => setContent(e.target.value)} placeholder={t.contentPh} required
              className={taBase + " resize-none"} style={taStyle} onFocus={focus} onBlur={blur} />
          </div>

          <div>
            <label className="block font-body text-xs tracking-widest uppercase mb-2" style={{ color: "#555555" }}>
              {t.summaryLabel} <span className="normal-case tracking-normal text-[#333333]">{t.summaryNote}</span>
            </label>
            <textarea rows={2} value={summary} onChange={e => setSummary(e.target.value)} placeholder={t.summaryPh}
              className={taBase + " resize-none"} style={taStyle} onFocus={focus} onBlur={blur} />
          </div>

          <button type="submit" disabled={!canSubmit} className="w-full rounded-full py-3 font-body font-medium text-sm transition-colors"
            style={{ background: canSubmit ? "#B8944F" : "rgba(184,148,79,0.2)", color: canSubmit ? "#FEFCF7" : "rgba(184,148,79,0.4)", cursor: canSubmit ? "pointer" : "not-allowed" }}>
            {submitting ? t.publishing : t.publish}
          </button>
        </form>
      </div>
    </main>
  )
}
