import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { classifyWebhookProbe } from '../../../../lib/healthProbe';

const ALERT_TO = 'liz@ideatoplan.to';
// Resend has verified quityourlifeandtravel.com itself. A from address on the
// send. subdomain is rejected with a 403, which is why no alert was delivered
// before this was corrected.
const ALERT_FROM = 'noreply@quityourlifeandtravel.com';

// Max age for the trend cache before we consider it stale.
// The workflow runs daily at 3am UTC, 26h gives a comfortable buffer.
const TREND_CACHE_MAX_AGE_HOURS = 26;

interface CheckResult {
  name: string;
  ok: boolean;
  detail: string;
}

async function checkWebhook(name: string, url: string | undefined): Promise<CheckResult> {
  if (!url) return { name, ok: false, detail: 'webhook URL env var is not set' };
  try {
    // GET, not HEAD: see lib/healthProbe.ts for why, and for what a pass does
    // and does not prove. No workflow runs and no AI node is invoked.
    const res = await fetch(url, { method: 'GET', signal: AbortSignal.timeout(10_000) });
    const body = await res.text();
    return { name, ...classifyWebhookProbe(res.status, body) };
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

// Returns null when Resend accepted the alert, otherwise the reason it did not.
async function sendAlert(failures: CheckResult[]): Promise<string | null> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return 'RESEND_API_KEY is not set';

  const bullet = failures.map((f) => `• ${f.name}: ${f.detail}`).join('\n');
  const count = failures.length;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: ALERT_FROM,
        to: ALERT_TO,
        subject: `⚠️ n8n Pipeline Alert: ${count} issue${count > 1 ? 's' : ''} detected`,
        text: [
          `The following n8n pipelines are down or unhealthy:\n`,
          bullet,
          `\nCheck n8n: https://n8n.ideatoplan.to`,
          `Detected at: ${new Date().toUTCString()}`,
        ].join('\n'),
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (res.ok) return null;
    return `Resend answered HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`;
  } catch (err) {
    return err instanceof Error ? err.message : String(err);
  }
}

export async function GET(request: Request) {
  const auth = request.headers.get('authorization');
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const results = await Promise.all([
    checkWebhook('Quiz Match', process.env.N8N_QUIZ_WEBHOOK_URL),
    checkWebhook('Idea Submission', process.env.N8N_I2P_WEBHOOK_URL),
    checkTrendCache(),
  ]);

  const failures = results.filter((r) => !r.ok);

  let alertSent = false;
  let alertError: string | null = null;
  if (failures.length > 0) {
    alertError = await sendAlert(failures);
    alertSent = alertError === null;
    // An alert that was needed and did not go out fails the cron run, so it
    // shows as an error in the Vercel cron log instead of passing silently.
    if (!alertSent) console.error('Health alert was not delivered:', alertError);
  }

  return NextResponse.json(
    { timestamp: new Date().toISOString(), results, alertSent, alertError },
    { status: failures.length > 0 && !alertSent ? 500 : 200 },
  );
}
