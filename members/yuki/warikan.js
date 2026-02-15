// コマンドライン引数から合計金額と人数を取得
const totalAmount = process.argv[2];
const numberOfPeople = process.argv[3];

// 引数が不足している場合のエラーチェック
if (!totalAmount || !numberOfPeople) {
  console.error("使い方: node split_bill.js <合計金額> <人数>");
  console.error("例: node split_bill.js 10000 4");
  process.exit(1);
}

// 文字列を数値に変換
const total = Number(totalAmount);
const people = Number(numberOfPeople);

// 数値として正しいかチェック
if (isNaN(total) || isNaN(people)) {
  console.error("エラー: 合計金額と人数は数値で入力してください");
  process.exit(1);
}

// 人数が0以下でないかチェック
if (people <= 0) {
  console.error("エラー: 人数は1以上で入力してください");
  process.exit(1);
}

// 合計金額が負でないかチェック
if (total < 0) {
  console.error("エラー: 合計金額は0以上で入力してください");
  process.exit(1);
}

// 一人当たりの金額を計算
const perPerson = total / people;

// 結果を出力（小数点以下を四捨五入）
console.log("========================================");
console.log(`合計金額: ${total.toLocaleString()}円`);
console.log(`人数: ${people}人`);
console.log("========================================");
console.log(`一人当たり: ${Math.round(perPerson).toLocaleString()}円`);

// node members/yuki/todo.js 10000 4
// ========================================
// 合計金額: 10,000円
// 人数: 4人
// ========================================
// 一人当たり: 2,500円
