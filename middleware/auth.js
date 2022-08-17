const jwt = require("jsonwebtoken");
const config = require("config");
const jwtSecretKey = config.get("jwtSecretKey");

module.exports = function (req, res, next) {
  const token = req.header("x-auth-token");

  if (!token) {
    return res.status(400).json({ message: "Authorization token is missing!" });
  }

  try {
    const decodedToken = jwt.verify(token, jwtSecretKey);
    req.user = decodedToken.user;
    next(); // call the next middleware
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
