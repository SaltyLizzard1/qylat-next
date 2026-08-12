'use client';

import { useState } from 'react';
import AnimatedLogo from './AnimatedLogo';
import { Lightbulb, FileText, Rocket, X, CheckCircle, AlertCircle, Loader } from 'lucide-react';

const goldGradient =
  'linear-gradient(135deg, #8B6914 0%, #E8C84A 35%, #F5E070 55%, #C9A030 75%, #8B6914 100%)';

const goldBtn = {
  background: goldGradient,
  color: '#2D1A00',
  border: '1.5px solid #2D1A00',
  boxShadow: '0 8px 32px rgba(139,105,20,0.35)',
} as const;

const steps = [
  {
    icon: Lightbulb,
    title: 'Share Your Idea',
    description: 'Tell us your idea and goals in a quick, straightforward form',
  },
  {
    icon: FileText,
    title: 'We Build Your Plan',
    description: 'We pair expert guidance with AI research to craft a tailored, actionable plan that fits your vision',
  },
  {
    icon: Rocket,
    title: 'Get Your Plan',
    description: 'Your polished, ready-to-use PDF plan, delivered within 72 hours.',
  },
];

type FormData = {
  fullName: string;
  email: string;
  businessIdea: string;
  targetAudience: string;
  problem: string;
  industry: string;
  location: string;
  revenueModel: string;
  differentiation: string;
  budget: string;
  planGoal: string;
  planType: string;
  founderBackground: string;
  fundingAsk: string;
  useOfFunds: string;
  currentTraction: string;
  exitVision: string;
  loanAmount: string;
  loanUse: string;
  creditStanding: string;
  existingDebt: string;
  assetsCollateral: string;
  currentRevenue: string;
  yearsInBusiness: string;
};

type SubmitStatus = 'idle' | 'loading' | 'success' | 'error';

const initialForm: FormData = {
  fullName: '',
  email: '',
  businessIdea: '',
  targetAudience: '',
  problem: '',
  industry: '',
  location: '',
  revenueModel: '',
  differentiation: '',
  budget: '',
  planGoal: '',
  planType: 'Starter',
  founderBackground: '',
  fundingAsk: '',
  useOfFunds: '',
  currentTraction: '',
  exitVision: '',
  loanAmount: '',
  loanUse: '',
  creditStanding: '',
  existingDebt: '',
  assetsCollateral: '',
  currentRevenue: '',
  yearsInBusiness: '',
};

const PLAN_OPTIONS = [
  {
    value: 'Starter',
    title: 'Starter',
    price: '$25',
    description: 'Full plan, revenue strategy + 90-day roadmap',
  },
  {
    value: 'Growth',
    title: 'Growth',
    price: '$50',
    description: 'Adds competitor research, SWOT + go/no-go viability verdict',
  },
  {
    value: 'Visa / Immigration',
    title: 'Visa / Immigration',
    price: '$599',
    description:
      'Plan structured for visa and immigration contexts with compliance language.',
    comingSoon: true,
  },
];

