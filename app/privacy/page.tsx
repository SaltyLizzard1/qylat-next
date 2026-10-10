import type { Metadata } from 'next';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { pageMetadata } from '@/lib/siteMetadata';

export const metadata: Metadata = pageMetadata({
  title: 'Privacy Policy | QYLAT',
  description: 'How Quit Your Life and Travel collects, uses, and protects your information.',
  path: '/privacy',
});

const EFFECTIVE_DATE = 'October 10, 2026';

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
      <span className="font-semibold text-gray-900">{name}</span>: {role}{' '}
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
      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-6 pb-12">
        <h1 className="font-cormorant text-4xl md:text-5xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-10">Effective date: {EFFECTIVE_DATE}</p>

        <Section title="1. What We Collect">
          <p>We collect information you choose to share with us when using quityourlifeandtravel.com:</p>
          <p>
            Your email address when you subscribe to our newsletter or request the free 60-Day Leap Kit.
            Your answers when you take the Discover Your Idea assessment.
            Your name, email, and comment text when you comment on a blog post.
            Your name, email address, and the content of your message when you email us.
            Your name, email, and scheduling details when you book a Leap Session, along with payment processed at booking.
            Your business idea details if you submit the IdeaToPlan intake form, which may include financial information such as budget, revenue, funding goals, and loan details.
          </p>
          <p>We do not collect or store payment card numbers. Payments are handled by Stripe.</p>
        </Section>

        <Section title="2. How We Use Your Information">
          <p>
            We use your information to deliver what you asked for: sending the Leap Kit, generating assessment results,
            publishing your comments, scheduling and holding your coaching session, and creating your business plan.
            If you subscribed, we send you emails you can unsubscribe from at any time. We do not sell your personal
            information to anyone.
          </p>
          <p>
            Assessment responses and business idea submissions are processed with the help of AI language models to generate
            your results and plans. A human reviews business plans before delivery.
          </p>
          <p>
            When you email Quit Your Life and Travel, we may use AI services to help categorize your message and
            prepare a draft response. Every AI-assisted reply is reviewed and approved by a person before it is sent.
            We do not automatically subscribe you to marketing emails when you contact us.
          </p>
        </Section>

        <Section title="3. Third-Party Processors">
          <p>These services process data on our behalf to run this site:</p>
          <Processor name="Vercel" role="Hosts the website, receives inbound request data, and provides website analytics." href="https://vercel.com/legal/privacy-policy" />
          <Processor name="Google Analytics" role="Website analytics." href="https://policies.google.com/privacy" />
          <Processor name="Neon" role="Stores records of clicks on certain links, such as the referring page, browser type, and country." href="https://neon.com/privacy-policy" />
          <Processor name="Supabase" role="Stores our email list, along with where and when you signed up, and a record of emails you send us and our replies." href="https://supabase.com/privacy" />
          <Processor name="Resend" role="Delivers the Leap Kit, your assessment results, newsletter sends, and our replies to your emails." href="https://resend.com/legal/privacy-policy" />
          <Processor name="Cusdis" role="Powers blog comments. Your name, email, and comment are stored with Cusdis." href="https://cusdis.com/privacy-policy" />
          <Processor name="Cal.com" role="Handles Leap Session scheduling." href="https://cal.com/privacy" />
          <Processor name="Stripe" role="Processes payments securely. We never see your full card number." href="https://stripe.com/privacy" />
          <Processor name="Google Workspace" role="Stores submissions and handles email communication." href="https://workspace.google.com/terms/privacy.html" />
          <Processor name="Hostinger" role="Hosts the mailbox that receives email sent to our quityourlifeandtravel.com address." href="https://www.hostinger.com/legal/privacy-policy" />
          <Processor name="n8n (self-hosted)" role="Automation that routes assessment and plan submissions, and emails you send us, through our pipeline, hosted on our own server." href="https://n8n.io/legal/privacy" />
          <Processor name="DigitalOcean" role="Hosts the server our automation runs on, including its short-lived processing logs." href="https://www.digitalocean.com/legal/privacy-policy" />
          <Processor name="Cloudflare" role="Stores backups of our database." href="https://www.cloudflare.com/privacypolicy/" />
          <Processor name="OpenRouter" role="Routes AI requests for assessment results, business plans, and draft email replies." href="https://openrouter.ai/privacy" />
          <Processor name="Anthropic" role="AI model (Claude) used to draft assessment results, business plans, and email replies for our review." href="https://www.anthropic.com/privacy" />
          <Processor name="Perplexity" role="AI research used on Growth-tier business plans." href="https://www.perplexity.ai/hub/legal/privacy-policy" />
        </Section>

        <Section title="4. Cookies and Analytics">
          <p>
            We use analytics services, including Google Analytics and Vercel Analytics, to understand how visitors use
            our website. We also track interactions with certain links to understand which content and resources
            people find useful. These services may collect information about your device, browser, pages visited, and
            interactions with our site.
          </p>
          <p>
            Google Analytics sets cookies to do this. We do not run advertising cookies. Vercel may set a session
            cookie for routing. Embedded services such as Cusdis may set their own cookies when you use those
            features. Booking a Leap Session takes you to Cal.com, which sets its own cookies.
          </p>
        </Section>

        <Section title="5. Data Retention">
          <p>
            We keep your information only as long as needed to provide the service, typically no longer than 12 months
            after your last interaction. Email subscribers are kept until they unsubscribe. Comments remain published
            until you ask us to remove them.
          </p>
          <p>
            When you email us, the records our systems create to handle your message, including a copy of your message
            and any draft or reply, are deleted 12 months after the last activity in that conversation. We keep a
            conversation longer only while a request is still open, while a reply has not been confirmed as delivered,
            or where we need it to meet a legal obligation or resolve a dispute. After deletion we keep a minimal
            record that a reply was approved and sent, with no name, email address, or message text. Our automation's
            processing logs are removed within 14 days.
          </p>
          <p>
            Original emails may remain in our mailbox accounts, and copies of our records may remain in database
            backups, after the working records are deleted. If you ask us to delete your data, we remove it from our
            active systems, and removal from mailboxes and backups is subject to applicable legal and operational
            requirements.
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
