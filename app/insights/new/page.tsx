"use client"

import { useEffect, useState, useRef } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft } from "lucide-react"
import { useLanguage } from "@/lib/i18n/LanguageContext"

const INDUSTRIES = [
  "Technology","Finance","Healthcare","Consulting","Manufacturing",
  "Media & Entertainment","Retail & E-commerce","Energy","Real Estate",
  "Education","Logistics","Telecommunications","Consumer Goods","Legal","Government",
]

const DRAFT_KEY = "insight_draft"

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
    tagsLabel: "Industry Tags",
    tagsHint: "Up to 3",
    visibilityLabel: "Visibility",
    visPublic: "Public",
    visConnections: "Connections Only",
    publish: "Publish Insight",
    publishing: "Publishing…",
    error: "Failed to publish insight. Please try again.",
    draftBanner: "Draft restored — continue where you left off.",
    draftDiscard: "Discard",
    words: (n: number) => `${n} words`,
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
    tagsLabel: "行业标签",
    tagsHint: "最多 3 个",
    visibilityLabel: "可见性",
    visPublic: "公开",
    visConnections: "仅连接可见",
    publish: "发布洞察",
    publishing: "发布中…",
    error: "发布洞察失败，请重试。",
    draftBanner: "已恢复草稿，继续上次编辑。",
    draftDiscard: "丢弃",
    words: (n: number) => `${n} 字`,
  },
}

interface DraftData {
  title: string;
  content: string;
  summary: string;
  tags: string[];
  visibility: "public" | "connections";
}

