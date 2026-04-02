# CLAUDE.md — Wanderbase Platform

> A full nomad companion — plan your move AND use it on the ground.
> Visa requirements, cost of living in ₹, coworking spaces, SIM cards, neighborhoods, and remote jobs — all in one place.

---

## Project Structure

```
digital-nomad/
├── apps/
│   ├── web/          # Next.js 14 App Router (port 3000)
│   └── api/          # Hono + Node.js backend (port 3001)
├── packages/
│   └── types/        # Shared Zod schemas + TypeScript interfaces
├── pnpm-workspace.yaml
├── turbo.json
└── CLAUDE.md
```

## Quick Start

```bash
# Install dependencies
pnpm install

# Start both web + API in parallel
pnpm dev

# Typecheck all packages
pnpm typecheck
```

---

## Tech Stack

| Layer | Tech | Why |
|---|---|---|
| Frontend | Next.js 14 (App Router) + TypeScript | SSG for SEO city pages, CSR for tools, SSR for jobs |
| Styling | Tailwind CSS + custom design tokens | Fast, consistent, no CSS files |
| Components | Custom (shadcn-inspired, owned in codebase) | No version lock-in, full control |
| Backend | Hono + Node.js | TypeScript-first, fast, edge-ready |
| Shared types | `packages/types` with Zod | One source of truth, validated at runtime |
| Database | Supabase (PostgreSQL) ✅ LIVE | Free tier, built-in Auth, RLS |
| Auth | Supabase Auth + Google OAuth ✅ LIVE | Cookie-based sessions via @supabase/ssr |
| Monorepo | pnpm workspaces + Turborepo | Parallel builds, shared cache |
| Deploy | Vercel (web) + Railway (api) — pending | Zero-config, free tiers |

---

## Design System

### Color Tokens — Light Theme (tailwind.config.ts)

| Token | Hex | Usage |
|---|---|---|
| `background` | `#FAFAF8` | Page background (warm white) |
| `surface` | `#FFFFFF` | Card backgrounds |
| `surface-2` | `#F5F4F0` | Inputs, tag backgrounds |
| `primary` | `#4F46E5` | Buttons, links, active states |
| `success` | `#10B981` | Visa-free badge, positive |
| `warning` | `#F59E0B` | e-Visa, caution states |
| `danger` | `#EF4444` | Visa required, errors |
| `text-primary` | `#111827` | Main text |
| `text-secondary` | `#374151` | Secondary text |
| `text-muted` | `#6B7280` | Hint text |
| `border` | `#E5E7EB` | Card/input borders |

### Typography
- Font: Inter (Google Fonts)
- Headings: `font-black tracking-tight` (hero), `font-bold` (sections)
- Body: `font-normal leading-relaxed`

### Component Classes (globals.css)
- `.card` — white bg + rounded-xl + border + shadow-sm
- `.card-hover` — card + hover lifts with indigo border glow
- `.btn-primary` — indigo→violet gradient with glow shadow
- `.btn-secondary` — white with border, hover indigo tint
- `.input-base` — styled input/select
- `.badge-success/warning/danger/neutral` — status badges
- `.skeleton` — shimmer animation placeholder
- `.section-eyebrow` — small uppercase label above section titles
- `.section-title` — large bold section heading
- `.text-gradient` — indigo→violet gradient text

---

## Pages & Rendering Strategy

| Route | Strategy | File |
|---|---|---|
| `/` | SSG (revalidate 1h) | `app/(marketing)/page.tsx` |
| `/visa-checker` | CSR | `app/(tools)/visa-checker/page.tsx` |
| `/cost-calculator` | CSR | `app/(tools)/cost-calculator/page.tsx` |
| `/jobs` | CSR | `app/jobs/page.tsx` |
| `/cities` | CSR | `app/cities/page.tsx` |
| `/cities/[city]` | ISR (revalidate 24h) | `app/cities/[city]/page.tsx` |
| `/dashboard` | SSR (auth required) | `app/dashboard/page.tsx` |
| `/login` | CSR | `app/login/page.tsx` |
| `/blog` | SSG | `app/blog/page.tsx` |
| `/blog/[slug]` | SSG | `app/blog/[slug]/page.tsx` |

---

## API Routes (apps/api)

All responses follow `ApiResponse<T>` from `packages/types/src/api.ts`:
```ts
{ success: boolean, data: T | null, error: string | null, meta?: { page, total, cached_at } }
```

| Method | Route | Description |
|---|---|---|
| GET | `/health` | Uptime check |
| GET | `/visa/check?from=IN&to=:code` | Visa requirement check |
| GET | `/visa/countries` | All supported destination countries |
| GET | `/cities` | Paginated cities (`?continent=Asia&sort=cost`) |
| GET | `/cities/:slug` | Full city detail with visa + jobs count |
| GET | `/jobs` | Paginated jobs (`?stack=react&min_salary=5000`) |
| GET | `/jobs/:id` | Single job detail |

