const express = require("express");
const connectDB = require("./config/db");

const app = express();

connectDB(); // connect the database

app.get("/", (req, res) => res.send("My API works!"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
