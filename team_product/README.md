# Base CRUD App

ハッカソン用のベースアプリケーションです。
このアプリを改造して、独自のプロダクトを作ってください。

## セットアップ

```bash
# 依存パッケージのインストール
npm install

# データベースの初期化
npm run db:setup

# サーバー起動
npm start
```

## 機能

- **Create**: アイテムを追加
- **Read**: アイテム一覧を表示
- **Delete**: アイテムを削除

## ファイル構成

```
team_product/
├── package.json          # プロジェクト設定
├── prisma/
│   └── schema.prisma     # DBスキーマ定義
├── database/             # SQLiteファイル格納
└── src/
    ├── server.js         # サーバー側コード
    └── public/
        ├── index.html    # クライアント側HTML
        └── style.css     # スタイルシート
```

## 3層構造

```
Client (ブラウザ)  →  Server (Node.js)  →  Database (SQLite)
   index.html          server.js             app.db
```

## ハッカソンでの拡張例

- カテゴリ分け機能
- 優先度設定
- 期限設定
- 検索機能
- 完了/未完了の切り替え
