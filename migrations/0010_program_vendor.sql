alter table client_onboarding add column if not exists program text not null default 'fleet';

alter table service_orders add column if not exists vendor_name text not null default 'us_gateway';
alter table service_orders add column if not exists vendor_order_id text;
