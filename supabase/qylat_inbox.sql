-- QYLAT inbound email handling.
--
-- QYLAT-only objects, all prefixed qylat_inbox_. Nothing here alters an
-- existing table or function. The only existing data it reads is this brand's
-- own send queue (public.outbound_emails), to tell a customer what was sent.
--
-- Rules this file enforces, whatever a workflow or a model says:
--   * a message is handled once (unique rfc message id per mailbox)
--   * one execution works a conversation at a time
--   * the model call limit is counted here and can never exceed 100 a month
--   * a reply is sent only after a person approved that exact text (sha256),
--     inside the approval window, once, with the one-time code from their own
--     approval email (only its hash is stored)
--   * nothing is sent while shadow is on, sending is off, or production
--     sending is not authorized (three separate switches, all off at first)
--   * the owner is emailed about at most a set number of messages a day, so a
--     burst of mail cannot use up the sending quota the capture system needs
--   * a send with no confirmed outcome becomes 'uncertain' and is never resent
--   * a conversation is deleted 12 months after its last activity, never while
--     an approval is pending, a send is unresolved or a hold is set, and only
--     while the retention switch is on (off at first)

-- ── Settings: one row per mailbox. Everything starts closed. ────────────────

create table public.qylat_inbox_settings (
  mailbox text primary key,
  shadow boolean not null default true,
  sending_enabled boolean not null default false,
  fact_sheet_approved boolean not null default false,
  production_send_authorized boolean not null default false,
  monthly_model_cap integer not null default 100 check (monthly_model_cap between 0 and 100),
  approval_ttl_hours integer not null default 72 check (approval_ttl_hours between 1 and 168),
  max_handled_per_thread_per_day integer not null default 3 check (max_handled_per_thread_per_day between 1 and 20),
  max_handled_per_sender_per_day integer not null default 5 check (max_handled_per_sender_per_day between 1 and 50),
  daily_notification_cap integer not null default 25 check (daily_notification_cap between 1 and 60),
  retention_enabled boolean not null default false,
  retention_months integer not null default 12 check (retention_months between 12 and 84),
  canary_token text,
  canary_sent_at timestamptz,
  canary_seen_at timestamptz,
  canary_alerted_at timestamptz,
  updated_at timestamptz not null default now()
);

create table public.qylat_inbox_threads (
  id uuid primary key default gen_random_uuid(),
  mailbox text not null references public.qylat_inbox_settings (mailbox),
  thread_key text not null,
  customer_email text not null,
  customer_name text,
  subject text,
  status text not null check (status in (
    'processing', 'awaiting_approval', 'needs_owner', 'approved_not_sent',
    'sent', 'declined', 'expired', 'failed', 'uncertain')),
  status_reason text,
  category text,
  claimed_at timestamptz,
  claim_message_id uuid,
  legal_hold boolean not null default false,
  legal_hold_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (mailbox, thread_key)
);

create table public.qylat_inbox_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.qylat_inbox_threads (id),
  mailbox text not null,
  direction text not null check (direction in ('inbound', 'outbound')),
  rfc_message_id text not null,
  in_reply_to text,
  reference_ids text[] not null default '{}',
  from_email text not null,
  from_name text,
  subject text,
  body_text text not null default '',
  meta jsonb not null default '{}'::jsonb,
  status text not null check (status in ('processing', 'handled', 'deferred', 'deferred_alerted', 'sent')),
  received_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (mailbox, rfc_message_id)
);
create index qylat_inbox_messages_thread on public.qylat_inbox_messages (thread_id, created_at);
create index qylat_inbox_messages_sender on public.qylat_inbox_messages (mailbox, from_email, created_at);

-- Mail that was looked at and left alone. No body is kept.
create table public.qylat_inbox_ignored (
  id bigint generated always as identity primary key,
  mailbox text not null,
  rfc_message_id text not null,
  from_email text,
  subject text,
  reasons text[] not null default '{}',
  created_at timestamptz not null default now(),
  unique (mailbox, rfc_message_id)
);

