# UX Improvements: Onboarding Tour, Insights Editor, Score Checklist, Members Directory

Date: 2026-04-14

## Feature 1 — New User Onboarding Tour Modal

### Trigger
- Shown on `/dashboard` when: `profile` exists AND `localStorage.getItem("chief_tour_seen")` is falsy.
- Dismissed by ✕ button or completing Step 3. On dismiss/complete: `localStorage.setItem("chief_tour_seen", "1")`.

### Component: `OnboardingTour`
New file: `components/OnboardingTour.tsx`. Mounted in `app/dashboard/page.tsx` after profile loads.

### UI
- Full-screen dark overlay (`bg-black/60 fixed inset-0 z-50`)
- Centered card `max-w-sm` with 3-step progress bar (3 gold dots, active = filled)
- Step content:
  - **Step 1 「完善资料 / Complete Profile」**: Settings icon + "完善你的职业信息" → button "去完善" links `/edit`
  - **Step 2 「发布内容 / Publish Content」**: FileText icon + "发布第一篇洞察" → button "去发布" links `/insights/new`
  - **Step 3 「分享主页 / Share Profile」**: Share icon + shows `chief.me/{slug}` → button "复制链接" copies URL
- Navigation: "下一步 / Next" advances step. Step 3 shows "完成 / Done" which closes modal.
- Steps 1 & 2 action buttons navigate AND advance to next step (don't close modal).

### Props
```tsx
interface OnboardingTourProps {
  slug: string;
  onClose: () => void;
}
```

---

## Feature 2 — Insights Editor Enhancements

### Schema Change
Add to `model Insight` in `prisma/schema.prisma`:
```prisma
tags String[]
```
Run `npx prisma migrate dev --name add_insight_tags`.

### API Change (`app/api/insights/route.ts`)
Accept `tags` in POST body. Store in `prisma.insight.create({ data: { ...existing, tags: tags ?? [] } })`.

### Edit Page Changes (`app/insights/new/page.tsx`)

**State additions:**
```tsx
const [tags, setTags] = useState<string[]>([])
const [visibility, setVisibility] = useState<"public" | "connections">("public")
const [draftRestored, setDraftRestored] = useState(false)
```

**Draft auto-save:** `useEffect` watching title/content/summary/tags/visibility — debounced 2s — writes to `localStorage("insight_draft")` as JSON. On mount: if draft exists, show restore banner. On publish success: clear draft.

**Word count:** Below content textarea, right-aligned: Chinese = `content.length + " 字"`, English = `content.trim().split(/\s+/).filter(Boolean).length + " words"`.

**Industry tags section:** Multi-select chips from `INDUSTRIES` constant (max 3), styled like edit page industry pills.

**Visibility toggle:** Two pill buttons: 「公开 / Public」 / 「仅连接可见 / Connections Only」. Sets `isPublic` in POST body.

**POST body:** Add `tags`, set `isPublic: visibility === "public"`, keep `isDraft: false`.

**i18n additions** to `copy` constant in insights/new page:
```
en: { tags: "Industry Tags", tagsHint: "Up to 3", visibility: "Visibility", public: "Public", connectionsOnly: "Connections Only", wordCount: (n) => `${n} words`, draftBanner: "Draft restored", draftDiscard: "Discard" }
zh: { tags: "行业标签", tagsHint: "最多 3 个", visibility: "可见性", public: "公开", connectionsOnly: "仅连接可见", wordCount: (n) => `${n} 字`, draftBanner: "已恢复草稿", draftDiscard: "丢弃" }
```

---

## Feature 3 — Connection Quality Score: Improvement Checklist

### Dashboard API Change
`app/api/profile/setup` GET: add `insightCount` and `bio` to the returned profile data.

In `app/api/profile/setup/route.ts` GET handler, add to Prisma select:
```ts
bio: true,
_count: { select: { insights: { where: { isDraft: false } } } }
```
Return `insightCount: profile._count.insights` in the response.

### ProfileData interface (dashboard page)
Add:
```tsx
bio: string | null;
insightCount: number;
```

### New UI block in dashboard
Below the Connection Quality Score card, add a new card: **「提升评分 / Improve Your Score」**.

4 checklist items (computed from profile + session):

| Key | Condition met | Label EN | Label ZH | Points |
|-----|--------------|----------|----------|--------|
| bio | `!!profile.bio` | Add a bio | 添加简介 | +10 |
| insight | `profile.insightCount > 0` | Publish an insight | 发布洞察 | +15 |
| connections | `profile.connectionCount >= 3` | Connect with 3 peers | 建立 3 个连接 | +20 |
| avatar | `!!session.user?.image` | Add a profile photo | 完善头像 | +5 |

Each row: left = circle icon (gold check if done, empty if not) + label; right = gold "+Npts" badge (gray if done).

Only show the card if at least one item is incomplete.

---

## Feature 4 — Members Directory: Real Data + Filters

### New API `GET /api/members`
File: `app/api/members/route.ts`

Query params: `industry` (exact match against profile.industries array), `q` (case-insensitive match on title).

```ts
const profiles = await prisma.profile.findMany({
  where: {
    ...(industry ? { industries: { has: industry } } : {}),
    ...(q ? { title: { contains: q, mode: "insensitive" } } : {}),
  },
  select: { displayName: true, title: true, company: true, slug: true, industries: true, globalNumber: true },
  orderBy: { globalNumber: "asc" },
  take: 50,
})
```

No auth required (public directory).

### Members Page (`app/members/page.tsx`)
Convert to proper client component with data fetching.

**State:**
```tsx
const [members, setMembers] = useState<Member[]>([])
const [loading, setLoading] = useState(true)
const [industry, setIndustry] = useState("")
const [q, setQ] = useState("")
```

**Fetch:** `useEffect` on `industry` change calls `/api/members?industry=...`. `q` filters client-side (debounced 300ms) on title field — avoids extra API calls.

**Filter UI** (above member grid):
- Industry `<select>`: "All Industries" + INDUSTRIES list. Calls API on change.
- Title search `<input>`: placeholder "Search by title…" / "搜索职位…". Client-side filter.

**Cards:** Wrap each card in `<Link href={"/chief/" + member.slug}>` with `hover:shadow` effect. Show first industry tag as badge. globalNumber as "No. 001".

**Loading state:** Spinner while fetching. Empty state: "No members found" / "暂无成员".

**INDUSTRIES constant**: Import or inline in members page (same 15 values as edit page).

---

## Affected Files

| File | Change |
|------|--------|
| `prisma/schema.prisma` | Add `tags String[]` to Insight model |
| `components/OnboardingTour.tsx` | **NEW** |
| `app/dashboard/page.tsx` | Mount OnboardingTour, add insightCount/bio to ProfileData, add score checklist card |
| `app/api/profile/setup/route.ts` | Return `insightCount` and `bio` from GET |
| `app/insights/new/page.tsx` | Tags, visibility, word count, draft auto-save |
| `app/api/insights/route.ts` | Accept `tags` in POST |
| `app/api/members/route.ts` | **NEW** public members endpoint |
| `app/members/page.tsx` | Real data fetch, filters, clickable cards |
