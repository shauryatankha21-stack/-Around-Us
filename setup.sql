-- Around Us V7 — Supabase database setup
-- Run this whole file in Supabase Dashboard → SQL Editor.

create extension if not exists pgcrypto;

-- ---------- PROFILES ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  college text,
  city text,
  date_of_birth date not null default '2000-01-01' check (date_of_birth <= current_date - interval '16 years'),
  gender text not null default 'Any' check (gender in ('Male', 'Female', 'Any')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Profiles are publicly readable" on public.profiles;
create policy "Profiles are publicly readable"
on public.profiles for select
to anon, authenticated
using (true);

drop policy if exists "Users can insert their profile" on public.profiles;
create policy "Users can insert their profile"
on public.profiles for insert
to authenticated
with check ((select auth.uid()) = id);

drop policy if exists "Users can update their profile" on public.profiles;
create policy "Users can update their profile"
on public.profiles for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

-- Automatically create a profile whenever someone signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, name, college, city, date_of_birth, gender)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', ''),
    new.raw_user_meta_data ->> 'college',
    new.raw_user_meta_data ->> 'city',
    coalesce((new.raw_user_meta_data ->> 'date_of_birth')::date, '2000-01-01'::date),
    coalesce(new.raw_user_meta_data ->> 'gender', 'Any')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- ---------- GAMES ----------
create table if not exists public.games (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  icon text not null default '🎮',
  category text not null check (category in ('sports','games','other')),
  experience_level text not null default 'Any' check (experience_level in ('Any', 'Beginner', 'Intermediate', 'Pro')),
  gender_preference text not null default 'Any' check (gender_preference in ('Any', 'Male', 'Female')),
  place text not null,
  scope text not null check (scope in ('college','city')),
  starts_at timestamptz not null,
  status text not null default 'upcoming' check (status in ('live','upcoming')),
  max_players integer not null check (max_players between 2 and 50),
  min_age integer not null default 16 check (min_age >= 16),
  note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.games enable row level security;

drop policy if exists "Anyone can view games" on public.games;
create policy "Anyone can view games"
on public.games for select
to anon, authenticated
using (true);

drop policy if exists "Authenticated users can create games" on public.games;
create policy "Authenticated users can create games"
on public.games for insert
to authenticated
with check ((select auth.uid()) = host_id);

drop policy if exists "Hosts can update their games" on public.games;
create policy "Hosts can update their games"
on public.games for update
to authenticated
using ((select auth.uid()) = host_id)
with check ((select auth.uid()) = host_id);

drop policy if exists "Hosts can delete their games" on public.games;
create policy "Hosts can delete their games"
on public.games for delete
to authenticated
using ((select auth.uid()) = host_id);

-- ---------- PARTICIPANTS ----------
create table if not exists public.game_players (
  game_id uuid not null references public.games(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (game_id, user_id)
);

alter table public.game_players enable row level security;

drop policy if exists "Users can see their own participation" on public.game_players;
create policy "Users can see their own participation"
on public.game_players for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can leave their own games" on public.game_players;
create policy "Users can leave their own games"
on public.game_players for delete
to authenticated
using ((select auth.uid()) = user_id);

-- Atomic join: checks capacity and inserts in one database transaction.
drop function if exists public.join_game(uuid);
create or replace function public.join_game(p_game_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_limit integer;
  v_min_age integer;
  v_gender_preference text;
  v_joined integer;
  v_user_dob date;
  v_user_gender text;
begin
  if v_uid is null then
    raise exception 'You must be signed in to join a game';
  end if;

  select max_players, min_age, gender_preference into v_limit, v_min_age, v_gender_preference
  from public.games
  where id = p_game_id;

  if v_limit is null then
    raise exception 'Game not found';
  end if;

  select date_of_birth, gender into v_user_dob, v_user_gender from public.profiles where id = v_uid;
  if v_user_dob is null or (v_user_dob > current_date - make_interval(years => v_min_age)) then
    raise exception 'You do not meet the age requirement for this game';
  end if;

  if v_gender_preference is not null and v_gender_preference <> 'Any' then
    if v_user_gender is null or v_user_gender <> v_gender_preference then
      raise exception 'This game is only open to % participants', v_gender_preference;
    end if;
  end if;

  if exists (
    select 1 from public.game_players
    where game_id = p_game_id and user_id = v_uid
  ) then
    return true;
  end if;

  select count(*)::integer into v_joined
  from public.game_players
  where game_id = p_game_id;

  if v_joined >= v_limit then
    raise exception 'This game is full';
  end if;

  insert into public.game_players (game_id, user_id)
  values (p_game_id, v_uid);
  return true;
end;
$$;

create or replace function public.leave_game(p_game_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'You must be signed in to leave a game';
  end if;
  delete from public.game_players
  where game_id = p_game_id and user_id = v_uid;
  return true;
end;
$$;

-- Public count endpoint: returns counts but not user IDs.
create or replace function public.get_game_counts()
returns table(game_id uuid, joined_count bigint)
language sql
security definer
set search_path = ''
as $$
  select g.id, count(gp.user_id)::bigint
  from public.games g
  left join public.game_players gp on gp.game_id = g.id
  group by g.id;
$$;

grant execute on function public.join_game(uuid) to authenticated;
grant execute on function public.leave_game(uuid) to authenticated;
grant execute on function public.get_game_counts() to anon, authenticated;

grant select on public.games to anon, authenticated;
grant select on public.profiles to anon, authenticated;
grant insert, update on public.profiles to authenticated;
grant select, delete on public.game_players to authenticated;

-- Enable realtime for the tables used by the app.
alter table public.games replica identity full;
alter table public.game_players replica identity full;

-- The publication command is safe to run repeatedly only if the tables aren't already members.
do $$
begin
  begin alter publication supabase_realtime add table public.games; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.game_players; exception when duplicate_object then null; end;
end $$;

-- Touch the game row whenever a participant joins/leaves so every browser can
-- subscribe to a safe public games UPDATE and then refresh counts.
create or replace function public.touch_game_from_participant()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.games set updated_at = now() where id = coalesce(new.game_id, old.game_id);
  return coalesce(new, old);
end;
$$;

drop trigger if exists game_player_touch_game on public.game_players;
create trigger game_player_touch_game
after insert or delete on public.game_players
for each row execute procedure public.touch_game_from_participant();

-- No demo games are inserted here.
-- After you create an Around Us account, use the website to create real activities.
-- This avoids foreign-key errors because profiles.id must match auth.users.id.
