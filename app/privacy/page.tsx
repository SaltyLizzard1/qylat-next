import type { Metadata } from 'next';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

export const metadata: Metadata = {
  title: 'Privacy Policy | QYLAT',
  description: 'How Quit Your Life and Travel collects, uses, and protects your information.',
  alternates: { canonical: 'https://www.quityourlifeandtravel.com/privacy' },
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

function Processor({ name, role, href }: { name: string; role: string; href: string }) {
  return (
    <p>
      <span className="font-semibold text-gray-900">{name}</span> — {role}{' '}
      <a href={href} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 text-[#8B6914] hover:opacity-70">
        Privacy policy
      </a>
    </p>
  );
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="font-cormorant text-4xl md:text-5xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-10">Effective date: {EFFECTIVE_DATE}</p>

        <Section title="1. What We Collect">
          <p>We collect information you choose to share with us when using quityourlifeandtravel.com:</p>
          <p>
            Your email address when you subscribe to our newsletter or request the free 60-Day Leap Kit.
            Your quiz answers when you take the Discover Your Idea quiz.
            Your name, email, and comment text when you comment on a blog post.
            Your name, email, and scheduling details when you book a Leap Session, along with payment processed at booking.
            Your business idea details if you submit the IdeaToPlan intake form, which may include financial information such as budget, revenue, funding goals, and loan details.
          </p>
          <p>We do not collect or store payment card numbers. Payments are handled by Stripe.</p>
        </Section>

        <Section title="2. How We Use Your Information">
          <p>
            We use your information to deliver what you asked for: sending the Leap Kit, generating quiz results,
            publishing your comments, scheduling and holding your coaching session, and creating your business plan.
            If you subscribed, we send you emails you can unsubscribe from at any time. We do not sell your personal
            information to anyone.
          </p>
          <p>
            Quiz responses and business idea submissions are processed with the help of AI language models to generate
            your results and plans. A human reviews business plans before delivery.
          </p>
        </Section>

        <Section title="3. Third-Party Processors">
          <p>These services process data on our behalf to run this site:</p>
          <Processor name="Vercel" role="Hosts the website and receives inbound request data." href="https://vercel.com/legal/privacy-policy" />
          <Processor name="Kit" role="Manages our email list, the Leap Kit delivery, and newsletter sends." href="https://kit.com/privacy" />
          <Processor name="Cusdis" role="Powers blog comments. Your name, email, and comment are stored with Cusdis." href="https://cusdis.com/privacy-policy" />
          <Processor name="Calendly" role="Handles Leap Session scheduling." href="https://calendly.com/legal/privacy-notice" />
          <Processor name="Stripe" role="Processes payments securely. We never see your full card number." href="https://stripe.com/privacy" />
          <Processor name="Google Workspace" role="Stores submissions and handles email communication." href="https://workspace.google.com/terms/privacy.html" />
          <Processor name="n8n (self-hosted)" role="Automation that routes quiz and plan submissions through our pipeline, hosted on our own server." href="https://n8n.io/legal/privacy" />
          <Processor name="OpenRouter" role="Routes AI requests for quiz results and business plans." href="https://openrouter.ai/privacy" />
          <Processor name="Anthropic" role="AI model (Claude) used to draft quiz results and business plans." href="https://www.anthropic.com/privacy" />
          <Processor name="Perplexity" role="AI research used on Growth-tier business plans." href="https://www.perplexity.ai/hub/legal/privacy-policy" />
        </Section>

        <Section title="4. Cookies and Analytics">
          <p>
            We do not run advertising cookies, tracking pixels, or third-party analytics scripts. Vercel may set a
            session cookie for routing. Embedded services such as Cusdis and Calendly may set their own cookies when
            you use those features.
          </p>
        </Section>

        <Section title="5. Data Retention">
          <p>
            We keep your information only as long as needed to provide the service, typically no longer than 12 months
            after your last interaction. Email subscribers are kept until they unsubscribe. Comments remain published
            until you ask us to remove them.
          </p>
        </Section>

        <Section title="6. Your Rights">
          <p>
            You can ask us to access, correct, or delete your personal data at any time. Email{' '}
            <a href="mailto:liz@quityourlifeandtravel.com" className="underline underline-offset-2 text-[#8B6914] hover:opacity-70">
              liz@quityourlifeandtravel.com
            </a>{' '}
            and we will respond within 30 days. We may retain limited data where required to meet legal obligations or
            resolve disputes.
          </p>
        </Section>

        <Section title="7. Contact">
          <p>
            Questions about this policy? Reach us at{' '}
            <a href="mailto:liz@quityourlifeandtravel.com" className="underline underline-offset-2 text-[#8B6914] hover:opacity-70">
              liz@quityourlifeandtravel.com
            </a>.
          </p>
        </Section>
      </main>
      <Footer />
    </div>
  );
}