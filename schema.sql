create table if not exists locations (
    id integer primary key autoincrement,
    latitude real not null,
    longitude real not null,
    created_at timestamp not null default current_timestamp
);