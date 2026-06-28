import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const ALERT_TO = 'liz@quityourlifeandtravel.com';
const ALERT_FROM = 'noreply@quityourlifeandtravel.com';

// Max age for the trend cache before we consider it stale.
// The workflow runs daily at 3am UTC — 26h gives a comfortable buffer.
const TREND_CACHE_MAX_AGE_HOURS = 26;

interface CheckResult {
  name: string;
  ok: boolean;
  detail: string;
}

async function checkWebhook(name: string, url: string): Promise<CheckResult> {
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 10_000);

    // HEAD request: n8n returns 405 (method not allowed) when a workflow is active,
    // and 404 when the workflow is disabled or the path is unregistered.
    // No AI nodes are ever invoked — zero cost.
    const res = await fetch(url, { method: 'HEAD', signal: controller.signal });

    clearTimeout(id);

    // 404 = workflow is disabled/not registered = broken
    // 5xx = n8n server error = broken
    // anything else (405, 200, etc.) = endpoint exists = alive
    const ok = res.status !== 404 && res.status < 500;
    return { name, ok, detail: `HTTP ${res.status}` };
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    return { name, ok: false, detail };
  }
}

async function checkTrendCache(): Promise<CheckResult> {
  const name = 'Trend Cache Refresher';
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    const { data, error } = await supabase
      .from('trend_cache')
      .select('refreshed_at')
      .order('refreshed_at', { ascending: false })
      .limit(1)
      .single();

    if (error) return { name, ok: false, detail: error.message };
    if (!data?.refreshed_at) return { name, ok: false, detail: 'No rows in trend_cache' };

    const ageHours = (Date.now() - new Date(data.refreshed_at).getTime()) / 3_600_000;

    if (ageHours > TREND_CACHE_MAX_AGE_HOURS) {
      return {
        name,
        ok: false,
        detail: `Last refresh was ${ageHours.toFixed(1)}h ago (threshold: ${TREND_CACHE_MAX_AGE_HOURS}h)`,
      };
    }

    return { name, ok: true, detail: `Last refresh ${ageHours.toFixed(1)}h ago` };
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    return { name, ok: false, detail };
  }
}

async function sendAlert(failures: CheckResult[]) {
  const bullet = failures.map((f) => `• ${f.name}: ${f.detail}`).join('\n');
  const count = failures.length;

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: ALERT_FROM,
      to: ALERT_TO,
      subject: `⚠️ n8n Pipeline Alert — ${count} issue${count > 1 ? 's' : ''} detected`,
      text: [
        `The following n8n pipelines are down or unhealthy:\n`,
        bullet,
        `\nCheck n8n: https://n8n.ideatoplan.to`,
        `Detected at: ${new Date().toUTCString()}`,
      ].join('\n'),
    }),
  });
}

export async function GET(request: Request) {
  const auth = request.headers.get('authorization');
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const results = await Promise.all([
    checkWebhook('Quiz Match', process.env.N8N_QUIZ_WEBHOOK_URL!),
    checkWebhook('Idea Submission', process.env.N8N_I2P_WEBHOOK_URL!),
    checkTrendCache(),
  ]);

  const failures = results.filter((r) => !r.ok);

  if (failures.length > 0 && process.env.RESEND_API_KEY) {
    await sendAlert(failures);
  }

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    results,
    alertSent: failures.length > 0,
  });
}
