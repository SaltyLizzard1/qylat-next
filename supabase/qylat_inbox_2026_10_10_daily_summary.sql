-- QYLAT inbox: third change applied on top of the first install.
-- Adds the read-only list behind the daily summary of what still needs the owner.
-- Changes no table and no row. Rollback: drop the function.
begin;

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

revoke all on function public.qylat_inbox_outstanding(text, integer) from public, anon, authenticated;
grant execute on function public.qylat_inbox_outstanding(text, integer) to service_role;

commit;
