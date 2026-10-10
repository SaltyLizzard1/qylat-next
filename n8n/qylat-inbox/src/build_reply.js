// Build Reply (n8n Code node, run once for all items).
// Builds the one email that can reach a customer. Every part of it comes from the database's answer
// to the send claim: the recipient, the subject, the threading ids and the exact approved text.
// Nothing is taken from the model or from earlier nodes.
const cfg = $('Config').first().json;
const claim = $('Claim Send').first().json || {};
const decision = $('Read Decision').first().json;

const subjectRaw = String(claim.subject || '').replace(/[\r\n]+/g, ' ').trim();
const subject = (/^re:/i.test(subjectRaw) ? subjectRaw : 'Re: ' + (subjectRaw || 'your message')).slice(0, 200);
const idOk = (v) => /^<[^<>\s]{3,300}>$/.test(String(v || ''));
const refs = (Array.isArray(claim.reference_ids) ? claim.reference_ids : []).filter(idOk).slice(-20);
const headers = {};
if (idOk(claim.in_reply_to)) headers['In-Reply-To'] = claim.in_reply_to;
if (refs.length) headers['References'] = refs.join(' ');

const to = String(claim.to_email || '').trim().toLowerCase();
const valid = claim.claimed === true && /^[^\s@<>,;]+@[^\s@<>,;]+\.[^\s@<>,;]+$/.test(to) && String(claim.reply_text || '').trim().length > 0;

return [{
  json: {
    valid,
    draft_id: decision.draft_id,
    idempotency_key: 'qylat-inbox-reply-' + decision.draft_id,
    payload: {
      from: cfg.reply_from,
      to: [to],
      reply_to: cfg.mailbox,
      subject,
      text: String(claim.reply_text || ''),
      headers,
    },
  },
}];
