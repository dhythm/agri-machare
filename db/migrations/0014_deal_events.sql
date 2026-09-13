-- History of status changes for orders, rentals, and transport jobs.

create table deal_events (
  seq bigserial not null,
  id text primary key,
  deal_kind text not null,
  deal_id text not null,
  actor_user_id text,
  status text not null,
  note text,
  created_at timestamptz not null
);

create index deal_events_seq_idx on deal_events (seq desc);
create index deal_events_deal_idx on deal_events (deal_kind, deal_id);
