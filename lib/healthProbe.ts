// Liveness probe for an n8n production webhook that only accepts POST.
//
// What n8n 2.20.9 was observed to answer on 2026-10-08:
//   HEAD     404 for a registered path and for a made-up path alike
//   OPTIONS  204 for a registered path and for a made-up path alike
//   GET      404 for both, but with different bodies:
//            registered    "This webhook is not registered for GET requests.
//                           Did you mean to make a POST request?"
//            unregistered  "The requested webhook "GET <path>" is not registered."
//
// So only the GET body tells the two apart. A GET cannot start a workflow
// whose webhook node accepts POST only, so the probe runs nothing and costs
// nothing. If a webhook is ever given a GET handler, this probe would trigger
// it: change the probe before doing that.
//
// A pass proves the path is registered for POST. It does not prove the
// workflow succeeds. Failed executions are reported by the n8n error workflow.

export type ProbeResult = { ok: boolean; detail: string };

export function classifyWebhookProbe(status: number, body: string): ProbeResult {
  let message = '';
  try {
    const parsed = JSON.parse(body) as { message?: unknown };
    if (typeof parsed.message === 'string') message = parsed.message;
  } catch {
    // Not JSON: handled by the fall-through below.
  }

  if (status === 404 && /not registered for GET requests/i.test(message) && /\bPOST\b/.test(message)) {
    return { ok: true, detail: 'registered for POST' };
  }
  if (status === 404 && /is not registered\.?/i.test(message)) {
    return { ok: false, detail: 'path is not registered (workflow unpublished or path changed)' };
  }
  if (status >= 500) {
    return { ok: false, detail: `n8n server error, HTTP ${status}` };
  }
  return { ok: false, detail: `unexpected answer to the probe, HTTP ${status}` };
}
