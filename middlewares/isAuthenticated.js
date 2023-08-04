const jwt = require("jsonwebtoken");

// tokenチェックのためのミドルウェア
function isAuthenticated(req, res, next) {
  // headersからtokenを取得する
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "権限がありません。" });
  }

  jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "権限がありません。" });
    }

    req.userId = decoded.id;

    next();
  });
}

module.exports = isAuthenticated;
