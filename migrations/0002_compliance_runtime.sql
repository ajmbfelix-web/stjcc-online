create table if not exists compliance_drivers (
  id text primary key,
  account_id text not null,
  name text not null,
  cdl text not null,
  test_type text not null,
  status text not null,
  barcode text not null,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists compliance_drivers_account_status_idx
  on compliance_drivers (account_id, status);

create table if not exists compliance_events (
  id text primary key,
  account_id text not null,
  source text not null,
  path text not null,
  payload jsonb not null,
  received_at timestamptz not null default now()
);

create index if not exists compliance_events_account_received_idx
  on compliance_events (account_id, received_at desc);