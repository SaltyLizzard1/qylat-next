# QYLAT — quityourlifeandtravel.com

Next.js 15 App Router rewrite of the QYLAT brand site. Built with Turbopack, Tailwind CSS v4, TypeScript, Sanity CMS, Supabase, and n8n automation.

---

## Two Projects, One Ecosystem

There are two separate Next.js apps. They share **no code** — entirely different repos and node_modules — but they share the same backend infrastructure.

| | QYLAT (`qylat-next`) | IdeaToPlan (`ideatoplan2`) |
|---|---|---|
| **Purpose** | Content brand + coaching + lead-gen for IdeaToPlan | Business plan order form + quiz |
| **Domain** | quityourlifeandtravel.com | ideatoplan.com |
| **Local port** | 3001 (3000 taken by I2P) | 3000 |
| **Repo path** | `C:\Users\lizal\qylat-next` | `C:\documents\ideatoplan2` |
| **GitHub** | `SaltyLizzard1/qylat-next` | separate repo |
| **Supabase** | `yglmlnfsyzsvozxirlpo` (shared) | same project |
| **n8n** | `n8n.ideatoplan.to` (shared) | same instance |
| **Kit** | same ConvertKit account | same account |

---

## Running Locally

```bash
# Start QYLAT
cd C:\Users\lizal\qylat-next
npm run dev          # → localhost:3001

# Start IdeaToPlan (separate terminal)
cd C:\documents\ideatoplan2
npm run dev          # → localhost:3000
```

> Always start from the correct directory. A stray `package.json` previously existed at `C:\Users\lizal\` and caused Next.js to mis-detect the workspace root — it has been deleted. Do not run `npm install` from `C:\Users\lizal\` directly.

---

## Environment Variables (`qylat-next/.env.local`)

This file is gitignored. Never commit it. Re-create it manually if lost.

```env
# Public image paths (referenced by config/images.ts)
NEXT_PUBLIC_IMG_DAY0=/images/day-0-leaving-office.png
NEXT_PUBLIC_IMG_60DAY=/images/plane-ticket-schedule.jpg
NEXT_PUBLIC_IMG_LETTING_GO=/mountainofclothes.jpg
NEXT_PUBLIC_IMG_SORTING=/mountainofclothes.jpg
NEXT_PUBLIC_IMG_BALI_ATM=/images/bali-atm.jpg
NEXT_PUBLIC_IMG_ABOUT=/FB_Pic.jpg
NEXT_PUBLIC_IMG_ABOUT_BEACH=/me-whitedress.png
NEXT_PUBLIC_IMG_HERO=/images/rice-fields.jpg
NEXT_PUBLIC_IMG_BINI=/ai_bini.png
NEXT_PUBLIC_IMG_ENDING=/images/path.jpg

# Kit / ConvertKit — client-safe (used in browser for newsletter form)
NEXT_PUBLIC_KIT_API_KEY=...
NEXT_PUBLIC_KIT_FORM_ID=...          # main newsletter form
NEXT_PUBLIC_KIT_QUIZ_FORM_ID=...     # quiz email capture form

# n8n — SERVER ONLY. Never add NEXT_PUBLIC_ prefix.
N8N_QUIZ_WEBHOOK_URL=https://n8n.ideatoplan.to/webhook/quiz-match

