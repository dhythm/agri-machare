-- Seller reviews written after a finished rental or an agreed inquiry.

create table reviews (
  seq bigserial not null,
  id text primary key,
  listing_id text not null,
  seller_user_id text not null,
  reviewer_user_id text not null,
  source_kind text not null,
  source_id text not null,
  rating integer not null,
  comment text,
  created_at timestamptz not null
);

create index reviews_seq_idx on reviews (seq desc);
create index reviews_seller_user_id_idx on reviews (seller_user_id);
create index reviews_source_idx on reviews (source_kind, source_id);
