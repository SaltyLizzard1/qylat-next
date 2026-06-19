import Image from 'next/image';
import { Lightbulb, FileText, Rocket } from 'lucide-react';

const goldBtn = {
  background: 'linear-gradient(135deg, #8B6914 0%, #E8C84A 35%, #F5E070 55%, #C9A030 75%, #8B6914 100%)',
  color: '#2D1A00',
  border: '1.5px solid #7A5C0A',
  boxShadow: '0 4px 24px rgba(0,0,0,0.35)',
} as const;

const steps = [
  {
    icon: Lightbulb,
    title: 'Share Your Idea',
    description: 'Tell us your idea and goals in a quick, straightforward form',
  },
  {
    icon: FileText,
    title: 'AI-Assisted Planning',
    description: 'We guide the AI to craft a tailored, actionable plan that fits your vision',
  },
  {
    icon: Rocket,
    title: 'Get Your Plan',
    description: "Get your polished, ready-to-use PDF plan in 72 hours—or faster if you're on a deadline",
  },
];

export default function IdeaToPlan() {
  return (
    <section id="idea-to-plan" className="pt-8 pb-14 md:pt-10 md:pb-20 bg-[#0e0e0e]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6">
          <span className="inline-flex items-center gap-2.5 border border-[#C9A030]/60 bg-[#FDF8E7] px-5 py-2.5 rounded-full mb-4 shadow-sm">
            <span className="font-sans text-sm font-semibold tracking-widest uppercase text-[#8B6914]">
              Introducing
            </span>
            <Image
              src="/ideatoplan-logo.png"
              alt="IdeaToPlan"
              width={120}
              height={30}
              className="object-contain"
              style={{ height: '28px', width: 'auto' }}
            />
          </span>
          <h2 className="font-cormorant text-4xl md:text-5xl font-bold text-white mb-4">
            Turn Your Business Idea Into a Real Plan in 72 Hours
          </h2>
          <p className="text-base text-[#E8C84A]/80 font-medium mb-4 max-w-2xl mx-auto">
            A done-for-you business planning service built for founders who are ready to move. Fast turnaround. Real plans. No fluff.
          </p>
          <p className="text-xl text-white/60 mb-6 max-w-3xl mx-auto leading-relaxed">
            You already made the hard decision to leap. Now let&apos;s make sure you land right.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-10">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#E8C84A]/15 rounded-full mb-6">
                <step.icon className="w-8 h-8 text-[#E8C84A]" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
              <p className="text-white/55">{step.description}</p>
            </div>
          ))}
        </div>

        <div className="mb-8">
          <div className="grid md:grid-cols-3 gap-6 mb-8">

            {/* Starter */}
            <div className="border border-white/15 rounded-2xl p-6 bg-white/5 flex flex-col">
              <h3 className="text-xl font-bold text-white mb-1">Starter</h3>
              <p className="text-[#E8C84A] font-bold text-2xl mb-1">$25</p>
              <p className="text-sm text-white/45 mb-4">For founders who want a polished business plan without overpaying.</p>
              <ul className="space-y-2 text-sm text-white/65 flex-1">
                {[
                  'Actionable business plan built around your idea',
                  'Revenue model and pricing strategy',
                  '90-day roadmap with clear milestones',
                  'Professional PDF delivered in 72 hours',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-[#E8C84A] font-bold mt-0.5">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Growth - featured */}
            <div className="border border-[#E8C84A]/50 rounded-2xl p-6 bg-[#E8C84A]/8 flex flex-col relative shadow-[0_0_40px_rgba(232,200,74,0.08)]">
              <div
                className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap"
                style={{ background: goldBtn.background, color: goldBtn.color }}
              >
                Most Popular
              </div>
              <h3 className="text-xl font-bold text-white mb-1">Growth</h3>
              <p className="text-[#E8C84A] font-bold text-2xl mb-1">$50</p>
              <p className="text-sm text-white/45 mb-4">For entrepreneurs who want market validation and smarter positioning.</p>
              <ul className="space-y-2 text-sm text-white/65 flex-1">
                {[
                  'Everything in Starter',
                  'Competitor research and landscape analysis',
                  'SWOT analysis',
                  'Viability verdict with go/no-go assessment',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-[#E8C84A] font-bold mt-0.5">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Visa - coming soon */}
            <div className="border border-dashed border-white/15 rounded-2xl p-6 bg-white/3 flex flex-col relative opacity-55">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white/10 text-white/50 text-xs font-bold px-4 py-1 rounded-full border border-white/20 whitespace-nowrap">
                Coming soon
              </div>
              <h3 className="text-xl font-bold text-white/70 mb-1">Visa / Immigration</h3>
              <p className="text-white/40 font-bold text-2xl mb-1">$599</p>
              <p className="text-sm text-white/35 mb-4">
                For founders who need USCIS- and investor-ready structure and compliance language.
              </p>
              <ul className="space-y-2 text-sm text-white/35 flex-1">
                {[
                  'Everything in Growth',
                  'Visa-ready formatting and structure',
                  '5-year financial projections',
                  'Job creation and non-marginality language',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-white/25 font-bold mt-0.5">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="text-center mb-6">
            <div className="inline-block border border-[#E8C84A]/25 bg-[#E8C84A]/8 rounded-xl px-6 py-3">
              <p className="text-[#E8C84A]/75 font-semibold text-sm">
                Special introductory offer — no payment upfront. You receive your plan, we talk it through, and you pay only if you love it. In exchange, we&apos;d love your honest feedback.
              </p>
            </div>
          </div>

          <div className="text-center">
            <a
              href="https://ideatoplan.com?ref=qylat"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block font-sans rounded-full px-10 py-4 text-lg font-semibold transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] sm:min-w-[14rem]"
              style={goldBtn}
            >
              Share Your Idea
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
