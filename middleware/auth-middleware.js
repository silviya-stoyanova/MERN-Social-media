const jwt = require("jsonwebtoken");
const config = require("config");
const User = require("../models/User");
const jwtSecretKey = config.get("jwtSecretKey");

module.exports = async function (req, res, next) {
  const token = req.header("x-auth-token");

  if (!token) {
    return res.status(400).json({ message: "Authorization token is missing!" });
  }

  try {
    const decodedToken = jwt.verify(token, jwtSecretKey);
    const userIsNotDeleted = await User.findById(decodedToken.user._id);

    if (userIsNotDeleted) {
      req.user = decodedToken.user;
      next(); // call the next middleware
    } else {
      res.status(400).send("This user does not exist.");
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
