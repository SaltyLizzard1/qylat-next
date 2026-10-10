// Parse AI Answer (n8n Code node, run once for all items).
// Reads the model's answer into a fixed shape. Anything unreadable becomes a parse_error, which the
// gate turns into "needs the owner, no approval offered". Also reached when no model call was made.
const input = $input.first().json || {};
const req = $('Build AI Request').first().json || {};

if (input.no_model_call) {
  return [{ json: { no_model_call: String(input.no_model_call).slice(0, 300), category: '', confidence: null, sensitive: true, reply_text: '', owner_note: '', usage: {} } }];
}

const out = { category: '', confidence: null, sensitive: true, reply_text: '', owner_note: '', usage: {}, parse_error: '' };
try {
  const usage = input.usage || {};
  out.usage = { prompt_tokens: Number(usage.prompt_tokens) || 0, completion_tokens: Number(usage.completion_tokens) || 0 };
  const choice = (input.choices || [])[0] || {};
  let content = choice.message && choice.message.content;
  if (Array.isArray(content)) content = content.map((p) => (p && p.text) || '').join('');
  content = String(content || '').trim();
  if (!content) throw new Error('the model returned no content');
  if (choice.finish_reason === 'length') throw new Error('the answer was cut off');
  const start = content.indexOf('{');
  const end = content.lastIndexOf('}');
  if (start < 0 || end <= start) throw new Error('no JSON object in the answer');
  const parsed = JSON.parse(content.slice(start, end + 1));
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('the answer is not an object');
  const category = String(parsed.category || '').trim().toLowerCase();
  out.category = (req.categories || []).includes(category) ? category : '';
  if (!out.category) out.parse_error = 'unknown category "' + category.slice(0, 40) + '"';
  const confidence = Number(parsed.confidence);
  out.confidence = confidence >= 0 && confidence <= 1 ? confidence : null;
  // Only an explicit false counts. Anything else, including a missing field, is treated as sensitive.
  out.sensitive = parsed.sensitive !== false;
  out.reply_text = typeof parsed.reply_text === 'string' ? parsed.reply_text.replace(/\r/g, '').trim() : '';
  out.owner_note = typeof parsed.owner_note === 'string' ? parsed.owner_note.trim().slice(0, 600) : '';
} catch (err) {
  out.parse_error = String((err && err.message) || err).slice(0, 200);
  out.reply_text = '';
}
return [{ json: out }];
