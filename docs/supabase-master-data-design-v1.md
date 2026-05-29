ソレイユOS Supabaseマスターデータ設計書 v1.0

概要

この設計書は、ソレイユOS v2.0 を Supabase 上で動かすためのデータ設計をまとめたものである。

ソレイユOSは、以下のログ・エリアを持つ。

* 🌅 朝ログ
* 🌙 夜ログ
* 🏔 展望台ログ
* 📚 図書館ログ
* 🎨 アトリエログ
* 🌷 庭園ログ
* 🏡 宿りの館ログ
* 🕊 広場ログ

本設計書では、これらをどのようなテーブルに保存し、どのように関連付けるかを定義する。

⸻

1. 基本方針

1-1. データ設計の目的

このデータ設計の目的は、以下である。

* iPhone / iPad / PC で同じ日誌を編集できる
* 朝ログ・夜ログ・エリアログを日付単位で見返せる
* エリアログを複数件保存できる
* アトリエログでプロジェクト管理ができる
* 庭園ログ・宿りの館ログ・広場ログを長期的に蓄積できる
* 将来的にソレイユWORLDと連動できる

⸻

2. テーブル全体構成

初期構成では、以下のテーブルを使う。

profiles
daily_logs
area_logs
projects
project_logs
tags
log_tags

⸻

3. 各テーブルの役割

profiles

ユーザー情報。

すでに作成済み。

主な用途：

* ユーザー表示名
* 将来的な設定
* 篤史コメントの個別調整

⸻

daily_logs

1日単位の日誌。

朝ログと夜ログを同じ日付にまとめる。

1日 = 1 daily_logs レコード

例：

2026/05/29
├ 朝ログ
└ 夜ログ

⸻

area_logs

各エリアログ。

展望台・図書館・庭園などを保存する。

1日につき複数件OK

例：

2026/05/29
├ 展望台ログ
├ 図書館ログ
├ 庭園ログ
└ 庭園ログ

⸻

projects

アトリエ用のプロジェクト管理。

例：

* ソレイユ日誌
* ソレイユWORLD
* ワークブック
* 音楽制作

⸻

project_logs

プロジェクトに紐づく制作履歴。

例：

ソレイユ日誌
├ 2026/05/29 図書館仕様書作成
└ 2026/05/30 アトリエ仕様書作成

⸻

tags

庭園ログ・宿りの館ログ・広場ログなどで使うタグ一覧。

例：

* 薔薇
* ドライブ
* 茶室
* 回復
* 価値交換
* ヒカルさん

⸻

log_tags

ログとタグを紐づける中間テーブル。

⸻

4. daily_logs 設計

4-1. 役割

daily_logs は、1日の中心となる日誌データを保存する。

朝ログと夜ログは別画面で入力するが、データとしては同じ daily_logs に保存する。

⸻

4-2. カラム案

