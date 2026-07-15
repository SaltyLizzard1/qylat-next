'use client';

import { useState, useMemo } from 'react';
import { Plane, Info } from 'lucide-react';

// ── Brand tokens ────────────────────────────────────────────────────────────

const GOLD_GRADIENT =
  'linear-gradient(135deg, #8B6914 0%, #E8C84A 35%, #F5E070 55%, #C9A030 75%, #8B6914 100%)';
const DARK_GRADIENT = 'linear-gradient(180deg, #0d0d0f 0%, #17140c 50%, #0d0d0f 100%)';
const ESPRESSO = '#3A281A';
const ESPRESSO_DEEP = '#2D1A00';
const SAGE = '#EBF0E6';
const CREAM = '#FBF6E3';

const heading = {
  fontFamily: "'Cormorant Garamond', Georgia, serif",
  fontWeight: 700,
  color: ESPRESSO_DEEP,
} as const;

const KIT_FORM_URL = 'https://app.kit.com/forms/afc2a0b2d2/subscriptions';

// ── Types ───────────────────────────────────────────────────────────────────

interface LineItem {
  id: string;
  label: string;
  amount: number;
  hint?: string;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function currency(n: number): string {
  const v = Number.isFinite(n) ? n : 0;
  return v.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });
}

// ── Subcomponents ───────────────────────────────────────────────────────────

function LineItemRow({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div
      className="flex items-center justify-between gap-4 py-3 border-b"
      style={{ borderColor: 'rgba(58,40,26,0.12)' }}
    >
      <div className="flex-1">
        <label className="text-[15px] block" style={{ color: ESPRESSO }}>
          {label}
        </label>
        {hint && (
          <span className="text-xs" style={{ color: 'rgba(58,40,26,0.5)' }}>
            {hint}
          </span>
        )}
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <span className="text-sm" style={{ color: 'rgba(58,40,26,0.55)' }}>
          $
        </span>
        <input
          type="number"
          inputMode="numeric"
          min="0"
          placeholder="0"
          value={value === 0 ? '' : value}
          onChange={(e) => onChange(e.target.value === '' ? 0 : Number(e.target.value))}
          className="w-28 rounded-lg px-3 py-2 text-right text-[15px] focus:outline-none focus:ring-2 focus:ring-[#C9A030]"
          style={{
            background: '#fff',
            border: '1px solid rgba(58,40,26,0.2)',
            color: ESPRESSO_DEEP,
          }}
        />
      </div>
    </div>
  );
}

function SectionCard({
  eyebrow,
  title,
  subtitle,
  bg,
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  bg: string;
  children: React.ReactNode;
}) {
  return (
    <section className="py-14 px-6 print:hidden" style={{ background: bg }}>
      <div className="max-w-2xl mx-auto">
        <span
          className="inline-block font-sans text-xs font-semibold uppercase tracking-[0.2em] px-4 py-1.5 rounded-full mb-5"
          style={{ background: ESPRESSO, color: CREAM }}
        >
          {eyebrow}
        </span>
        <h2
          style={{
            ...heading,
            fontSize: 'clamp(1.6rem, 4vw, 2.2rem)',
            lineHeight: 1.15,
            marginBottom: '0.5rem',
          }}
        >
          {title}
        </h2>
        {subtitle && (
          <p className="text-[15px] mb-6" style={{ color: 'rgba(58,40,26,0.75)' }}>
            {subtitle}
          </p>
        )}
        <div
          className="rounded-2xl px-6 py-2"
          style={{
            background: '#fff',
            border: '1px solid rgba(58,40,26,0.1)',
            boxShadow: '0 8px 30px rgba(58,40,26,0.06)',
          }}
        >
          {children}
        </div>
      </div>
    </section>
  );
}

// ── Main component ──────────────────────────────────────────────────────────

