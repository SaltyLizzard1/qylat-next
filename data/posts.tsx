import React, { useEffect, useRef, useState } from 'react';
import { images } from '../config/images';

export interface Post {
  id: number;
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  image: string | undefined;
  postType?: 'blog' | 'discussion' | 'photo-essay';
  /**
   * CSS `object-position` for the Leap Log card and modal hero.
   * Examples: `"center 30%"`, `"52% center"`. Omit to use per-image defaults.
   */
  heroPosition?: string;
  /** `object-fit` for card and modal heroes. Defaults to `cover`. */
  heroFit?: 'cover' | 'contain';
  /** Shown on cards and in the post modal after the date (e.g. "3 min read"). */
  readTime?: string;
  content?: (options?: { onTakeLeapClick?: () => void }) => React.JSX.Element;
  /**
   * Sanity Portable Text body. Present on posts sourced from Sanity.io.
   * Used as a fallback when `content` is not provided.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body?: any[];
}

function KitForm() {
  const embedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = embedRef.current;
    if (!host) return;
    host.innerHTML = '';

    const script = document.createElement('script');
    script.async = true;
    script.dataset.uid = 'afc2a0b2d2';
    script.src = 'https://quit-your-life-and-travel.kit.com/afc2a0b2d2/index.js';
    host.appendChild(script);

    return () => {
      host.innerHTML = '';
    };
  }, []);

  return <div ref={embedRef} className="min-h-[120px]" />;
}

function SixtyDayPlanDownloadSection() {
  return (
    <div className="bg-emerald-50 rounded-xl p-6 border-l-4 border-emerald-600 not-prose my-8">
      <p className="font-semibold text-emerald-900 text-lg mb-2">
        Want the exact 60-day plan I&apos;m using right now?
      </p>
      <p className="text-gray-600 mb-4">
        I built a simple spreadsheet that tracks every task from first sort to final keys - packing,
        visa, banking, logistics, all of it. I&apos;m giving it away free. Drop your email below and
        I&apos;ll send it straight to you. No spam, no fluff - just the tool I&apos;m actually
        following every day.
      </p>
      <KitForm />
    </div>
  );
}

function SixtyDayPlanTableCollapsible() {
  const [isOpen, setIsOpen] = useState(false);

  const planRows = [
    ['1', 'Planning', 'Create master inventory of all items', 'High'],
    ['2', 'Planning', 'Verify passport validity (must be 6+ months)', 'High'],
    ['3', 'Planning', 'Research Thailand visa types (DTV, Tourist, LTR)', 'High'],
    ['5', 'Planning', 'Sort items into Keep, Sell, and Donate', 'Medium'],
    ['8', 'Logistics', 'Photograph large furniture and electronics', 'High'],
    ['10', 'Logistics', 'List items on Facebook Marketplace', 'Medium'],
    ['20', 'Logistics', 'Open travel-friendly bank account (Wise or Schwab)', 'High'],
    ['22', 'Logistics', 'Port phone number to Google Voice', 'High'],
    ['25', 'Logistics', 'Book one-way flight to Thailand', 'High'],
    ['26', 'Logistics', 'Book initial 14-day accommodation', 'Medium'],
    ['28', 'Logistics', 'Verify 2FA on all banking apps', 'High'],
    ['30', 'Logistics', 'Apply for Thailand Visa via E-Visa portal', 'High'],
    ['12', 'Execution', 'Box up books, decor, and non-essentials', 'Low'],
    ['15', 'Execution', 'Sort kitchen down to one essential set', 'Medium'],
    ['35', 'Execution', 'Pack seasonal clothing and extra linens', 'Medium'],
    ['40', 'Execution', 'Schedule dental and medical checkups', 'Medium'],
    ['45', 'Execution', 'Arrange international shipping or extra baggage', 'High'],
    ['50', 'Final', 'Pack majority of wardrobe', 'High'],
    ['53', 'Final', 'Schedule cancellation of cable, internet, electricity', 'High'],
    ['55', 'Final', 'Pack remaining kitchen and living room items', 'High'],
    ['57', 'Final', 'Deep clean and complete final repairs', 'Medium'],
    ['59', 'Final', 'Confirm airport transfer and print all documents', 'High'],
    ['60', 'Final', 'Move out, return keys, depart for Thailand', 'High'],
  ] as const;

  return (
    <div className="not-prose my-6">
      {!isOpen ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="inline-flex cursor-pointer items-center rounded-lg bg-emerald-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-900"
        >
          View Full 60-Day Breakdown
        </button>
      ) : (
        <div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="inline-flex cursor-pointer items-center rounded-lg bg-emerald-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-900"
          >
            Hide Full 60-Day Breakdown
          </button>
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-emerald-800 text-white">
                  <th className="px-4 py-3 text-left font-semibold">Day</th>
                  <th className="px-4 py-3 text-left font-semibold">Phase</th>
                  <th className="px-4 py-3 text-left font-semibold">Task</th>
                  <th className="px-4 py-3 text-left font-semibold">Priority</th>
                </tr>
              </thead>
              <tbody>
                {planRows.map(([day, phase, task, priority], index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-3 font-medium text-emerald-800">{day}</td>
                    <td className="px-4 py-3 text-gray-600">{phase}</td>
                    <td className="px-4 py-3 text-gray-800">{task}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          priority === 'High'
                            ? 'bg-orange-100 text-orange-700'
                            : priority === 'Medium'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {priority}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function PostContent({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-none">
      <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
        {children}
      </div>
    </div>
  );
}

function handleTakeLeapCTA(
  event: React.MouseEvent<HTMLAnchorElement>,
  onTakeLeapClick?: () => void
) {
  event.preventDefault();
  onTakeLeapClick?.();
  requestAnimationFrame(() => {
    const workWithMeSection = document.getElementById('work-with-me');
    if (workWithMeSection) {
      workWithMeSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
}

function WorkWithMeCTA({ onTakeLeapClick }: { onTakeLeapClick?: () => void }) {
  return (
    <div className="mt-12 text-center">
      <p className="text-2xl md:text-3xl font-extrabold text-emerald-900 tracking-tight mb-6">
        Ready to take the leap?
      </p>
      <a
        href="#work-with-me"
        onClick={(event) => handleTakeLeapCTA(event, onTakeLeapClick)}
        className="inline-block bg-orange-500 hover:bg-orange-600 text-white text-lg font-semibold px-8 py-4 rounded-full transition-all transform hover:scale-105 shadow-lg"
      >
        Work With Me
      </a>
    </div>
  );
}


/** Slug for "Day 0: The Decision to Leap" — used for ordering / deep links */
export const DAY_ZERO_SLUG = 'day-0-the-decision-to-leap';

export const posts: Post[] = [
  {
    id: 8,
    slug: 'never-leave-home-without-wet-wipes',
    title: '#1 Travel Tip: NEVER Leave Home Without Wet Wipes',
    date: 'May 24, 2026',
    readTime: '3 min read',
    excerpt:
      'Three countries. Three bathrooms. Three versions of "figure it out." And in every single one, a pack of wet wipes would have changed my life.',
    image: images.wetWipes,
    heroFit: 'contain',
    content: ({ onTakeLeapClick } = {}) => (
      <PostContent>
        <figure className="not-prose mb-8 -mt-2">
          <img
            src="/images/bathroom-travel-tip.jpg"
            alt="Bathroom travel tip"
            className="rounded-xl max-w-sm w-full mx-auto block"
            loading="eager"
          />
        </figure>

        <p>I was in the middle of a night market in Taiwan when it hit.</p>
        <p>Not inspiration. Not culture shock. The street food.</p>
        <p>
          My stomach made a decision before my brain could weigh in. I found the nearest public
          bathroom, pushed open the door, and saw it. A hole in the ground. No toilet paper. No bum
          gun. No nothing.
        </p>
        <p>Just me and a squat toilet in a crowded night market with zero negotiating power.</p>
        <p>
          I had wet wipes which I had left back at the hotel, because we &quot;weren&apos;t going to
          be gone long.&quot;
        </p>
        <p>I went home immediately and showered.</p>
        <p>
          Then there was Thailand. Different country, different surprise. I walked into the bathroom
          and found two buckets of water with plastic scoops sitting next to the toilet. No flush
          handle. No paper. No instructions.
        </p>

        <blockquote className="border-l-4 border-orange-500 pl-5 py-1 my-8 not-prose">
          <p className="text-xl italic text-gray-800">
            I stood there like I was solving a puzzle with no picture on the box.
          </p>
        </blockquote>

        <p>
          Bali? Another hole in the ground. At this point I wasn&apos;t even surprised. Just
          disappointed in myself for still not having wet wipes in my bag.
        </p>
        <p>
          Three countries. Three bathrooms. Three versions of &quot;figure it out.&quot; And in every
          single one, a pack of wet wipes would have changed my life.
        </p>

        <p className="font-bold text-gray-900 mt-8 mb-2">Then I Saw This Sign</p>

        <figure className="not-prose my-6">
          <img
            src="/images/the-other-normal.jpg"
            alt="Do not stand on toilet sign"
            className="rounded-xl max-w-sm w-full mx-auto block"
            loading="lazy"
          />
        </figure>

        <p>Do not stand on toilet. In English and Mandarin. With diagrams.</p>
        <p>
          That is when it hit me. I was confused by their bathrooms. They are confused by ours. The
          squat toilet is the default for most of the world. The Western toilet is the foreign one.
          Nobody teaches any of us how the other side works.
        </p>
        <p>So here is what I wish someone had told me before I stood there clueless.</p>

        <p className="font-bold text-gray-900 mt-8 mb-2">The Bum Gun</p>
        <p>
          That small sprayer mounted on the wall next to the toilet. It looks like a kitchen sink
          sprayer and it works the same way. Stay seated. Point it where it needs to go. Squeeze the
          handle gently. The pressure is stronger than you expect, so start light. Pat dry with toilet
          paper or wet wipes if available. That is it. Once you get past the initial shock of cold
          water, it is actually cleaner than paper alone.
        </p>

        <p className="font-bold text-gray-900 mt-8 mb-2">The Bucket and Scoop</p>
        <p>
          This is the manual version of a flush. The bucket holds clean water. The small scoop or
          bowl is for two things. First, use it to pour water for personal cleaning, the same job as
          the bum gun but by hand. Second, when you are done, scoop water from the bucket and pour it
          directly into the toilet bowl to flush. Two or three scoops usually does it. Do not dump the
          entire bucket. Other people need it too.
        </p>

        <p className="font-bold text-gray-900 mt-8 mb-2">The Squat Toilet</p>
        <p>
          Face the hood or raised end of the toilet. Plant your feet on the textured footpads on
          either side. Squat all the way down. That is the position. If there is a bum gun, use it.
          If there is a bucket and scoop, use that. If there is neither, this is where your wet wipes
          save your life. Do not put them in the toilet. Most plumbing in Southeast Asia cannot handle
          it. Use the bin next to the toilet.
        </p>

        <blockquote className="border-l-4 border-orange-500 pl-5 py-1 my-8 not-prose">
          <p className="text-xl italic text-gray-800">
            These systems are not broken. They are not primitive. You are just the visitor who never
            learned how they work.
          </p>
        </blockquote>

        <p>So here it is. The number one travel tip nobody puts in the guidebook.</p>
        <p>
          Never leave home without wet wipes. Not the hotel. Not the restaurant. Not the night
          market. Nowhere.
        </p>
        <p>
          But also learn the local bathroom before you need it. Your stomach does not care about your
          plans. And neither does the plumbing.
        </p>

        <WorkWithMeCTA onTakeLeapClick={onTakeLeapClick} />
      </PostContent>
    ),
  },
  {
    id: 7,
    slug: 'the-ending-never-goes-as-planned',
    title: 'The Ending Never Goes As Planned',
    date: 'May 17, 2026',
    excerpt:
      'I had a version of how this would go. None of it went that way.',
    image: process.env.NEXT_PUBLIC_IMG_ENDING,
    heroFit: 'contain',
    heroPosition: '52% center',
    content: () => (
      <PostContent>
        <p>I had a version of how this would go.</p>
        <p>
          The last day would feel earned. The people I&apos;d worked alongside would gather, maybe not
          formally, but in the way that matters. A moment of acknowledgment. A proper goodbye. The
          customers I&apos;d spent years building relationships with would know I was leaving. There
          would be closure.
        </p>
        <p>None of it went that way.</p>

        <p className="font-bold text-gray-900 mt-8 mb-2">The Ending We Write In Our Heads</p>
        <p>
          When you decide to make a major life change, quit your life, buy the ticket, commit to the
          leap, you spend a lot of time thinking about what&apos;s ahead.
        </p>
        <p>
          What you don&apos;t expect is how much energy you&apos;ll spend on the ending.
        </p>
        <p>
          We write it in our heads without realising we&apos;re doing it. The farewell that feels
          proportionate to the time invested. The people who show up. The clean exit that honours what
          was, while making space for what&apos;s coming.
        </p>
        <p>It&apos;s a good story. We just rarely get to live it.</p>

        <p className="font-bold text-gray-900 mt-8 mb-2">What Actually Happens</p>
        <p>
          The ending gets taken from you in ways you didn&apos;t anticipate. Not dramatically. Not all
          at once. But in small specific ways that add up.
        </p>
        <p>
          The goodbye you planned doesn&apos;t happen. The people you expected aren&apos;t there. The
          closure you needed doesn&apos;t arrive on schedule.
        </p>
        <p>
          And you&apos;re left standing at the departure point with a messier ending than you wrote, and
          a plane to catch anyway.
        </p>

        <p className="font-bold text-gray-900 mt-8 mb-2">What Nobody Tells You</p>
        <p>Here&apos;s what I&apos;ve learned about leaving.</p>

        <blockquote className="border-l-4 border-orange-500 pl-5 py-1 my-8 not-prose">
          <p className="text-xl italic text-gray-800">
            The ending is not yours to control. Only the direction is.
          </p>
        </blockquote>

        <p>
          You can plan the destination. You can prepare for the journey. But the ending, the last
          chapter of the life you&apos;re leaving, gets written by circumstances, by other
          people&apos;s choices, by timing, by chaos you didn&apos;t invite.
        </p>
        <p>
          The people I counted on shifted. That&apos;s the part nobody warns you about.
        </p>
        <p>
          But in the spaces left by all of that, something else arrived.
        </p>
        <p>
          Consistency in an inconsistent time. Unexpected anchors in unexpected places. The reminder
          that solid ground shows up where you least expect it when the ground you planned on shifts.
        </p>
        <p>I&apos;m writing this before I get on the plane.</p>
        <p>
          The ending didn&apos;t go as planned. The universe filters. Not always kindly. But
          accurately.
        </p>
        <p>I&apos;m going anyway.</p>
        <p>
          Not because it doesn&apos;t hurt. Not because the messy ending doesn&apos;t matter. But
          because waiting for the clean exit, the earned goodbye, the full support, the tidy closure,
          means waiting forever.
        </p>
        <p>The ending never goes as planned.</p>
        <p>Go anyway.</p>

        <div className="bg-gradient-to-br from-emerald-50 to-orange-50 rounded-2xl p-8 mt-12 border border-emerald-200 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-emerald-700 mb-2">
            Launch Pricing &mdash; Only 3 Spots
          </p>
          <p className="text-2xl md:text-3xl font-bold text-emerald-900 mb-3">
            Turn &quot;go anyway&quot; into a real plan.
          </p>
          <p className="text-gray-600 max-w-xl mx-auto mb-6">
            IdeaToPlan builds you a real business plan based on your actual idea,
            market, and goals. Not a template. Not generic filler. A plan you can
            move on.
          </p>
          <a
            href="#idea-to-plan"
            onClick={(e) => {
              e.preventDefault();
              window.history.replaceState(null, '', '/');
              document.body.style.overflow = '';
              requestAnimationFrame(() => {
                document.getElementById('idea-to-plan')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              });
            }}
            className="inline-block bg-orange-500 hover:bg-orange-600 text-white text-lg font-semibold px-8 py-4 rounded-full transition-all transform hover:scale-105 shadow-lg"
          >
            Get Your Plan &mdash; $149 Early Rate
          </a>
          <p className="text-xs text-gray-400 mt-3">
            Standard pricing starts at $199 after the first three customers.
          </p>
        </div>
      </PostContent>
    ),
  },
  {
    id: 6,
    slug: 'decision-made-doubt-showed-up',
    title: 'The Decision Is Made. The Doubt Showed Up Anyway.',
    date: 'March 28, 2026',
    readTime: '3 min read',
    excerpt:
      'I already decided. The doubt showed up anyway. On losing the safety net you never planned to use, and why forward is the only option left.',
    image: '/Blog/edge-post-hero.jpg',
    heroPosition: 'center 30%',
    content: ({ onTakeLeapClick } = {}) => (
      <PostContent>
        <p>I already decided. That part is done.</p>
        <p>But today the doubt showed up anyway. Loud, uninvited, and carrying receipts.</p>
        <p>The thing that really hit today was the safety net.</p>
        <p>It is gone.</p>
        <p>
          There was a job. Something I could have quietly gone back to if this all fell apart. A door I
          never planned to walk through again, but one I knew was there. Today it closed. Not by my
          choice. And losing something you never intended to use still hurts more than you expect it to.
        </p>
        <p>For a few hours this morning, I let myself feel all of it.</p>
        <p>
          Not into changing my mind. Just into the weight of how real this has become.
        </p>

        <blockquote className="border-l-4 border-orange-500 pl-5 py-1 my-8 not-prose">
          <p className="text-xl italic text-gray-800">
            The question isn&apos;t what happens if you fail. It&apos;s what happens if you don&apos;t
            try.
          </p>
        </blockquote>

        <p>
          I heard that at the gym today. My AI podcast cut out mid-episode and a motivation speech took
          over. I almost skipped it. I didn&apos;t.
        </p>
        <p>I sat with the question.</p>
        <p>What happens if I don&apos;t try?</p>
        <p>What does staying look like.</p>
        <p>
          Another year of the same ceiling, the same routine, the same version of myself I have already
          outgrown?
        </p>
        <p>I felt the answer before I could think it.</p>
        <p>Unbearable.</p>
        <p>That is why I decided in the first place. Today just reminded me.</p>
        <p>
          There is no backup plan now. There is only forward. And honestly, that kind of clarity, as
          terrifying as it is, has a way of cutting through the noise faster than anything else.
        </p>
        <p>
          Doubt is not a sign you are making the wrong choice. It is a sign the choice is real. Small
          decisions don&apos;t come with this much weight.
        </p>
        <p>
          If you are reading this with your own decision already made, the one you keep
          second-guessing, the one that feels impossibly heavy some days, this feeling is part of it.
        </p>
        <p>It doesn&apos;t mean stop. It means you are close.</p>
        <p>Keep going.</p>

        <WorkWithMeCTA onTakeLeapClick={onTakeLeapClick} />
      </PostContent>
    ),
  },
  {
    id: 1,
    slug: DAY_ZERO_SLUG,
    title: 'Day 0: The Decision to Leap',
    date: 'February 2, 2026',
    excerpt:
      'Not a highlight reel. The real one. From autopilot in Florida to a one-way ticket to Thailand — and what happened when the world hit pause.',
    image: process.env.NEXT_PUBLIC_IMG_DAY0,
    content: ({ onTakeLeapClick } = {}) => (
      <PostContent>
        <figure className="not-prose mb-8 -mt-2">
          <img
            src="/images/quit-your-life-and-travel.jpg"
            alt="51% of U.S. employees have cried at the office — news headline"
            className="rounded-xl max-w-sm w-full mx-auto block"
            loading="eager"
          />
        </figure>

        <p className="text-sm text-emerald-700 uppercase tracking-widest font-sans mb-6">
          Not a highlight reel. The real one.
        </p>

        <p>In 2018, I quit my corporate job and bought a one-way ticket to Thailand — just to test the waters.</p>
        <p>Before that, I was living on autopilot.</p>
        <p>Every day looked the same. Staring out the office window. Going through the motions. Doing everything I was supposed to do. Feeling nothing.</p>
        <p>The monotony wasn&apos;t just uncomfortable. It was unbearable.</p>
        <p>So I did the terrifying thing: left the comfort of a steady paycheck behind.</p>

        <blockquote className="border-l-4 border-orange-500 pl-5 py-1 my-8 not-prose">
          <p className="text-xl italic text-gray-800">The second leap is harder. You know exactly what you&apos;re risking. You go anyway.</p>
        </blockquote>

        <p>The freedom. The new rhythm. The feeling of being truly alive. It confirmed everything I&apos;d suspected. Humans weren&apos;t built to spend their lives in cubicles.</p>
        <p>So I came back and sold everything. Ready to make it permanent.</p>
        <p>Then the world shut down. A legal situation I had no control over kept me locked in place for five years. Less money. Less certainty. More fear.</p>
        <p>And still. Here I am. Going anyway.</p>
        <p>Now I&apos;m jumping again. Different job. Same massive fear. No more waiting.</p>
        <p>Quit Your Life and Travel is the story of refusing to let fear write the ending.</p>
        <p>If you&apos;ve been staring out your own window. Waiting for the right time. Waiting for permission. Waiting for the fear to go away.</p>
        <p>Fear doesn&apos;t go away. You just stop letting it drive.</p>
        <p>Welcome to the leap. I&apos;m glad you&apos;re here.</p>

        <WorkWithMeCTA onTakeLeapClick={onTakeLeapClick} />
      </PostContent>
    ),
  },
  {
    id: 3,
    slug: 'how-to-move-to-thailand-in-60-days',
    title: 'How to Move to Thailand in 60 Days',
    date: 'March 15, 2026',
    excerpt:
      "The second leap is harder than the first. Here's the exact 60-day plan I'm following - packing, visa, banking, and every task from first sort to final keys.",
    image: images.sixtyDay,
    content: ({ onTakeLeapClick } = {}) => (
      <PostContent>
        <p>The first time I did this, it was easier. Not because it wasn&apos;t scary. It was terrifying. But I hadn&apos;t lost anything yet. I just knew I was done with the life I had and ready for something different.</p>
        <p>So I left. Tested the waters. Bought a one-way ticket to Thailand and felt, for the first time in years, completely alive.</p>
        <p>It confirmed everything I suspected. This was the life I was supposed to be living.</p>
        <p>So I came home, sold everything, and prepared to make it permanent.</p>
        <p>Then the world had other plans.</p>
        <p>COVID shut everything down. A legal situation I had no control over kept me locked in place for years. Five years of watching the dream sit on pause. Five years of rebuilding from scratch. Less money. Less certainty. More fear.</p>
        <p>And still. Here I am. Going anyway.</p>
        <p>If you&apos;re reading this waiting for the perfect moment, the right amount of money, the right circumstances - I need you to understand something.</p>
        <blockquote className="border-l-4 border-orange-500 pl-5 py-1 my-8 not-prose">
          <p className="text-xl italic text-gray-800">There is no perfect moment. There is only the decision.</p>
        </blockquote>
        <p>This is mine. Again. Here&apos;s exactly how I&apos;m doing it.</p>
        <SixtyDayPlanDownloadSection />
        <SixtyDayPlanTableCollapsible />
        <p>Five years taught me what actually matters. I rebuilt. I came back stronger.</p>
        <p>And I would do every single bit of it again to get back to that feeling of being truly alive.</p>
        <WorkWithMeCTA onTakeLeapClick={onTakeLeapClick} />
      </PostContent>
    ),
  },
  {
    id: 5,
    slug: 'international-banking-digital-nomads-expats',
    title: 'International Banking for Digital Nomads and Expats — What I Set Up Before I Left',
    date: 'March 18, 2026',
    excerpt:
      'TD Bank was perfect for Tampa. It was useless in Bali. The replacement card took a month. Here is what I set up differently this time.',
    image: images.baliAtm,
    content: ({ onTakeLeapClick } = {}) => (
      <PostContent>
        <p className="text-sm text-emerald-700 uppercase tracking-widest font-sans mb-6">
          What I learned about money the hard way and what I&apos;m doing differently this time.
        </p>

        <p>I was standing in Bali when the ATM literally swallowed my card.</p>

        <p>
          No metaphor. The machine made a greedy little clunk, sucked it in, and that was the last I
          saw of it. I waited a full minute like an idiot, staring at the screen, willing it to spit it
          back out. It didn&apos;t.
        </p>

        <p>TD Bank was perfect for Tampa. It was useless in Bali.</p>

        <p>
          The replacement card took a month. Thirty days of borrowing money, stressing, and learning an
          expensive lesson about what &quot;works worldwide&quot; actually means when you&apos;re on
          the other side of the planet.
        </p>

        <p>I will never do that again.</p>

        <p>
          So before I leave for Thailand this time, I set up two simple things in one afternoon.
          Here&apos;s exactly what I did.
        </p>

        <h2 className="text-lg font-semibold text-emerald-900 mt-8 mb-2">
          1. Schwab High Yield Investor Checking
        </h2>
        <p>This is now my main travel account.</p>
        <ul className="list-disc pl-5 text-gray-700 space-y-1 mb-4">
          <li>Zero foreign transaction fees</li>
          <li>Unlimited ATM fee reimbursements everywhere in the world</li>
          <li>No minimums, no nonsense</li>
        </ul>
        <p>If you only take one thing from this post, make it this. Schwab is the account that actually travels with you.</p>

        <h2 className="text-lg font-semibold text-emerald-900 mt-8 mb-2">2. Wise</h2>
        <p>
          Thailand is going cashless. Starbucks, IKEA, even some KFCs and Subways in Bangkok are
          card-or-QR only. Without a Thai bank account, you can&apos;t join the local payment apps. Wise
          fixes that. Load Thai Baht onto your Wise debit card at the real exchange rate and you&apos;re
          good to go anywhere cards are accepted. Clean, cheap, and shockingly easy.
        </p>

        <blockquote className="border-l-4 border-orange-500 pl-5 py-1 my-8 not-prose">
          <p className="text-xl italic text-gray-800">
            The card in the ATM cost me a month of pain. This setup cost me an afternoon. Worth it.
          </p>
        </blockquote>

        <WorkWithMeCTA onTakeLeapClick={onTakeLeapClick} />
      </PostContent>
    ),
  },
  {
    id: 4,
    slug: 'the-more-i-sort-the-more-appears',
    title: 'The More I Sort, The More Appears',
    date: 'March 24, 2026',
    excerpt:
      'Every time I clear a surface, something appears on it. On chaos, packing light, and why the fashion blogger fantasy ends the moment you picture your suitcase open on a hostel floor.',
    image: process.env.NEXT_PUBLIC_IMG_SORTING,
    content: ({ onTakeLeapClick } = {}) => (
      <PostContent>
        <p className="text-sm text-emerald-700 uppercase tracking-widest font-sans mb-6">
          Why I&apos;m not packing like a fashion blogger.
        </p>

        <p>I have sorted the same pile of clothes three times today.</p>
        <p>
          Not because I&apos;m indecisive. Because every time I clear a surface, something appears on
          it. I have lived in this apartment for years and apparently I have been quietly hoarding
          things I forgot I owned.
        </p>
        <p>
          My brain does not do well with this. I need order to think. Right now my living room looks
          like a thrift store had a breakdown, and I am somewhere in the middle of it with a garbage
          bag in one hand and absolutely no plan in the other.
        </p>
        <p>At some point this afternoon I had a thought that felt reasonable at the time.</p>
        <p>
          <em>If I&apos;m going to be traveling, I should look good doing it.</em>
        </p>
        <p>
          So I started setting things aside. The good jeans. The going-out tops. The heels I&apos;ve
          worn twice but keep because they&apos;re perfect. I was building a travel wardrobe in my head
          and it felt exciting and it felt like a solution to the chaos. It was neither.
        </p>

        <blockquote className="border-l-4 border-orange-500 pl-5 py-1 my-8 not-prose">
          <p className="text-xl italic text-gray-800">
            You don&apos;t want more options when you&apos;re living out of a bag. You want fewer
            decisions.
          </p>
        </blockquote>

        <p>
          Then I pictured it. The room I&apos;ll be staying in. The suitcase open on the floor because
          there&apos;s nowhere else to put it. Every single thing I packed spread across a 10x10 space.
        </p>
        <p>That&apos;s where the fashion blogger fantasy ends.</p>
        <p>
          The less you pack, the lighter you move. The lighter you move, the more you actually show up
          for the life you went there to live instead of managing your luggage.
        </p>
        <p>
          So the heels went into the donation bag. The good jeans made the cut. Two pairs.
          That&apos;s it.
        </p>
        <p>
          I&apos;m not packing light because I have to. I&apos;m packing light because I&apos;ve already
          learned what happens when you don&apos;t. It shouldn&apos;t feel like home. That&apos;s the
          whole point.
        </p>
        <p>
          <em>Back to the bags.</em>
        </p>
        <p>
          The mess is part of it. The chaos, the second-guessing, the moment you almost pack the heels
          anyway — that&apos;s not a sign you&apos;re doing it wrong. That&apos;s what letting go
          actually looks like. Nobody&apos;s leap is clean. Mine certainly isn&apos;t.
        </p>
        <p>
          But you sort another pile. You make another decision. And slowly, the life you&apos;re
          leaving gets lighter.
        </p>
        <p>So does everything else.</p>

        <WorkWithMeCTA onTakeLeapClick={onTakeLeapClick} />
      </PostContent>
    ),
  },
];
