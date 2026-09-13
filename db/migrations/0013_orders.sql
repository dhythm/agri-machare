-- Purchase orders between a buyer and a listing's owner.

create table orders (
  seq bigserial not null,
  id text primary key,
  listing_id text not null,
  buyer_user_id text not null,
  seller_user_id text not null,
  price integer not null,
  status text not null,
  message text,
  source_rental_id text,
  created_at timestamptz not null,
  updated_at timestamptz not null
);

create index orders_seq_idx on orders (seq desc);
create index orders_listing_id_idx on orders (listing_id);
create index orders_buyer_user_id_idx on orders (buyer_user_id);
create index orders_seller_user_id_idx on orders (seller_user_id);
