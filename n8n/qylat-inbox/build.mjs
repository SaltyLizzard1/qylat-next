// Builds the three QYLAT inbox workflow files from the code in ./src, so the code that is tested is
// the code that ships. Run: node n8n/qylat-inbox/build.mjs
// By default the fact sheet is left out of the built files (the model is never called without it).
// --with-fact-sheet puts the proposed text in, for local tests only.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const src = (name) => fs.readFileSync(path.join(here, 'src', name), 'utf8');
const withFactSheet = process.argv.includes('--with-fact-sheet');
const outDir = process.argv.includes('--out') ? process.argv[process.argv.indexOf('--out') + 1] : path.join(here, '..');

const SUPABASE = 'https://yglmlnfsyzsvozxirlpo.supabase.co/rest/v1/rpc/';
const CRED_SUPABASE = { supabaseApi: { id: 'oxQOdBDbGP7WmsX1', name: 'Supabase account' } };
const CRED_RESEND = { httpBearerAuth: { id: 'SQ8PjKvAme19ISp3', name: 'Resend QYLAT' } };
const CRED_OPENROUTER = { httpBearerAuth: { id: 'zeH7yl8iNbDhIjLz', name: 'Bearer Auth account' } };
// Created with a placeholder password. Liz enters the real one in n8n.
const CRED_IMAP = { imap: { id: 'IPeKxuNCofVhyQcr', name: 'QYLAT mailbox IMAP' } };
const ERROR_WORKFLOW = 'BFirlikXaAuti0bh';
const MAILBOX = 'liz@quityourlifeandtravel.com';

const sheetFile = fs.readFileSync(path.join(here, 'fact-sheet.md'), 'utf8');
const sheet = sheetFile.split('<!-- FACT SHEET START -->')[1].split('<!-- FACT SHEET END -->')[0].trim();

export const CONFIG = {
  mailbox: MAILBOX,
  own_addresses: ['hello@quityourlifeandtravel.com', 'noreply@quityourlifeandtravel.com', 'noreply@send.quityourlifeandtravel.com'],
  system_subject_prefixes: ['[QYLAT inbox]'],
  canary_subject_prefix: '[QYLAT inbox check]',
  canary_enabled: true,
  // Mail dated before this is never handled. Set to the activation moment, so the existing inbox is left alone.
  launch_cutoff: 'SET AT ACTIVATION',
  // Not the IdeaToPlan inbox: workflows there read that mailbox, and these emails carry customer text.
  owner_to: 'lizalfond@gmail.com',
  alert_from: 'QYLAT Inbox <noreply@quityourlifeandtravel.com>',
  reply_from: 'Liz at Quit Your Life and Travel <liz@quityourlifeandtravel.com>',
  model: 'anthropic/claude-sonnet-4.6',
  max_output_tokens: 700,
  max_request_bytes: 30000,
  min_confidence: 0.8,
  approval_ttl_hours: 72,
  approved_links: [
    'quityourlifeandtravel.com',
    'quityourlifeandtravel.com/assessment',
    'quityourlifeandtravel.com/whats-stopping-you',
    'quityourlifeandtravel.com/calculator',
    'quityourlifeandtravel.com/60-day-leap-plan.pdf',
    'cal.com/qylat/leap-session',
    'ideatoplan.to',
  ],
  approved_money: ['$40', '$35k', '$2,720', '$1,838'],
  sign_off: 'Liz',
  fact_sheet: withFactSheet ? sheet : 'PENDING APPROVAL. The model is not called until the approved fact sheet is pasted here.',
};

