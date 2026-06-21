import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const webhookUrl = process.env.N8N_I2P_WEBHOOK_URL;
    if (!webhookUrl) {
      console.error('N8N_I2P_WEBHOOK_URL is not set');
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
    }

    const upstream = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!upstream.ok) {
      console.error('n8n webhook error:', upstream.status, await upstream.text());
      return NextResponse.json({ error: 'Submission failed' }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Submit idea error:', err);
    return NextResponse.json({ error: 'Submission failed' }, { status: 500 });
  }
}
