import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/siteMetadata';

export const metadata: Metadata = pageMetadata({
  title: 'Welcome | Quit Your Life and Travel',
  description: "You're in. Check your inbox for your first step toward the leap.",
  path: '/welcome',
  robots: { index: false, follow: false },
});

export default function WelcomeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
