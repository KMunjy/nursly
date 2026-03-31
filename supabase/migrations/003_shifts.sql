-- =============================================
-- NURSLY — Migration 003: Shifts
-- =============================================

create type specialty_type as enum (
  'critical_care','accident_emergency','general_medical','general_surgical',
  'theatre','cardiology','oncology','paediatrics','neonatal','maternity',
  'mental_health','community','elderly_care','renal','orthopaedics',
  'neurology','respiratory','endoscopy','radiology','rehabilitation'
);

create type band_level as enum (
  'band_5','band_6','band_7','band_8a','enrolled_nurse','healthcare_assistant'
);

create type shift_status as enum (
  'draft','open','filled','in_progress','completed','cancelled','disputed'
);

create type application_status as enum (
  'pending','shortlisted','selected','rejected','withdrawn'
);

create table public.org_locations (
  id         uuid primary key default uuid_generate_v4(),
  org_id     uuid not null references public.organisations(id) on delete cascade,
  name       text not null,
  address    text not null,
  city       text not null,
  postcode   text not null,
  created_at timestamptz not null default now()
);

alter table public.org_locations enable row level security;

create policy "Org members read own locations"
  on public.org_locations for select using (
    exists (select 1 from public.org_members
      where org_members.org_id = org_locations.org_id
      and org_members.user_id = auth.uid())
  );

create policy "Org admins manage locations"
  on public.org_locations for all using (
    exists (select 1 from public.org_members
      where org_members.org_id = org_locations.org_id
      and org_members.user_id = auth.uid()
      and org_members.org_role = 'admin')
  );

create policy "Service role full access on org_locations"
  on public.org_locations for all using (auth.role() = 'service_role');

create table public.shifts (
  id                   uuid primary key default uuid_generate_v4(),
  org_id               uuid not null references public.organisations(id) on delete restrict,
  posted_by            uuid not null references auth.users(id) on delete restrict,
  location_id          uuid references public.org_locations(id) on delete restrict,
  title                text not null,
  specialty            specialty_type not null,
  band                 band_level not null,
  min_experience_years int not null default 0,
  start_time           timestamptz not null,
  end_time             timestamptz not null,
  break_minutes        int not null default 30,
  rate_per_hour        numeric(8,2) not null check (rate_per_hour >= 12.00),
  rate_is_negotiable   boolean not null default false,
  required_credentials credential_type[] not null default '{}',
  notes                text,
  status               shift_status not null default 'draft',
  filled_by            uuid references auth.users(id) on delete set null,
  filled_at            timestamptz,
  cancelled_at         timestamptz,
  cancellation_reason  text,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  constraint shift_end_after_start check (end_time > start_time),
  constraint shift_max_13hrs check (extract(epoch from (end_time - start_time))/3600 <= 13),
  constraint shift_min_4hrs check (extract(epoch from (end_time - start_time))/3600 >= 4)
);

alter table public.shifts enable row level security;

create policy "Nurses browse open shifts"
  on public.shifts for select using (
    status = 'open' and
    exists (select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'nurse' and profiles.status = 'active')
  );

create policy "Employers see own shifts"
  on public.shifts for select using (
    exists (select 1 from public.org_members
      where org_members.org_id = shifts.org_id and org_members.user_id = auth.uid())
  );

create policy "Employers create shifts"
  on public.shifts for insert with check (
    exists (select 1 from public.org_members
      where org_members.org_id = shifts.org_id and org_members.user_id = auth.uid())
  );

create policy "Employers update own shifts"
  on public.shifts for update using (
    exists (select 1 from public.org_members
      where org_members.org_id = shifts.org_id and org_members.user_id = auth.uid())
  ) with check (status not in ('completed','disputed','in_progress'));

create policy "Service role full access on shifts"
  on public.shifts for all using (auth.role() = 'service_role');

create index shifts_org_id_idx on public.shifts(org_id);
create index shifts_status_idx on public.shifts(status);
create index shifts_start_time_idx on public.shifts(start_time);

create trigger shifts_updated_at
  before update on public.shifts
  for each row execute function public.handle_updated_at();

create table public.shift_applications (
  id         uuid primary key default uuid_generate_v4(),
  shift_id   uuid not null references public.shifts(id) on delete cascade,
  nurse_id   uuid not null references auth.users(id) on delete cascade,
  status     application_status not null default 'pending',
  message    text,
  applied_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(shift_id, nurse_id)
);

alter table public.shift_applications enable row level security;

create policy "Nurses read own applications"
  on public.shift_applications for select using (auth.uid() = nurse_id);

create policy "Nurses apply for shifts"
  on public.shift_applications for insert with check (
    auth.uid() = nurse_id and
    exists (select 1 from public.shifts where shifts.id = shift_applications.shift_id and shifts.status = 'open') and
    exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.status = 'active')
  );

create policy "Nurses withdraw own applications"
  on public.shift_applications for update using (auth.uid() = nurse_id)
  with check (status = 'withdrawn');

create policy "Employers see shift applicants"
  on public.shift_applications for select using (
    exists (select 1 from public.shifts
      join public.org_members on org_members.org_id = shifts.org_id
      where shifts.id = shift_applications.shift_id and org_members.user_id = auth.uid())
  );

create policy "Service role full access on applications"
  on public.shift_applications for all using (auth.role() = 'service_role');

create index applications_shift_id_idx on public.shift_applications(shift_id);
create index applications_nurse_id_idx on public.shift_applications(nurse_id);

create trigger applications_updated_at
  before update on public.shift_applications
  for each row execute function public.handle_updated_at();
