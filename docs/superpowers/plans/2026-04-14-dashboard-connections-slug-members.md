# Dashboard Wallet, Connections, Slug Edit, Members Back Button — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Wallet Card quick action to the dashboard, build a /connections page with approve/decline, add slug editing to the edit profile page, and add a back-to-dashboard button on the members page.

**Architecture:** All features are client-side Next.js pages + API routes using the existing Prisma/NextAuth stack. No new dependencies required. Verification via `tsc --noEmit` after each task.

**Tech Stack:** Next.js App Router, Prisma, NextAuth, Tailwind, lucide-react, TypeScript

---

## File Map

| Action | Path | Purpose |
|--------|------|---------|
| Modify | `lib/i18n/translations.ts` | Add wallet card + slug i18n keys |
| Modify | `components/PageLayout.tsx` | Add optional `backHref`/`backLabel` props |
| Modify | `app/members/page.tsx` | Pass `backHref="/dashboard"` |
| Modify | `app/dashboard/page.tsx` | Wallet tile + clickable pending count |
| Create | `app/api/connections/list/route.ts` | GET pending requests |
| Create | `app/api/connections/respond/route.ts` | POST accept/decline |
| Create | `app/connections/page.tsx` | Connections list UI |
| Create | `app/api/profile/check-slug/route.ts` | GET slug availability |
| Modify | `app/api/profile/update/route.ts` | Accept slug in PATCH body |
| Modify | `app/edit/page.tsx` | Slug field with live check |

---

## Task 1: Add i18n keys for wallet card and slug editing

**Files:**
- Modify: `lib/i18n/translations.ts`

- [ ] **Step 1: Add English keys to the `dashboard` block**

Find the `en` → `dashboard` block (around line 155). After `shadowWriterDesc`, add:

```ts
      walletCard: "Wallet Card",
      walletCardDesc: "Add your digital card to Google Wallet.",
```

- [ ] **Step 2: Add Chinese keys to the `dashboard` block**

Find the `zh` → `dashboard` block (around line 381). After `shadowWriterDesc` equivalent, add:

```ts
      walletCard: "Wallet 卡片",
      walletCardDesc: "将数字名片添加到 Google 钱包。",
```

- [ ] **Step 3: Add English slug keys to the `en` → `edit` block (or inline copy in edit page)**

The edit page uses its own `copy` constant (not `translations.ts`). We'll handle slug copy directly in the edit page in Task 10. Skip this step.

- [ ] **Step 4: Type-check**

```bash
cd /Users/midaijin/Desktop/chiefme && npx tsc --noEmit
```

Expected: exit 0, no errors.

- [ ] **Step 5: Commit**

```bash
git add lib/i18n/translations.ts
git commit -m "feat: add wallet card and i18n keys to dashboard translations"
```

---

## Task 2: PageLayout — add optional back link props + Members page

**Files:**
- Modify: `components/PageLayout.tsx`
- Modify: `app/members/page.tsx`

- [ ] **Step 1: Update PageLayout to accept optional `backHref` and `backLabel` props**

Replace the entire file content of `components/PageLayout.tsx`:

