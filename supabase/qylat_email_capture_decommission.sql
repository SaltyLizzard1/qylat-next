-- NOT the rollback. Routine rollback keeps every table and every captured row:
--   update public.outbound_email_settings set send_mode = 'off' where brand = 'qylat';
-- then unpublish the n8n worker and roll the Vercel deployment back.
--
-- This file permanently removes the QYLAT email schema. It refuses to run while
-- any subscriber, capture or queued email exists, so captured data cannot be
-- dropped by accident. Export and empty the tables by hand first if a full
-- teardown is ever really wanted. It touches no IdeaToPlan object.

begin;

do $$
begin
  if exists (select 1 from public.subscribers)
     or exists (select 1 from public.subscriber_captures)
     or exists (select 1 from public.outbound_emails) then
    raise exception 'QYLAT email tables hold data. Decommission refused. Nothing was dropped.';
  end if;
end;
$$;

drop function public.capture_subscriber(text, text, text, text, text, text, integer, boolean, text, text, jsonb, text);
drop function public.claim_outbound_emails(text, integer);
drop function public.complete_outbound_email(uuid, text, text, text);
drop function public.flag_stale_outbound_emails(text, integer);
drop function public.requeue_outbound_email(uuid);
drop function public.unsubscribe_by_token(text, text);
drop function public.record_delivery_event(text, text, timestamptz);
drop function public.import_kit_subscriber(text, text, text, text, text, timestamptz, text);

drop table public.outbound_emails;
drop table public.outbound_email_templates;
drop table public.outbound_email_settings;
drop table public.subscriber_captures;
drop table public.subscribers;

commit;
