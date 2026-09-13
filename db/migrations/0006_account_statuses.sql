-- Suspension state per account. Credentials still come from the environment;
-- a missing row means the account is active.

create table account_statuses (
  seq bigserial not null,
  id text primary key,
  status text not null,
  note text,
  updated_at timestamptz not null
);

create index account_statuses_seq_idx on account_statuses (seq desc);