export default function LeapCalculator() {
  const [setupItems, setSetupItems] = useState<LineItem[]>([
    { id: 'hotels', label: 'First stop: hotels', amount: 0 },
    { id: 'food', label: 'First stop: food', amount: 0 },
    { id: 'localtransport', label: 'First stop: local transport', amount: 0 },
    { id: 'activities', label: 'First stop: activities and misc', amount: 0 },
    { id: 'transit', label: 'Transit stop: hotel, food, and transport', amount: 0 },
    { id: 'flight', label: 'Flight to final destination', amount: 0 },
    { id: 'temphousing', label: 'Temporary housing at destination (first 2 weeks)', amount: 0 },
    { id: 'transport', label: 'Transport purchase (motorbike, scooter, or rental)', amount: 0 },
    { id: 'license', label: 'License and medical if required', amount: 0 },
    { id: 'gear', label: 'Gear and safety equipment', amount: 0 },
    {
      id: 'setupbuffer',
      label: 'Buffer for unexpected expenses',
      amount: 0,
      hint: "Liz's rule: add 20%. Luggage breaks. Visa fees cost more than listed. It always happens.",
    },
  ]);

  const [monthlyItems, setMonthlyItems] = useState<LineItem[]>([
    { id: 'rent', label: 'Rent', amount: 0 },
    { id: 'utilities', label: 'Utilities and electricity', amount: 0 },
    { id: 'groceries', label: 'Food and groceries', amount: 0 },
    { id: 'dining', label: 'Dining out and cafes', amount: 0 },
    { id: 'fuel', label: 'Transportation and fuel', amount: 0 },
    { id: 'phone', label: 'Phone and SIM', amount: 0 },
    { id: 'coworking', label: 'Coworking or cafe work sessions', amount: 0 },
    { id: 'social', label: 'Entertainment and social', amount: 0 },
    { id: 'laundry', label: 'Laundry and misc', amount: 0 },
    {
      id: 'insurance',
      label: 'Health insurance',
      amount: 0,
      hint: 'Get quotes before you leave. Average is $100 to $200 a month.',
    },
    {
      id: 'storage',
      label: 'Storage unit back home (if applicable)',
      amount: 0,
      hint: 'A monthly cost you carry until you deal with it.',
    },
    { id: 'debtpay', label: 'Debt payments', amount: 0 },
    { id: 'monthlybuffer', label: 'Buffer: 20% of total for unknowns', amount: 0 },
  ]);

  const [cashItems, setCashItems] = useState<LineItem[]>([
    { id: 'checking', label: 'Checking and savings accounts', amount: 0 },
    { id: 'investments', label: 'Investment accounts (liquid)', amount: 0 },
    { id: 'otherliquid', label: 'Other liquid assets', amount: 0 },
  ]);

  const [creditDebt, setCreditDebt] = useState(0);
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [incomeStartMonth, setIncomeStartMonth] = useState(4);

  const [email, setEmail] = useState('');
  const [emailStatus, setEmailStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const updateItem =
    (setter: React.Dispatch<React.SetStateAction<LineItem[]>>) => (id: string, amount: number) =>
      setter((items) => items.map((it) => (it.id === id ? { ...it, amount } : it)));

  const totalSetup = useMemo(() => setupItems.reduce((s, i) => s + i.amount, 0), [setupItems]);
  const totalMonthly = useMemo(() => monthlyItems.reduce((s, i) => s + i.amount, 0), [monthlyItems]);
  const totalCash = useMemo(() => cashItems.reduce((s, i) => s + i.amount, 0), [cashItems]);
  const netCash = totalCash - creditDebt - totalSetup;

  const runway = useMemo(() => {
    if (totalMonthly <= 0) return { months: null as number | null, indefinite: false, upfront: netCash <= 0 };
    if (netCash <= 0) return { months: 0, indefinite: false, upfront: true };
    let cash = netCash;
    for (let m = 1; m <= 60; m++) {
      cash -= totalMonthly;
      if (m >= incomeStartMonth) cash += monthlyIncome;
      if (cash <= 0) return { months: m, indefinite: false, upfront: false };
    }
    return { months: 60, indefinite: true, upfront: false };
  }, [netCash, totalMonthly, monthlyIncome, incomeStartMonth]);

  const stripMonths = 24;
  const litMonths = runway.months ? Math.min(runway.months, stripMonths) : 0;

  const runwayLabel =
    runway.upfront || totalMonthly <= 0
      ? 'Add your numbers'
      : runway.indefinite
        ? '36+ months'
        : `${runway.months} months`;

  const handleDownload = () => {
    window.print();
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailStatus('loading');
    try {
      const res = await fetch(KIT_FORM_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email_address: email,
          fields: {
            calc_setup_cost: totalSetup,
            calc_monthly_cost: totalMonthly,
            calc_net_cash: netCash,
            calc_runway_months: runway.months ?? 0,
          },
        }),
      });
      if (res.ok) {
        setEmailStatus('success');
        setEmail('');
      } else {
        setEmailStatus('error');
      }
    } catch {
      setEmailStatus('error');
    }
  };

  const breakdownItems = monthlyItems.filter((i) => i.amount > 0);
  const maxMonthlyItem = Math.max(1, ...breakdownItems.map((i) => i.amount));

  return (
    <div className="font-sans">
      {/* Print stylesheet: only the summary prints */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #leap-print-summary, #leap-print-summary * { visibility: visible; }
          #leap-print-summary {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            display: block !important;
          }
        }
      `}</style>

      {/* Hero */}
      <section className="py-16 px-6 text-center print:hidden" style={{ background: CREAM }}>
        <span
          className="inline-block text-xs font-semibold uppercase tracking-[0.2em] px-4 py-1.5 rounded-full mb-6"
          style={{ background: ESPRESSO, color: CREAM }}
        >
          Free Runway Calculator
        </span>
        <h1
          style={{
            ...heading,
            fontSize: 'clamp(2.2rem, 6vw, 3.4rem)',
            lineHeight: 1.1,
            maxWidth: '40rem',
            margin: '0 auto 1rem',
          }}
        >
          How Much Do You Actually Need to Leap?
        </h1>
        <p className="max-w-xl mx-auto text-lg mb-2" style={{ color: 'rgba(58,40,26,0.8)' }}>
          Plug in your real numbers. Watch your runway change as you type. No email required to see
          your result.
        </p>
        <p className="max-w-xl mx-auto text-sm italic" style={{ color: 'rgba(58,40,26,0.6)' }}>
          My real numbers: $2,720 to get to Chiang Mai and $1,838 a month once I was here. I left
          with $35k. After setup costs, that gave me 17 months of runway. Knowing that number is
          what made the leap feel possible instead of terrifying.
        </p>
      </section>

      {/* Step 1: Setup and travel */}
      <SectionCard
        eyebrow="Step 1 · Setup and Travel"
        title="What Your Arrival Actually Costs"
        subtitle="One-time costs to get from your front door to settled at your destination."
        bg={SAGE}
      >
        {setupItems.map((item) => (
          <LineItemRow
            key={item.id}
            label={item.label}
            hint={item.hint}
            value={item.amount}
            onChange={(v) => updateItem(setSetupItems)(item.id, v)}
          />
        ))}
        <div className="flex items-center justify-between py-4">
          <span className="font-semibold" style={{ color: ESPRESSO_DEEP }}>
            Total setup cost
          </span>
          <span className="text-xl font-bold" style={{ color: ESPRESSO_DEEP }}>
            {currency(totalSetup)}
          </span>
        </div>
      </SectionCard>

      {/* Step 2: Monthly living */}
      <SectionCard
        eyebrow="Step 2 · Monthly Living"
        title="What Life Costs Once You Are There"
        subtitle="Recurring costs, month to month, once you have landed."
        bg={CREAM}
      >
        {monthlyItems.map((item) => (
          <LineItemRow
            key={item.id}
            label={item.label}
            hint={item.hint}
            value={item.amount}
            onChange={(v) => updateItem(setMonthlyItems)(item.id, v)}
          />
        ))}
        <div className="flex items-center justify-between py-4">
          <span className="font-semibold" style={{ color: ESPRESSO_DEEP }}>
            Total monthly cost
          </span>
          <span className="text-xl font-bold" style={{ color: ESPRESSO_DEEP }}>
            {currency(totalMonthly)}
          </span>
        </div>
      </SectionCard>

      {/* Step 3: Net cash */}
      <SectionCard
        eyebrow="Step 3 · Your Real Number"
        title="Know Your Actual Cash"
        subtitle="Only count money you are willing to spend down. Anything you want to keep untouched does not belong in this number."
        bg={SAGE}
      >
        {cashItems.map((item) => (
          <LineItemRow
            key={item.id}
            label={item.label}
            value={item.amount}
            onChange={(v) => updateItem(setCashItems)(item.id, v)}
          />
        ))}
        <LineItemRow
          label="Credit card debt (subtracted)"
          hint="Pay this down before you go if possible."
          value={creditDebt}
          onChange={setCreditDebt}
        />
        <div
          className="flex items-center justify-between py-3 border-b"
          style={{ borderColor: 'rgba(58,40,26,0.12)' }}
        >
          <span className="text-[15px]" style={{ color: 'rgba(58,40,26,0.7)' }}>
            Setup cost (automatic, from step 1)
          </span>
          <span className="text-[15px]" style={{ color: ESPRESSO_DEEP }}>
            &minus; {currency(totalSetup)}
          </span>
        </div>
        <div className="flex items-center justify-between py-4">
          <span className="font-semibold" style={{ color: ESPRESSO_DEEP }}>
            Net cash available for runway
          </span>
          <span className="text-xl font-bold" style={{ color: ESPRESSO_DEEP }}>
            {currency(netCash)}
          </span>
        </div>
      </SectionCard>

      <div className="max-w-2xl mx-auto px-6 -mt-6 mb-2 print:hidden">
        <div
          className="rounded-xl px-4 py-3 flex gap-2 items-start text-sm"
          style={{
            background: '#fff',
            border: '1px dashed rgba(58,40,26,0.25)',
            color: 'rgba(58,40,26,0.75)',
          }}
        >
          <Info size={16} className="mt-0.5 shrink-0" />
          <span>
            Assets you are keeping, like retirement accounts, property, or investments you do not
            want to sell, do not go in the boxes above. This is only the money you are actually
            willing to spend.
          </span>
        </div>
      </div>

      {/* Step 4: Runway dashboard */}
      <section className="py-16 px-6 print:hidden" style={{ background: DARK_GRADIENT }}>
        <div className="max-w-3xl mx-auto text-center">
          <span
            className="inline-block text-xs font-semibold uppercase tracking-[0.2em] px-4 py-1.5 rounded-full mb-6"
            style={{
              background: 'rgba(232,200,74,0.15)',
              color: '#E8C84A',
              border: '1px solid rgba(232,200,74,0.35)',
            }}
          >
            Step 4 · Your Runway Dashboard
          </span>

          {runway.upfront ? (
            <p style={{ ...heading, color: '#F5E070', fontSize: 'clamp(1.4rem,4vw,2rem)' }}>
              Your setup cost is bigger than your available cash right now. Adjust your numbers
              above, or give yourself more time to save. Knowing that today is the whole point.
            </p>
          ) : totalMonthly <= 0 ? (
            <p style={{ ...heading, color: '#F5E070', fontSize: 'clamp(1.4rem,4vw,2rem)' }}>
              Add your monthly costs above to see your runway.
            </p>
          ) : (
            <>
              <div
                style={{
                  ...heading,
                  color: '#F5E070',
                  fontSize: 'clamp(3rem,10vw,5.5rem)',
                  lineHeight: 1,
                }}
              >
                {runway.indefinite ? '36+' : runway.months}
              </div>
              <p className="text-white/80 text-lg mb-8">
                {runway.indefinite
                  ? 'months of runway, and counting. Your income covers your costs before the money runs out.'
                  : 'months of runway before you need revenue.'}
              </p>

              {/* Runway strip */}
              <div className="flex gap-1 justify-center flex-wrap mb-2">
                {Array.from({ length: stripMonths }).map((_, i) => {
                  const lit = i < litMonths;
                  const isEdge = i === litMonths - 1 && !runway.indefinite;
                  return (
                    <div key={i} className="relative" style={{ width: 16, height: 34 }}>
                      <div
                        className="w-full h-full rounded-sm transition-colors duration-300"
                        style={{ background: lit ? GOLD_GRADIENT : 'rgba(255,255,255,0.08)' }}
                      />
                      {isEdge && (
                        <Plane
                          size={16}
                          className="absolute -top-5 left-1/2"
                          style={{ color: '#F5E070', transform: 'translateX(-50%) rotate(-45deg)' }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
              <p className="text-white/40 text-xs mb-10">
                each bar is one month
                {runway.months && runway.months > stripMonths ? ` (showing first ${stripMonths})` : ''}
              </p>

              {/* Summary cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10 text-left">
                {[
                  ['Setup cost', currency(totalSetup)],
                  ['Monthly cost', currency(totalMonthly)],
                  ['Net cash', currency(netCash)],
                ].map(([k, v]) => (
                  <div
                    key={k}
                    className="rounded-2xl p-5"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                    }}
                  >
                    <p className="text-white/60 text-xs uppercase tracking-widest mb-1">{k}</p>
                    <p className="text-white text-2xl font-semibold">{v}</p>
                  </div>
                ))}
              </div>

              {/* Monthly breakdown bars */}
              {breakdownItems.length > 0 && (
                <div
                  className="rounded-2xl p-6 mb-10 text-left"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  <p className="text-white/80 font-semibold mb-4">Where your monthly money goes</p>
                  {breakdownItems.map((item) => (
                    <div key={item.id} className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-white/70">{item.label}</span>
                        <span className="text-white/90">{currency(item.amount)}</span>
                      </div>
                      <div
                        className="h-2 rounded-full overflow-hidden"
                        style={{ background: 'rgba(255,255,255,0.08)' }}
                      >
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${(item.amount / maxMonthlyItem) * 100}%`,
                            background: GOLD_GRADIENT,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Optional income extension */}
              <div
                className="max-w-sm mx-auto text-left rounded-2xl p-5"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <p className="text-white/70 text-sm mb-3">
                  Starting a business or freelancing once you land? Add expected income to see how
                  it extends your runway.
                </p>
                <div
                  className="flex items-center justify-between gap-4 py-3 border-b"
                  style={{ borderColor: 'rgba(255,255,255,0.1)' }}
                >
                  <label className="text-[15px] text-white/80">Expected monthly income</label>
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-white/50">$</span>
                    <input
                      type="number"
                      inputMode="numeric"
                      min="0"
                      placeholder="0"
                      value={monthlyIncome === 0 ? '' : monthlyIncome}
                      onChange={(e) =>
                        setMonthlyIncome(e.target.value === '' ? 0 : Number(e.target.value))
                      }
                      className="w-24 rounded-lg px-3 py-2 text-right text-[15px] focus:outline-none"
                      style={{
                        background: 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        color: '#fff',
                      }}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between gap-4 py-3">
                  <label className="text-[15px] text-white/80">Starting month</label>
                  <input
                    type="number"
                    min="1"
                    max="24"
                    value={incomeStartMonth}
                    onChange={(e) => setIncomeStartMonth(Number(e.target.value) || 1)}
                    className="w-20 rounded-lg px-3 py-2 text-right text-[15px] focus:outline-none"
                    style={{
                      background: 'rgba(255,255,255,0.1)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      color: '#fff',
                    }}
                  />
                </div>
              </div>
            </>
          )}

          <p className="text-white/40 text-xs mt-10">
            This is a planning estimate, not financial advice. Your numbers, your decisions.
          </p>
        </div>
      </section>

      {/* Download */}
      <section className="py-14 px-6 text-center print:hidden" style={{ background: SAGE }}>
        <div className="max-w-2xl mx-auto">
          <h3 style={{ ...heading, fontSize: 'clamp(1.5rem,4vw,2rem)', marginBottom: '0.5rem' }}>
            Take Your Dashboard With You
          </h3>
          <p className="mb-6" style={{ color: 'rgba(58,40,26,0.75)' }}>
            Download a one-page summary of your numbers. No email needed. Choose Save as PDF in the
            print window.
          </p>
          <button
            onClick={handleDownload}
            className="rounded-full px-10 py-3 text-sm font-semibold transition-all duration-300 hover:scale-[1.03] hover:shadow-md active:scale-[0.98]"
            style={{
              background: GOLD_GRADIENT,
              color: ESPRESSO_DEEP,
              border: '1.5px solid #2D1A00',
              boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            }}
          >
            Download My Dashboard
          </button>
        </div>
      </section>

      {/* Print-only summary */}
      <div id="leap-print-summary" className="hidden p-10" style={{ background: '#fff' }}>
        <p style={{ ...heading, fontSize: '1.6rem', marginBottom: '0.25rem' }}>My Leap Dashboard</p>
        <p className="text-xs mb-6" style={{ color: 'rgba(58,40,26,0.55)' }}>
          QuitYourLifeAndTravel.com &middot; a planning estimate, not financial advice
        </p>
        {[
          ['Total setup cost', currency(totalSetup)],
          ['Total monthly living cost', currency(totalMonthly)],
          ['Total cash', currency(totalCash)],
          ['Credit card debt', creditDebt > 0 ? `\u2212 ${currency(creditDebt)}` : currency(0)],
          ['Net cash available for runway', currency(netCash)],
        ].map(([k, v]) => (
          <div
            key={k}
            className="flex justify-between py-2 border-b"
            style={{ borderColor: 'rgba(58,40,26,0.15)' }}
          >
            <span style={{ color: ESPRESSO }}>{k}</span>
            <span className="font-semibold" style={{ color: ESPRESSO_DEEP }}>
              {v}
            </span>
          </div>
        ))}
        <div className="flex justify-between py-4">
          <span className="font-bold text-lg" style={{ color: ESPRESSO_DEEP }}>
            My runway
          </span>
          <span className="font-bold text-lg" style={{ color: '#8B6914' }}>
            {runwayLabel}
          </span>
        </div>
        {breakdownItems.length > 0 && (
          <>
            <p className="font-semibold mt-4 mb-2" style={{ color: ESPRESSO_DEEP }}>
              Monthly breakdown
            </p>
            {breakdownItems.map((item) => (
              <div key={item.id} className="flex justify-between py-1 text-sm">
                <span style={{ color: ESPRESSO }}>{item.label}</span>
                <span style={{ color: ESPRESSO_DEEP }}>{currency(item.amount)}</span>
              </div>
            ))}
          </>
        )}
        <p className="text-xs mt-8" style={{ color: 'rgba(58,40,26,0.55)' }}>
          Built with the free Leap Runway Calculator at quityourlifeandtravel.com/calculator
        </p>
      </div>

      {/* Email capture */}
      <section className="py-16 px-6 text-center print:hidden" style={{ background: CREAM }}>
        <div className="max-w-lg mx-auto">
          <h3 style={{ ...heading, fontSize: 'clamp(1.6rem,4vw,2.2rem)', marginBottom: '0.75rem' }}>
            Want This Saved as Your Own Leap Plan Kit?
          </h3>
          <p className="mb-6" style={{ color: 'rgba(58,40,26,0.75)' }}>
            I will send you the full 60-Day Leap Kit, the exact system I used to pack up my life
            and move to Thailand.
          </p>
          {emailStatus === 'success' ? (
            <p style={{ ...heading, color: ESPRESSO_DEEP, fontSize: '1.2rem' }}>
              Check your inbox. Your Leap Kit is on its way.
            </p>
          ) : (
            <form
              onSubmit={handleEmailSubmit}
              className="flex flex-col sm:flex-row items-center gap-3 justify-center"
            >
              <input
                type="email"
                required
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 w-full sm:w-64 px-4 py-3 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A030]"
                style={{
                  background: '#fff',
                  border: '1px solid rgba(58,40,26,0.2)',
                  color: ESPRESSO_DEEP,
                }}
              />
              <button
                type="submit"
                disabled={emailStatus === 'loading'}
                className="rounded-full px-8 py-3 text-sm font-semibold transition-all duration-300 hover:scale-[1.03] hover:shadow-md active:scale-[0.98] whitespace-nowrap shrink-0"
                style={{
                  background: GOLD_GRADIENT,
                  color: ESPRESSO_DEEP,
                  border: '1.5px solid #2D1A00',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                }}
              >
                {emailStatus === 'loading' ? 'Sending\u2026' : 'Email Me the Kit'}
              </button>
            </form>
          )}
          {emailStatus === 'error' && (
            <p className="text-red-600 text-xs mt-2">Something went wrong. Please try again.</p>
          )}
          <p className="mt-6 text-sm" style={{ color: 'rgba(58,40,26,0.6)' }}>
            Ready to talk it through instead?{' '}
            <a
              href="https://cal.com/qylat/leap-session"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
              style={{ color: ESPRESSO_DEEP }}
            >
              Book a Leap Session.
            </a>
          </p>
        </div>
      </section>
    </div>
  );
}
