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
const MONTHLY_BG = '#D6E2C9';
const SETUP_BG = '#F0E6C8';
const NET_CASH_BG = '#E4DED0';

const heading = {
  fontFamily: "'Cormorant Garamond', Georgia, serif",
  fontWeight: 700,
  color: ESPRESSO_DEEP,
} as const;

const KIT_FORM_URL = 'https://app.kit.com/forms/9243576/subscriptions';

// ── Types ───────────────────────────────────────────────────────────────────

interface LineItem {
  id: string;
  label: string;
  amount: number;
  hint?: string;
}

// ── Baseline defaults: generous Chiang Mai planning numbers ─────────────────

const MONTHLY_DEFAULTS: LineItem[] = [
  { id: 'rent', label: 'Rent (single person condo or apartment)', amount: 280, hint: 'Around 8,000 to 10,000 baht. This uses the top of that range.' },
  { id: 'electric', label: 'Electricity', amount: 85 },
  { id: 'internet', label: 'Home internet (optional)', amount: 20 },
  { id: 'phone', label: 'Phone and SIM', amount: 20 },
  { id: 'groceries', label: 'Groceries', amount: 200, hint: 'Food is the most flexible line there is. Street food stretches it. Western dining spends it.' },
  { id: 'dining', label: 'Dining out and cafes', amount: 200 },
  { id: 'transport', label: 'Motorbike rental and gas', amount: 145, hint: 'Renting runs about 4,500 baht a month plus roughly 150 baht a week in gas.' },
  { id: 'coworking', label: 'Coworking or cafe work sessions', amount: 60, hint: 'Easy to cut if you work from home.' },
  { id: 'entertainment', label: 'Entertainment and social', amount: 300, hint: 'This is my real number. Plenty of people spend less. Cut it to fit your life.' },
  { id: 'laundry', label: 'Laundry', amount: 40, hint: 'About 300 baht a week.' },
  { id: 'misc', label: 'Miscellaneous', amount: 100 },
  { id: 'insurance', label: 'Health insurance', amount: 180, hint: 'Get quotes before you leave. Average is $100 to $200 a month.' },
];

const SETUP_DEFAULTS: LineItem[] = [
  { id: 'hotels', label: 'First stop: hotels', amount: 450 },
  { id: 'food', label: 'First stop: food', amount: 150 },
  { id: 'localtransport', label: 'First stop: local transport', amount: 75 },
  { id: 'activities', label: 'First stop: activities and misc', amount: 100 },
  { id: 'transit', label: 'Transit stop: hotel, food, and transport', amount: 150 },
  { id: 'flight', label: 'Flight to Thailand', amount: 800 },
  { id: 'temphousing', label: 'Temporary housing (first 2 weeks)', amount: 400 },
  { id: 'bikepurchase', label: 'Motorbike purchase (if buying instead of renting)', amount: 0, hint: 'Renting is already in your monthly costs. Buying runs $700 or more.' },
  { id: 'license', label: 'License and medical if required', amount: 75 },
  { id: 'gear', label: 'Gear and safety equipment', amount: 150 },
];

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

function BufferRow({
  pct,
  onPctChange,
  amount,
  note,
}: {
  pct: number;
  onPctChange: (v: number) => void;
  amount: number;
  note: string;
}) {
  return (
    <div className="py-3 border-b" style={{ borderColor: 'rgba(58,40,26,0.12)' }}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <label className="text-[15px] block font-medium" style={{ color: ESPRESSO_DEEP }}>
            Buffer for the unknowns
          </label>
          <span className="text-xs" style={{ color: 'rgba(58,40,26,0.55)' }}>
            {note}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center">
            <input
              type="number"
              inputMode="numeric"
              min="0"
              max="100"
              value={pct}
              onChange={(e) => onPctChange(Number(e.target.value) || 0)}
              className="w-14 rounded-lg px-2 py-2 text-right text-[15px] focus:outline-none"
              style={{
                background: '#fff',
                border: '1px solid rgba(58,40,26,0.2)',
                color: ESPRESSO_DEEP,
              }}
            />
            <span className="text-sm ml-1" style={{ color: 'rgba(58,40,26,0.55)' }}>
              %
            </span>
          </div>
          <span className="text-[15px] font-semibold w-20 text-right" style={{ color: ESPRESSO_DEEP }}>
            {currency(amount)}
          </span>
        </div>
      </div>
    </div>
  );
}

