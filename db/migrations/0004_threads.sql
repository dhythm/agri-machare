-- Inquiry and application threads: a status on the opening submission and
-- the replies exchanged between the sender and the target's owner.

alter table submissions add column status text;

create table messages (
  seq bigserial not null,
  id text primary key,
  thread_id text not null references submissions (id) on delete cascade,
  sender_user_id text not null,
  body text not null,
  created_at timestamptz not null
);

create index messages_seq_idx on messages (seq desc);
create index messages_thread_id_idx on messages (thread_id);
