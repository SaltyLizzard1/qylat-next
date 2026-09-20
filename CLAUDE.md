# QYLAT (Quit Your Life and Travel)

Next.js lifestyle brand site for Liz's story of leaving corporate IT for Chiang Mai, and the top of the
funnel that feeds IdeaToPlan (ideatoplan.to, separate repo).

## Commands and stack

- `npm run dev` - local dev server
- `npm run build` - production build; run this to verify changes before finishing
- Sanity Studio runs separately at localhost:3333 (not embedded in this repo)
- Next.js App Router, not Pages Router
- Tailwind v4 with CSS-based config in `app/globals.css`. NEVER create a `tailwind.config.js`, it does
  not exist in this project by design
- Sanity CMS is the content backend (project `zvvdrylu`, dataset `production`)
- Deployed on Vercel Hobby plan: cron jobs limited to once daily
- No new dependencies without asking. Charts and visuals are pure CSS/JSX

## Component naming: story sections

- `components/StoryTeaser.tsx` is the dark commute block on the HOMEPAGE. On mobile the text block renders
  first and the photo second (order-1/order-2 swap at lg). Padding is py-8, md:py-16
- `components/StoryHero.tsx` is the storm hero at the top of the /STORY page (rain video, lightning).
  Mobile height is 55vh with a 340px floor, desktop 70vh with a 500px floor
- Different files on different pages. Never assume "story teaser" means /story. Confirm the page first

## Mobile overflow and scroll

- Any input inside a flex row must include min-w-0 or it will refuse to shrink and push the layout past
  the screen edge on small phones. Grid children that contain flex rows (like the footer newsletter
  column) need it too. Verified fix pattern in Footer.tsx and LeapCalculator.tsx, August 2026
- `scrollToSectionById` in `utils/scrollToSection.ts` must measure targets via the `offsetTop` chain (the
  `layoutTop` helper), never `getBoundingClientRect`, because Framer Motion entrance animations translate
  sections 24px until first viewed

## Shared infrastructure with IdeaToPlan

QYLAT shares two things with the IdeaToPlan repo (`ideaToPlan2`): one Supabase project
(`yglmlnfsyzsvozxirlpo`, Postgres 17, free tier) and one self-hosted n8n instance (`n8n.ideatoplan.to`,
Docker on a DigitalOcean droplet at 157.245.10.179). A change here can break IdeaToPlan, so before
touching anything that talks to Supabase or n8n, consider the other repo.

**Both repos contain a file called `components/IdeaToPlan.tsx` and they are entirely different files.**
QYLAT's holds the marketing section and an idea form that posts to `app/api/submit-idea/route.ts`.
IdeaToPlan's is the paid submission form. Confirm which repo is open before editing or reporting on it.

## n8n

The webhooks enforce a header at the router, before any workflow node runs. Without it, 403. Any code
calling them must send:

```
X-Webhook-Secret: <process.env.N8N_WEBHOOK_SECRET>
```

No webhook path is hardcoded in this repo. The URLs arrive as env vars: `N8N_QUIZ_WEBHOOK_URL` (path
`quiz-match-v2`, called by `app/api/quiz/route.ts` and by IdeaToPlan) and `N8N_I2P_WEBHOOK_URL` (path
`idea-submission-v2`, read here only by the health cron). A third path, `site-alert-v1`, exists in n8n
but nothing in this repo calls it. The quiz caller uses a conditional spread, so a missing secret
degrades to a `console.warn` rather than a throw.

`N8N_WEBHOOK_SECRET` must be set in Vercel for **Production and Preview**. Env var changes need a
**fresh deploy from the latest commit**, not the Redeploy button on an older deployment, which rebuilds
the old commit.

`quiz-match-v2` has a second webhook node for CORS preflight (OPTIONS) with authentication deliberately
off, because browsers cannot send custom auth headers on a preflight. Do not add auth to that node.

Running `n8nio/n8n:2.20.9`, pinned deliberately, bound to `127.0.0.1:5678`, `--restart unless-stopped`.
Do not suggest `latest` and do not upgrade without a droplet snapshot first. Stay on 2.x, since v3.0 has
breaking changes. No docker-compose file exists; the full `docker run` command is in the project notes.
n8n distinguishes draft from published: node changes require Save **and** Publish and the two can differ
silently, while workflow settings (Error Workflow, timezone, caller policy) apply immediately on save.

