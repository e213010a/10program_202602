/**
 * Base App - クライアント側JavaScript
 *
 * このコードはブラウザ上で動作します。
 * ログはブラウザのF12（開発者ツール）に表示されます。
 *
 * 現在の機能: Create（追加）、Read（一覧表示）、Search（検索）、Update（編集）、Complete（完了）、Delete（削除）
 */

// =====================================================
// DOM要素の取得
// =====================================================
const titleInput = document.getElementById("titleInput");
const addButton = document.getElementById("addButton");
const searchButton = document.getElementById("searchButton");
const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const searchStartButton = document.getElementById("searchStartButton");
const itemList = document.getElementById("itemList");
const emptyMessage = document.getElementById("emptyMessage");
let currentSearchKeyword = "";
let activeSearchToken = 0;

// ページ読み込み時にログ出力
console.log("[CLIENT] ページが読み込まれました");

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
  console.log("[CLIENT] アイテム一覧を取得中...");

  try {
    // サーバーにリクエスト（この時点でServer層に処理が移る）
    const response = await fetch("/api/items");
    const items = await response.json();

    console.log("[CLIENT] 取得完了:", items.length, "件");

    // 画面を更新
    renderItems(items, "");
  } catch (error) {
    console.error("[CLIENT] エラー:", error);
    alert("アイテムの取得に失敗しました");
  }
}

/**
 * アイテムを検索して表示
 *
 * IPO:
 * - Input: 検索文字列keyword
 * - Process: サーバーへ検索リクエスト → DBで部分一致検索
 * - Output: 一致したアイテムのみ表示
 */
async function searchItems(keyword, token = activeSearchToken) {
  console.log("[CLIENT] アイテムを検索:", keyword);

  try {
    const response = await fetch(
      `/api/items/search?keyword=${encodeURIComponent(keyword)}`,
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }

    const items = await response.json();

    if (token !== activeSearchToken || currentSearchKeyword !== keyword) {
      return;
    }

    renderItems(items, currentSearchKeyword);
    console.log("[CLIENT] 検索完了:", items.length, "件");
  } catch (error) {
    console.error("[CLIENT] エラー:", error);
    alert("検索に失敗しました: " + error.message);
  }
}

/**
 * 現在の表示条件で一覧を再取得
 *
 * IPO:
 * - Input: なし
 * - Process: 検索中なら検索、通常時は全件取得
 * - Output: 最新一覧を表示
 */