# Supabase — anon key is public; service role is SERVER ONLY
NEXT_PUBLIC_SUPABASE_URL=https://yglmlnfsyzsvozxirlpo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...        # SERVER ONLY — never expose client-side
```

---

## Project Structure

```
qylat-next/
├── app/                        # Next.js App Router
│   ├── layout.tsx              # Root layout: fonts, global CSS, metadata
│   ├── page.tsx                # Homepage — assembles all sections in order
│   ├── quiz/page.tsx           # Skills Matcher quiz (/quiz)
│   ├── leap/[slug]/page.tsx    # Individual post pages (/leap/the-ending-...)
│   ├── thank-you/page.tsx      # Post-quiz thank you page
│   ├── welcome/page.tsx        # Post-subscribe welcome page
│   └── api/
│       ├── quiz/route.ts       # Proxy → n8n Skills Matcher webhook
│       └── posts/route.ts      # Server-side Sanity fetch, cached 1hr
│
├── components/                 # One file per homepage section
│   ├── Header.tsx              # Sticky nav: pill buttons + mobile hamburger menu
│   ├── Hero.tsx                # Full-viewport hero with rice fields background
│   ├── DiscoverYourIdea.tsx    # Quiz CTA section (sage green #EBF0E6)
│   ├── IdeaToPlan.tsx          # IdeaToPlan teaser + pricing (links out to ideatoplan.com)
│   ├── WorkWithMe.tsx          # Leap Session coaching offer → cal.com
│   ├── LeapLog.tsx             # Blog post grid (hardcoded + Sanity)
│   ├── About.tsx               # About section
│   ├── Footer.tsx              # Footer
│   ├── PostCard.tsx            # Card component used inside LeapLog grid
│   ├── Comments.tsx            # Comments section inside leap/[slug] pages
│   ├── NewsletterSignup.tsx    # Email capture (Kit embed script)
│   ├── LeadMagnet.tsx          # 60-day plan lead magnet download
│   ├── Day0LeapDecision.tsx    # Reusable content component for Day 0 post
│   ├── SectionDivider.tsx      # SVG wave divider between sections
│   ├── Wordmark.tsx            # QYLAT wordmark SVG
│   └── QMark.tsx               # Q logo mark SVG
│
├── lib/
│   ├── sanity.ts               # Sanity client + urlFor() image URL builder
│   ├── useSanityPosts.ts       # React hook — fetches /api/posts (never Sanity directly)
│   ├── SanityPostContent.tsx   # Renders Portable Text body in post modal
│   └── supabase.ts             # Supabase browser client (anon key, read-only)
│
├── config/
│   └── images.ts               # Central map of all NEXT_PUBLIC_IMG_* env vars
│
├── data/
│   └── posts.tsx               # Hardcoded posts array with full JSX content
│
├── utils/
│   ├── scrollToSection.ts      # Smooth scroll helper used by Header nav
│   └── postHeroImage.ts        # Resolves hero image path for a given post slug
│
├── public/                     # Static assets served at /
│   ├── images/                 # Section + blog images
│   ├── Blog/                   # Blog-specific images + PDFs
│   ├── favicon_io/             # Favicon set
│   └── ideatoplan-logo.png     # IdeaToPlan logo (displayed in IdeaToPlan section)
│
├── .env.local                  # Secrets — gitignored, never commit
├── next.config.ts              # Minimal Next.js config (intentionally empty)
└── vercel.json                 # Sets maxDuration: 180s for /api/quiz
```

---

## How the Homepage Works

`app/page.tsx` is a server component that renders all sections in sequence:

```
Header
  Hero                    ← rice fields background image, full viewport
  DiscoverYourIdea        ← quiz CTA → /quiz
  IdeaToPlan              ← pricing teaser → ideatoplan.com?ref=qylat
  WorkWithMe              ← Leap Session coaching → cal.com/qylat/leap-session
  LeapLog                 ← blog post grid
  About
Footer
```

The Header nav links to each section by ID:

| Nav label | Section ID | Type |
|---|---|---|
| Home | `#hero` | scroll |
| Discover Your Idea | `/quiz` | page link |
| Idea To Plan | `#idea-to-plan` | scroll |
| Work With Me | `#work-with-me` | scroll |
| Leap Log | `#the-leap-log` | scroll |
| About | `#about` | scroll |

---

## Content: Two Sources

### 1. Hardcoded posts (`data/posts.tsx`)

Posts with custom JSX (interactive tables, Kit signup forms) live here. Each has a `slug`, `image`, and `content` render function.

| ID | Slug | Notes |
|---|---|---|
| 8 | `never-leave-home-without-wet-wipes` | Travel tip |
| 7 | `the-ending-never-goes-as-planned` | Hero: `NEXT_PUBLIC_IMG_ENDING` = `/images/path.jpg` |
| 6 | `decision-made-doubt-showed-up` | Hero: `/Blog/edge-post-hero.jpg` |
| 1 | `day-0-the-decision-to-leap` | Day 0 origin story |
| 3 | `how-to-move-to-thailand-in-60-days` | **Pinned first**; collapsible table + Kit form |
| 5 | `international-banking-digital-nomads-expats` | Schwab / Wise guide |
| 4 | `the-more-i-sort-the-more-appears` | Packing post |

### 2. Sanity CMS (`lib/useSanityPosts.ts`)

Posts authored in Sanity Studio appear automatically in the Leap Log. The botanical post and any future posts live here.

**Important:** `useSanityPosts` calls `/api/posts`, never Sanity directly. This keeps requests within the free tier (100k/month).

```
Browser → GET /api/posts → server fetches Sanity (once/hr) → JSON to browser
```

If a Sanity post has the same slug as a hardcoded post, the Sanity version wins (deduplication in `LeapLog.tsx`).

---

## Skills Matcher Quiz (`/quiz`)

**User flow:**
1. User answers 5 steps: hard skills, soft skills, work style, values, hours + income target
2. Submit → `POST /api/quiz` (proxies to n8n, 175s timeout)
3. n8n workflow (`FFl62g1qFu7hf8Dd`):
   - Inserts row into Supabase `quiz_submissions`
   - Reads latest trends from `trend_cache` (or falls back to Perplexity + writes cache)
   - Calls Claude Sonnet via OpenRouter
   - Returns 7 matched business paths as structured JSON
4. Results rendered on page
5. User optionally enters email → captured to Kit form `KIT_QUIZ_FORM_ID`

**Why the proxy route?** `N8N_QUIZ_WEBHOOK_URL` must stay server-side. Calling n8n from the browser would expose the webhook URL publicly.

---

## IdeaToPlan Section — What QYLAT Does and Does NOT Do

QYLAT **promotes** IdeaToPlan but does **not** host the form.

| | QYLAT | IdeaToPlan |
|---|---|---|
| Logo + intro | ✅ (teaser) | ✅ (full site) |
| Pricing tiers shown | ✅ (display only) | ✅ (with order form) |
| 25-field business plan form | ❌ | ✅ |
| `submit-idea` API route | ❌ | ✅ → n8n IdeaToPlan pipeline |
| CTA destination | `ideatoplan.com?ref=qylat` | stays on site |

