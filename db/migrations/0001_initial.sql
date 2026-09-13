-- Initial schema. Written for PostgreSQL; applied to PGlite in development.
-- `seq` orders rows newest-first without depending on timestamps, matching
-- the in-memory store.

create table listings (
  seq bigserial not null,
  id text primary key,
  name text not null,
  category text not null,
  maker text not null,
  year integer not null,
  hours integer not null,
  condition text not null,
  prefecture text not null,
  city text not null,
  image text not null,
  summary text not null,
  deals text[] not null,
  sale_price integer,
  rent_per_day integer,
  rent_to_own boolean,
  seller_name text not null,
  seller_kind text not null,
  seller_rating double precision not null,
  seller_reviews integer not null,
  tags text[] not null,
  created_at timestamptz,
  updated_at timestamptz
);

create index listings_seq_idx on listings (seq desc);
create index listings_category_idx on listings (category);

create table transport_jobs (
  seq bigserial not null,
  id text primary key,
  item text not null,
  from_location text not null,
  to_location text not null,
  distance_km integer not null,
  weight text not null,
  desired_date text not null,
  reward integer not null,
  status text not null,
  created_at timestamptz,
  updated_at timestamptz
);

create index transport_jobs_seq_idx on transport_jobs (seq desc);

create table submissions (
  seq bigserial not null,
  id text primary key,
  kind text not null,
  target_id text,
  received_at timestamptz not null,
  payload jsonb not null
);

create index submissions_seq_idx on submissions (seq desc);
create index submissions_kind_target_idx on submissions (kind, target_id);
