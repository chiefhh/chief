# Design: Dashboard Wallet Entry, Connections Page, Slug Edit, Members Back Button

Date: 2026-04-14

## Overview

Four independent UI/feature additions to the chief.me dashboard and profile system.

---

## 1. Dashboard — Wallet Card Quick Action (7th entry)

### What

Add a 7th tile to the Quick Actions grid on `/dashboard` that lets the profile owner add their digital business card to Google Wallet directly from the dashboard.

### Architecture

- `quickActions` array in `app/dashboard/page.tsx` currently holds 6 `{ href, icon, label, desc, showAlways }` items rendered as `<Link>` tiles.
- The wallet action is async (calls API, redirects to external URL), so it cannot be a plain `<Link>`.
- Extend the item shape with an optional `onClick` handler and `type: "button"`. Rendering logic: if item has `onClick`, render a `<button>` tile instead of `<Link>`.
- Handler: calls `POST /api/wallet/google` (existing), on success opens `saveUrl` in new tab (same as ShareToolbar behavior).
- Wallet action is **owner-only**: `showAlways: !!profile`.

### i18n

Add keys to `lib/i18n/translations.ts`:
- `dashboard.walletCard`: `"Wallet Card"` / `"Wallet 卡片"`
- `dashboard.walletCardDesc`: `"Add your digital card to Google Wallet."` / `"将数字名片添加到 Google 钱包。"`

### Icon

`Wallet` from lucide-react (add to existing import).

---

## 2. /connections Page + Clickable Pending Count

### What

- New page `/connections` listing all pending connection requests received by the logged-in user.
- Each card shows sender name / title / company / optional message, with Accept and Decline buttons.
- Dashboard "Pending Requests" number becomes a `<Link href="/connections">`.

### New APIs

**`GET /api/connections/list`**

Returns pending requests where `receiverId` = current user's profile.

Response:
```json
{
  "requests": [
    {
      "id": "cuid",
      "message": "...",
      "createdAt": "ISO string",
      "sender": {
        "displayName": "Sarah Chen",
        "title": "CTO",
        "company": "Luminex AI",
        "slug": "sarah-chen"
      }
    }
  ]
}
```

**`POST /api/connections/respond`**

Body: `{ requestId: string, action: "ACCEPT" | "DECLINE" }`

- Validates the request belongs to the current user's profile (receiverId check).
- Updates `status` to `ACCEPTED` or `DECLINED`, sets `respondedAt = now()`.
- Returns `{ success: true }`.

### Page `/connections/page.tsx`

- `"use client"` — dark theme matching dashboard (`bg-[#0A0A0A]`).
- Header: logo + "Back to Dashboard" link (ArrowLeft).
- Title: "Pending Requests" / "待处理请求".
- Fetches `/api/connections/list` on mount.
- Each request card: initials avatar, name/title/company, optional message in italic, Accept (gold) + Decline (outline) buttons.
- Optimistic removal: on action, filter item out of local state immediately, then call API.
- Empty state: "No pending requests" / "暂无待处理请求".

### Dashboard Change

Wrap the `pendingCount` stat block (`<div className="text-center">`) in a `<Link href="/connections">` with hover gold color on the count.

---

## 3. Edit Profile — Exclusive Link (Slug)

### What

Add a "专属链接 / Exclusive Link" field to `/edit` allowing users to change their `chief.me/slug`. Real-time availability check with debounce.

### New API

**`GET /api/profile/check-slug?slug=xxx`**

- Returns `{ available: boolean }`.
- Slug must match `/^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$/` (3–30 chars, lowercase alphanumeric + hyphens, no leading/trailing hyphens).
- Checks `prisma.profile.findUnique({ where: { slug } })` — available if no record found or the found record belongs to current user.
- Auth required.

**Update `/api/profile/update` (PATCH)**

- Accept optional `slug` field in body.
- Validate format (same regex).
- Re-check availability (race-condition guard) — return 409 if taken.
- Include `slug` in `prisma.profile.update` data only when provided.

### Edit Page Changes

- Add `slug: ""` to form state; load current slug from profile data in `useEffect`.
- Add `slugStatus: "idle" | "checking" | "available" | "taken" | "invalid"` state.
- New section above Social Links: **"专属链接 / Exclusive Link"**.
- Input: left prefix `chief.me/` (styled inline), right: status icon.
  - Green checkmark (Check icon) = available
  - Red X (X icon) = taken
  - Spinning = checking
  - If unchanged from original slug: show checkmark without API call.
- Debounce: 500ms after last keystroke.
- Validation rules shown as hint text: 3–30 chars, letters/numbers/hyphens only.
- Save button disabled if `slugStatus === "taken" || slugStatus === "invalid"`.

### i18n Additions

```
en:
  exclusiveLink: "Exclusive Link"
  exclusiveLinkHint: "3–30 chars · letters, numbers, hyphens only"
  slugAvailable: "Available"
  slugTaken: "Already taken"
  slugInvalid: "Invalid format"
zh:
  exclusiveLink: "专属链接"
  exclusiveLinkHint: "3–30 个字符 · 字母、数字、连字符"
  slugAvailable: "可使用"
  slugTaken: "已被占用"
  slugInvalid: "格式不正确"
```

---

## 4. Members Directory — Back Button

### What

`PageLayout` already renders `ArrowLeft → Home (/)` in the nav. Change it so the Members page shows "Back to Dashboard" instead of "Home".

### Approach

Add optional `backHref` and `backLabel` props to `PageLayout`. Default: `href="/"`, `label=lang==="zh"?"返回首页":"Home"`. Members page passes `backHref="/dashboard"` and `backLabel` derived from lang.

This keeps PageLayout flexible without hardcoding dashboard references inside it.

---

## Affected Files

| File | Change |
|------|--------|
| `app/dashboard/page.tsx` | Add wallet quick action tile, make pendingCount clickable |
| `app/connections/page.tsx` | **NEW** connections list page |
| `app/api/connections/list/route.ts` | **NEW** GET pending requests |
| `app/api/connections/respond/route.ts` | **NEW** POST accept/decline |
| `app/edit/page.tsx` | Add slug field with live availability check |
| `app/api/profile/check-slug/route.ts` | **NEW** GET slug availability |
| `app/api/profile/update/route.ts` | Accept slug in PATCH body |
| `components/PageLayout.tsx` | Add optional `backHref`/`backLabel` props |
| `app/members/page.tsx` | Pass `backHref="/dashboard"` to PageLayout |
| `lib/i18n/translations.ts` | Add wallet card + slug i18n keys |
