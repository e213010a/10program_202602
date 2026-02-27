/**
 * Base App - サーバーメインファイル
 *
 * このファイルはサーバー側の処理を担当します。
 * ログはVSCodeのターミナルに表示されます。
 *
 * 現在の機能: Create（追加）、Read（一覧表示）、Search（検索）、Update（編集）、Complete（完了）、Delete（削除）
 */

const express = require("express");
const { PrismaClient } = require("@prisma/client");
const path = require("path");

const app = express();
const prisma = new PrismaClient();
const PORT = 3000;

// ミドルウェア設定
// JSONデータを受け取れるようにする
app.use(express.json());
// 静的ファイル（HTML、CSS、JS）を提供
app.use(express.static(path.join(__dirname, "public")));

// =====================================================
// API エンドポイント（ここがServer層の処理）
// =====================================================

/**
 * GET /api/items - アイテム一覧取得
 *
 * IPO:
 * - Input: なし（ページ読み込み時に自動で呼ばれる）
 * - Process: DBからアイテムを全件取得
 * - Output: アイテム一覧をJSONで返す
 */
app.get("/api/items", async (req, res) => {
  try {
    // DBからアイテムを取得（新しい順）
    const items = await prisma.item.findMany({
      orderBy: { createdAt: "desc" },
    });

    console.log("[SERVER] アイテム一覧を取得:", items.length, "件");
    res.json(items);
  } catch (error) {
    console.error("[SERVER] エラー:", error);
    res.status(500).json({ error: "アイテム取得に失敗しました" });
  }
});

/**
 * GET /api/items/search - アイテム検索
 *
 * IPO:
 * - Input: クライアントから検索文字列（keyword）を受け取る
 * - Process: DBでtitleがkeywordを部分一致するデータを検索
 * - Output: 該当するアイテム一覧をJSONで返す
 */
app.get("/api/items/search", async (req, res) => {
  try {
    const keyword = String(req.query.keyword ?? "").trim();

    if (!keyword) {
      return res.status(400).json({ error: "検索文字列を入力してください" });
    }

    const items = await prisma.item.findMany({
      where: {
        title: {
          contains: keyword,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    console.log("[SERVER] アイテムを検索:", keyword, items.length, "件");
    res.json(items);
  } catch (error) {
    console.error("[SERVER] エラー:", error);
    res.status(500).json({ error: "検索に失敗しました" });
  }
});

/**
 * POST /api/items - アイテム作成
 *
 * IPO:
 * - Input: クライアントからアイテム名（title）を受け取る
 * - Process: DBに新しいアイテムを保存
 * - Output: 作成したアイテムをJSONで返す
 */
app.post("/api/items", async (req, res) => {
  try {
    const { title } = req.body;

    // バリデーション（入力チェック）
    if (!title || title.trim() === "") {
      return res.status(400).json({ error: "タイトルを入力してください" });
    }

    // DBにアイテムを保存（永続化！）
    const item = await prisma.item.create({
      data: { title: title.trim() },
    });

    console.log("[SERVER] アイテムを作成:", item);
    res.status(201).json(item);
  } catch (error) {
    console.error("[SERVER] エラー:", error);
    res.status(500).json({ error: "アイテム作成に失敗しました" });
  }
});

/**
 * PUT /api/items/:id - アイテム編集
 *
 * IPO:
 * - Input: クライアントからidとnameを受け取る
 * - Process: 対象idのtitleをDB上で更新
 * - Output: 更新したアイテムをJSONで返す
 */
app.put("/api/items/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, title } = req.body;
    const nextName = (name ?? title ?? "").trim();

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "不正なidです" });
    }

    if (!nextName) {
      return res.status(400).json({ error: "nameを入力してください" });
    }

    const item = await prisma.item.update({
      where: { id },
      data: { title: nextName },
    });

    console.log("[SERVER] アイテムを更新:", item);
    res.json(item);
  } catch (error) {
    console.error("[SERVER] エラー:", error);
    res.status(500).json({ error: "アイテム更新に失敗しました" });
  }
});

/**
 * DELETE /api/items/:id - アイテム削除
 *
 * IPO:
 * - Input: クライアントからidを受け取る
 * - Process: 対象idのデータをDB上から削除
 * - Output: 削除したアイテムをJSONで返す
 */
app.delete("/api/items/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "不正なidです" });
    }

    const item = await prisma.item.delete({
      where: { id },
    });

    console.log("[SERVER] アイテムを削除:", item);
    res.json(item);
  } catch (error) {
    console.error("[SERVER] エラー:", error);

    if (error.code === "P2025") {
      return res.status(404).json({ error: "対象データが見つかりません" });
    }

    res.status(500).json({ error: "アイテム削除に失敗しました" });
  }
});

/**
 * PATCH /api/items/:id/complete - アイテム完了
 *
 * IPO:
 * - Input: URLパラメータからアイテムIDを受け取る
 * - Process: 対象idのcompletedをDB上でトグル（true/false）
 * - Output: 更新したアイテムをJSONで返す
 */
app.patch('/api/items/:id/complete', async (req, res) => {
  try {
    const id = Number(req.params.id)

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: '不正なidです' })
    }

    // 現在のcompletedを取得してトグル
    const current = await prisma.item.findUnique({ where: { id } })
    if (!current) {
      return res.status(404).json({ error: 'アイテムが見つかりません' })
    }

    const item = await prisma.item.update({
      where: { id },
      data: { completed: !current.completed }
    })

    console.log('[SERVER] アイテムを完了切替:', item)
    res.json(item)
  } catch (error) {
    console.error('[SERVER] エラー:', error)
    res.status(500).json({ error: 'アイテム完了に失敗しました' })
  }
})
// =====================================================
// サーバー起動
// =====================================================
app.listen(PORT, () => {
  console.log("=".repeat(50));
  console.log("[SERVER] Base App 起動中");
  console.log(`[SERVER] URL: http://localhost:${PORT}`);
  console.log("=".repeat(50));
});
