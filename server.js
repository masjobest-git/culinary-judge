const express = require("express");
const mongoose = require("mongoose"); //MONGOOSE baza
const path = require('path');
const app = express();
const session = require('express-session');

// EJS
app.set("view engine", "ejs");

app.use(session({
  secret: process.env.SESSION_SECRET || 'culinary-judge-secret',
  resave: false,
  saveUninitialized: false
}));
const dns = require("node:dns");
const dotenv = require("dotenv");
const competitorsRouter = require('./routes/competitors');
const authRouter = require('./routes/auth');
const adminRouter = require('./routes/admin');
const judgeRouter = require('./routes/judge');
require('dotenv').config();
//const morgan = require("morgan");
const methodOverride = require("method-override");
dns.setServers(["1.1.1.1", "8.8.8.8"]);
//const Listing = require("./models/listing");

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use('/auth', authRouter);
app.use('/admin', adminRouter);
app.use('/judge', judgeRouter);
app.use('/competitors', competitorsRouter);
//MONGOOSE DB conection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.log("MongoDB connection error:", error);
  });

mongoose.connection.on('connected', () => {
  console.log(`Connected to MongoDB ${mongoose.connection.name}.`);
});

// Static files
app.use(express.static(path.join(__dirname, 'public')));


// Home route
app.get('/', (req, res) => {
  res.render('index');
});

// Server
app.listen(3000, () => {
  console.log('The app is running on port 3000');
});