const pos = (col, row) => [col * 230, row * 190];
const code = (id, name, file, at, mode) => ({
  id, name, type: 'n8n-nodes-base.code', typeVersion: 2, position: at,
  parameters: { ...(mode ? { mode } : {}), jsCode: src(file) },
});
const inline = (id, name, js, at) => ({ id, name, type: 'n8n-nodes-base.code', typeVersion: 2, position: at, parameters: { jsCode: js } });
const rpc = (id, name, fn, body, at, extra = {}) => ({
  id, name, type: 'n8n-nodes-base.httpRequest', typeVersion: 4.2, position: at,
  parameters: {
    method: 'POST', url: SUPABASE + fn, authentication: 'predefinedCredentialType', nodeCredentialType: 'supabaseApi',
    sendBody: true, specifyBody: 'json', jsonBody: '={{ ' + body + ' }}', options: {},
  },
  credentials: CRED_SUPABASE, retryOnFail: false, ...extra,
});
const resend = (id, name, at, notes) => ({
  id, name, type: 'n8n-nodes-base.httpRequest', typeVersion: 4.2, position: at,
  parameters: {
    method: 'POST', url: 'https://api.resend.com/emails', authentication: 'genericCredentialType', genericAuthType: 'httpBearerAuth',
    sendHeaders: true, headerParameters: { parameters: [{ name: 'Idempotency-Key', value: '={{ $json.idempotency_key }}' }] },
    sendBody: true, specifyBody: 'json', jsonBody: '={{ JSON.stringify($json.payload) }}',
    options: { timeout: 20000, response: { response: { fullResponse: true, neverError: true } } },
  },
  credentials: CRED_RESEND, retryOnFail: false, onError: 'continueRegularOutput', ...(notes ? { notes } : {}),
});
const iff = (id, name, expr, at) => ({
  id, name, type: 'n8n-nodes-base.if', typeVersion: 2.2, position: at,
  parameters: {
    conditions: {
      options: { caseSensitive: true, leftValue: '', typeValidation: 'strict', version: 2 },
      conditions: [{ id: id + '-c', leftValue: '={{ ' + expr + ' }}', rightValue: '', operator: { type: 'boolean', operation: 'true', singleValue: true } }],
      combinator: 'and',
    },
    options: {},
  },
});
const noop = (id, name, at, notes) => ({ id, name, type: 'n8n-nodes-base.noOp', typeVersion: 1, position: at, parameters: {}, ...(notes ? { notes } : {}) });
const config = (at) => ({
  id: 'config', name: 'Config', type: 'n8n-nodes-base.set', typeVersion: 3.4, position: at,
  parameters: { mode: 'raw', jsonOutput: JSON.stringify(CONFIG, null, 2), options: {} },
  notes: 'Settings only. Whether anything can be sent is decided in the database (qylat_inbox_settings), not here.',
});
const wire = (pairs) => {
  const c = {};
  for (const [from, to, output = 0] of pairs) {
    c[from] = c[from] || { main: [] };
    while (c[from].main.length <= output) c[from].main.push([]);
    c[from].main[output].push({ node: to, type: 'main', index: 0 });
  }
  return c;
};
const N = (v) => "$('" + v + "').first().json";