create table public.qylat_inbox_drafts (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.qylat_inbox_threads (id),
  message_id uuid not null unique references public.qylat_inbox_messages (id),
  category text not null,
  confidence numeric,
  reply_text text not null default '',
  reply_sha256 text not null,
  blocks jsonb not null default '[]'::jsonb,
  warnings jsonb not null default '[]'::jsonb,
  model text,
  usage jsonb not null default '{}'::jsonb,
  approval_status text not null check (approval_status in ('not_offered', 'pending', 'approved', 'declined', 'expired')),
  approval_expires_at timestamptz,
  approval_code_sha256 text,
  decided_at timestamptz,
  send_status text check (send_status in ('claimed', 'sent', 'failed', 'uncertain', 'blocked')),
  send_claimed_at timestamptz,
  send_blocked_reason text,
  provider_message_id text,
  send_error text,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.qylat_inbox_events (
  id bigint generated always as identity primary key,
  thread_id uuid references public.qylat_inbox_threads (id),
  message_id uuid,
  draft_id uuid,
  event_type text not null,
  actor text not null check (actor in ('system', 'ai', 'owner')),
  summary text,
  detail jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index qylat_inbox_events_thread on public.qylat_inbox_events (thread_id, created_at);

-- Owner emails per day. Over the ceiling a message is still recorded with its
-- status. Only the email about it is withheld.
create table public.qylat_inbox_notify_days (
  mailbox text not null,
  day date not null,
  sent integer not null default 0,
  held integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (mailbox, day)
);

create table public.qylat_inbox_model_calls (
  scope text primary key,
  calls integer not null default 0,
  updated_at timestamptz not null default now()
);

-- What is kept after a conversation is deleted: proof that a reply was approved
-- before it was sent. No address, no name, no subject, no text.
create table public.qylat_inbox_send_audit (
  draft_id uuid primary key,
  mailbox text not null,
  approval_status text not null,
  decided_at timestamptz,
  send_status text,
  sent_at timestamptz,
  reply_sha256 text not null,
  provider_message_id text,
  removed_at timestamptz not null default now()
);

-- One row per cleanup that deleted something. Counts only.
create table public.qylat_inbox_retention_runs (
  id bigint generated always as identity primary key,
  mailbox text not null,
  ran_at timestamptz not null default now(),
  cutoff timestamptz not null,
  threads integer not null,
  messages integer not null,
  drafts integer not null,
  events integer not null,
  ignored integer not null,
  kept_unresolved integer not null,
  kept_on_hold integer not null
);

-- The ensure_rls event trigger already enables RLS on new public tables. Stated
-- here as well so this file is correct on its own. No policies: every read and
-- write goes through the functions below.
alter table public.qylat_inbox_settings enable row level security;
alter table public.qylat_inbox_threads enable row level security;
alter table public.qylat_inbox_messages enable row level security;
alter table public.qylat_inbox_ignored enable row level security;
alter table public.qylat_inbox_drafts enable row level security;
alter table public.qylat_inbox_events enable row level security;
alter table public.qylat_inbox_model_calls enable row level security;
alter table public.qylat_inbox_notify_days enable row level security;
alter table public.qylat_inbox_send_audit enable row level security;
alter table public.qylat_inbox_retention_runs enable row level security;

revoke all on
  public.qylat_inbox_settings, public.qylat_inbox_threads, public.qylat_inbox_messages,
  public.qylat_inbox_ignored, public.qylat_inbox_drafts, public.qylat_inbox_events,
  public.qylat_inbox_model_calls, public.qylat_inbox_notify_days,
  public.qylat_inbox_send_audit, public.qylat_inbox_retention_runs
from public, anon, authenticated, service_role;

-- ── Helpers ─────────────────────────────────────────────────────────────────

create function public.qylat_inbox_sha(p_text text) returns text
language sql immutable
as $$ select encode(sha256(convert_to(coalesce(p_text, ''), 'UTF8')), 'hex') $$;

create function public.qylat_inbox_log(
  p_thread_id uuid, p_message_id uuid, p_draft_id uuid,
  p_type text, p_actor text, p_summary text, p_detail jsonb
) returns boolean
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.qylat_inbox_events (thread_id, message_id, draft_id, event_type, actor, summary, detail)
  values (p_thread_id, p_message_id, p_draft_id, p_type, p_actor, left(p_summary, 500), coalesce(p_detail, '{}'::jsonb));
  return true;
end;
$$;

-- ── Ignored mail and the polling check ──────────────────────────────────────

create function public.qylat_inbox_record_ignored(
  p_mailbox text, p_rfc_message_id text, p_from_email text, p_subject text, p_reasons text[]
) returns boolean
language plpgsql security definer set search_path = public
as $$
declare
  v_rows integer;
begin
  insert into public.qylat_inbox_ignored (mailbox, rfc_message_id, from_email, subject, reasons)
  values (lower(p_mailbox), p_rfc_message_id, lower(p_from_email), left(p_subject, 120), coalesce(p_reasons, '{}'))
  on conflict (mailbox, rfc_message_id) do nothing;
  get diagnostics v_rows = row_count;
  return v_rows = 1;
end;
$$;

-- The watchdog sends itself a message through the mailbox. If the poller does
-- not report seeing it, reading the mailbox has stopped.
create function public.qylat_inbox_canary_start(p_mailbox text) returns jsonb
language plpgsql security definer set search_path = public
as $$
declare
  v_token text := replace(gen_random_uuid()::text, '-', '');
begin
  update public.qylat_inbox_settings
     set canary_token = v_token, canary_sent_at = now(), updated_at = now()
   where mailbox = lower(p_mailbox);
  if not found then
    raise exception 'unknown mailbox %', p_mailbox;
  end if;
  return jsonb_build_object('token', v_token);
end;
$$;

create function public.qylat_inbox_canary_seen(p_mailbox text, p_token text) returns boolean
language plpgsql security definer set search_path = public
as $$
declare
  v_rows integer;
begin
  update public.qylat_inbox_settings
     set canary_seen_at = now(), updated_at = now()
   where mailbox = lower(p_mailbox) and canary_token is not null and canary_token = p_token;
  get diagnostics v_rows = row_count;
  return v_rows = 1;
end;
$$;

-- ── Claim one inbound message ───────────────────────────────────────────────
-- One transaction records the message and claims its conversation. A message
-- seen before returns claimed = false. A conversation another execution is
-- working returns claimed = false and the message is kept as deferred, which
-- the sweep reports to the owner.
--
-- A message joins an existing conversation only when its headers point at a
-- message already on record AND it comes from that conversation's own address.
-- Headers alone are not trusted: they are written by the sender.

create function public.qylat_inbox_claim_message(
  p_mailbox text,
  p_rfc_message_id text,
  p_in_reply_to text,
  p_reference_ids text[],
  p_from_email text,
  p_from_name text,
  p_subject text,
  p_body text,
  p_meta jsonb,
  p_sender_verified boolean
) returns jsonb
language plpgsql security definer set search_path = public
as $$
declare
  v_mailbox text := lower(trim(p_mailbox));
  v_from text := lower(trim(p_from_email));
  v_set public.qylat_inbox_settings%rowtype;
  v_refs text[] := array_remove(coalesce(p_reference_ids, '{}') || p_in_reply_to, null);
  v_thread public.qylat_inbox_threads%rowtype;
  v_thread_id uuid;
  v_message_id uuid;
  v_prior_status text;
  v_thread_count integer;
  v_sender_count integer;
  v_model_allowed boolean := true;
  v_no_model_reason text;
  v_history jsonb;
  v_deliveries jsonb := '[]'::jsonb;
begin
  select * into v_set from public.qylat_inbox_settings where mailbox = v_mailbox;
  if not found then
    raise exception 'unknown mailbox %', p_mailbox;
  end if;
  if coalesce(p_rfc_message_id, '') = '' or v_from = '' then
    raise exception 'a message needs an id and a sender';
  end if;

  if exists (select 1 from public.qylat_inbox_messages m
              where m.mailbox = v_mailbox and m.rfc_message_id = p_rfc_message_id) then
    return jsonb_build_object('claimed', false, 'reason', 'duplicate message');
  end if;

  -- Find the conversation this message belongs to.
  select t.id into v_thread_id
    from public.qylat_inbox_messages m
    join public.qylat_inbox_threads t on t.id = m.thread_id
   where m.mailbox = v_mailbox and m.rfc_message_id = any (v_refs) and t.customer_email = v_from
   order by m.created_at desc
   limit 1;

  if v_thread_id is null then
    insert into public.qylat_inbox_threads (mailbox, thread_key, customer_email, customer_name, subject, status, claimed_at)
    values (v_mailbox, p_rfc_message_id, v_from, nullif(trim(p_from_name), ''), left(p_subject, 300), 'processing', now())
    on conflict (mailbox, thread_key) do nothing
    returning id into v_thread_id;
    if v_thread_id is null then
      return jsonb_build_object('claimed', false, 'reason', 'duplicate message');
    end if;
    select * into v_thread from public.qylat_inbox_threads where id = v_thread_id for update;
  else
    select * into v_thread from public.qylat_inbox_threads where id = v_thread_id for update;
    v_prior_status := v_thread.status;
    if v_thread.status = 'processing' and v_thread.claimed_at > now() - interval '20 minutes' then
      insert into public.qylat_inbox_messages
        (thread_id, mailbox, direction, rfc_message_id, in_reply_to, reference_ids, from_email, from_name, subject, body_text, meta, status)
      values
        (v_thread_id, v_mailbox, 'inbound', p_rfc_message_id, p_in_reply_to, coalesce(p_reference_ids, '{}'), v_from,
         nullif(trim(p_from_name), ''), left(p_subject, 300), coalesce(p_body, ''), coalesce(p_meta, '{}'::jsonb), 'deferred')
      on conflict (mailbox, rfc_message_id) do nothing;
      return jsonb_build_object('claimed', false, 'reason', 'conversation busy', 'thread_id', v_thread_id);
    end if;
  end if;

  insert into public.qylat_inbox_messages
    (thread_id, mailbox, direction, rfc_message_id, in_reply_to, reference_ids, from_email, from_name, subject, body_text, meta, status)
  values
    (v_thread_id, v_mailbox, 'inbound', p_rfc_message_id, p_in_reply_to, coalesce(p_reference_ids, '{}'), v_from,
     nullif(trim(p_from_name), ''), left(p_subject, 300), coalesce(p_body, ''), coalesce(p_meta, '{}'::jsonb), 'processing')
  on conflict (mailbox, rfc_message_id) do nothing
  returning id into v_message_id;
  if v_message_id is null then
    return jsonb_build_object('claimed', false, 'reason', 'duplicate message');
  end if;

  update public.qylat_inbox_threads
     set status = 'processing', claimed_at = now(), claim_message_id = v_message_id,
         status_reason = null, updated_at = now()
   where id = v_thread_id;

  -- Loop and cost guards. Over a limit the message is still recorded and the
  -- owner is still told. Only the model call is withheld.
  select count(*) into v_thread_count from public.qylat_inbox_messages m
   where m.thread_id = v_thread_id and m.direction = 'inbound' and m.status in ('processing', 'handled')
     and m.created_at > now() - interval '24 hours';
  select count(*) into v_sender_count from public.qylat_inbox_messages m
   where m.mailbox = v_mailbox and m.from_email = v_from and m.direction = 'inbound'
     and m.status in ('processing', 'handled') and m.created_at > now() - interval '24 hours';
  if v_thread_count > v_set.max_handled_per_thread_per_day then
    v_model_allowed := false;
    v_no_model_reason := 'this conversation passed ' || v_set.max_handled_per_thread_per_day || ' messages in a day';
  elsif v_sender_count > v_set.max_handled_per_sender_per_day then
    v_model_allowed := false;
    v_no_model_reason := 'this sender passed ' || v_set.max_handled_per_sender_per_day || ' messages in a day';
  elsif not v_set.fact_sheet_approved then
    v_model_allowed := false;
    v_no_model_reason := 'the fact sheet is not approved yet';
  end if;

  select coalesce(jsonb_agg(h order by h_at), '[]'::jsonb) into v_history
    from (
      select jsonb_build_object('direction', m.direction, 'at', m.created_at, 'text', left(m.body_text, 1500)) as h,
             m.created_at as h_at
        from public.qylat_inbox_messages m
       where m.thread_id = v_thread_id and m.id <> v_message_id and m.status in ('handled', 'sent', 'processing')
       order by m.created_at desc
       limit 6
    ) x;

  -- What this brand's own send queue shows for this address. Given only for a
  -- sender the receiving mail server verified, so a forged From learns nothing.
  if coalesce(p_sender_verified, false) then
    select coalesce(jsonb_agg(d), '[]'::jsonb) into v_deliveries
      from (
        select jsonb_build_object('email', e.template_key, 'status', e.status,
                                  'delivery', e.delivery_status, 'at', e.created_at) as d
          from public.outbound_emails e
         where e.brand = 'qylat' and e.kind = 'resource' and e.to_email = v_from
           and e.created_at > now() - interval '30 days'
         order by e.created_at desc
         limit 5
      ) y;
  end if;

  return jsonb_build_object(
    'claimed', true,
    'thread_id', v_thread_id,
    'message_id', v_message_id,
    'prior_status', v_prior_status,
    'model_allowed', v_model_allowed,
    'no_model_reason', v_no_model_reason,
    'history', v_history,
    'deliveries', v_deliveries);
end;
$$;

-- ── Model call limit. Atomic, monthly, never above 100. ─────────────────────

create function public.qylat_inbox_claim_model_call(p_mailbox text) returns jsonb
language plpgsql security definer set search_path = public
as $$
declare
  v_set public.qylat_inbox_settings%rowtype;
  v_scope text;
  v_cap integer;
  v_calls integer;
begin
  select * into v_set from public.qylat_inbox_settings where mailbox = lower(p_mailbox);
  if not found then
    return jsonb_build_object('allowed', false, 'reason', 'unknown mailbox');
  end if;
  if not v_set.fact_sheet_approved then
    return jsonb_build_object('allowed', false, 'reason', 'the fact sheet is not approved yet');
  end if;
  v_cap := least(v_set.monthly_model_cap, 100);
  v_scope := v_set.mailbox || ':' || to_char(now() at time zone 'utc', 'YYYY-MM');

  insert into public.qylat_inbox_model_calls as c (scope, calls)
  values (v_scope, 1)
  on conflict (scope) do update set calls = c.calls + 1, updated_at = now()
    where c.calls < v_cap
  returning calls into v_calls;

  if v_calls is null or v_calls > v_cap then
    -- The insert of a first row cannot be stopped by the where clause above,
    -- so a cap of zero is handled here.
    if v_calls is not null then
      update public.qylat_inbox_model_calls set calls = calls - 1 where scope = v_scope;
    end if;
    return jsonb_build_object('allowed', false, 'reason', 'monthly limit of ' || v_cap || ' model calls reached');
  end if;
  return jsonb_build_object('allowed', true, 'used', v_calls, 'cap', v_cap);
end;
$$;

-- ── Daily ceiling on owner emails. Atomic. ───────────────────────────────────
-- first_held is true for the first message held on a day, so the workflow can
-- raise one alert through a channel that does not use the sending provider.

create function public.qylat_inbox_claim_notification(p_mailbox text, p_thread_id uuid default null) returns jsonb
language plpgsql security definer set search_path = public
as $$
declare
  v_mailbox text := lower(p_mailbox);
  v_day date := (now() at time zone 'utc')::date;
  v_cap integer;
  v_sent integer;
  v_held integer;
begin
  select daily_notification_cap into v_cap from public.qylat_inbox_settings where mailbox = v_mailbox;
  if not found then
    raise exception 'unknown mailbox %', p_mailbox;
  end if;
  insert into public.qylat_inbox_notify_days (mailbox, day) values (v_mailbox, v_day)
  on conflict (mailbox, day) do nothing;
  update public.qylat_inbox_notify_days
     set sent = sent + 1, updated_at = now()
   where mailbox = v_mailbox and day = v_day and sent < v_cap
  returning sent into v_sent;
  if v_sent is not null then
    return jsonb_build_object('allowed', true, 'sent', v_sent, 'cap', v_cap, 'first_held', false);
  end if;
  update public.qylat_inbox_notify_days
     set held = held + 1, updated_at = now()
   where mailbox = v_mailbox and day = v_day
  returning held into v_held;
  -- Same transaction as the count, so a held message can never go unrecorded.
  -- The sweep lists it for the owner on the following day.
  if p_thread_id is not null then
    insert into public.qylat_inbox_events (thread_id, event_type, actor, summary)
    values (p_thread_id, 'notification_held', 'system',
            'Held without an email: the daily limit of inbox emails was reached.');
  end if;
  return jsonb_build_object('allowed', false, 'cap', v_cap, 'held', v_held, 'first_held', v_held = 1);
end;
$$;

-- ── Save the draft and open (or withhold) approval ──────────────────────────
-- The text stored here is the exact text a customer would receive. Its hash is
-- what the owner approves and what the send step must present again.

create function public.qylat_inbox_save_draft(
  p_thread_id uuid, p_message_id uuid, p_category text, p_confidence numeric,
  p_reply_text text, p_approvable boolean, p_blocks jsonb, p_warnings jsonb,
  p_model text, p_usage jsonb, p_reason text
) returns jsonb
language plpgsql security definer set search_path = public
as $$
declare
  v_thread public.qylat_inbox_threads%rowtype;
  v_ttl integer;
  v_offer boolean;
  v_draft_id uuid;
  v_sha text := public.qylat_inbox_sha(p_reply_text);
  v_expires timestamptz;
  v_code text;
begin
  select * into v_thread from public.qylat_inbox_threads where id = p_thread_id for update;
  if not found then
    raise exception 'unknown conversation';
  end if;
  -- The sweep may already have failed this conversation. A late result is
  -- recorded but opens no approval.
  if v_thread.status <> 'processing' or v_thread.claim_message_id is distinct from p_message_id then
    perform public.qylat_inbox_log(p_thread_id, p_message_id, null, 'late_result', 'system',
      'A result arrived after the conversation was released. Nothing was opened for approval.', '{}'::jsonb);
    return jsonb_build_object('saved', false, 'reason', 'conversation no longer held');
  end if;

  select approval_ttl_hours into v_ttl from public.qylat_inbox_settings where mailbox = v_thread.mailbox;
  v_offer := coalesce(p_approvable, false) and length(trim(coalesce(p_reply_text, ''))) > 0;
  v_expires := case when v_offer then now() + make_interval(hours => v_ttl) end;
  -- The code is random, shown once in the owner's approval email and never
  -- stored. Knowing a draft id or a page address is not enough to decide.
  if v_offer then
    v_code := upper(substr(replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', ''), 1, 12));
  end if;

  insert into public.qylat_inbox_drafts
    (thread_id, message_id, category, confidence, reply_text, reply_sha256, blocks, warnings, model, usage,
     approval_status, approval_expires_at, approval_code_sha256)
  values
    (p_thread_id, p_message_id, coalesce(nullif(p_category, ''), 'unknown'), p_confidence, coalesce(p_reply_text, ''), v_sha,
     coalesce(p_blocks, '[]'::jsonb), coalesce(p_warnings, '[]'::jsonb), p_model, coalesce(p_usage, '{}'::jsonb),
     case when v_offer then 'pending' else 'not_offered' end, v_expires,
     case when v_offer then public.qylat_inbox_sha(v_code) end)
  returning id into v_draft_id;

  update public.qylat_inbox_messages set status = 'handled' where id = p_message_id;
  update public.qylat_inbox_threads
     set status = case when v_offer then 'awaiting_approval' else 'needs_owner' end,
         status_reason = left(p_reason, 500), category = coalesce(nullif(p_category, ''), 'unknown'),
         claimed_at = null, updated_at = now()
   where id = p_thread_id;

  perform public.qylat_inbox_log(p_thread_id, p_message_id, v_draft_id,
    case when v_offer then 'draft_awaiting_approval' else 'needs_owner' end, 'ai', p_reason,
    jsonb_build_object('category', p_category, 'confidence', p_confidence, 'blocks', coalesce(p_blocks, '[]'::jsonb),
                       'warnings', coalesce(p_warnings, '[]'::jsonb), 'sha256', v_sha));

  return jsonb_build_object('saved', true, 'draft_id', v_draft_id, 'sha256', v_sha,
                            'approval_offered', v_offer, 'approval_expires_at', v_expires,
                            'approval_code', case when v_offer then
                              substr(v_code, 1, 4) || '-' || substr(v_code, 5, 4) || '-' || substr(v_code, 9, 4) end);
end;
$$;

-- Used when the handler cannot finish (the model call failed before a draft
-- existed, for example). Applies only while this message still holds the claim.
create function public.qylat_inbox_finish_failed(p_thread_id uuid, p_message_id uuid, p_reason text) returns boolean
language plpgsql security definer set search_path = public
as $$
declare
  v_rows integer;
begin
  update public.qylat_inbox_threads
     set status = 'failed', status_reason = left(p_reason, 500), claimed_at = null, updated_at = now()
   where id = p_thread_id and status = 'processing' and claim_message_id = p_message_id;
  get diagnostics v_rows = row_count;
  if v_rows = 1 then
    update public.qylat_inbox_messages set status = 'handled' where id = p_message_id;
    perform public.qylat_inbox_log(p_thread_id, p_message_id, null, 'failed', 'system', p_reason, '{}'::jsonb);
  end if;
  return v_rows = 1;
end;
$$;

-- ── The owner's decision. Single use, inside the window, for that exact text,
-- with the one-time code. A wrong code closes the approval: nothing is sent and
-- the owner answers by hand. ──────────────────────────────────────────────────

create function public.qylat_inbox_decide(p_draft_id uuid, p_decision text, p_sha text, p_code text) returns jsonb
language plpgsql security definer set search_path = public
as $$
declare
  v_d public.qylat_inbox_drafts%rowtype;
begin
  if p_decision not in ('approve', 'decline', 'expire') then
    raise exception 'invalid decision %', p_decision;
  end if;
  select * into v_d from public.qylat_inbox_drafts where id = p_draft_id for update;
  if not found then
    return jsonb_build_object('applied', false, 'reason', 'unknown draft');
  end if;
  if v_d.approval_status <> 'pending' then
    return jsonb_build_object('applied', false, 'reason', 'already ' || v_d.approval_status);
  end if;

  if p_decision = 'expire' or v_d.approval_expires_at <= now() then
    update public.qylat_inbox_drafts set approval_status = 'expired', decided_at = now() where id = p_draft_id;
    update public.qylat_inbox_threads set status = 'expired', status_reason = 'The approval window closed with no decision.', updated_at = now()
     where id = v_d.thread_id and status = 'awaiting_approval';
    perform public.qylat_inbox_log(v_d.thread_id, v_d.message_id, p_draft_id, 'approval_expired', 'system',
      'The approval window closed with no decision. Nothing was sent.', '{}'::jsonb);
    return jsonb_build_object('applied', p_decision = 'expire', 'reason', 'expired', 'status', 'expired');
  end if;

  if v_d.approval_code_sha256 is null
     or public.qylat_inbox_sha(upper(regexp_replace(coalesce(p_code, ''), '[^A-Za-z0-9]', '', 'g'))) <> v_d.approval_code_sha256 then
    update public.qylat_inbox_drafts set approval_status = 'expired', decided_at = now() where id = p_draft_id;
    update public.qylat_inbox_threads set status = 'expired', status_reason = 'A decision arrived with the wrong approval code. The approval was closed.', updated_at = now()
     where id = v_d.thread_id and status = 'awaiting_approval';
    perform public.qylat_inbox_log(v_d.thread_id, v_d.message_id, p_draft_id, 'approval_refused', 'system',
      'A decision arrived with the wrong approval code. The approval was closed. Nothing was sent.', '{}'::jsonb);
    return jsonb_build_object('applied', false, 'reason', 'wrong approval code', 'status', 'expired');
  end if;

  if p_sha is distinct from v_d.reply_sha256 or public.qylat_inbox_sha(v_d.reply_text) <> v_d.reply_sha256 then
    perform public.qylat_inbox_log(v_d.thread_id, v_d.message_id, p_draft_id, 'approval_refused', 'system',
      'The decision did not match the stored draft. Nothing changed.', '{}'::jsonb);
    return jsonb_build_object('applied', false, 'reason', 'draft text does not match what was reviewed');
  end if;

  update public.qylat_inbox_drafts
     set approval_status = case when p_decision = 'approve' then 'approved' else 'declined' end, decided_at = now()
   where id = p_draft_id;
  update public.qylat_inbox_threads
     set status = case when p_decision = 'approve' then 'approved_not_sent' else 'declined' end,
         status_reason = case when p_decision = 'approve' then 'Approved. Not sent yet.' else 'Declined. Answer by hand if needed.' end,
         updated_at = now()
   where id = v_d.thread_id;
  perform public.qylat_inbox_log(v_d.thread_id, v_d.message_id, p_draft_id,
    case when p_decision = 'approve' then 'approved' else 'declined' end, 'owner', null,
    jsonb_build_object('sha256', v_d.reply_sha256));
  return jsonb_build_object('applied', true, 'status', case when p_decision = 'approve' then 'approved' else 'declined' end);
end;
$$;

-- ── Send claim. The only path to a customer. ────────────────────────────────
-- Returns the stored text, so what is sent is what was approved, not anything
-- a workflow carried along. An approval that cannot be used now is closed as
-- blocked: it never turns into a send later.

create function public.qylat_inbox_claim_send(p_draft_id uuid, p_sha text) returns jsonb
language plpgsql security definer set search_path = public
as $$
declare
  v_d public.qylat_inbox_drafts%rowtype;
  v_t public.qylat_inbox_threads%rowtype;
  v_m public.qylat_inbox_messages%rowtype;
  v_set public.qylat_inbox_settings%rowtype;
  v_block text;
begin
  select * into v_d from public.qylat_inbox_drafts where id = p_draft_id for update;
  if not found then
    return jsonb_build_object('claimed', false, 'reason', 'unknown draft');
  end if;
  if v_d.approval_status <> 'approved' then
    return jsonb_build_object('claimed', false, 'reason', 'not approved (' || v_d.approval_status || ')');
  end if;
  if v_d.send_status is not null then
    return jsonb_build_object('claimed', false, 'reason', 'already ' || v_d.send_status);
  end if;
  if p_sha is distinct from v_d.reply_sha256 or public.qylat_inbox_sha(v_d.reply_text) <> v_d.reply_sha256 then
    v_block := 'draft text does not match what was approved';
  end if;

  select * into v_t from public.qylat_inbox_threads where id = v_d.thread_id for update;
  select * into v_m from public.qylat_inbox_messages where id = v_d.message_id;
  select * into v_set from public.qylat_inbox_settings where mailbox = v_t.mailbox;

  if v_block is null then
    v_block := case
      when v_set.shadow then 'shadow mode is on'
      when not v_set.sending_enabled then 'sending is switched off'
      when not v_set.production_send_authorized then 'production sending is not authorized'
      when length(trim(v_d.reply_text)) = 0 then 'the draft is empty'
      when jsonb_array_length(v_d.blocks) > 0 then 'the draft was not eligible for approval'
    end;
  end if;

  if v_block is not null then
    update public.qylat_inbox_drafts set send_status = 'blocked', send_blocked_reason = v_block where id = p_draft_id;
    update public.qylat_inbox_threads
       set status = 'approved_not_sent', status_reason = 'Approved but not sent: ' || v_block, updated_at = now()
     where id = v_t.id;
    perform public.qylat_inbox_log(v_t.id, v_d.message_id, p_draft_id, 'send_blocked', 'system',
      'Approved but not sent: ' || v_block, '{}'::jsonb);
    return jsonb_build_object('claimed', false, 'reason', v_block);
  end if;

  update public.qylat_inbox_drafts set send_status = 'claimed', send_claimed_at = now() where id = p_draft_id;
  perform public.qylat_inbox_log(v_t.id, v_d.message_id, p_draft_id, 'send_claimed', 'system', null, '{}'::jsonb);

  return jsonb_build_object(
    'claimed', true,
    'to_email', v_t.customer_email,
    'to_name', v_t.customer_name,
    'subject', coalesce(v_m.subject, v_t.subject, ''),
    'reply_text', v_d.reply_text,
    'in_reply_to', v_m.rfc_message_id,
    'reference_ids', to_jsonb(v_m.reference_ids || v_m.rfc_message_id));
end;
$$;

-- Only a claimed send can be completed, and only once. 'sent' needs the
-- provider's own message id.
create function public.qylat_inbox_complete_send(
  p_draft_id uuid, p_outcome text, p_provider_message_id text, p_error text
) returns jsonb
language plpgsql security definer set search_path = public
as $$
declare
  v_d public.qylat_inbox_drafts%rowtype;
  v_t public.qylat_inbox_threads%rowtype;
begin
  if p_outcome not in ('sent', 'failed', 'uncertain') then
    raise exception 'invalid outcome %', p_outcome;
  end if;
  if p_outcome = 'sent' and nullif(p_provider_message_id, '') is null then
    raise exception 'a sent outcome needs the provider message id';
  end if;
  select * into v_d from public.qylat_inbox_drafts where id = p_draft_id for update;
  if not found or v_d.send_status is distinct from 'claimed' then
    return jsonb_build_object('recorded', false, 'reason', 'this send is not waiting for an outcome');
  end if;
  select * into v_t from public.qylat_inbox_threads where id = v_d.thread_id for update;

  update public.qylat_inbox_drafts
     set send_status = p_outcome, provider_message_id = nullif(p_provider_message_id, ''),
         send_error = nullif(left(p_error, 500), ''), sent_at = case when p_outcome = 'sent' then now() end
   where id = p_draft_id;
  update public.qylat_inbox_threads
     set status = p_outcome,
         status_reason = case p_outcome
           when 'sent' then 'Reply accepted by the sending provider.'
           when 'failed' then 'The sending provider refused the reply. Nothing was sent.'
           else 'No confirmation from the sending provider. The reply may or may not have gone. It is not resent.' end,
         updated_at = now()
   where id = v_t.id;

  if p_outcome = 'sent' then
    insert into public.qylat_inbox_messages
      (thread_id, mailbox, direction, rfc_message_id, from_email, subject, body_text, status)
    values
      (v_t.id, v_t.mailbox, 'outbound', 'provider:' || p_provider_message_id, v_t.mailbox, v_t.subject, v_d.reply_text, 'sent')
    on conflict (mailbox, rfc_message_id) do nothing;
  end if;

  perform public.qylat_inbox_log(v_t.id, v_d.message_id, p_draft_id, 'send_' || p_outcome, 'system',
    nullif(left(p_error, 500), ''), jsonb_build_object('provider_message_id', nullif(p_provider_message_id, '')));
  return jsonb_build_object('recorded', true, 'status', p_outcome);
end;
$$;

-- ── Sweep: finds what needs the owner. Reports each thing once. Sends nothing
-- and resends nothing. ───────────────────────────────────────────────────────

create function public.qylat_inbox_sweep(p_mailbox text, p_stuck_minutes integer default 20)
returns table (kind text, thread_id uuid, draft_id uuid, customer_email text, subject text, detail text)
language plpgsql security definer set search_path = public
as $$
declare
  v_mailbox text := lower(p_mailbox);
begin
  return query
  with stuck as (
    update public.qylat_inbox_threads t
       set status = 'failed', claimed_at = null, updated_at = now(),
           status_reason = 'Processing did not finish. Nothing was sent. Read and answer by hand.'
     where t.mailbox = v_mailbox and t.status = 'processing'
       and t.claimed_at < now() - make_interval(mins => greatest(5, p_stuck_minutes))
    returning t.id, t.customer_email, t.subject
  )
  select 'stuck_processing'::text, s.id, null::uuid, s.customer_email, s.subject,
         'Processing did not finish. Nothing was sent.'::text
    from stuck s;

  return query
  with expired as (
    update public.qylat_inbox_drafts d
       set approval_status = 'expired', decided_at = now()
      from public.qylat_inbox_threads t
     where t.id = d.thread_id and t.mailbox = v_mailbox
       and d.approval_status = 'pending' and d.approval_expires_at <= now()
    returning d.id, d.thread_id, t.customer_email, t.subject
  ), marked as (
    update public.qylat_inbox_threads t
       set status = 'expired', status_reason = 'The approval window closed with no decision.', updated_at = now()
      from expired e
     where t.id = e.thread_id and t.status = 'awaiting_approval'
    returning t.id
  )
  select 'approval_expired'::text, e.thread_id, e.id, e.customer_email, e.subject,
         'The approval window closed with no decision. Nothing was sent.'::text
    from expired e
   where (select count(*) from marked) >= 0;

  return query
  with unsure as (
    update public.qylat_inbox_drafts d
       set send_status = 'uncertain', send_error = 'no outcome was recorded after the send was claimed'
      from public.qylat_inbox_threads t
     where t.id = d.thread_id and t.mailbox = v_mailbox
       and d.send_status = 'claimed' and d.send_claimed_at < now() - interval '15 minutes'
    returning d.id, d.thread_id, t.customer_email, t.subject
  ), marked as (
    update public.qylat_inbox_threads t
       set status = 'uncertain', updated_at = now(),
           status_reason = 'No confirmation from the sending provider. The reply may or may not have gone. It is not resent.'
      from unsure u
     where t.id = u.thread_id
    returning t.id
  )
  select 'send_uncertain'::text, u.thread_id, u.id, u.customer_email, u.subject,
         'A reply was claimed for sending and no outcome was recorded. It may or may not have gone. It is not resent.'::text
    from unsure u
   where (select count(*) from marked) >= 0;

  return query
  with deferred as (
    update public.qylat_inbox_messages m
       set status = 'deferred_alerted'
     where m.mailbox = v_mailbox and m.status = 'deferred'
    returning m.thread_id, m.from_email, m.subject
  )
  select 'deferred_message'::text, f.thread_id, null::uuid, f.from_email, f.subject,
         'A second message arrived while the conversation was being worked. It was recorded and not answered.'::text
    from deferred f;

  return query
  with stale as (
    update public.qylat_inbox_settings s
       set canary_alerted_at = now(), updated_at = now()
     where s.mailbox = v_mailbox and s.canary_sent_at is not null
       and s.canary_sent_at < now() - interval '30 minutes'
       and (s.canary_seen_at is null or s.canary_seen_at < s.canary_sent_at)
       and (s.canary_alerted_at is null or s.canary_alerted_at < s.canary_sent_at)
    returning s.mailbox, s.canary_sent_at
  )
  select 'polling_stale'::text, null::uuid, null::uuid, null::text, null::text,
         ('The mailbox check sent at ' || to_char(st.canary_sent_at at time zone 'utc', 'YYYY-MM-DD HH24:MI') ||
          ' UTC was not seen by the poller. New mail may not be being read.')::text
    from stale st;

  return query
  with due as (
    select e.thread_id, min(e.created_at) as held_at
      from public.qylat_inbox_events e
      join public.qylat_inbox_threads t on t.id = e.thread_id
     where t.mailbox = v_mailbox and e.event_type = 'notification_held'
       and e.created_at < date_trunc('day', now() at time zone 'utc') at time zone 'utc'
       and not exists (select 1 from public.qylat_inbox_events r
                        where r.thread_id = e.thread_id and r.event_type = 'notification_held_reported'
                          and r.created_at >= e.created_at)
     group by e.thread_id
  ), marked as (
    insert into public.qylat_inbox_events (thread_id, event_type, actor, summary)
    select d.thread_id, 'notification_held_reported', 'system', 'Listed in the summary of held messages.'
      from due d
    returning public.qylat_inbox_events.thread_id
  ), listed as (
    select d.held_at, t.customer_email, t.subject, t.status,
           row_number() over (order by d.held_at) as n, count(*) over () as total
      from due d join public.qylat_inbox_threads t on t.id = d.thread_id
  )
  select 'held_summary'::text, null::uuid, null::uuid, null::text, null::text,
         (max(l.total)::text || ' message(s) arrived after the daily limit of inbox emails was reached and were held without an email. ' ||
          'Each one is recorded and is still in the mailbox:' || E'\n\n' ||
          string_agg('- ' || l.customer_email || ': ' || coalesce(nullif(l.subject, ''), '(no subject)') ||
                     ' (' || to_char(l.held_at at time zone 'utc', 'YYYY-MM-DD HH24:MI') || ' UTC)', E'\n' order by l.n)
            filter (where l.n <= 40) ||
          case when max(l.total) > 40 then E'\n' || 'and ' || (max(l.total) - 40)::text || ' more in the mailbox.' else '' end)::text
    from listed l
   where (select count(*) from marked) >= 0
  having count(*) > 0;
end;
$$;

-- ── Retention ───────────────────────────────────────────────────────────────
-- A conversation is deleted, with its messages, drafts and log, once nothing
-- has happened in it for the retention period (12 months, never less).
--
-- Never deleted, whatever their age: a conversation still being processed, one
-- waiting for a decision, one whose send has no confirmed outcome, one with a
-- message not yet reported, and one placed on hold.
--
-- Nothing is deleted unless retention_enabled is on AND the caller asks to
-- apply. Any other call only counts what would go.

create function public.qylat_inbox_set_hold(p_thread_id uuid, p_hold boolean, p_reason text) returns boolean
language plpgsql security definer set search_path = public
as $$
begin
  update public.qylat_inbox_threads
     set legal_hold = coalesce(p_hold, false),
         legal_hold_reason = case when coalesce(p_hold, false) then left(p_reason, 300) end
   where id = p_thread_id;
  if not found then
    return false;
  end if;
  perform public.qylat_inbox_log(p_thread_id, null, null,
    case when coalesce(p_hold, false) then 'hold_set' else 'hold_released' end, 'owner', left(p_reason, 300), '{}'::jsonb);
  return true;
end;
$$;

create function public.qylat_inbox_retention(p_mailbox text, p_apply boolean default false, p_limit integer default 200)
returns jsonb
language plpgsql security definer set search_path = public
as $$
declare
  v_mailbox text := lower(p_mailbox);
  v_set public.qylat_inbox_settings%rowtype;
  v_cutoff timestamptz;
  v_ids uuid[];
  v_messages integer := 0;
  v_drafts integer := 0;
  v_events integer := 0;
  v_ignored integer := 0;
  v_unresolved integer := 0;
  v_hold integer := 0;
  v_apply boolean;
begin
  select * into v_set from public.qylat_inbox_settings where mailbox = v_mailbox;
  if not found then
    raise exception 'unknown mailbox %', p_mailbox;
  end if;
  v_cutoff := now() - make_interval(months => greatest(12, v_set.retention_months));
  v_apply := coalesce(p_apply, false) and v_set.retention_enabled;

  select coalesce(array_agg(x.id), '{}') into v_ids
    from (
      select t.id
        from public.qylat_inbox_threads t
       where t.mailbox = v_mailbox
         and t.status in ('needs_owner', 'approved_not_sent', 'sent', 'declined', 'expired', 'failed')
         and not t.legal_hold
         and t.created_at < v_cutoff and t.updated_at < v_cutoff
         and not exists (select 1 from public.qylat_inbox_messages m
                          where m.thread_id = t.id
                            and (m.created_at >= v_cutoff or m.status in ('processing', 'deferred')))
         and not exists (select 1 from public.qylat_inbox_drafts d
                          where d.thread_id = t.id
                            and (d.created_at >= v_cutoff
                                 or coalesce(d.decided_at, d.created_at) >= v_cutoff
                                 or coalesce(d.sent_at, d.created_at) >= v_cutoff
                                 or d.approval_status = 'pending'
                                 or d.send_status in ('claimed', 'uncertain')))
         and not exists (select 1 from public.qylat_inbox_events e
                          where e.thread_id = t.id and e.created_at >= v_cutoff)
       order by t.updated_at
       limit greatest(1, least(coalesce(p_limit, 200), 1000))
         for update of t skip locked
    ) x;

  select count(*) into v_unresolved
    from public.qylat_inbox_threads t
   where t.mailbox = v_mailbox and t.updated_at < v_cutoff and not t.legal_hold
     and (t.status in ('processing', 'awaiting_approval', 'uncertain')
          or exists (select 1 from public.qylat_inbox_drafts d
                      where d.thread_id = t.id
                        and (d.approval_status = 'pending' or d.send_status in ('claimed', 'uncertain')))
          or exists (select 1 from public.qylat_inbox_messages m
                      where m.thread_id = t.id and m.status in ('processing', 'deferred')));
  select count(*) into v_hold
    from public.qylat_inbox_threads t
   where t.mailbox = v_mailbox and t.updated_at < v_cutoff and t.legal_hold;

  if not v_apply then
    select count(*) into v_messages from public.qylat_inbox_messages where thread_id = any (v_ids);
    select count(*) into v_drafts from public.qylat_inbox_drafts where thread_id = any (v_ids);
    select count(*) into v_events from public.qylat_inbox_events where thread_id = any (v_ids);
    select count(*) into v_ignored from public.qylat_inbox_ignored where mailbox = v_mailbox and created_at < v_cutoff;
    return jsonb_build_object('applied', false,
      'reason', case when not coalesce(p_apply, false) then 'count only' else 'retention is switched off' end,
      'cutoff', v_cutoff, 'threads', coalesce(array_length(v_ids, 1), 0), 'messages', v_messages, 'drafts', v_drafts,
      'events', v_events, 'ignored', v_ignored, 'kept_unresolved', v_unresolved, 'kept_on_hold', v_hold);
  end if;

  insert into public.qylat_inbox_send_audit
    (draft_id, mailbox, approval_status, decided_at, send_status, sent_at, reply_sha256, provider_message_id)
  select d.id, v_mailbox, d.approval_status, d.decided_at, d.send_status, d.sent_at, d.reply_sha256, d.provider_message_id
    from public.qylat_inbox_drafts d
   where d.thread_id = any (v_ids) and d.approval_status = 'approved'
  on conflict (draft_id) do nothing;

  delete from public.qylat_inbox_events where thread_id = any (v_ids);
  get diagnostics v_events = row_count;
  delete from public.qylat_inbox_drafts where thread_id = any (v_ids);
  get diagnostics v_drafts = row_count;
  delete from public.qylat_inbox_messages where thread_id = any (v_ids);
  get diagnostics v_messages = row_count;
  delete from public.qylat_inbox_threads where id = any (v_ids);
  delete from public.qylat_inbox_ignored where mailbox = v_mailbox and created_at < v_cutoff;
  get diagnostics v_ignored = row_count;
  delete from public.qylat_inbox_notify_days where mailbox = v_mailbox and day < v_cutoff::date;

  if coalesce(array_length(v_ids, 1), 0) > 0 or v_ignored > 0 then
    insert into public.qylat_inbox_retention_runs
      (mailbox, cutoff, threads, messages, drafts, events, ignored, kept_unresolved, kept_on_hold)
    values (v_mailbox, v_cutoff, coalesce(array_length(v_ids, 1), 0), v_messages, v_drafts, v_events, v_ignored, v_unresolved, v_hold);
  end if;

  return jsonb_build_object('applied', true, 'cutoff', v_cutoff,
    'threads', coalesce(array_length(v_ids, 1), 0), 'messages', v_messages, 'drafts', v_drafts,
    'events', v_events, 'ignored', v_ignored, 'kept_unresolved', v_unresolved, 'kept_on_hold', v_hold);
end;
$$;

-- ── What still needs the owner ──────────────────────────────────────────────
-- Read only. Lists every conversation that is still open for the owner: a
-- decision not yet made, a reply approved but not sent, a send with no known
-- outcome, an approval that closed unanswered, and every message that was
-- left for a reply by hand, including those held by the daily email limit or
-- written without a draft because a limit was reached.
-- A pending decision and an unknown send are listed whatever their age. The
-- rest are listed while their last activity is inside the window, because the
-- system cannot see a reply the owner sends by hand.

create function public.qylat_inbox_outstanding(p_mailbox text, p_days integer default 7)
returns table (kind text, thread_id uuid, customer_email text, subject text, received_at timestamptz, detail text)
language sql stable security definer set search_path = public
as $$
  select
    case
      when t.status = 'awaiting_approval' then 'awaiting_approval'
      when t.status = 'uncertain' then 'uncertain'
      when t.status in ('approved_not_sent', 'failed') then 'not_sent'
      when t.status = 'expired' then 'expired'
      when h.held then 'held'
      when d.blocks::text ilike '%no model call was made%' then 'no_draft'
      else 'by_hand'
    end,
    t.id, t.customer_email, t.subject, m.received_at,
    case
      when t.status = 'awaiting_approval'
        then 'approval closes ' || to_char(d.approval_expires_at at time zone 'utc', 'YYYY-MM-DD HH24:MI') || ' UTC'
      when t.status in ('approved_not_sent', 'failed', 'uncertain', 'expired') then left(t.status_reason, 200)
    end
  from public.qylat_inbox_threads t
  left join lateral (select x.blocks, x.approval_expires_at from public.qylat_inbox_drafts x
                      where x.thread_id = t.id order by x.created_at desc limit 1) d on true
  left join lateral (select max(x.created_at) as received_at from public.qylat_inbox_messages x
                      where x.thread_id = t.id and x.direction = 'inbound') m on true
  left join lateral (select exists (select 1 from public.qylat_inbox_events x
                                     where x.thread_id = t.id and x.event_type = 'notification_held') as held) h on true
  where t.mailbox = lower(p_mailbox)
    and (t.status in ('awaiting_approval', 'uncertain')
         or (t.status in ('needs_owner', 'approved_not_sent', 'failed', 'expired')
             and t.updated_at > now() - make_interval(days => greatest(1, least(coalesce(p_days, 7), 30)))))
  order by 1, m.received_at;
$$;

-- ── Access: the service role, through these functions only ──────────────────

revoke all on function
  public.qylat_inbox_sha(text),
  public.qylat_inbox_log(uuid, uuid, uuid, text, text, text, jsonb),
  public.qylat_inbox_record_ignored(text, text, text, text, text[]),
  public.qylat_inbox_canary_start(text),
  public.qylat_inbox_canary_seen(text, text),
  public.qylat_inbox_claim_message(text, text, text, text[], text, text, text, text, jsonb, boolean),
  public.qylat_inbox_claim_model_call(text),
  public.qylat_inbox_claim_notification(text, uuid),
  public.qylat_inbox_save_draft(uuid, uuid, text, numeric, text, boolean, jsonb, jsonb, text, jsonb, text),
  public.qylat_inbox_finish_failed(uuid, uuid, text),
  public.qylat_inbox_decide(uuid, text, text, text),
  public.qylat_inbox_claim_send(uuid, text),
  public.qylat_inbox_complete_send(uuid, text, text, text),
  public.qylat_inbox_sweep(text, integer),
  public.qylat_inbox_set_hold(uuid, boolean, text),
  public.qylat_inbox_retention(text, boolean, integer),
  public.qylat_inbox_outstanding(text, integer)
from public, anon, authenticated;

grant execute on function
  public.qylat_inbox_log(uuid, uuid, uuid, text, text, text, jsonb),
  public.qylat_inbox_record_ignored(text, text, text, text, text[]),
  public.qylat_inbox_canary_start(text),
  public.qylat_inbox_canary_seen(text, text),
  public.qylat_inbox_claim_message(text, text, text, text[], text, text, text, text, jsonb, boolean),
  public.qylat_inbox_claim_model_call(text),
  public.qylat_inbox_claim_notification(text, uuid),
  public.qylat_inbox_save_draft(uuid, uuid, text, numeric, text, boolean, jsonb, jsonb, text, jsonb, text),
  public.qylat_inbox_finish_failed(uuid, uuid, text),
  public.qylat_inbox_decide(uuid, text, text, text),
  public.qylat_inbox_claim_send(uuid, text),
  public.qylat_inbox_complete_send(uuid, text, text, text),
  public.qylat_inbox_sweep(text, integer),
  public.qylat_inbox_set_hold(uuid, boolean, text),
  public.qylat_inbox_retention(text, boolean, integer),
  public.qylat_inbox_outstanding(text, integer)
to service_role;

-- ── Seed: the one mailbox. Shadow on, sending off, nothing approved. ────────

insert into public.qylat_inbox_settings (mailbox)
values ('liz@quityourlifeandtravel.com')
on conflict (mailbox) do nothing;
