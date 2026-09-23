create table if not exists service_orders (
  id text primary key,
  onboarding_id text references client_onboarding(id) on delete set null,
  channel text not null check (channel in ('client', 'walk_in', 'staffing')),
  company_name text not null,
  result_email text not null,
  candidate_name text not null,
  candidate_email text,
  compliance_order_id text,
  sku text not null,
  reason text not null,
  amount_cents integer not null,
  estimated_cost_cents integer not null,
  status text not null default 'unpaid',
  clearinghouse text not null default 'not_required',
  stripe_session_id text,
  result_summary text,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists service_orders_status_idx on service_orders(status, created_at desc);
create unique index if not exists service_orders_compliance_idx on service_orders(compliance_order_id) where compliance_order_id is not null;
