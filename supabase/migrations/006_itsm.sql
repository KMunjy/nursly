-- =============================================
-- NURSLY — Migration 006: ITSM
-- =============================================

create type incident_severity as enum ('p1','p2','p3','p4');
create type incident_status as enum ('open','investigating','resolved','closed');
create type change_type as enum ('standard','normal','emergency');
create type change_status as enum ('draft','pending_approval','approved','deployed','rolled_back');
create type ticket_status as enum ('open','in_progress','pending_user','resolved','closed');
create type ticket_category as enum (
  'credential_issue','payment_issue','account_access',
  'shift_dispute','technical_bug','compliance_query','other'
);

create table public.incidents (
  id                  uuid primary key default uuid_generate_v4(),
  title               text not null,
  severity            incident_severity not null,
  status              incident_status not null default 'open',
  description         text,
  affected_components text[],
  reported_by         uuid references auth.users(id) on delete set null,
  assigned_to         uuid references auth.users(id) on delete set null,
  detected_at         timestamptz not null default now(),
  acknowledged_at     timestamptz,
  resolved_at         timestamptz,
  closed_at           timestamptz,
  resolution_summary  text,
  postmortem_url      text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

alter table public.incidents enable row level security;

create policy "Platform ops manage incidents"
  on public.incidents for all using (
    exists (select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role in ('platform_admin','platform_ops'))
  );

create policy "Service role full access on incidents"
  on public.incidents for all using (auth.role() = 'service_role');

create trigger incidents_updated_at
  before update on public.incidents
  for each row execute function public.handle_updated_at();

create table public.support_tickets (
  id          uuid primary key default uuid_generate_v4(),
  ticket_ref  text unique not null,
  raised_by   uuid not null references auth.users(id) on delete restrict,
  assigned_to uuid references auth.users(id) on delete set null,
  category    ticket_category not null,
  status      ticket_status not null default 'open',
  subject     text not null,
  description text not null,
  priority    incident_severity not null default 'p4',
  linked_shift uuid references public.shifts(id) on delete set null,
  resolution  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  resolved_at timestamptz
);

alter table public.support_tickets enable row level security;

create policy "Users read own tickets"
  on public.support_tickets for select using (auth.uid() = raised_by);

create policy "Users create own tickets"
  on public.support_tickets for insert with check (auth.uid() = raised_by);

create policy "Platform ops full access on tickets"
  on public.support_tickets for all using (
    exists (select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role in ('platform_admin','platform_ops'))
  );

create policy "Service role full access on support_tickets"
  on public.support_tickets for all using (auth.role() = 'service_role');

create trigger support_tickets_updated_at
  before update on public.support_tickets
  for each row execute function public.handle_updated_at();

create sequence support_ticket_seq start 1;

create or replace function public.generate_ticket_ref()
returns trigger language plpgsql as $$
begin
  new.ticket_ref := 'NL-' || extract(year from now())::text || '-' ||
                    lpad(nextval('support_ticket_seq')::text, 4, '0');
  return new;
end; $$;

create trigger support_tickets_ref
  before insert on public.support_tickets
  for each row execute function public.generate_ticket_ref();
