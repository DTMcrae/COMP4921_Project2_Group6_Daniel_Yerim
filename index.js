require("./utils.js");

require("dotenv").config();
const express = require("express");

const session = require("express-session");
const url = require("url");
// const Joi = require("joi");

// const bcrypt = require("bcrypt");
// const saltRounds = 12;
const MongoStore = require("connect-mongo");

const port = process.env.PORT || 3000;

const app = express();
const router = include("routes/router");
const auth = include("routes/auth");
const mypage = include("routes/mypage");
const thread = include("routes/thread");
const search = include("routes/search");

/* secret information section */
const mongodb_host = process.env.MONGODB_HOST;
const mongodb_user = process.env.MONGODB_USER;
const mongodb_password = process.env.MONGODB_PASSWORD;
const mongodb_session_secret = process.env.MONGODB_SESSION_SECRET;

//database connection
const db_utils = include("database/db_utils");

//checking database connection
db_utils.printMySQLVersion();

app.set("view engine", "ejs");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

var mongoStore = MongoStore.create({
  mongoUrl: `mongodb+srv://${mongodb_user}:${mongodb_password}@${mongodb_host}/sessions`,
  crypto: {
    secret: mongodb_session_secret,
  },
});

app.use(
  session({
    secret: process.env.MONGODB_SESSION_SECRET,
    store: mongoStore, //default is memory store
    saveUninitialized: false,
    resave: true,
  })
);
const navLinks = [
  { name: "Home", link: "/" },
  { name: "Create", link: "/create", requiresLogin: true },
  { name: "Login", link: "/login", requiresLogin: false },
  { name: "Signup", link: "/signup", requiresLogin: false },
  { name: "Logout", link: "/logout", requiresLogin: true },
  {
    name: "My Profile",
    link: "/mypage",
    icon: "bx bxs-user-account",
    requiresLogin: true,
  },
];

function sessionValidation(req, res, next) {
  if (isValidSession(req)) {
    next();
  } else {
    res.redirect("/login");
  }
}

//middle ware
app.use("/", (req, res, next) => {
  app.locals.navLinks = navLinks;
  app.locals.currentURL = url.parse(req.url).pathname;
  res.locals.loggedIn = req.session.authenticated || false;
  res.locals.errorMessage = null;
  next();
});

app.get("/", async (req, res) => {
  const loggedIn = req.session.authenticated || false;

  try {
    const recentThreads = await db_utils.getRecentThreads();
    const likedThreads = await db_utils.getLikedThreads();

    res.render("index", {
      recentThreads: recentThreads,
      likedThreads: likedThreads,
    });
  } catch (error) {
    console.error("Error fetching threads:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.use(express.static(__dirname + "/public"));
app.use("/", router);
app.use("/", auth);
app.use("/", mypage);
app.use("/", thread);
app.use("/", search);
app.get("*", (req, res) => {
  res.status(404);
  res.render("404");
});

app.listen(port, () => {
  console.log("Node application listening on port " + port);
});
