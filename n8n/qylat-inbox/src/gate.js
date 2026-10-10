// Decision Gate (n8n Code node, run once for all items).
// Code, not the model, decides whether a draft may be offered to the owner for approval. Nothing is ever
// sent from here and nothing is ever sent without the owner: the gate can only withhold the Approve action.
//   blocks   = the draft is not offered for approval. The owner answers by hand.
//   warnings = the draft is offered, with these shown above it.
// It also builds the exact text a customer would receive (the draft and the sign-off). That text is what
// gets stored, hashed, shown to the owner and, if approved, sent.
const cfg = $('Config').first().json;
const msg = $('Normalize and Filter').first().json;
const claim = $('Claim Message').first().json || {};
const ai = $input.first().json || {};

const blocks = [];
const warnings = [];
const reply = String(ai.reply_text || '').trim();
const draft = reply.toLowerCase();
const customerText = (String(msg.subject || '') + '\n' + String(msg.text || '')).toLowerCase();
const minConfidence = Number(cfg.min_confidence) > 0 ? Number(cfg.min_confidence) : 0.8;

// 1. The model's answer must be complete and readable.
if (ai.no_model_call) blocks.push('no model call was made: ' + String(ai.no_model_call).slice(0, 160));
else {
  if (ai.parse_error) blocks.push('the model answer could not be read: ' + String(ai.parse_error).slice(0, 120));
  if (!reply) blocks.push('the model wrote no reply' + (ai.owner_note ? ': ' + String(ai.owner_note).slice(0, 200) : ''));
}