## Supabase

- QYLAT uses the `supabase-js` client in `lib/supabase.ts`, created with the **service role key**. It
  writes `quiz_results` from the quiz route and reads it back on the results page and its OG image route.
  The health cron reads `trend_cache`. `rate_limits` is never queried directly, only through the RPC
  below. That key reaches every table in the shared project, including IdeaToPlan's payment records
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` exists in the environment. Anything `NEXT_PUBLIC_` is inlined into the
  client bundle if referenced in client code, so do not introduce a browser-side Supabase client without
  first checking what RLS actually permits for `anon`
- Rate limiting goes through the `check_rate_limit` RPC (`lib/rateLimit.ts`), granted to `service_role`
  only. Do not re-grant to `anon` or `authenticated`
- An event trigger (`ensure_rls`) automatically enables RLS on any new table created in `public`. It adds
  no policies, so a new table is immediately locked to `service_role` until policies are written. Expect
  this rather than treating it as a bug
- Rate limit keys must stay **route-prefixed**. QYLAT uses `qylat-quiz:`; IdeaToPlan uses `quiz:`,
  `submit-idea:`, `verify-payment:`, `subscribe:`. Dropping the prefix would let QYLAT traffic lock users
  out of IdeaToPlan's paid submission path
- The QYLAT quiz limiter **fails closed** (an RPC error returns 429) and does not alert. IdeaToPlan's
  fails open with a `notify()` call. Deliberate divergence, unresolved
- Free tier includes **no automated backups**. Nightly `pg_dump` runs on the droplet at 03:15 UTC to
  Cloudflare R2. Do not assume a restore point exists beyond that
- Direct connection host is IPv6 only. From IPv4 use the Session pooler, user `postgres.yglmlnfsyzsvozxirlpo`

## Monitoring

Three UptimeRobot HTTP monitors at 5-minute intervals cover `ideatoplan.to`, `n8n.ideatoplan.to`, and
`quityourlifeandtravel.com`.

`app/api/cron/health/route.ts` runs daily at 07:00 UTC per `vercel.json`, gated by `CRON_SECRET`, and
alerts via Resend from `noreply@send.quityourlifeandtravel.com` to `liz@ideatoplan.to`. Three checks:
HEAD on the quiz webhook, HEAD on the idea submission webhook, and freshness of `trend_cache` (stale past
26 hours, against a workflow that runs daily at 03:00 UTC). On the HEAD checks anything that is not a 404
and not a 5xx counts as alive, since n8n answers 405 on a live path and 404 when the workflow is disabled
or unregistered. The HEAD checks only prove a path is registered, so the quiz workflow can fail every
execution while they stay green; only the `trend_cache` check catches that.

## Brand tokens (defined inline per component, not in a shared file)

Gold gradient: linear-gradient(135deg, #8B6914 0%, #E8C84A 35%, #F5E070 55%, #C9A030 75%, #8B6914 100%)
Deep sage #92A882: site frame color for Header and Footer backgrounds, with border #7a8f6c and
slate #2C3340 text. Sage is core to the earthy brand feel
Pale sage #EBF0E6: section background wash (Work With Me, Discover Your Idea, assessment)
Espresso #3A281A, espresso deep #2D1A00, cream #FBF6E3, slate #2C3340 for text on sage surfaces
Gold CTA buttons always get border: 1.5px solid #2D1A00
Headings: Cormorant Garamond 700 (fontFamily: "'Cormorant Garamond', Georgia, serif"). Body: Inter
Cormorant Garamond and Cinzel (display accent) both load via `next/font/google` in `app/layout.tsx`

## Copy rules (apply to ALL text: page copy, UI labels, alt text, comments in copy)

- Site copy is prose, not bullet points
- Founder voice: first person, direct, positive and forward-looking, never raw or grief-focused
- Liz's timeline always reads "six years" - do not vary it
- Canonical public numbers: left with $35k, $2,720 setup cost to Chiang Mai, $1,838/month living cost,
  17 months of runway. Use these exactly; never invent or recalculate them differently
- Never mention Liz's assets, investments, or debts anywhere public
- Existing site copy is the only source of truth for Liz's story. If a detail is not on the site, ask
- Blog posts: write so individual lines are extractable for Instagram and social captions

## Component conventions

- Header nav order: My Story, What's Stopping You, Leap Calculator, Discover Your Idea, Idea To Plan,
  Work With Me, Leap Log
- Interactive components are `'use client'`
- Email capture posts to `https://app.kit.com/forms/<id>/subscriptions` and the id differs per surface:
  `9498737` (Footer), `9243576` (LeadMagnet, LeapCalculator), `9562904` (assessment, ResultsGate). Blog
  posts instead embed the Kit script with uid `afc2a0b2d2` in `data/posts.tsx`. Reuse an existing id
