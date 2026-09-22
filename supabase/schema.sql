create extension if not exists pgcrypto;

create type public.subscription_status as enum (
  'trialing',
  'active',
  'past_due',
  'canceled',
  'inactive'
);

create type public.organization_member_role as enum (
  'client_admin',
  'client_operator',
  'viewer'
);

create type public.driver_status as enum ('active', 'inactive', 'removed');

create type public.testing_event_type as enum (
  '5-panel',
  '9-panel',
  '10-panel',
  'BAT',
  'Hair',
  'MVR'
);
create type public.onboarding_status as enum (
  'invited',
  'in_progress',
  'agreement_pending',
  'payment_pending',
  'active',
  'suspended',
  'cancelled'
);
create type public.testing_event_status as enum (
  'ordered',
  'collection_pending',
  'collected',
  'result_pending',
  'mro_hold',
  'cleared',
  'exception',
  'cancelled'
);

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) > 0),
  dot_number text not null unique check (dot_number ~ '^[0-9]{1,8}$'),
  legal_name text,
  dba_name text,
  onboarding_status public.onboarding_status not null default 'invited',
  primary_contact_email text,
  billing_contact_email text,
  subscription_status public.subscription_status not null default 'inactive',
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  created_at timestamptz not null default now()
);

create table public.organization_memberships (
  org_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.organization_member_role not null default 'client_admin',
  created_at timestamptz not null default now(),
  primary key (org_id, user_id)
);

create table public.drivers (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  cdl_number text not null,
  cdl_state text not null check (cdl_state ~ '^[A-Z]{2}$'),
  email text,
  status public.driver_status not null default 'active',
  med_card_expires_at date,
  created_at timestamptz not null default now(),
  unique (org_id, cdl_number, cdl_state)
);

create table public.testing_events (
  id uuid primary key default gen_random_uuid(),
  driver_id uuid not null references public.drivers(id) on delete restrict,
  org_id uuid not null references public.organizations(id) on delete cascade,
  test_type public.testing_event_type not null,
  status public.testing_event_status not null default 'ordered',
  result text,
  external_order_id text,
  barcode_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (org_id, external_order_id)
);

create table public.system_exceptions (
  id uuid primary key default gen_random_uuid(),
  testing_event_id uuid not null references public.testing_events(id) on delete cascade,
  org_id uuid not null references public.organizations(id) on delete cascade,
  title text not null,
  description text not null,
  resolved boolean not null default false,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  check ((resolved = false and resolved_at is null) or (resolved = true and resolved_at is not null))
);

create table public.random_pools (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  period_start date not null,
  period_end date not null,
  selection_hash text not null,
  created_at timestamptz not null default now(),
  unique (org_id, period_start, period_end),
  check (period_end >= period_start)
);

create table public.random_selections (
  id uuid primary key default gen_random_uuid(),
  random_pool_id uuid not null references public.random_pools(id) on delete cascade,
  org_id uuid not null references public.organizations(id) on delete cascade,
  driver_id uuid not null references public.drivers(id) on delete restrict,
  selection_hash text not null unique,
  selected_at timestamptz not null default now(),
  unique (random_pool_id, driver_id)
);

create table public.sjcc_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.agreement_versions (
  id uuid primary key default gen_random_uuid(),
  agreement_type text not null,
  version text not null,
  document_text text not null,
  document_hash text not null,
  published_at timestamptz not null default now(),
  retired_at timestamptz,
  unique (agreement_type, version),
  unique (agreement_type, document_hash)
);

create table public.agreement_acceptances (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  agreement_version_id uuid not null references public.agreement_versions(id) on delete restrict,
  user_id uuid not null references auth.users(id) on delete restrict,
  accepted_at timestamptz not null default now(),
  ip_address inet,
  user_agent text,
  stripe_checkout_session_id text,
  document_hash text not null check (length(trim(document_hash)) > 0)
);

