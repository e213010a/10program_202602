/**
 * Base App - クライアント側JavaScript
 *
 * このコードはブラウザ上で動作します。
 * ログはブラウザのF12（開発者ツール）に表示されます。
 *
 * 現在の機能: Create（追加）、Read（一覧表示）、Update（編集）
 */

// =====================================================
// DOM要素の取得
// =====================================================
const titleInput = document.getElementById('titleInput')
const addButton = document.getElementById('addButton')
const itemList = document.getElementById('itemList')
const emptyMessage = document.getElementById('emptyMessage')

// ページ読み込み時にログ出力
console.log('[CLIENT] ページが読み込まれました')

// =====================================================
// API呼び出し関数
// =====================================================

/**
 * アイテム一覧を取得して表示
 *
 * IPO:
 * - Input: なし
 * - Process: サーバーからアイテム一覧を取得
 * - Output: 画面にアイテムを表示
 */
async function loadItems() {
  console.log('[CLIENT] アイテム一覧を取得中...')

  try {
    // サーバーにリクエスト（この時点でServer層に処理が移る）
    const response = await fetch('/api/items')
    const items = await response.json()

    console.log('[CLIENT] 取得完了:', items.length, '件')

    // 画面を更新
    renderItems(items)
  } catch (error) {
    console.error('[CLIENT] エラー:', error)
    alert('アイテムの取得に失敗しました')
  }
}

/**
 * アイテムを追加
 *
 * IPO:
 * - Input: テキストボックスのname
 * - Process: サーバーにPOSTリクエスト → DB保存
 * - Output: 一覧を再読み込み
 */
async function addItem() {
  const name = titleInput.value.trim()

  // 入力チェック（Client側のバリデーション）
  if (!name) {
    alert('nameを入力してください')
    return
  }

  console.log('[CLIENT] アイテムを追加:', name)

  try {
    // サーバーにPOSTリクエスト
    const response = await fetch('/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: name })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error)
    }

    // 入力欄をクリア
    titleInput.value = ''

    // 一覧を再読み込み
    await loadItems()

    console.log('[CLIENT] 追加完了')
  } catch (error) {
    console.error('[CLIENT] エラー:', error)
    alert('追加に失敗しました: ' + error.message)
  }
}

// =====================================================
// Update機能
// =====================================================

/**
 * アイテム名（name）を更新
 *
 * IPO:
 * - Input: 編集ボタン押下後に入力されたname
 * - Process: PUTリクエストでServerへ編集要求 → DB更新
 * - Output: 更新後一覧を再描画
 */
async function updateItem(id, nameInput) {
  const name = nameInput.value.trim()

  if (!name) {
    alert('nameを入力してください')
    return
  }

  console.log('[CLIENT] アイテムを更新:', id, name)

  try {
    const response = await fetch(`/api/items/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error)
    }

    await loadItems()
    console.log('[CLIENT] 更新完了')
  } catch (error) {
    console.error('[CLIENT] エラー:', error)
    alert('更新に失敗しました: ' + error.message)
  }
}

// =====================================================
// 画面描画関数
// =====================================================

/**
 * アイテム一覧を画面に描画
 */
function renderItems(items) {
  // リストをクリア
  itemList.innerHTML = ''

  // 空メッセージの表示/非表示
  emptyMessage.style.display = items.length === 0 ? 'block' : 'none'

  // 各アイテムを描画
  items.forEach(item => {
    const li = document.createElement('li')
    li.className = 'item'

    const nameText = document.createElement('span')
    nameText.className = 'item-title'
    nameText.textContent = item.title

    const actions = document.createElement('div')
    actions.className = 'item-actions'

    const editButton = document.createElement('button')
    editButton.className = 'item-button edit-button'
    editButton.textContent = '編集'
    editButton.addEventListener('click', () => {
      const nameInput = document.createElement('input')
      nameInput.type = 'text'
      nameInput.className = 'edit-input'
      nameInput.value = item.title

      const doneButton = document.createElement('button')
      doneButton.className = 'item-button done-button'
      doneButton.textContent = '完了'
      doneButton.addEventListener('click', () => {
        updateItem(item.id, nameInput)
      })

      actions.innerHTML = ''
      li.replaceChild(nameInput, nameText)
      actions.appendChild(doneButton)
      nameInput.focus()
    })

    actions.appendChild(editButton)
    li.appendChild(nameText)
    li.appendChild(actions)
    itemList.appendChild(li)
  })
}

// =====================================================
// イベントリスナー
// =====================================================

// 追加ボタンクリック
addButton.addEventListener('click', addItem)

// Enterキーで追加
titleInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    addItem()
  }
})

// =====================================================
// 初期化
// =====================================================

// ページ読み込み時にアイテム一覧を取得
loadItems()
