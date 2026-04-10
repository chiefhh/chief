"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import ReactMarkdown from "react-markdown"
import { ArrowLeft } from "lucide-react"

type CaseTemplate =
  | "CRISIS_MANAGEMENT"
  | "ORG_RESTRUCTURING"
  | "STRATEGIC_PIVOT"
  | "SCALING_CHALLENGE"
  | "PRODUCT_LAUNCH"
  | "TALENT_STRATEGY"
  | "FUNDRAISING"
  | "TECHNOLOGY_BET"
  | "MARKET_ENTRY"
  | "CUSTOM"

const TEMPLATES: { value: CaseTemplate; label: string }[] = [
  { value: "CRISIS_MANAGEMENT", label: "🚨 Crisis Management" },
  { value: "ORG_RESTRUCTURING", label: "🏗 Org Restructuring" },
  { value: "STRATEGIC_PIVOT", label: "🧭 Strategic Pivot" },
  { value: "SCALING_CHALLENGE", label: "📈 Scaling Challenge" },
  { value: "PRODUCT_LAUNCH", label: "🚀 Product Launch" },
  { value: "TALENT_STRATEGY", label: "👥 Talent Strategy" },
  { value: "FUNDRAISING", label: "💰 Fundraising" },
  { value: "TECHNOLOGY_BET", label: "⚡ Technology Bet" },
  { value: "MARKET_ENTRY", label: "🌍 Market Entry" },
  { value: "CUSTOM", label: "✏️ Custom" },
]

interface GeneratedCase {
  title: string
  summary: string
  content: string
}

