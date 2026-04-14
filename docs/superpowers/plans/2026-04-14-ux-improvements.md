# UX Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add onboarding tour modal, insights editor enhancements (tags/visibility/word-count/draft), connection quality checklist, and real-data members directory with filters.

**Architecture:** Pure client-side state for tour (localStorage) and draft (localStorage). Schema migration adds `tags String[]` to Insight. Members directory uses a new public API route. All verification via `npx tsc --noEmit`.

**Tech Stack:** Next.js App Router, Prisma, NextAuth, Tailwind, lucide-react, TypeScript

---

## File Map

| Action | Path | Purpose |
|--------|------|---------|
| Modify | `prisma/schema.prisma` | Add `tags String[]` to Insight model |
| Modify | `app/api/profile/setup/route.ts` | Return `insightCount` from GET |
| Modify | `app/api/insights/route.ts` | Accept `tags` in POST |
| Create | `components/OnboardingTour.tsx` | 3-step tour overlay component |
| Modify | `app/dashboard/page.tsx` | Mount tour; add bio/insightCount to ProfileData; add score checklist card |
| Modify | `app/insights/new/page.tsx` | Tags, visibility toggle, word count, draft auto-save |
| Create | `app/api/members/route.ts` | Public members listing with filters |
| Modify | `app/members/page.tsx` | Real data fetch, industry/title filters, clickable cards |

---

## Task 1: Prisma — add tags to Insight model

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Add `tags String[]` to the Insight model**

Find the `model Insight` block (around line 165). After `isDraft Boolean @default(true)`, add:

```prisma
  tags      String[]
```

