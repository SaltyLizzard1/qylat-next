import { after } from 'next/server';
import { checkRateLimit, clientIp } from '../../../lib/rateLimit';
import { EMAIL_SOURCES, NEWSLETTER_LABEL, isEmailSource } from '../../../lib/emailSources';
import { alertOwner } from '../../../lib/ownerAlert';
import { isValidReportToken } from '../../../lib/reportToken';

export const maxDuration = 15;

const BRAND = 'qylat';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RESULT_ID_RE = /^[a-f0-9]{12}$/;

// Only flat string and number values, capped, so a caller cannot park
// arbitrary payloads in the captures table.
function cleanFields(input: unknown): Record<string, string | number> {
  const out: Record<string, string | number> = {};
  if (!input || typeof input !== 'object' || Array.isArray(input)) return out;
  for (const [k, v] of Object.entries(input as Record<string, unknown>).slice(0, 10)) {
    if (!/^[a-z0-9_]{1,40}$/.test(k)) continue;
    if (typeof v === 'number' && Number.isFinite(v)) out[k] = v;
    else if (typeof v === 'string' && v.length <= 200) out[k] = v;
  }
  return out;
}

// Wakes the n8n send worker so the email goes out in seconds. The worker also
// runs on a schedule, so a missed kick delays the send and never loses it.
async function kickWorker() {
  const url = process.env.N8N_EMAIL_KICK_WEBHOOK_URL;
  if (!url) {
    console.warn('N8N_EMAIL_KICK_WEBHOOK_URL is not set; the send waits for the scheduled worker run');
    return;
  }
  const secret = process.env.N8N_WEBHOOK_SECRET;
  if (!secret) {
    console.warn('N8N_WEBHOOK_SECRET is not set; sending kick without X-Webhook-Secret header');
  }
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(secret ? { 'X-Webhook-Secret': secret } : {}),
      },
      body: JSON.stringify({ brand: BRAND }),
      signal: AbortSignal.timeout(5_000),
    });
    if (!res.ok) console.warn('Email worker kick returned', res.status);
  } catch (err) {
    console.warn('Email worker kick failed; the scheduled run will pick the row up:', err);
  }
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const { source, email, fields, resultId, reportToken, newsletterOptIn } = (body ?? {}) as Record<string, unknown>;
  const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

  if (!isEmailSource(source) || cleanEmail.length > 254 || !EMAIL_RE.test(cleanEmail)) {
    return Response.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const allowed = await checkRateLimit(`qylat-subscribe:${clientIp(req)}`, 10, 3600);
  if (!allowed) {
    return Response.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
  }

  const config = EMAIL_SOURCES[source];

  // The footer form is the newsletter signup. Everywhere else the Leap Log is
  // on only when the visitor ticked the box: anything but a literal true is no.
  const optIn = config.newsletter === 'implicit' ? true : newsletterOptIn === true;
  const consentText = config.newsletter === 'implicit' ? config.notice : `Ticked: ${NEWSLETTER_LABEL}`;

  // An assessment report is scoped to its saved result, and only the browser
  // that took the assessment holds the token for it. A missing or malformed id,
  // or a missing or wrong token, is passed as an empty scope, which the
  // database reports as unavailable rather than sending anything.
  const scope =
    config.purpose === 'assessment_report' &&
    typeof resultId === 'string' &&
    RESULT_ID_RE.test(resultId) &&
    isValidReportToken(resultId, reportToken)
      ? resultId
      : '';

  try {
    const { supabase } = await import('../../../lib/supabase');
    const { error } = await supabase.rpc('capture_subscriber', {
      p_brand: BRAND,
      p_email: cleanEmail,
      p_source: source,
      p_purpose: config.purpose,
      p_resource_template: config.resourceTemplate,
      p_scope: scope,
      p_window_days: config.windowDays,
      p_newsletter_opt_in: optIn,
      p_notice_text: config.notice,
      p_newsletter_consent_text: consentText,
      p_fields: cleanFields(fields),
    });
    if (error) throw new Error(error.message);
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    console.error('capture_subscriber failed:', detail);
    after(() => alertOwner('capture not recorded', `Source: ${source}\nError: ${detail}`));
    return Response.json({ error: 'Something went wrong. Please try again.' }, { status: 502 });
  }

  after(kickWorker);
  return Response.json({ ok: true });
}