// 2. What the draft may contain. A draft that breaks one of these is not offered for approval.
if (reply) {
  if (reply.length > 1800) blocks.push('the draft is too long');
  if (/[\u2012\u2013\u2014\u2015]/.test(reply)) blocks.push('the draft contains an em dash or en dash');
  if (/\*\*|__|`|^#{1,6}\s|^\s*[-*\u2022]\s|\[[^\]]+\]\([^)]+\)/m.test(reply)) blocks.push('the draft is not plain text');
  const okLinks = (cfg.approved_links || []).map((l) => String(l).toLowerCase().replace(/\/+$/, ''));
  // Email addresses are checked separately below, so they are taken out before looking for links.
  const withoutAddresses = reply.replace(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi, ' ');
  for (const raw of withoutAddresses.match(/\b(?:https?:\/\/|www\.)[^\s<>"')]+|\b[a-z0-9-]+(?:\.[a-z0-9-]+)*\.(?:com|to|net|org|io|co|app|me|ai|ly|gl|link|xyz|info|biz)\b(?:\/[^\s<>"')]*)?/gi) || []) {
    const link = raw.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/[.,;:!?]+$/, '').replace(/\/+$/, '');
    if (!okLinks.includes(link)) blocks.push('the draft contains a link that is not approved: "' + raw.slice(0, 80) + '"');
  }
  const okAddresses = [String(msg.customer_email || '').toLowerCase(), String(cfg.mailbox || '').toLowerCase()];
  for (const a of draft.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/g) || []) {
    if (!okAddresses.includes(a)) blocks.push('the draft contains an email address that is not this sender\'s or QYLAT\'s: "' + a + '"');
  }
  const okMoney = (cfg.approved_money || []).map((v) => String(v).toLowerCase().replace(/\s/g, ''));
  for (const amt of draft.match(/(?:[$\u00a3\u20ac\u0e3f]\s?\d[\d,]*(?:\.\d+)?k?)|(?:\b\d[\d,]*(?:\.\d+)?\s?(?:usd|dollars|baht|thb|eur|euros|gbp|pounds)\b)/g) || []) {
    // An amount at the end of a clause carries its comma or full stop. That is punctuation, not part of the amount.
    const clean = amt.replace(/\s/g, '').replace(/[.,]+$/, '');
    if (!okMoney.includes(clean)) blocks.push('the draft states an amount that is not in the fact sheet: "' + clean + '"');
  }
  if (/\b(i('ve| have)|we('ve| have)) (subscribed|added|signed) you\b|\badded you to (my|the|our) (list|newsletter)\b/.test(draft)) blocks.push('the draft says the sender was subscribed to something');
  if (/\bas an ai\b|\blanguage model\b|\bsystem prompt\b|\bfact sheet\b|\bmy instructions\b/.test(draft)) blocks.push('the draft talks about being an AI or about its instructions');
}

// 3. Sensitive subjects in the sender's own words. The Approve action is withheld for these, whatever the
//    model wrote: they reach the owner as "needs your attention" and any draft is for reference only.
const SENSITIVE = [
  [/\brefund|money back|reimburse|charge ?back|\binvoice|\bpayment|\bpaid\b|\bcharged?\b|\bprice match|\bdiscount|\bbilling|\bowe\b/, 'mentions money, payment or a refund'],
  [/\bcancel|\breschedul/, 'mentions cancelling or rescheduling'],
  [/\blawyer|attorney|\blegal|\bsue\b|lawsuit|\bcontract|liabilit/, 'mentions legal matters'],
  [/\bvisa\b|immigration|work permit|residen(cy|ce) permit|overstay|\bdtv\b|border run/, 'mentions visas or immigration'],
  [/\bdoctor|medical|medication|diagnos|therap|mental health|depress|anxiety|\binsurance\b/, 'mentions medical or health matters'],
  [/\btax(es)?\b|\birs\b|accountant|\binvest|\bpension|\b401k\b|\bdebt\b|\bloan\b/, 'mentions tax, investment or debt'],
  [/\bgdpr|delete my data|data protection|privacy request|remove my (data|email|information)/, 'is a data or privacy request'],
  [/\bcomplain|unacceptable|disgust|terrible|\bworst\b|rip[- ]?off|\bangry|furious|\bscam/, 'is a complaint or shows strong dissatisfaction'],
  [/\bsuicid|self[- ]harm|kill myself|\bemergency|bereave|passed away|\bdied\b|abus(e|ive)|\bunsafe/, 'describes a sensitive personal situation'],
  [/\bjournalist|\bpress\b|\breporter|podcast|\binterview|sponsor|collab|partnership|affiliate|guest post|backlink|\bseo\b|\bproposal|rate card|\bmedia kit/, 'is a business, press or partnership request'],
  [/\bunsubscribe|stop emailing|remove me from/, 'asks to stop receiving email'],
  // Wider wording for the same subjects. A sender does not have to use the obvious word.
  [/\bmoney\b|\bdollars?\b|\bbucks\b|\$\s?\d|\bbilled\b|\bmy (card|bank)\b|\bcredit card\b|\bpay(ing|ment)?\b|\bfee\b|\bcost me\b/, 'mentions money, payment or a refund'],
  [/\bripped\b|let ?down|\bmisle(d|ad)|disappoint|\bwaste(d)?\b|\bunhappy\b|\bupset\b|not happy|\bfed up\b/, 'is a complaint or shows strong dissatisfaction'],
  [/\b(erase|delete|remove|forget)\b.{0,40}\b(everything|data|information|details|records?|account)\b|\bwhat (data|information) (do )?you (hold|have|keep)\b|\bmy (personal )?data\b/, 'is a data or privacy request'],
  [/\bpermit\b|\bresiden(cy|ce)\b|\bcitizenship\b|\bstay (long[- ]term|permanently)\b|\bembassy\b|\bconsulate\b/, 'mentions visas or immigration'],
  [/\bprescriptions?\b|\bmedicines?\b|\bhospital\b|\bhealth ?care\b|\bmy health\b|\bsurgery\b|\bpregnan/, 'mentions medical or health matters'],
];
for (const [re, why] of SENSITIVE) if (re.test(customerText)) blocks.push('sensitive subject, approval withheld: the message ' + why);

// 4. Things the owner should see before deciding.

const category = String(ai.category || '').trim();
const confidence = typeof ai.confidence === 'number' ? ai.confidence : null;
const injection = (msg.meta && msg.meta.injection_flags) || [];
for (const flag of injection) warnings.push('possible prompt injection: the message ' + flag);
if (injection.length) blocks.push('possible prompt injection, approval withheld (' + injection.length + ' sign' + (injection.length === 1 ? '' : 's') + ', listed below)');
if (msg.meta && msg.meta.has_attachments) warnings.push('the message has attachments. They were not opened or read');
if (msg.meta && msg.meta.forwarded) warnings.push('this is a forwarded message. The person who forwarded it may not be the person who wrote it');
if (msg.meta && msg.meta.html_only) warnings.push('the message was HTML only and was reduced to plain text');
if (msg.meta && msg.meta.text_truncated) warnings.push('the message was long and was cut short');
if (msg.reply_to_differs) warnings.push('the Reply-To address differs from the sender. A reply goes to the sender address only');
if (claim.prior_status) warnings.push('this conversation already exists (last state: ' + String(claim.prior_status).replace(/_/g, ' ') + ')');
if (reply) {
  // The greeting may carry the sender's own name, which can also be Liz. It is set aside before the voice check.
  const body = draft.replace(/^(hi|hello|hey|dear)\b[^,.!\n]{0,40}[,!.]?/, ' ');
  if (/\b(liz|elizabeth|she|she's|she'll|the owner|the founder|the team|our team)\b/.test(body)) blocks.push('the draft speaks about Liz or a team instead of speaking as Liz');
  // Commitments. A draft may not promise a follow-up, a refund, availability or any action. Nothing in the
  // fact sheet supports one, so these are withheld from approval outright.
  if (/\b(be in touch|get back to you|follow(ing)? up|reach out to you|hear from me|circle back|i'll (check|look into|find out|confirm|let you know)|i will (check|look into|find out|confirm|let you know)|i'm looking into|i am looking into)\b/.test(body)) blocks.push('the draft promises a follow-up');
  if (/\b(refund(ed|s)?|reimburse|money back|credit(ed)? (you|your))\b/.test(body)) blocks.push('the draft talks about a refund');
  if (/\bi('m| am) (available|free)\b|\bi have (availability|openings?|slots?|a spot|time (on|this|next))\b|\b(spots?|slots?|openings?) (left|open|available)\b|\bnext (available|opening)\b/.test(body)) blocks.push('the draft states availability');
  if (/\bi('ll| will) (send|resend|email|fix|refund|cancel|reschedule|book|arrange|sort|update|remove|delete|unsubscribe|add|change|move|waive|extend)\b|\bi('ve| have) (sent|resent|refunded|cancelled|canceled|rescheduled|removed|deleted|unsubscribed|updated|fixed|booked|added|changed)\b/.test(body)) blocks.push('the draft promises or claims an action');
  if (/\b(guarantee(d|s)?|i promise|free of charge|for free|complimentary|i can offer|happy to offer|special (rate|price|offer)|discount(ed)?|\bdeal\b|i agree|agree(d)? to|i accept|sounds like a plan)\b/.test(body.replace(/\bfree (tools?|assessment|calculator|quiz|kit|60-day|pdf)/g, ''))) blocks.push('the draft offers, guarantees or agrees to something');
  if (/\b\d+\s*(minutes?|hours?|days?|weeks?|months?|years?)\b/.test(draft.replace(/\b(45[- ]minute|60[- ]day|17 months|six years|24 hours)\b/g, ''))) warnings.push('the draft states a duration. Check it against the fact sheet');
  if (/\bwhen i (was|lived|moved|arrived|first)|\bi remember\b|\bmy (husband|boyfriend|partner|kids|children|ex)\b/.test(draft)) warnings.push('the draft describes a personal experience. Check it is true');
}

// 5. Default deny. Approve is offered only for an ordinary question in a routine category, written in English,
//    from a sender the mail server verified, that the drafting step itself scored highly and marked as free of
//    sensitive subjects. Everything else goes to the owner as "needs your attention" with no Approve action.
const ROUTINE = ['routine_qylat', 'delivery_problem', 'leap_session'];
const looksEnglish = (t) => {
  const letters = String(t).replace(/[^\p{L}]/gu, '');
  if (!letters) return false;
  const nonAscii = letters.replace(/[A-Za-z]/g, '').length / letters.length;
  const words = String(t).toLowerCase().match(/[a-z']+/g) || [];
  const EN = new Set('the is are was am be to of and in it you your i my we do does did can could would should how what when where which who why this that these those for with on at from have has had not yes please thanks thank hello hi if or but about there here will just so as an any free get need want like know help much many'.split(' '));
  const OTHER = new Set('que de la el los las por para una uno mi tu su con sin pero como esta este todas todos je le les des et est un une pour avec vous nous der die das und nicht ich sie ist mit ein eine nao voce uma meu minha il lo gli che non per sono'.split(' '));
  const en = words.filter((w) => EN.has(w)).length;
  const other = words.filter((w) => OTHER.has(w)).length;
  return nonAscii < 0.05 && en >= (words.length < 6 ? 1 : 2) && en > other;
};
if (!ai.no_model_call) {
  if (!ROUTINE.includes(category)) blocks.push('approval withheld: "' + (category || 'unknown').replace(/_/g, ' ') + '" is not a routine category');
  if (confidence === null || confidence < minConfidence) blocks.push('approval withheld: the classification is not confident enough');
  if (ai.sensitive !== false) blocks.push('approval withheld: the drafting step did not mark this message as free of sensitive subjects');
}
if (!msg.sender_verified) blocks.push('approval withheld: the mail server did not verify this sender address');
if (!looksEnglish(String(msg.text || ''))) blocks.push('approval withheld: the message does not appear to be in English');

const uniq = (list) => Array.from(new Set(list));
const approvable = blocks.length === 0 && !!reply;

// The exact text a customer would receive.
const signOff = String(cfg.sign_off || '').replace(/\r/g, '').trim();
const finalText = reply ? [reply, signOff].filter(Boolean).join('\n\n') : '';

return [{
  json: {
    approvable,
    blocks: uniq(blocks),
    warnings: uniq(warnings),
    category: category || 'unknown',
    confidence,
    reply_text: finalText,
    reason: approvable
      ? 'Draft ready for the owner to approve or decline.'
      : 'No approval offered: ' + uniq(blocks).join('; '),
    summary: String(ai.owner_note || '').slice(0, 600),
    model: ai.no_model_call ? null : cfg.model,
    usage: ai.usage || {},
  },
}];
