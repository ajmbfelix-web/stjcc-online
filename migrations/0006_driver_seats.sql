alter table client_onboarding add column if not exists stripe_subscription_id text;
alter table client_onboarding add column if not exists stripe_subscription_item_id text;
alter table client_onboarding add column if not exists billed_driver_count integer not null default 0;

alter table driver_roster add column if not exists needs_testing boolean not null default true;

create index if not exists client_onboarding_stripe_customer_idx
  on client_onboarding (stripe_customer_id);

create index if not exists client_onboarding_stripe_subscription_idx
  on client_onboarding (stripe_subscription_id);
