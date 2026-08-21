import { checkRateLimit, clientIp } from '../../../lib/rateLimit';
import { isValidAnswerArray, scoreAnswers } from '../../../lib/leapTest';

export const maxDuration = 15;

export async function POST(req: Request) {
  try {
    const allowed = await checkRateLimit(`qylat-leap-test:${clientIp(req)}`, 5, 3600);
    if (!allowed) {
      return Response.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return Response.json({ error: 'Invalid request.' }, { status: 400 });
    }

    const answers =
      body && typeof body === 'object' ? (body as { answers?: unknown }).answers : undefined;

    if (!isValidAnswerArray(answers)) {
      return Response.json({ error: 'Invalid request.' }, { status: 400 });
    }

    const { scores, archetype } = scoreAnswers(answers);

    let id: string | undefined;
    try {
      const { supabase } = await import('../../../lib/supabase');
      const shortId = crypto.randomUUID().replace(/-/g, '').slice(0, 12);
      const { error } = await supabase
        .from('leap_test_results')
        .insert({ id: shortId, scores, archetype });
      if (error) {
        console.error('Supabase insert error (leap_test_results):', error);
      } else {
        id = shortId;
      }
    } catch (err) {
      console.error('Supabase persistence error (leap_test_results):', err);
    }

    if (!id) {
      return Response.json(
        { error: 'Something went wrong saving your result. Please try again.' },
        { status: 502 }
      );
    }

    return Response.json({ id, scores, archetype });
  } catch (err) {
    console.error('Leap Test API error:', err);
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
}
