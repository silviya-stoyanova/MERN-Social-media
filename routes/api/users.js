const express = require("express");
const bcrypt = require("bcrypt");
const gravatar = require("gravatar");
const { check, validationResult } = require("express-validator");

const router = express.Router();
const UserModelInstance = require("../../models/User");
const User = require("../../models/User");

// get all users
router.get("/", (req, res) => res.send("User route - get"));

// register new user
router.post(
  "/", // address
  [
    // middleware validation
    check("name", "Name is required.").notEmpty(),
    check(
      "email",
      "Email is required. It should be in the format: email@domain.topleveldomain"
    ).isEmail(),
    check("password", "Password is required.").isLength({ min: 6 }),
  ],
  async (req, res) => {
    // response
    // console.log(req.body);

    // return jwt to log the user immediatelly

    // validate user input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      // check if this email is already registered
      const emailIsTaken = await UserModelInstance.findOne({ email });

      if (emailIsTaken) {
        res.status(400).json({ errors: "This email is already registered." });
      }

      // get user's gravatar
      const avatar = gravatar.url(email, {
        s: "200", // size
        r: "pg", // rating
        d: "mm", // show a default image even when the user doesn't have a gravatar
      });

      // encrypt password
      const salt = await bcrypt.genSalt(10);
      const enctyptedPassword = await bcrypt.hash(password, salt);

      const newUser = new User({
        name,
        email,
        password: enctyptedPassword,
        avatar,
      });

      await newUser.save();

      res.send("User route - post");
    } catch (err) {
      console.log(err.message);
      res.status(500).json({ errors: err.message });
    }
  }
);

module.exports = router;
