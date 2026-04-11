"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { SiteLogo } from "@/components/SiteLogo"
import ReactMarkdown from "react-markdown"
import { ArrowLeft } from "lucide-react"

interface GeneratedInsight {
  title: string
  summary: string
  content: string
}

export default function ShadowWriterPage() {
  const { status } = useSession()
  const router = useRouter()

  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [rawContent, setRawContent] = useState("")
  const [generated, setGenerated] = useState<GeneratedInsight | null>(null)
  const [editableTitle, setEditableTitle] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [publishing, setPublishing] = useState(false)

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

  async function handleTransform() {
    if (!rawContent.trim()) return
    setError(null)
    setLoading(true)
    setStep(2)
    try {
      const res = await fetch("/api/ai/shadow-writer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawContent }),
      })
      if (!res.ok) throw new Error("Transformation failed")
      const data: GeneratedInsight = await res.json()
      setGenerated(data)
      setEditableTitle(data.title)
      setStep(3)
    } catch {
      setError("AI failed to transform your content. Please try again.")
      setStep(1)
    } finally {
      setLoading(false)
    }
  }

  async function handlePublish() {
    if (!generated) return
    setPublishing(true)
    setError(null)
    try {
      const res = await fetch("/api/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editableTitle,
          content: generated.content,
          summary: generated.summary,
          source: "SHADOW_WRITER",
          isDraft: false,
          isPublic: true,
        }),
      })
      if (!res.ok) throw new Error("Failed to publish")
      router.push("/dashboard")
    } catch {
      setError("Failed to publish insight. Please try again.")
      setPublishing(false)
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

        {/* STEP 1: Input */}
        {step === 1 && (
          <div>
            <h1 className="font-display text-3xl font-bold mb-2" style={{ color: "#FEFCF7" }}>
              Shadow Writer
            </h1>
            <p className="font-body text-sm mb-8" style={{ color: "#555555" }}>
              Paste your raw content — a speech, LinkedIn post, meeting notes, or bullet points. AI will transform it into a polished insight article in your voice.
            </p>

            <textarea
              rows={12}
              value={rawContent}
              onChange={e => setRawContent(e.target.value)}
              placeholder="Paste your speech transcript, LinkedIn post, bullet points, or any raw content here…"
              className="w-full rounded-[14px] px-4 py-4 font-body text-sm resize-none outline-none transition-colors mb-6"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "#F5F0E8",
              }}
              onFocus={e => (e.currentTarget.style.borderColor = "rgba(184,148,79,0.4)")}
              onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
            />

            <button
              onClick={handleTransform}
              disabled={!rawContent.trim()}
              className="w-full rounded-full py-3 font-body font-medium text-sm transition-colors"
              style={{
                background: rawContent.trim() ? "#B8944F" : "rgba(184,148,79,0.2)",
                color: rawContent.trim() ? "#FEFCF7" : "rgba(184,148,79,0.4)",
                cursor: rawContent.trim() ? "pointer" : "not-allowed",
              }}
            >
              ✨ Transform with AI
            </button>
          </div>
        )}

        {/* STEP 2: Loading */}
        {step === 2 && loading && (
          <div
            className="fixed inset-0 flex flex-col items-center justify-center gap-4 z-50"
            style={{ background: "#0A0A0A" }}
          >
            <div
              className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin"
              style={{ borderColor: "#B8944F", borderTopColor: "transparent" }}
            />
            <p className="font-body text-sm" style={{ color: "#555555" }}>
              Transforming your content…
            </p>
          </div>
        )}

        {/* STEP 3: Preview & Publish */}
        {step === 3 && generated && !loading && (
          <div>
            <h1 className="font-display text-3xl font-bold mb-2" style={{ color: "#FEFCF7" }}>
              Preview your insight
            </h1>
            <p className="font-body text-sm mb-8" style={{ color: "#555555" }}>
              Review and edit before publishing to your profile.
            </p>

            {/* Editable title */}
            <div className="mb-6">
              <label
                className="block font-body text-xs tracking-widest uppercase mb-2"
                style={{ color: "#B8944F" }}
              >
                Title
              </label>
              <input
                type="text"
                value={editableTitle}
                onChange={e => setEditableTitle(e.target.value)}
                className="w-full rounded-[12px] px-4 py-3 font-display text-xl font-bold outline-none transition-colors"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "#FEFCF7",
                }}
                onFocus={e => (e.currentTarget.style.borderColor = "rgba(184,148,79,0.4)")}
                onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
              />
            </div>

            {/* Summary blockquote */}
            <div
              className="rounded-[14px] p-5 mb-6"
              style={{
                background: "rgba(184,148,79,0.06)",
                border: "1px solid rgba(184,148,79,0.15)",
                borderLeft: "3px solid #B8944F",
              }}
            >
              <p
                className="font-body text-xs tracking-widest uppercase mb-2"
                style={{ color: "#B8944F" }}
              >
                Hook
              </p>
              <p className="font-body text-sm leading-relaxed italic" style={{ color: "#E8E2D8" }}>
                {generated.summary}
              </p>
            </div>

            {/* Full markdown content */}
            <div
              className="rounded-[14px] p-6 mb-8"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div className="font-body text-sm leading-relaxed" style={{ color: "#E8E2D8" }}>
                <ReactMarkdown
                  components={{
                    h2: ({ children }) => (
                      <h2
                        className="font-display text-lg font-bold mt-6 mb-3"
                        style={{ color: "#FEFCF7" }}
                      >
                        {children}
                      </h2>
                    ),
                    p: ({ children }) => (
                      <p className="mb-4 leading-relaxed" style={{ color: "#E8E2D8" }}>
                        {children}
                      </p>
                    ),
                    strong: ({ children }) => (
                      <strong style={{ color: "#F5F0E8" }}>{children}</strong>
                    ),
                    ul: ({ children }) => (
                      <ul className="mb-4 pl-5 list-disc" style={{ color: "#E8E2D8" }}>
                        {children}
                      </ul>
                    ),
                    li: ({ children }) => (
                      <li className="mb-1">{children}</li>
                    ),
                  }}
                >
                  {generated.content}
                </ReactMarkdown>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="rounded-full py-3 px-6 font-body font-medium text-sm transition-colors cursor-pointer"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "#E8E2D8",
                }}
              >
                ← Edit Raw Content
              </button>
              <button
                onClick={handlePublish}
                disabled={publishing || !editableTitle.trim()}
                className="flex-1 rounded-full py-3 font-body font-medium text-sm transition-colors"
                style={{
                  background: !publishing && editableTitle.trim() ? "#B8944F" : "rgba(184,148,79,0.2)",
                  color: !publishing && editableTitle.trim() ? "#FEFCF7" : "rgba(184,148,79,0.4)",
                  cursor: !publishing && editableTitle.trim() ? "pointer" : "not-allowed",
                }}
              >
                {publishing ? "Publishing…" : "Publish as Insight"}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
