alter table compliance_agreement_acceptances
  add column if not exists signer_title text,
  add column if not exists signature_name text,
  add column if not exists esign_consent boolean not null default false,
  add column if not exists compliance_acknowledged boolean not null default false,
  add column if not exists authority_confirmed boolean not null default false;
