-- When each participant last opened an inquiry or application thread.

create table thread_reads (
  seq bigserial not null,
  id text primary key,
  thread_id text not null,
  user_id text not null,
  read_at timestamptz not null
);

create index thread_reads_seq_idx on thread_reads (seq desc);
create index thread_reads_user_id_idx on thread_reads (user_id);