create table public.daily_logs (
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

4-3. morning_tasks の形式

[
  {
    "id": "task-001",
    "text": "アトリエログ仕様書を保存する",
    "done": false
  },
  {
    "id": "task-002",
    "text": "Supabase設計書を作る",
    "done": true
  }
]

⸻

5. area_logs 設計

5-1. 役割

area_logs は、各エリアログを保存する。

対象：

* observatory
* library
* atelier
* garden
* inn
* plaza

⸻

5-2. カラム案

create table public.area_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null,
  area_key text not null,
  title text,
  body jsonb not null default '{}'::jsonb,
  related_project_id uuid references public.projects(id) on delete set null,
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

6. area_key 定義

observatory = 展望台
library     = 図書館
atelier     = アトリエ
garden      = 庭園
inn         = 宿りの館
plaza       = 広場

⸻

7. 各エリアログの body 設計

7-1. 展望台ログ body

{
  "theme": "",
  "what_happened": "",
  "first_feeling": "",
  "interpretation": "",
  "another_view": "",
  "emotion_message": "",
  "real_issue": "",
  "options": "",
  "best_action": "",
  "not_do": "",
  "next_view": ""
}

⸻

7-2. 図書館ログ body

{
  "theme": "",
  "thinking_subject": "",
  "source": "",
  "understanding": "",
  "structure": "",
  "difference": "",
  "definition": "",
  "application": "",
  "unknown": "",
  "next_research": ""
}

⸻

7-3. アトリエログ body

{
  "project_name": "",
  "status": "",
  "description": "",
  "parent_project": "",
  "derived_from": "",
  "related_projects": [],
  "child_projects": [],
  "current_position": "",
  "next_action": "",
  "future_action": "",
  "on_hold": "",
  "today_work": "",
  "deliverables": "",
  "insights": "",
  "new_ideas": ""
}

⸻

7-4. 庭園ログ body

{
  "place": "",
  "tags": [],
  "memo": ""
}

⸻

7-5. 宿りの館ログ body

{
  "condition": "",
  "recovery_actions": [],
  "result": "",
  "memo": ""
}

⸻

7-6. 広場ログ body

{
  "person": "",
  "category": "",
  "place": "",
  "received_values": [],
  "given_values": [],
  "event": "",
  "memo": ""
}

⸻

8. projects 設計

8-1. 役割

projects は、アトリエログの中核となるプロジェクト管理テーブル。

アトリエログは単なる日次ログではなく、プロジェクトの現在地を管理するため、独立テーブルを持つ。

⸻

8-2. カラム案

create table public.projects (
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

9. プロジェクト状態定義

idea       = 💡 ひらめき
concept    = 🌱 構想中
designing  = 📐 設計中
building   = 🛠 実装中
testing    = 🧪 テスト中
published  = ✨ 公開済み
improving  = 🌿 継続改善中
paused     = 📦 保留中

⸻

10. project_logs 設計

10-1. 役割

project_logs は、プロジェクトに紐づく制作履歴を保存する。

projects が「現在地」なら、project_logs は「足跡」。

⸻

10-2. カラム案

create table public.project_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  log_date date not null,
  work_done text,
  deliverables text,
  insights text,
  new_ideas text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

⸻

11. tags 設計

11-1. 役割

tags は、庭園・宿りの館・広場などで使うタグを管理する。

⸻

11-2. カラム案

create table public.tags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  tag_type text,
  created_at timestamptz not null default now(),
  constraint unique_tag_per_user
    unique (user_id, name)
);

⸻

11-3. tag_type 例

garden
recovery
value
person
place
project

⸻

12. log_tags 設計

12-1. 役割

log_tags は、area_logs と tags を紐づける。

⸻

12-2. カラム案

create table public.log_tags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  area_log_id uuid not null references public.area_logs(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint unique_log_tag
    unique (area_log_id, tag_id)
);

⸻

13. データ関係図

auth.users
   │
   ├── profiles
   │
   ├── daily_logs
   │
   ├── area_logs
   │       │
   │       └── log_tags ── tags
   │
   └── projects
           │
           └── project_logs

⸻

14. 保存ルール

朝ログ保存

保存先：

daily_logs

同じ user_id + log_date があれば更新。

なければ新規作成。

⸻

夜ログ保存

保存先：

daily_logs

同じ user_id + log_date があれば更新。

なければ新規作成。

⸻

エリアログ保存

保存先：

area_logs

同じ日に複数件作成可能。

⸻

アトリエのプロジェクト保存

保存先：

projects

制作履歴は

project_logs

へ保存。

⸻

15. 今日訪れたエリアの自動更新

エリアログを保存した時、daily_logs.visited_areas に area_key を追加する。

例：

図書館ログ保存
↓
daily_logs.visited_areas に library を追加

重複追加はしない。

⸻

16. RLS方針

すべてのテーブルは、本人だけが読める・書けるようにする。

対象テーブル：

profiles
daily_logs
area_logs
projects
project_logs
tags
log_tags

基本ルール：

select: auth.uid() = user_id
insert: auth.uid() = user_id
update: auth.uid() = user_id
delete: auth.uid() = user_id

profiles のみ：

auth.uid() = id

⸻

17. 実装優先度

Phase 1

daily_logs

朝ログ・夜ログ保存

⸻

Phase 2

area_logs

庭園・宿りの館・展望台・図書館・広場保存

⸻

Phase 3

projects

アトリエのプロジェクト管理

⸻

Phase 4

project_logs

制作履歴

⸻

Phase 5

tags / log_tags

タグ検索・好きの履歴・回復履歴

⸻

18. 初期MVPで作るべき最小構成

最初から全部作らない。

MVPでは以下でよい。

profiles
daily_logs
area_logs
projects

後から追加：

project_logs
tags
log_tags

⸻

19. 注意点

19-1. 写真は保存しない

v1では庭園ログに写真機能を持たせない。

理由：

* データ容量が増える
* Storage設計が必要になる
* 初期実装が複雑になる

⸻

19-2. タグは最初は body 内でもよい

初期実装では、庭園ログの tags は body の中に配列で保存してよい。

本格検索が必要になった段階で tags / log_tags を実装する。

⸻

19-3. アトリエは慎重に作る

アトリエは単なる area_logs だけでは不足する。

プロジェクト管理が必要なため、projects テーブルを用意する。

⸻

20. 一言まとめ

ソレイユOSのデータ設計は、

daily_logs
→ 1日の記録
area_logs
→ エリア別の記録
projects
→ 創作プロジェクト管理
project_logs
→ 制作履歴
tags
→ 好き・回復・価値交換の検索軸

として扱う。

朝ログ・夜ログは daily_logs。

各エリアログは area_logs。

アトリエのプロジェクトは projects。

この役割分担を守ることで、ソレイユOSは日記アプリではなく、生活と創作を支えるOSとして拡張できる。

⸻

Version: v1.0
Created: 2026-05-29
Status: Draft