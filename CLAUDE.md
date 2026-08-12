# QYLAT (Quit Your Life and Travel)

Next.js lifestyle brand site for Liz's story of leaving corporate IT for Chiang Mai,
and the top of the funnel that feeds IdeaToPlan (ideatoplan.to, separate repo).

## Commands

- `npm run dev` - local dev server
- `npm run build` - production build; run this to verify changes before finishing
- Sanity Studio runs separately at localhost:3333 (not embedded in this repo)

## Stack facts

- Next.js App Router. Pages in `app/`, shared components in `components/`
- Tailwind v4 with CSS-based config in `app/globals.css`. NEVER create a
  `tailwind.config.js` - it does not exist in this project by design
- Sanity CMS is the content backend (project `zvvdrylu`, dataset `production`)
- Deployed on Vercel Hobby plan: cron jobs limited to once daily
- No new dependencies without asking. Charts and visuals are pure CSS/JSX

## Component naming: story sections

- `components/StoryTeaser.tsx` is the dark commute block on the HOMEPAGE.
  On mobile the text block renders first and the photo second (order-1/order-2
  swap at lg). Mobile padding is py-8, desktop py-16.
- `components/StoryHero.tsx` is the storm hero at the top of the /STORY page
  (rain video, lightning). Mobile height is 55vh with a 340px floor; desktop
  is 70vh with a 500px floor.
- These are different files on different pages. Never assume "story teaser"
  means /story. Confirm which page before editing.

## Mobile overflow rule

- Any input inside a flex row must include min-w-0 or it will refuse to
  shrink and push the layout past the screen edge on small phones.
- Grid children that contain flex rows (like the footer newsletter column)
  need min-w-0 for the same reason. Verified fix pattern in Footer.tsx and
  LeapCalculator.tsx, August 2026.

## Shared infrastructure with IdeaToPlan

QYLAT shares two things with the IdeaToPlan repo (`ideaToPlan2`): one Supabase
project (`yglmlnfsyzsvozxirlpo`, Postgres 17, free tier) and one self-hosted n8n
instance (`n8n.ideatoplan.to`, Docker on a DigitalOcean droplet at
157.245.10.179).

A change here can break IdeaToPlan. Before touching anything that talks to
Supabase or n8n, consider the other repo.

**Both repos contain a file called `components/IdeaToPlan.tsx` and they are
entirely different files.** QYLAT's is the marketing section with the "Share Your
Idea" CTA. IdeaToPlan's is the paid submission form. Confirm which repo is open
before editing or reporting on that filename.

## n8n webhooks require authentication

The n8n webhooks enforce a header at the router, before any workflow node runs.
Any code calling them must send:

```
X-Webhook-Secret: <process.env.N8N_WEBHOOK_SECRET>
```

Without it the request gets 403. Paths: `quiz-match-v2` (QYLAT and IdeaToPlan
both call this), `idea-submission-v2`, `site-alert-v1`.

QYLAT's caller is `app/api/quiz/route.ts`, using a conditional spread so a
missing env var degrades to a `console.warn` rather than a throw.

`N8N_WEBHOOK_SECRET` must be set in Vercel for **Production and Preview**. Env
var changes need a **fresh deploy from the latest commit**, not the Redeploy
button on an older deployment, which rebuilds the old commit.

`quiz-match-v2` has a second webhook node for CORS preflight (OPTIONS) with
authentication deliberately off, because browsers cannot send custom auth headers
on a preflight. Do not add auth to that node.

## n8n version and deployment

Running `n8nio/n8n:2.20.9`, pinned deliberately, bound to `127.0.0.1:5678`,
`--restart unless-stopped`. Roughly 13 minors behind. Do not suggest `latest` and
do not upgrade without a droplet snapshot first. Stay on 2.x, since v3.0 has
breaking changes.

No docker-compose file exists. The full `docker run` command is recorded only in
the project notes.

n8n distinguishes draft from published. Node changes require Save **and**
Publish, and the two can differ silently. Workflow settings (Error Workflow,
timezone, caller policy) are the exception and apply immediately on save.

## Supabase

