-- Carrier profiles, one per signed-in user, replacing anonymous registrations.

create table carrier_profiles (
  seq bigserial not null,
  id text primary key,
  name text not null,
  kind text not null,
  prefecture text not null,
  vehicles text[] not null,
  service_areas text[] not null,
  note text,
  created_at timestamptz not null,
  updated_at timestamptz not null
);

create index carrier_profiles_seq_idx on carrier_profiles (seq desc);
