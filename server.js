const connectDB = require("./config/db");
const express = require("express");
const auth = require("./routes/api/auth");
const posts = require("./routes/api/posts");
const profile = require("./routes/api/profile");
const users = require("./routes/api/users");

const app = express();

// connect the database
connectDB();

// init middleware
app.use(express.json({ extended: false }));

app.get("/", (req, res) => res.send("My API works!"));

// Define routes
app.use("/api/auth", auth);
app.use("/api/posts", posts);
app.use("/api/profile", profile);
app.use("/api/users", users);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
