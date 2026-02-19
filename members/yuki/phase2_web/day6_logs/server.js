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