The `?ref=qylat` query string on outbound links tracks traffic source in analytics.

---

## Design Tokens

All sections share these values — do not deviate without updating all sections.

| Token | Value | Used in |
|---|---|---|
| Gold gradient (CTA buttons) | `135deg, #8B6914 → #E8C84A → #F5E070 → #C9A030 → #8B6914` | Every CTA button |
| Gold text / icons | `#C9A030` / `#8B6914` | Eyebrow labels, checkmarks, prices |
| Forest green (headings) | `#2D5016` | Headings on light sections |
| Sage background | `#EBF0E6` | DiscoverYourIdea + IdeaToPlan |
| Header background | `#92A882` | Sticky nav |
| White | `#ffffff` | WorkWithMe + pricing cards |
| Cormorant Garamond | serif (`font-cormorant`) | All headings |

---

## What Is Shared With IdeaToPlan

### Shared backend infrastructure

| Resource | Details |
|---|---|
| **n8n instance** | `n8n.ideatoplan.to` — both sites POST to workflows here |
| **Skills Matcher workflow** | ID `FFl62g1qFu7hf8Dd` — identical webhook URL in both `/api/quiz` routes |
| **Supabase project** | `yglmlnfsyzsvozxirlpo` — both write `quiz_submissions`, `trend_cache` |
| **Kit account** | Same ConvertKit account; quiz form ID is the same |
| **IdeaToPlan logo file** | Copied from `ideatoplan2/logos/export/png/logo-2048.png` into QYLAT's `/public/ideatoplan-logo.png` |

### Parallel quiz implementation (same UX, different code)

Both sites have a `/quiz` page connected to the same n8n workflow. Key differences:

| | QYLAT | IdeaToPlan |
|---|---|---|
| Kit email capture | Client-side via `NEXT_PUBLIC_KIT_*` | Server-side via `/api/subscribe` |
| "Back" link | Back to QYLAT | Back to IdeaToPlan |
| Post-quiz CTA | Scroll to `#idea-to-plan` on QYLAT homepage | Go to IdeaToPlan homepage |

### Explicitly NOT shared

- No shared React components or files
- No shared `node_modules`
- The 25-field business plan form lives **only** in `ideatoplan2`
- `N8N_I2P_WEBHOOK_URL` exists **only** in ideatoplan2
- Sanity CMS is **only** used by QYLAT

---

## n8n Workflows

| Workflow | ID | Trigger | What it does |
|---|---|---|---|
| Skills Matcher | `FFl62g1qFu7hf8Dd` | Webhook POST `/webhook/quiz-match` | Quiz answers → Claude → 7 career matches |
| IdeaToPlan Pipeline | `Wn6ATzrXmDvKMwJk` | Webhook POST `/webhook/idea-submission` | Form data → plan generation → email delivery |
| Trend Cache Refresher | `arQPZu6FcqtEwzvf` | Daily schedule | Perplexity → Supabase `trend_cache` |

**Manual credential setup required in n8n UI:**
- HTTP Request nodes (Fetch Trends Fallback, Call Claude via OpenRouter) → assign OpenRouter credentials
- Supabase nodes → assign "Supabase account" credential

---

## Supabase Tables

| Table | Written by | Read by | Purpose |
|---|---|---|---|
| `quiz_submissions` | n8n (service role) | — | Logs every quiz submission for analytics |
| `trend_cache` | n8n (service role) | n8n (anon) | Caches Perplexity trend data hourly |
| `idea_submissions` | n8n (service role) | — | Logs IdeaToPlan form submissions |

RLS is enabled on all tables. Service role can write; anon can only read `trend_cache`.

---

## Deployment (Vercel)

Create **two separate** Vercel projects — one per repo.

**QYLAT env vars to add in Vercel → Settings → Environment Variables:**

| Variable | Scope |
|---|---|
| All `NEXT_PUBLIC_IMG_*` | Client + Server |
| `NEXT_PUBLIC_SUPABASE_URL` | Client + Server |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client + Server |
| `NEXT_PUBLIC_KIT_API_KEY` | Client + Server |
| `NEXT_PUBLIC_KIT_FORM_ID` | Client + Server |
| `NEXT_PUBLIC_KIT_QUIZ_FORM_ID` | Client + Server |
| `N8N_QUIZ_WEBHOOK_URL` | **Server only** |
| `SUPABASE_SERVICE_ROLE_KEY` | **Server only** |

`vercel.json` already configures `maxDuration: 180` for `/api/quiz` to handle the n8n + Claude round-trip time.

---

## Sanity CMS

- **Project:** `zvvdrylu` | **Dataset:** `production` (public)
- **CORS origins:** must include `localhost:3001` (dev) and the production domain
- **Manage:** `sanity.io/manage/project/zvvdrylu/api`
- **Free tier:** 100k API requests/month. The `/api/posts` cache (1hr ISR) converts N browser visits/hour into 1 Sanity call/hour.
