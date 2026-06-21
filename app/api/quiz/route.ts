export const maxDuration = 180;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const webhookUrl = process.env.N8N_QUIZ_WEBHOOK_URL;
    if (!webhookUrl) {
      return Response.json({ error: 'Webhook not configured' }, { status: 500 });
    }

    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(175_000),
    });

    const text = await res.text();
    if (!res.ok) {
      console.error('n8n quiz webhook error:', res.status, text);
      return Response.json({ error: `Upstream error: ${res.status}`, detail: text }, { status: 502 });
    }

    try {
      return Response.json(JSON.parse(text));
    } catch {
      console.error('n8n response was not JSON:', text);
      return Response.json({ error: 'Invalid response from workflow', detail: text }, { status: 502 });
    }
  } catch (err) {
    console.error('Quiz API error:', err);
    return Response.json({ error: 'Internal error', detail: String(err) }, { status: 500 });
  }
}
