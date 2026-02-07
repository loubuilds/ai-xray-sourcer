create extension if not exists "uuid-ossp";

create table if not exists projects (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null,
  name text not null,
  description text,
  created_at timestamptz not null default now()
);

create index if not exists idx_projects_user_id on projects(user_id);

create table if not exists searches (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references projects(id) on delete cascade,
  user_id uuid not null,
  name text not null,
  nl_prompt text,
  summary text,
  created_at timestamptz not null default now()
);

create index if not exists idx_searches_project_id on searches(project_id);
create index if not exists idx_searches_user_id on searches(user_id);

create table if not exists search_specs (
  id uuid primary key default uuid_generate_v4(),
  search_id uuid not null references searches(id) on delete cascade,
  spec_json jsonb not null,
  version int not null default 1,
  created_at timestamptz not null default now()
);

create index if not exists idx_search_specs_search_id on search_specs(search_id);

create table if not exists queries (
  id uuid primary key default uuid_generate_v4(),
  search_id uuid not null references searches(id) on delete cascade,
  query_type text not null,
  query_text text not null,
  label text,
  created_at timestamptz not null default now()
);

create index if not exists idx_queries_search_id on queries(search_id);

create table if not exists profiles (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references projects(id) on delete cascade,
  search_id uuid references searches(id) on delete set null,
  user_id uuid not null,

  full_name text,
  current_company text,
  current_title text,
  location text,

  linkedin_url text not null,
  linkedin_url_normalised text not null,

  score int,
  score_reasons jsonb,
  missing_info jsonb,

  status text not null default 'not_contacted',
  tags text[] not null default '{}',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_profiles_project_id on profiles(project_id);
create index if not exists idx_profiles_search_id on profiles(search_id);
create index if not exists idx_profiles_user_id on profiles(user_id);
create unique index if not exists ux_profiles_linkedin_normalised on profiles(linkedin_url_normalised);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_profiles_updated_at on profiles;
create trigger trg_profiles_updated_at
before update on profiles
for each row execute function set_updated_at();

create table if not exists profile_notes (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid not null references profiles(id) on delete cascade,
  note text not null,
  source text,
  created_at timestamptz not null default now()
);

create index if not exists idx_profile_notes_profile_id on profile_notes(profile_id);
