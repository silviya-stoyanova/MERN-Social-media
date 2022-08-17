const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middleware/auth");
const bcrypt = require("bcrypt");
const User = require("../../models/User");
const { check, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");

const config = require("config");
const jwtSecretKey = config.get("jwtSecretKey");

router.get("/", authMiddleware, async (req, res) => {
  // get the user data

  try {
    const user = await User.findById(req.user._id).select("-password");
    res.json({user});
  } catch ({ message }) {
    res.status(500).json({ message });
  }
});

router.post(
  "/",
  [
    check("name", "Name is reqired").notEmpty(),
    check("password", "Password is reqired").exists(),
  ],
  async (req, res) => {
    const { email: emailFromInput, password: passwordFromInput } = req.body;

    try {
      const user = await User.findOne({ email: emailFromInput });
      if (!user) {
        return res.status(401).send("Email or password is invalid.");
      }

      // check the password
      const isPasswordCorrect = await bcrypt.compare(
          passwordFromInput,
          user.password
      );

      if (!isPasswordCorrect) {
        return res.status(401).send("Email or password is invalid.");
      }

      const payload = { user };

      jwt.sign(payload, jwtSecretKey, { expiresIn: "1000d" }, (err, jwt) => {
        if (err) {
          return res.status(500).json({
            message:
              "Something went wrong when generating JWT. Error message: " +
              err.message,
          });
        }

        res.send(jwt);
      });
    } catch ({ message }) {
      return res.status(500).json({ message });
    }
  }
);

module.exports = router;
