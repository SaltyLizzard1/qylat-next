import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/siteMetadata';

export const metadata: Metadata = pageMetadata({
  title: 'Thank You | Quit Your Life and Travel',
  description: "Thanks for reaching out. You'll hear back soon.",
  path: '/thank-you',
  robots: { index: false, follow: false },
});

export default function ThankYouLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
