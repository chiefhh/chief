# Brand Polish — Design Spec
**Date:** 2026-04-15

## Overview
Three targeted UI improvements to chief.me: a dashboard quick-access button in the authenticated navbar, unified footer across all sub-pages, and a sparkline chart for profile view trends in the dashboard stats area.

---

## Feature 1 — Navbar Dashboard Entry (Ghost Link)

### What
When a user is authenticated, the navbar shows a ghost-style "Dashboard" text link (gold color, no border) in the right section, positioned after the user's avatar/name, before "Sign out".

### Where
- `app/page.tsx` (homepage `Nav` function): add the link between the user name and sign-out button
- `components/PageLayout.tsx`: add `useSession` from next-auth/react and conditionally render the same link

### Style
- `font-body text-xs font-semibold text-[#B8944F] hover:text-[#D4AA6A]` with a small `LayoutDashboard` icon from lucide-react
- Ghost: no background, no border — matches Stripe/Linear's secondary nav link pattern
- i18n: `"Dashboard"` in EN, `"控制台"` in ZH (added to i18n strings)

### Behaviour
- Links to `/dashboard`
- Hidden when `status !== "authenticated"`

---

## Feature 2 — Footer Unification

### What
All sub-pages (currently using `PageLayout`) get the same full dark footer as the homepage instead of the minimal `© 2026 Chief.me · Privacy · Terms` footer.

### How
1. Extract the `Footer` function from `app/page.tsx` into `components/Footer.tsx` (standalone component)
2. Import and render it in `components/PageLayout.tsx`, replacing the existing `<footer>` tag
3. Update `app/page.tsx` to import from `components/Footer.tsx`

### Affected pages
features, faq, about, privacy, terms, members — all use `PageLayout`.

---

## Feature 3 — Sparkline Chart (Profile Views Trend)

### What
A 14-day profile view trend sparkline rendered as pure SVG, placed inline inside the existing "Visitor Stats" card in the dashboard, below the 3 numeric counters.

### Data
- New API route: `GET /api/stats/views` — requires auth, queries `ProfileView` table grouped by day for the last 14 days, returns `{ data: [{ date: string, count: number }] }`
- The dashboard fetches this on mount alongside existing profile data

### Chart Component
A small `<ViewsSparkline data={...} />` component (inline in dashboard page or `components/ViewsSparkline.tsx`):
- Pure SVG, `viewBox="0 0 300 52"`, `preserveAspectRatio="none"`, responsive via `width: 100%`
- Area fill with gold gradient (opacity 0 → 0.18 from bottom to line)
- Smooth polyline: `stroke="#B8944F"`, `strokeWidth="1.5"`, `strokeLinejoin="round"`, `strokeLinecap="round"`
- Subtle dot on the latest data point only
- If fewer than 2 days of data exist: render a flat line at baseline (graceful empty state)
- Labels below: "14d ago", "7d ago", "Today" in `text-[10px] text-[#333]`
- `+X%` delta (last 7d vs prior 7d) shown in chart header, green if positive, neutral grey if 0

### Integration
Placed as a new `<div className="chart-area">` block inside the existing `{profile && <div className="rounded-[16px]..."> }` stats card, below the 3-column counter grid.

---

## Non-goals
- No tooltip on sparkline (keep it premium/minimal, add later if needed)
- No mobile-specific breakpoints for chart (SVG is naturally responsive)
- No recharts or other chart library
