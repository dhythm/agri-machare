-- Rent-to-own terms on listings and rental agreements.
-- Dates are stored as text (YYYY-MM-DD) to match the API and the memory store.

alter table listings
  add column rent_to_own_credit_rate integer,
  add column rent_to_own_credit_cap integer;

create table rentals (
  seq bigserial not null,
  id text primary key,
  listing_id text not null,
  renter_user_id text not null,
  start_date text not null,
  end_date text not null,
  days integer not null,
  rent_per_day integer not null,
  rent_total integer not null,
  sale_price integer,
  credit_rate integer,
  credit_cap integer,
  status text not null,
  purchase_price integer,
  created_at timestamptz not null,
  updated_at timestamptz not null
);

create index rentals_seq_idx on rentals (seq desc);
create index rentals_listing_id_idx on rentals (listing_id);
create index rentals_renter_user_id_idx on rentals (renter_user_id);
