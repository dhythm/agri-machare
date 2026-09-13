-- In-app notifications, one row per recipient.

create table notifications (
  seq bigserial not null,
  id text primary key,
  user_id text not null,
  kind text not null,
  title text not null,
  body text,
  href text not null,
  created_at timestamptz not null,
  read_at timestamptz
);

create index notifications_seq_idx on notifications (seq desc);
create index notifications_user_id_idx on notifications (user_id, read_at);
