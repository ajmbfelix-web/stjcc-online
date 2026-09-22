create table if not exists client_user_access (
  user_id text primary key,
  onboarding_id text not null references client_onboarding(id) on delete cascade,
  role text not null default 'client_admin',
  created_at timestamptz not null default now()
);

create table if not exists compliance_exceptions (
  id text primary key,
  account_id text not null,
  title text not null,
  description text not null,
  severity text not null default 'normal',
  resolved boolean not null default false,
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists client_user_access_onboarding_idx on client_user_access(onboarding_id);
create index if not exists compliance_exceptions_account_open_idx on compliance_exceptions(account_id, resolved, created_at desc);