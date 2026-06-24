#!/usr/bin/env node
/**
 * migrate-posts.mjs
 *
 * Migrates the 7 hardcoded posts from data/posts.tsx into Sanity CMS.
 *
 * Usage:
 *   SANITY_WRITE_TOKEN=<token> node scripts/migrate-posts.mjs
 *
 * Get a token (Editor role) from:
 *   https://www.sanity.io/manage/personal/project/zvvdrylu/api
 *
 * Safe to run multiple times — already-migrated posts are skipped by slug.
 *
 * After verifying posts look correct in Studio, remove them from data/posts.tsx.
 *
 * Notes on the 60-day post:
 *   - The interactive email opt-in form (Kit) and collapsible table are React-only
 *     components that cannot be represented in Portable Text. They are omitted.
 *     The prose content is migrated. If you want to keep the interactive table,
 *     leave that post in data/posts.tsx or add a custom Sanity block type.
 */

import { createClient } from '@sanity/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// ─── Sanity client ────────────────────────────────────────────────────────────

const token = process.env.SANITY_WRITE_TOKEN;
if (!token) {
  console.error('Error: SANITY_WRITE_TOKEN is required.');
  console.error('Get a token (Editor role) from:');
  console.error('  https://www.sanity.io/manage/personal/project/zvvdrylu/api');
  process.exit(1);
}

const client = createClient({
  projectId: 'zvvdrylu',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token,
  useCdn: false,
});

// ─── Portable Text helpers ────────────────────────────────────────────────────

function uid() {
  return crypto.randomBytes(5).toString('hex');
}

function block(text, style = 'normal') {
  return {
    _type: 'block',
    _key: uid(),
    style,
    markDefs: [],
    children: [{ _type: 'span', _key: uid(), text, marks: [] }],
  };
}

function h2(text) {
  return block(text, 'h2');
}

function h3(text) {
  return block(text, 'h3');
}

function blockquote(text) {
  return block(text, 'blockquote');
}

function bullet(text) {
  return {
    _type: 'block',
    _key: uid(),
    style: 'normal',
    listItem: 'bullet',
    level: 1,
    markDefs: [],
    children: [{ _type: 'span', _key: uid(), text, marks: [] }],
  };
}

function imageBlock(assetId, alt = '', caption = '') {
  const img = {
    _type: 'image',
    _key: uid(),
    asset: { _type: 'reference', _ref: assetId },
  };
  if (alt) img.alt = alt;
  if (caption) img.caption = caption;
  return img;
}

function heroImageRef(assetId) {
  return {
    _type: 'image',
    asset: { _type: 'reference', _ref: assetId },
  };
}

// ─── Image upload ─────────────────────────────────────────────────────────────

const uploadCache = {};

