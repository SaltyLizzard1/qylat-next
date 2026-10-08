-- QYLAT email capture and fulfillment.
-- Shared Supabase project (yglmlnfsyzsvozxirlpo). Creates new objects only.
-- IdeaToPlan owns lead_notifications, email_events, email_threads,
-- email_model_budget, plan_*, idea_submissions and stripe_redemptions. This file
-- does not read, write, alter or reference any of them. The only existing
-- table it reads is quiz_results, and only rows where site = 'qylat', to
-- verify an assessment report exists before promising to send it.
--
-- Sending starts in mode 'off'. Nothing leaves until
-- outbound_email_settings.send_mode is changed to 'test' or 'live'.
--
-- Routine rollback does NOT touch this schema: set send_mode to 'off'. See
-- supabase/qylat_email_capture_decommission.sql for the non-routine teardown.

begin;

-- ── Tables ──────────────────────────────────────────────────────────────────

-- One row per address. Being in this table is not newsletter consent:
-- newsletter_status says whether the person chose the Leap Log, and
-- suppression blocks every email after a hard bounce or a spam complaint.
create table public.subscribers (
  id uuid primary key default gen_random_uuid(),
  brand text not null default 'qylat',
  email text not null check (email = lower(btrim(email)) and email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' and length(email) <= 254),
  newsletter_status text not null default 'none'
    check (newsletter_status in ('none', 'subscribed', 'unsubscribed')),
  newsletter_consent_text text,
  newsletter_consent_source text,
  newsletter_consent_at timestamptz,
  newsletter_changed_at timestamptz,
  suppression text check (suppression in ('bounced', 'complained')),
  suppressed_at timestamptz,
  unsubscribe_token text not null unique
    default replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', ''),
  origin text not null default 'site' check (origin in ('site', 'kit_import')),
  first_source text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (brand, email)
);

-- Every form submission, including repeats. Records what the visitor was
-- shown, the newsletter choice they actually made, and what happened to the
-- thing they asked for.
create table public.subscriber_captures (
  id uuid primary key default gen_random_uuid(),
  subscriber_id uuid not null references public.subscribers (id) on delete cascade,
  brand text not null,
  source text not null,
  purpose text not null,
  scope text not null default '',
  newsletter_opt_in boolean not null,
  notice_text text not null,
  fulfillment text not null default 'none'
    check (fulfillment in ('none', 'queued', 'already_sent', 'unavailable', 'suppressed')),
  fields jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index subscriber_captures_subscriber_idx on public.subscriber_captures (subscriber_id);

create table public.outbound_email_templates (
  brand text not null,
  key text not null,
  subject text not null,
  html text not null,
  body_text text not null,
  updated_at timestamptz not null default now(),
  primary key (brand, key)
);

create table public.outbound_email_settings (
  brand text primary key,
  send_mode text not null default 'off' check (send_mode in ('off', 'test', 'live')),
  test_allowlist text[] not null default '{}',
  from_address text not null,
  reply_to text not null,
  owner_notify_to text not null,
  site_url text not null,
  postal_address text not null,
  updated_at timestamptz not null default now()
);

create table public.outbound_emails (
  id uuid primary key default gen_random_uuid(),
  brand text not null,
  subscriber_id uuid references public.subscribers (id) on delete set null,
  capture_id uuid references public.subscriber_captures (id) on delete set null,
  kind text not null check (kind in ('resource', 'newsletter_welcome', 'owner_notice', 'newsletter')),
  purpose text not null,
  scope text not null default '',
  template_key text not null,
  to_email text not null,
  variables jsonb not null default '{}'::jsonb,
  status text not null default 'pending'
    check (status in ('pending', 'claimed', 'sent', 'failed', 'uncertain', 'suppressed', 'skipped_test')),
  attempts integer not null default 0,
  claimed_at timestamptz,
  sent_at timestamptz,
  provider_message_id text unique,
  last_error text,
  delivery_status text,
  delivery_at timestamptz,
  created_at timestamptz not null default now()
);
create index outbound_emails_pending_idx on public.outbound_emails (created_at) where status = 'pending';
create index outbound_emails_claimed_idx on public.outbound_emails (claimed_at) where status = 'claimed';
create index outbound_emails_purpose_idx on public.outbound_emails (subscriber_id, purpose, scope, created_at);

-- The ensure_rls event trigger already enables RLS on new public tables. Stated
-- here as well so this file is safe on its own. No policies: service_role only.
alter table public.subscribers enable row level security;
alter table public.subscriber_captures enable row level security;
alter table public.outbound_email_templates enable row level security;
alter table public.outbound_email_settings enable row level security;
alter table public.outbound_emails enable row level security;

-- ── Capture ─────────────────────────────────────────────────────────────────
-- One transaction records the subscriber, the capture, the newsletter choice
-- and any queue rows. The upsert takes a row lock on the subscriber, so two
-- simultaneous submissions for one address run one after the other and the
-- second sees what the first queued.
--
-- Sends are decided by purpose, not by form:
--   resource          one per subscriber, purpose and scope inside the window
--                     (p_window_days null means once ever for that scope)
--   newsletter_welcome only when this capture turned the newsletter on, and
--                     only when no resource email is going out for it
--   owner_notice      only when the capture changed something: a new address,
--                     a queued resource, a newsletter opt-in, or a first
--                     report of a resource that could not be sent

create function public.capture_subscriber(
  p_brand text,
  p_email text,
  p_source text,
  p_purpose text,
  p_resource_template text,
  p_scope text,
  p_window_days integer,
  p_newsletter_opt_in boolean,
  p_notice_text text,
  p_newsletter_consent_text text,
  p_fields jsonb
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := lower(btrim(p_email));
  v_scope text := coalesce(p_scope, '');
  v_sub public.subscribers%rowtype;
  v_is_new boolean;
  v_capture_id uuid;
  v_newsletter_changed boolean := false;
  v_fulfillment text := 'none';
  v_variables jsonb := '{}'::jsonb;
  v_matches jsonb;
  v_since timestamptz := case when p_window_days is null then '-infinity'::timestamptz
                              else now() - make_interval(days => p_window_days) end;
  v_notify_to text;
  v_site_url text;
  v_notice_due boolean;
begin
  insert into public.subscribers (brand, email, first_source)
  values (p_brand, v_email, p_source)
  on conflict (brand, email) do update set updated_at = clock_timestamp()
  returning * into v_sub;
  v_is_new := v_sub.created_at = v_sub.updated_at;

  select owner_notify_to, site_url into v_notify_to, v_site_url
    from public.outbound_email_settings where brand = p_brand;

  -- Newsletter: only an explicit choice turns it on, including after an
  -- earlier unsubscribe. A bounce or complaint is never reversed by a form.
  if coalesce(p_newsletter_opt_in, false)
     and v_sub.suppression is null
     and v_sub.newsletter_status <> 'subscribed' then
    update public.subscribers
       set newsletter_status = 'subscribed',
           newsletter_consent_text = p_newsletter_consent_text,
           newsletter_consent_source = p_source,
           newsletter_consent_at = now(),
           newsletter_changed_at = now()
     where id = v_sub.id
    returning * into v_sub;
    v_newsletter_changed := true;
  end if;

  insert into public.subscriber_captures
    (subscriber_id, brand, source, purpose, scope, newsletter_opt_in, notice_text, fields)
  values
    (v_sub.id, p_brand, p_source, p_purpose, v_scope, coalesce(p_newsletter_opt_in, false),
     p_notice_text, coalesce(p_fields, '{}'::jsonb))
  returning id into v_capture_id;

  -- Resource the visitor asked for.
  if p_resource_template is not null then
    if v_sub.suppression is not null then
      v_fulfillment := 'suppressed';
    else
      if p_purpose = 'assessment_report' then
        -- The report is built from the saved results, never from anything the
        -- browser sent. No saved results means there is nothing to send.
        select q.matches into v_matches from public.quiz_results q where q.id = v_scope and q.site = 'qylat';
        if v_matches is null or jsonb_typeof(v_matches) <> 'array' or jsonb_array_length(v_matches) = 0 then
          v_fulfillment := 'unavailable';
        else
          v_variables := jsonb_build_object(
            'matches', v_matches,
            'results_url', v_site_url || '/results/' || v_scope);
        end if;
      end if;

      if v_fulfillment <> 'unavailable' then
        if exists (
          select 1 from public.outbound_emails e
           where e.subscriber_id = v_sub.id and e.kind = 'resource'
             and e.purpose = p_purpose and e.scope = v_scope
             and e.status in ('pending', 'claimed', 'sent', 'uncertain')
             and e.created_at > v_since
        ) then
          v_fulfillment := 'already_sent';
        else
          insert into public.outbound_emails
            (brand, subscriber_id, capture_id, kind, purpose, scope, template_key, to_email, variables)
          values
            (p_brand, v_sub.id, v_capture_id, 'resource', p_purpose, v_scope, p_resource_template, v_email,
             v_variables || jsonb_build_object('newsletter_note',
               case when v_sub.newsletter_status = 'subscribed'
                    then 'You also chose the Leap Log, so I will send you new posts as they go up.'
                    else 'This is a one-time email. You are not on my newsletter list.' end));
          v_fulfillment := 'queued';
        end if;
      end if;
    end if;
  end if;

  -- Welcome: only for a fresh opt-in that is not already getting a resource
  -- email from this capture, and not twice inside a week.
  if v_newsletter_changed and v_fulfillment <> 'queued' and not exists (
       select 1 from public.outbound_emails e
        where e.subscriber_id = v_sub.id and e.kind = 'newsletter_welcome'
          and e.status in ('pending', 'claimed', 'sent', 'uncertain')
          and e.created_at > now() - interval '7 days') then
    insert into public.outbound_emails
      (brand, subscriber_id, capture_id, kind, purpose, template_key, to_email)
    values
      (p_brand, v_sub.id, v_capture_id, 'newsletter_welcome', 'newsletter_welcome', 'newsletter_welcome', v_email);
  end if;

  update public.subscriber_captures set fulfillment = v_fulfillment where id = v_capture_id;

  -- Owner notice: something changed, or a resource could not be sent and Liz
  -- has not been told about it for this address and purpose in the window.
  v_notice_due := v_is_new or v_newsletter_changed or v_fulfillment = 'queued'
    or (v_fulfillment in ('unavailable', 'suppressed') and not exists (
          select 1 from public.outbound_emails e
           where e.subscriber_id = v_sub.id and e.kind = 'owner_notice'
             and e.purpose = p_purpose and e.scope = v_scope
             and e.created_at > coalesce(nullif(v_since, '-infinity'::timestamptz), now() - interval '7 days')));

  if v_notice_due and v_notify_to is not null then
    insert into public.outbound_emails
      (brand, subscriber_id, capture_id, kind, purpose, scope, template_key, to_email, variables)
    values
      (p_brand, v_sub.id, v_capture_id, 'owner_notice', p_purpose, v_scope, 'owner_notice', v_notify_to,
       jsonb_build_object(
         'lead_email', v_email,
         'source', p_source,
         'purpose', p_purpose,
         'lead_state', case when v_is_new then 'new address' else 'seen before' end,
         'fulfillment', case v_fulfillment
            when 'queued' then 'resource email queued'
            when 'already_sent' then 'resource already sent recently, nothing new queued'
            when 'unavailable' then 'NOT SENT: no verified saved results for this report'
            when 'suppressed' then 'NOT SENT: this address bounced or complained'
            else 'no resource for this form' end,
         'newsletter', case
            when v_newsletter_changed then 'opted in on this form'
            when v_sub.newsletter_status = 'subscribed' then 'already subscribed'
            when v_sub.newsletter_status = 'unsubscribed' then 'unsubscribed, did not opt back in'
            else 'did not opt in' end,
         'fields', coalesce(p_fields, '{}'::jsonb)::text,
         'captured_at', to_char(now() at time zone 'utc', 'YYYY-MM-DD HH24:MI') || ' UTC'));
  end if;

  return jsonb_build_object(
    'capture_id', v_capture_id,
    'is_new', v_is_new,
    'fulfillment', v_fulfillment,
    'newsletter_status', v_sub.newsletter_status,
    'newsletter_changed', v_newsletter_changed,
    'owner_notice', v_notice_due and v_notify_to is not null);
end;
$$;

-- ── Claim: the only way a row leaves 'pending'. Atomic, skip locked. ─────────
-- Suppression is re-checked here, at send time:
--   owner_notice                     always allowed
--   any email to a bounced or complained address   suppressed
--   newsletter, newsletter_welcome   only while newsletter_status = 'subscribed'
--   resource                         allowed for none, subscribed and unsubscribed

create function public.claim_outbound_emails(p_brand text, p_limit integer default 10)
returns table (
  id uuid, kind text, purpose text, template_key text, to_email text, variables jsonb,
  subject text, html text, body_text text,
  from_address text, reply_to text, site_url text, postal_address text,
  unsubscribe_token text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_set public.outbound_email_settings%rowtype;
begin
  select * into v_set from public.outbound_email_settings s where s.brand = p_brand;
  if not found or v_set.send_mode = 'off' then
    return;
  end if;

  return query
  with picked as (
    select e.id from public.outbound_emails e
     where e.brand = p_brand and e.status = 'pending'
     order by e.created_at
     limit greatest(1, least(p_limit, 50))
     for update skip locked
  ), upd as (
    update public.outbound_emails e
       set status = case
             when e.kind <> 'owner_notice' and exists (
                    select 1 from public.subscribers s
                     where s.id = e.subscriber_id
                       and (s.suppression is not null
                            or (e.kind in ('newsletter', 'newsletter_welcome')
                                and s.newsletter_status <> 'subscribed'))) then 'suppressed'
             when v_set.send_mode = 'test' and not (e.to_email = any (v_set.test_allowlist)) then 'skipped_test'
             else 'claimed' end,
           claimed_at = now(),
           attempts = e.attempts + 1
      from picked p
     where e.id = p.id
    returning e.*
  )
  select u.id, u.kind, u.purpose, u.template_key, u.to_email, u.variables,
         t.subject, t.html, t.body_text,
         v_set.from_address, v_set.reply_to, v_set.site_url, v_set.postal_address,
         case when u.kind = 'owner_notice' then null else s.unsubscribe_token end
    from upd u
    left join public.outbound_email_templates t on t.brand = u.brand and t.key = u.template_key
    left join public.subscribers s on s.id = u.subscriber_id
   where u.status = 'claimed';
end;
$$;

-- ── Outcome: only a claimed row can be completed, and only once ─────────────

create function public.complete_outbound_email(
  p_id uuid, p_outcome text, p_provider_message_id text, p_error text
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_rows integer;
begin
  if p_outcome not in ('sent', 'failed', 'uncertain') then
    raise exception 'invalid outcome %', p_outcome;
  end if;
  if p_outcome = 'sent' and nullif(p_provider_message_id, '') is null then
    raise exception 'a sent outcome needs the provider message id';
  end if;
  update public.outbound_emails
     set status = p_outcome,
         sent_at = case when p_outcome = 'sent' then now() end,
         provider_message_id = nullif(p_provider_message_id, ''),
         last_error = nullif(p_error, '')
   where id = p_id and status = 'claimed';
  get diagnostics v_rows = row_count;
  return v_rows = 1;
end;
$$;

-- A claim with no recorded outcome may or may not have been sent. It is marked
-- uncertain and reported. It is never retried automatically.
create function public.flag_stale_outbound_emails(p_brand text, p_minutes integer default 15)
returns table (id uuid, kind text, template_key text, to_email text, claimed_at timestamptz)
language sql
security definer
set search_path = public
as $$
  update public.outbound_emails e
     set status = 'uncertain', last_error = 'claimed with no recorded outcome'
   where e.brand = p_brand and e.status = 'claimed'
     and e.claimed_at < now() - make_interval(mins => p_minutes)
  returning e.id, e.kind, e.template_key, e.to_email, e.claimed_at;
$$;

-- Manual, deliberate retry after Liz has looked at a failed or uncertain row.
-- The worker sends the row id as the provider idempotency key, so a requeue
-- inside the provider's 24 hour window cannot produce a second delivery.
-- skipped_test and suppressed are final. A message the test allowlist blocked
-- can never be released later, by a mode change or by hand.
create function public.requeue_outbound_email(p_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_rows integer;
begin
  update public.outbound_emails
     set status = 'pending', claimed_at = null
   where id = p_id and status in ('failed', 'uncertain');
  get diagnostics v_rows = row_count;
  return v_rows = 1;
end;
$$;

-- ── Unsubscribe and suppression ─────────────────────────────────────────────

-- Turns the newsletter off for this address, whatever it was before. Only an
-- explicit newsletter choice on a form turns it back on.
create function public.unsubscribe_by_token(p_token text, p_reason text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_found boolean;
begin
  update public.subscribers
     set newsletter_status = 'unsubscribed', newsletter_changed_at = now(), updated_at = clock_timestamp()
   where unsubscribe_token = p_token and newsletter_status <> 'unsubscribed';
  select exists (select 1 from public.subscribers where unsubscribe_token = p_token) into v_found;
  return v_found;
end;
$$;

-- Provider delivery events. A hard bounce or a complaint suppresses the
-- address for every kind of email. Nothing in this file clears a suppression.
create function public.record_delivery_event(
  p_provider_message_id text, p_event text, p_at timestamptz
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_sub uuid;
  v_kind text;
begin
  update public.outbound_emails
     set delivery_status = p_event, delivery_at = coalesce(p_at, now())
   where provider_message_id = p_provider_message_id
  returning subscriber_id, kind into v_sub, v_kind;
  if not found then
    return false;
  end if;
  if v_sub is not null and v_kind <> 'owner_notice' and p_event in ('bounced', 'complained') then
    update public.subscribers
       set suppression = case when suppression = 'complained' then 'complained' else p_event end,
           suppressed_at = coalesce(suppressed_at, now()), updated_at = clock_timestamp()
     where id = v_sub;
  end if;
  return true;
end;
$$;

-- ── Kit import: writes subscribers only. Queues nothing, so it cannot send. ──
-- The caller states each address's newsletter status, suppression and consent
-- evidence explicitly. The mapping from Kit's states is NOT decided in this
-- file: it waits on the Kit inspection. The most restrictive state always
-- wins, in both directions: an import never clears a local unsubscribe or
-- suppression, and a Kit opt-out, bounce or complaint always lands.
create function public.import_kit_subscriber(
  p_brand text, p_email text, p_newsletter_status text, p_suppression text,
  p_consent_text text, p_consent_at timestamptz, p_source text
) returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := lower(btrim(p_email));
  v_existing public.subscribers%rowtype;
  v_result text := 'kept';
begin
  if p_newsletter_status not in ('none', 'subscribed', 'unsubscribed') then
    raise exception 'invalid newsletter status % for %', p_newsletter_status, v_email;
  end if;
  if p_suppression is not null and p_suppression not in ('bounced', 'complained') then
    raise exception 'invalid suppression % for %', p_suppression, v_email;
  end if;
  if p_newsletter_status = 'subscribed' and (p_consent_text is null or p_consent_at is null) then
    raise exception 'a subscribed import needs consent evidence for %', v_email;
  end if;

  select * into v_existing from public.subscribers where brand = p_brand and email = v_email for update;
  if not found then
    insert into public.subscribers
      (brand, email, newsletter_status, newsletter_consent_text, newsletter_consent_source,
       newsletter_consent_at, newsletter_changed_at, suppression, suppressed_at,
       origin, first_source, created_at, updated_at)
    values
      (p_brand, v_email, p_newsletter_status,
       case when p_newsletter_status = 'subscribed' then p_consent_text end,
       case when p_newsletter_status = 'subscribed' then coalesce(p_source, 'kit') end,
       case when p_newsletter_status = 'subscribed' then p_consent_at end,
       now(), p_suppression, case when p_suppression is not null then now() end,
       'kit_import', coalesce(p_source, 'kit'), coalesce(p_consent_at, now()), coalesce(p_consent_at, now()));
    return 'inserted';
  end if;

  if p_suppression is not null and v_existing.suppression is distinct from 'complained'
     and v_existing.suppression is distinct from p_suppression then
    update public.subscribers set suppression = p_suppression, suppressed_at = now(), updated_at = clock_timestamp()
     where id = v_existing.id;
    v_result := 'restricted';
  end if;
  if p_newsletter_status = 'unsubscribed' and v_existing.newsletter_status <> 'unsubscribed' then
    update public.subscribers set newsletter_status = 'unsubscribed', newsletter_changed_at = now(), updated_at = clock_timestamp()
     where id = v_existing.id;
    v_result := 'restricted';
  elsif p_newsletter_status = 'subscribed' and v_existing.newsletter_status = 'none' then
    update public.subscribers
       set newsletter_status = 'subscribed', newsletter_consent_text = p_consent_text,
           newsletter_consent_source = coalesce(p_source, 'kit'), newsletter_consent_at = p_consent_at,
           newsletter_changed_at = now(), updated_at = clock_timestamp()
     where id = v_existing.id;
    if v_result = 'kept' then v_result := 'subscribed'; end if;
  end if;
  return v_result;
end;
$$;

-- ── Grants: service_role only, same rule as check_rate_limit ────────────────

revoke all on function
  public.capture_subscriber(text, text, text, text, text, text, integer, boolean, text, text, jsonb),
  public.claim_outbound_emails(text, integer),
  public.complete_outbound_email(uuid, text, text, text),
  public.flag_stale_outbound_emails(text, integer),
  public.requeue_outbound_email(uuid),
  public.unsubscribe_by_token(text, text),
  public.record_delivery_event(text, text, timestamptz),
  public.import_kit_subscriber(text, text, text, text, text, timestamptz, text)
from public, anon, authenticated;

grant execute on function
  public.capture_subscriber(text, text, text, text, text, text, integer, boolean, text, text, jsonb),
  public.claim_outbound_emails(text, integer),
  public.complete_outbound_email(uuid, text, text, text),
  public.flag_stale_outbound_emails(text, integer),
  public.requeue_outbound_email(uuid),
  public.unsubscribe_by_token(text, text),
  public.record_delivery_event(text, text, timestamptz),
  public.import_kit_subscriber(text, text, text, text, text, timestamptz, text)
to service_role;

-- ── Settings. send_mode starts 'off'. ───────────────────────────────────────
-- from_address, reply_to and postal_address are the values Liz supplied on
-- 2026-10-08. Resend has verified quityourlifeandtravel.com itself, so the
-- from address sits on the root domain. The worker still refuses to send any
-- value or template that contains REPLACE_BEFORE_LAUNCH.

insert into public.outbound_email_settings
  (brand, send_mode, test_allowlist, from_address, reply_to, owner_notify_to, site_url, postal_address)
values
  ('qylat', 'off', array['liz@ideatoplan.to'],
   'Liz at Quit Your Life and Travel <liz@quityourlifeandtravel.com>',
   'liz@quityourlifeandtravel.com',
   'liz@ideatoplan.to',
   'https://www.quityourlifeandtravel.com',
   'Elizabeth Alfond, 3110 1st Avenue North, Suite 2M PMB 1066, St. Petersburg, FL 33713, United States');

-- ── Email copy ──────────────────────────────────────────────────────────────
-- Placeholders: {{site_url}} {{unsubscribe_url}} {{postal_address}}
-- {{newsletter_note}} plus the row's own variables. The worker fails a send
-- that still holds an unresolved placeholder rather than mailing it.

insert into public.outbound_email_templates (brand, key, subject, html, body_text) values
('qylat', 'leap_kit', 'Your 60-Day Leap Kit',
$html$<p>Hi, it's Liz.</p>
<p>Here is the 60-Day Leap Kit you asked for:</p>
<p><a href="{{site_url}}/60-day-leap-plan.pdf">Download the 60-Day Leap Kit</a></p>
<p>It is the exact system I used to pack up my life and move to Thailand. Inside are the phase-by-phase Master Plan and the week-by-week schedule. Start with Day 1 and work forward.</p>
<p>If a question comes up while you work through it, reply to this email. It comes straight to me.</p>
<p>Liz</p>
<p style="font-size:12px;color:#666">You are getting this because you asked for the Leap Kit at quityourlifeandtravel.com. {{newsletter_note}} You can <a href="{{unsubscribe_url}}">unsubscribe from the Leap Log</a> any time.<br>{{postal_address}}</p>$html$,
$text$Hi, it's Liz.

Here is the 60-Day Leap Kit you asked for:
{{site_url}}/60-day-leap-plan.pdf

It is the exact system I used to pack up my life and move to Thailand. Inside are the phase-by-phase Master Plan and the week-by-week schedule. Start with Day 1 and work forward.

If a question comes up while you work through it, reply to this email. It comes straight to me.

Liz

You are getting this because you asked for the Leap Kit at quityourlifeandtravel.com. {{newsletter_note}}
Unsubscribe from the Leap Log: {{unsubscribe_url}}
{{postal_address}}$text$),

-- {{matches_html}} and {{matches_text}} are built by the worker from the
-- saved quiz_results row, so the email is the full report itself.
('qylat', 'assessment_report', 'Your Discover Your Idea report',
$html$<p>Hi, it's Liz.</p>
<p>Here is your full Discover Your Idea report, every match with its first steps.</p>
{{matches_html}}
<p>If you want to share your matches, this is your page: <a href="{{results_url}}">{{results_url}}</a></p>
<p>If you want to talk any of them through, reply to this email. It comes straight to me.</p>
<p>Liz</p>
<p style="font-size:12px;color:#666">You are getting this because you asked for your report at quityourlifeandtravel.com. {{newsletter_note}} You can <a href="{{unsubscribe_url}}">unsubscribe from the Leap Log</a> any time.<br>{{postal_address}}</p>$html$,
$text$Hi, it's Liz.

Here is your full Discover Your Idea report, every match with its first steps.

{{matches_text}}

If you want to share your matches, this is your page: {{results_url}}

If you want to talk any of them through, reply to this email. It comes straight to me.

Liz

You are getting this because you asked for your report at quityourlifeandtravel.com. {{newsletter_note}}
Unsubscribe from the Leap Log: {{unsubscribe_url}}
{{postal_address}}$text$),

('qylat', 'newsletter_welcome', 'You''re in',
$html$<p>Hi, it's Liz.</p>
<p>You are on the list. I will send you the Leap Log as new posts go up.</p>
<p>While you are here, the free Leap Runway Calculator shows how long your money lasts:</p>
<p><a href="{{site_url}}/calculator">Open the Leap Runway Calculator</a></p>
<p>Reply to this email any time. It comes straight to me.</p>
<p>Liz</p>
<p style="font-size:12px;color:#666">You are getting this because you chose the Leap Log at quityourlifeandtravel.com. <a href="{{unsubscribe_url}}">Unsubscribe</a> any time.<br>{{postal_address}}</p>$html$,
$text$Hi, it's Liz.

You are on the list. I will send you the Leap Log as new posts go up.

While you are here, the free Leap Runway Calculator shows how long your money lasts:
{{site_url}}/calculator

Reply to this email any time. It comes straight to me.

Liz

You are getting this because you chose the Leap Log at quityourlifeandtravel.com.
Unsubscribe: {{unsubscribe_url}}
{{postal_address}}$text$),

('qylat', 'owner_notice', 'QYLAT lead: {{purpose}} via {{source}}',
$html$<p>{{lead_email}}</p><p>Form: {{source}}<br>Purpose: {{purpose}}<br>Address: {{lead_state}}<br>Resource: {{fulfillment}}<br>Newsletter: {{newsletter}}<br>Captured: {{captured_at}}<br>Fields: {{fields}}</p>$html$,
$text${{lead_email}}
Form: {{source}}
Purpose: {{purpose}}
Address: {{lead_state}}
Resource: {{fulfillment}}
Newsletter: {{newsletter}}
Captured: {{captured_at}}
Fields: {{fields}}$text$);

commit;