function shortLabel(label: string): string {
  return label.split(' (')[0];
}

function ExpenseList({
  items,
  onItemChange,
  bufferPct,
  onBufferPctChange,
  bufferAmount,
  bufferNote,
  total,
  totalLabel,
  footNote,
  expanded,
  onToggle,
}: {
  items: LineItem[];
  onItemChange: (id: string, amount: number) => void;
  bufferPct: number;
  onBufferPctChange: (v: number) => void;
  bufferAmount: number;
  bufferNote: string;
  total: number;
  totalLabel: string;
  footNote?: string;
  expanded: boolean;
  onToggle: () => void;
}) {
  const previewCount = 3;
  const previewNames = items.slice(0, previewCount).map((i) => shortLabel(i.label));
  const remaining = items.length - previewCount;

  return (
    <div>
      <div className="flex items-center justify-between py-4">
        <span className="font-semibold" style={{ color: ESPRESSO_DEEP }}>
          {totalLabel}
        </span>
        <span className="text-xl font-bold" style={{ color: ESPRESSO_DEEP }}>
          {currency(total)}
        </span>
      </div>

      {!expanded && (
        <p className="text-xs pb-3" style={{ color: 'rgba(58,40,26,0.6)' }}>
          {previewNames.join(', ')}
          {remaining > 0 ? `, and ${remaining} more` : ''}
        </p>
      )}

      <button
        type="button"
        onClick={onToggle}
        className="text-sm font-semibold underline underline-offset-4 pb-3"
        style={{ color: '#8B6914' }}
      >
        {expanded ? 'Hide details' : 'See what\u2019s included'}
      </button>

      {expanded && (
        <div className="mt-1">
          {items.map((item) => (
            <LineItemRow
              key={item.id}
              label={item.label}
              hint={item.hint}
              value={item.amount}
              onChange={(v) => onItemChange(item.id, v)}
            />
          ))}
          <BufferRow pct={bufferPct} onPctChange={onBufferPctChange} amount={bufferAmount} note={bufferNote} />
        </div>
      )}

      {footNote && (
        <p className="text-xs pb-4 pt-1" style={{ color: 'rgba(58,40,26,0.55)' }}>
          {footNote}
        </p>
      )}
    </div>
  );
}

