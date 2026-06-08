-- ============================================================
-- DentalRelay Database Schema
-- ============================================================

-- Practices (dental offices)
create table if not exists practices (
  id            uuid primary key default gen_random_uuid(),
  clerk_org_id  text unique,
  name          text not null,
  specialty     text,              -- general, orthodontics, oral_surgery, periodontics, etc.
  npi           text unique,
  address       text,
  city          text,
  state         text,
  zip           text,
  phone         text,
  email         text,
  website       text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Providers (dentists / specialists)
create table if not exists providers (
  id             uuid primary key default gen_random_uuid(),
  clerk_user_id  text unique not null,
  practice_id    uuid references practices(id) on delete set null,
  first_name     text not null,
  last_name      text not null,
  email          text not null,
  phone          text,
  specialty      text,
  npi            text,
  license_number text,
  role           text not null default 'provider',  -- provider, admin
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- Patients
create table if not exists patients (
  id                  uuid primary key default gen_random_uuid(),
  practice_id         uuid references practices(id) on delete restrict,
  first_name          text not null,
  last_name           text not null,
  dob                 date not null,
  email               text,
  phone               text,
  address             text,
  city                text,
  state               text,
  zip                 text,
  insurance_provider  text,
  insurance_member_id text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- Referrals
create table if not exists referrals (
  id                    uuid primary key default gen_random_uuid(),
  patient_id            uuid not null references patients(id) on delete restrict,
  referring_practice_id uuid not null references practices(id),
  referring_provider_id uuid not null references providers(id),
  receiving_practice_id uuid not null references practices(id),
  receiving_provider_id uuid references providers(id),
  treatment             text not null,
  status                text not null default 'new',     -- new, in_progress, completed, archived
  priority              text not null default 'normal',  -- low, normal, high, urgent
  notes                 text,
  appointment_date      timestamptz,
  completed_at          timestamptz,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  constraint referrals_status_check check (status in ('new', 'in_progress', 'completed', 'archived')),
  constraint referrals_priority_check check (priority in ('low', 'normal', 'high', 'urgent'))
);

-- Referral messages (threaded secure messaging per referral)
create table if not exists referral_messages (
  id           uuid primary key default gen_random_uuid(),
  referral_id  uuid not null references referrals(id) on delete cascade,
  sender_id    uuid not null references providers(id),
  content      text not null,
  is_read      boolean not null default false,
  created_at   timestamptz not null default now()
);

-- Referral documents (letters, signed forms, outcome reports)
create table if not exists referral_documents (
  id            uuid primary key default gen_random_uuid(),
  referral_id   uuid not null references referrals(id) on delete cascade,
  uploaded_by   uuid not null references providers(id),
  name          text not null,
  type          text not null,          -- referral_letter, treatment_outcome, signed_form, x_ray, other
  storage_path  text not null,
  file_size     integer,
  mime_type     text,
  signed_at     timestamptz,
  signed_by     uuid references providers(id),
  created_at    timestamptz not null default now()
);

-- Outcome letters (specialist's signed report back to the referring doctor after treatment)
create table if not exists outcome_letters (
  id                   uuid primary key default gen_random_uuid(),
  referral_id          uuid not null references referrals(id) on delete cascade,
  provider_id          uuid not null references providers(id),
  treatment_performed  text not null,
  outcome              text not null,          -- excellent, good, fair, guarded
  patient_response     text,
  follow_up_required   boolean not null default false,
  follow_up_notes      text,
  recommendations      text,
  signed_by            uuid not null references providers(id),
  signature_name       text not null,
  signed_at            timestamptz not null default now(),
  created_at           timestamptz not null default now(),
  constraint outcome_letters_outcome_check check (outcome in ('excellent', 'good', 'fair', 'guarded'))
);

-- ============================================================
-- Indexes
-- ============================================================
create index if not exists idx_providers_clerk_user_id  on providers(clerk_user_id);
create index if not exists idx_providers_practice_id    on providers(practice_id);
create index if not exists idx_patients_practice_id     on patients(practice_id);
create index if not exists idx_referrals_status         on referrals(status);
create index if not exists idx_referrals_patient_id     on referrals(patient_id);
create index if not exists idx_referrals_referring      on referrals(referring_practice_id);
create index if not exists idx_referrals_receiving      on referrals(receiving_practice_id);
create index if not exists idx_referral_messages_ref    on referral_messages(referral_id);
create index if not exists idx_referral_docs_ref        on referral_documents(referral_id);
create index if not exists idx_outcome_letters_referral on outcome_letters(referral_id);

-- ============================================================
-- Row-Level Security
-- ============================================================
alter table practices          enable row level security;
alter table providers          enable row level security;
alter table patients           enable row level security;
alter table referrals          enable row level security;
alter table referral_messages  enable row level security;
alter table referral_documents enable row level security;
alter table outcome_letters    enable row level security;

-- Helper: resolve clerk_user_id → practice_id
create or replace function current_practice_id()
returns uuid
language sql stable
as $$
  select practice_id
  from providers
  where clerk_user_id = (select auth.jwt()->>'sub')
  limit 1;
$$;

-- practices: visible to members of that practice
create policy "practices_select" on practices
  for select using (id = current_practice_id());

-- providers: visible within the same practice
create policy "providers_select" on providers
  for select using (practice_id = current_practice_id());

-- patients: owned by the practice that registered them
create policy "patients_select" on patients
  for select using (practice_id = current_practice_id());

create policy "patients_insert" on patients
  for insert with check (practice_id = current_practice_id());

create policy "patients_update" on patients
  for update using (practice_id = current_practice_id());

-- referrals: visible to referring or receiving practice
create policy "referrals_select" on referrals
  for select using (
    referring_practice_id = current_practice_id()
    or receiving_practice_id = current_practice_id()
  );

create policy "referrals_insert" on referrals
  for insert with check (referring_practice_id = current_practice_id());

create policy "referrals_update" on referrals
  for update using (
    referring_practice_id = current_practice_id()
    or receiving_practice_id = current_practice_id()
  );

-- referral_messages: visible to practices on the referral
create policy "referral_messages_select" on referral_messages
  for select using (
    exists (
      select 1 from referrals r
      where r.id = referral_id
        and (r.referring_practice_id = current_practice_id()
             or r.receiving_practice_id = current_practice_id())
    )
  );

create policy "referral_messages_insert" on referral_messages
  for insert with check (
    sender_id in (select id from providers where practice_id = current_practice_id())
  );

-- referral_documents: same visibility as messages
create policy "referral_documents_select" on referral_documents
  for select using (
    exists (
      select 1 from referrals r
      where r.id = referral_id
        and (r.referring_practice_id = current_practice_id()
             or r.receiving_practice_id = current_practice_id())
    )
  );

create policy "referral_documents_insert" on referral_documents
  for insert with check (
    uploaded_by in (select id from providers where practice_id = current_practice_id())
  );

-- outcome_letters: same visibility as messages/documents
create policy "outcome_letters_select" on outcome_letters
  for select using (
    exists (
      select 1 from referrals r
      where r.id = referral_id
        and (r.referring_practice_id = current_practice_id()
             or r.receiving_practice_id = current_practice_id())
    )
  );

create policy "outcome_letters_insert" on outcome_letters
  for insert with check (
    provider_id in (select id from providers where practice_id = current_practice_id())
  );

-- ============================================================
-- updated_at trigger
-- ============================================================
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger practices_updated_at          before update on practices          for each row execute function set_updated_at();
create trigger providers_updated_at          before update on providers          for each row execute function set_updated_at();
create trigger patients_updated_at           before update on patients           for each row execute function set_updated_at();
create trigger referrals_updated_at          before update on referrals          for each row execute function set_updated_at();