async function refreshItems() {
  if (currentSearchKeyword) {
    await searchItems(currentSearchKeyword, activeSearchToken);
    return;
  }

  await loadItems();
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
  const name = titleInput.value.trim();

  // 入力チェック（Client側のバリデーション）
  if (!name) {
    alert("nameを入力してください");
    return;
  }

  console.log("[CLIENT] アイテムを追加:", name);

  try {
    // サーバーにPOSTリクエスト
    const response = await fetch("/api/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: name }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }

    // 入力欄をクリア
    titleInput.value = "";

    // 一覧を再読み込み
    await refreshItems();

    console.log("[CLIENT] 追加完了");
  } catch (error) {
    console.error("[CLIENT] エラー:", error);
    alert("追加に失敗しました: " + error.message);
  }
}

// =====================================================
// Complete機能
// =====================================================

/**
 * アイテムの完了をトグル
 *
 * IPO:
 * - Input: チェックボックスクリック（アイテムID）
 * - Process: サーバーにPATCHリクエスト → DB更新
 * - Output: 一覧を再読み込み（完了itemは下に表示）
 */
async function completeItem(id) {
  console.log('[CLIENT] アイテムを完了切替: ID =', id)

  try {
    const response = await fetch(`/api/items/${id}/complete`, {
      method: 'PATCH'
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error)
    }

    await refreshItems()
    console.log('[CLIENT] 完了切替完了')
  } catch (error) {
    console.error('[CLIENT] エラー:', error)
    alert('完了切替に失敗しました: ' + error.message)
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
  const name = nameInput.value.trim();

  if (!name) {
    alert("nameを入力してください");
    return;
  }

  console.log("[CLIENT] アイテムを更新:", id, name);

  try {
    const response = await fetch(`/api/items/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }

    await refreshItems();
    console.log("[CLIENT] 更新完了");
  } catch (error) {
    console.error("[CLIENT] エラー:", error);
    alert("更新に失敗しました: " + error.message);
  }
}

/**
 * 削除確認モーダルを表示
 *
 * IPO:
 * - Input: なし
 * - Process: はい / いいえ の選択を待つ
 * - Output: ユーザー選択をbooleanで返す
 */
function showDeleteConfirm() {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.className = "confirm-overlay";

    const dialog = document.createElement("div");
    dialog.className = "confirm-dialog";

    const message = document.createElement("p");
    message.className = "confirm-message";
    message.textContent = "削除してもよろしいですか？";

    const buttonArea = document.createElement("div");
    buttonArea.className = "confirm-actions";

    const yesButton = document.createElement("button");
    yesButton.className = "item-button confirm-yes-button";
    yesButton.textContent = "はい";

    const noButton = document.createElement("button");
    noButton.className = "item-button confirm-no-button";
    noButton.textContent = "いいえ";

    const closeDialog = (result) => {
      document.body.removeChild(overlay);
      resolve(result);
    };

    yesButton.addEventListener("click", () => closeDialog(true));
    noButton.addEventListener("click", () => closeDialog(false));
    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) {
        closeDialog(false);
      }
    });

    buttonArea.appendChild(yesButton);
    buttonArea.appendChild(noButton);
    dialog.appendChild(message);
    dialog.appendChild(buttonArea);
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
  });
}

/**
 * アイテムを削除
 *
 * IPO:
 * - Input: 削除対象のid
 * - Process: 確認後にDELETEリクエストでServerへ削除要求 → DB削除
 * - Output: 更新後一覧を再描画
 */
async function deleteItem(id) {
  const shouldDelete = await showDeleteConfirm();
  if (!shouldDelete) {
    console.log("[CLIENT] 削除をキャンセル:", id);
    return;
  }

  console.log("[CLIENT] アイテムを削除:", id);

  try {
    const response = await fetch(`/api/items/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }

    await refreshItems();
    console.log("[CLIENT] 削除完了");
  } catch (error) {
    console.error("[CLIENT] エラー:", error);
    alert("削除に失敗しました: " + error.message);
  }
}

// =====================================================
// 画面描画関数
// =====================================================

/**
 * アイテム一覧を画面に描画
 */
function renderItems(items, keyword = "") {
  // リストをクリア
  itemList.innerHTML = "";

  // 空メッセージの表示/非表示
  emptyMessage.style.display = items.length === 0 ? "block" : "none";

  // 未完了を上、完了を下に並び替え
  const sorted = [...items].sort((a, b) => a.completed - b.completed)

  // 各アイテムを描画
  sorted.forEach(item => {
    const li = document.createElement('li')
    li.className = item.completed ? 'item item-completed' : 'item'

    const checkbox = document.createElement('input')
    checkbox.type = 'checkbox'
    checkbox.className = 'item-checkbox'
    checkbox.checked = item.completed
    checkbox.addEventListener('change', () => completeItem(item.id))

    const nameText = createHighlightedTitleElement(item.title, keyword);

    const actions = document.createElement("div");
    actions.className = "item-actions";

    const editButton = document.createElement("button");
    editButton.className = "item-button edit-button";
    editButton.textContent = "編集";
    editButton.addEventListener("click", () => {
      const nameInput = document.createElement("input");
      nameInput.type = "text";
      nameInput.className = "edit-input";
      nameInput.value = item.title;

      const doneButton = document.createElement("button");
      doneButton.className = "item-button done-button";
      doneButton.textContent = "完了";
      doneButton.addEventListener("click", () => {
        updateItem(item.id, nameInput);
      });

      actions.innerHTML = "";
      li.replaceChild(nameInput, nameText);
      actions.appendChild(doneButton);
      nameInput.focus();
    });

    const deleteButton = document.createElement("button");
    deleteButton.className = "item-button delete-button";
    deleteButton.textContent = "削除";
    deleteButton.addEventListener("click", () => {
      deleteItem(item.id);
    });

    actions.appendChild(editButton)
    actions.appendChild(deleteButton)
    li.appendChild(checkbox)
    li.appendChild(nameText)
    li.appendChild(actions)
    itemList.appendChild(li)
  })
}

/**
 * タイトル中の部分一致箇所をマーカー表示
 *
 * IPO:
 * - Input: タイトル文字列と検索文字列
 * - Process: 一致箇所を抽出してマーカー要素を構築
 * - Output: 描画用のspan要素を返す
 */
function createHighlightedTitleElement(title, keyword) {
  const titleElement = document.createElement("span");
  titleElement.className = "item-title";

  if (!keyword) {
    titleElement.textContent = title;
    return titleElement;
  }

  const lowerTitle = title.toLowerCase();
  const lowerKeyword = keyword.toLowerCase();
  let startIndex = 0;

  while (startIndex < title.length) {
    const matchIndex = lowerTitle.indexOf(lowerKeyword, startIndex);

    if (matchIndex === -1) {
      titleElement.appendChild(document.createTextNode(title.slice(startIndex)));
      break;
    }

    if (matchIndex > startIndex) {
      titleElement.appendChild(
        document.createTextNode(title.slice(startIndex, matchIndex)),
      );
    }

    const marker = document.createElement("span");
    marker.className = "highlight-marker";
    marker.textContent = title.slice(matchIndex, matchIndex + keyword.length);
    titleElement.appendChild(marker);
    startIndex = matchIndex + keyword.length;
  }

  return titleElement;
}

/**
 * 検索フォーム表示を切り替え
 *
 * IPO:
 * - Input: 検索ボタン押下
 * - Process: フォームを開閉、閉じる時は一覧を通常表示へ戻す
 * - Output: 画面表示を更新
 */
async function toggleSearchForm() {
  const isHidden = searchForm.classList.contains("hidden");

  if (isHidden) {
    searchForm.classList.remove("hidden");
    searchInput.focus();
    return;
  }

  searchForm.classList.add("hidden");
  searchInput.value = "";
  currentSearchKeyword = "";
  activeSearchToken += 1;
  await loadItems();
}

/**
 * 検索開始
 *
 * IPO:
 * - Input: 検索ボックスの文字列
 * - Process: 検索APIを呼び出す
 * - Output: 一致データのみ表示
 */
async function startSearch() {
  const keyword = searchInput.value.trim();

  if (!keyword) {
    alert("検索文字列を入力してください");
    return;
  }

  currentSearchKeyword = keyword;
  activeSearchToken += 1;
  await searchItems(keyword, activeSearchToken);
}

// =====================================================
// イベントリスナー
// =====================================================

// 追加ボタンクリック
addButton.addEventListener("click", addItem);
searchButton.addEventListener("click", toggleSearchForm);
searchStartButton.addEventListener("click", startSearch);

// Enterキーで追加
titleInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    addItem();
  }
});

searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    startSearch();
  }
});

// =====================================================
// 初期化
// =====================================================

// ページ読み込み時にアイテム一覧を取得
loadItems();
