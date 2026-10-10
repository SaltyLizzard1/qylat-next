-- QYLAT inbox: change applied to production on top of the first install.
-- Adds the daily ceiling on owner emails and renames the third send switch.
-- Run as one transaction while every QYLAT inbox workflow is inactive.
-- Rollback: rename the column back and re-create qylat_inbox_claim_send from
-- the previous version of supabase/qylat_inbox.sql. No data is changed.
begin;

alter table public.qylat_inbox_settings rename column disclosure_approved to production_send_authorized;
alter table public.qylat_inbox_settings
  add column daily_notification_cap integer not null default 25 check (daily_notification_cap between 1 and 60);

create table public.qylat_inbox_notify_days (
  mailbox text not null,
  day date not null,
  sent integer not null default 0,
  held integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (mailbox, day)
);
alter table public.qylat_inbox_notify_days enable row level security;
revoke all on public.qylat_inbox_notify_days from public, anon, authenticated, service_role;

create function public.qylat_inbox_claim_notification(p_mailbox text) returns jsonb
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
  return jsonb_build_object('allowed', false, 'cap', v_cap, 'held', v_held, 'first_held', v_held = 1);
end;
$$;

create or replace function public.qylat_inbox_claim_send(p_draft_id uuid, p_sha text) returns jsonb
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

revoke all on function public.qylat_inbox_claim_notification(text) from public, anon, authenticated;
grant execute on function public.qylat_inbox_claim_notification(text) to service_role;

commit;
