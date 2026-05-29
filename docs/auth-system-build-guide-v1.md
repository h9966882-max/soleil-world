ソレイユOS 認証システム構築書 v1.0

概要

この構築書は、ソレイユOSにログイン機能を追加するための設計・作業手順をまとめたもの。

目的は、

* iPhone / iPad / PC で同じ日誌を使えるようにする
* Supabase上でユーザーごとにデータを分ける
* 朝ログ・夜ログ・エリアログを本人だけが保存・閲覧できるようにする

ことである。

⸻

1. 認証システムの役割

ソレイユOSにおける認証は、

単なるログイン機能ではない。

誰の日誌なのか

を決めるための入口である。

⸻

2. 今回の目標

今回の目標は以下。

ログインできる
↓
ログイン中のユーザーを取得できる
↓
その user_id を使って日誌を保存できる

⸻

3. 使用する認証方式

初期実装では、

メールログイン

を優先する。

Googleログインは後から追加でもよい。

理由：

* Supabase側だけで始めやすい
* Google Cloud Console設定が不要
* 最初の動作確認が簡単
* GitHub Pagesでも扱いやすい

⸻

4. Supabase側で確認する場所

Supabase管理画面で以下を開く。

Authentication
↓
Providers

まずは Email が有効になっているか確認する。

⸻

5. 作成するファイル

GitHub側に以下を追加する。

login.html
js/supabaseClient.js
js/auth.js

⸻

6. js/supabaseClient.js

Supabase接続情報をまとめるファイル。

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const SUPABASE_URL = "ここにProject URLを入れる";
const SUPABASE_ANON_KEY = "ここにanon public keyを入れる";
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

⸻

7. login.html

ログイン画面。

<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>ソレイユOS ログイン</title>
</head>
<body>
  <main>
    <h1>ソレイユOS</h1>
    <p>丘の日誌へ入る</p>
    <input id="email" type="email" placeholder="メールアドレス" />
    <button id="loginButton">ログインリンクを送る</button>
    <p id="message"></p>
  </main>
  <script type="module" src="./js/auth.js"></script>
</body>
</html>

⸻

8. js/auth.js

メールログインリンクを送る処理。

import { supabase } from "./supabaseClient.js";
const emailInput = document.getElementById("email");
const loginButton = document.getElementById("loginButton");
const message = document.getElementById("message");
loginButton.addEventListener("click", async () => {
  const email = emailInput.value.trim();
  if (!email) {
    message.textContent = "メールアドレスを入力してね";
    return;
  }
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: window.location.origin + "/index.html"
    }
  });
  if (error) {
    message.textContent = "ログインリンクの送信に失敗しました";
    console.error(error);
    return;
  }
  message.textContent = "ログインリンクを送ったよ。メールを確認してね🌻";
});

⸻

9. ログイン中ユーザー取得

各ページでログイン状態を確認する。

import { supabase } from "./supabaseClient.js";
export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    return null;
  }
  return data.user;
}

⸻

10. 未ログイン時の処理

日誌ページでは、未ログインなら login.html に戻す。

const user = await getCurrentUser();
if (!user) {
  window.location.href = "./login.html";
}

⸻

11. ログアウト処理

await supabase.auth.signOut();
window.location.href = "./login.html";

⸻

12. データ保存時の user_id

ログ保存時は、必ずログイン中ユーザーの id を使う。

例：

const user = await getCurrentUser();
const { error } = await supabase
  .from("daily_logs")
  .upsert({
    user_id: user.id,
    log_date: "2026-05-29",
    morning_goal: "今日の目標"
  }, {
    onConflict: "user_id,log_date"
  });

⸻

13. 実装順

Step 1

SupabaseのProject URLとanon public keyを確認する。

Project Settings
↓
API

⸻

Step 2

js/supabaseClient.js を作る。

⸻

Step 3

login.html を作る。

⸻

Step 4

js/auth.js を作る。

⸻

Step 5

GitHubにコミットする。

⸻

Step 6

GitHub Pagesで login.html を開く。

⸻

Step 7

メールログインを試す。

⸻

14. 完成条件

login.html を開ける
メールアドレスを入力できる
ログインリンクが届く
リンクを押すとサイトに戻れる
ログイン中ユーザーを取得できる

⸻

15. 次にやること

認証が動いたら、次はRLSを設定する。

RLSが有効になると、

自分のログだけ読める
自分のログだけ書ける

状態になる。

⸻

Version: v1.0
Created: 2026-05-29
Status: Draft