// ── Handler ─────────────────────────────────────────────────────────────────
const handlerNodes = [
  { id: 'start', name: 'One Email', type: 'n8n-nodes-base.executeWorkflowTrigger', typeVersion: 1.1, position: pos(0, 2), parameters: { inputSource: 'passthrough' } },
  config(pos(1, 2)),
  code('normalize', 'Normalize and Filter', 'normalize.js', pos(2, 2)),
  iff('is-customer', 'Customer Mail?', "$json.action === 'handle'", pos(3, 2)),
  iff('is-canary', 'Mailbox Check?', "$json.action === 'canary'", pos(4, 4)),
  rpc('canary-seen', 'Record Mailbox Check', 'qylat_inbox_canary_seen', '{ p_mailbox: $json.mailbox, p_token: $json.canary_token }', pos(5, 4)),
  rpc('ignored', 'Record Ignored', 'qylat_inbox_record_ignored',
    '{ p_mailbox: $json.mailbox, p_rfc_message_id: $json.rfc_message_id || ("no-id:" + $now.toMillis()), p_from_email: $json.customer_email, p_subject: $json.subject, p_reasons: $json.ignore_reasons }', pos(5, 5),
    { notes: 'Kept without the message body.' }),
  rpc('claim', 'Claim Message', 'qylat_inbox_claim_message',
    '{ p_mailbox: $json.mailbox, p_rfc_message_id: $json.rfc_message_id, p_in_reply_to: $json.in_reply_to, p_reference_ids: $json.reference_ids, p_from_email: $json.customer_email, p_from_name: $json.customer_name || null, p_subject: $json.subject, p_body: $json.text, p_meta: $json.meta, p_sender_verified: $json.sender_verified }',
    pos(4, 2), { notes: 'ATOMIC. Records the message and claims the conversation. A duplicate, or a conversation already being worked, comes back with claimed = false.' }),
  iff('claimed', 'Claimed?', '$json.claimed === true', pos(5, 2)),
  noop('not-claimed', 'Not Claimed', pos(6, 3), 'A duplicate, or a second message in a conversation that is being worked. The sweep reports the second kind to the owner.'),
  code('build-ai', 'Build AI Request', 'build_ai_request.js', pos(6, 2)),
  iff('call-wanted', 'Call Wanted?', '$json.model_call_wanted === true', pos(7, 2)),
  rpc('claim-call', 'Claim Model Call', 'qylat_inbox_claim_model_call', "{ p_mailbox: $('Normalize and Filter').first().json.mailbox }", pos(8, 1),
    { notes: 'ATOMIC. Counts the call against the monthly limit (never above 100). Refused once the limit is reached or while the fact sheet is not approved.' }),
  iff('call-allowed', 'Call Allowed?', '$json.allowed === true', pos(9, 1)),
  {
    id: 'ai', name: 'AI Draft', type: 'n8n-nodes-base.httpRequest', typeVersion: 4.2, position: pos(10, 0),
    parameters: {
      method: 'POST', url: 'https://openrouter.ai/api/v1/chat/completions', authentication: 'genericCredentialType', genericAuthType: 'httpBearerAuth',
      sendBody: true, specifyBody: 'json', jsonBody: "={{ $('Build AI Request').first().json.request_body }}", options: { timeout: 60000 },
    },
    credentials: CRED_OPENROUTER, retryOnFail: false, onError: 'continueErrorOutput',
    notes: 'PAID CALL. At most one per handled message, capped at 700 output tokens, never retried. The model classifies and drafts. It cannot send or approve anything.',
  },
  inline('no-call', 'No Model Call',
    "// No model call is made: the limit is reached, the fact sheet is not approved, or the request was withheld.\n// The owner is still told about the message.\nconst req = $('Build AI Request').first().json;\nlet reason = req.no_model_reason;\ntry { const c = $('Claim Model Call').first().json; if (c && c.allowed === false) reason = c.reason; } catch (e) { /* that node did not run */ }\nreturn [{ json: { no_model_call: String(reason || 'not allowed') } }];", pos(10, 2)),
  inline('model-error', 'Model Error',
    "// The model call failed. It is not retried. The owner is told and answers by hand.\nconst e = $input.first().json || {};\nreturn [{ json: { no_model_call: 'the model call failed: ' + String((e.error && (e.error.message || e.error)) || e.message || 'unknown').slice(0, 200) } }];", pos(11, 1)),
  code('parse', 'Parse AI Answer', 'parse_ai.js', pos(12, 2)),
  code('gate', 'Decision Gate', 'gate.js', pos(13, 2)),
  rpc('claim-notify', 'Claim Notification', 'qylat_inbox_claim_notification', "{ p_mailbox: $('Normalize and Filter').first().json.mailbox }", pos(13, 3),
    { notes: 'ATOMIC. Counts this owner email against the daily ceiling held in the database. Over the ceiling the message is still recorded with its status, and no email is sent for it.' }),
  inline('ceiling', 'Apply Ceiling',
    "// Over the daily ceiling no email goes to the owner, so no approval can be offered either. The message and\n// its status are still saved.\nconst gate = $('Decision Gate').first().json;\nconst n = $input.first().json || {};\nconst allowed = n.allowed === true;\nconst out = { ...gate, notify_allowed: allowed, first_held: n.first_held === true, notify_cap: n.cap || null };\nif (!allowed) {\n  out.approvable = false;\n  out.blocks = gate.blocks.concat(['the daily limit of ' + (n.cap || 'the configured number of') + ' inbox emails was reached, so this message is held without an email']);\n  out.reason = 'No approval offered: ' + out.blocks.join('; ');\n}\nreturn [{ json: out }];", pos(14, 3)),
  rpc('save', 'Save Draft', 'qylat_inbox_save_draft',
    "{ p_thread_id: $('Claim Message').first().json.thread_id, p_message_id: $('Claim Message').first().json.message_id, p_category: $json.category, p_confidence: $json.confidence, p_reply_text: $json.reply_text, p_approvable: $json.approvable, p_blocks: $json.blocks, p_warnings: $json.warnings, p_model: $json.model, p_usage: $json.usage, p_reason: $json.reason }",
    pos(14, 2), { notes: 'Stores the exact text a customer would receive and its fingerprint. Opens approval only for an eligible draft.' }),
  code('owner-email', 'Build Owner Email', 'owner_email.js', pos(15, 2)),
  iff('notify-allowed', 'Notify Allowed?', "$('Apply Ceiling').first().json.notify_allowed === true", pos(15, 3)),
  iff('first-held', 'First Over Ceiling?', "$('Apply Ceiling').first().json.first_held === true", pos(16, 4)),
  noop('held', 'Held Without Email', pos(17, 5), 'Recorded with its status. No email, because the daily ceiling was already reached and already reported.'),
  {
    id: 'ceiling-reached', name: 'Ceiling Reached', type: 'n8n-nodes-base.stopAndError', typeVersion: 1, position: pos(17, 4),
    parameters: { errorMessage: 'QYLAT inbox: the daily limit of inbox emails to you has been reached. Messages arriving for the rest of today are recorded and held, with no email for each one. Nothing is lost and nothing is sent to anyone. Open the QYLAT mailbox to read them. This alert is raised once a day.' },
    notes: 'Fails the execution on purpose, once a day, so the instance-wide failure alert tells the owner. That alert does not use the sending provider whose quota this ceiling protects, and it carries no customer text.',
  },
  resend('send-owner', 'Send Owner Email', pos(16, 2), 'OWNER ONLY. The recipient is fixed in Config. Sent from the no-reply address.'),
  code('owner-outcome', 'Owner Email Outcome', 'provider_outcome.js', pos(17, 2), 'runOnceForEachItem'),
  rpc('log-owner', 'Record Owner Email', 'qylat_inbox_log',
    "{ p_thread_id: $('Claim Message').first().json.thread_id, p_message_id: $('Claim Message').first().json.message_id, p_draft_id: $('Build Owner Email').first().json.draft_id, p_type: 'owner_email_' + $json.outcome, p_actor: 'system', p_summary: $json.error || null, p_detail: { provider_message_id: $json.provider_message_id || null } }", pos(18, 2)),
  iff('owner-told', 'Owner Told?', "$('Owner Email Outcome').first().json.outcome !== 'failed'", pos(19, 2)),
  {
    id: 'owner-not-told', name: 'Owner Email Not Sent', type: 'n8n-nodes-base.stopAndError', typeVersion: 1, position: pos(20, 3),
    parameters: { errorMessage: 'QYLAT inbox: the owner email for a handled message was refused by the sending provider. A message is waiting in the QYLAT mailbox with no notice sent.' },
    notes: 'Fails the execution on purpose, so the instance-wide failure alert fires. Nothing is sent to a customer.',
  },
  iff('offered', 'Approval Offered?', "$('Build Owner Email').first().json.approval_offered === true", pos(20, 2)),
  noop('no-approval', 'Owner Answers By Hand', pos(21, 3), 'No approval was offered. Nothing can be sent for this message.'),
  {
    id: 'wait', name: 'Wait For Decision', type: 'n8n-nodes-base.wait', typeVersion: 1.1, position: pos(21, 2),
    parameters: {
      resume: 'form',
      formTitle: 'QYLAT inbox: decide on this reply',
      formDescription: "={{ 'To: ' + $('Normalize and Filter').first().json.customer_email + '\\nSubject: ' + $('Normalize and Filter').first().json.subject + '\\n\\nThe reply is the one shown in your approval email. Sending cannot be undone.' }}",
      formFields: { values: [
        { fieldLabel: 'Decision', fieldType: 'dropdown', fieldOptions: { values: [{ option: 'Send this reply' }, { option: 'Do not send' }] }, requiredField: true },
        { fieldLabel: 'Approval code', placeholder: 'From your approval email', requiredField: true },
      ] },
      limitWaitTime: true, limitType: 'afterTimeInterval', resumeAmount: CONFIG.approval_ttl_hours, resumeUnit: 'hours',
      options: {},
    },
    notes: 'Waits for the decision page, once, for the approval window. The window and single use are also enforced in the database.',
  },
  code('read-decision', 'Read Decision', 'read_decision.js', pos(22, 2)),
  rpc('decide', 'Decide', 'qylat_inbox_decide', '{ p_draft_id: $json.draft_id, p_decision: $json.decision, p_sha: $json.sha256, p_code: $json.code }', pos(23, 2),
    { notes: 'SINGLE USE. Applies only to a pending draft, inside the window, for the exact text that was reviewed, with the one-time code from the approval email. A wrong code closes the approval.' }),
  iff('approved', 'Approved?', "$json.applied === true && $json.status === 'approved'", pos(24, 2)),
  rpc('claim-send', 'Claim Send', 'qylat_inbox_claim_send', "{ p_draft_id: $('Read Decision').first().json.draft_id, p_sha: $('Read Decision').first().json.sha256 }", pos(25, 1),
    { notes: 'ATOMIC. The only path to a customer. Refused in shadow mode, with sending off, with the third database switch off, without approval, or if already claimed. Returns the stored text.' }),
  iff('send-claimed', 'Send Claimed?', '$json.claimed === true', pos(26, 1)),
  code('build-reply', 'Build Reply', 'build_reply.js', pos(27, 0)),
  iff('reply-valid', 'Reply Valid?', '$json.valid === true', pos(28, 0)),
  inline('invalid-reply', 'Invalid Reply',
    "// The claimed reply failed its last check (no valid recipient or no text). It is recorded as refused, not sent.\nreturn [{ json: { statusCode: 422, body: { message: 'the reply failed validation before sending' } } }];", pos(29, 1)),
  resend('send-reply', 'Send Reply', pos(29, 0), 'THE ONLY NODE THAT EMAILS A CUSTOMER. Reached only after the owner approved this exact text and the database granted the send claim. Never retried: a timeout is recorded as "may have been sent".'),
  code('reply-outcome', 'Reply Outcome', 'provider_outcome.js', pos(30, 0), 'runOnceForEachItem'),
  rpc('complete', 'Complete Send', 'qylat_inbox_complete_send',
    "{ p_draft_id: $('Read Decision').first().json.draft_id, p_outcome: $json.outcome, p_provider_message_id: $json.provider_message_id || null, p_error: $json.error || null }", pos(31, 0),
    { onError: 'continueRegularOutput', notes: 'Records sent only with the provider message id. If this fails after a send, the result notice says "sent, not recorded".' }),
  code('notice', 'Build Result Notice', 'result_notice.js', pos(32, 2)),
  iff('notify', 'Tell Owner?', '$json.notify === true', pos(33, 2)),
  resend('send-notice', 'Send Result Notice', pos(34, 2), 'OWNER ONLY.'),
  code('notice-outcome', 'Result Notice Outcome', 'provider_outcome.js', pos(35, 2), 'runOnceForEachItem'),
  rpc('log-notice', 'Record Result Notice', 'qylat_inbox_log',
    "{ p_thread_id: $('Claim Message').first().json.thread_id, p_message_id: $('Claim Message').first().json.message_id, p_draft_id: $('Read Decision').first().json.draft_id, p_type: 'result_notice_' + $json.outcome, p_actor: 'system', p_summary: $('Build Result Notice').first().json.state, p_detail: { provider_message_id: $json.provider_message_id || null, error: $json.error || null } }", pos(36, 2)),
  noop('declined', 'Declined', pos(34, 3)),
  iff('notice-delivered', 'Notice Delivered?', "$('Result Notice Outcome').first().json.outcome === 'sent'", pos(37, 2)),
  {
    id: 'notice-failed', name: 'Result Notice Not Delivered', type: 'n8n-nodes-base.stopAndError', typeVersion: 1, position: pos(38, 3),
    parameters: { errorMessage: 'QYLAT inbox: an email telling you that a reply was not sent, or may not have been sent, could not be delivered to you. Check the QYLAT inbox records before answering anyone by hand.' },
    notes: 'Fails the execution on purpose so the instance-wide failure alert fires. It carries no customer text.',
  },
];
const handlerWires = wire([
  ['One Email', 'Config'], ['Config', 'Normalize and Filter'], ['Normalize and Filter', 'Customer Mail?'],
  ['Customer Mail?', 'Claim Message', 0], ['Customer Mail?', 'Mailbox Check?', 1],
  ['Mailbox Check?', 'Record Mailbox Check', 0], ['Mailbox Check?', 'Record Ignored', 1],
  ['Claim Message', 'Claimed?'], ['Claimed?', 'Build AI Request', 0], ['Claimed?', 'Not Claimed', 1],
  ['Build AI Request', 'Call Wanted?'], ['Call Wanted?', 'Claim Model Call', 0], ['Call Wanted?', 'No Model Call', 1],
  ['Claim Model Call', 'Call Allowed?'], ['Call Allowed?', 'AI Draft', 0], ['Call Allowed?', 'No Model Call', 1],
  ['AI Draft', 'Parse AI Answer', 0], ['AI Draft', 'Model Error', 1], ['Model Error', 'Parse AI Answer'], ['No Model Call', 'Parse AI Answer'],
  ['Parse AI Answer', 'Decision Gate'], ['Decision Gate', 'Claim Notification'], ['Claim Notification', 'Apply Ceiling'], ['Apply Ceiling', 'Save Draft'], ['Save Draft', 'Build Owner Email'],
  ['Build Owner Email', 'Notify Allowed?'], ['Notify Allowed?', 'Send Owner Email', 0], ['Notify Allowed?', 'First Over Ceiling?', 1],
  ['First Over Ceiling?', 'Ceiling Reached', 0], ['First Over Ceiling?', 'Held Without Email', 1], ['Send Owner Email', 'Owner Email Outcome'], ['Owner Email Outcome', 'Record Owner Email'],
  ['Record Owner Email', 'Owner Told?'], ['Owner Told?', 'Approval Offered?', 0], ['Owner Told?', 'Owner Email Not Sent', 1],
  ['Approval Offered?', 'Wait For Decision', 0], ['Approval Offered?', 'Owner Answers By Hand', 1],
  ['Wait For Decision', 'Read Decision'], ['Read Decision', 'Decide'], ['Decide', 'Approved?'],
  ['Approved?', 'Claim Send', 0], ['Approved?', 'Build Result Notice', 1],
  ['Claim Send', 'Send Claimed?'], ['Send Claimed?', 'Build Reply', 0], ['Send Claimed?', 'Build Result Notice', 1],
  ['Build Reply', 'Reply Valid?'], ['Reply Valid?', 'Send Reply', 0], ['Reply Valid?', 'Invalid Reply', 1],
  ['Send Reply', 'Reply Outcome'], ['Invalid Reply', 'Reply Outcome'], ['Reply Outcome', 'Complete Send'], ['Complete Send', 'Build Result Notice'],
  ['Build Result Notice', 'Tell Owner?'], ['Tell Owner?', 'Send Result Notice', 0], ['Tell Owner?', 'Declined', 1],
  ['Send Result Notice', 'Result Notice Outcome'], ['Result Notice Outcome', 'Record Result Notice'],
  ['Record Result Notice', 'Notice Delivered?'], ['Notice Delivered?', 'Result Notice Not Delivered', 1],
]);

