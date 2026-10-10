// Read Decision (n8n Code node, run once for all items).
// Runs when the decision page was submitted or the wait ran out. Only an explicit choice counts.
// Anything else, including the wait ending with no answer, is treated as "expire": nothing is sent.
const owner = $('Build Owner Email').first().json;
const input = $input.first().json || {};
const choice = String(input.Decision || input.decision || '').trim().toLowerCase();
let decision = 'expire';
if (choice === 'send this reply') decision = 'approve';
else if (choice === 'do not send') decision = 'decline';
// The code is whatever was typed on the page. The database decides whether it is right.
const code = String(input['Approval code'] || input.approval_code || '').slice(0, 40);
return [{ json: { decision, draft_id: owner.draft_id, sha256: owner.sha256, code } }];
