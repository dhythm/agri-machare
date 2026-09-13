-- Review state for marketplace listings and transport jobs.
-- NULL means approved (seeded public rows). Create flows store 'pending'.

alter table listings
  add column moderation_status text,
  add column moderation_note text,
  add column moderated_at timestamptz;

alter table transport_jobs
  add column moderation_status text,
  add column moderation_note text,
  add column moderated_at timestamptz;

create index listings_moderation_status_idx on listings (moderation_status);
create index transport_jobs_moderation_status_idx on transport_jobs (moderation_status);
