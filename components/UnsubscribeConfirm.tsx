'use client';

import { useState } from 'react';

// The visitor confirms with a click instead of the page unsubscribing on load,
// so a mail scanner that follows the link cannot unsubscribe anyone.
export default function UnsubscribeConfirm({ token }: { token: string }) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');

  if (!token) {
    return (
      <p style={{ color: '#3A281A' }}>
        This link is missing its code. Open the unsubscribe link from one of my emails, or write
        to me at liz@quityourlifeandtravel.com and I will take you off the list myself.
      </p>
    );
  }

  if (status === 'done') {
    return (
      <p style={{ color: '#3A281A' }}>
        Done. You are off the list and I will not send you the Leap Log.
      </p>
    );
  }

  const confirm = async () => {
    setStatus('loading');
    try {
      const res = await fetch('/api/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      setStatus(res.ok ? 'done' : 'error');
    } catch {
      setStatus('error');
    }
  };

  return (
    <>
      <p className="mb-6" style={{ color: '#3A281A' }}>
        One click and I will stop sending you the Leap Log.
      </p>
      <button
        type="button"
        onClick={confirm}
        disabled={status === 'loading'}
        className="rounded-full px-8 py-3 text-sm font-semibold transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] disabled:opacity-60"
        style={{
          background: 'linear-gradient(135deg, #8B6914 0%, #E8C84A 35%, #F5E070 55%, #C9A030 75%, #8B6914 100%)',
          color: '#2D1A00',
          border: '1.5px solid #2D1A00',
        }}
      >
        {status === 'loading' ? 'Unsubscribing…' : 'Unsubscribe me'}
      </button>
      {status === 'error' && (
        <p className="text-sm mt-4" style={{ color: '#7a2f2f' }}>
          That did not go through. Try again, or write to me at liz@quityourlifeandtravel.com and
          I will take you off the list myself.
        </p>
      )}
    </>
  );
}
