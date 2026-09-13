-- Full-size listing pictures as data URLs; `image` stays the list thumbnail.

alter table listings add column images text[];