```tsx
"use client";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface PageLayoutProps {
  children: React.ReactNode;
  title: string;
  backHref?: string;
  backLabel?: string;
}

export function PageLayout({ children, title, backHref, backLabel }: PageLayoutProps) {
  const { lang, toggle } = useLanguage();
  const resolvedBackHref = backHref ?? "/";
  const resolvedBackLabel = backLabel ?? (lang === "zh" ? "返回首页" : "Home");
  return (
    <div className="min-h-screen bg-[#FEFCF7]">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 md:px-16 h-16"
        style={{ background: "rgba(254,252,247,0.9)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(184,148,79,0.12)" }}>
        <Link href="/">
          <Image src="/logo.png" alt="chief.me" height={358} width={623} style={{ height: "44px", width: "auto" }} />
        </Link>
        <div className="flex items-center gap-4">
          <button onClick={toggle} className="font-body text-xs text-[#555555] hover:text-[#0A0A0A] transition-colors">
            <span className={lang === "en" ? "text-[#B8944F] font-medium" : ""}>EN</span>
            <span className="opacity-30 mx-1">/</span>
            <span className={lang === "zh" ? "text-[#B8944F] font-medium" : ""}>中文</span>
          </button>
          <Link href={resolvedBackHref} className="flex items-center gap-1.5 font-body text-sm text-[#555555] hover:text-[#0A0A0A] transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> {resolvedBackLabel}
          </Link>
        </div>
      </nav>
      <main className="pt-32 pb-24 px-6 max-w-3xl mx-auto">
        <h1 className="font-display text-4xl md:text-5xl font-bold text-[#0A0A0A] mb-10 leading-tight">{title}</h1>
        <div className="font-body text-[#555555] leading-relaxed space-y-6 text-[15px]">{children}</div>
      </main>
      <footer className="border-t border-[#E8E2D8] py-8 text-center font-body text-xs text-[#555555]">
        © 2026 Chief.me · <Link href="/privacy" className="hover:text-[#B8944F]">Privacy</Link> · <Link href="/terms" className="hover:text-[#B8944F]">Terms</Link>
      </footer>
    </div>
  );
}
```

- [ ] **Step 2: Update members page to pass backHref and backLabel**

In `app/members/page.tsx`, update the `copy` object to add a `back` key, then pass it:

```tsx
const copy = {
  en: { title: "Members", sub: "10,000 founding seats. VP+ verified.", join: "Join now", back: "Back to Dashboard" },
  zh: { title: "成员目录", sub: "10,000 个创始席位，VP+ 认证。", join: "立即加入", back: "返回控制台" },
};
```

Update the `return` statement:

```tsx
return (
  <PageLayout title={t.title} backHref="/dashboard" backLabel={t.back}>
```

- [ ] **Step 3: Type-check**

```bash
cd /Users/midaijin/Desktop/chiefme && npx tsc --noEmit
```

Expected: exit 0.

- [ ] **Step 4: Commit**

```bash
git add components/PageLayout.tsx app/members/page.tsx
git commit -m "feat: add backHref/backLabel to PageLayout; members page back to dashboard"
```

---

## Task 3: Dashboard — Wallet Card quick action tile

**Files:**
- Modify: `app/dashboard/page.tsx`

- [ ] **Step 1: Add `Wallet` to the lucide-react import**

Find the existing import block at the top of `app/dashboard/page.tsx`:

```tsx
import {
  LogOut,
  ExternalLink,
  Settings,
  ArrowRight,
  Users,
  FileText,
  Briefcase,
  Sparkles,
} from "lucide-react";
```

Replace with:

```tsx
import {
  LogOut,
  ExternalLink,
  Settings,
  ArrowRight,
  Users,
  FileText,
  Briefcase,
  Sparkles,
  Wallet,
} from "lucide-react";
```

- [ ] **Step 2: Add walletLoading state**

After the existing `const [pendingCount, setPendingCount] = useState(0);` line, add:

```tsx
const [walletLoading, setWalletLoading] = useState(false);
```

- [ ] **Step 3: Add wallet handler function**

After the last `useEffect` block (the one that fetches pending count), add:

```tsx
async function handleAddToWallet() {
  if (!profile || walletLoading) return;
  setWalletLoading(true);
  try {
    const res = await fetch("/api/wallet/google", { method: "POST" });
    const data = await res.json();
    if (res.ok && data.saveUrl) {
      window.open(data.saveUrl, "_blank");
    }
  } catch {
    // silently fail
  }
  setWalletLoading(false);
}
```

- [ ] **Step 4: Update quickActions type and add wallet entry**

The `quickActions` array items currently have shape `{ href, icon, label, desc, showAlways }`. Add an optional `onClick` field to the item type by changing the array definition. Replace the entire `quickActions` array:

