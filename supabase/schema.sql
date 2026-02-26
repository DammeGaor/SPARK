-- ============================================================
-- SCHOLARLY — Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================================


-- ─────────────────────────────────────────────
-- EXTENSIONS
-- ─────────────────────────────────────────────
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm"; -- enables fast full-text search on text fields


-- ─────────────────────────────────────────────
-- ENUM: USER ROLES
-- ─────────────────────────────────────────────
create type user_role as enum ('student', 'faculty', 'admin');


-- ─────────────────────────────────────────────
-- ENUM: STUDY STATUS
-- ─────────────────────────────────────────────
create type study_status as enum ('pending', 'approved', 'rejected', 'revision_requested');


-- ─────────────────────────────────────────────
-- TABLE: profiles
-- Extends Supabase auth.users (one-to-one)
-- ─────────────────────────────────────────────
create table profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  full_name     text not null,
  email         text not null,
  role          user_role not null default 'student',
  department    text,
  student_id    text,                     -- optional institutional ID
  avatar_url    text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Auto-create a profile when a user signs up
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'New User'),
    new.email
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();


-- ─────────────────────────────────────────────
-- TABLE: categories  (max 5 enforced via constraint)
-- ─────────────────────────────────────────────
create table categories (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null unique,
  slug        text not null unique,
  description text,
  color       text not null default '#3a5ea0',  -- hex color for UI badge
  created_at  timestamptz not null default now()
);

-- Enforce max 5 categories
create or replace function enforce_max_categories()
returns trigger as $$
begin
  if (select count(*) from categories) >= 5 then
    raise exception 'Maximum of 5 categories allowed.';
  end if;
  return new;
end;
$$ language plpgsql;

create trigger limit_categories
  before insert on categories
  for each row execute procedure enforce_max_categories();

-- Seed default categories
insert into categories (name, slug, description, color) values
  ('Thesis',             'thesis',             'Undergraduate and graduate thesis papers.',        '#2d4a82'),
  ('Capstone Project',   'capstone-project',   'Final-year capstone and integrative projects.',   '#3a5ea0'),
  ('Research Paper',     'research-paper',     'Peer-level academic research papers.',             '#5479b8'),
  ('Case Study',         'case-study',         'In-depth analysis of specific cases or events.',  '#7b9bce'),
  ('Feasibility Study',  'feasibility-study',  'Viability analysis and feasibility reports.',      '#aabfe1');


-- ─────────────────────────────────────────────
-- TABLE: studies
-- ─────────────────────────────────────────────
create table studies (
  id               uuid primary key default uuid_generate_v4(),
  title            text not null,
  abstract         text not null,
  author_id        uuid not null references profiles(id) on delete cascade,

  -- Academic metadata
  co_authors       text[],                        -- array of names (non-users)
  adviser          text not null,
  date_completed   date not null,
  keywords         text[] not null default '{}',
  citation         text,                          -- formatted citation string
  year_level       text,
  course           text,
  department       text,

  -- Categorization
  category_id      uuid references categories(id) on delete set null,

  -- File
  file_url         text,                          -- Supabase Storage path
  file_name        text,
  file_size_bytes  bigint,

  -- Status & visibility
  status           study_status not null default 'pending',
  is_published     boolean not null default false,

  -- Search vector (auto-updated)
  search_vector    tsvector,

  -- Timestamps
  submitted_at     timestamptz not null default now(),
  published_at     timestamptz,
  updated_at       timestamptz not null default now()
);

-- Full-text search index
create index studies_search_idx on studies using gin(search_vector);
create index studies_keywords_idx on studies using gin(keywords);
create index studies_category_idx on studies(category_id);
create index studies_status_idx on studies(status);
create index studies_author_idx on studies(author_id);

