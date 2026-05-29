ソレイユOS Supabase SQL構築書 v1.0

概要

この構築書は、ソレイユOS v2.0 を Supabase 上で動かすために、実際に Supabase SQL Editor へ貼り付けて実行する SQL をまとめたものである。

対象は、初期MVPに必要な以下のテーブル。

* profiles
* daily_logs
* area_logs
* projects

既に profiles は作成済みだが、ここでは確認用として改めて記載する。

⸻

実行前の注意

一気に全部貼らない

必ず STEP ごとに実行する。

理由：

* エラーが出た時に原因を特定しやすい
* 初回構築で混乱しにくい
* テーブル作成とRLS設定を順番に確認できる

⸻

STEP 0：拡張機能を有効化

create extension if not exists pgcrypto;

⸻

STEP 1：profiles テーブル

すでに作成済みなら、そのまま実行しても問題ない。

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

⸻

STEP 2：daily_logs テーブル

朝ログ・夜ログを保存する中心テーブル。

1日につき1件。

create table if not exists public.daily_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null,
  morning_goal text,
  morning_mood text,
  morning_tasks jsonb not null default '[]'::jsonb,
  night_main_emotion text,
  night_energy integer,
  night_done text,
  night_moved_heart text,
  night_tomorrow text,
  visited_areas text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint daily_logs_energy_check
    check (night_energy is null or night_energy between 1 and 5),
  constraint unique_daily_log_per_user
    unique (user_id, log_date)
);

⸻

STEP 3：area_logs テーブル

展望台・図書館・アトリエ・庭園・宿りの館・広場ログを保存する。

1日に複数件作成可能。

create table if not exists public.area_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null,
  area_key text not null,
  title text,
  body jsonb not null default '{}'::jsonb,
  related_project_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint area_logs_area_key_check
    check (area_key in (
      'observatory',
      'library',
      'atelier',
      'garden',
      'inn',
      'plaza'
    ))
);

⸻

STEP 4：projects テーブル

アトリエログ用のプロジェクト管理テーブル。

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  status text not null default 'idea',
  parent_project_id uuid references public.projects(id) on delete set null,
  derived_from text,
  current_position text,
  next_action text,
  future_action text,
  on_hold text,
  desired_deadline date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint projects_status_check
    check (status in (
      'idea',
      'concept',
      'designing',
      'building',
      'testing',
      'published',
      'improving',
      'paused'
    ))
);

⸻

STEP 5：area_logs と projects を接続

area_logs の related_project_id を projects に紐づける。

alter table public.area_logs
drop constraint if exists area_logs_related_project_id_fkey;
alter table public.area_logs
add constraint area_logs_related_project_id_fkey
foreign key (related_project_id)
references public.projects(id)
on delete set null;

⸻

STEP 6：updated_at 自動更新関数

更新時に updated_at を自動で現在時刻にする。

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

⸻

STEP 7：updated_at トリガー作成

profiles

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

daily_logs

drop trigger if exists set_daily_logs_updated_at on public.daily_logs;
create trigger set_daily_logs_updated_at
before update on public.daily_logs
for each row
execute function public.set_updated_at();

area_logs

drop trigger if exists set_area_logs_updated_at on public.area_logs;
create trigger set_area_logs_updated_at
before update on public.area_logs
for each row
execute function public.set_updated_at();

projects

drop trigger if exists set_projects_updated_at on public.projects;
create trigger set_projects_updated_at
before update on public.projects
for each row
execute function public.set_updated_at();

⸻

STEP 8：新規ユーザー作成時に profile を自動作成

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

⸻

STEP 9：RLSを有効化

alter table public.profiles enable row level security;
alter table public.daily_logs enable row level security;
alter table public.area_logs enable row level security;
alter table public.projects enable row level security;

⸻

STEP 10：profiles のRLSポリシー

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
using (auth.uid() = id);
drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles
for insert
with check (auth.uid() = id);
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

⸻

STEP 11：daily_logs のRLSポリシー

