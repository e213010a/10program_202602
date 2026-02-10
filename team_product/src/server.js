/**
 * Base CRUD App - サーバーメインファイル
 *
 * このファイルはサーバー側の処理を担当します。
 * ログはVSCodeのターミナルに表示されます。
 */

const express = require('express')
const { PrismaClient } = require('@prisma/client')
const path = require('path')

const app = express()
const prisma = new PrismaClient()
const PORT = 3000

// ミドルウェア設定
// JSONデータを受け取れるようにする
app.use(express.json())
// 静的ファイル（HTML、CSS、JS）を提供
app.use(express.static(path.join(__dirname, 'public')))

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
app.get('/api/items', async (req, res) => {
  try {
    // DBからアイテムを取得（新しい順）
    const items = await prisma.item.findMany({
      orderBy: { createdAt: 'desc' }
    })

    console.log('[SERVER] アイテム一覧を取得:', items.length, '件')
    res.json(items)
  } catch (error) {
    console.error('[SERVER] エラー:', error)
    res.status(500).json({ error: 'アイテム取得に失敗しました' })
  }
})

/**
 * POST /api/items - アイテム作成
 *
 * IPO:
 * - Input: クライアントからアイテム名（title）を受け取る
 * - Process: DBに新しいアイテムを保存
 * - Output: 作成したアイテムをJSONで返す
 */
app.post('/api/items', async (req, res) => {
  try {
    const { title } = req.body

    // バリデーション（入力チェック）
    if (!title || title.trim() === '') {
      return res.status(400).json({ error: 'タイトルを入力してください' })
    }

    // DBにアイテムを保存（永続化！）
    const item = await prisma.item.create({
      data: { title: title.trim() }
    })

    console.log('[SERVER] アイテムを作成:', item)
    res.status(201).json(item)
  } catch (error) {
    console.error('[SERVER] エラー:', error)
    res.status(500).json({ error: 'アイテム作成に失敗しました' })
  }
})

/**
 * DELETE /api/items/:id - アイテム削除
 *
 * IPO:
 * - Input: URLパラメータからアイテムIDを受け取る
 * - Process: DBから該当アイテムを削除
 * - Output: 成功メッセージを返す
 */
app.delete('/api/items/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id)

    // DBからアイテムを削除
    await prisma.item.delete({
      where: { id }
    })

    console.log('[SERVER] アイテムを削除: ID =', id)
    res.json({ success: true, message: '削除しました' })
  } catch (error) {
    console.error('[SERVER] エラー:', error)
    res.status(500).json({ error: 'アイテム削除に失敗しました' })
  }
})

// =====================================================
// サーバー起動
// =====================================================
app.listen(PORT, () => {
  console.log('='.repeat(50))
  console.log('[SERVER] Base CRUD App 起動中')
  console.log(`[SERVER] URL: http://localhost:${PORT}`)
  console.log('='.repeat(50))
})
