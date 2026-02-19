const fs = require('fs');
const path = require('path');

// 前回の出目を保存するファイル
const SAVE_FILE = path.join(__dirname, 'last_roll.json');

// 前回の出目を読み込む
function loadLastRoll() {
  if (!fs.existsSync(SAVE_FILE)) return null;
  const data = JSON.parse(fs.readFileSync(SAVE_FILE, 'utf8'));
  return data.lastRoll;
}

// 今回の出目を保存する
function saveLastRoll(roll) {
  fs.writeFileSync(SAVE_FILE, JSON.stringify({ lastRoll: roll }), 'utf8');
}

// サイコロを振る（1〜6の乱数）
const currentRoll = Math.floor(Math.random() * 6) + 1;
const previousRoll = loadLastRoll();

// 今回の出目を保存
saveLastRoll(currentRoll);

// 結果を表示
console.log('========================================');
console.log(`前回の出目: ${previousRoll !== null ? previousRoll : 'なし（初回）'}`);
console.log(`今回の出目: ${currentRoll}`);
console.log('========================================');
