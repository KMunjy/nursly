-- =============================================
-- NURSLY — Migration 004: Notifications
-- =============================================

create type notification_channel as enum ('email','in_app','push');
create type notification_status as enum ('pending','sent','failed','suppressed');

create table public.notification_events (
  id           uuid primary key default uuid_generate_v4(),
  recipient_id uuid not null references auth.users(id) on delete cascade,
  event_type   text not null,
  channel      notification_channel not null,
  status       notification_status not null default 'pending',
  payload      jsonb not null default '{}',
  error_message text,
  sent_at      timestamptz,
  created_at   timestamptz not null default now()
);

alter table public.notification_events enable row level security;

create policy "Users read own notifications"
  on public.notification_events for select using (auth.uid() = recipient_id);

create policy "Service role full access on notifications"
  on public.notification_events for all using (auth.role() = 'service_role');

create index notification_events_recipient_idx on public.notification_events(recipient_id);
create index notification_events_status_idx on public.notification_events(status) where status = 'pending';
create index notification_events_created_idx on public.notification_events(created_at desc);

create table public.credential_expiry_notices (
  id            uuid primary key default uuid_generate_v4(),
  credential_id uuid not null references public.credentials(id) on delete cascade,
  days_before   int not null,
  sent_at       timestamptz not null default now(),
  unique(credential_id, days_before)
);

alter table public.credential_expiry_notices enable row level security;

create policy "Service role full access on expiry_notices"
  on public.credential_expiry_notices for all using (auth.role() = 'service_role');
