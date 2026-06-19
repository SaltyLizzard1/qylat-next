'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Props = {
  className?: string;
  variant?: 'light' | 'dark';
};

type Status = 'idle' | 'loading' | 'error';

export default function NewsletterSignup({ className = '', variant = 'light' }: Props) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const router = useRouter();

  const isDark = variant === 'dark';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const res = await fetch(
        `https://api.kit.com/v4/forms/${process.env.NEXT_PUBLIC_KIT_FORM_ID}/subscribers`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Kit-Api-Key': process.env.NEXT_PUBLIC_KIT_API_KEY!,
          },
          body: JSON.stringify({ email_address: email }),
        }
      );

      if (!res.ok) throw new Error('Subscribe failed');
      router.push('/thank-you');
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className={className} id={isDark ? 'newsletter' : undefined}>
      <h4 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-emerald-900'}`}>
        Join the Newsletter
      </h4>
      <p className={`mb-4 leading-relaxed ${isDark ? 'text-emerald-100' : 'text-gray-600'}`}>
        Get weekly inspiration, practical tips, and the courage to take the leap.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          disabled={status === 'loading'}
          className={
            isDark
              ? 'flex-1 min-w-0 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-60'
              : 'flex-1 min-w-0 px-4 py-3 rounded-lg text-gray-900 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-60'
          }
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="px-6 py-3 bg-orange-500 hover:bg-orange-600 rounded-lg font-semibold text-white transition-colors shrink-0 disabled:opacity-60"
        >
          {status === 'loading' ? 'Subscribing…' : 'Subscribe'}
        </button>
      </form>

      {status === 'error' && (
        <p className="mt-2 text-sm text-red-500">Something went wrong — please try again.</p>
      )}
    </div>
  );
}
