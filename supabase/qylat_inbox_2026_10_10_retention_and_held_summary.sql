-- QYLAT inbox: second change applied on top of the first install.
-- Adds 12 month retention (switched off), the hold flag, and the next-day
-- summary of messages held by the daily ceiling.
-- Run as one transaction while every QYLAT inbox workflow is inactive.
-- No row is changed or deleted by running this file.
-- Rollback: drop the two new tables, the two new functions and the four new
-- columns, then re-create qylat_inbox_claim_notification(text) and
-- qylat_inbox_sweep from the previous version of supabase/qylat_inbox.sql.
begin;

alter table public.qylat_inbox_settings
  add column retention_enabled boolean not null default false,
  add column retention_months integer not null default 12 check (retention_months between 12 and 84);
alter table public.qylat_inbox_threads
  add column legal_hold boolean not null default false,
  add column legal_hold_reason text;

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

alter table public.qylat_inbox_send_audit enable row level security;
alter table public.qylat_inbox_retention_runs enable row level security;
revoke all on public.qylat_inbox_send_audit, public.qylat_inbox_retention_runs
from public, anon, authenticated, service_role;

drop function public.qylat_inbox_claim_notification(text);
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

create or replace function public.qylat_inbox_sweep(p_mailbox text, p_stuck_minutes integer default 20)
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

revoke all on function
  public.qylat_inbox_claim_notification(text, uuid),
  public.qylat_inbox_set_hold(uuid, boolean, text),
  public.qylat_inbox_retention(text, boolean, integer)
from public, anon, authenticated;
grant execute on function
  public.qylat_inbox_claim_notification(text, uuid),
  public.qylat_inbox_set_hold(uuid, boolean, text),
  public.qylat_inbox_retention(text, boolean, integer)
to service_role;

commit;
