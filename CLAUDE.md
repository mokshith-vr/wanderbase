# CLAUDE.md — Nomadly Platform

> Built for Indian tech workers who want to work remotely from anywhere in the world.
> Think: Groww for digital nomads. Clean. Fast. Trustworthy. India-first.

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
| Database | Supabase (PostgreSQL) — Phase 3 | Free tier, built-in Auth, RLS |
| Cache | Upstash Redis — Phase 3 | Serverless, pay-per-request |
| ORM | Prisma — Phase 3 | TypeScript-native, auto-typed client |
| Monorepo | pnpm workspaces + Turborepo | Parallel builds, shared cache |
| Deploy | Vercel (web) + Railway (api) | Zero-config, free tiers |

---

## Design System

### Color Tokens (tailwind.config.ts)

| Token | Hex | Usage |
|---|---|---|
| `background` | `#0F172A` | Page background (navy) |
| `surface` | `#1E293B` | Card backgrounds |
| `surface-2` | `#334155` | Inputs, tag backgrounds |
| `primary` | `#6366F1` | Buttons, links, active states |
| `success` | `#10B981` | Visa-free badge, positive |
| `warning` | `#F59E0B` | e-Visa, caution states |
| `danger` | `#EF4444` | Visa required, errors |
| `text-primary` | `#F8FAFC` | Main text |
| `text-muted` | `#94A3B8` | Secondary/hint text |
| `border` | `#334155` | Card/input borders |

### Typography
- Font: Inter (Google Fonts)
- Headings: `font-bold tracking-tight`
- Body: `font-normal leading-relaxed`

### Component Classes (globals.css)
- `.card` — surface bg + rounded-xl + border
- `.card-hover` — card + hover:border-primary/50 transition
- `.btn-primary` — indigo button
- `.btn-secondary` — surface-2 button
- `.input-base` — styled input/select
- `.badge-success/warning/danger/neutral` — status badges
- `.skeleton` — animate-pulse placeholder

---

## Pages & Rendering Strategy

| Route | Strategy | File |
|---|---|---|
| `/` | SSG (revalidate 1h) | `app/(marketing)/page.tsx` |
| `/visa-checker` | CSR | `app/(tools)/visa-checker/page.tsx` |
| `/cost-calculator` | CSR | `app/(tools)/cost-calculator/page.tsx` |
| `/jobs` | CSR (SSR in prod) | `app/jobs/page.tsx` |
| `/cities` | CSR | `app/cities/page.tsx` |
| `/cities/[city]` | ISR (revalidate 24h) | `app/cities/[city]/page.tsx` |

---

## API Routes (apps/api)

All responses follow `ApiResponse<T>` from `packages/types/src/api.ts`:
```ts
{ success: boolean, data: T | null, error: string | null, meta?: { page, total, cached_at } }
```

| Method | Route | Description |
|---|---|---|
| GET | `/health` | Uptime check |
| GET | `/visa/check?from=IN&to=:code` | Visa requirement for Indian passport |
| GET | `/visa/countries` | All supported destination countries |
| GET | `/cities` | Paginated cities (`?continent=Asia&sort=cost`) |
| GET | `/cities/:slug` | Full city detail with visa + jobs count |
| GET | `/jobs` | Paginated jobs (`?stack=react&min_salary=5000&india_friendly=true`) |
| GET | `/jobs/:id` | Single job detail |

---

## Shared Types (packages/types)

Import from `@nomadly/types` in both apps:

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

## Seed Data (Phase 1 — Mock)

All data is hardcoded in `apps/api/src/data/`:

- **20 cities**: Bali, Lisbon, Tbilisi, Chiang Mai, Medellín, Budapest, Prague, Tallinn, Mexico City, Bangkok, Barcelona, Porto, Taipei, Seoul, Cape Town, Dubai, Kuala Lumpur, Ho Chi Minh City, Berlin, Playa del Carmen
- **17 visa entries**: Indian passport requirements for all 20 destinations (verified 2025)
- **25 jobs**: Mix of React, Python, Go, Data Engineering, Design roles — all india_friendly: true

---

## Key Components

### CitySnapshotWidget (`components/tools/CitySnapshotWidget.tsx`)
The primary product hook. Search box → city autocomplete → parallel fetch of visa + cost + jobs → 3 result cards. Never shows blank state — skeleton loaders always shown while loading.

### CityCard (`components/cities/CityCard.tsx`)
City grid card: flag, name, visa badge, monthly cost in ₹, internet/safety/english stats.

### JobCard (`components/jobs/JobCard.tsx`)
Job listing card: company, title, tech stack tags, salary in USD + ₹, India-friendly badge, apply button.

---

## Lib Files (apps/web/src/lib)

| File | Purpose |
|---|---|
| `api.ts` | Typed fetch client for Hono API |
| `utils.ts` | `formatInr()`, `usdToInr()` (₹83.5/USD), `getAffordability()`, `timeAgo()` |
| `affiliate.ts` | Affiliate link generators + PostHog stub for SafetyWing, Airalo, Wise, NordVPN |

---

## Affiliate Integration

| Placement | Partner | Context |
|---|---|---|
| Visa result pages | SafetyWing | Travel insurance |
| Cost calculator result | Airalo | Local eSIM |
| Any city page | Wise | Money transfer |
| Job board sidebar | NordVPN | Access Indian services abroad |

Rules:
- Never more than 2 affiliate CTAs per page
- Always labeled "We may earn a commission"
- All links: `target="_blank" rel="noopener noreferrer"`
- Track with PostHog `affiliate_click` event (stub ready in `affiliate.ts`)

