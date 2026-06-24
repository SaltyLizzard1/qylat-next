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
        className="inline-block text-lg font-semibold px-8 py-4 rounded-full transition-all hover:scale-[1.03] active:scale-[0.98] shadow-lg"
        style={{
          background: 'linear-gradient(135deg, #8B6914 0%, #E8C84A 35%, #F5E070 55%, #C9A030 75%, #8B6914 100%)',
          color: '#2D1A00',
          border: '1.5px solid #7A5C0A',
        }}
      >
        Work With Me
      </a>
    </div>
  );
}

export const posts: Post[] = [
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
];
