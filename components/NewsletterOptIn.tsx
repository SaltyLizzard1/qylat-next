'use client';

import { NEWSLETTER_LABEL } from '../lib/emailSources';

// The Leap Log choice shown on every form that is not itself a newsletter
// signup. Always starts unchecked: the parent owns the state and passes the
// real value to subscribe().
export default function NewsletterOptIn({
  checked,
  onChange,
  className = '',
  color,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
  color?: string;
}) {
  return (
    <label
      className={`flex items-start gap-2 text-xs text-left cursor-pointer ${className}`}
      style={color ? { color } : undefined}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 shrink-0 accent-[#8B6914]"
      />
      <span>{NEWSLETTER_LABEL}</span>
    </label>
  );
}
