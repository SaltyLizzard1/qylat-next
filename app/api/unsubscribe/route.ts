import { checkRateLimit, clientIp } from '../../../lib/rateLimit';

export const maxDuration = 15;

const TOKEN_RE = /^[a-f0-9]{64}$/;

// Handles two callers. The /unsubscribe page posts JSON after the visitor
// confirms. Mail clients post the RFC 8058 one-click form body straight to
// this URL with the token in the query string. Both need no login.
export async function POST(req: Request) {
  const url = new URL(req.url);
  let token = url.searchParams.get('token') ?? '';
  let reason = 'one-click header';

  if ((req.headers.get('content-type') ?? '').includes('application/json')) {
    try {
      const body = (await req.json()) as { token?: unknown };
      if (typeof body.token === 'string') token = body.token;
      reason = 'unsubscribe page';
    } catch {
      return Response.json({ error: 'Invalid request.' }, { status: 400 });
    }
  }

  if (!TOKEN_RE.test(token)) {
    return Response.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const allowed = await checkRateLimit(`qylat-unsubscribe:${clientIp(req)}`, 20, 3600);
  if (!allowed) {
    return Response.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
  }

  try {
    const { supabase } = await import('../../../lib/supabase');
    const { data, error } = await supabase.rpc('unsubscribe_by_token', {
      p_token: token,
      p_reason: reason,
    });
    if (error) throw new Error(error.message);
    if (data !== true) return Response.json({ error: 'Link not recognised.' }, { status: 404 });
  } catch (err) {
    console.error('unsubscribe_by_token failed:', err);
    return Response.json({ error: 'Something went wrong. Please try again.' }, { status: 502 });
  }

  return Response.json({ ok: true });
}
