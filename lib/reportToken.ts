import { createHmac, timingSafeEqual } from 'node:crypto';

// Result ids appear in share links, so knowing an id proves nothing. The quiz
// route hands this token only to the browser that just took the assessment,
// and the subscribe route refuses to email a full report without it. A share
// link never carries it.
function sign(resultId: string): string {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error('Missing env var: SUPABASE_SERVICE_ROLE_KEY');
  return createHmac('sha256', key).update(`qylat-report:${resultId}`).digest('hex');
}

export function reportToken(resultId: string): string {
  return sign(resultId);
}

export function isValidReportToken(resultId: string, token: unknown): boolean {
  if (typeof token !== 'string' || !/^[a-f0-9]{64}$/.test(token)) return false;
  const expected = Buffer.from(sign(resultId), 'hex');
  const given = Buffer.from(token, 'hex');
  return given.length === expected.length && timingSafeEqual(given, expected);
}
