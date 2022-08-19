const express = require("express");
const config = require("config");
const jwtSecretkey = config.get("jwtSecretKey");

const bcrypt = require("bcrypt");
const gravatar = require("gravatar");
const jwt = require("jsonwebtoken");

const { check, validationResult } = require("express-validator");

const router = express.Router();
const UserModelInstance = require("../../models/User");
const User = require("../../models/User");

// get all users
router.get("/", async (req, res) => {
  const allUsers = await UserModelInstance.find();
  res.send(allUsers);
});

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
    check(
      "password",
      "Password is required. It should have a minimum lenght of 6 symbols."
    ).isLength({ min: 6 }),
  ],
  async (req, res) => {
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

      // return jwt to log the user immediatelly
      // res.send("User route - post");
      const payload = {
        user: {
          id: newUser.id,
        },
      };

      jwt.sign(payload, jwtSecretkey, { expiresIn: "1000d" }, (err, jwt) => {
        if (err) {
          res
            .status(400)
            .json({
              message:
                "Something went wrong when generating JWT. Error message: " +
                err.message,
            });
        }

        res.json({ token: jwt });
      });
    } catch (err) {
      console.log(err.message);
      res.status(500).json({ errors: err.message });
    }
  }
);

module.exports = router;