export default function NewInsightPage() {
  const { status } = useSession()
  const router = useRouter()
  const { lang } = useLanguage()
  const t = copy[lang]

  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [summary, setSummary] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [visibility, setVisibility] = useState<"public" | "connections">("public")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showDraftBanner, setShowDraftBanner] = useState(false)
  const draftTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // On mount: check for saved draft
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY)
      if (raw) {
        const draft: DraftData = JSON.parse(raw)
        if (draft.title || draft.content) {
          setTitle(draft.title ?? "")
          setContent(draft.content ?? "")
          setSummary(draft.summary ?? "")
          setTags(draft.tags ?? [])
          setVisibility(draft.visibility ?? "public")
          setShowDraftBanner(true)
        }
      }
    } catch { /* ignore corrupt draft */ }
  }, [])

  // Auto-save draft on change
  useEffect(() => {
    if (draftTimerRef.current) clearTimeout(draftTimerRef.current)
    draftTimerRef.current = setTimeout(() => {
      if (!title && !content) return
      const draft: DraftData = { title, content, summary, tags, visibility }
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
    }, 2000)
  }, [title, content, summary, tags, visibility])

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

  function toggleTag(ind: string) {
    setTags((prev) =>
      prev.includes(ind) ? prev.filter((t) => t !== ind) : prev.length < 3 ? [...prev, ind] : prev
    )
  }

  function discardDraft() {
    localStorage.removeItem(DRAFT_KEY)
    setTitle(""); setContent(""); setSummary(""); setTags([]); setVisibility("public")
    setShowDraftBanner(false)
  }

  const wordCount = lang === "zh"
    ? content.length
    : content.trim().split(/\s+/).filter(Boolean).length

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
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          summary: summary.trim() || undefined,
          source: "MANUAL",
          isDraft: false,
          isPublic: visibility === "public",
          tags,
        }),
      })
      if (!res.ok) throw new Error("Failed to publish")
      localStorage.removeItem(DRAFT_KEY)
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

        {/* Draft restore banner */}
        {showDraftBanner && (
          <div className="rounded-[12px] px-4 py-3 mb-6 flex items-center justify-between font-body text-sm"
            style={{ background: "rgba(184,148,79,0.08)", border: "1px solid rgba(184,148,79,0.2)", color: "#E8D5A0" }}>
            <span>{t.draftBanner}</span>
            <button onClick={discardDraft} className="text-[#555555] hover:text-[#E8E2D8] transition-colors ml-4 text-xs cursor-pointer">
              {t.draftDiscard}
            </button>
          </div>
        )}

        {error && (
          <div className="rounded-[12px] px-4 py-3 mb-6 font-body text-sm" style={{ background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.3)", color: "#fca5a5" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Title */}
          <div>
            <label className="block font-body text-xs tracking-widest uppercase mb-2" style={{ color: "#B8944F" }}>{t.titleLabel} *</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder={t.titlePh} required
              className={taBase} style={taStyle} onFocus={focus} onBlur={blur} />
          </div>

          {/* Content + word count */}
          <div>
            <label className="block font-body text-xs tracking-widest uppercase mb-2" style={{ color: "#B8944F" }}>{t.contentLabel} *</label>
            <textarea rows={8} value={content} onChange={e => setContent(e.target.value)} placeholder={t.contentPh} required
              className={taBase + " resize-none"} style={taStyle} onFocus={focus} onBlur={blur} />
            <p className="text-right font-body text-[10px] mt-1" style={{ color: "#555555" }}>
              {t.words(wordCount)}
            </p>
          </div>

          {/* Summary */}
          <div>
            <label className="block font-body text-xs tracking-widest uppercase mb-2" style={{ color: "#555555" }}>
              {t.summaryLabel} <span className="normal-case tracking-normal text-[#333333]">{t.summaryNote}</span>
            </label>
            <textarea rows={2} value={summary} onChange={e => setSummary(e.target.value)} placeholder={t.summaryPh}
              className={taBase + " resize-none"} style={taStyle} onFocus={focus} onBlur={blur} />
          </div>

          {/* Industry Tags */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block font-body text-xs tracking-widest uppercase" style={{ color: "#555555" }}>{t.tagsLabel}</label>
              <span className="font-body text-[10px]" style={{ color: "#555555" }}>{t.tagsHint} ({tags.length}/3)</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {INDUSTRIES.map((ind) => {
                const selected = tags.includes(ind)
                const disabled = !selected && tags.length >= 3
                return (
                  <button key={ind} type="button" onClick={() => toggleTag(ind)} disabled={disabled}
                    className="px-3 py-1.5 rounded-full font-body text-xs transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                    style={{
                      background: selected ? "rgba(184,148,79,0.2)" : "rgba(255,255,255,0.04)",
                      border: selected ? "1px solid rgba(184,148,79,0.5)" : "1px solid rgba(255,255,255,0.08)",
                      color: selected ? "#B8944F" : "rgba(232,226,216,0.5)",
                    }}>
                    {ind}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Visibility */}
          <div>
            <label className="block font-body text-xs tracking-widest uppercase mb-2" style={{ color: "#555555" }}>{t.visibilityLabel}</label>
            <div className="flex gap-2">
              {(["public", "connections"] as const).map((v) => (
                <button key={v} type="button" onClick={() => setVisibility(v)}
                  className="flex-1 py-2.5 rounded-full font-body text-sm transition-all cursor-pointer"
                  style={{
                    background: visibility === v ? "rgba(184,148,79,0.15)" : "rgba(255,255,255,0.04)",
                    border: visibility === v ? "1px solid rgba(184,148,79,0.4)" : "1px solid rgba(255,255,255,0.08)",
                    color: visibility === v ? "#B8944F" : "rgba(232,226,216,0.4)",
                  }}>
                  {v === "public" ? t.visPublic : t.visConnections}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button type="submit" disabled={!canSubmit} className="w-full rounded-full py-3 font-body font-medium text-sm transition-colors"
            style={{ background: canSubmit ? "#B8944F" : "rgba(184,148,79,0.2)", color: canSubmit ? "#FEFCF7" : "rgba(184,148,79,0.4)", cursor: canSubmit ? "pointer" : "not-allowed" }}>
            {submitting ? t.publishing : t.publish}
          </button>
        </form>
      </div>
    </main>
  )
}
