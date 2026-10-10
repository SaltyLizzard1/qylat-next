// Build Result Notice (n8n Code node, run once for all items).
// Tells the owner what happened after a decision, when it needs her. A reply that was sent and recorded
// needs no email: it is in the log. Every other case says plainly that it was not sent, or that it is not
// known, and that nothing is sent again automatically. Provider ids and fingerprints stay in the log.
const cfg = $('Config').first().json;
const msg = $('Normalize and Filter').first().json;
const decision = $('Read Decision').first().json;
const decided = $('Decide').first().json || {};
const ran = (name) => { try { return $(name).first().json || {}; } catch (e) { return null; } };
const claim = ran('Claim Send');
const outcome = ran('Reply Outcome');
const recorded = ran('Complete Send');

let state = '';
let detail = '';
if (decided.applied !== true) {
  state = 'NOT SENT';
  detail = decision.decision === 'expire' ? 'The approval window closed with no decision.' : 'The decision was not applied: ' + String(decided.reason || 'unknown') + '.';
} else if (decided.status === 'declined') {
  state = 'NOT SENT';
  detail = 'You chose not to send. Answer from the mailbox if a reply is needed.';
} else if (!claim || claim.claimed !== true) {
  state = 'NOT SENT';
  detail = 'Approved, but not sent: ' + String((claim && claim.reason) || 'the send was not allowed') + '.';
} else if (!outcome) {
  state = 'NOT KNOWN';
  detail = 'The reply was approved and claimed, and no outcome is on record. It may or may not have gone. It is not sent again automatically.';
} else if (outcome.outcome === 'sent' && recorded && recorded.recorded === true) {
  state = 'SENT';
  detail = 'The reply was sent.';
} else if (outcome.outcome === 'sent') {
  state = 'SENT, NOT RECORDED';
  detail = 'The reply was sent, but the record could not be updated. Do not send it again.';
} else if (outcome.outcome === 'failed') {
  state = 'NOT SENT';
  detail = 'The reply was refused when it was handed over for sending, so it did not go. Nothing is sent again automatically. Answer from the mailbox yourself.';
} else {
  state = 'NOT KNOWN';
  detail = 'There was no confirmation that the reply went. It may or may not have gone. It is not sent again automatically. Check with the sender before answering by hand.';
}

const subject = ('[QYLAT inbox] ' + state + ': ' + (msg.subject || '(no subject)')).slice(0, 200);
const text = [
  'To: ' + msg.customer_email,
  'Subject: ' + (msg.subject || '(no subject)'),
  'Result: ' + state,
  detail,
].join('\n');

return [{
  json: {
    state,
    // No email for a plain decline (the owner just made that choice) or for a reply that was sent and recorded.
    notify: state !== 'SENT' && !(decided.applied === true && decided.status === 'declined'),
    idempotency_key: 'qylat-inbox-result-' + decision.draft_id,
    payload: { from: cfg.alert_from, to: [cfg.owner_to], subject, text },
  },
}];
