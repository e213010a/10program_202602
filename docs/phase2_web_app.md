# 🏗️(工事中)　Phase 2: Web構造と「場所」の理解

## 目的

**クライアント・サーバー・データベースの物理的な場所の違い**と、**データの永続化**を学ぶ。
Phase 1で体験した「消えるデータ」の問題を、データベースで解決する。

---

## 3層構造の理解

```
┌─────────────────┐        ┌─────────────────┐        ┌─────────────────┐
│     Client      │  HTTP  │     Server      │  ORM   │    Database     │
│    (ブラウザ)    │ ────► │    (Node.js)    │ ────► │    (SQLite)     │
│                 │ ◄──── │                 │ ◄──── │                 │
├─────────────────┤        ├─────────────────┤        ├─────────────────┤
│ ログ: F12       │        │ ログ: ターミナル │        │ ファイル保存     │
│ 画面表示        │        │ データ処理      │        │ 永続化          │
└─────────────────┘        └─────────────────┘        └─────────────────┘
```

---

## Day 6: 場所の特定実験 (Logs)

### 学習目標

- ClientとServerの「場所」の違いを理解する
- console.logがどこに出力されるかを確認する

### IPOカード

| 項目        | 内容 |
| ----------- | ---- |
| **Input**   |      |
| **Process** |      |
| **Output**  |      |

### タスク

#### 1. プロジェクト準備

`members/[あなたの名前]/phase2_web/day6_logs/` フォルダを作成

```bash
mkdir -p day6_logs
cd day6_logs
npm init -y
npm install express
```

#### 2. ファイル構成

```
day6_logs/
├── server.js      # サーバー側コード
└── public/
    └── index.html # クライアント側コード
```

#### 3. 実装内容

**server.js**

```javascript
const express = require("express");
const app = express();

// 静的ファイルを提供
app.use(express.static("public"));

// APIエンドポイント
app.get("/api/ping", (req, res) => {
  // ★ここはSERVERのログ（ターミナルに出る）
  console.log("[SERVER] /api/ping が呼ばれました");
  res.json({ message: "pong" });
});

app.listen(3000, () => {
  console.log("[SERVER] http://localhost:3000 で起動中");
});
```

**public/index.html**

```html
<!DOCTYPE html>
<html>
  <head>
    <title>ログの場所実験</title>
  </head>
  <body>
    <h1>ログの場所実験</h1>
    <button onclick="callServer()">サーバーを呼ぶ</button>

    <script>
      // ★ここはCLIENTのログ（F12に出る）
      console.log("[CLIENT] ページが読み込まれました");

      async function callServer() {
        console.log("[CLIENT] ボタンがクリックされました");

        const response = await fetch("/api/ping");
        const data = await response.json();

        console.log("[CLIENT] サーバーからの応答:", data);
      }
    </script>
  </body>
</html>
```

#### 4. 実験手順

1. `node server.js` でサーバー起動
2. ブラウザで `http://localhost:3000` を開く
3. **F12キー**を押して開発者ツールを開く（Consoleタブ）
4. ボタンをクリック
5. **確認ポイント：**
   - `[CLIENT]` はどこに表示されるか？ → **ブラウザのF12**
   - `[SERVER]` はどこに表示されるか？ → **VSCodeのターミナル**

### 完了条件

- [ ] ClientとServerのログが別の場所に出ることを確認した
- [ ] なぜ別の場所に出るか説明できる（物理的に別の場所で動いているから）
- [ ] コミット＆プッシュ完了

---

## Day 7: CLIツール再現「忘れん坊のサイコロ」

### 学習目標

- サーバーサイドでの処理を理解する
- サーバー再起動でデータが消えることを再確認する

### IPOカード

| 項目        | 内容 |
| ----------- | ---- |
| **Input**   |      |
| **Process** |      |
| **Output**  |      |

### タスク

#### 1. プロジェクト準備

`members/[あなたの名前]/phase2_web/day7_dice/` フォルダを作成

#### 2. 機能要件

1. サイコロを振ると1〜6の乱数を返す
2. 前回の出目をサーバーの変数に保存
3. 今回と前回の出目を両方表示

#### 3. 実装のヒント

```javascript
// サーバー側で保持する変数（メモリ上）
let lastRoll = null;

app.get("/api/roll", (req, res) => {
  const previousRoll = lastRoll;
  const currentRoll = Math.floor(Math.random() * 6) + 1;
  lastRoll = currentRoll; // ★次回のために保存

  res.json({
    current: currentRoll,
    previous: previousRoll,
  });
});
```

### 重要な実験

**以下の手順を必ず実行：**

1. サーバーを起動
2. サイコロを3回振る（前回の出目が表示されることを確認）
3. **サーバーを停止（Ctrl+C）**
4. サーバーを再起動
5. サイコロを振る
6. **前回の出目が「null」になっていることを確認**

→ これがPhase 1のToDoリストと同じ「揮発性」の問題です。

### 完了条件

- [ ] サイコロ機能が動作する
- [ ] サーバー再起動後にデータが消えることを確認した
- [ ] 「この問題をどう解決するか」を考えた
- [ ] コミット＆プッシュ完了

---

## Day 8: 不滅のゲストブック (Create)

### 学習目標

- データベースを使った永続化を学ぶ
- ORM（Prisma）の基本的な使い方を学ぶ

### IPOカード