// ── Poller ──────────────────────────────────────────────────────────────────
const pollerNodes = [
  {
    id: 'imap', name: 'New Email', type: 'n8n-nodes-base.emailReadImap', typeVersion: 2.1, position: pos(0, 0),
    parameters: {
      mailbox: 'INBOX', postProcessAction: 'nothing', format: 'simple', downloadAttachments: false,
      // n8n 2.20.9 cannot run this node at version 2.2. SINCE keeps mail from before the test day out of reach.
      options: { customEmailConfig: '["UNSEEN", ["SINCE", "October 10, 2026"]]', trackLastMessageId: true, forceReconnect: 30 },
    },
    credentials: CRED_IMAP,
    notes: 'Reads the QYLAT inbox. Leaves every message unread and in place. Attachments are never downloaded. This workflow sends nothing and decides nothing.',
  },
  {
    id: 'each', name: 'Handle Each Email', type: 'n8n-nodes-base.executeWorkflow', typeVersion: 1.2, position: pos(1, 0),
    parameters: {
      source: 'database', workflowId: { __rl: true, value: 'REPLACE_WITH_HANDLER_ID', mode: 'id' },
      workflowInputs: { mappingMode: 'defineBelow', value: {}, matchingColumns: [], schema: [], attemptToConvertTypes: false, convertFieldsToString: true },
      mode: 'each', options: { waitForSubWorkflow: false },
    },
    onError: 'continueRegularOutput',
    notes: 'Runs the handler once per email and does not wait for it. A failure in one email cannot stop the others. Duplicates are refused in the database.',
  },
];

