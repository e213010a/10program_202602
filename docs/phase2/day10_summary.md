# Day 10: 永続化の証明 — 全てを再起動する

## 学習目標

- データベースによる永続化を最終確認する
- Phase 1（揮発性）と Phase 2（永続性）の違いを整理する
- 3層構造の全体像を自分の言葉で説明できるようになる

## 実験

### 実験1: 永続化の最終確認

以下の手順を実行し、**データが消えないこと** を確認する。

1. ゲストブックにメッセージを3件以上登録する
2. サーバーを停止する（Ctrl+C）
3. **PCを再起動する**（または数時間後に再開）
4. `node server.js` でサーバーを起動する
5. ブラウザで `http://localhost:3000` を開く
6. メッセージが残っているか確認する

### Day 6〜9 の比較表

| 項目 | Day 6 (Client のみ) | Day 7 (Client + Server) | Day 8-9 (Client + Server + DB) |
|------|---------------------|------------------------|-------------------------------|
| データ保存場所 | ブラウザの変数 | サーバーの変数 | SQLite ファイル |
| ページ更新後 | **消える** | 残る（サーバーが動いていれば） | **残る** |
| サーバー再起動後 | — | **消える** | **残る** |
| PC再起動後 | **消える** | **消える** | **残る** |
| 永続性 | 揮発性 | 揮発性 | **永続性** |

### ファイルとレイヤーの対応 総まとめ

```
day8_with_db/
│
├── public/
│   └── index.html           → Client（ブラウザ）
│                               ・ユーザー操作を受け付ける
│                               ・fetch でサーバーにデータを送る（Create）
│                               ・fetch でサーバーからデータを取得する（Read）
│                               ・取得したデータを画面に表示する
│                               ・確認場所: F12 Console
│
├── server.js                → Server（Node.js）
│                               ・Client からのリクエストを受け付ける
│                               ・Prisma を使って DB にデータを保存する（Create）
│                               ・Prisma を使って DB からデータを取得する（Read）
│                               ・結果を JSON で Client に返す
│                               ・確認場所: VS Code ターミナル
│
└── prisma/
    ├── schema.prisma        → DB定義
    │                           ・テーブルの構造（カラム名、型）を定義する
    │                           ・人間が読んで「どんなデータが保存されるか」を理解する
    │
    └── dev.db               → Database（SQLite）
                                ・データが物理的に保存されるファイル
                                ・サーバーを止めてもPCを再起動しても消えない
                                ・確認場所: Prisma Studio
```

### データフロー 総まとめ

```
【Create（書き込み）の流れ → → →】

  ユーザーが入力
       ↓
  [Client: index.html]
  fetch POST /api/messages でサーバーに送信
       ↓                                         F12 Console で確認
  [Server: server.js]
  prisma.message.create() で DB に保存命令
       ↓                                         ターミナルで確認
  [DB: dev.db]
  Message テーブルにレコードを追加
                                                  Prisma Studio で確認


【Read（読み取り）の流れ ← ← ←】

  ページを開く
       ↓
  [Client: index.html]
  fetch GET /api/messages でサーバーにリクエスト
       ↓
  [Server: server.js]
  prisma.message.findMany() で DB から取得命令
       ↓
  [DB: dev.db]
  Message テーブルから全レコードを取得
       ↓
  [Server: server.js]
  取得したデータを JSON で Client に返す
       ↓                                         ターミナルで確認
  [Client: index.html]
  受け取ったデータを画面のリストに表示
                                                  F12 Console + 画面で確認
```

## 実験レポート

`day10_report.md` として保存し、コミットすること。

```
実験1: 永続化の最終確認（PC再起動後）
  予想:（実験前に書く — PC再起動後、データは残っていると思うか？）
  結果:（実験後に書く — メッセージは表示されたか）
  わかったこと:（なぜデータが残ったか / 消えたかの考察）

Phase 2 全体のまとめ:
  Phase 1 のToDoリストはなぜデータが消えたか:
  Phase 2 のゲストブックはなぜデータが残るか:
  Client、Server、DB それぞれの役割（1文ずつ）:
  Create（書き込み）のデータの流れ:
  Read（読み取り）のデータの流れ:
```

## 完了条件

- [ ] PC再起動後もデータが残ることを確認した
- [ ] Day 6〜9 の比較表の違いを説明できる
- [ ] 各ファイルがどのレイヤーに対応するか説明できる
- [ ] 実験レポート（`day10_report.md`）を提出した
