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

- NEVER use em dashes anywhere. Use commas, periods, colons, or the word "and"
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
  openGraph AND twitter blocks (missing OG metadata is a known past bug class)
- Interactive components are `'use client'`
- Email capture posts to the existing Kit form: `https://app.kit.com/forms/afc2a0b2d2/subscriptions`
- Free tools and content always appear before paid offers in page flow

## Workflow

- For any multi-file or structural change, propose a plan first and wait for approval
- Keep diffs reviewable: one concern per change
