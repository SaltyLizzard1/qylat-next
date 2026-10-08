const ALERT_TO = 'liz@ideatoplan.to';
// Resend has verified quityourlifeandtravel.com itself. It rejects a from
// address on the send. subdomain with a 403.
const ALERT_FROM = 'noreply@quityourlifeandtravel.com';

/**
 * Emails Liz about a failure in the capture path. Same sender and recipient
 * as the health cron intends. Never throws: an alert that cannot be sent is logged,
 * and the caller carries on.
 */
export async function alertOwner(subject: string, detail: string): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.error(`Owner alert not sent, RESEND_API_KEY is not set: ${subject}: ${detail}`);
    return;
  }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: ALERT_FROM,
        to: ALERT_TO,
        subject: `QYLAT email capture: ${subject}`,
        text: `${detail}\n\nDetected at: ${new Date().toUTCString()}`,
      }),
      signal: AbortSignal.timeout(8_000),
    });
    if (!res.ok) console.error('Owner alert rejected by Resend:', res.status, await res.text());
  } catch (err) {
    console.error('Owner alert failed to send:', err);
  }
}
