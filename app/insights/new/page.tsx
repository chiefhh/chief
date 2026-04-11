"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { SiteLogo } from "@/components/SiteLogo"
import { ArrowLeft } from "lucide-react"

export default function NewInsightPage() {
  const { status } = useSession()
  const router = useRouter()

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
        <div
          className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: "#B8944F", borderTopColor: "transparent" }}
        />
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
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          summary: summary.trim() || undefined,
          source: "MANUAL",
          isDraft: false,
          isPublic: true,
        }),
      })
      if (!res.ok) throw new Error("Failed to publish")
      router.push("/dashboard")
    } catch {
      setError("Failed to publish insight. Please try again.")
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen px-6 py-12" style={{ background: "#0A0A0A" }}>
      {/* Ambient gradient */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(184,148,79,0.05) 0%, transparent 70%)",
        }}
      />

      <div className="relative max-w-[600px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 transition-colors"
            style={{ color: "#555555" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#E8E2D8")}
            onMouseLeave={e => (e.currentTarget.style.color = "#555555")}
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-body text-sm">Back</span>
          </Link>
          <Link href="/">
            <SiteLogo size={28} theme="light" />
          </Link>
          <div className="w-16" />
        </div>

        <h1 className="font-display text-3xl font-bold mb-2" style={{ color: "#FEFCF7" }}>
          Write Insight
        </h1>
        <p className="font-body text-sm mb-8" style={{ color: "#555555" }}>
          Share a thought, lesson, or perspective with the network.
        </p>

        {/* Error banner */}
        {error && (
          <div
            className="rounded-[12px] px-4 py-3 mb-6 font-body text-sm"
            style={{
              background: "rgba(220,38,38,0.1)",
              border: "1px solid rgba(220,38,38,0.3)",
              color: "#fca5a5",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Title */}
          <div>
            <label
              className="block font-body text-xs tracking-widest uppercase mb-2"
              style={{ color: "#B8944F" }}
            >
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Your insight title"
              required
              className="w-full rounded-[12px] px-4 py-3 font-body text-sm outline-none transition-colors"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "#F5F0E8",
              }}
              onFocus={e => (e.currentTarget.style.borderColor = "rgba(184,148,79,0.4)")}
              onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
            />
          </div>

          {/* Content */}
          <div>
            <label
              className="block font-body text-xs tracking-widest uppercase mb-2"
              style={{ color: "#B8944F" }}
            >
              Content *
            </label>
            <textarea
              rows={8}
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Share your perspective, lesson learned, or observation…"
              required
              className="w-full rounded-[12px] px-4 py-3 font-body text-sm resize-none outline-none transition-colors"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "#F5F0E8",
              }}
              onFocus={e => (e.currentTarget.style.borderColor = "rgba(184,148,79,0.4)")}
              onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
            />
          </div>

          {/* Summary (optional) */}
          <div>
            <label
              className="block font-body text-xs tracking-widest uppercase mb-2"
              style={{ color: "#555555" }}
            >
              Hook / Summary{" "}
              <span className="normal-case tracking-normal text-[#333333]">(optional)</span>
            </label>
            <textarea
              rows={2}
              value={summary}
              onChange={e => setSummary(e.target.value)}
              placeholder="2-sentence hook (optional)"
              className="w-full rounded-[12px] px-4 py-3 font-body text-sm resize-none outline-none transition-colors"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "#F5F0E8",
              }}
              onFocus={e => (e.currentTarget.style.borderColor = "rgba(184,148,79,0.4)")}
              onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
            />
          </div>

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full rounded-full py-3 font-body font-medium text-sm transition-colors"
            style={{
              background: canSubmit ? "#B8944F" : "rgba(184,148,79,0.2)",
              color: canSubmit ? "#FEFCF7" : "rgba(184,148,79,0.4)",
              cursor: canSubmit ? "pointer" : "not-allowed",
            }}
          >
            {submitting ? "Publishing…" : "Publish Insight"}
          </button>
        </form>
      </div>
    </main>
  )
}