---

## Shared Types (packages/types)

Import from `@nomadly/types` in both apps (package name stays `@nomadly/types`):

```ts
import type { City, CityDetail, Job, VisaRequirement, ApiResponse } from "@nomadly/types"
import { ok, err } from "@nomadly/types"  // API response helpers
```

Key types:
- `City` / `CityDetail` — city data with costs, visa, jobs count
- `VisaRequirement` / `VisaCheckResponse` — visa data + staleness flag
- `Job` / `JobFilter` — job listings
- `ApiResponse<T>` — standard response wrapper
- `VisaType` — `"visa_free" | "visa_on_arrival" | "evisa" | "visa_required"`

---

## Seed Data (current — Mock + Supabase hybrid)

Hardcoded in `apps/api/src/data/`:
- **20 cities**: Bali, Lisbon, Tbilisi, Chiang Mai, Medellín, Budapest, Prague, Tallinn, Mexico City, Bangkok, Barcelona, Porto, Taipei, Seoul, Cape Town, Dubai, Kuala Lumpur, Ho Chi Minh City, Berlin, Playa del Carmen
- **17 visa entries**: Passport requirements for all 20 destinations (verified 2025)
- **25 jobs**: Mix of React, Python, Go, Data Engineering, Design roles

Supabase DB live with: cities table (20 rows + image_url), visa_requirements, jobs, users, saved_cities.

---

## Key Components

### CitySnapshotWidget (`components/tools/CitySnapshotWidget.tsx`)
Search box → city autocomplete → parallel fetch of visa + cost + jobs → 3 result cards. Never blank — skeletons always shown while loading.

### CityCard (`components/cities/CityCard.tsx`)
City grid card: city photo (h-44), flag emoji, city name, monthly cost in ₹, internet/safety/english stats.

### SaveCityButton (`components/cities/SaveCityButton.tsx`)
Auth-aware save/unsave toggle. Stores in Supabase `saved_cities` table.

### AuthProvider (`components/auth/AuthProvider.tsx`)
Global auth context. Exposes `user`, `session`, `loading`, `signOut` via `useAuth()` hook.

### JobCard (`components/jobs/JobCard.tsx`)
Job listing card: company, title, tech stack tags, salary in USD + ₹, apply button.

---

## Lib Files (apps/web/src/lib)

| File | Purpose |
|---|---|
| `api.ts` | Typed fetch client for Hono API |
| `utils.ts` | `formatInr()`, `usdToInr()` (₹83.5/USD), `getAffordability()`, `timeAgo()` |
| `affiliate.ts` | Affiliate link generators + PostHog stub for SafetyWing, Airalo, Wise, NordVPN |
| `supabase/client.ts` | Browser-side Supabase client (`createBrowserClient`) |
| `supabase/server.ts` | Server-side Supabase client with cookie handling |

---

## Auth Setup (Supabase)

- Google OAuth enabled in Supabase dashboard
- Callback route: `apps/web/src/app/auth/callback/route.ts`
- Middleware: `apps/web/src/middleware.ts` — protects `/dashboard/*`, redirects logged-in users from `/login`
- `handle_new_user()` PostgreSQL trigger auto-creates user profile on signup
- Dashboard shows saved cities with photos

---

## Affiliate Integration

| Placement | Partner | Commission |
|---|---|---|
| Visa result page | SafetyWing (travel insurance) | 10% |
| SIM tab on city pages | Airalo (eSIM) | 10-15% |
| Cost calculator + city pages | Wise (money transfer) | $15-30/signup |
| Jobs sidebar | NordVPN | $40-100/signup |

Rules:
- Never more than 2 affiliate CTAs per page
- Always labeled "sponsored" or "We may earn a commission"
- All links: `target="_blank" rel="noopener noreferrer"`
- Track with PostHog `affiliate_click` event (stub in `affiliate.ts`)

---

## City Photos

- City images stored in `image_url` column in Supabase `cities` table
- API tries Teleport API first → falls back to curated Unsplash URLs (`apps/api/src/lib/city-images.ts`)
- Teleport API works in production (blocked on localhost)
- `next.config.mjs` has `images.unsplash.com` and `*.teleport.org` in remote patterns

---

## Environment Variables