| 項目        | 内容 |
| ----------- | ---- |
| **Input**   |      |
| **Process** |      |
| **Output**  |      |

### タスク

#### 1. プロジェクト準備

`members/[あなたの名前]/phase2_web/day8_guestbook/` フォルダを作成

```bash
mkdir -p day8_guestbook
cd day8_guestbook
npm init -y
npm install express prisma @prisma/client
npx prisma init --datasource-provider sqlite
```

#### 2. Prismaスキーマ設定

`prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}

model Message {
  id        Int      @id @default(autoincrement())
  name      String
  content   String
  createdAt DateTime @default(now())
}
```

#### 3. データベース作成

```bash
npx prisma migrate dev --name init
```

#### 4. 実装内容

**server.js**

```javascript
const express = require("express");
const { PrismaClient } = require("@prisma/client");

const app = express();
const prisma = new PrismaClient();

app.use(express.json());
app.use(express.static("public"));

// メッセージを保存するAPI
app.post("/api/messages", async (req, res) => {
  const { name, content } = req.body;

  // ★ここでデータベースに保存（永続化！）
  const message = await prisma.message.create({
    data: { name, content },
  });

  console.log("[SERVER] メッセージをDBに保存:", message);
  res.json({ success: true, message });
});

app.listen(3000, () => {
  console.log("[SERVER] http://localhost:3000 で起動中");
});
```

### 完了条件

- [ ] フォームからデータを送信できる
- [ ] データがSQLiteファイルに保存される
- [ ] `prisma/dev.db` ファイルが作成されていることを確認
- [ ] コミット＆プッシュ完了

---

## Day 9: 不滅のゲストブック (Read)

### 学習目標

- データベースからのデータ取得を学ぶ
- 保存したデータを画面に表示する

### IPOカード

| 項目        | 内容 |
| ----------- | ---- |
| **Input**   |      |
| **Process** |      |
| **Output**  |      |

### タスク

Day 8のプロジェクトに機能を追加します。

#### 1. サーバーにRead APIを追加

```javascript
// メッセージ一覧を取得するAPI
app.get("/api/messages", async (req, res) => {
  // ★データベースから全件取得
  const messages = await prisma.message.findMany({
    orderBy: { createdAt: "desc" }, // 新しい順
  });

  console.log("[SERVER] DBからメッセージ取得:", messages.length, "件");
  res.json(messages);
});
```

#### 2. クライアント側で表示

```javascript
// ページ読み込み時にメッセージを取得
async function loadMessages() {
  const response = await fetch("/api/messages");
  const messages = await response.json();

  const container = document.getElementById("messages");
  container.innerHTML = messages
    .map(
      (m) => `
    <div class="message">
      <strong>${m.name}</strong>
      <p>${m.content}</p>
      <small>${new Date(m.createdAt).toLocaleString()}</small>
    </div>
  `,
    )
    .join("");
}

// ページ読み込み時に実行
loadMessages();
```

### 完了条件

- [ ] 保存したメッセージが画面に表示される
- [ ] 新しいメッセージを追加すると一覧に反映される
- [ ] コミット＆プッシュ完了

---

## Day 10: 永続化の証明

### 学習目標

- データベースによる永続化を実感する
- Phase 1との違いを理解する

### タスク

#### 1. 永続化実験

以下の手順を実行し、**データが消えないこと**を確認：

1. ゲストブックにメッセージを3件以上登録
2. サーバーを停止（Ctrl+C）
3. **PCを再起動**（または数時間後に再開）
4. サーバーを起動
5. ブラウザでアクセス
6. **メッセージが全て残っていることを確認！**

#### 2. Phase 1との比較

| 項目             | Phase 1 (ToDoリスト) | Phase 2 (ゲストブック) |
| ---------------- | -------------------- | ---------------------- |
| データ保存場所   | 変数（メモリ）       | SQLiteファイル         |
| サーバー再起動後 | **消える**           | **残る**               |
| PC再起動後       | **消える**           | **残る**               |
| 永続性           | 揮発性               | **永続性**             |

#### 3. 振り返り

以下の質問に答えてください：

1. なぜPhase 1のToDoリストはデータが消えたのか？
2. なぜPhase 2のゲストブックはデータが残るのか？
3. データベースを使うメリットは何か？

### 完了条件

- [ ] PC再起動後もデータが残ることを確認した
- [ ] Phase 1との違いを説明できる
- [ ] 永続化の重要性を理解した

---

## Phase 2 チェックリスト

| 日     | タスク                               | 完了 |
| ------ | ------------------------------------ | ---- |
| Day 6  | ログの場所実験（Client vs Server）   | [ ]  |
| Day 7  | 忘れん坊のサイコロ（揮発性の再確認） | [ ]  |
| Day 8  | ゲストブック Create機能              | [ ]  |
| Day 9  | ゲストブック Read機能                | [ ]  |
| Day 10 | 永続化の証明＆振り返り               | [ ]  |

---

## 次のPhaseへ

Phase 2を完了したあなたは、以下を学びました：

- **3層構造の理解** - Client / Server / Database の役割と場所
- **永続化** - データベースを使えばデータは消えない
- **CRUD操作** - Create（作成）とRead（読取）を実装

Phase 3では、**チーム開発**の作法を学びます。
複数人で同じコードを編集するとき、どうやって衝突を避けるか？
Gitのブランチ、プルリクエスト、コンフリクト解決を体験します。