function SectionShell({
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
          className="inline-block text-xs font-semibold uppercase tracking-[0.2em] px-4 py-1.5 rounded-full mb-5"
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
            border: '1px solid rgba(58,40,26,0.22)',
            boxShadow: '0 8px 30px rgba(58,40,26,0.14)',
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
  const [cash, setCash] = useState(0);
  const [debt, setDebt] = useState(0);

  const [monthlyItems, setMonthlyItems] = useState<LineItem[]>(MONTHLY_DEFAULTS);
  const [setupItems, setSetupItems] = useState<LineItem[]>(SETUP_DEFAULTS);
  const [monthlyBufferPct, setMonthlyBufferPct] = useState(20);
  const [setupBufferPct, setSetupBufferPct] = useState(25);

  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [incomeStartMonth, setIncomeStartMonth] = useState(4);

  const [monthlyExpanded, setMonthlyExpanded] = useState(false);
  const [setupExpanded, setSetupExpanded] = useState(false);

  const [email, setEmail] = useState('');
  const [emailStatus, setEmailStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const updateItem =
    (setter: React.Dispatch<React.SetStateAction<LineItem[]>>) => (id: string, amount: number) =>
      setter((items) => items.map((it) => (it.id === id ? { ...it, amount } : it)));

  const monthlySubtotal = useMemo(
    () => monthlyItems.reduce((s, i) => s + i.amount, 0),
    [monthlyItems]
  );
  const monthlyBuffer = Math.round((monthlySubtotal * monthlyBufferPct) / 100);
  const totalMonthly = monthlySubtotal + monthlyBuffer;

  const setupSubtotal = useMemo(() => setupItems.reduce((s, i) => s + i.amount, 0), [setupItems]);
  const setupBuffer = Math.round((setupSubtotal * setupBufferPct) / 100);
  const totalSetup = setupSubtotal + setupBuffer;

  const netCash = cash - debt - totalSetup;

  const runway = useMemo(() => {
    if (totalMonthly <= 0) return { months: null as number | null, indefinite: false, upfront: netCash <= 0 };
    if (netCash <= 0) return { months: 0, indefinite: false, upfront: true };
    let remaining = netCash;
    for (let m = 1; m <= 60; m++) {
      remaining -= totalMonthly;
      if (m >= incomeStartMonth) remaining += monthlyIncome;
      if (remaining <= 0) return { months: m, indefinite: false, upfront: false };
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

  const hasCash = cash > 0;

  const breakdownItems = monthlyItems.filter((i) => i.amount > 0);
  const maxMonthlyItem = Math.max(1, ...breakdownItems.map((i) => i.amount));

  const handleDownload = () => {
    window.print();
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailStatus('loading');
    try {
      const res = await fetch(KIT_FORM_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          email_address: email,
          'fields[calc_setup_cost]': String(totalSetup),
          'fields[calc_monthly_cost]': String(totalMonthly),
          'fields[calc_net_cash]': String(netCash),
          'fields[calc_runway_months]': String(runway.months ?? 0),
        }).toString(),
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

  return (
    <div className="font-sans" style={hasCash ? { paddingBottom: '92px' } : undefined}>
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

      {/* Hero + the one question */}
      <section className="pt-6 pb-16 px-6 text-center print:hidden" style={{ background: CREAM }}>
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
          How Much Do You Need to Leap? Start With What You Have.
        </h1>
        <p className="max-w-xl mx-auto text-lg mb-8" style={{ color: 'rgba(58,40,26,0.8)' }}>
          You do not need to know what Thailand costs. I already filled that in from living here.
          Just answer one question.
        </p>

        <div
          className="max-w-md mx-auto rounded-2xl p-6 text-left"
          style={{
            background: '#fff',
            border: '1px solid rgba(58,40,26,0.22)',
            boxShadow: '0 8px 30px rgba(58,40,26,0.14)',
          }}
        >
          <label className="block text-lg font-semibold mb-2" style={{ color: ESPRESSO_DEEP }}>
            How much do you have?
          </label>
          <div className="flex items-center gap-2">
            <span className="text-xl" style={{ color: 'rgba(58,40,26,0.55)' }}>
              $
            </span>
            <input
              type="number"
              inputMode="numeric"
              min="0"
              placeholder="Cash you are willing to spend"
              value={cash === 0 ? '' : cash}
              onChange={(e) => setCash(e.target.value === '' ? 0 : Number(e.target.value))}
              className="flex-1 min-w-0 rounded-xl px-4 py-3 text-xl focus:outline-none focus:ring-2 focus:ring-[#C9A030]"
              style={{
                background: CREAM,
                border: '1px solid rgba(58,40,26,0.2)',
                color: ESPRESSO_DEEP,
              }}
            />
          </div>
          <p className="text-xs mt-2" style={{ color: 'rgba(58,40,26,0.55)' }}>
            Savings, checking, anything you can actually get to, but only what you are truly
            willing to spend down. Retirement accounts, property, and investments you want to
            keep do not count.
          </p>
          <div className="mt-4">
            <LineItemRow
              label="Credit card debt (optional, subtracted)"
              hint="Pay this down before you go if possible."
              value={debt}
              onChange={setDebt}
            />
          </div>
        </div>

        {/* Instant runway answer */}
        {hasCash && (
          <div className="max-w-md mx-auto mt-6">
            <div
              className="rounded-2xl px-6 py-5"
              style={{ background: DARK_GRADIENT, border: '1px solid rgba(232,200,74,0.3)' }}
            >
              {runway.upfront ? (
                <p style={{ ...heading, color: '#F5E070', fontSize: '1.15rem' }}>
                  Getting there costs about {currency(totalSetup)}, which is more than your
                  spendable cash right now. Knowing that today is the whole point. Scroll down
                  and adjust.
                </p>
              ) : (
                <>
                  <p className="text-white/70 text-sm mb-1">That gives you roughly</p>
                  <p style={{ ...heading, color: '#F5E070', fontSize: 'clamp(2rem,6vw,3rem)', lineHeight: 1 }}>
                    {runway.indefinite ? '36+' : runway.months} months
                  </p>
                  <p className="text-white/70 text-sm mt-1">
                    in Chiang Mai, after about {currency(totalSetup)} to get there and
                    {' '}{currency(totalMonthly)} a month to live. Generous estimates, on purpose.
                  </p>
                </>
              )}
            </div>
            <p className="text-xs mt-3" style={{ color: 'rgba(58,40,26,0.6)' }}>
              Every number behind this is below, already filled in. Adjust anything to fit your life.
            </p>
          </div>
        )}

        <p className="max-w-xl mx-auto text-sm italic mt-8" style={{ color: 'rgba(58,40,26,0.6)' }}>
          My real numbers: I left with $35k. Setup cost me $2,720 and life here runs $1,838 a
          month. Knowing my runway is what made the leap feel possible instead of terrifying.
        </p>
      </section>

      {/* Monthly baseline */}
      <SectionShell
        eyebrow="The Baseline · Monthly"
        title="What Life in Chiang Mai Costs"
        subtitle="Pre-filled with generous planning numbers from actually living here. Adjust any line to match your style."
        bg={MONTHLY_BG}
      >
        <ExpenseList
          items={monthlyItems}
          onItemChange={updateItem(setMonthlyItems)}
          bufferPct={monthlyBufferPct}
          onBufferPctChange={setMonthlyBufferPct}
          bufferAmount={monthlyBuffer}
          bufferNote="Auto-calculated so it cannot be forgotten. Something always costs more than you planned."
          total={totalMonthly}
          totalLabel="Total monthly cost"
          footNote="For honesty: my real month runs $1,838. This baseline lands a little above that on purpose. Plan generous, get surprised in the good direction."
          expanded={monthlyExpanded}
          onToggle={() => setMonthlyExpanded((v) => !v)}
        />
      </SectionShell>

      {/* Setup baseline */}
      <SectionShell
        eyebrow="The Baseline · Getting There"
        title="What Your Arrival Costs"
        subtitle="One-time costs from your front door to settled in Thailand, pre-filled and editable."
        bg={SETUP_BG}
      >
        <ExpenseList
          items={setupItems}
          onItemChange={updateItem(setSetupItems)}
          bufferPct={setupBufferPct}
          onBufferPctChange={setSetupBufferPct}
          bufferAmount={setupBuffer}
          bufferNote="Be generous here. Luggage breaks. You end up buying shoes. Visa fees cost more than listed. Something always does."
          total={totalSetup}
          totalLabel="Total setup cost"
          footNote="I spent $2,720 getting here and skipped the buffer. Do not be me."
          expanded={setupExpanded}
          onToggle={() => setSetupExpanded((v) => !v)}
        />
      </SectionShell>

      {/* Net cash summary */}
      <section className="py-10 px-6 print:hidden" style={{ background: NET_CASH_BG }}>
        <div className="max-w-2xl mx-auto">
          <div
            className="rounded-xl px-5 py-4"
            style={{ background: '#fff', border: '1px solid rgba(58,40,26,0.22)', boxShadow: '0 8px 30px rgba(58,40,26,0.14)' }}
          >
            <div className="flex justify-between py-1 text-[15px]" style={{ color: ESPRESSO }}>
              <span>Your cash</span>
              <span>{currency(cash)}</span>
            </div>
            {debt > 0 && (
              <div className="flex justify-between py-1 text-[15px]" style={{ color: ESPRESSO }}>
                <span>Credit card debt</span>
                <span>&minus; {currency(debt)}</span>
              </div>
            )}
            <div className="flex justify-between py-1 text-[15px]" style={{ color: ESPRESSO }}>
              <span>Setup cost</span>
              <span>&minus; {currency(totalSetup)}</span>
            </div>
            <div
              className="flex justify-between py-2 mt-1 border-t font-semibold"
              style={{ borderColor: 'rgba(58,40,26,0.15)', color: ESPRESSO_DEEP }}
            >
              <span>Net cash for your runway</span>
              <span>{currency(netCash)}</span>
            </div>
          </div>

          <div
            className="mt-4 rounded-xl px-4 py-3 flex gap-2 items-start text-sm"
            style={{
              background: '#fff',
              border: '1px dashed rgba(58,40,26,0.25)',
              color: 'rgba(58,40,26,0.75)',
            }}
          >
            <Info size={16} className="mt-0.5 shrink-0" />
            <span>
              Assets you are keeping, like retirement accounts, property, or investments you do
              not want to sell, stay out of this math. This is only the money you are actually
              willing to spend.
            </span>
          </div>
        </div>
      </section>

      {/* Runway dashboard */}
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
            Your Runway Dashboard
          </span>

          {!hasCash ? (
            <p style={{ ...heading, color: '#F5E070', fontSize: 'clamp(1.4rem,4vw,2rem)' }}>
              Enter what you have at the top of the page and your full dashboard appears here.
            </p>
          ) : runway.upfront ? (
            <p style={{ ...heading, color: '#F5E070', fontSize: 'clamp(1.4rem,4vw,2rem)' }}>
              Your setup cost is bigger than your available cash right now. Adjust the baseline
              above, or give yourself more time to save. Knowing that today is the whole point.
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
          ['My cash', currency(cash)],
          ['Credit card debt', debt > 0 ? `\u2212 ${currency(debt)}` : currency(0)],
          ['Setup cost (with buffer)', currency(totalSetup)],
          ['Monthly living cost (with buffer)', currency(totalMonthly)],
          ['Net cash for runway', currency(netCash)],
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
            <div className="flex justify-between py-1 text-sm">
              <span style={{ color: ESPRESSO }}>Buffer ({monthlyBufferPct}%)</span>
              <span style={{ color: ESPRESSO_DEEP }}>{currency(monthlyBuffer)}</span>
            </div>
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
            Want the Plan That Goes With the Numbers?
          </h3>
          <p className="mb-6" style={{ color: 'rgba(58,40,26,0.75)' }}>
            I will send you the free 60-Day Leap Kit, the exact system I used to pack up my life
            and move to Thailand.
          </p>
          {emailStatus === 'success' ? (
            <p style={{ ...heading, color: ESPRESSO_DEEP, fontSize: '1.2rem' }}>
              Check your inbox. Your Leap Kit is on its way. Already subscribed or want it
              now?{' '}
              <a
                href="/60-day-leap-plan.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
                style={{ color: ESPRESSO_DEEP }}
              >
                Download it here.
              </a>
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
                className="flex-1 min-w-0 w-full sm:w-64 px-4 py-3 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A030]"
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

      {hasCash && (
        <div
          className="print:hidden fixed bottom-0 left-0 right-0 z-40 px-6"
          style={{
            background: DARK_GRADIENT,
            borderTop: '1px solid rgba(232,200,74,0.25)',
            paddingBottom: 'max(env(safe-area-inset-bottom), 0.75rem)',
            paddingTop: '0.75rem',
          }}
        >
          <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
            {runway.upfront ? (
              <p className="text-sm" style={{ color: '#F5E070' }}>
                Setup cost is more than your available cash right now. Adjust the numbers above.
              </p>
            ) : (
              <>
                <div>
                  <p style={{ ...heading, color: '#F5E070', fontSize: '1.4rem', lineHeight: 1 }}>
                    {runway.indefinite ? '36+' : runway.months} months
                  </p>
                  <p className="text-xs text-white/60">of runway at {currency(totalMonthly)}/mo</p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