```tsx
const quickActions: Array<{
  href?: string;
  onClick?: () => void;
  icon: React.ReactNode;
  label: string;
  desc: string;
  showAlways: boolean;
}> = [
  {
    href: "/edit",
    icon: <Settings className="w-4 h-4 text-[#B8944F]" />,
    label: d.editProfile,
    desc: d.editProfileDesc,
    showAlways: !!profile,
  },
  {
    href: "/members",
    icon: <Users className="w-4 h-4 text-[#B8944F]" />,
    label: d.memberDirectory,
    desc: d.memberDirectoryDesc,
    showAlways: true,
  },
  {
    href: "/insights/new",
    icon: <FileText className="w-4 h-4 text-[#B8944F]" />,
    label: d.writeInsight,
    desc: d.writeInsightDesc,
    showAlways: true,
  },
  {
    href: "/cases/new",
    icon: <Briefcase className="w-4 h-4 text-[#B8944F]" />,
    label: d.createCase,
    desc: d.createCaseDesc,
    showAlways: true,
  },
  {
    href: "/insights/shadow-writer",
    icon: <Sparkles className="w-4 h-4 text-[#B8944F]" />,
    label: d.shadowWriter,
    desc: d.shadowWriterDesc,
    showAlways: true,
  },
  {
    href: "/cases/templates",
    icon: <FileText className="w-4 h-4 text-[#B8944F]" />,
    label: lang === "zh" ? "写作模板库" : "Template Library",
    desc: lang === "zh" ? "8 种决策场景，填空式引导写作。" : "8 decision templates with guided questions.",
    showAlways: true,
  },
  {
    onClick: handleAddToWallet,
    icon: <Wallet className="w-4 h-4 text-[#B8944F]" />,
    label: d.walletCard,
    desc: d.walletCardDesc,
    showAlways: !!profile,
  },
];
```

- [ ] **Step 5: Update quick actions render to handle button vs Link**

Find the quick actions render block:

```tsx
{quickActions.filter((a) => a.showAlways).map((action) => (
  <Link
    key={action.href}
    href={action.href}
    className="rounded-[14px] p-5 group"
    ...
  >
```

Replace with:

```tsx
{quickActions.filter((a) => a.showAlways).map((action) => {
  const tileClass = "rounded-[14px] p-5 group text-left w-full";
  const tileStyle = {
    background: "rgba(184,148,79,0.06)",
    border: "1px solid rgba(184,148,79,0.15)",
  };
  const tileInner = (
    <>
      <div
        className="w-8 h-8 rounded-[8px] flex items-center justify-center mb-3 transition-colors"
        style={{ background: "rgba(184,148,79,0.12)" }}
      >
        {action.icon}
      </div>
      <h3 className="font-body font-semibold text-sm mb-0.5" style={{ color: "#FEFCF7" }}>
        {action.label}
      </h3>
      <p className="font-body text-xs leading-relaxed" style={{ color: "#555555" }}>
        {action.desc}
      </p>
    </>
  );
  if (action.onClick) {
    return (
      <button
        key={action.label}
        onClick={action.onClick}
        className={tileClass}
        style={tileStyle}
      >
        {tileInner}
      </button>
    );
  }
  return (
    <Link
      key={action.href}
      href={action.href!}
      className={tileClass}
      style={tileStyle}
    >
      {tileInner}
    </Link>
  );
})}
```

- [ ] **Step 6: Type-check**

```bash
cd /Users/midaijin/Desktop/chiefme && npx tsc --noEmit
```

Expected: exit 0.

- [ ] **Step 7: Commit**

```bash
git add app/dashboard/page.tsx
git commit -m "feat: add Wallet Card quick action tile to dashboard"
```

---

## Task 4: Dashboard — make Pending Requests counter clickable

**Files:**
- Modify: `app/dashboard/page.tsx`

- [ ] **Step 1: Wrap the pendingCount stat div in a Link**

Find the middle stat block in the Visitor Stats section (the one with `pendingCount`):

