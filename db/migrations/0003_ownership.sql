-- Link rows to the signed-in user who created them. NULL means unowned
-- (seeded or legacy rows); only admins can manage those.

alter table listings add column owner_user_id text;
alter table transport_jobs add column owner_user_id text;
alter table submissions add column user_id text;

create index listings_owner_user_id_idx on listings (owner_user_id);
create index transport_jobs_owner_user_id_idx on transport_jobs (owner_user_id);
create index submissions_user_id_idx on submissions (user_id);
