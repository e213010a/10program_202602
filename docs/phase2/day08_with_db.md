# Day 8: Client + Server + DB — データをDBに保存する（Create）

## 学習目標

- データベース（SQLite）にデータを永続的に保存する方法を学ぶ
- 3層すべてを通るデータの流れ（Client → Server → DB）を理解する
- ORM（Prisma）の基本的な使い方を学ぶ

## ファイル構成とレイヤーの対応

```
day8_with_db/
├── server.js                ← Server: API処理 + DB操作
├── package.json             ← npm の設定ファイル
├── public/
│   └── index.html           ← Client: 画面表示 + データ送信
└── prisma/
    ├── schema.prisma        ← DB定義: テーブルの構造を定義  【Day 8 で新規追加】
    └── dev.db               ← Database: データが保存されるファイル（自動生成）【Day 8 で新規追加】
```

| ファイル | レイヤー | 確認場所 | 役割 |
|---------|---------|---------|------|
| `public/index.html` | Client（ブラウザ） | F12 Console | 画面表示、データ送信 |
| `server.js` | Server（Node.js） | VS Code ターミナル | API処理、Prisma を使った DB 操作 |
| `prisma/schema.prisma` | DB定義 | — | テーブルの構造（カラム名、型）を定義 |
| `prisma/dev.db` | Database（SQLite） | Prisma Studio | データが物理的に保存されるファイル |

> Day 7 と比べて、`prisma/` フォルダが追加された。Server がデータを受け取った後、変数ではなく **DBファイルに保存** する。

## AIへのプロンプト（IPOカード形式）

以下のIPOカードをコピーしてAIに渡し、コードを生成させる。

> **IPOカード — Day 8: Client + Server + DB（メッセージ保存 — Create）**
>
> | 層 | Input (きっかけ) | Process (処理) | Output (結果) |
> |----|-----------------|---------------|--------------|
> | **Client** | ユーザーが名前とメッセージを入力し「送信」ボタンをクリック | JavaScript が入力値を取得し、`fetch` で Server（`POST /api/messages`）にデータを送信する | Console に送信ログが表示される。入力欄がクリアされる |
> | **Server** | Client から `POST /api/messages` で名前・メッセージのJSONデータを受け取る | Prisma を使って、受け取ったデータを Database の `Message` テーブルに INSERT する | ターミナルに保存ログが出力される。Client に `{ success: true, message: {...} }` を返す |
> | **Database** | Server（Prisma）から INSERT 命令を受け取る | `Message` テーブルに新しい行（レコード）を追加する。`id` と `createdAt` は自動生成 | 保存したレコード（id, name, content, createdAt）を Server に返す |
>
> **ファイル構成:**
> - `day8_with_db/public/index.html`（Client層）
> - `day8_with_db/server.js`（Server層）
> - `day8_with_db/prisma/schema.prisma`（DB定義）
> - `day8_with_db/prisma/dev.db`（Database — migrate 後に自動生成）
>
> **prisma/schema.prisma の仕様:**
> - Message モデル: id（自動採番）、name（文字列）、content（文字列）、createdAt（日時、自動生成）
>
> **server.js の仕様:**
> - Express サーバー（ポート3000）
> - PrismaClient を使ってDBにアクセスする
> - `POST /api/messages` エンドポイント: name と content を受け取り、DBに保存する
> - 保存時に `console.log` で `[SERVER]` プレフィックス付きのログを出す
> - 成功時に保存したデータを返す
>
> **public/index.html の仕様:**
> - 名前とメッセージの2つの入力欄と「送信」ボタン
> - `fetch` で `POST /api/messages` にデータを送信する
> - `console.log` で `[CLIENT]` プレフィックス付きのログを出す
>
> **データの流れ:**
> ```
> ユーザー入力 → [Client: fetch POST] → [Server: Prismaで保存命令] → [DB: ファイルに書き込み]
>                      ↓                         ↓                            ↓
>               F12 Console             VS Code ターミナル              prisma/dev.db に保存
>                                                                   （Prisma Studio で確認）
> ```

## 準備・実行

### プロジェクト準備

```bash
mkdir -p day8_with_db
cd day8_with_db
npm init -y
npm install express @prisma/client
npm install -D prisma
npx prisma init --datasource-provider sqlite
```

> `npx prisma init` を実行すると `prisma/schema.prisma` が自動生成される。

### schema 定義後に実行するコマンド

AIが `prisma/schema.prisma` を生成した後、以下を実行する。

```bash
npx prisma migrate dev --name init
```

> このコマンドで `prisma/dev.db` ファイルが作成される。これがデータベースの実体。

### 実行方法

```bash
node server.js
```

ブラウザで `http://localhost:3000` を開く。

## ファイルの確認

AIがコードを生成したら、以下を確認する。

- [ ] 以下の4つのファイル/フォルダが存在するか？
  - `public/index.html`（Client）
  - `server.js`（Server）
  - `prisma/schema.prisma`（DB定義）
  - `prisma/dev.db`（Database ファイル — migrate 後に生成）
- [ ] `server.js` の中で `PrismaClient` を使っているか？
- [ ] `server.js` の中で `prisma.message.create()` でDBに保存しているか？
- [ ] Day 7 のように配列（変数）に保存するコードは**ないか**？

## 実験

### 実験1: メッセージを送信して3か所で確認する

メッセージを送信した後、**3つの場所** でデータを確認する。

| 確認場所 | 確認方法 | 何が見えるか |
|---------|---------|------------|
| ブラウザ F12 Console | F12 → Console タブ | `[CLIENT] ...` 送信ログ |
| VS Code ターミナル | サーバー実行中のターミナル | `[SERVER] ...` DB保存ログ |
| Prisma Studio | 別ターミナルで `npx prisma studio` を実行 | テーブルにレコードが追加されている |

Prisma Studio の開き方:
```bash
# サーバーとは別のターミナルを開いて実行
npx prisma studio
```
ブラウザで `http://localhost:5555` が開き、DBの中身を直接見ることができる。

### 実験2: サーバーを再起動する

1. メッセージを3件送信する
2. Prisma Studio で3件のレコードを確認する
3. ターミナルで **Ctrl+C** を押してサーバーを停止する
4. `node server.js` でサーバーを再起動する
5. Prisma Studio でDBの中身を確認する

## 実験レポート

`day8_report.md` として保存し、コミットすること。

```
実験1: メッセージを送信して3か所で確認する
  F12 Console に表示されたログ:（実験後に書く）
  ターミナルに表示されたログ:（実験後に書く）
  Prisma Studio で見えたデータ:（実験後に書く）

実験2: サーバーを再起動する
  予想:（実験前に書く — サーバーを再起動したらデータはどうなると思うか？Day 7 と同じか？）
  結果:（実験後に書く — Prisma Studio でデータは残っていたか）
  わかったこと:（なぜ Day 7 と違う結果になったかの考察）
```

## 完了条件

- [ ] メッセージがDBに保存される（Prisma Studio で確認）
- [ ] F12 Console、ターミナル、Prisma Studio の3か所でデータを確認した
- [ ] サーバー再起動後もDBのデータが残ることを確認した
- [ ] 実験レポート（`day8_report.md`）を提出した
- [ ] コミット＆プッシュ完了
