'use client';

import { useState } from 'react';

export default function LeadMagnet() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch(
        'https://app.kit.com/forms/afc2a0b2d2/subscriptions',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email_address: email }),
        }
      );
      if (res.ok) {
        setStatus('success');
        setEmail('');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <section
      id="lead-magnet"
      className="bg-[#2D5016] py-5 px-6"
    >
      <div className="max-w-3xl mx-auto">
        {status === 'success' ? (
          <p
            className="text-center"
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontWeight: 700,
              fontSize: '1.2rem',
              color: '#E8C84A',
            }}
          >
            Check your inbox — your 60-Day Leap Kit is on its way.
          </p>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row items-center gap-3"
          >
            <p
              className="text-white/90 whitespace-nowrap shrink-0"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1rem' }}
            >
              Not sure where to start? Grab the free 60-Day Leap Kit
            </p>
            <input
              type="email"
              required
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 w-full px-4 py-2 rounded-full bg-white/15 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#E8C84A] text-sm"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="rounded-full px-6 py-2 text-sm font-semibold transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] whitespace-nowrap shrink-0"
              style={{
                background: 'linear-gradient(135deg, #8B6914 0%, #E8C84A 35%, #F5E070 55%, #C9A030 75%, #8B6914 100%)',
                color: '#2D1A00',
                border: '1.5px solid #7A5C0A',
                boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
              }}
            >
              {status === 'loading' ? 'Sending…' : 'Show Me How'}
            </button>
          </form>
        )}
        {status === 'error' && (
          <p className="text-red-300 text-xs mt-2 text-center">
            Something went wrong. Please try again.
          </p>
        )}
      </div>
    </section>
  );
}