-- Auto-update search_vector
create or replace function update_study_search_vector()
returns trigger as $$
begin
  new.search_vector :=
    setweight(to_tsvector('english', coalesce(new.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(new.abstract, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(new.adviser, '')), 'C') ||
    setweight(to_tsvector('english', array_to_string(new.keywords, ' ')), 'B');
  return new;
end;
$$ language plpgsql;

create trigger studies_search_vector_update
  before insert or update on studies
  for each row execute procedure update_study_search_vector();

-- Auto-set published_at when approved
create or replace function handle_study_status_change()
returns trigger as $$
begin
  if new.status = 'approved' and old.status != 'approved' then
    new.is_published := true;
    new.published_at := now();
  elsif new.status != 'approved' then
    new.is_published := false;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger on_study_status_change
  before update of status on studies
  for each row execute procedure handle_study_status_change();


-- ─────────────────────────────────────────────
-- TABLE: validations
-- Faculty review trail per study
-- ─────────────────────────────────────────────
create table validations (
  id           uuid primary key default uuid_generate_v4(),
  study_id     uuid not null references studies(id) on delete cascade,
  faculty_id   uuid not null references profiles(id) on delete cascade,
  status       study_status not null,
  notes        text,                        -- feedback / revision requests
  reviewed_at  timestamptz not null default now()
);

create index validations_study_idx on validations(study_id);


-- ─────────────────────────────────────────────
-- TABLE: comments
-- ─────────────────────────────────────────────
create table comments (
  id          uuid primary key default uuid_generate_v4(),
  study_id    uuid not null references studies(id) on delete cascade,
  user_id     uuid not null references profiles(id) on delete cascade,
  body        text not null,
  parent_id   uuid references comments(id) on delete cascade,  -- for reply threading
  is_deleted  boolean not null default false,                   -- soft delete
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index comments_study_idx on comments(study_id);
create index comments_parent_idx on comments(parent_id);


-- ─────────────────────────────────────────────
-- TABLE: downloads
-- Tracks every download; triggers author notification
-- ─────────────────────────────────────────────
create table downloads (
  id              uuid primary key default uuid_generate_v4(),
  study_id        uuid not null references studies(id) on delete cascade,
  downloader_id   uuid references profiles(id) on delete set null,
  downloaded_at   timestamptz not null default now()
);

create index downloads_study_idx on downloads(study_id);

-- Notify author via a notifications table insert on each download
create or replace function notify_author_on_download()
returns trigger as $$
declare
  v_author_id uuid;
  v_study_title text;
begin
  select author_id, title into v_author_id, v_study_title
  from studies where id = new.study_id;

  insert into notifications (user_id, type, study_id, message)
  values (
    v_author_id,
    'download',
    new.study_id,
    'Someone downloaded your study: "' || v_study_title || '"'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_study_downloaded
  after insert on downloads
  for each row execute procedure notify_author_on_download();


-- ─────────────────────────────────────────────
-- TABLE: notifications
-- In-app notification feed
-- ─────────────────────────────────────────────
create type notification_type as enum ('download', 'comment', 'validation', 'system');

create table notifications (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references profiles(id) on delete cascade,
  type        notification_type not null,
  study_id    uuid references studies(id) on delete cascade,
  message     text not null,
  is_read     boolean not null default false,
  created_at  timestamptz not null default now()
);

create index notifications_user_idx on notifications(user_id, is_read);


-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

alter table profiles      enable row level security;
alter table studies        enable row level security;
alter table categories     enable row level security;
alter table comments       enable row level security;
alter table downloads      enable row level security;
alter table validations    enable row level security;
alter table notifications  enable row level security;


-- ── PROFILES ──
create policy "Users can view all profiles"
  on profiles for select using (true);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);


-- ── CATEGORIES ── (public read, admin write)
create policy "Anyone can view categories"
  on categories for select using (true);

create policy "Only admins can manage categories"
  on categories for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );


-- ── STUDIES ──
-- Public can only see approved/published studies
create policy "Anyone can view approved studies"
  on studies for select
  using (is_published = true and status = 'approved');

-- Authors can always see their own submissions
create policy "Authors can view own studies"
  on studies for select
  using (author_id = auth.uid());

-- Faculty and admin can see all studies
create policy "Faculty and admin can view all studies"
  on studies for select
  using (
    exists (select 1 from profiles where id = auth.uid() and role in ('faculty', 'admin'))
  );

-- Students and faculty can submit
create policy "Authenticated users can submit studies"
  on studies for insert
  with check (auth.uid() is not null and author_id = auth.uid());

-- Authors can update their own pending studies
create policy "Authors can update own pending studies"
  on studies for update
  using (author_id = auth.uid() and status = 'pending');

-- Faculty and admin can update status
create policy "Faculty and admin can update study status"
  on studies for update
  using (
    exists (select 1 from profiles where id = auth.uid() and role in ('faculty', 'admin'))
  );

-- Admin can delete
create policy "Admin can delete studies"
  on studies for delete
  using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );


-- ── COMMENTS ──
create policy "Anyone can view comments on published studies"
  on comments for select
  using (
    is_deleted = false and
    exists (select 1 from studies s where s.id = study_id and s.is_published = true)
  );

create policy "Authenticated users can comment"
  on comments for insert
  with check (auth.uid() is not null and user_id = auth.uid());

create policy "Users can update own comments"
  on comments for update
  using (user_id = auth.uid());

create policy "Users can soft-delete own comments"
  on comments for update
  using (user_id = auth.uid() or
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );


-- ── DOWNLOADS ──
create policy "Authenticated users can log downloads"
  on downloads for insert
  with check (auth.uid() is not null);

create policy "Authors and admin can view download records"
  on downloads for select
  using (
    downloader_id = auth.uid() or
    exists (select 1 from studies s where s.id = study_id and s.author_id = auth.uid()) or
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );


-- ── VALIDATIONS ──
create policy "Faculty and admin can insert validations"
  on validations for insert
  with check (
    exists (select 1 from profiles where id = auth.uid() and role in ('faculty', 'admin'))
    and faculty_id = auth.uid()
  );

create policy "Faculty, admin, and study author can view validations"
  on validations for select
  using (
    faculty_id = auth.uid() or
    exists (select 1 from studies s where s.id = study_id and s.author_id = auth.uid()) or
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );


-- ── NOTIFICATIONS ──
create policy "Users can view own notifications"
  on notifications for select
  using (user_id = auth.uid());

create policy "Users can mark own notifications as read"
  on notifications for update
  using (user_id = auth.uid());


-- ============================================================
-- STORAGE BUCKETS
-- Run in Supabase Dashboard → Storage, or via API
-- ============================================================
-- Create bucket: study-files (private, authenticated upload only)
-- Create bucket: avatars (public)
--
-- SQL equivalent (may need dashboard for some options):
-- insert into storage.buckets (id, name, public) values ('study-files', 'study-files', false);
-- insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true);
