
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const session = require("express-session");
const dns = require("node:dns");
const dotenv = require("dotenv");
const methodOverride = require("method-override");

dotenv.config();

const app = express();

// EJS
app.set("view engine", "ejs");

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));

app.use(session({
  secret: process.env.SESSION_SECRET || "culinary-judge-secret",
  resave: false,
  saveUninitialized: false
}));

// DNS
dns.setServers(["1.1.1.1", "8.8.8.8"]);

// Routes
const competitorsRouter = require("./routes/competitors");
const authRouter = require("./routes/auth");
const adminRouter = require("./routes/admin");
const judgeRouter = require("./routes/judge");
const evaluationsRouter = require("./routes/evaluations");

// Static files
app.use(express.static(path.join(__dirname, "public")));

// Application routes
app.use("/auth", authRouter);
app.use("/admin", adminRouter);
app.use("/judge", judgeRouter);
app.use("/competitors", competitorsRouter);
app.use("/evaluations", evaluationsRouter);

// MongoDB connection
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

// Home route
app.get("/", (req, res) => {
  res.render("index");
});

// About route
app.get("/about", (req, res) => {
  res.render("about");
});

// Server
app.listen(3000, () => {
  console.log("The app is running on port 3000");
});
