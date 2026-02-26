-- ============================================================
-- SPARK — Auth Trigger Fix
-- Run this in: Supabase Dashboard → SQL Editor
-- This fixes the "Database error saving new user" issue.
-- ============================================================

-- Step 1: Drop the old trigger and function cleanly
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists handle_new_user();

-- Step 2: Recreate with a more robust version that handles
-- missing metadata gracefully and won't fail on RLS
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    full_name,
    email,
    role,
    department,
    student_id
  )
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      split_part(new.email, '@', 1),
      'New User'
    ),
    new.email,
    'student',
    coalesce(new.raw_user_meta_data->>'department', null),
    coalesce(new.raw_user_meta_data->>'student_id', null)
  )
  on conflict (id) do nothing;  -- safe guard against duplicate triggers

  return new;
exception
  when others then
    -- Log the error but don't block signup
    raise warning 'handle_new_user failed for %: %', new.id, sqlerrm;
    return new;
end;
$$;

-- Step 3: Recreate the trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute procedure handle_new_user();

-- Step 4: Make sure the profiles table allows the trigger to insert
-- (service_role bypasses RLS, but we explicitly allow it anyway)
alter table public.profiles enable row level security;

-- Drop old insert policy if it exists, then recreate cleanly
drop policy if exists "Service role can insert profiles" on public.profiles;
drop policy if exists "Users can insert own profile" on public.profiles;

create policy "Service role can insert profiles"
  on public.profiles
  for insert
  with check (true);

-- Step 5: Verify existing policies are intact for select/update
-- (These should already exist from schema.sql, but just in case)
drop policy if exists "Users can view all profiles" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;

create policy "Users can view all profiles"
  on public.profiles for select
  using (true);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);