```tsx
<div
  className="text-center"
  style={{
    borderLeft: "1px solid rgba(184,148,79,0.1)",
    borderRight: "1px solid rgba(184,148,79,0.1)",
  }}
>
  <p className="font-display text-2xl font-bold" style={{ color: "#FEFCF7" }}>
    {pendingCount}
  </p>
  <p className="font-body text-xs mt-1" style={{ color: "#555555" }}>
    {d.pendingRequests}
  </p>
</div>
```

Replace with:

```tsx
<Link
  href="/connections"
  className="text-center block group"
  style={{
    borderLeft: "1px solid rgba(184,148,79,0.1)",
    borderRight: "1px solid rgba(184,148,79,0.1)",
  }}
>
  <p className="font-display text-2xl font-bold group-hover:text-[#B8944F] transition-colors" style={{ color: "#FEFCF7" }}>
    {pendingCount}
  </p>
  <p className="font-body text-xs mt-1" style={{ color: "#555555" }}>
    {d.pendingRequests}
  </p>
</Link>
```

- [ ] **Step 2: Type-check**

```bash
cd /Users/midaijin/Desktop/chiefme && npx tsc --noEmit
```

Expected: exit 0.

- [ ] **Step 3: Commit**

```bash
git add app/dashboard/page.tsx
git commit -m "feat: make pending requests counter link to /connections"
```

---

## Task 5: API — GET /api/connections/list

**Files:**
- Create: `app/api/connections/list/route.ts`

- [ ] **Step 1: Create the route**

Create `app/api/connections/list/route.ts` with the following content:

```ts
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (!profile) {
    return Response.json({ requests: [] });
  }

  const requests = await prisma.connectionRequest.findMany({
    where: { receiverId: profile.id, status: "PENDING" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      message: true,
      createdAt: true,
      sender: {
        select: {
          displayName: true,
          title: true,
          company: true,
          slug: true,
        },
      },
    },
  });

  return Response.json({ requests });
}
```

- [ ] **Step 2: Type-check**

```bash
cd /Users/midaijin/Desktop/chiefme && npx tsc --noEmit
```

Expected: exit 0.

- [ ] **Step 3: Commit**

```bash
git add app/api/connections/list/route.ts
git commit -m "feat: add GET /api/connections/list route"
```

---

## Task 6: API — POST /api/connections/respond

**Files:**
- Create: `app/api/connections/respond/route.ts`

- [ ] **Step 1: Create the route**

Create `app/api/connections/respond/route.ts` with the following content:

```ts
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { requestId?: string; action?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { requestId, action } = body;

  if (!requestId || (action !== "ACCEPT" && action !== "DECLINE")) {
    return Response.json({ error: "requestId and action (ACCEPT|DECLINE) are required." }, { status: 400 });
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (!profile) {
    return Response.json({ error: "Profile not found." }, { status: 404 });
  }

  const request = await prisma.connectionRequest.findUnique({
    where: { id: requestId },
    select: { id: true, receiverId: true, status: true },
  });

  if (!request || request.receiverId !== profile.id) {
    return Response.json({ error: "Request not found." }, { status: 404 });
  }

  if (request.status !== "PENDING") {
    return Response.json({ error: "Request already responded to." }, { status: 409 });
  }

  await prisma.connectionRequest.update({
    where: { id: requestId },
    data: {
      status: action === "ACCEPT" ? "ACCEPTED" : "DECLINED",
      respondedAt: new Date(),
    },
  });

  return Response.json({ success: true });
}
```

- [ ] **Step 2: Type-check**

```bash
cd /Users/midaijin/Desktop/chiefme && npx tsc --noEmit
```

Expected: exit 0.

- [ ] **Step 3: Commit**

```bash
git add app/api/connections/respond/route.ts
git commit -m "feat: add POST /api/connections/respond route"
```

---

## Task 7: /connections page

**Files:**
- Create: `app/connections/page.tsx`

- [ ] **Step 1: Create the connections page**

