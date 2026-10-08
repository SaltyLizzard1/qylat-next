import { createHmac, timingSafeEqual } from 'node:crypto';

export const maxDuration = 15;

const TOLERANCE_SECONDS = 300;

// Resend signs webhooks with Svix: HMAC-SHA256 over "id.timestamp.body" using
// the base64 part of the whsec_ secret.
function verify(body: string, headers: Headers, secret: string): boolean {
  const id = headers.get('svix-id');
  const timestamp = headers.get('svix-timestamp');
  const signatures = headers.get('svix-signature');
  if (!id || !timestamp || !signatures) return false;

  const age = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (!Number.isFinite(age) || age > TOLERANCE_SECONDS) return false;

  const key = Buffer.from(secret.replace(/^whsec_/, ''), 'base64');
  const expected = createHmac('sha256', key).update(`${id}.${timestamp}.${body}`).digest();

  return signatures.split(' ').some((entry) => {
    const [version, value] = entry.split(',');
    if (version !== 'v1' || !value) return false;
    const given = Buffer.from(value, 'base64');
    return given.length === expected.length && timingSafeEqual(given, expected);
  });
}

// Maps a Resend event to the status stored on the send. A soft bounce is
// recorded but does not suppress the address; a permanent one does.
function toEvent(type: string, data: Record<string, unknown>): string | null {
  if (type === 'email.delivered') return 'delivered';
  if (type === 'email.complained') return 'complained';
  if (type === 'email.delivery_delayed') return 'delayed';
  if (type === 'email.bounced') {
    const bounce = data.bounce as { type?: string } | undefined;
    return bounce?.type === 'Permanent' ? 'bounced' : 'soft_bounced';
  }
  return null;
}

export async function POST(req: Request) {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (!secret) {
    console.error('RESEND_WEBHOOK_SECRET is not set; delivery event rejected');
    return Response.json({ error: 'Not configured' }, { status: 500 });
  }

  const body = await req.text();
  if (!verify(body, req.headers, secret)) {
    return Response.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let payload: { type?: string; created_at?: string; data?: Record<string, unknown> };
  try {
    payload = JSON.parse(body);
  } catch {
    return Response.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const data = payload.data ?? {};
  const event = toEvent(payload.type ?? '', data);
  const messageId = typeof data.email_id === 'string' ? data.email_id : '';
  if (!event || !messageId) return Response.json({ ok: true, ignored: true });

  try {
    const { supabase } = await import('../../../lib/supabase');
    const { error } = await supabase.rpc('record_delivery_event', {
      p_provider_message_id: messageId,
      p_event: event,
      p_at: payload.created_at ?? null,
    });
    if (error) throw new Error(error.message);
  } catch (err) {
    // A 5xx makes Resend retry the event, which is what we want here.
    console.error('record_delivery_event failed:', err);
    return Response.json({ error: 'Not recorded' }, { status: 502 });
  }

  return Response.json({ ok: true });
}
