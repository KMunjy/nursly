-- =============================================
-- NURSLY — Migration 001: Auth and Profiles
-- =============================================

create extension if not exists "uuid-ossp";

create type user_role as enum (
  'nurse', 'employer_admin', 'employer_member',
  'platform_admin', 'platform_ops'
);

create type account_status as enum (
  'pending_verification', 'pending_review',
  'active', 'suspended', 'deactivated'
);

create type org_type as enum (
  'nhs_trust', 'private_hospital', 'clinic', 'care_home', 'other'
);

create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  role        user_role not null,
  status      account_status not null default 'pending_verification',
  full_name   text,
  legal_hold  boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users read own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "Users update own profile"
  on public.profiles for update using (auth.uid() = id)
  with check (
    role = (select role from public.profiles where id = auth.uid()) and
    status = (select status from public.profiles where id = auth.uid())
  );

create policy "Service role full access on profiles"
  on public.profiles for all using (auth.role() = 'service_role');

create table public.organisations (
  id                  uuid primary key default uuid_generate_v4(),
  name                text not null,
  type                org_type not null default 'other',
  registration_number text,
  address             jsonb,
  billing_email       text,
  status              account_status not null default 'pending_review',
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

alter table public.organisations enable row level security;

create policy "Org members read own org"
  on public.organisations for select using (
    exists (
      select 1 from public.org_members
      where org_members.org_id = organisations.id
      and org_members.user_id = auth.uid()
    )
  );

create policy "Service role full access on organisations"
  on public.organisations for all using (auth.role() = 'service_role');

create table public.org_members (
  id         uuid primary key default uuid_generate_v4(),
  org_id     uuid not null references public.organisations(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  org_role   text not null default 'admin' check (org_role in ('admin', 'member')),
  created_at timestamptz not null default now(),
  unique(org_id, user_id)
);

alter table public.org_members enable row level security;

create policy "Members read own memberships"
  on public.org_members for select using (user_id = auth.uid());

create policy "Service role full access on org_members"
  on public.org_members for all using (auth.role() = 'service_role');

create table public.nurse_profiles (
  id                  uuid primary key references auth.users(id) on delete cascade,
  nmc_pin             text,
  nmc_pin_enc         text,
  phone_number        text,
  phone_number_enc    text,
  location_city       text,
  location_postcode   text,
  postcode_enc        text,
  specialties         text[] default '{}',
  years_experience    int,
  preferred_radius_km int default 25,
  bio                 text,
  avatar_url          text,
  onboarding_complete boolean not null default false,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

alter table public.nurse_profiles enable row level security;

create policy "Nurses read own nurse profile"
  on public.nurse_profiles for select using (auth.uid() = id);

create policy "Nurses update own nurse profile"
  on public.nurse_profiles for update using (auth.uid() = id);

create policy "Service role full access on nurse_profiles"
  on public.nurse_profiles for all using (auth.role() = 'service_role');

create table public.audit_events (
  id          uuid primary key default uuid_generate_v4(),
  actor_id    uuid references auth.users(id) on delete set null,
  actor_role  text,
  action      text not null,
  entity_type text,
  entity_id   uuid,
  metadata    jsonb default '{}',
  created_at  timestamptz not null default now()
);

alter table public.audit_events enable row level security;

create policy "Service role full access on audit_events"
  on public.audit_events for all using (auth.role() = 'service_role');

create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

create trigger organisations_updated_at
  before update on public.organisations
  for each row execute function public.handle_updated_at();

create trigger nurse_profiles_updated_at
  before update on public.nurse_profiles
  for each row execute function public.handle_updated_at();

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
declare v_role user_role;
begin
  v_role := (new.raw_user_meta_data->>'role')::user_role;
  if v_role not in ('nurse', 'employer_admin') then
    raise exception 'Invalid role for self-registration: %', v_role;
  end if;
  insert into public.profiles (id, role, full_name, status)
  values (new.id, v_role, new.raw_user_meta_data->>'full_name', 'pending_verification');
  if v_role = 'nurse' then
    insert into public.nurse_profiles (id) values (new.id);
  end if;
  return new;
end; $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