Create `app/connections/page.tsx`:

```tsx
"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Check, X } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface ConnectionRequest {
  id: string;
  message: string | null;
  createdAt: string;
  sender: {
    displayName: string;
    title: string;
    company: string;
    slug: string;
  };
}

const copy = {
  en: {
    title: "Pending Requests",
    back: "Back to Dashboard",
    empty: "No pending requests",
    emptyDesc: "When someone requests to connect, it will appear here.",
    accept: "Accept",
    decline: "Decline",
    from: "from",
  },
  zh: {
    title: "待处理请求",
    back: "返回控制台",
    empty: "暂无待处理请求",
    emptyDesc: "当有人发起连接请求时，将会显示在这里。",
    accept: "通过",
    decline: "拒绝",
    from: "来自",
  },
};

export default function ConnectionsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { lang } = useLanguage();
  const t = copy[lang];

  const [requests, setRequests] = useState<ConnectionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/join");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/connections/list")
      .then((r) => r.json())
      .then((data) => setRequests(data.requests ?? []))
      .finally(() => setLoading(false));
  }, [status]);

  async function respond(requestId: string, action: "ACCEPT" | "DECLINE") {
    setResponding(requestId);
    // Optimistic removal
    setRequests((prev) => prev.filter((r) => r.id !== requestId));
    try {
      await fetch("/api/connections/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, action }),
      });
    } catch {
      // silently fail — item already removed optimistically
    }
    setResponding(null);
  }

  if (status === "loading" || loading) {
    return (
      <main className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#B8944F] border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0A0A0A] px-6 py-12">
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(184,148,79,0.05) 0%, transparent 70%)",
        }}
      />

      <div className="relative max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <Link href="/">
            <Image
              src="/logo.png"
              alt="chief.me"
              height={358}
              width={623}
              style={{ height: "44px", width: "auto", filter: "brightness(0) invert(1)" }}
            />
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 font-body text-xs text-[#555555] hover:text-[#E8E2D8] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            {t.back}
          </Link>
        </div>

        <h1 className="font-display text-3xl font-bold text-[#FEFCF7] mb-8">{t.title}</h1>

        {requests.length === 0 ? (
          <div
            className="rounded-[20px] p-10 text-center"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(184,148,79,0.12)",
            }}
          >
            <p className="font-display text-lg font-bold text-[#FEFCF7] mb-2">{t.empty}</p>
            <p className="font-body text-sm text-[#555555]">{t.emptyDesc}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => {
              const initials = req.sender.displayName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase();
              return (
                <div
                  key={req.id}
                  className="rounded-[20px] p-6"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(184,148,79,0.15)",
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#B8944F]/40 to-[#E8D5A0]/20 flex items-center justify-center font-display font-bold text-[#B8944F] text-sm flex-shrink-0">
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/chief/${req.sender.slug}`}
                        target="_blank"
                        className="font-body font-semibold text-sm text-[#FEFCF7] hover:text-[#B8944F] transition-colors"
                      >
                        {req.sender.displayName}
                      </Link>
                      <p className="font-body text-xs text-[#555555] mt-0.5">
                        {req.sender.title} · {req.sender.company}
                      </p>
                      {req.message && (
                        <p className="font-body text-sm text-[#E8E2D8]/60 mt-2 italic">
                          "{req.message}"
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3 mt-5">
                    <button
                      onClick={() => respond(req.id, "ACCEPT")}
                      disabled={responding === req.id}
                      className="flex items-center gap-1.5 bg-[#B8944F] hover:bg-[#9d7c3e] disabled:opacity-40 text-[#FEFCF7] font-body font-medium rounded-full px-5 py-2 text-sm transition-colors cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      {t.accept}
                    </button>
                    <button
                      onClick={() => respond(req.id, "DECLINE")}
                      disabled={responding === req.id}
                      className="flex items-center gap-1.5 font-body text-sm text-[#555555] hover:text-[#E8E2D8] transition-colors cursor-pointer disabled:opacity-40 rounded-full px-5 py-2"
                      style={{ border: "1px solid rgba(255,255,255,0.08)" }}
                    >
                      <X className="w-3.5 h-3.5" />
                      {t.decline}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
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
git add app/connections/page.tsx
git commit -m "feat: add /connections page with approve/decline flow"
```

---

## Task 8: API — GET /api/profile/check-slug

**Files:**
- Create: `app/api/profile/check-slug/route.ts`

- [ ] **Step 1: Create the route**

Create `app/api/profile/check-slug/route.ts`:

```ts
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const SLUG_REGEX = /^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$/;

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const slug = req.nextUrl.searchParams.get("slug") ?? "";

  if (!SLUG_REGEX.test(slug)) {
    return Response.json({ available: false, reason: "invalid" });
  }

  const existing = await prisma.profile.findUnique({
    where: { slug },
    select: { userId: true },
  });

  // Available if no record found, or the record belongs to the current user
  const available = !existing || existing.userId === session.user.id;
  return Response.json({ available });
}
```

- [ ] **Step 2: Type-check**

```bash
cd /Users/midaijin/Desktop/chiefme && npx tsc --noEmit
```

Expected: exit 0.

- [ ] **Step 3: Commit**

```bash
git add app/api/profile/check-slug/route.ts
git commit -m "feat: add GET /api/profile/check-slug availability endpoint"
```

---

## Task 9: Update /api/profile/update to accept slug changes

**Files:**
- Modify: `app/api/profile/update/route.ts`

- [ ] **Step 1: Replace the PATCH handler with slug support**

Replace the entire content of `app/api/profile/update/route.ts`:

```ts
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const SLUG_REGEX = /^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$/;

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const {
    displayName,
    title,
    company,
    headline,
    bio,
    industries,
    companySize,
    socialLinks,
    slug,
  } = body;

  if (!displayName?.trim() || !title?.trim() || !company?.trim()) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  const validSizes = ["UNKNOWN", "SEED", "SERIES_A_B", "SERIES_C_PLUS", "PUBLIC", "ENTERPRISE", "FORTUNE_500"];
  if (companySize && !validSizes.includes(companySize)) {
    return Response.json({ error: "Invalid company size" }, { status: 400 });
  }

  // Validate slug if provided
  if (slug !== undefined) {
    if (!SLUG_REGEX.test(slug)) {
      return Response.json({ error: "Invalid slug format" }, { status: 400 });
    }
    // Check availability (race-condition guard)
    const existing = await prisma.profile.findUnique({
      where: { slug },
      select: { userId: true },
    });
    if (existing && existing.userId !== session.user.id) {
      return Response.json({ error: "Slug already taken" }, { status: 409 });
    }
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (!profile) {
    return Response.json({ error: "Profile not found" }, { status: 404 });
  }

  const updateData: Record<string, unknown> = {
    displayName: displayName.trim(),
    title: title.trim(),
    company: company.trim(),
    headline: headline?.trim() || null,
    bio: bio?.trim() || null,
    industries: Array.isArray(industries) ? industries.slice(0, 5) : [],
    companySize: companySize || "UNKNOWN",
    socialLinks: socialLinks ?? {},
  };

  if (slug !== undefined) {
    updateData.slug = slug;
  }

  const updated = await prisma.profile.update({
    where: { userId: session.user.id },
    data: updateData,
    select: { slug: true },
  });

  return Response.json({ slug: updated.slug });
}
```

- [ ] **Step 2: Type-check**

```bash
cd /Users/midaijin/Desktop/chiefme && npx tsc --noEmit
```

Expected: exit 0.

- [ ] **Step 3: Commit**

```bash
git add app/api/profile/update/route.ts
git commit -m "feat: update PATCH /api/profile/update to accept slug changes"
```

---

## Task 10: Edit page — Exclusive Link (slug) field

**Files:**
- Modify: `app/edit/page.tsx`

- [ ] **Step 1: Add slug copy keys to the `copy` constant**

In `app/edit/page.tsx`, find the `copy` object. Add to `en`:

```ts
    exclusiveLink: "Exclusive Link",
    exclusiveLinkHint: "3–30 chars · letters, numbers, hyphens only",
    slugAvailable: "Available",
    slugTaken: "Already taken",
    slugInvalid: "Invalid format",
```

Add to `zh`:

```ts
    exclusiveLink: "专属链接",
    exclusiveLinkHint: "3–30 个字符 · 字母、数字、连字符",
    slugAvailable: "可使用",
    slugTaken: "已被占用",
    slugInvalid: "格式不正确",
```

- [ ] **Step 2: Update imports in edit page**

Find:
```tsx
import { useState, useEffect } from "react";
```
Replace with:
```tsx
import { useState, useEffect, useRef } from "react";
```

Find:
```tsx
import { ArrowLeft, Check } from "lucide-react";
```

Replace with:
```tsx
import { ArrowLeft, Check, X as XIcon, Loader2 } from "lucide-react";
```

- [ ] **Step 3: Add slug state to the component**

After `const [generatingBio, setGeneratingBio] = useState(false);`, add:

```tsx
const [originalSlug, setOriginalSlug] = useState("");
const [slugStatus, setSlugStatus] = useState<"idle" | "checking" | "available" | "taken" | "invalid">("idle");
const slugCheckTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
```

- [ ] **Step 4: Add `slug` field to the form state**

In the `useState` call for `form`, add `slug: ""` to the initial object:

```tsx
const [form, setForm] = useState({
  displayName: "",
  title: "",
  company: "",
  headline: "",
  bio: "",
  industries: [] as string[],
  companySize: "UNKNOWN",
  linkedin: "",
  twitter: "",
  website: "",
  calendly: "",
  slug: "",
});
```

- [ ] **Step 5: Load slug from profile in useEffect**

In the `useEffect` that calls `/api/profile/setup`, after setting form data, also set `originalSlug` and include `slug` in `setForm`. Find the `setForm({...})` call and add `slug: p.slug ?? "",`. Then after the `setForm(...)` call add:

```tsx
setOriginalSlug(p.slug ?? "");
```

So the setForm call becomes:
```tsx
setForm({
  displayName: p.displayName ?? "",
  title: p.title ?? "",
  company: p.company ?? "",
  headline: p.headline ?? "",
  bio: p.bio ?? "",
  industries: Array.isArray(p.industries) ? p.industries : [],
  companySize: p.companySize ?? "UNKNOWN",
  linkedin: links.linkedin ?? "",
  twitter: links.twitter ?? "",
  website: links.website ?? "",
  calendly: links.calendly ?? "",
  slug: p.slug ?? "",
});
setOriginalSlug(p.slug ?? "");
```

- [ ] **Step 6: Add slug change handler with debounced availability check**

Add the following function after the `toggleIndustry` function:

```tsx
const SLUG_REGEX = /^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$/;

function handleSlugChange(value: string) {
  const lower = value.toLowerCase().replace(/[^a-z0-9-]/g, "");
  set("slug", lower);

  if (slugCheckTimerRef.current) clearTimeout(slugCheckTimerRef.current);

  if (lower === originalSlug) {
    setSlugStatus("available");
    return;
  }

  if (!SLUG_REGEX.test(lower)) {
    setSlugStatus(lower.length === 0 ? "idle" : "invalid");
    return;
  }

  setSlugStatus("checking");
  slugCheckTimerRef.current = setTimeout(async () => {
    try {
      const res = await fetch(`/api/profile/check-slug?slug=${encodeURIComponent(lower)}`);
      const data = await res.json();
      setSlugStatus(data.available ? "available" : "taken");
    } catch {
      setSlugStatus("idle");
    }
  }, 500);
}
```

- [ ] **Step 7: Include slug in handleSave**

In the `handleSave` function, update the fetch body to include `slug`:

Find:
```tsx
body: JSON.stringify({
  displayName: form.displayName,
  title: form.title,
  company: form.company,
  headline: form.headline,
  bio: form.bio,
  industries: form.industries,
  companySize: form.companySize,
  socialLinks: {
    linkedin: form.linkedin || undefined,
    twitter: form.twitter || undefined,
    website: form.website || undefined,
    calendly: form.calendly || undefined,
  },
}),
```

Replace with:

```tsx
body: JSON.stringify({
  displayName: form.displayName,
  title: form.title,
  company: form.company,
  headline: form.headline,
  bio: form.bio,
  industries: form.industries,
  companySize: form.companySize,
  socialLinks: {
    linkedin: form.linkedin || undefined,
    twitter: form.twitter || undefined,
    website: form.website || undefined,
    calendly: form.calendly || undefined,
  },
  ...(form.slug !== originalSlug ? { slug: form.slug } : {}),
}),
```

- [ ] **Step 8: Disable save button when slug is taken or invalid**

Find the save button `disabled` prop:

```tsx
disabled={submitting || !form.displayName || !form.title || !form.company}
```

Replace with:

```tsx
disabled={submitting || !form.displayName || !form.title || !form.company || slugStatus === "taken" || slugStatus === "invalid"}
```

- [ ] **Step 9: Add the slug UI section above Social Links**

Find the Social Links section:

```tsx
{/* Social Links */}
<Section>
```

Insert the following **before** it:

```tsx
{/* Exclusive Link */}
<Section>
  <div>
    <div className="flex items-center justify-between mb-2">
      <label className="font-body text-xs text-[#E8E2D8]/60 tracking-widest uppercase">
        {t.exclusiveLink}
      </label>
      {slugStatus === "available" && (
        <span className="flex items-center gap-1 font-body text-[10px] text-green-400">
          <Check className="w-3 h-3" /> {t.slugAvailable}
        </span>
      )}
      {slugStatus === "taken" && (
        <span className="flex items-center gap-1 font-body text-[10px] text-red-400">
          <XIcon className="w-3 h-3" /> {t.slugTaken}
        </span>
      )}
      {slugStatus === "invalid" && (
        <span className="flex items-center gap-1 font-body text-[10px] text-red-400">
          <XIcon className="w-3 h-3" /> {t.slugInvalid}
        </span>
      )}
      {slugStatus === "checking" && (
        <span className="flex items-center gap-1 font-body text-[10px] text-[#555555]">
          <Loader2 className="w-3 h-3 animate-spin" /> checking...
        </span>
      )}
    </div>
    <div className="flex items-center rounded-[12px] overflow-hidden"
      style={{ border: "1px solid rgba(232,226,216,0.10)", background: "rgba(254,252,247,0.05)" }}>
      <span className="px-4 py-3 font-body text-sm text-[#555555] border-r"
        style={{ borderColor: "rgba(232,226,216,0.10)", whiteSpace: "nowrap" }}>
        chief.me/
      </span>
      <input
        value={form.slug}
        onChange={(e) => handleSlugChange(e.target.value)}
        placeholder="your-name"
        className="flex-1 bg-transparent px-4 py-3 font-body text-[#FEFCF7] text-sm placeholder:text-[#555555] focus:outline-none"
      />
    </div>
    <p className="font-body text-[10px] text-[#555555] mt-1.5">{t.exclusiveLinkHint}</p>
  </div>
</Section>
```

- [ ] **Step 10: Type-check**

```bash
cd /Users/midaijin/Desktop/chiefme && npx tsc --noEmit
```

Expected: exit 0.

- [ ] **Step 11: Commit**

```bash
git add app/edit/page.tsx
git commit -m "feat: add slug editing with live availability check to edit profile"
```

---

## Task 11: Final push to GitHub

- [ ] **Step 1: Push all commits**

```bash
cd /Users/midaijin/Desktop/chiefme && git push origin main
```

Expected: all commits pushed, no errors.
