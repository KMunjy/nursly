-- =============================================
-- NURSLY — Migration 002: Nurse Onboarding
-- =============================================

create type credential_type as enum (
  'nmc_registration', 'dbs_certificate', 'right_to_work',
  'mandatory_training', 'professional_indemnity', 'hepatitis_b', 'other'
);

create type credential_status as enum ('pending', 'verified', 'rejected', 'expired');
create type day_of_week as enum ('monday','tuesday','wednesday','thursday','friday','saturday','sunday');
create type shift_type_pref as enum ('days','nights','long_days');

create table public.nurse_availability (
  id          uuid primary key default uuid_generate_v4(),
  nurse_id    uuid not null references auth.users(id) on delete cascade,
  day_of_week day_of_week not null,
  shift_types shift_type_pref[] not null default '{}',
  updated_at  timestamptz not null default now(),
  unique(nurse_id, day_of_week)
);

alter table public.nurse_availability enable row level security;

create policy "Nurses manage own availability"
  on public.nurse_availability for all using (auth.uid() = nurse_id);

create policy "Service role full access on availability"
  on public.nurse_availability for all using (auth.role() = 'service_role');

create trigger nurse_availability_updated_at
  before update on public.nurse_availability
  for each row execute function public.handle_updated_at();

create table public.credentials (
  id                  uuid primary key default uuid_generate_v4(),
  nurse_id            uuid not null references auth.users(id) on delete cascade,
  type                credential_type not null,
  document_key        text,
  document_uploaded_at timestamptz,
  expiry_date         date,
  reference_number    text,
  reference_number_enc text,
  status              credential_status not null default 'pending',
  verified_by         uuid references auth.users(id) on delete set null,
  verified_at         timestamptz,
  rejection_reason    text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  unique(nurse_id, type)
);

alter table public.credentials enable row level security;

create policy "Nurses read own credentials"
  on public.credentials for select using (auth.uid() = nurse_id);

create policy "Nurses insert own credentials"
  on public.credentials for insert with check (auth.uid() = nurse_id);

create policy "Nurses update own credentials"
  on public.credentials for update using (auth.uid() = nurse_id)
  with check (
    status = (select status from public.credentials where id = credentials.id) or
    status = 'pending'
  );

create policy "Service role full access on credentials"
  on public.credentials for all using (auth.role() = 'service_role');

create trigger credentials_updated_at
  before update on public.credentials
  for each row execute function public.handle_updated_at();

create index credentials_nurse_id_idx on public.credentials(nurse_id);
create index credentials_status_idx on public.credentials(status);
create index credentials_expiry_idx on public.credentials(expiry_date) where expiry_date is not null;
