// Build Sweep Alerts (n8n Code node, run once for all items).
// One short email per thing the sweep found. The sweep reports each thing once, changes states only,
// and never sends or resends a customer email.
const cfg = $('Config').first().json;
const TITLES = {
  stuck_processing: 'FAILED: a message was not processed',
  approval_expired: 'EXPIRED: a draft was not decided in time',
  send_uncertain: 'NOT KNOWN: a reply may or may not have been sent',
  deferred_message: 'Needs you: a second message was not answered',
  polling_stale: 'CHECK: the mailbox may not be being read',
};
const out = [];
for (const item of $input.all()) {
  const row = item.json || {};
  if (!row.kind || !TITLES[row.kind]) continue;
  const lines = [String(row.detail || '')];
  if (row.customer_email) lines.push('', 'From: ' + row.customer_email);
  if (row.subject) lines.push('Subject: ' + row.subject);
  if (row.kind !== 'polling_stale') lines.push('', 'Nothing was sent automatically and nothing will be. Read the mailbox and answer by hand if needed.');
  out.push({
    json: {
      kind: row.kind,
      thread_id: row.thread_id || null,
      draft_id: row.draft_id || null,
      idempotency_key: 'qylat-inbox-sweep-' + row.kind + '-' + String(row.draft_id || row.thread_id || new Date().toISOString().slice(0, 13)),
      payload: { from: cfg.alert_from, to: [cfg.owner_to], subject: '[QYLAT inbox] ' + TITLES[row.kind], text: lines.join('\n') },
    },
  });
}
return out;
