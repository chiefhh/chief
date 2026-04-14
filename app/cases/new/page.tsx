"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import ReactMarkdown from "react-markdown"
import { ArrowLeft } from "lucide-react"
import { useLanguage } from "@/lib/i18n/LanguageContext"
import { Suspense } from "react"

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

const TEMPLATES_EN: { value: CaseTemplate; label: string }[] = [
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

const TEMPLATES_ZH: { value: CaseTemplate; label: string }[] = [
  { value: "CRISIS_MANAGEMENT", label: "🚨 危机管理" },
  { value: "ORG_RESTRUCTURING", label: "🏗 团队重组" },
  { value: "STRATEGIC_PIVOT", label: "🧭 战略转型" },
  { value: "SCALING_CHALLENGE", label: "📈 规模化挑战" },
  { value: "PRODUCT_LAUNCH", label: "🚀 产品决策" },
  { value: "TALENT_STRATEGY", label: "👥 人才策略" },
  { value: "FUNDRAISING", label: "💰 融资决策" },
  { value: "TECHNOLOGY_BET", label: "⚡ 技术押注" },
  { value: "MARKET_ENTRY", label: "🌍 市场进入" },
  { value: "CUSTOM", label: "✏️ 自定义" },
]

const copy = {
  en: {
    back: "Back",
    step1Title: "What kind of decision was this?",
    step1Sub: "Choose the template that best fits your decision.",
    continue: "Continue",
    step2Title: "Tell your story",
    step2Sub: "Answer these four questions. AI will craft your case study from your notes.",
    q1: "What was the context? What core challenge were you facing?",
    q1ph: "Describe the situation, the business context, and what was at stake...",
    q2: "What were the conflicting options or constraints?",
    q2ph: "What were the competing paths? What made this hard? Who disagreed?",
    q3: "What key decision did you make, and why?",
    q3ph: "Describe the decision you chose and the reasoning behind it...",
    q4: "What was the outcome? What did you learn?",
    q4ph: "What happened after? What would you do differently? What principle did this reinforce?",
    backBtn: "Back",
    generate: "Generate with AI →",
    generating: "AI is structuring your case…",
    step3Title: "Preview your case",
    step3Sub: "Review and edit before publishing to your profile.",
    titleLabel: "Title",
    summaryLabel: "Summary",
    backToEdit: "← Back to edit",
    publishing: "Publishing…",
    publish: "Publish Case",
    aiError: "AI failed to generate your case. Please try again.",
    publishError: "Failed to publish case. Please try again.",
  },
  zh: {
    back: "返回",
    step1Title: "这是哪种类型的决策？",
    step1Sub: "选择最符合你决策情况的模板。",
    continue: "继续",
    step2Title: "讲述你的故事",
    step2Sub: "回答以下四个问题，AI 将根据你的笔记生成完整案例。",
    q1: "当时的背景是什么？你面临的核心挑战是什么？",
    q1ph: "描述当时的情况、业务背景以及所面临的风险...",
    q2: "有哪些相互冲突的选项或制约因素？",
    q2ph: "有哪些竞争路径？是什么让决策变得困难？有谁持异议？",
    q3: "你做出了什么关键决定？为什么？",
    q3ph: "描述你选择的决策及其背后的原因...",
    q4: "结果如何？你学到了什么？",
    q4ph: "之后发生了什么？你会有什么不同做法？这强化了哪个原则？",
    backBtn: "返回",
    generate: "AI 生成 →",
    generating: "AI 正在整理你的案例…",
    step3Title: "预览你的案例",
    step3Sub: "发布到主页前，请检查并编辑内容。",
    titleLabel: "标题",
    summaryLabel: "摘要",
    backToEdit: "← 返回编辑",
    publishing: "发布中…",
    publish: "发布案例",
    aiError: "AI 生成失败，请重试。",
    publishError: "发布案例失败，请重试。",
  },
}

interface GeneratedCase {
  title: string
  summary: string
  content: string
}

function NewCaseInner() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { lang } = useLanguage()
  const t = copy[lang]
  const templates = lang === "zh" ? TEMPLATES_ZH : TEMPLATES_EN

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

  // Pre-select template from URL param (from template library)
  useEffect(() => {
    const tpl = searchParams.get("template") as CaseTemplate | null
    if (tpl && TEMPLATES_EN.some(t => t.value === tpl)) {
      setSelectedTemplate(tpl)
    }
  }, [searchParams])

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
        body: JSON.stringify({ template: selectedTemplate, background, conflict, decision, outcome }),
      })
      if (!res.ok) throw new Error("AI generation failed")
      const data: GeneratedCase = await res.json()
      setGenerated(data)
      setEditableTitle(data.title)
      setStep(3)
    } catch {
      setError(t.aiError)
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
        body: JSON.stringify({ template: selectedTemplate, title: editableTitle, background, conflict, decision, outcome, tags: [], isPublic: true }),
      })
      if (!res.ok) throw new Error("Failed to publish")
      router.push("/dashboard")
    } catch {
      setError(t.publishError)
      setPublishing(false)
    }
  }

  const ta = "w-full rounded-[12px] px-4 py-3 font-body text-sm resize-none outline-none transition-colors"
  const taStyle = { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#F5F0E8" }
  const taFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => (e.currentTarget.style.borderColor = "rgba(184,148,79,0.4)")
  const taBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")

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

        {/* Step dots */}
        <div className="flex items-center justify-center gap-3 mb-10">
          {[1, 2, 3].map((s) => (
            <div key={s} className="rounded-full transition-all" style={{ width: step === s ? "24px" : "8px", height: "8px", background: step >= s ? "#B8944F" : "rgba(255,255,255,0.1)" }} />
          ))}
        </div>

        {error && (
          <div className="rounded-[12px] px-4 py-3 mb-6 font-body text-sm" style={{ background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.3)", color: "#fca5a5" }}>
            {error}
          </div>
        )}

        {/* STEP 1 */}
        {step === 1 && (
          <div>
            <h1 className="font-display text-3xl font-bold mb-2" style={{ color: "#FEFCF7" }}>{t.step1Title}</h1>
            <p className="font-body text-sm mb-8" style={{ color: "#555555" }}>{t.step1Sub}</p>
            <div className="grid grid-cols-2 gap-3 mb-8">
              {templates.map((tpl) => {
                const isSelected = selectedTemplate === tpl.value
                return (
                  <button key={tpl.value} onClick={() => setSelectedTemplate(tpl.value)}
                    className="rounded-[14px] p-4 text-left transition-all cursor-pointer font-body text-sm"
                    style={{ background: isSelected ? "rgba(184,148,79,0.08)" : "rgba(255,255,255,0.04)", border: isSelected ? "1px solid rgba(184,148,79,0.5)" : "1px solid rgba(255,255,255,0.06)", color: isSelected ? "#F5F0E8" : "#E8E2D8" }}>
                    {tpl.label}
                  </button>
                )
              })}
            </div>
            <button onClick={() => setStep(2)} disabled={!selectedTemplate}
              className="w-full rounded-full py-3 font-body font-medium text-sm transition-colors"
              style={{ background: selectedTemplate ? "#B8944F" : "rgba(184,148,79,0.2)", color: selectedTemplate ? "#FEFCF7" : "rgba(184,148,79,0.4)", cursor: selectedTemplate ? "pointer" : "not-allowed" }}>
              {t.continue}
            </button>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div>
            <h1 className="font-display text-3xl font-bold mb-2" style={{ color: "#FEFCF7" }}>{t.step2Title}</h1>
            <p className="font-body text-sm mb-8" style={{ color: "#555555" }}>{t.step2Sub}</p>
            <div className="flex flex-col gap-6">
              {[
                { label: t.q1, ph: t.q1ph, val: background, set: setBackground },
                { label: t.q2, ph: t.q2ph, val: conflict, set: setConflict },
                { label: t.q3, ph: t.q3ph, val: decision, set: setDecision },
                { label: t.q4, ph: t.q4ph, val: outcome, set: setOutcome },
              ].map(({ label, ph, val, set }) => (
                <div key={label}>
                  <label className="block font-body text-sm font-medium mb-2" style={{ color: "#E8E2D8" }}>{label}</label>
                  <textarea rows={5} value={val} onChange={e => set(e.target.value)} placeholder={ph}
                    className={ta} style={taStyle} onFocus={taFocus} onBlur={taBlur} />
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={() => setStep(1)} className="rounded-full py-3 px-6 font-body font-medium text-sm transition-colors cursor-pointer"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#E8E2D8" }}>
                {t.backBtn}
              </button>
              <button onClick={handleGenerate} disabled={!background || !conflict || !decision || !outcome}
                className="flex-1 rounded-full py-3 font-body font-medium text-sm transition-colors"
                style={{ background: (background && conflict && decision && outcome) ? "#B8944F" : "rgba(184,148,79,0.2)", color: (background && conflict && decision && outcome) ? "#FEFCF7" : "rgba(184,148,79,0.4)", cursor: (background && conflict && decision && outcome) ? "pointer" : "not-allowed" }}>
                {t.generate}
              </button>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="fixed inset-0 flex flex-col items-center justify-center gap-4 z-50" style={{ background: "#0A0A0A" }}>
            <div className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "#B8944F", borderTopColor: "transparent" }} />
            <p className="font-body text-sm" style={{ color: "#555555" }}>{t.generating}</p>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && generated && !loading && (
          <div>
            <h1 className="font-display text-3xl font-bold mb-2" style={{ color: "#FEFCF7" }}>{t.step3Title}</h1>
            <p className="font-body text-sm mb-8" style={{ color: "#555555" }}>{t.step3Sub}</p>
            <div className="mb-6">
              <label className="block font-body text-xs tracking-widest uppercase mb-2" style={{ color: "#B8944F" }}>{t.titleLabel}</label>
              <input type="text" value={editableTitle} onChange={e => setEditableTitle(e.target.value)}
                className="w-full rounded-[12px] px-4 py-3 font-display text-xl font-bold outline-none transition-colors"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#FEFCF7" }}
                onFocus={e => (e.currentTarget.style.borderColor = "rgba(184,148,79,0.4)")}
                onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")} />
            </div>
            <div className="rounded-[14px] p-5 mb-6" style={{ background: "rgba(184,148,79,0.06)", border: "1px solid rgba(184,148,79,0.15)" }}>
              <p className="font-body text-xs tracking-widest uppercase mb-2" style={{ color: "#B8944F" }}>{t.summaryLabel}</p>
              <p className="font-body text-sm leading-relaxed" style={{ color: "#E8E2D8" }}>{generated.summary}</p>
            </div>
            <div className="rounded-[14px] p-6 mb-8" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="font-body text-sm leading-relaxed" style={{ color: "#E8E2D8" }}>
                <ReactMarkdown components={{
                  h2: ({ children }) => <h2 className="font-display text-lg font-bold mt-6 mb-3" style={{ color: "#FEFCF7" }}>{children}</h2>,
                  p: ({ children }) => <p className="mb-4 leading-relaxed" style={{ color: "#E8E2D8" }}>{children}</p>,
                  strong: ({ children }) => <strong style={{ color: "#F5F0E8" }}>{children}</strong>,
                }}>{generated.content}</ReactMarkdown>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="rounded-full py-3 px-6 font-body font-medium text-sm transition-colors cursor-pointer"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#E8E2D8" }}>
                {t.backToEdit}
              </button>
              <button onClick={handlePublish} disabled={publishing || !editableTitle.trim()}
                className="flex-1 rounded-full py-3 font-body font-medium text-sm transition-colors"
                style={{ background: (!publishing && editableTitle.trim()) ? "#B8944F" : "rgba(184,148,79,0.2)", color: (!publishing && editableTitle.trim()) ? "#FEFCF7" : "rgba(184,148,79,0.4)", cursor: (!publishing && editableTitle.trim()) ? "pointer" : "not-allowed" }}>
                {publishing ? t.publishing : t.publish}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

export default function NewCasePage() {
  return (
    <Suspense>
      <NewCaseInner />
    </Suspense>
  )
}
