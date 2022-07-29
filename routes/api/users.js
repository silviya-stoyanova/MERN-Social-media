const e = require("express");
const express = require("express");
const router = express.Router();

router.get("/", (req, res) => res.send("get users"));

module.exports = router;
