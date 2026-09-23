alter table client_onboarding add column if not exists pool_mode text not null default 'standalone';

alter table service_orders add column if not exists roster_id text;
alter table service_orders add column if not exists clearinghouse_actor_user_id text;
alter table service_orders add column if not exists clearinghouse_decided_at timestamptz;

create index if not exists service_orders_roster_idx on service_orders (roster_id);

alter table compliance_exceptions add column if not exists resolution_note text;
alter table compliance_exceptions add column if not exists resolved_by_user_id text;

create table if not exists account_notes (
  id text primary key,
  onboarding_id text not null references client_onboarding(id) on delete cascade,
  roster_id text,
  actor_user_id text,
  body text not null,
  created_at timestamptz not null default now(),
  check (length(trim(body)) > 0)
);

create index if not exists account_notes_onboarding_idx on account_notes (onboarding_id, created_at desc);
create index if not exists account_notes_roster_idx on account_notes (roster_id);
