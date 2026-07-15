import { NextResponse } from 'next/server';

// Intake submissions moved to ideatoplan.to, which enforces payment
// verification server-side. This route is intentionally disabled.
export async function POST() {
  return NextResponse.json(
    { error: 'Submissions have moved to https://ideatoplan.to' },
    { status: 410 }
  );
}
