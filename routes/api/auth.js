const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middleware/auth");
const User = require("../../models/User");

router.get("/", authMiddleware, async (req, res) => {
  // get the user data

  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch ({ message }) {
    res.status(500).json({ message });
  }
});

module.exports = router;
