# QYLAT inbox tests

Zero-cost tests for the inbound email build. They use a throwaway local Postgres, a stub model and a
stub sending provider. Nothing reaches Supabase, n8n, OpenRouter, Resend or any mailbox.

The two packages they need (`embedded-postgres` and `pg`) are deliberately not in this repo's
`package.json`. Install them in a folder outside the repo, copy `inbox_test.mjs` there, and run:

```
node inbox_test.mjs <path to this repo>
```

Last run 2026-10-10: 168 passed, 0 failed.
