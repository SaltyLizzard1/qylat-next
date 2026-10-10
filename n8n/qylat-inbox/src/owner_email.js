// Build Owner Email (n8n Code node, run once for all items).
// One short email to the owner per handled message: who wrote, what they said, how it was classified,
// the exact proposed reply, and the one action available. Sent from the no-reply address, which the
// IdeaToPlan inbox handler already ignores.
const cfg = $('Config').first().json;
const msg = $('Normalize and Filter').first().json;
const gate = $('Apply Ceiling').first().json;
const saved = $('Save Draft').first().json || {};

const offered = saved.saved === true && saved.approval_offered === true && !!saved.approval_code;
const hours = Number(cfg.approval_ttl_hours) || 72;
// The form page for this execution. It opens a page with a choice to submit, so a mail scanner that
// merely fetches the link approves nothing.
const actionUrl = offered ? String($execution.resumeFormUrl || '') : '';
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const clip = (s, n) => (String(s).length > n ? String(s).slice(0, n) + '\n[cut: ' + (String(s).length - n) + ' more characters in the mailbox]' : String(s));

const head = offered ? 'Approve reply' : 'Needs your attention';
const subject = ('[QYLAT inbox] ' + head + ': ' + (msg.subject || '(no subject)')).slice(0, 200);
const classification = String(gate.category).replace(/_/g, ' ') + (gate.confidence === null ? '' : ' (confidence ' + gate.confidence + ')');

const lines = [];
lines.push('From: ' + (msg.customer_name ? msg.customer_name + ' ' : '') + '<' + msg.customer_email + '>');
lines.push('Subject: ' + (msg.subject || '(no subject)'));
lines.push('Classification: ' + classification);
if (gate.summary) lines.push('Summary: ' + gate.summary);
if (!offered) lines.push('', 'Approval withheld because:', ...(saved.saved === true ? gate.blocks : [String(saved.reason || 'the draft could not be saved')]).map((b) => '  ' + b));
if (gate.warnings.length) lines.push('', 'Check before deciding:', ...gate.warnings.map((w) => '  ' + w));
lines.push('', 'THEIR MESSAGE', clip(msg.text || '(empty)', 1500));
if (gate.reply_text) lines.push('', offered ? 'PROPOSED REPLY (exactly as it would be sent)' : 'DRAFT (not eligible to send, for reference only)', gate.reply_text);
lines.push('');
if (offered && actionUrl) {
  lines.push('TO DECIDE', actionUrl, 'Approval code: ' + String(saved.approval_code || ''), 'The page asks for your choice (send this reply, or do not send) and for the approval code above. It works once and closes after ' + hours + ' hours. A wrong code closes it and nothing is sent. To change the wording, choose do not send and answer from the mailbox yourself.');
} else if (offered) {
  lines.push('The approval page link could not be created. Nothing will be sent. Answer from the mailbox yourself.');
} else {
  lines.push('Nothing will be sent. Answer from the mailbox yourself.');
}

const text = lines.join('\n');
const html = '<div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.5;color:#2C3340">'
  + lines.map((l) => {
    if (l === actionUrl && actionUrl) return '<p><a href="' + esc(actionUrl) + '" style="display:inline-block;padding:10px 18px;background:#2D1A00;color:#FBF6E3;text-decoration:none;border-radius:6px">Open the decision page</a></p>';
    if (/^(THEIR MESSAGE|PROPOSED REPLY|DRAFT|TO DECIDE|Check before deciding:|Approval withheld because:)/.test(l)) return '<p style="margin:14px 0 4px;font-weight:bold">' + esc(l) + '</p>';
    return '<div style="white-space:pre-wrap">' + (l ? esc(l) : '&nbsp;') + '</div>';
  }).join('')
  + '</div>';

return [{
  json: {
    approval_offered: offered && !!actionUrl,
    draft_id: saved.draft_id || null,
    sha256: saved.sha256 || null,
    idempotency_key: 'qylat-inbox-owner-' + String(saved.draft_id || $('Claim Message').first().json.message_id),
    payload: { from: cfg.alert_from, to: [cfg.owner_to], subject, text, html },
  },
}];