The model should now look like:
```prisma
model Insight {
  id        String  @id @default(cuid())
  profileId String
  profile   Profile @relation(fields: [profileId], references: [id], onDelete: Cascade)

  title     String
  content   String        @db.Text
  summary   String?
  source    InsightSource @default(MANUAL)
  sourceUrl String?
  isPinned  Boolean       @default(false)
  isPublic  Boolean       @default(true)
  isDraft   Boolean       @default(true)
  tags      String[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

- [ ] **Step 2: Run migration**

```bash
cd /Users/midaijin/Desktop/chiefme && npx prisma migrate dev --name add_insight_tags
```

Expected: Migration created and applied. No errors.

- [ ] **Step 3: Type-check**

```bash
cd /Users/midaijin/Desktop/chiefme && npx tsc --noEmit
```

Expected: exit 0.

- [ ] **Step 4: Commit**

```bash
git add prisma/schema.prisma prisma/migrations/
git commit -m "feat: add tags field to Insight model"
```

---

## Task 2: Profile setup GET — return insightCount

**Files:**
- Modify: `app/api/profile/setup/route.ts`

- [ ] **Step 1: Update the Prisma query in the GET handler**

In the GET handler, find the `prisma.profile.findUnique` call. Replace it with:

```ts
const profile = await prisma.profile.findUnique({
  where: { userId: session.user.id },
  select: {
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
    viewCount: true,
    connectionCount: true,
    _count: {
      select: {
        insights: { where: { isDraft: false } },
      },
    },
  },
});
```

- [ ] **Step 2: Update the response to flatten insightCount**

Replace `return Response.json({ profile });` with:

```ts
if (!profile) return Response.json({ profile: null });
const { _count, ...rest } = profile;
return Response.json({ profile: { ...rest, insightCount: _count.insights } });
```

- [ ] **Step 3: Type-check**

```bash
cd /Users/midaijin/Desktop/chiefme && npx tsc --noEmit
```

Expected: exit 0.

- [ ] **Step 4: Commit**

```bash
git add app/api/profile/setup/route.ts
git commit -m "feat: return insightCount from profile setup GET"
```

---

## Task 3: Insights API — accept tags

**Files:**
- Modify: `app/api/insights/route.ts`

- [ ] **Step 1: Accept tags in the POST handler**

Replace the entire file:

```ts
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 })

    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
      select: { id: true }
    })
    if (!profile) return Response.json({ error: "No profile" }, { status: 400 })

    const { title, content, summary, source, isDraft, isPublic, tags } = await req.json()

    const insight = await prisma.insight.create({
      data: {
        profileId: profile.id,
        title,
        content,
        summary: summary || null,
        source: source || 'MANUAL',
        isDraft: isDraft !== false,
        isPublic: isPublic !== false,
        tags: Array.isArray(tags) ? tags.slice(0, 3) : [],
      }
    })

    return Response.json({ insight }, { status: 201 })
  } catch (error) {
    console.error('Create insight error:', error)
    return Response.json({ error: 'Failed to create insight' }, { status: 500 })
  }
}
```

- [ ] **Step 2: Type-check**

```bash
cd /Users/midaijin/Desktop/chiefme && npx tsc --noEmit
```

Expected: exit 0.

- [ ] **Step 3: Commit**

```bash
git add app/api/insights/route.ts
git commit -m "feat: accept tags in insights POST"
```

---

## Task 4: OnboardingTour component

**Files:**
- Create: `components/OnboardingTour.tsx`

- [ ] **Step 1: Create the component**

```tsx
"use client";
import { useState } from "react";
import { Settings, FileText, Share2, X, ArrowRight, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface OnboardingTourProps {
  slug: string;
  onClose: () => void;
}

const steps = {
  en: [
    {
      icon: <Settings className="w-8 h-8 text-[#B8944F]" />,
      title: "Complete Your Profile",
      desc: "Add your bio, industries, and social links to build trust.",
      action: "Go to Edit",
      href: "/edit",
    },
    {
      icon: <FileText className="w-8 h-8 text-[#B8944F]" />,
      title: "Publish Your First Insight",
      desc: "Share a perspective, lesson, or observation with the network.",
      action: "Write Now",
      href: "/insights/new",
    },
    {
      icon: <Share2 className="w-8 h-8 text-[#B8944F]" />,
      title: "Share Your Page",
      desc: "Your doorplate is live. Copy the link and share it anywhere.",
      action: null,
      href: null,
    },
  ],
  zh: [
    {
      icon: <Settings className="w-8 h-8 text-[#B8944F]" />,
      title: "完善资料",
      desc: "添加简介、行业和社交链接，建立专业信任感。",
      action: "去完善",
      href: "/edit",
    },
    {
      icon: <FileText className="w-8 h-8 text-[#B8944F]" />,
      title: "发布内容",
      desc: "向网络分享你的观点、经验或洞察。",
      action: "去发布",
      href: "/insights/new",
    },
    {
      icon: <Share2 className="w-8 h-8 text-[#B8944F]" />,
      title: "分享主页",
      desc: "你的数字门牌已上线，复制链接随时分享。",
      action: null,
      href: null,
    },
  ],
};

export function OnboardingTour({ slug, onClose }: OnboardingTourProps) {
  const [step, setStep] = useState(0);
  const router = useRouter();
  const { lang } = useLanguage();
  const t = steps[lang];
  const current = t[step];
  const isLast = step === 2;

  function handleAction() {
    if (current.href) {
      localStorage.setItem("chief_tour_seen", "1");
      router.push(current.href);
    }
  }

  function handleNext() {
    if (isLast) {
      onClose();
    } else {
      setStep((s) => s + 1);
    }
  }

  function copyLink() {
    navigator.clipboard.writeText(`https://chief.me/${slug}`).catch(() => {});
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: "rgba(0,0,0,0.7)" }}>
      <div
        className="relative w-full max-w-sm rounded-[24px] p-8"
        style={{ background: "#111111", border: "1px solid rgba(184,148,79,0.2)" }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#555555] hover:text-[#E8E2D8] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Progress dots */}
        <div className="flex items-center gap-2 justify-center mb-8">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-1.5 rounded-full transition-all"
              style={{
                width: i === step ? "24px" : "8px",
                background: i <= step ? "#B8944F" : "rgba(184,148,79,0.2)",
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
            style={{ background: "rgba(184,148,79,0.1)" }}>
            {current.icon}
          </div>
          <h2 className="font-display text-xl font-bold text-[#FEFCF7] mb-2">{current.title}</h2>
          <p className="font-body text-sm text-[#555555]">{current.desc}</p>
        </div>

        {/* Step 3: show slug + copy */}
        {isLast && (
          <div
            className="rounded-[12px] px-4 py-3 mb-5 flex items-center justify-between"
            style={{ background: "rgba(184,148,79,0.06)", border: "1px solid rgba(184,148,79,0.15)" }}
          >
            <span className="font-body text-sm text-[#E8E2D8]/70">chief.me/{slug}</span>
            <button
              onClick={copyLink}
              className="font-body text-xs text-[#B8944F] hover:text-[#E8D5A0] transition-colors cursor-pointer"
            >
              {lang === "zh" ? "复制" : "Copy"}
            </button>
          </div>
        )}

        {/* Buttons */}
        <div className="flex flex-col gap-2">
          {current.href && (
            <button
              onClick={handleAction}
              className="w-full flex items-center justify-center gap-2 bg-[#B8944F] hover:bg-[#9d7c3e] text-[#FEFCF7] font-body font-medium rounded-full py-3 text-sm transition-colors cursor-pointer"
            >
              {current.action} <ArrowRight className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={handleNext}
            className="w-full font-body text-sm text-[#555555] hover:text-[#E8E2D8] transition-colors py-2 cursor-pointer"
          >
            {isLast
              ? (lang === "zh" ? "完成" : "Done")
              : (lang === "zh" ? "跳过此步" : "Skip")}
          </button>
        </div>

        {/* Step counter */}
        <p className="text-center font-body text-[10px] text-[#555555] mt-4">
          {step + 1} / 3
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

```bash
cd /Users/midaijin/Desktop/chiefme && npx tsc --noEmit
```

Expected: exit 0.

- [ ] **Step 3: Commit**

```bash
git add components/OnboardingTour.tsx
git commit -m "feat: add OnboardingTour 3-step modal component"
```

---

## Task 5: Dashboard — mount tour + ProfileData + score checklist

**Files:**
- Modify: `app/dashboard/page.tsx`

- [ ] **Step 1: Update ProfileData interface**

Find the `interface ProfileData` block and replace it:

```tsx
interface ProfileData {
  slug: string;
  globalNumber: number;
  displayName: string;
  title: string;
  company: string;
  headline: string | null;
  bio: string | null;
  viewCount: number;
  connectionCount: number;
  insightCount: number;
}
```

- [ ] **Step 2: Add OnboardingTour import and tour state**

Add to the import section at top:
```tsx
import { OnboardingTour } from "@/components/OnboardingTour";
```

After `const [walletLoading, setWalletLoading] = useState(false);`, add:
```tsx
const [showTour, setShowTour] = useState(false);
```

- [ ] **Step 3: Add useEffect to trigger tour**

After the existing `useEffect` blocks, add:

```tsx
useEffect(() => {
  if (!profile) return;
  if (!localStorage.getItem("chief_tour_seen")) {
    setShowTour(true);
  }
}, [profile]);
```

- [ ] **Step 4: Mount OnboardingTour in JSX**

In the `return (...)`, right after `<main className="min-h-screen ...">`, add:

```tsx
{showTour && profile && (
  <OnboardingTour
    slug={profile.slug}
    onClose={() => {
      localStorage.setItem("chief_tour_seen", "1");
      setShowTour(false);
    }}
  />
)}
```

- [ ] **Step 5: Add score checklist card below Connection Quality card**

Find the closing `</div>` of the Connection Quality card (the one with `rounded-[16px] p-6 mb-6`). Insert the following block AFTER it:

```tsx
{/* Score Improvement Checklist */}
{profile && (() => {
  const items = [
    {
      done: !!profile.bio,
      labelEn: "Add a bio",
      labelZh: "添加简介",
      pts: "+10",
      href: "/edit",
    },
    {
      done: profile.insightCount > 0,
      labelEn: "Publish an insight",
      labelZh: "发布洞察",
      pts: "+15",
      href: "/insights/new",
    },
    {
      done: profile.connectionCount >= 3,
      labelEn: "Connect with 3 peers",
      labelZh: "建立 3 个连接",
      pts: "+20",
      href: null,
    },
    {
      done: !!user?.image,
      labelEn: "Add a profile photo",
      labelZh: "完善头像",
      pts: "+5",
      href: null,
    },
  ];
  const hasIncomplete = items.some((i) => !i.done);
  if (!hasIncomplete) return null;
  return (
    <div
      className="rounded-[16px] p-6 mb-6"
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(184,148,79,0.15)" }}
    >
      <p className="font-body text-[10px] tracking-widest text-[#555555] uppercase mb-4">
        {lang === "zh" ? "提升评分" : "Improve Your Score"}
      </p>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.labelEn} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  border: item.done ? "none" : "1.5px solid rgba(184,148,79,0.4)",
                  background: item.done ? "rgba(184,148,79,0.15)" : "transparent",
                }}
              >
                {item.done && <Check className="w-3 h-3 text-[#B8944F]" />}
              </div>
              {item.href && !item.done ? (
                <Link href={item.href} className="font-body text-sm text-[#E8E2D8]/70 hover:text-[#B8944F] transition-colors">
                  {lang === "zh" ? item.labelZh : item.labelEn}
                </Link>
              ) : (
                <span className={`font-body text-sm ${item.done ? "text-[#555555] line-through" : "text-[#E8E2D8]/70"}`}>
                  {lang === "zh" ? item.labelZh : item.labelEn}
                </span>
              )}
            </div>
            <span
              className="font-body text-xs font-medium"
              style={{ color: item.done ? "#555555" : "#B8944F" }}
            >
              {item.pts}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
})()}
```

- [ ] **Step 6: Add Check to lucide-react import**

`Check` is already imported. Confirm `Check` is present in the lucide import block. If not, add it.

- [ ] **Step 7: Type-check**

```bash
cd /Users/midaijin/Desktop/chiefme && npx tsc --noEmit
```

Expected: exit 0.

- [ ] **Step 8: Commit**

```bash
git add app/dashboard/page.tsx components/OnboardingTour.tsx
git commit -m "feat: onboarding tour modal and connection quality checklist on dashboard"
```

---

## Task 6: Insights editor — tags, visibility, word count, draft

**Files:**
- Modify: `app/insights/new/page.tsx`

- [ ] **Step 1: Replace the entire file**

The file has many small changes spread across it — replace it wholesale:

```tsx
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
```

- [ ] **Step 2: Type-check**

```bash
cd /Users/midaijin/Desktop/chiefme && npx tsc --noEmit
```

Expected: exit 0.

- [ ] **Step 3: Commit**

```bash
git add app/insights/new/page.tsx
git commit -m "feat: insights editor — tags, visibility, word count, draft auto-save"
```

---

## Task 7: New API — GET /api/members

**Files:**
- Create: `app/api/members/route.ts`

- [ ] **Step 1: Create the route**

```ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const industry = req.nextUrl.searchParams.get("industry") ?? "";
  const q = req.nextUrl.searchParams.get("q") ?? "";

  const members = await prisma.profile.findMany({
    where: {
      ...(industry ? { industries: { has: industry } } : {}),
      ...(q ? { title: { contains: q, mode: "insensitive" } } : {}),
    },
    select: {
      displayName: true,
      title: true,
      company: true,
      slug: true,
      industries: true,
      globalNumber: true,
    },
    orderBy: { globalNumber: "asc" },
    take: 50,
  });

  return Response.json({ members });
}
```

- [ ] **Step 2: Type-check**

```bash
cd /Users/midaijin/Desktop/chiefme && npx tsc --noEmit
```

Expected: exit 0.

- [ ] **Step 3: Commit**

```bash
git add app/api/members/route.ts
git commit -m "feat: add GET /api/members with industry and title filters"
```

---

## Task 8: Members page — real data, filters, clickable cards

**Files:**
- Modify: `app/members/page.tsx`

- [ ] **Step 1: Replace the entire file**

```tsx
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { PageLayout } from "@/components/PageLayout";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const INDUSTRIES = [
  "Technology","Finance","Healthcare","Consulting","Manufacturing",
  "Media & Entertainment","Retail & E-commerce","Energy","Real Estate",
  "Education","Logistics","Telecommunications","Consumer Goods","Legal","Government",
];

interface Member {
  displayName: string;
  title: string;
  company: string;
  slug: string;
  industries: string[];
  globalNumber: number;
}

const copy = {
  en: {
    title: "Members",
    sub: "10,000 founding seats. VP+ verified.",
    join: "Join now",
    back: "Back to Dashboard",
    allIndustries: "All Industries",
    searchPh: "Search by title…",
    empty: "No members found.",
    loading: "Loading…",
  },
  zh: {
    title: "成员目录",
    sub: "10,000 个创始席位，VP+ 认证。",
    join: "立即加入",
    back: "返回控制台",
    allIndustries: "全部行业",
    searchPh: "搜索职位…",
    empty: "暂无成员。",
    loading: "加载中…",
  },
};

export default function MembersPage() {
  const { lang } = useLanguage();
  const t = copy[lang];

  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [industry, setIndustry] = useState("");
  const [q, setQ] = useState("");

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (industry) params.set("industry", industry);
    fetch(`/api/members?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => setMembers(data.members ?? []))
      .finally(() => setLoading(false));
  }, [industry]);

  const displayed = q
    ? members.filter((m) => m.title.toLowerCase().includes(q.toLowerCase()))
    : members;

  return (
    <PageLayout title={t.title} backHref="/dashboard" backLabel={t.back}>
      <p className="text-[#B8944F] text-sm tracking-wide">{t.sub}</p>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 !mt-6">
        <select
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
          className="flex-1 rounded-[10px] px-3 py-2 font-body text-sm bg-[#F5F0E8] border border-[#E8D5A0]/40 text-[#0A0A0A] focus:outline-none focus:border-[#B8944F]"
        >
          <option value="">{t.allIndustries}</option>
          {INDUSTRIES.map((ind) => (
            <option key={ind} value={ind}>{ind}</option>
          ))}
        </select>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t.searchPh}
          className="flex-1 rounded-[10px] px-3 py-2 font-body text-sm bg-[#F5F0E8] border border-[#E8D5A0]/40 text-[#0A0A0A] placeholder:text-[#999] focus:outline-none focus:border-[#B8944F]"
        />
      </div>

      {/* Grid */}
      {loading ? (
        <p className="font-body text-sm text-[#B8944F] !mt-8">{t.loading}</p>
      ) : displayed.length === 0 ? (
        <p className="font-body text-sm text-[#555555] !mt-8">{t.empty}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 !mt-6">
          {displayed.map((m) => (
            <Link
              key={m.slug}
              href={`/chief/${m.slug}`}
              className="rounded-[16px] p-5 bg-[#F5F0E8] hover:bg-[#EDE8E0] transition-colors block"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#B8944F]/30 to-[#E8D5A0]/20 flex items-center justify-center font-display font-bold text-[#B8944F] text-sm">
                  {m.displayName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                </div>
                <span className="font-body text-[9px] tracking-widest text-[#B8944F]">
                  No. {String(m.globalNumber).padStart(3, "0")}
                </span>
              </div>
              <div className="font-body font-medium text-[#0A0A0A] text-sm">{m.displayName}</div>
              <div className="font-body text-[#555555] text-xs">{m.title} · {m.company}</div>
              {m.industries[0] && (
                <span className="mt-2 inline-block font-body text-[9px] tracking-widest bg-[#B8944F]/10 text-[#B8944F] px-2 py-0.5 rounded-full">
                  {m.industries[0]}
                </span>
              )}
            </Link>
          ))}
        </div>
      )}

      <div className="!mt-10 text-center">
        <a href="/join" className="inline-flex items-center gap-2 bg-[#B8944F] hover:bg-[#9d7c3e] text-[#FEFCF7] font-body font-medium rounded-full px-8 py-3 text-sm transition-colors">
          {t.join}
        </a>
      </div>
    </PageLayout>
  );
}
```

- [ ] **Step 2: Type-check**

```bash
cd /Users/midaijin/Desktop/chiefme && npx tsc --noEmit
```

Expected: exit 0.

- [ ] **Step 3: Commit**

```bash
git add app/members/page.tsx
git commit -m "feat: members directory with real data, industry/title filters, clickable cards"
```

---

## Task 9: Push to GitHub

- [ ] **Step 1: Push all commits**

```bash
cd /Users/midaijin/Desktop/chiefme && git push origin main
```

Expected: All commits pushed, no errors.
