import { checkRateLimit, clientIp } from '../../../../../lib/rateLimit';
import { isValidReportToken } from '../../../../../lib/reportToken';

export const maxDuration = 15;

const ID_RE = /^[a-f0-9]{12}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Returns matches 2..n of one saved result. The results page sends only the
// first match to the browser; the rest are fetched here after the visitor
// gives an email, or presents the report token from their own report email.
// The token is tied to one result id, so it opens that result and no other.
// quiz_results is shared with IdeaToPlan, so only rows saved by this site are
// served, whichever way the request is authorized.
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  if (!ID_RE.test(id)) {
    return Response.json({ error: 'Not found.' }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const { email, reportToken } = (body ?? {}) as { email?: unknown; reportToken?: unknown };
  if (reportToken !== undefined) {
    // A token that is present must be right. A wrong one is refused outright
    // and never falls back to the email path.
    if (!isValidReportToken(id, reportToken)) {
      return Response.json({ error: 'Not authorized.' }, { status: 403 });
    }
  } else {
    const cleanEmail = typeof email === 'string' ? email.trim() : '';
    if (cleanEmail.length > 254 || !EMAIL_RE.test(cleanEmail)) {
      return Response.json({ error: 'Invalid request.' }, { status: 400 });
    }
  }

  const allowed = await checkRateLimit(`qylat-results-unlock:${clientIp(req)}`, 20, 3600);
  if (!allowed) {
    return Response.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
  }

  try {
    const { supabase } = await import('../../../../../lib/supabase');
    const { data, error } = await supabase
      .from('quiz_results')
      .select('matches')
      .eq('id', id)
      .eq('site', 'qylat')
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data || !Array.isArray(data.matches)) {
      return Response.json({ error: 'Not found.' }, { status: 404 });
    }

    return Response.json(
      { matches: data.matches.slice(1) },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (err) {
    console.error('Results unlock error:', err);
    return Response.json({ error: 'Something went wrong. Try again.' }, { status: 502 });
  }
}