```bash
# apps/web/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SUPABASE_URL=https://txpwsomujczeoujdnizb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>

# apps/api/.env
PORT=3001
SUPABASE_URL=https://txpwsomujczeoujdnizb.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service role key>

# Phase 4 — Payments
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=

# Phase 4 — Email
RESEND_API_KEY=

# Analytics
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

---

## Build Phases

### Phase 1 — Foundation ✅ COMPLETE
- [x] pnpm monorepo + Turborepo scaffold
- [x] `packages/types` — shared Zod schemas
- [x] Hono API with mock seed data (20 cities, 17 visas, 25 jobs)
- [x] Next.js 14 with Tailwind light design system
- [x] Homepage with City Snapshot Widget
- [x] Visa Checker tool
- [x] Cost Calculator tool (monthly budget, not salary)
- [x] Job Board with filters
- [x] Cities Explorer (continent + sort filters)
- [x] City Detail pages (ISR)
- [x] Affiliate integrations (SafetyWing, Airalo, Wise, NordVPN)

### Phase 2 — Content + SEO ✅ COMPLETE
- [x] Blog with 5 SEO articles
- [x] `sitemap.xml` + `robots.txt`
- [x] OpenGraph images for city and blog pages
- [x] City photos via Teleport API + Unsplash fallbacks

### Phase 3 — Auth + Database ✅ COMPLETE
- [x] Supabase Auth with Google OAuth + magic link (passwordless)
- [x] Supabase DB seeded (cities, visas, jobs, users, saved_cities)
- [x] Saved cities feature (auth required)
- [x] User dashboard with saved cities + quick links
- [x] `handle_new_user()` trigger for auto profile creation
- [x] Middleware for route protection

### Phase 3.5 — Rebrand ✅ COMPLETE
- [x] Renamed from Nomadly → Wanderbase across entire codebase
- [x] Logo updated: "W" with indigo→violet gradient in Navbar, Footer, Login, Signup
- [x] Removed all "India-first", "Built for Indians", "Free tool" copy
- [x] Removed hardcoded numbers ("20 cities", "3 steps")
- [x] Light theme design system (white cards, indigo primary, warm white background)
- [x] GitHub repo: github.com/mokshith-vr/wanderbase

### Phase 4 — Full Nomad Companion (NEXT)
**Goal:** Make the app useful WHILE living in a city, not just for planning.

#### 4A — Enhanced City Pages (tabbed layout)
- [ ] Redesign city detail page as tabbed interface
  - Tabs: Overview | Visa | Costs | Neighborhoods | Coworking | SIM & Internet | Transport
  - Tab state in URL params (`?tab=coworking`) for shareability
- [ ] Add `Neighborhood` data type — name, vibe, avg rent, pros/cons
- [ ] Add `CoworkingSpace` data type — name, price/day, WiFi, address, booking URL
- [ ] Add `SimOption` data type — carrier, plan, cost, where to buy, affiliate flag
- [ ] Add `CityTransport` data type — apps, monthly pass, scooter rental, notes
- [ ] Seed new data for top 5 cities: Chiang Mai, Bali, Tbilisi, Lisbon, Kuala Lumpur
- [ ] Add Coworker.com affiliate to coworking tab
- [ ] Airalo affiliate card in SIM tab

#### 4B — Monetization
- [ ] Coworking space partnerships (featured listings)
- [ ] Premium subscription ₹299/mo via Razorpay
  - Premium unlocks: neighborhood deep-dives, coworking deals, SIM guides, job alerts
  - Free users see teaser cards with lock icon

#### 4C — Deploy
- [ ] Deploy API to Railway
- [ ] Deploy Web to Vercel
- [ ] Set production env variables
- [ ] Update Supabase auth redirect URLs to production domain

### Phase 5 — Growth (Month 4+)
- [ ] RemoteOK API + WeWorkRemotely RSS for real job data
- [ ] Teleport/Numbeo integration for live city cost data
- [ ] City comparison tool (side by side)
- [ ] Email alerts (Resend) for job matches
- [ ] Upstash Redis caching layer
- [ ] Community forum (after 500 users)
- [ ] Mobile PWA
- [ ] Refer-a-friend program

---

## Development Conventions

### Git
- Repo: github.com/mokshith-vr/wanderbase
- Branch: `main` → production

### Commit Format
```
feat: add coworking tab to city detail page
fix: cost calculator showing salary instead of budget
chore: seed neighborhood data for Chiang Mai
docs: update CLAUDE.md with Phase 4 plan
```

### Code Rules
- TypeScript strict mode: always on
- No `any` types — use proper interfaces in `packages/types`
- All API responses validated against Zod schemas
- All affiliate links: `target="_blank" rel="noopener noreferrer"`
- Mobile-first: test at 375px before 1280px
- Internal package imports use `@nomadly/types` (do not rename this)

### Definition of Done
1. Works on mobile (375px) and desktop (1280px)
2. Has loading state (skeleton — never blank)
3. Has error state (message + retry button)
4. Has empty state (helpful message + action)
5. Affiliate links tracked with PostHog event stub
6. No TypeScript errors (`pnpm typecheck`)

---

## Known Risks

| Risk | Severity | Mitigation |
|---|---|---|
| Wrong visa data → user denied at airport | **Critical** | Always show "Last verified" date, embassy link, disclaimer, "Report error" button |
| Teleport API blocked locally | Low | Falls back to Unsplash URLs. Works in production. |
| Empty job board | High | Always seed from mock data; RSS in Phase 5 |
| User acquisition | High | SEO city pages + ProductHunt launch |
| Coworking data going stale | Medium | Show "last updated" date, allow user reports |
