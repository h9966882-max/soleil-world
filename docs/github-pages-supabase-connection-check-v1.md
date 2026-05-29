GitHub Pages × Supabase 接続確認書 v1.0

概要

この構築書は、GitHub Pages 上のソレイユOSから Supabase に接続できるかを確認するための手順書である。

この段階では、まだ以下は実装しない。

* ログイン
* 朝ログ保存
* 夜ログ保存
* エリアログ保存

まずは、

GitHub Pages
↓
Supabase
↓
接続成功

を確認する。

⸻

1. 今回の目的

今回の目的は、

GitHub Pages で開いたページから
Supabase に接続できることを確認する

ことである。

⸻

2. 作成するファイル

GitHub側に以下を作成する。

js/supabaseClient.js
supabase-test.html

⸻

3. Supabase側で必要な情報

Supabase の管理画面から以下を確認する。

必要なもの

Project URL
Publishable key

⸻

Project URL の場所

Supabase 管理画面で、

Project Settings
↓
Data API

を開く。

そこに Project URL が表示される。

⸻

Publishable key の場所

Supabase 管理画面で、

Project Settings
↓
API Keys

を開く。

そこに Publishable key が表示される。

⸻

4. 注意点

Secret key は使わない

Supabaseには、

Publishable key
Secret key

がある。

GitHub Pagesで使うのは

Publishable key

である。

Secret key は絶対にコードへ書かない。

⸻

5. js/supabaseClient.js を作る

js フォルダの中に、

supabaseClient.js

を作成する。

中身は以下。

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const SUPABASE_URL = "ここにProject URLを入れる";
const SUPABASE_PUBLISHABLE_KEY = "ここにPublishable keyを入れる";
export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);

⸻

6. supabase-test.html を作る

ルート直下に、

supabase-test.html

を作成する。

中身は以下。

<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Supabase接続確認</title>
  <style>
    body {
      font-family: system-ui, sans-serif;
      padding: 40px;
      background: #fff8dd;
      color: #3f3a2d;
      line-height: 1.8;
    }
    .card {
      max-width: 640px;
      margin: 0 auto;
      padding: 32px;
      border-radius: 24px;
      background: rgba(255, 255, 255, 0.85);
      box-shadow: 0 16px 40px rgba(100, 80, 30, 0.15);
    }
    h1 {
      margin-top: 0;
      color: #6f7f4f;
    }
    #status {
      font-size: 1.2rem;
      font-weight: 700;
    }
    pre {
      white-space: pre-wrap;
      background: #f7f0d3;
      padding: 16px;
      border-radius: 16px;
      overflow-wrap: anywhere;
    }
  </style>
</head>
<body>
  <main class="card">
    <h1>🌻 Supabase 接続確認</h1>
    <p>
      GitHub Pages から Supabase に接続できるか確認します。
    </p>
    <p id="status">確認中...</p>
    <pre id="result"></pre>
  </main>
  <script type="module">
    import { supabase } from "./js/supabaseClient.js";
    const statusEl = document.getElementById("status");
    const resultEl = document.getElementById("result");
    async function checkConnection() {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .limit(1);
        if (error) {
          statusEl.textContent = "❌ Supabase接続に失敗しました";
          resultEl.textContent = JSON.stringify(error, null, 2);
          return;
        }
        statusEl.textContent = "✅ Supabase接続成功🌻";
        resultEl.textContent = JSON.stringify(data, null, 2);
      } catch (error) {
        statusEl.textContent = "❌ 予期しないエラーが発生しました";
        resultEl.textContent = String(error);
      }
    }
    checkConnection();
  </script>
</body>
</html>

⸻

7. GitHubへコミットする

作成したファイルをコミットする。

js/supabaseClient.js
supabase-test.html

⸻

8. GitHub Pagesで開く

GitHub Pages のURLに、

/supabase-test.html

を付けて開く。

例：

https://ユーザー名.github.io/リポジトリ名/supabase-test.html

⸻

9. 成功表示

成功すると、画面に以下が表示される。

✅ Supabase接続成功🌻

下には、profiles テーブルのデータが表示される。

初期状態では空配列でも問題ない。

[]

⸻

10. よくあるエラー

10-1. Failed to fetch

原因候補：

* Project URL が間違っている
* Publishable key が間違っている
* Supabase側のAPI設定が無効

⸻

10-2. relation “profiles” does not exist

原因：

profiles テーブルが存在しない。

対処：

Supabase Table Editorで profiles があるか確認する。

⸻

10-3. Invalid API key

原因：

Publishable key が間違っている。

対処：

API Keys 画面から再コピーする。

⸻

10-4. Permission denied / RLS error

原因：

RLS設定によって読み取りが拒否されている。

現時点ではRLSをまだ本格設定していないため、次工程で調整する。

⸻

11. 今回の完成条件

以下が確認できれば完了。

supabase-test.html が開ける
Supabase接続成功と表示される
profiles テーブルへアクセスできる

⸻

12. 次にやること

接続確認が成功したら、次は以下へ進む。

認証実装
↓
ログイン中ユーザー取得
↓
RLS設定
↓
朝ログ保存

⸻

Version: v1.0
Created: 2026-05-29
Status: Draft