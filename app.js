// ℹ️ Gets access to environment variables/settings
// https://www.npmjs.com/package/dotenv
require("dotenv").config();

// ℹ️ Connects to the database
require("./db");

// Handles http requests (express is node js framework)
// https://www.npmjs.com/package/express
const express = require("express");
const { isAuthenticated } = require("./middleware/jwt.middleware");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");

app.use(express.json({ limit: "15mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "15mb" }));
app.use(cors());

// ℹ️ This function is getting exported from the config folder. It runs most pieces of middleware
require("./config")(app);

const authRouter = require("./routes/auth.routes");
app.use("/auth", authRouter);

// 👇 Start handling routes here
const indexRoutes = require("./routes/index.routes");
app.use("/api", indexRoutes);

const userRouter = require("./routes/user.routes");
app.use("/", isAuthenticated, userRouter);

const postRouter = require("./routes/post.routes");
app.use("/",isAuthenticated, postRouter);

// ❗ To handle errors. Routes that don't exist or errors that you handle in specific routes
require("./error-handling")(app);

module.exports = app;
