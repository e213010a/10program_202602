# Day 7: Client + Server — データをサーバーに送る

## 学習目標

- Client（ブラウザ）から Server（Node.js）にデータを送る方法を学ぶ
- データが **2つの場所**（F12 Console と ターミナル）に現れることを確認する
- `fetch` によるHTTP通信の基本を理解する

## ファイル構成とレイヤーの対応

```
day7_client_server/
├── server.js          ← Server（Node.js）: ターミナルで動く 【Day 7 で新規追加】
├── package.json       ← npm の設定ファイル（npm init で自動生成）
└── public/
    └── index.html     ← Client（ブラウザ）: ブラウザで動く
```

| ファイル | レイヤー | 確認場所 | 役割 |
|---------|---------|---------|------|
| `public/index.html` | Client（ブラウザ） | F12 Console | ユーザー操作の受付、サーバーへのデータ送信 |
| `server.js` | Server（Node.js） | VS Code ターミナル | Client からのデータ受信、データの一時保存 |

> Day 6 と比べて、`server.js` が追加された。データの流れが Client → Server に広がる。

## AIへのプロンプト（IPOカード形式）

以下のIPOカードをコピーしてAIに渡し、コードを生成させる。

> **IPOカード — Day 7: Client + Server（メッセージ送信）**
>
> | 層 | Input (きっかけ) | Process (処理) | Output (結果) |
> |----|-----------------|---------------|--------------|
> | **Client** | ユーザーがメッセージを入力し「送信」ボタンをクリック | JavaScript が入力値を取得し、`fetch` で Server（`POST /api/messages`）にデータを送信する | Console に送信ログが表示される。画面に「送信しました」と表示される |
> | **Server** | Client から `POST /api/messages` でメッセージデータ（JSON）を受け取る | 受け取ったデータをターミナルに表示し、配列に保存する | Client に `{ success: true }` をJSONで返す |
>
> **ファイル構成:**
> - `day7_client_server/public/index.html`（Client層）
> - `day7_client_server/server.js`（Server層）
>
> **server.js の仕様:**
> - Express を使った Node.js サーバー（ポート3000）
> - `public/` フォルダの静的ファイルを配信する
> - `POST /api/messages` エンドポイント: Client からメッセージ（JSON）を受け取り、サーバーの配列に保存する
> - 受信時に `console.log` でデータを表示する（`[SERVER]` プレフィックス）
> - 成功時に `{ success: true }` を返す
>
> **public/index.html の仕様:**
> - テキスト入力欄と「送信」ボタンがある
> - ボタンをクリックすると `fetch` で `POST /api/messages` にデータを送信する
> - 送信前後に `console.log` でログを出す（`[CLIENT]` プレフィックス）
> - 送信完了後、画面に「送信しました」と表示する
>
> **データの流れ:**
> ```
> ユーザー入力 → [Client: fetch POST で送信] → [Server: データを受信、配列に保存]
>                      ↓                                  ↓
>               F12 Console で確認                VS Code ターミナルで確認
> ```

## 準備・実行

### プロジェクト準備

```bash
mkdir -p day7_client_server
cd day7_client_server
npm init -y
npm install express
```

> `npm init -y` で `package.json` が作られる。`npm install express` で Express（Webサーバーのライブラリ）がインストールされる。

### 実行方法

```bash
node server.js
```

ブラウザで `http://localhost:3000` を開く。

> Day 6 と違い、HTMLファイルを直接開くのではなく、サーバー経由でアクセスする。

## ファイルの確認

AIがコードを生成したら、以下を確認する。

- [ ] `server.js` と `public/index.html` の2ファイルがあるか？
- [ ] `server.js` は Server レイヤー（ターミナルで動く）のコードか？
- [ ] `public/index.html` は Client レイヤー（ブラウザで動く）のコードか？
- [ ] Client は `fetch` でサーバーにデータを送っているか？
- [ ] Server は `console.log` で受信データを表示しているか？
- [ ] データベース関連のコードは含まれていないか？

## 実験

### 実験1: メッセージを送信する

1. **ターミナル** で `node server.js` を実行
2. **ブラウザ** で `http://localhost:3000` を開く
3. **F12キー** → **Console タブ** を開く
4. メッセージを入力して「送信」をクリック
5. **2つの場所でログを確認する:**

| 確認場所 | 表示されるログ | 意味 |
|---------|--------------|------|
| ブラウザの F12 Console | `[CLIENT] ...` | Client（ブラウザ）側の処理 |
| VS Code のターミナル | `[SERVER] ...` | Server（Node.js）側の処理 |

### 実験2: サーバーを再起動する

1. メッセージを3つ送信する
2. ターミナルでデータが3件保存されていることを確認する
3. ターミナルで **Ctrl+C** を押してサーバーを停止する
4. `node server.js` でサーバーを再起動する
5. ターミナルを確認する

## 実験レポート

`day7_report.md` として保存し、コミットすること。

```
実験1: メッセージを送信する
  F12 Console に表示されたログ:（実験後に書く）
  ターミナルに表示されたログ:（実験後に書く）
  なぜログが2か所に表示されるか:（考察を書く）

実験2: サーバーを再起動する
  予想:（実験前に書く — サーバーを再起動したらデータはどうなると思うか？）
  結果:（実験後に書く — ターミナルに何が表示されたか、以前のデータはあるか）
  わかったこと:（なぜそうなったかの考察。Day 6 との共通点は何か）
```

## 完了条件

- [ ] Client から送信したデータが Server のターミナルに表示される
- [ ] `[CLIENT]` ログと `[SERVER]` ログが別の場所に出ることを確認した
- [ ] サーバー再起動後にデータが消えることを確認した
- [ ] 実験レポート（`day7_report.md`）を提出した
- [ ] コミット＆プッシュ完了
