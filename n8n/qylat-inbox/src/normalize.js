// Normalize and Filter (n8n Code node, run once for all items).
// Turns one inbound message into a fixed shape and decides whether it is customer mail at all.
// Automated mail, QYLAT's own mail, bounces and list traffic are ignored and never answered.
// Nothing here trusts the message: every field is treated as text written by a stranger.
const cfg = $('Config').first().json;
const m = $('One Email').first().json || {};
const meta = (m.metadata && typeof m.metadata === 'object') ? m.metadata : {};

const lower = (v) => String(v === undefined || v === null ? '' : v).trim().toLowerCase();
const capBytes = (s, max) => {
  let out = String(s);
  while (Buffer.byteLength(out, 'utf8') > max) out = out.slice(0, Math.max(0, Math.min(out.length - 1, Math.floor(out.length * 0.9))));
  return out;
};
// The IMAP trigger puts from, to, subject and date on the item and every other header under metadata.
const headerOf = (name) => {
  const pools = [meta, m.headers || {}, m];
  for (const pool of pools) {
    const key = Object.keys(pool).find((k) => k.toLowerCase() === name.toLowerCase());
    if (key === undefined) continue;
    const v = pool[key];
    if (v === undefined || v === null || typeof v === 'object' && !Array.isArray(v)) continue;
    const line = Array.isArray(v) ? v.join(', ') : String(v);
    const prefix = name.toLowerCase() + ':';
    return (line.toLowerCase().startsWith(prefix) ? line.slice(prefix.length) : line).trim();
  }
  return '';
};
const parseAddress = (v) => {
  if (v && typeof v === 'object') {
    const first = Array.isArray(v.value) ? v.value[0] : v;
    if (first && first.address) return { email: lower(first.address), name: String(first.name || '').trim() };
    v = v.text || '';
  }
  const s = String(v || '');
  const match = s.match(/<([^<>\s]+@[^<>\s]+)>/) || s.match(/([^\s<>"']+@[^\s<>"']+)/);
  return { email: match ? lower(match[1]) : '', name: s.replace(/<[^>]*>/, '').replace(/"/g, '').trim().slice(0, 120) };
};
const idsOf = (v) => (String(v || '').match(/<[^<>\s]+>/g) || []).slice(-30);

// An HTML-only message is reduced to its visible text. Scripts, styles and comments are dropped whole.
const htmlToText = (html) => String(html || '')
  .replace(/<!--[\s\S]*?-->/g, ' ')
  .replace(/<(script|style|head|title|noscript)[\s\S]*?<\/\1>/gi, ' ')
  .replace(/<(br|\/p|\/div|\/li|\/tr|\/h[1-6])\s*\/?>/gi, '\n')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;/gi, ' ').replace(/&amp;/gi, '&').replace(/&lt;/gi, '<').replace(/&gt;/gi, '>')
  .replace(/&quot;/gi, '"').replace(/&#39;|&apos;/gi, "'").replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));

const from = parseAddress(m.from || headerOf('from'));
const replyTo = parseAddress(headerOf('reply-to'));
const subject = String(m.subject || headerOf('subject') || '').replace(/[\r\n]+/g, ' ').trim().slice(0, 300);
const plain = String(m.textPlain || m.text || '').trim();
const htmlOnly = !plain && !!String(m.textHtml || m.html || '').trim();
let text = (plain || htmlToText(m.textHtml || m.html || ''))
  .replace(/\r/g, '')
  .replace(/[\u200b-\u200f\u202a-\u202e\u2060-\u2064\ufeff]/g, '')   // invisible characters
  .replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();

// Quoted history is cut off. Earlier messages come from the database, not from what a sender pasted back.
const fullText = text;
const cutAt = [
  /^\s*On .{5,200} wrote:\s*$/m,
  /^\s*-{2,}\s*Original Message\s*-{2,}\s*$/mi,
  /^\s*From: .+\n\s*(Sent|Date): .+$/mi,
  /^\s*>.*$/m,
].map((re) => { const hit = text.search(re); return hit < 0 ? Infinity : hit; }).reduce((a, b) => Math.min(a, b), Infinity);
const forwarded = /^\s*(fwd?|fw):/i.test(subject) || /-{3,}\s*Forwarded message\s*-{3,}|^Begin forwarded message:/mi.test(fullText);
if (!forwarded && cutAt !== Infinity && cutAt > 0 && text.slice(0, cutAt).trim().length >= 2) text = text.slice(0, cutAt).trim();

const messageId = (idsOf(headerOf('message-id'))[0] || idsOf(m.messageId)[0] || '').slice(0, 300);
const inReplyTo = (idsOf(headerOf('in-reply-to'))[0] || '').slice(0, 300);
const references = idsOf(headerOf('references')).map((r) => r.slice(0, 300));
const contentType = headerOf('content-type').toLowerCase();
const hasAttachments = /multipart\/(mixed|related)/.test(contentType) || !!headerOf('x-ms-has-attach')
  || (Array.isArray(m.attachments) && m.attachments.length > 0);

// The receiving mail server's own SPF, DKIM and DMARC verdicts.
const auth = headerOf('authentication-results').toLowerCase();
const senderVerified = /\bdmarc=pass\b/.test(auth) || (/\bdkim=pass\b/.test(auth) && /\bspf=pass\b/.test(auth));

// Text that tries to steer an automated reader. It never changes what the code does. It is shown to the owner.
const INJECTION = [
  [/\b(ignore|disregard|forget|override)\b.{0,40}\b(previous|prior|above|earlier|all|your)\b.{0,40}\b(instruction|prompt|rule|guideline)s?/i, 'asks to ignore instructions'],
  [/\b(system|developer) (prompt|message|instruction)s?\b|\byou are (now|no longer)\b|\bact as\b|\bpretend (to be|you are)\b|\bnew instructions?:/i, 'addresses an AI or sets a role'],
  [/\b(reveal|show|print|repeat|output|share|give|tell|send|reply with|respond with)\b.{0,40}\b(prompt|instruction|rule|fact sheet|configuration|api key|password)s?\b/i, 'asks for internal instructions or secrets'],
  [/\b(send|forward|email|cc|bcc)\b.{0,60}\b(to|at)\b.{0,10}[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i, 'asks to send mail to another address'],
  [/<\/?(system|assistant|user|instructions?|customer_email)>|\[\/?(INST|SYSTEM)\]|```/i, 'contains prompt markup'],
  [/\b(approve|auto-?approve|mark as approved|skip (the )?(review|approval))\b/i, 'talks about approval or skipping review'],
  [/\bfrom now on\b|\bnew rules?\b|\byour (rules|guidance|guidelines|configuration|setup|settings)\b|\bhidden (text|prompt|setup|instructions?)\b|\btreat the (text|following|below)\b|\bdo what it says\b/i, 'tries to set new rules'],
  [/(?:\b[a-z]\s){5,}[a-z]\b/i, 'contains spaced-out lettering'],
];
const injectionFlags = INJECTION.filter(([re]) => re.test(subject + '\n' + fullText)).map(([, why]) => why);

const own = [cfg.mailbox].concat(cfg.own_addresses || []).map(lower);
const isCanary = subject.startsWith(String(cfg.canary_subject_prefix || '\u0000')) && own.includes(from.email);
const canaryToken = isCanary ? (subject.match(/\b[a-f0-9]{32}\b/) || [''])[0] : '';

const reasons = [];
if (!messageId) reasons.push('no message id');
if (!from.email) reasons.push('no sender address');
if (own.includes(from.email)) reasons.push('sent by QYLAT itself');
if (/(^|[._+-])(no-?reply|do-?not-?reply|mailer-daemon|postmaster|bounces?|notifications?|alerts?|newsletter|news|mailer|billing|invoice|receipts?)[@+._-]/.test(from.email)) reasons.push('automated sender address');
if (/^(auto-generated|auto-replied|auto-notified)/i.test(headerOf('auto-submitted'))) reasons.push('auto-submitted header');
if (/^(bulk|list|junk|auto_reply)/i.test(headerOf('precedence'))) reasons.push('bulk or list precedence');
if (headerOf('list-unsubscribe') || headerOf('list-id')) reasons.push('mailing list or newsletter mail');
if (headerOf('x-autoreply') || headerOf('x-autorespond') || headerOf('x-auto-response-suppress')) reasons.push('auto-reply header');
if (/^(yes|true)$/i.test(headerOf('x-spam-flag')) || /^\s*yes\b/i.test(headerOf('x-spam-status'))) reasons.push('marked as spam by the mail server');
if (/^(automatic reply|auto(matic)?[- ]?reply|out of (the )?office|undeliverable|delivery status notification|mail delivery (failed|subsystem)|returned mail|failure notice)/i.test(subject)) reasons.push('auto-reply or bounce subject');
if (/multipart\/report/.test(contentType)) reasons.push('delivery report');
if ((cfg.system_subject_prefixes || []).some((p) => subject.toLowerCase().startsWith(String(p).toLowerCase()))) reasons.push('subject is one of the automation\'s own emails');
const sentAt = Date.parse(m.date || headerOf('date'));
const cutoff = cfg.launch_cutoff ? Date.parse(cfg.launch_cutoff) : NaN;
if (Number.isNaN(cutoff)) reasons.push('no launch cutoff is configured');
else if (Number.isNaN(sentAt) || sentAt < cutoff) reasons.push('dated before the launch cutoff, or undated');
if (!text && !hasAttachments) reasons.push('empty message');

const body = capBytes(text, 6000);
return [{
  json: {
    action: isCanary ? 'canary' : reasons.length ? 'ignore' : 'handle',
    ignore_reasons: reasons,
    canary_token: canaryToken,
    mailbox: lower(cfg.mailbox),
    rfc_message_id: messageId,
    in_reply_to: inReplyTo || null,
    reference_ids: references,
    customer_email: from.email,
    customer_name: from.name.replace(/[\r\n<>]/g, ' ').trim(),
    reply_to_differs: !!replyTo.email && replyTo.email !== from.email,
    sender_verified: senderVerified,
    subject,
    text: body,
    meta: {
      html_only: htmlOnly,
      has_attachments: hasAttachments,
      forwarded,
      injection_flags: injectionFlags,
      text_truncated: body.length < text.length,
      reply_to_differs: !!replyTo.email && replyTo.email !== from.email,
      sender_verified: senderVerified,
    },
  },
}];