- QYLAT writes `quiz_results` and reads `trend_cache` and `rate_limits` via the
  **service role key over the REST API** (`lib/supabase.ts`). That key reaches
  all six tables in the shared project, including IdeaToPlan's payment records,
  so treat it accordingly
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` exists in the environment. Anything
  `NEXT_PUBLIC_` is inlined into the client bundle if referenced in client code,
  so do not introduce a browser-side Supabase client without first checking what
  RLS actually permits for `anon`
- Rate limiting goes through the `check_rate_limit` RPC, granted to
  `service_role` only. Do not re-grant to `anon` or `authenticated`
- An event trigger (`ensure_rls`) automatically enables RLS on any new table
  created in `public`. It adds no policies, so a new table is immediately locked
  to `service_role` until policies are written. Expect this rather than treating
  it as a bug
- Rate limit keys must stay **route-prefixed**. QYLAT uses `qylat-quiz:`;
  IdeaToPlan uses `quiz:`, `submit-idea:`, `verify-payment:`, `subscribe:`.
  Dropping the prefix would let QYLAT traffic lock users out of IdeaToPlan's paid
  submission path
- The QYLAT quiz limiter **fails closed** (an RPC error returns 429) and does not
  alert. IdeaToPlan's fails open with a `notify()` call. Deliberate divergence,
  unresolved
- Free tier includes **no automated backups**. Nightly `pg_dump` runs on the
  droplet at 03:15 UTC to Cloudflare R2. Do not assume a restore point exists
  beyond that
- Supabase's direct connection host is IPv6 only. Anything connecting from IPv4
  must use the Session pooler with user `postgres.yglmlnfsyzsvozxirlpo`

## Monitoring

Three UptimeRobot HTTP monitors at 5-minute intervals cover `ideatoplan.to`,
`n8n.ideatoplan.to`, and `quityourlifeandtravel.com`.

`app/api/cron/health/route.ts` runs daily at 07:00 UTC per `vercel.json`, gated
by `CRON_SECRET`, and alerts via Resend from
`noreply@send.quityourlifeandtravel.com`. It HEADs the n8n webhooks and treats
404 as dead, 405 as alive. It only checks that a webhook path is registered, not
that executions succeed, so a workflow can fail every run while this stays green.

## Brand tokens (defined inline per component, not in a shared file)

Gold gradient: linear-gradient(135deg, #8B6914 0%, #E8C84A 35%, #F5E070 55%, #C9A030 75%, #8B6914 100%)
Deep sage #92A882: site frame color for Header and Footer backgrounds, with
border #7a8f6c and slate #2C3340 text. Sage is core to the earthy brand feel
Pale sage #EBF0E6: section background wash (Work With Me, Discover Your Idea, assessment)
Espresso #3A281A, espresso deep #2D1A00, cream #FBF6E3
Slate #2C3340: text color on sage surfaces
Gold CTA buttons always get border: 1.5px solid #2D1A00
Headings: Cormorant Garamond 700 (fontFamily: "'Cormorant Garamond', Georgia, serif")
Body: Inter / system sans

## Copy rules (apply to ALL text: page copy, UI labels, alt text, comments in copy)

- NEVER use em dashes anywhere. Use commas, periods, colons, or the word "and".
  This applies to code, comments and commit messages too, not just page copy
- Site copy is prose, not bullet points
- Founder voice: first person, direct, positive and forward-looking, never raw or grief-focused
- Liz's timeline always reads "six years" - do not vary it
- Canonical public numbers: left with $35k, $2,720 setup cost to Chiang Mai,
  $1,838/month living cost, 17 months of runway. Use these exactly; never invent
  or recalculate them differently
- Never mention Liz's assets, investments, or debts anywhere public
- Do not invent narrative details about Liz's story. If a fact is not in existing
  site copy, ask instead of embellishing
- Blog posts: write so individual lines are extractable for Instagram and social captions

## Component conventions

- Header nav order: My Story, Leap Calculator, Discover Your Idea, Idea To Plan,
  Work With Me, Leap Log
- Every route gets a `layout.tsx` with full metadata: title, description, canonical,
  openGraph AND twitter blocks. See Social previews below; the `images` array is the
  part that gets forgotten and it fails silently
- Interactive components are `'use client'`
- Email capture posts to the existing Kit form: `https://app.kit.com/forms/afc2a0b2d2/subscriptions`
- Free tools and content always appear before paid offers in page flow

## Social previews (Open Graph)

- `public/images/og-default.jpg` (1200x630) is the social share image.
  `public/images/rice-fields.jpg` (640x640) is the homepage hero and is preloaded
  in `app/layout.tsx`. Two separate files on purpose. Never point one at the other,
  and never overwrite rice-fields.jpg with a wide crop
- Any route that declares an `openGraph` block MUST include its own `images` array.
  Next.js merges metadata shallowly, so a child `openGraph` replaces the root one
  entirely and silently strips the inherited image. This is exactly what broke
  /calculator: correct-looking metadata, no og:image shipped
- Same rule for the `twitter` block. Declaring it without `images` leaves no image
- Always give OG images explicit `width`, `height` and `alt`. Facebook renders the
  large banner card only at 1200x630 (1.91:1); a square image gets center-cropped
  and loses the top and bottom of the composition
- Verify in the Facebook Sharing Debugger, then confirm on a phone. Press
  "Scrape Again"; the initial Debug only shows the cached copy, which can be weeks
  old. Facebook caches www and non-www as separate entries, so scrape both
- NEVER diagnose OG problems in the Messenger panel inside Facebook desktop. It
  shows domain text with no card even when metadata is correct and other surfaces
  render fine. It has already cost one full debugging session
- Share direct URLs only. Google's native share button wraps links in a
  `share.google` redirect, which breaks previews
- The debugger's missing `fb:app_id` warning is harmless. Ignore it

## Environment

- Windows and PowerShell. Use `curl.exe` not `curl`, since `curl` is an alias for
  `Invoke-WebRequest` and takes different arguments. Backtick, not backslash, for
  line continuation. Use `-LiteralPath` for Next.js dynamic route files, since
  square brackets are wildcards without it
- Passwords and secrets containing `@` break URI-style connection strings, since
  the parser splits on the last `@`. Use separate variables rather than a URI

## Workflow

- For any multi-file or structural change, propose a plan first and wait for approval
- Keep diffs reviewable: one concern per change
- Deliver website work as paste-ready prompts with complete files, not FROM/TO snippets
- Stage only relevant files per commit. New untracked files need a separate
  `git add`, since `git commit -a` omits them

Scroll Behavior:  scrollToSectionById must measure targets via the offsetTop chain, never getBoundingClientRect, because Framer Motion entrance animations translate sections 24px until first viewed.