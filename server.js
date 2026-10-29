const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const session = require("express-session");
//const dns = require("node:dns");
const dotenv = require("dotenv");
const methodOverride = require("method-override");

dotenv.config();

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));

app.use(session({
  secret: process.env.SESSION_SECRET || "culinary-judge-secret",
  resave: false,
  saveUninitialized: false
}));
app.use((req, res, next) => {
  console.log("URL:", req.originalUrl);
  console.log("Session ID:", req.sessionID);
  console.log("User ID:", req.session.userId);
  console.log("Role:", req.session.role);
  next();
});
app.use((req, res, next) => {
  if (req.session.userId && req.session.role) {
    res.locals.currentUser = {
      _id: req.session.userId,
      role: req.session.role
    };
  } else {
    res.locals.currentUser = null;
  }

  next();
});

//dns.setServers(["1.1.1.1", "8.8.8.8"]);

const competitorsRouter = require("./routes/competitors");
const authRouter = require("./routes/auth");
const adminRouter = require("./routes/admin");
const judgeRouter = require("./routes/judge");
const evaluationsRouter = require("./routes/evaluations");

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.log("MongoDB connection error:", error);
  });

mongoose.connection.on("connected", () => {
  console.log(`Connected to MongoDB ${mongoose.connection.name}.`);
});

app.use(express.static(path.join(__dirname, "public")));


app.use("/auth", authRouter);
app.use("/admin", adminRouter);
app.use("/judge", judgeRouter);
app.use("/competitors", competitorsRouter);
app.use("/evaluations", evaluationsRouter);




app.get("/", (req, res) => {
  res.render("index");
});


app.get("/about", (req, res) => {
  res.render("about");
});

module.exports = app;