export default function IdeaToPlan() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormData>(initialForm);
  const [status, setStatus] = useState<SubmitStatus>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const t = e.target;
    if (t.type === 'checkbox' && 'checked' in t) {
      setForm((prev) => ({ ...prev, [t.name]: (t as HTMLInputElement).checked ? 'yes' : 'no' }));
      return;
    }
    setForm((prev) => ({ ...prev, [t.name]: t.value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');
    try {
      const res = await fetch('/api/submit-idea', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        throw new Error(`Submission failed: ${res.status}`);
      }
      setStatus('success');
      setForm(initialForm);
    } catch (err: unknown) {
      if (process.env.NODE_ENV === 'development') console.error(err);
      setErrorMsg('Something went wrong. Please try again or email us directly.');
      setStatus('error');
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setStatus('idle');
    setErrorMsg('');
  };

  return (
    <>
      <section
        id="idea-to-plan"
        className="scroll-mt-28 relative overflow-hidden pt-4 pb-6 md:pt-5 md:pb-6 px-6"
        style={{ background: 'linear-gradient(180deg, #0d0d0f 0%, #17140c 50%, #0d0d0f 100%)' }}
      >
        <div
          className="pointer-events-none absolute -top-32 -right-32 w-80 h-80 rounded-full opacity-[0.10] hidden md:block"
          style={{ background: goldGradient }}
        />
        <div
          className="pointer-events-none absolute -bottom-24 -left-24 w-60 h-60 rounded-full opacity-[0.08] hidden md:block"
          style={{ background: goldGradient }}
        />

        <div className="relative max-w-4xl mx-auto text-center">

          {/* Logo */}
          <div className="flex justify-center mb-3">
            <a href="https://ideatoplan.to" target="_blank" rel="noopener noreferrer" className="hover:opacity-90 transition-opacity">
              <AnimatedLogo className="h-24 w-auto" />
            </a>
          </div>

          {/* Headline */}
          <h2
            className="font-cormorant font-bold mb-3 max-w-5xl mx-auto leading-tight"
           style={{ fontSize: 'clamp(1.75rem, 3vw, 2.25rem)', color: '#FBF6E3' }}
          >
            Turn Your Business Idea Into an Investor-Ready Plan
          </h2>

          {/* Body */}
          <div className="max-w-2xl mx-auto mb-5">
            <p className="text-base leading-relaxed" style={{ color: '#cfc9b8' }}>
              IdeaToPlan is the business-planning arm of the QYLAT ecosystem. QYLAT helps you
              find the right idea; IdeaToPlan turns it into a clear, professional plan you can
              take to lenders, investors, or your own roadmap. Delivered within 72 hours.
              Need it faster? Just ask.
            </p>
          </div>

          {/* 3-Step Flow */}
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            {steps.map((step, index) => (
              <div key={index} className="flex flex-col items-center text-center">
                <div
                  className="flex items-center justify-center w-12 h-12 rounded-full mb-2"
                  style={{ background: 'rgba(201,160,48,0.12)', border: '1px solid rgba(201,160,48,0.35)' }}
                >
                  <step.icon className="w-8 h-8" style={{ color: '#E8C84A' }} />
                </div>
                <h3 className="text-xl font-bold mb-2" style={{ color: '#E8C84A' }}>
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: '#cfc9b8' }}>
                  {step.description}
                </p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <a
            href="https://ideatoplan.to/#pricing"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block font-sans rounded-full px-12 py-4 text-lg font-semibold transition-all duration-300 hover:scale-[1.03] hover:shadow-md active:scale-[0.98] min-w-[260px] text-center"
            style={goldBtn}
          >
            Share Your Idea →
          </a>

          {/* Soft pricing line */}
          <p className="mt-3 text-sm" style={{ color: '#a89f8a' }}>
            Plans start at $25. Full details at{' '}
            <a
              href="https://ideatoplan.to"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold underline underline-offset-4 hover:opacity-70 transition"
              style={{ color: '#E8C84A' }}
            >
              ideatoplan.to
            </a>
          </p>
        </div>
      </section>

      {/* Questionnaire Modal */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) closeForm(); }}
        >
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold" style={{ color: '#8B6914' }}>Tell Us About Your Idea</h3>
                <p className="text-xs text-slate-500 mt-0.5">Takes about 3 minutes.</p>
              </div>
              <button onClick={closeForm} className="p-2 rounded-full hover:bg-slate-100 transition-colors" aria-label="Close">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-6">
              {status === 'success' ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-16 h-16 mx-auto mb-4" style={{ color: '#C9A030' }} />
                  <h3 className="text-2xl font-bold mb-3" style={{ color: '#8B6914' }}>We&apos;ve got your idea!</h3>
                  <p className="text-slate-700 mb-2">We&apos;ll be in touch within 48 hours to confirm the details. Plans are delivered within 72 hours, with expedited 48-hour delivery available.</p>
                  <p className="text-slate-500 text-sm">Check your inbox — and spam, just in case.</p>
                  <button
                    onClick={closeForm}
                    className="mt-6 px-8 py-3 text-white font-semibold rounded-lg transition-colors"
                    style={{ background: '#8B6914' }}
                  >
                    Close
                  </button>
                </div>
              ) : (
                <>
                  {status === 'error' && (
                    <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <p className="text-red-700 text-sm">{errorMsg}</p>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-800 mb-1">Full Name <span className="text-red-500">*</span></label>
                        <input name="fullName" value={form.fullName} onChange={handleChange} required placeholder="Jane Smith"
                          className="w-full border border-slate-200 rounded-lg px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#8B6914] transition" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-800 mb-1">Email <span className="text-red-500">*</span></label>
                        <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="jane@example.com"
                          className="w-full border border-slate-200 rounded-lg px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#8B6914] transition" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-800 mb-1">Describe your business idea <span className="text-red-500">*</span></label>
                      <textarea name="businessIdea" value={form.businessIdea} onChange={handleChange} required rows={3}
                        placeholder="What's the idea? Give us the overview."
                        className="w-full border border-slate-200 rounded-lg px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#8B6914] transition resize-none" />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-800 mb-1">What problem does it solve? <span className="text-red-500">*</span></label>
                      <textarea name="problem" value={form.problem} onChange={handleChange} required rows={2}
                        placeholder="What pain point are you solving?"
                        className="w-full border border-slate-200 rounded-lg px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#8B6914] transition resize-none" />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-800 mb-1">Industry / type of business <span className="text-red-500">*</span></label>
                        <input name="industry" value={form.industry} onChange={handleChange} required placeholder="e.g. E-commerce, Consulting, SaaS"
                          className="w-full border border-slate-200 rounded-lg px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#8B6914] transition" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-800 mb-1">Where will you operate?</label>
                        <input name="location" value={form.location} onChange={handleChange} placeholder="City, State — or Online/Location-independent"
                          className="w-full border border-slate-200 rounded-lg px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#8B6914] transition" />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-800 mb-1">Current annual revenue</label>
                        <input name="currentRevenue" value={form.currentRevenue} onChange={handleChange}
                          placeholder="e.g. $150,000 — leave blank if pre-revenue"
                          className="w-full border border-slate-200 rounded-lg px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#8B6914] transition" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-800 mb-1">Years in business</label>
                        <input name="yearsInBusiness" value={form.yearsInBusiness} onChange={handleChange}
                          placeholder="e.g. 5 years — leave blank if new"
                          className="w-full border border-slate-200 rounded-lg px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#8B6914] transition" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-800 mb-1">Who is your target customer? <span className="text-red-500">*</span></label>
                      <input name="targetAudience" value={form.targetAudience} onChange={handleChange} required
                        placeholder="e.g. Freelance designers aged 30–45 who want to go full-time"
                        className="w-full border border-slate-200 rounded-lg px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#8B6914] transition" />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-800 mb-1">How will you make money?</label>
                        <input name="revenueModel" value={form.revenueModel} onChange={handleChange} placeholder="e.g. Subscriptions, one-time sales, services"
                          className="w-full border border-slate-200 rounded-lg px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#8B6914] transition" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-800 mb-1">What makes you different?</label>
                        <input name="differentiation" value={form.differentiation} onChange={handleChange} placeholder="Your edge over competitors"
                          className="w-full border border-slate-200 rounded-lg px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#8B6914] transition" />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-800 mb-1">Approximate startup budget</label>
                        <select name="budget" value={form.budget} onChange={handleChange}
                          className="w-full border border-slate-200 rounded-lg px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#8B6914] transition bg-white">
                          <option value="">Select range...</option>
                          <option value="under5k">Under $5,000</option>
                          <option value="5k-25k">$5,000 – $25,000</option>
                          <option value="25k-50k">$25,000 – $50,000</option>
                          <option value="50k-100k">$50,000 – $100,000</option>
                          <option value="notsure">Not sure yet</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-800 mb-1">Goal for this plan <span className="text-red-500">*</span></label>
                        <select name="planGoal" value={form.planGoal} onChange={handleChange} required
                          className="w-full border border-slate-200 rounded-lg px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#8B6914] transition bg-white">
                          <option value="">Select goal...</option>
                          <option value="bank-loan">Bank loan</option>
                          <option value="investor">Investor pitch</option>
                          <option value="personal-roadmap">Personal roadmap</option>
                        </select>
                      </div>
                    </div>

                    {form.planGoal === 'bank-loan' && (
                      <div className="space-y-4 border border-[#8B6914]/20 rounded-xl p-4 bg-[#F8FAFC]">
                        <p className="text-sm font-semibold" style={{ color: '#8B6914' }}>Bank Loan Details</p>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-semibold text-slate-800 mb-1">Loan amount requested</label>
                            <input name="loanAmount" value={form.loanAmount} onChange={handleChange} placeholder="e.g. $50,000 SBA loan"
                              className="w-full border border-slate-200 rounded-lg px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#8B6914] transition" />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-slate-800 mb-1">Intended use of loan</label>
                            <input name="loanUse" value={form.loanUse} onChange={handleChange} placeholder="e.g. Equipment, working capital, inventory"
                              className="w-full border border-slate-200 rounded-lg px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#8B6914] transition" />
                          </div>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-semibold text-slate-800 mb-1">Credit &amp; financial standing</label>
                            <input name="creditStanding" value={form.creditStanding} onChange={handleChange} placeholder="e.g. Good credit, no bankruptcies"
                              className="w-full border border-slate-200 rounded-lg px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#8B6914] transition" />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-slate-800 mb-1">Existing debt or obligations</label>
                            <input name="existingDebt" value={form.existingDebt} onChange={handleChange} placeholder="e.g. Car loan, no other business debt"
                              className="w-full border border-slate-200 rounded-lg px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#8B6914] transition" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-800 mb-1">Collateral and assets</label>
                          <textarea name="assetsCollateral" value={form.assetsCollateral} onChange={handleChange} rows={3}
                            placeholder="e.g. Vehicle or property as collateral, savings, equipment"
                            className="w-full border border-slate-200 rounded-lg px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#8B6914] transition resize-none" />
                        </div>
                      </div>
                    )}

                    {form.planGoal === 'investor' && (
                      <div className="space-y-4 border border-[#8B6914]/20 rounded-xl p-4 bg-[#F8FAFC]">
                        <p className="text-sm font-semibold" style={{ color: '#8B6914' }}>Investor Pitch Details</p>
                        <div>
                          <label className="block text-sm font-semibold text-slate-800 mb-1">Your background</label>
                          <textarea name="founderBackground" value={form.founderBackground} onChange={handleChange} rows={3}
                            placeholder="Relevant experience and why you're the right person to build this."
                            className="w-full border border-slate-200 rounded-lg px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#8B6914] transition resize-none" />
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-semibold text-slate-800 mb-1">Funding ask</label>
                            <input name="fundingAsk" value={form.fundingAsk} onChange={handleChange} placeholder="e.g. $500K seed round"
                              className="w-full border border-slate-200 rounded-lg px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#8B6914] transition" />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-slate-800 mb-1">Current traction</label>
                            <input name="currentTraction" value={form.currentTraction} onChange={handleChange} placeholder="Revenue, users, pilots, waitlist, etc."
                              className="w-full border border-slate-200 rounded-lg px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#8B6914] transition" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-800 mb-1">Use of funds</label>
                          <textarea name="useOfFunds" value={form.useOfFunds} onChange={handleChange} rows={2}
                            placeholder="What will the investment capital be used for?"
                            className="w-full border border-slate-200 rounded-lg px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#8B6914] transition resize-none" />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-800 mb-1">Exit vision</label>
                          <textarea name="exitVision" value={form.exitVision} onChange={handleChange} rows={2}
                            placeholder="Acquisition, IPO, lifestyle business? What does success look like in 5-7 years?"
                            className="w-full border border-slate-200 rounded-lg px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#8B6914] transition resize-none" />
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-semibold text-slate-800 mb-2">Plan type <span className="text-red-500">*</span></label>
                      <p className="text-xs text-slate-500 mb-3">Delivered within 72 hours. Expedited 48-hour delivery is available.</p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {PLAN_OPTIONS.map((opt) =>
                          opt.comingSoon ? (
                            <div key={opt.value}
                              className="flex flex-col border-2 border-dashed border-slate-200 rounded-xl p-4 text-left h-full bg-slate-50 cursor-not-allowed opacity-75"
                              aria-disabled="true"
                            >
                              <span className="self-start text-[10px] font-bold uppercase tracking-wide text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200 mb-2">
                                Coming soon
                              </span>
                              <span className="font-bold text-slate-700 text-sm leading-tight">{opt.title}</span>
                              <span className="text-slate-400 font-bold text-lg mt-1">{opt.price}</span>
                              <p className="text-xs text-slate-400 mt-2 leading-relaxed flex-1">{opt.description}</p>
                            </div>
                          ) : (
                            <label key={opt.value}
                              className={`flex flex-col cursor-pointer border-2 rounded-xl p-4 text-left transition-all h-full ${form.planType === opt.value ? 'border-[#8B6914] bg-[#FBF6E4] ring-2 ring-[#8B6914]/25' : 'border-slate-200 hover:border-[#8B6914]/50 bg-white'}`}
                              style={form.planType === opt.value ? { boxShadow: '0 0 24px rgba(139,105,20,0.15)' } : undefined}
                            >
                              <input type="radio" name="planType" value={opt.value} checked={form.planType === opt.value} onChange={handleChange} className="sr-only" />
                              {opt.value === 'Growth' && (form.planGoal === 'bank-loan' || form.planGoal === 'investor') && (
                                <span className="self-start text-[10px] font-bold uppercase tracking-wide text-white px-2 py-0.5 rounded-full mb-2" style={{ background: '#8B6914' }}>
                                  Recommended for your goal
                                </span>
                              )}
                              <span className="font-bold text-slate-900 text-sm leading-tight">{opt.title}</span>
                              <span className="font-bold text-lg mt-1" style={{ color: '#8B6914' }}>{opt.price}</span>
                              <p className="text-xs text-slate-700 mt-2 leading-relaxed flex-1">{opt.description}</p>
                              {opt.value === 'Growth' && (form.planGoal === 'bank-loan' || form.planGoal === 'investor') && (
                                <p className="text-[11px] mt-2 font-medium" style={{ color: '#8B6914' }}>
                                  Lenders and investors expect this depth.
                                </p>
                              )}
                            </label>
                          )
                        )}
                      </div>
                    </div>

                    <button type="submit" disabled={status === 'loading'}
                      className="w-full py-4 text-white text-lg font-semibold rounded-lg transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-60"
                      style={{ background: status === 'loading' ? '#6B500F' : '#8B6914' }}
                    >
                      {status === 'loading' ? (
                        <><Loader className="w-5 h-5 animate-spin" />Sending...</>
                      ) : 'Submit Your Idea'}
                    </button>

                    <p className="text-center text-xs text-slate-400">
                      We&apos;ll be in touch within 48 hours to confirm the details of your plan.
                    </p>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