---

## Environment Variables

```bash
# apps/web/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3001

# Phase 3 — Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Phase 3 — External APIs
TRAVEL_BUDDY_API_KEY=
NUMBEO_API_KEY=

# Phase 4 — Payments
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=

# Phase 3 — Cache
UPSTASH_REDIS_URL=
UPSTASH_REDIS_TOKEN=

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
- [x] Next.js 14 with Tailwind design system
- [x] Homepage with City Snapshot Widget
- [x] Visa Checker tool
- [x] Cost Calculator tool
- [x] Job Board with filters
- [x] Cities Explorer
- [x] City Detail pages (ISR)
- [x] Affiliate integrations (SafetyWing, Airalo, Wise, NordVPN)

### Phase 2 — Content + SEO (Weeks 4–6)
- [ ] City guide pages for top 20 destinations (SSG with real content)
- [ ] Blog: 5 SEO articles (visa-free countries, cost in Bali, etc.)
- [ ] `sitemap.xml` + `robots.txt`
- [ ] OpenGraph images for all pages
- [ ] Google Search Console setup

**Goal:** 100 organic visitors/month from Google.

### Phase 3 — Jobs + Auth (Weeks 7–9)
- [ ] Supabase Auth + Google OAuth
- [ ] Replace mock data with real Supabase DB
- [ ] Wire up RemoteOK API + WeWorkRemotely RSS
- [ ] Wire up Numbeo API for city cost data
- [ ] Saved cities feature (auth required)
- [ ] User dashboard

**Goal:** 50 registered users.

### Phase 4 — Premium (Weeks 10–12)
- [ ] Razorpay subscription (₹299/month)
- [ ] Premium: job alerts, advanced salary comparison, no ads
- [ ] Email system (Resend) for job match alerts
- [ ] Upstash Redis caching layer

**Goal:** 5 paying users = ₹1,495 MRR.

### Phase 5 — Growth (Month 4+)
- [ ] Direct job listings ($49/post)
- [ ] Community forum (Supabase Realtime)
- [ ] City comparison tool
- [ ] Mobile PWA
- [ ] Refer-a-friend program

---

## Development Conventions

### Git Branching
```
main        → production (auto-deploys to Vercel)
dev         → staging
feature/*   → feature branches (PRs to dev)
fix/*       → bug fixes
```

### Commit Format
```
feat: add visa checker for Schengen area
fix: city cost not showing in INR on mobile
chore: update seed data for Bangkok
docs: update CLAUDE.md with Phase 2 plan
```

### Code Rules
- TypeScript strict mode: always on
- No `any` types — use proper interfaces in `packages/types`
- All API responses validated against Zod schemas
- All affiliate links: `target="_blank" rel="noopener noreferrer"`
- Mobile-first: test at 375px before 1280px

### Definition of Done
A feature is done when:
1. Works on mobile (375px) and desktop (1280px)
2. Has a loading state (skeleton — never blank)
3. Has an error state (message + retry button)
4. Has an empty state (helpful message + action)
5. Affiliate link tracked with PostHog event stub
6. No TypeScript errors (`pnpm typecheck`)

---

## Database Schema (Phase 3)

```sql
create table cities (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  country text not null,
  country_code text not null,
  continent text not null,
  monthly_rent_usd integer,
  monthly_food_usd integer,
  monthly_transport_usd integer,
  monthly_utilities_usd integer,
  monthly_total_budget_usd integer,
  internet_speed_mbps integer,
  safety_score integer,
  english_proficiency text,
  coworking_count integer,
  timezone text,
  currency_code text,
  updated_at timestamptz default now()
);

create table visa_requirements (
  id uuid primary key default gen_random_uuid(),
  passport_country_code text not null,
  destination_country_code text not null,
  visa_type text not null,
  max_stay_days integer,
  evisa_link text,
  embassy_link text,
  notes text,
  last_verified_at timestamptz default now(),
  unique(passport_country_code, destination_country_code)
);

create table jobs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  company text not null,
  location_type text not null,
  india_friendly boolean default true,
  salary_min_usd integer,
  salary_max_usd integer,
  tech_stack text[],
  job_url text not null,
  source text not null,
  is_featured boolean default false,
  posted_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz default now()
);

create table users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text,
  current_salary_inr integer,
  is_premium boolean default false,
  premium_expires_at timestamptz,
  created_at timestamptz default now()
);

create table saved_cities (
  user_id uuid references users(id) on delete cascade,
  city_id uuid references cities(id) on delete cascade,
  primary key (user_id, city_id)
);
```

---

## Known Risks

| Risk | Severity | Mitigation |
|---|---|---|
| Wrong visa data → user denied at airport | **Critical** | Always show "Last verified" date, embassy link, disclaimer, "Report incorrect info" button |
| Numbeo API cost at scale | Medium | 7-day cache TTL, seed top 50 cities manually |
| Job scraper gets blocked | Medium | Start with RemoteOK official API + WeWorkRemotely RSS |
| Empty job board | High | Never show zero jobs — always seed from RSS |
| User acquisition | High | SEO city pages + Indian tech Twitter + ProductHunt |

---

## What NOT to Build (Phase 1–2)

- ❌ Mobile app (PWA is enough for Year 1)
- ❌ AI chatbot
- ❌ Accommodation booking
- ❌ Flight search
- ❌ Community forum (do after 500 users)
- ❌ Non-Indian passport support (do after 10,000 Indian MAU)
