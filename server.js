
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const session = require("express-session");
const MongoStore = require("connect-mongo").default;
//const dns = require("node:dns");
const dotenv = require("dotenv");
const methodOverride = require("method-override");

dotenv.config();

// DNS settings
//dns.setServers(["1.1.1.1", "8.8.8.8"]);

const app = express();

app.set("trust proxy", 1);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));

// Check environment variables
if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET is missing from environment variables.");
}

if (!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI is missing from environment variables.");
}

// Session configuration
app.use(
  session({
    name: "culinary.sid",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      collectionName: "sessions"
    }),
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60
    }
  })
);

// Session debugging
app.use((req, res, next) => {
  console.log("URL:", req.originalUrl);
  console.log("Session ID:", req.sessionID);
  console.log("User ID:", req.session.userId);
  console.log("Role:", req.session.role);
  next();
});

// Pass current user to EJS views
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

// Routes
const competitorsRouter = require("./routes/competitors");
const authRouter = require("./routes/auth");
const adminRouter = require("./routes/admin");
const judgeRouter = require("./routes/judge");
const evaluationsRouter = require("./routes/evaluations");

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB:", mongoose.connection.name);
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error.message);
  });

// App routes
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
