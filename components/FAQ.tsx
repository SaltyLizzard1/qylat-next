'use client';

import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { VISIBLE_FAQS, type Faq, type FaqSegment } from '../data/faqs';

const goldGradient =
  'linear-gradient(135deg, #8B6914 0%, #E8C84A 35%, #F5E070 55%, #C9A030 75%, #8B6914 100%)';

const linkClass = 'font-semibold underline underline-offset-4 hover:opacity-70 transition';

function AnswerSegment({ segment }: { segment: FaqSegment }) {
  if (typeof segment === 'string') return <>{segment}</>;
  if (segment.external) {
    return (
      <a href={segment.href} target="_blank" rel="noopener noreferrer" className={linkClass} style={{ color: '#8B6914' }}>
        {segment.label}
      </a>
    );
  }
  return (
    <a href={segment.href} className={linkClass} style={{ color: '#8B6914' }}>
      {segment.label}
    </a>
  );
}

function FaqRow({ item, isOpen, onToggle }: { item: Faq; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border-b" style={{ borderColor: 'rgba(139,105,20,0.25)' }}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="w-full flex items-center justify-between gap-4 py-3.5 text-left transition-colors"
      >
        <span className="text-lg font-semibold" style={{ color: '#2D1A00' }}>
          {item.question}
        </span>
        <span
          className="flex items-center justify-center w-8 h-8 rounded-full shrink-0"
          style={{ background: 'rgba(139,105,20,0.10)', border: '1px solid rgba(139,105,20,0.30)' }}
        >
          {isOpen ? (
            <Minus className="w-4 h-4" style={{ color: '#8B6914' }} />
          ) : (
            <Plus className="w-4 h-4" style={{ color: '#8B6914' }} />
          )}
        </span>
      </button>
      {isOpen && (
        <p className="pb-4 -mt-1 text-base leading-relaxed" style={{ color: '#3A281A' }}>
          {item.answer.map((segment, index) => (
            <AnswerSegment key={index} segment={segment} />
          ))}
        </p>
      )}
    </div>
  );
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section
      id="faq"
      className="relative overflow-hidden pt-6 pb-12 md:pb-14 px-6"
      style={{ background: '#EBF0E6' }}
    >
      <div
        className="pointer-events-none absolute -top-32 -right-32 w-80 h-80 rounded-full opacity-[0.10] hidden md:block"
        style={{ background: goldGradient }}
      />
      <div
        className="pointer-events-none absolute -bottom-24 -left-24 w-60 h-60 rounded-full opacity-[0.08] hidden md:block"
        style={{ background: goldGradient }}
      />

      <div className="relative max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <span
            className="inline-block font-sans text-xs font-bold uppercase tracking-[0.2em] px-4 py-1.5 rounded-full mb-5"
            style={{
              background: 'rgba(139,105,20,0.12)',
              color: '#8B6914',
              border: '1px solid rgba(139,105,20,0.30)',
            }}
          >
            FAQ
          </span>
          <h2
            className="font-cormorant font-bold leading-tight"
            style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', color: '#2D1A00' }}
          >
            Frequently Asked Questions
          </h2>
        </div>

        <div>
          {VISIBLE_FAQS.map((item, index) => (
            <FaqRow
              key={item.question}
              item={item}
              isOpen={openIndex === index}
              onToggle={() => setOpenIndex(openIndex === index ? null : index)}
            />
          ))}
        </div>

        <p className="mt-6 text-center text-sm" style={{ color: 'rgba(58,40,26,0.7)' }}>
          More questions?{' '}
          <a
            href="mailto:liz@quityourlifeandtravel.com"
            className="underline underline-offset-4 hover:opacity-70 transition"
            style={{ color: '#8B6914' }}
          >
            Ask me directly.
          </a>
        </p>
      </div>
    </section>
  );
}