// ── Watchdog ────────────────────────────────────────────────────────────────
const watchdogNodes = [
  { id: 'every', name: 'Every 15 Minutes', type: 'n8n-nodes-base.scheduleTrigger', typeVersion: 1.2, position: pos(0, 0), parameters: { rule: { interval: [{ field: 'minutes', minutesInterval: 15 }] } } },
  { id: 'daily', name: 'Daily Mailbox Check', type: 'n8n-nodes-base.scheduleTrigger', typeVersion: 1.2, position: pos(0, 2), parameters: { rule: { interval: [{ field: 'cronExpression', expression: '30 2 * * *' }] } } },
  config(pos(1, 1)),
  iff('which', 'Daily Run?', "$('Daily Mailbox Check').isExecuted", pos(2, 1)),
  iff('canary-on', 'Check Enabled?', "$('Config').first().json.canary_enabled === true", pos(3, 2)),
  rpc('canary-start', 'Start Mailbox Check', 'qylat_inbox_canary_start', "{ p_mailbox: $('Config').first().json.mailbox }", pos(4, 2)),
  inline('canary-build', 'Build Mailbox Check',
    "// One short message from the no-reply address to the QYLAT mailbox. The poller reports seeing it.\n// If it does not, the next sweep tells the owner that the mailbox may not be being read.\nconst cfg = $('Config').first().json;\nconst token = String($input.first().json.token || '');\nreturn [{ json: { idempotency_key: 'qylat-inbox-check-' + token, payload: { from: cfg.alert_from, to: [cfg.mailbox], subject: cfg.canary_subject_prefix + ' ' + token, text: 'Automatic daily check that this mailbox is being read. Safe to delete.' } } }];", pos(5, 2)),
  resend('canary-send', 'Send Mailbox Check', pos(6, 2), 'Goes to the QYLAT mailbox itself, never to a customer.'),
  code('canary-outcome', 'Mailbox Check Outcome', 'provider_outcome.js', pos(7, 2), 'runOnceForEachItem'),
  iff('canary-ok', 'Check Sent?', "$json.outcome === 'sent'", pos(8, 2)),
  {
    id: 'canary-failed', name: 'Mailbox Check Not Sent', type: 'n8n-nodes-base.stopAndError', typeVersion: 1, position: pos(9, 3),
    parameters: { errorMessage: 'QYLAT inbox: the daily mailbox check could not be sent, so there is no proof today that the mailbox is being read. This usually means the sending provider refused it or its daily quota is used up.' },
    notes: 'Fails the execution on purpose so the instance-wide failure alert fires.',
  },
  iff('alert-delivered', 'Alert Delivered?', "$('Sweep Alert Outcome').item.json.outcome === 'sent'", pos(8, 0)),
  {
    id: 'alert-failed', name: 'Sweep Alert Not Delivered', type: 'n8n-nodes-base.stopAndError', typeVersion: 1, position: pos(9, 1),
    parameters: { errorMessage: 'QYLAT inbox: an alert about a stuck, expired or uncertain item could not be emailed to you. The item is recorded. Check the QYLAT inbox records and the QYLAT mailbox.' },
    notes: 'Fails the execution on purpose so the instance-wide failure alert fires. It carries no customer text.',
  },
  noop('canary-off', 'Check Disabled', pos(4, 3)),
  rpc('sweep', 'Sweep', 'qylat_inbox_sweep', "{ p_mailbox: $('Config').first().json.mailbox, p_stuck_minutes: 20 }", pos(3, 0),
    { alwaysOutputData: true, notes: 'One database call marks what is stuck, expired or uncertain and returns each thing once. It sends nothing and resends nothing.' }),
  code('sweep-alerts', 'Build Sweep Alerts', 'sweep_alert.js', pos(4, 0)),
  resend('sweep-send', 'Send Sweep Alert', pos(5, 0), 'OWNER ONLY.'),
  code('sweep-outcome', 'Sweep Alert Outcome', 'provider_outcome.js', pos(6, 0), 'runOnceForEachItem'),
  rpc('sweep-log', 'Record Sweep Alert', 'qylat_inbox_log',
    "{ p_thread_id: $('Build Sweep Alerts').item.json.thread_id, p_message_id: null, p_draft_id: $('Build Sweep Alerts').item.json.draft_id, p_type: 'sweep_alert_' + $json.outcome, p_actor: 'system', p_summary: $('Build Sweep Alerts').item.json.kind, p_detail: { provider_message_id: $json.provider_message_id || null, error: $json.error || null } }", pos(7, 0)),
];
const watchdogWires = wire([
  ['Every 15 Minutes', 'Config'], ['Daily Mailbox Check', 'Config'], ['Config', 'Daily Run?'],
  ['Daily Run?', 'Check Enabled?', 0], ['Daily Run?', 'Sweep', 1],
  ['Check Enabled?', 'Start Mailbox Check', 0], ['Check Enabled?', 'Check Disabled', 1],
  ['Start Mailbox Check', 'Build Mailbox Check'], ['Build Mailbox Check', 'Send Mailbox Check'], ['Send Mailbox Check', 'Mailbox Check Outcome'], ['Mailbox Check Outcome', 'Check Sent?'], ['Check Sent?', 'Mailbox Check Not Sent', 1],
  ['Sweep', 'Build Sweep Alerts'], ['Build Sweep Alerts', 'Send Sweep Alert'], ['Send Sweep Alert', 'Sweep Alert Outcome'], ['Sweep Alert Outcome', 'Record Sweep Alert'], ['Record Sweep Alert', 'Alert Delivered?'], ['Alert Delivered?', 'Sweep Alert Not Delivered', 1],
]);

const settings = { executionOrder: 'v1', timezone: 'Asia/Bangkok', errorWorkflow: ERROR_WORKFLOW, callerPolicy: 'workflowsFromSameOwner' };
const files = {
  'qylat-inbox-handler.json': { name: 'QYLAT Inbox - Inbound handler (drafts only, every reply needs Liz, shadow by default)', nodes: handlerNodes, connections: handlerWires, settings, active: false },
  'qylat-inbox-poller.json': { name: 'QYLAT Inbox - Poller (reads the mailbox, starts the handler once per email)', nodes: pollerNodes, connections: wire([['New Email', 'Handle Each Email']]), settings, active: false },
  'qylat-inbox-watchdog.json': { name: 'QYLAT Inbox - Watchdog (reports stuck, expired and uncertain items, never resends)', nodes: watchdogNodes, connections: watchdogWires, settings, active: false },
};
for (const [file, wf] of Object.entries(files)) {
  fs.writeFileSync(path.join(outDir, file), JSON.stringify(wf, null, 2) + '\n');
  console.log(file, wf.nodes.length, 'nodes');
}
