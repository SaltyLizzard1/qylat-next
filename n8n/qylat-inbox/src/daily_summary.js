// Build Daily Summary (n8n Code node, run once for all items).
// One email a day listing every message that still needs the owner. No email when there is nothing.
// It lists senders and subjects only: no message text, no draft, no approval code.
const cfg = $('Config').first().json;
const rows = $input.all().map((i) => i.json || {}).filter((r) => r.thread_id && r.kind);
if (!rows.length) return [];

const GROUPS = [
  ['awaiting_approval', 'Waiting for your decision'],
  ['uncertain', 'Not known whether the reply was sent (it is never resent)'],
  ['not_sent', 'Approved or processed, but not sent'],
  ['expired', 'Approval closed with no decision, nothing was sent'],
  ['held', 'Held without an email because the daily limit was reached'],
  ['no_draft', 'No draft was written (a model or message limit was reached)'],
  ['by_hand', 'Needs your reply by hand'],
];
const when = (v) => { const d = new Date(v); return Number.isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 16).replace('T', ' ') + ' UTC'; };
const lines = [rows.length + (rows.length === 1 ? ' email still needs you.' : ' emails still need you.') + ' Each one is in the QYLAT mailbox. Nothing is sent to anyone without your approval.'];
for (const [kind, title] of GROUPS) {
  const group = rows.filter((r) => r.kind === kind);
  if (!group.length) continue;
  lines.push('', title + ' (' + group.length + ')');
  for (const r of group.slice(0, 30)) {
    const bits = [String(r.customer_email || 'unknown sender') + ': ' + String(r.subject || '(no subject)').slice(0, 120)];
    if (r.received_at) bits.push('received ' + when(r.received_at));
    if (r.detail) bits.push(String(r.detail).slice(0, 200));
    lines.push('- ' + bits.join(' | '));
  }
  if (group.length > 30) lines.push('and ' + (group.length - 30) + ' more in the mailbox.');
}
lines.push('', 'A message you answered by hand stays on this list for up to ' + (cfg.summary_days || 7) + ' days, because the system cannot see replies you send yourself.');
return [{
  json: {
    idempotency_key: 'qylat-inbox-summary-' + new Date().toISOString().slice(0, 10),
    payload: {
      from: cfg.alert_from, to: [cfg.owner_to],
      subject: '[QYLAT inbox] Daily summary: ' + rows.length + (rows.length === 1 ? ' email needs you' : ' emails need you'),
      text: lines.join('\n'),
    },
  },
}];