create table public.audit_events (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references public.organizations(id) on delete set null,
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index drivers_org_id_idx on public.drivers(org_id);
create index testing_events_org_status_idx on public.testing_events(org_id, status);
create index testing_events_external_order_idx on public.testing_events(external_order_id);
create index system_exceptions_org_open_idx on public.system_exceptions(org_id, resolved) where resolved = false;
create index random_selections_org_id_idx on public.random_selections(org_id);
create index agreement_acceptances_org_id_idx on public.agreement_acceptances(org_id, accepted_at desc);
create index audit_events_org_created_idx on public.audit_events(org_id, created_at desc);

create or replace function public.is_platform_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.sjcc_admins admin
    where admin.user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_platform_admin() from public;
grant execute on function public.is_platform_admin() to authenticated;

create or replace function public.is_org_member(target_org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_memberships membership
    where membership.org_id = target_org_id
      and membership.user_id = (select auth.uid())
      and membership.role in ('client_admin', 'client_operator', 'viewer')
  );
$$;

revoke all on function public.is_org_member(uuid) from public;
grant execute on function public.is_org_member(uuid) to authenticated;

create or replace function public.is_org_owner(target_org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_platform_admin() or public.is_org_member(target_org_id);
$$;

revoke all on function public.is_org_owner(uuid) from public;
grant execute on function public.is_org_owner(uuid) to authenticated;

create or replace function public.create_organization(
  organization_name text,
  organization_dot_number text
)
returns public.organizations
language plpgsql
security definer
set search_path = public
as $$
declare
  created_organization public.organizations;
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication required';
  end if;

  insert into public.organizations (name, dot_number)
  values (organization_name, organization_dot_number)
  returning * into created_organization;

  insert into public.organization_memberships (org_id, user_id)
  values (created_organization.id, (select auth.uid()));

  return created_organization;
end;
$$;

revoke all on function public.create_organization(text, text) from public;
grant execute on function public.create_organization(text, text) to authenticated;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger testing_events_set_updated_at
before update on public.testing_events
for each row execute function public.set_updated_at();

alter table public.organizations enable row level security;
alter table public.organization_memberships enable row level security;
alter table public.drivers enable row level security;
alter table public.testing_events enable row level security;
alter table public.system_exceptions enable row level security;
alter table public.random_pools enable row level security;
alter table public.random_selections enable row level security;
alter table public.sjcc_admins enable row level security;
alter table public.agreement_versions enable row level security;
alter table public.agreement_acceptances enable row level security;
alter table public.audit_events enable row level security;

create policy organizations_owner_select on public.organizations
for select to authenticated using (public.is_org_owner(id));
create policy organizations_owner_insert on public.organizations
for insert to authenticated with check (public.is_org_owner(id));
create policy organizations_owner_update on public.organizations
for update to authenticated using (public.is_org_owner(id)) with check (public.is_org_owner(id));
create policy organizations_owner_delete on public.organizations
for delete to authenticated using (public.is_org_owner(id));

create policy memberships_owner_select on public.organization_memberships
for select to authenticated using (public.is_org_owner(org_id));
create policy memberships_owner_insert on public.organization_memberships
for insert to authenticated with check (public.is_org_owner(org_id));
create policy memberships_owner_update on public.organization_memberships
for update to authenticated using (public.is_org_owner(org_id)) with check (public.is_org_owner(org_id));
create policy memberships_owner_delete on public.organization_memberships
for delete to authenticated using (public.is_org_owner(org_id));

create policy drivers_owner_select on public.drivers
for select to authenticated using (public.is_org_owner(org_id));
create policy drivers_owner_insert on public.drivers
for insert to authenticated with check (public.is_org_owner(org_id));
create policy drivers_owner_update on public.drivers
for update to authenticated using (public.is_org_owner(org_id)) with check (public.is_org_owner(org_id));
create policy drivers_owner_delete on public.drivers
for delete to authenticated using (public.is_org_owner(org_id));

create policy testing_events_owner_select on public.testing_events
for select to authenticated using (public.is_org_owner(org_id));
create policy testing_events_owner_insert on public.testing_events
for insert to authenticated with check (public.is_org_owner(org_id));
create policy testing_events_owner_update on public.testing_events
for update to authenticated using (public.is_org_owner(org_id)) with check (public.is_org_owner(org_id));
create policy testing_events_owner_delete on public.testing_events
for delete to authenticated using (public.is_org_owner(org_id));

create policy exceptions_owner_select on public.system_exceptions
for select to authenticated using (public.is_org_owner(org_id));
create policy exceptions_owner_insert on public.system_exceptions
for insert to authenticated with check (public.is_org_owner(org_id));
create policy exceptions_owner_update on public.system_exceptions
for update to authenticated using (public.is_org_owner(org_id)) with check (public.is_org_owner(org_id));
create policy exceptions_owner_delete on public.system_exceptions
for delete to authenticated using (public.is_org_owner(org_id));

create policy random_pools_owner_select on public.random_pools
for select to authenticated using (public.is_org_owner(org_id));
create policy random_pools_owner_insert on public.random_pools
for insert to authenticated with check (public.is_org_owner(org_id));
create policy random_pools_owner_update on public.random_pools
for update to authenticated using (public.is_org_owner(org_id)) with check (public.is_org_owner(org_id));
create policy random_pools_owner_delete on public.random_pools
for delete to authenticated using (public.is_org_owner(org_id));

create policy random_selections_owner_select on public.random_selections
for select to authenticated using (public.is_org_owner(org_id));
create policy random_selections_owner_insert on public.random_selections
for insert to authenticated with check (public.is_org_owner(org_id));
create policy random_selections_owner_update on public.random_selections
for update to authenticated using (public.is_org_owner(org_id)) with check (public.is_org_owner(org_id));
create policy random_selections_owner_delete on public.random_selections
for delete to authenticated using (public.is_org_owner(org_id));

create policy sjcc_admins_self_select on public.sjcc_admins
for select to authenticated using (user_id = (select auth.uid()) or public.is_platform_admin());

create policy agreement_versions_authenticated_select on public.agreement_versions
for select to authenticated using (retired_at is null or public.is_platform_admin());

create policy agreement_versions_admin_insert on public.agreement_versions
for insert to authenticated with check (public.is_platform_admin());

create policy agreement_versions_admin_update on public.agreement_versions
for update to authenticated using (public.is_platform_admin()) with check (public.is_platform_admin());

create policy agreement_acceptances_member_select on public.agreement_acceptances
for select to authenticated using (public.is_org_owner(org_id));

create policy agreement_acceptances_member_insert on public.agreement_acceptances
for insert to authenticated with check (
  public.is_org_owner(org_id)
  and user_id = (select auth.uid())
);

create policy audit_events_owner_select on public.audit_events
for select to authenticated using (org_id is null and public.is_platform_admin() or public.is_org_owner(org_id));