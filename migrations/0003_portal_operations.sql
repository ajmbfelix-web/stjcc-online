create table if not exists sjcc_admin_users (
  user_id text primary key,
  email text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists client_onboarding (
  id text primary key,
  organization_name text not null,
  dot_number text not null,
  contact_name text not null,
  contact_email text not null,
  driver_count integer not null default 0 check (driver_count >= 0),
  services jsonb not null default '[]'::jsonb,
  status text not null default 'in_progress',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists compliance_agreement_versions (
  id text primary key,
  version text not null unique,
  title text not null,
  body text not null,
  body_hash text not null,
  published_at timestamptz not null default now(),
  active boolean not null default true
);

create table if not exists compliance_agreement_acceptances (
  id text primary key,
  onboarding_id text not null references client_onboarding(id) on delete cascade,
  agreement_version_id text not null references compliance_agreement_versions(id),
  signer_name text not null,
  signer_email text not null,
  terms_accepted boolean not null,
  billing_authorized boolean not null,
  data_processing_accepted boolean not null,
  accepted_at timestamptz not null default now(),
  ip_address text,
  user_agent text,
  unique (onboarding_id, agreement_version_id),
  check (terms_accepted and billing_authorized and data_processing_accepted)
);

create table if not exists compliance_audit_events (
  id text primary key,
  onboarding_id text references client_onboarding(id) on delete set null,
  actor_user_id text,
  action text not null,
  entity_type text not null,
  entity_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists stripe_billing_events (
  stripe_event_id text primary key,
  event_type text not null,
  processed_at timestamptz not null default now(),
  payload jsonb not null
);

insert into compliance_agreement_versions (id, version, title, body, body_hash)
values (
  'sjcc-standard-2026-09',
  '2026-09',
  'SJCC Compliance Services Agreement',
  'This agreement version must be replaced with counsel-approved terms before production onboarding.',
  'PLACEHOLDER_REQUIRES_COUNSEL_REVIEW'
)
on conflict (version) do nothing;

create index if not exists client_onboarding_status_idx on client_onboarding(status, created_at desc);
create index if not exists compliance_audit_events_created_idx on compliance_audit_events(created_at desc);