drop policy if exists "daily_logs_select_own" on public.daily_logs;
create policy "daily_logs_select_own"
on public.daily_logs
for select
using (auth.uid() = user_id);
drop policy if exists "daily_logs_insert_own" on public.daily_logs;
create policy "daily_logs_insert_own"
on public.daily_logs
for insert
with check (auth.uid() = user_id);
drop policy if exists "daily_logs_update_own" on public.daily_logs;
create policy "daily_logs_update_own"
on public.daily_logs
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
drop policy if exists "daily_logs_delete_own" on public.daily_logs;
create policy "daily_logs_delete_own"
on public.daily_logs
for delete
using (auth.uid() = user_id);

⸻

STEP 12：area_logs のRLSポリシー

drop policy if exists "area_logs_select_own" on public.area_logs;
create policy "area_logs_select_own"
on public.area_logs
for select
using (auth.uid() = user_id);
drop policy if exists "area_logs_insert_own" on public.area_logs;
create policy "area_logs_insert_own"
on public.area_logs
for insert
with check (auth.uid() = user_id);
drop policy if exists "area_logs_update_own" on public.area_logs;
create policy "area_logs_update_own"
on public.area_logs
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
drop policy if exists "area_logs_delete_own" on public.area_logs;
create policy "area_logs_delete_own"
on public.area_logs
for delete
using (auth.uid() = user_id);

⸻

STEP 13：projects のRLSポリシー

drop policy if exists "projects_select_own" on public.projects;
create policy "projects_select_own"
on public.projects
for select
using (auth.uid() = user_id);
drop policy if exists "projects_insert_own" on public.projects;
create policy "projects_insert_own"
on public.projects
for insert
with check (auth.uid() = user_id);
drop policy if exists "projects_update_own" on public.projects;
create policy "projects_update_own"
on public.projects
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
drop policy if exists "projects_delete_own" on public.projects;
create policy "projects_delete_own"
on public.projects
for delete
using (auth.uid() = user_id);

⸻

STEP 14：インデックス作成

検索や一覧表示を速くする。

create index if not exists daily_logs_user_date_idx
on public.daily_logs(user_id, log_date desc);
create index if not exists area_logs_user_date_idx
on public.area_logs(user_id, log_date desc);
create index if not exists area_logs_user_area_idx
on public.area_logs(user_id, area_key);
create index if not exists projects_user_status_idx
on public.projects(user_id, status);
create index if not exists projects_user_created_idx
on public.projects(user_id, created_at desc);

⸻

STEP 15：テーブル確認

select table_name
from information_schema.tables
where table_schema = 'public'
order by table_name;

以下が出ればOK。

area_logs
daily_logs
profiles
projects

⸻

STEP 16：RLS確認

select
  schemaname,
  tablename,
  rowsecurity
from pg_tables
where schemaname = 'public'
and tablename in (
  'profiles',
  'daily_logs',
  'area_logs',
  'projects'
);

rowsecurity が true ならOK。

⸻

STEP 17：ポリシー確認

select
  tablename,
  policyname,
  cmd
from pg_policies
where schemaname = 'public'
order by tablename, policyname;

profiles / daily_logs / area_logs / projects のポリシーが表示されればOK。

⸻

STEP 18：今回まだ作らないもの

以下は後回し。

project_logs
tags
log_tags

理由：

* 初期MVPでは必須ではない
* 先に朝ログ・夜ログ・エリアログ保存を確認したい
* アトリエの本格運用後に追加しても問題ない

⸻

STEP 19：今回の完成条件

この構築書の完了条件。

profiles がある
daily_logs がある
area_logs がある
projects がある
RLS が有効
本人だけ読める・書ける
朝ログ・夜ログを保存する土台がある
エリアログを保存する土台がある
アトリエのプロジェクトを保存する土台がある

⸻

STEP 20：次にやること

SupabaseでこのSQL構築が完了したら、次はGitHub側で以下を作る。

js/supabaseClient.js
js/auth.js
js/diaryApi.js
login.html
home.html
morninglog.html
nightlog.html

⸻

Version: v1.0
Created: 2026-05-29
Status: Draft