async function uploadImage(relativePath) {
  if (uploadCache[relativePath]) return uploadCache[relativePath];

  const absPath = path.join(ROOT, 'public', relativePath.replace(/^\//, ''));
  if (!fs.existsSync(absPath)) {
    console.warn(`  ⚠ Not found, skipping: ${absPath}`);
    return null;
  }

  const ext = path.extname(absPath).slice(1).toLowerCase();
  const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';
  console.log(`  ↑ Uploading ${path.basename(absPath)}...`);

  const asset = await client.assets.upload('image', fs.createReadStream(absPath), {
    filename: path.basename(absPath),
    contentType: mimeType,
  });

  console.log(`  ✓ ${path.basename(absPath)} → ${asset._id}`);
  uploadCache[relativePath] = asset._id;
  return asset._id;
}

// ─── Slug existence check ─────────────────────────────────────────────────────

async function slugExists(slug) {
  const id = await client.fetch(
    `*[_type == "post" && slug.current == $slug][0]._id`,
    { slug },
  );
  return Boolean(id);
}

// ─── Post definitions ─────────────────────────────────────────────────────────

async function buildWetWipes() {
  const hero = await uploadImage('/images/bathroom-travel-sign.jpg');
  const img1 = await uploadImage('/images/bathroom-travel-tip.jpg');
  const img2 = await uploadImage('/images/the-other-normal.jpg');

  return {
    slug: 'never-leave-home-without-wet-wipes',
    title: '#1 Travel Tip: NEVER Leave Home Without Wet Wipes',
    publishedAt: '2026-05-24',
    excerpt: 'Three countries. Three bathrooms. Three versions of "figure it out." And in every single one, a pack of wet wipes would have changed my life.',
    postType: 'blog',
    featured: false,
    tags: ['travel tips', 'southeast asia', 'packing', 'practical travel'],
    heroImage: hero ? heroImageRef(hero) : undefined,
    body: [
      ...(img1 ? [imageBlock(img1, 'Bathroom travel tip')] : []),
      block('I was in the middle of a night market in Taiwan when it hit.'),
      block('Not inspiration. Not culture shock. The street food.'),
      block('My stomach made a decision before my brain could weigh in. I found the nearest public bathroom, pushed open the door, and saw it. A hole in the ground. No toilet paper. No bum gun. No nothing.'),
      block('Just me and a squat toilet in a crowded night market with zero negotiating power.'),
      block("I had wet wipes which I had left back at the hotel, because we weren't going to be gone long."),
      block('I went home immediately and showered.'),
      block('Then there was Thailand. Different country, different surprise. I walked into the bathroom and found two buckets of water with plastic scoops sitting next to the toilet. No flush handle. No paper. No instructions.'),
      blockquote('I stood there like I was solving a puzzle with no picture on the box.'),
      block("Bali? Another hole in the ground. At this point I wasn't even surprised. Just disappointed in myself for still not having wet wipes in my bag."),
      block('Three countries. Three bathrooms. Three versions of "figure it out." And in every single one, a pack of wet wipes would have changed my life.'),
      h3('Then I Saw This Sign'),
      ...(img2 ? [imageBlock(img2, 'Do not stand on toilet sign')] : []),
      block('Do not stand on toilet. In English and Mandarin. With diagrams.'),
      block('That is when it hit me. I was confused by their bathrooms. They are confused by ours. The squat toilet is the default for most of the world. The Western toilet is the foreign one. Nobody teaches any of us how the other side works.'),
      block('So here is what I wish someone had told me before I stood there clueless.'),
      h3('The Bum Gun'),
      block('That small sprayer mounted on the wall next to the toilet. It looks like a kitchen sink sprayer and it works the same way. Stay seated. Point it where it needs to go. Squeeze the handle gently. The pressure is stronger than you expect, so start light. Pat dry with toilet paper or wet wipes if available. That is it. Once you get past the initial shock of cold water, it is actually cleaner than paper alone.'),
      h3('The Bucket and Scoop'),
      block('This is the manual version of a flush. The bucket holds clean water. The small scoop or bowl is for two things. First, use it to pour water for personal cleaning, the same job as the bum gun but by hand. Second, when you are done, scoop water from the bucket and pour it directly into the toilet bowl to flush. Two or three scoops usually does it. Do not dump the entire bucket. Other people need it too.'),
      h3('The Squat Toilet'),
      block('Face the hood or raised end of the toilet. Plant your feet on the textured footpads on either side. Squat all the way down. That is the position. If there is a bum gun, use it. If there is a bucket and scoop, use that. If there is neither, this is where your wet wipes save your life. Do not put them in the toilet. Most plumbing in Southeast Asia cannot handle it. Use the bin next to the toilet.'),
      blockquote('These systems are not broken. They are not primitive. You are just the visitor who never learned how they work.'),
      block('So here it is. The number one travel tip nobody puts in the guidebook.'),
      block('Never leave home without wet wipes. Not the hotel. Not the restaurant. Not the night market. Nowhere.'),
      block("But also learn the local bathroom before you need it. Your stomach does not care about your plans. And neither does the plumbing."),
    ],
  };
}

async function buildEnding() {
  const hero = await uploadImage('/images/path.jpg');

  return {
    slug: 'the-ending-never-goes-as-planned',
    title: 'The Ending Never Goes As Planned',
    publishedAt: '2026-05-17',
    excerpt: 'I had a version of how this would go. None of it went that way.',
    postType: 'blog',
    featured: false,
    tags: ['mindset', 'leaving', 'life change', 'quitting corporate'],
    heroImage: hero ? heroImageRef(hero) : undefined,
    body: [
      block('I had a version of how this would go.'),
      block("The last day would feel earned. The people I'd worked alongside would gather, maybe not formally, but in the way that matters. A moment of acknowledgment. A proper goodbye. The customers I'd spent years building relationships with would know I was leaving. There would be closure."),
      block('None of it went that way.'),
      h3('The Ending We Write In Our Heads'),
      block("When you decide to make a major life change, quit your life, buy the ticket, commit to the leap, you spend a lot of time thinking about what's ahead."),
      block("What you don't expect is how much energy you'll spend on the ending."),
      block("We write it in our heads without realising we're doing it. The farewell that feels proportionate to the time invested. The people who show up. The clean exit that honours what was, while making space for what's coming."),
      block("It's a good story. We just rarely get to live it."),
      h3('What Actually Happens'),
      block("The ending gets taken from you in ways you didn't anticipate. Not dramatically. Not all at once. But in small specific ways that add up."),
      block("The goodbye you planned doesn't happen. The people you expected aren't there. The closure you needed doesn't arrive on schedule."),
      block("And you're left standing at the departure point with a messier ending than you wrote, and a plane to catch anyway."),
      h3('What Nobody Tells You'),
      block("Here's what I've learned about leaving."),
      blockquote('The ending is not yours to control. Only the direction is.'),
      block("You can plan the destination. You can prepare for the journey. But the ending, the last chapter of the life you're leaving, gets written by circumstances, by other people's choices, by timing, by chaos you didn't invite."),
      block("The people I counted on shifted. That's the part nobody warns you about."),
      block('But in the spaces left by all of that, something else arrived.'),
      block('Consistency in an inconsistent time. Unexpected anchors in unexpected places. The reminder that solid ground shows up where you least expect it when the ground you planned on shifts.'),
      block("I'm writing this before I get on the plane."),
      block("The ending didn't go as planned. The universe filters. Not always kindly. But accurately."),
      block("I'm going anyway."),
      block("Not because it doesn't hurt. Not because the messy ending doesn't matter. But because waiting for the clean exit, the earned goodbye, the full support, the tidy closure, means waiting forever."),
      block('The ending never goes as planned.'),
      block('Go anyway.'),
    ],
  };
}

async function buildDoubt() {
  const hero = await uploadImage('/Blog/edge-post-hero.jpg');

  return {
    slug: 'decision-made-doubt-showed-up',
    title: 'The Decision Is Made. The Doubt Showed Up Anyway.',
    publishedAt: '2026-03-28',
    excerpt: 'I already decided. The doubt showed up anyway. On losing the safety net you never planned to use, and why forward is the only option left.',
    postType: 'blog',
    featured: false,
    tags: ['mindset', 'doubt', 'decision', 'quitting corporate', 'motivation'],
    heroImage: hero ? heroImageRef(hero) : undefined,
    body: [
      block('I already decided. That part is done.'),
      block('But today the doubt showed up anyway. Loud, uninvited, and carrying receipts.'),
      block('The thing that really hit today was the safety net.'),
      block('It is gone.'),
      block("There was a job. Something I could have quietly gone back to if this all fell apart. A door I never planned to walk through again, but one I knew was there. Today it closed. Not by my choice. And losing something you never intended to use still hurts more than you expect it to."),
      block('For a few hours this morning, I let myself feel all of it.'),
      block('Not into changing my mind. Just into the weight of how real this has become.'),
      blockquote("The question isn't what happens if you fail. It's what happens if you don't try."),
      block("I heard that at the gym today. My AI podcast cut out mid-episode and a motivation speech took over. I almost skipped it. I didn't."),
      block('I sat with the question.'),
      block("What happens if I don't try?"),
      block('What does staying look like.'),
      block('Another year of the same ceiling, the same routine, the same version of myself I have already outgrown?'),
      block('I felt the answer before I could think it.'),
      block('Unbearable.'),
      block('That is why I decided in the first place. Today just reminded me.'),
      block("There is no backup plan now. There is only forward. And honestly, that kind of clarity, as terrifying as it is, has a way of cutting through the noise faster than anything else."),
      block("Doubt is not a sign you are making the wrong choice. It is a sign the choice is real. Small decisions don't come with this much weight."),
      block("If you are reading this with your own decision already made, the one you keep second-guessing, the one that feels impossibly heavy some days, this feeling is part of it."),
      block("It doesn't mean stop. It means you are close."),
      block('Keep going.'),
    ],
  };
}

async function buildDayZero() {
  const hero = await uploadImage('/images/day-0-leaving-office.png');
  const img1 = await uploadImage('/images/quit-your-life-and-travel.jpg');

  return {
    slug: 'day-0-the-decision-to-leap',
    title: 'Day 0: The Decision to Leap',
    publishedAt: '2026-02-02',
    excerpt: 'Not a highlight reel. The real one. From autopilot in Florida to a one-way ticket to Thailand — and what happened when the world hit pause.',
    postType: 'blog',
    featured: false,
    tags: ['day 0', 'decision', 'thailand', 'quitting corporate', 'digital nomad'],
    heroImage: hero ? heroImageRef(hero) : undefined,
    body: [
      ...(img1 ? [imageBlock(img1, '51% of U.S. employees have cried at the office — news headline')] : []),
      block('In 2018, I quit my corporate job and bought a one-way ticket to Thailand — just to test the waters.'),
      block('Before that, I was living on autopilot.'),
      block('Every day looked the same. Staring out the office window. Going through the motions. Doing everything I was supposed to do. Feeling nothing.'),
      block("The monotony wasn't just uncomfortable. It was unbearable."),
      block('So I did the terrifying thing: left the comfort of a steady paycheck behind.'),
      blockquote("The second leap is harder. You know exactly what you're risking. You go anyway."),
      block("The freedom. The new rhythm. The feeling of being truly alive. It confirmed everything I'd suspected. Humans weren't built to spend their lives in cubicles."),
      block('So I came back and sold everything. Ready to make it permanent.'),
      block('Then the world shut down. A legal situation I had no control over kept me locked in place for five years. Less money. Less certainty. More fear.'),
      block('And still. Here I am. Going anyway.'),
      block("Now I'm jumping again. Different job. Same massive fear. No more waiting."),
      block('Quit Your Life and Travel is the story of refusing to let fear write the ending.'),
      block("If you've been staring out your own window. Waiting for the right time. Waiting for permission. Waiting for the fear to go away."),
      block("Fear doesn't go away. You just stop letting it drive."),
      block("Welcome to the leap. I'm glad you're here."),
    ],
  };
}

async function buildSixtyDay() {
  const hero = await uploadImage('/images/plane-ticket-schedule.jpg');

  return {
    slug: 'how-to-move-to-thailand-in-60-days',
    title: 'How to Move to Thailand in 60 Days',
    publishedAt: '2026-03-15',
    excerpt: "The second leap is harder than the first. Here's the exact 60-day plan I'm following - packing, visa, banking, and every task from first sort to final keys.",
    postType: 'blog',
    featured: true,
    tags: ['thailand', 'move abroad', 'packing', 'visa', 'banking', 'digital nomad', '60 days'],
    heroImage: hero ? heroImageRef(hero) : undefined,
    body: [
      block("The first time I did this, it was easier. Not because it wasn't scary. It was terrifying. But I hadn't lost anything yet. I just knew I was done with the life I had and ready for something different."),
      block('So I left. Tested the waters. Bought a one-way ticket to Thailand and felt, for the first time in years, completely alive.'),
      block('It confirmed everything I suspected. This was the life I was supposed to be living.'),
      block('So I came home, sold everything, and prepared to make it permanent.'),
      block('Then the world had other plans.'),
      block("COVID shut everything down. A legal situation I had no control over kept me locked in place for years. Five years of watching the dream sit on pause. Five years of rebuilding from scratch. Less money. Less certainty. More fear."),
      block('And still. Here I am. Going anyway.'),
      block("If you're reading this waiting for the perfect moment, the right amount of money, the right circumstances - I need you to understand something."),
      blockquote('There is no perfect moment. There is only the decision.'),
      block("This is mine. Again. Here's exactly how I'm doing it."),
      // NOTE: The interactive 60-day plan table and Kit email opt-in form from the
      // original post are React components that can't be represented in Portable Text.
      // To restore that functionality in Sanity, add a custom block type to your schema,
      // or keep the post in data/posts.tsx. The prose content above and below is migrated.
      block('Five years taught me what actually matters. I rebuilt. I came back stronger.'),
      block('And I would do every single bit of it again to get back to that feeling of being truly alive.'),
    ],
  };
}

async function buildBanking() {
  const hero = await uploadImage('/images/bali-atm.jpg');

  return {
    slug: 'international-banking-digital-nomads-expats',
    title: 'International Banking for Digital Nomads and Expats — What I Set Up Before I Left',
    publishedAt: '2026-03-18',
    excerpt: 'TD Bank was perfect for Tampa. It was useless in Bali. The replacement card took a month. Here is what I set up differently this time.',
    postType: 'blog',
    featured: false,
    tags: ['banking', 'digital nomad', 'Schwab', 'Wise', 'thailand', 'money', 'expat'],
    heroImage: hero ? heroImageRef(hero) : undefined,
    body: [
      block('I was standing in Bali when the ATM literally swallowed my card.'),
      block("No metaphor. The machine made a greedy little clunk, sucked it in, and that was the last I saw of it. I waited a full minute like an idiot, staring at the screen, willing it to spit it back out. It didn't."),
      block('TD Bank was perfect for Tampa. It was useless in Bali.'),
      block('The replacement card took a month. Thirty days of borrowing money, stressing, and learning an expensive lesson about what "works worldwide" actually means when you\'re on the other side of the planet.'),
      block('I will never do that again.'),
      block("So before I leave for Thailand this time, I set up two simple things in one afternoon. Here's exactly what I did."),
      h2('1. Schwab High Yield Investor Checking'),
      block('This is now my main travel account.'),
      bullet('Zero foreign transaction fees'),
      bullet('Unlimited ATM fee reimbursements everywhere in the world'),
      bullet('No minimums, no nonsense'),
      block('If you only take one thing from this post, make it this. Schwab is the account that actually travels with you.'),
      h2('2. Wise'),
      block("Thailand is going cashless. Starbucks, IKEA, even some KFCs and Subways in Bangkok are card-or-QR only. Without a Thai bank account, you can't join the local payment apps. Wise fixes that. Load Thai Baht onto your Wise debit card at the real exchange rate and you're good to go anywhere cards are accepted. Clean, cheap, and shockingly easy."),
      blockquote('The card in the ATM cost me a month of pain. This setup cost me an afternoon. Worth it.'),
    ],
  };
}

async function buildSorting() {
  const hero = await uploadImage('/mountainofclothes.jpg');

  return {
    slug: 'the-more-i-sort-the-more-appears',
    title: 'The More I Sort, The More Appears',
    publishedAt: '2026-03-24',
    excerpt: 'Every time I clear a surface, something appears on it. On chaos, packing light, and why the fashion blogger fantasy ends the moment you picture your suitcase open on a hostel floor.',
    postType: 'blog',
    featured: false,
    tags: ['packing', 'minimalism', 'decluttering', 'move abroad', 'digital nomad'],
    heroImage: hero ? heroImageRef(hero) : undefined,
    body: [
      block('I have sorted the same pile of clothes three times today.'),
      block("Not because I'm indecisive. Because every time I clear a surface, something appears on it. I have lived in this apartment for years and apparently I have been quietly hoarding things I forgot I owned."),
      block("My brain does not do well with this. I need order to think. Right now my living room looks like a thrift store had a breakdown, and I am somewhere in the middle of it with a garbage bag in one hand and absolutely no plan in the other."),
      block('At some point this afternoon I had a thought that felt reasonable at the time.'),
      block("If I'm going to be traveling, I should look good doing it."),
      block("So I started setting things aside. The good jeans. The going-out tops. The heels I've worn twice but keep because they're perfect. I was building a travel wardrobe in my head and it felt exciting and it felt like a solution to the chaos. It was neither."),
      blockquote("You don't want more options when you're living out of a bag. You want fewer decisions."),
      block("Then I pictured it. The room I'll be staying in. The suitcase open on the floor because there's nowhere else to put it. Every single thing I packed spread across a 10x10 space."),
      block("That's where the fashion blogger fantasy ends."),
      block("The less you pack, the lighter you move. The lighter you move, the more you actually show up for the life you went there to live instead of managing your luggage."),
      block("So the heels went into the donation bag. The good jeans made the cut. Two pairs. That's it."),
      block("I'm not packing light because I have to. I'm packing light because I've already learned what happens when you don't. It shouldn't feel like home. That's the whole point."),
      block('Back to the bags.'),
      block("The mess is part of it. The chaos, the second-guessing, the moment you almost pack the heels anyway — that's not a sign you're doing it wrong. That's what letting go actually looks like. Nobody's leap is clean. Mine certainly isn't."),
      block("But you sort another pile. You make another decision. And slowly, the life you're leaving gets lighter."),
      block('So does everything else.'),
    ],
  };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const posts = [
  { label: 'wet-wipes',  build: buildWetWipes  },
  { label: 'ending',     build: buildEnding     },
  { label: 'doubt',      build: buildDoubt      },
  { label: 'day-zero',   build: buildDayZero    },
  { label: '60-day',     build: buildSixtyDay   },
  { label: 'banking',    build: buildBanking    },
  { label: 'sorting',    build: buildSorting    },
];

console.log('🚀 Migrating posts to Sanity CMS...\n');

let created = 0;
let skipped = 0;

for (const { label, build } of posts) {
  console.log(`── ${label}`);

  const data = await build();

  if (await slugExists(data.slug)) {
    console.log(`  ⏭  Already exists — skipping\n`);
    skipped++;
    continue;
  }

  const doc = {
    _type: 'post',
    title: data.title,
    slug: { _type: 'slug', current: data.slug },
    postType: data.postType,
    excerpt: data.excerpt,
    publishedAt: data.publishedAt,
    featured: data.featured,
    tags: data.tags,
    body: data.body,
    ...(data.heroImage ? { heroImage: data.heroImage } : {}),
  };

  const result = await client.create(doc);
  console.log(`  ✓ Created: ${result._id}\n`);
  created++;
}

console.log(`\n✅ Done — ${created} created, ${skipped} skipped.\n`);

if (created > 0) {
  console.log('Next steps:');
  console.log('  1. Open Studio and verify the migrated posts look correct:');
  console.log('     https://zvvdrylu.sanity.studio/');
  console.log('  2. The "60-day" post is missing its interactive table and email form.');
  console.log('     Decide: add a custom Sanity block type, or keep that post in data/posts.tsx.');
  console.log('  3. Once satisfied, remove migrated posts from data/posts.tsx.');
  console.log('  4. Add tags in Studio for each post (SEO keywords already set above).');
}
