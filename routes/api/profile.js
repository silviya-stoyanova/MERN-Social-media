const express = require("express");
const { check, validationResult } = require("express-validator");
const router = express.Router();
const authMiddleware = require("../../middleware/auth-middleware");
const Profile = require("../../models/Profile");

router.get("/me", authMiddleware, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user._id }).populate(
      "user",
      ["name", "avatar"]
    );

    if (!profile) {
      res
        .status(400)
        .json({ message: "This user doesn't have a profile yet." });
    }

    res.json({ profile });
  } catch ({ message }) {
    res.status(500).json({ message });
  }
});

router.post(
  "/me",
  [
    authMiddleware,
    [
      check("status", "Status is required.").notEmpty(),
      check("skills", "Skills are required.").notEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    res.json(req.body)
    try {
    } catch (err) {}
  }
);

module.exports = router;
