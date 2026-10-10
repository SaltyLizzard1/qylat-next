// Provider Outcome (n8n Code node, run once for each item). Shared by every step that hands an email
// to the sending provider. Only a 2xx answer carrying a message id counts as accepted. An answer that
// proves the provider refused the message is 'failed'. Anything else (timeout, network error, 5xx, 409)
// is 'uncertain': the email may have gone, so it is reported and never sent again automatically.
const res = $json || {};
const code = Number(res.statusCode);
const body = (res.body && typeof res.body === 'object') ? res.body : {};
let outcome = 'uncertain';
let providerId = '';
let error = '';
if (code >= 200 && code < 300 && body.id) {
  outcome = 'sent';
  providerId = String(body.id);
} else if ([400, 401, 403, 404, 405, 413, 422, 429].includes(code)) {
  outcome = 'failed';
  error = 'Provider ' + code + ': ' + String(body.message || body.name || 'rejected');
} else {
  error = code ? 'Provider ' + code + ': ' + String(body.message || 'no confirmation')
    : 'No response: ' + String((res.error && (res.error.message || res.error)) || 'unknown');
}
return { json: { outcome, provider_message_id: providerId, error: error.slice(0, 500) } };
