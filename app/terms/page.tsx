import type { Metadata } from 'next';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

export const metadata: Metadata = {
  title: 'Terms of Service | QYLAT',
  description: 'Terms of service for Quit Your Life and Travel.',
  alternates: { canonical: 'https://www.quityourlifeandtravel.com/terms' },
};

const EFFECTIVE_DATE = 'July 8, 2026';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="font-cormorant text-2xl font-bold text-gray-900 mb-3">{title}</h2>
      <div className="text-gray-700 leading-relaxed space-y-3">{children}</div>
    </section>
  );
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-6 pb-12">
        <h1 className="font-cormorant text-4xl md:text-5xl font-bold text-gray-900 mb-2">Terms of Service</h1>
        <p className="text-sm text-gray-500 mb-10">Effective date: {EFFECTIVE_DATE}</p>

        <Section title="1. Who We Are">
          <p>
            Quit Your Life and Travel (&ldquo;QYLAT&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;) is a lifestyle brand
            and coaching service at quityourlifeandtravel.com. We offer free content and resources, a skills and
            business idea assessment, paid coaching sessions (Leap Sessions), and an intake for business planning
            services delivered through IdeaToPlan, part of the same ecosystem.
          </p>
        </Section>

        <Section title="2. Not Professional Advice">
          <p>
            Everything on this site, including blog posts, the Leap Kit, assessment results, and coaching sessions, is
            informational and educational. It is not legal, financial, tax, investment, immigration, medical, or
            mental health advice. Big life changes carry real risk, and you are responsible for your own decisions.
            Consult licensed professionals before acting on anything significant.
          </p>
        </Section>

        <Section title="3. Leap Sessions">
          <p>
            Leap Sessions are 45-minute coaching calls booked through Calendly and paid at the time of booking
            through Stripe. Prices are listed in US dollars.
          </p>
          <p>
            You may reschedule at no cost with at least 24 hours notice before your session. Cancellations with at
            least 24 hours notice receive a full refund. No-shows and cancellations with less than 24 hours notice
            are not refunded. If we need to cancel or reschedule, you choose between a new time or a full refund.
          </p>
        </Section>

        <Section title="4. Business Plan Services">
          <p>
            Business idea submissions made through this site are fulfilled by IdeaToPlan and governed by the{' '}
            <a
              href="https://ideatoplan.to/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 text-[#8B6914] hover:opacity-70"
            >
              IdeaToPlan Terms of Service
            </a>{' '}
            in addition to these terms.
          </p>
        </Section>

        <Section title="5. Comments and Community">
          <p>
            You are welcome to comment on blog posts. You are responsible for what you post. We may remove comments
            that are abusive, spam, unlawful, or off-topic, at our discretion. By posting, you grant us the right to
            display your comment on the site.
          </p>
        </Section>

        <Section title="6. Intellectual Property">
          <p>
            All content on this site, including writing, images, the Leap Kit, branding, and design, belongs to us
            unless noted otherwise. You may share links and brief excerpts with attribution. You may not republish,
            resell, or redistribute our content or resources as your own.
          </p>
        </Section>

        <Section title="7. Limitation of Liability">
          <p>
            To the maximum extent permitted by law, QYLAT is not liable for indirect, incidental, consequential, or
            punitive damages arising from your use of this site, our content, or our services. Our total liability to
            you will not exceed the amount you paid us in the twelve months before the claim arose.
          </p>
        </Section>

        <Section title="8. Changes to These Terms">
          <p>
            We may update these terms from time to time. Continued use of the site after changes are posted means you
            accept the updated terms. Material changes will be reflected in the effective date at the top of this page.
          </p>
        </Section>

        <Section title="9. Governing Law">
          <p>
            These terms are governed by the laws of the State of Florida, United States, without regard to conflict of
            law principles. Disputes will first be addressed through good-faith negotiation. If unresolved within 30
            days, disputes will be resolved in the state or federal courts located in Florida, and you consent to the
            jurisdiction of those courts.
          </p>
        </Section>

        <Section title="10. Contact">
          <p>
            Questions about these terms? Email{' '}
            <a
              href="mailto:liz@quityourlifeandtravel.com"
              className="underline underline-offset-2 text-[#8B6914] hover:opacity-70"
            >
              liz@quityourlifeandtravel.com
            </a>.
          </p>
        </Section>
      </main>
      <Footer />
    </div>
  );
}