export default function NewCasePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [selectedTemplate, setSelectedTemplate] = useState<CaseTemplate | null>(null)
  const [background, setBackground] = useState("")
  const [conflict, setConflict] = useState("")
  const [decision, setDecision] = useState("")
  const [outcome, setOutcome] = useState("")
  const [generated, setGenerated] = useState<GeneratedCase | null>(null)
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
        <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "#B8944F", borderTopColor: "transparent" }} />
      </main>
    )
  }

  async function handleGenerate() {
    if (!selectedTemplate) return
    setError(null)
    setLoading(true)
    try {
      const res = await fetch("/api/ai/generate-case", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          template: selectedTemplate,
          background,
          conflict,
          decision,
          outcome,
        }),
      })
      if (!res.ok) throw new Error("AI generation failed")
      const data: GeneratedCase = await res.json()
      setGenerated(data)
      setEditableTitle(data.title)
      setStep(3)
    } catch {
      setError("AI failed to generate your case. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  async function handlePublish() {
    if (!generated || !selectedTemplate) return
    setPublishing(true)
    setError(null)
    try {
      const res = await fetch("/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          template: selectedTemplate,
          title: editableTitle,
          background,
          conflict,
          decision,
          outcome,
          tags: [],
          isPublic: true,
        }),
      })
      if (!res.ok) throw new Error("Failed to publish")
      router.push("/dashboard")
    } catch {
      setError("Failed to publish case. Please try again.")
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
          <Link href="/" className="font-display text-xl font-bold" style={{ color: "#FEFCF7" }}>
            chief<span style={{ color: "#B8944F" }}>.me</span>
          </Link>
          <div className="w-16" />
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-3 mb-10">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className="rounded-full transition-all"
              style={{
                width: step === s ? "24px" : "8px",
                height: "8px",
                background: step >= s ? "#B8944F" : "rgba(255,255,255,0.1)",
              }}
            />
          ))}
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

        {/* STEP 1: Template selection */}
        {step === 1 && (
          <div>
            <h1 className="font-display text-3xl font-bold mb-2" style={{ color: "#FEFCF7" }}>
              What kind of decision was this?
            </h1>
            <p className="font-body text-sm mb-8" style={{ color: "#555555" }}>
              Choose the template that best fits your decision.
            </p>

            <div className="grid grid-cols-2 gap-3 mb-8">
              {TEMPLATES.map((t) => {
                const isSelected = selectedTemplate === t.value
                return (
                  <button
                    key={t.value}
                    onClick={() => setSelectedTemplate(t.value)}
                    className="rounded-[14px] p-4 text-left transition-all cursor-pointer font-body text-sm"
                    style={{
                      background: isSelected ? "rgba(184,148,79,0.08)" : "rgba(255,255,255,0.04)",
                      border: isSelected
                        ? "1px solid rgba(184,148,79,0.5)"
                        : "1px solid rgba(255,255,255,0.06)",
                      color: isSelected ? "#F5F0E8" : "#E8E2D8",
                    }}
                  >
                    {t.label}
                  </button>
                )
              })}
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!selectedTemplate}
              className="w-full rounded-full py-3 font-body font-medium text-sm transition-colors"
              style={{
                background: selectedTemplate ? "#B8944F" : "rgba(184,148,79,0.2)",
                color: selectedTemplate ? "#FEFCF7" : "rgba(184,148,79,0.4)",
                cursor: selectedTemplate ? "pointer" : "not-allowed",
              }}
            >
              Continue
            </button>
          </div>
        )}

        {/* STEP 2: Guided questions */}
        {step === 2 && (
          <div>
            <h1 className="font-display text-3xl font-bold mb-2" style={{ color: "#FEFCF7" }}>
              Tell your story
            </h1>
            <p className="font-body text-sm mb-8" style={{ color: "#555555" }}>
              Answer these four questions. AI will craft your case study from your notes.
            </p>

            <div className="flex flex-col gap-6">
              {/* Q1 */}
              <div>
                <label className="block font-body text-sm font-medium mb-2" style={{ color: "#E8E2D8" }}>
                  What was the context? What core challenge were you facing?
                </label>
                <textarea
                  rows={5}
                  value={background}
                  onChange={(e) => setBackground(e.target.value)}
                  placeholder="Describe the situation, the business context, and what was at stake..."
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

              {/* Q2 */}
              <div>
                <label className="block font-body text-sm font-medium mb-2" style={{ color: "#E8E2D8" }}>
                  What were the conflicting options or constraints?
                </label>
                <textarea
                  rows={5}
                  value={conflict}
                  onChange={(e) => setConflict(e.target.value)}
                  placeholder="What were the competing paths? What made this hard? Who disagreed?"
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

              {/* Q3 */}
              <div>
                <label className="block font-body text-sm font-medium mb-2" style={{ color: "#E8E2D8" }}>
                  What key decision did you make, and why?
                </label>
                <textarea
                  rows={5}
                  value={decision}
                  onChange={(e) => setDecision(e.target.value)}
                  placeholder="Describe the decision you chose and the reasoning behind it..."
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

              {/* Q4 */}
              <div>
                <label className="block font-body text-sm font-medium mb-2" style={{ color: "#E8E2D8" }}>
                  What was the outcome? What did you learn?
                </label>
                <textarea
                  rows={5}
                  value={outcome}
                  onChange={(e) => setOutcome(e.target.value)}
                  placeholder="What happened after? What would you do differently? What principle did this reinforce?"
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
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setStep(1)}
                className="rounded-full py-3 px-6 font-body font-medium text-sm transition-colors cursor-pointer"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "#E8E2D8",
                }}
              >
                Back
              </button>
              <button
                onClick={handleGenerate}
                disabled={!background || !conflict || !decision || !outcome}
                className="flex-1 rounded-full py-3 font-body font-medium text-sm transition-colors"
                style={{
                  background:
                    background && conflict && decision && outcome
                      ? "#B8944F"
                      : "rgba(184,148,79,0.2)",
                  color:
                    background && conflict && decision && outcome
                      ? "#FEFCF7"
                      : "rgba(184,148,79,0.4)",
                  cursor:
                    background && conflict && decision && outcome ? "pointer" : "not-allowed",
                }}
              >
                Generate with AI →
              </button>
            </div>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div
            className="fixed inset-0 flex flex-col items-center justify-center gap-4 z-50"
            style={{ background: "#0A0A0A" }}
          >
            <div
              className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin"
              style={{ borderColor: "#B8944F", borderTopColor: "transparent" }}
            />
            <p className="font-body text-sm" style={{ color: "#555555" }}>
              AI is structuring your case…
            </p>
          </div>
        )}

        {/* STEP 3: Preview */}
        {step === 3 && generated && !loading && (
          <div>
            <h1 className="font-display text-3xl font-bold mb-2" style={{ color: "#FEFCF7" }}>
              Preview your case
            </h1>
            <p className="font-body text-sm mb-8" style={{ color: "#555555" }}>
              Review and edit before publishing to your profile.
            </p>

            {/* Editable title */}
            <div className="mb-6">
              <label className="block font-body text-xs tracking-widest uppercase mb-2" style={{ color: "#B8944F" }}>
                Title
              </label>
              <input
                type="text"
                value={editableTitle}
                onChange={(e) => setEditableTitle(e.target.value)}
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

            {/* Summary */}
            <div
              className="rounded-[14px] p-5 mb-6"
              style={{
                background: "rgba(184,148,79,0.06)",
                border: "1px solid rgba(184,148,79,0.15)",
              }}
            >
              <p className="font-body text-xs tracking-widest uppercase mb-2" style={{ color: "#B8944F" }}>
                Summary
              </p>
              <p className="font-body text-sm leading-relaxed" style={{ color: "#E8E2D8" }}>
                {generated.summary}
              </p>
            </div>

            {/* Content */}
            <div
              className="rounded-[14px] p-6 mb-8"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div
                className="font-body text-sm leading-relaxed prose-invert"
                style={{ color: "#E8E2D8" }}
              >
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
                  }}
                >
                  {generated.content}
                </ReactMarkdown>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="rounded-full py-3 px-6 font-body font-medium text-sm transition-colors cursor-pointer"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "#E8E2D8",
                }}
              >
                ← Back to edit
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
                {publishing ? "Publishing…" : "Publish Case"}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
