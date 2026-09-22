alter table client_onboarding add column if not exists billing_status text not null default 'not_started';
alter table client_onboarding add column if not exists stripe_customer_id text;
alter table client_onboarding add column if not exists activated_at timestamptz;
alter table client_onboarding add column if not exists claim_token_hash text;
alter table client_onboarding add column if not exists submitted_by_user_id text;

alter table compliance_drivers add column if not exists roster_id text;
alter table compliance_drivers add column if not exists order_reason text not null default 'screening';

alter table compliance_exceptions add column if not exists source text not null default 'system';
alter table compliance_exceptions add column if not exists audience text not null default 'owner';
alter table compliance_exceptions add column if not exists dedupe_key text;
alter table compliance_exceptions add column if not exists roster_id text;

create unique index if not exists compliance_exceptions_dedupe_key_idx
  on compliance_exceptions (dedupe_key);

create table if not exists driver_roster (
  id text primary key,
  account_id text not null,
  name text not null,
  cdl text not null,
  medical_card_expires_on date,
  mvr_reviewed_on date,
  clearinghouse_queried_on date,
  hired_on date,
  in_random_pool boolean not null default true,
  employment_status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (account_id, cdl)
);

create index if not exists driver_roster_account_idx
  on driver_roster (account_id, employment_status);

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'random_selections' and column_name = 'random_pool_id'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'random_selections' and column_name = 'test_kind'
  ) then
    alter table random_selections rename to random_selections_legacy;
  end if;
end $$;

create table if not exists random_selections (
  id text primary key,
  account_id text not null,
  roster_id text not null,
  period text not null,
  test_kind text not null check (test_kind in ('drug', 'alcohol')),
  order_id text,
  selected_at timestamptz not null default now(),
  unique (account_id, period, roster_id, test_kind)
);

create index if not exists random_selections_period_idx
  on random_selections (test_kind, period);

create table if not exists notification_outbox (
  id text primary key,
  account_id text,
  recipient text not null,
  template text not null,
  subject text not null,
  body text not null,
  status text not null default 'pending',
  dedupe_key text not null unique,
  created_at timestamptz not null default now(),
  sent_at timestamptz,
  error text
);

create index if not exists notification_outbox_status_idx
  on notification_outbox (status, created_at);

create table if not exists automation_runs (
  id text primary key,
  reason text not null,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  summary jsonb not null default '{}'::jsonb
);

create index if not exists automation_runs_started_idx
  on automation_runs (started_at desc);

create index if not exists client_onboarding_contact_email_idx
  on client_onboarding (contact_email);

update compliance_agreement_versions
set
  title = 'SJCC Operational Authorization',
  body = $auth$SJCC Operational Authorization 2026-09

The organization authorizes St. Joseph Compliance Company to maintain driver qualification and testing records for the services selected at onboarding, to schedule required tests including random selections when that service is included, to send operational notices to the contact email on file, and to bill the subscription started through Stripe.

This is the operational record of that authorization. A later counsel-approved agreement version supersedes it when published.$auth$,
  body_hash = 'd13641b938c96ab8ad38c6398d81cbffb2cdc6f88e37f440225bf46eaef2f0e7'
where id = 'sjcc-standard-2026-09';