- Free tools and content always appear before paid offers in page flow

## Metadata and social previews

- Metadata lives in one of two places today. A route `layout.tsx` carries it for assessment, calculator,
  thank-you, welcome and whats-stopping-you. The page itself exports `metadata` or `generateMetadata` for
  the homepage, story, about, faq, privacy, terms, maintenance, leap/[slug], results/[id] and
  whats-stopping-you/result/[id]. `lib/siteMetadata.ts` holds the site constants and a `pageMetadata()`
  helper that emits title, description, canonical, openGraph with image and twitter together. Use it
- The root layout deliberately carries no `alternates.canonical` and no `openGraph.url`. Both inherit into
  any route that does not override them, which is how /story, /about, /faq and the result pages shipped
  the homepage as their canonical until September 2026. Every indexable route sets its own canonical
- `app/page.tsx` is a server component so the homepage can export metadata; the client body lives in
  `components/HomePage.tsx`
- The per-user result routes (results/[id], whats-stopping-you/result/[id]) are `noindex, follow`. Their
  OG image routes still render, so sharing works
- The static 60-day post's slug, title, date and excerpt live in `data/staticPosts.ts` (server-safe) and
  spread into `data/posts.tsx`, which cannot be imported by a server component because it uses hooks.
  `app/leap/[slug]/page.tsx` checks that registry after Sanity and returns a real 404 for anything else
- New routes get one or the other, with title, description, canonical, openGraph AND twitter
- Any route that declares an `openGraph` block MUST include its own `images` array. Next.js merges
  metadata shallowly, so a child `openGraph` replaces the root one entirely and silently strips the
  inherited image. Same rule for the `twitter` block. History: this is exactly what broke /calculator,
  correct-looking metadata with no og:image shipped, fixed in `app/calculator/layout.tsx`
- `public/images/og-default.jpg` (1200x630) is the social share image. `public/images/rice-fields.jpg`
  (640x640) is the homepage hero, preloaded in `app/page.tsx` (not the layout) via `NEXT_PUBLIC_IMG_HERO`
  with `config/images.ts` as the fallback. Two separate files on purpose. Never point one at the other,
  and never overwrite rice-fields.jpg with a wide crop
- Always give OG images explicit `width`, `height` and `alt`. Facebook renders the large banner card only
  at 1200x630 (1.91:1); a square image gets center-cropped and loses the top and bottom
- `app/story/page.tsx` ships a 1200x700 OG image, the one existing exception to that rule
- Verify in the Facebook Sharing Debugger, then confirm on a phone. Press "Scrape Again"; the initial
  Debug only shows the cached copy. Facebook caches www and non-www separately, so scrape both
- NEVER diagnose OG problems in the Messenger panel inside Facebook desktop. It shows domain text with no
  card even when metadata is correct and other surfaces render fine. It cost one full debugging session
- Share direct URLs only. Google's native share button wraps links in a `share.google` redirect, which
  breaks previews. The debugger's missing `fb:app_id` warning is harmless, ignore it

## Environment

- Windows and PowerShell. Use `curl.exe` not `curl`, since `curl` is an alias for `Invoke-WebRequest` and
  takes different arguments. Backtick, not backslash, for line continuation. Use `-LiteralPath` for
  Next.js dynamic route files, since square brackets are wildcards without it
- Passwords and secrets containing `@` break URI-style connection strings, since the parser splits on the
  last `@`. Use separate variables rather than a URI

## Git

- Commit messages follow the no em dash rule too, same as code and copy
- Stage only relevant files per commit. New untracked files need a separate `git add`, `git commit -a` omits them
- Keep diffs reviewable: one concern per change
