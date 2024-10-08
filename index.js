require("./utils.js");

require("dotenv").config();
const express = require("express");

const session = require("express-session");
const url = require("url");
const Joi = require("joi");

const bcrypt = require("bcrypt");
const saltRounds = 12;
const MongoStore = require("connect-mongo");

const port = process.env.PORT || 3000;

const app = express();
const router = include("routes/router");
const expireTime = 60 * 60 * 1000; //expires after an hour  (hours * minutes * seconds * millis)

/* secret information section */
const mongodb_host = process.env.MONGODB_HOST;
const mongodb_user = process.env.MONGODB_USER;
const mongodb_password = process.env.MONGODB_PASSWORD;
const mongodb_session_secret = process.env.MONGODB_SESSION_SECRET;

//database connection
const db_utils = include("database/db_utils");
const users = include("database/users");
//checking database connection
// db_utils.printMySQLVersion();

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
    { name: "Login", link: "/login" },
    { name: "Signup", link: "/signup" },
    { name: "Logout", link: "/logout" },
];

function isValidSession(req) {
    if (req.session.authenticated) {
        return true;
    }
    return false;
}

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
    res.locals.loggedIn = req.session.email ? true : false;
    res.locals.errorMessage = null;
    next();
});

app.get("/", (req, res) => {
    const loggedIn = req.session.authenticated || false;
    res.render("index", { loggedIn: loggedIn });
});

app.get("/signup", (req, res) => {
    if (isValidSession(req)) {
        return res.redirect("/");
    }
    res.render("signup");
});

app.get("/login", (req, res) => {
    if (isValidSession(req)) {
        return res.redirect("/");
    }
    const errorMessage = req.query.error || null;
    res.render("login", { errorMessage });
});

app.get("/logout", (req, res) => {
    req.session.destroy();
    res.redirect("/");
});

app.post("/signupSubmit", async (req, res) => {
    var email = req.body.email;
    var password = req.body.password;

    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string()
            .min(10)
            .max(20)
            .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/)
            .message(
                "Password must include at least one uppercase letter, one lowercase letter, one number, and one special character"
            )
            .required(),
    });

    const validationResult = schema.validate({ email, password });
    if (validationResult.error != null) {
        const errorMessage = validationResult.error.message;
        console.log(validationResult.error);
        return res.render("signupError", { errorMessage: errorMessage });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const userId = await users.createUser({ email, hashedPassword });

        req.session.authenticated = true;
        req.session.email = email;
        req.session.userId = userId;
        req.session.cookie.maxAge = expireTime;

        return res.redirect("/create");
    } catch (error) {
        console.error("Error inserting user:", error.message);
        return res.render("signupError", {
            errorMessage: "Error creating your account.",
        });
    }
});

app.post("/loginSubmit", async (req, res) => {
    const { email, password } = req.body;

    try {
        const rows = await users.getUserByEmail(email);

        if (rows.length === 0) {
            return res.render("login", {
                errorMessage: "Incorrect email or password",
            });
        }

        const user = rows[0];
        const passwordMatches = await bcrypt.compare(password, user.password);

        if (passwordMatches) {
            req.session.authenticated = true;
            req.session.email = user.email;
            req.session.userId = user.user_id;
            req.session.cookie.maxAge = expireTime;

            console.log("userId: " + req.session.userId);

            return res.redirect("/create");
        } else {
            return res.render("login", {
                errorMessage: "Incorrect password",
            });
        }
    } catch (error) {
        console.error("Login error:", error);
        return res.render("login", { errorMessage: "Internal server error" });
    }
});

app.use(express.static(__dirname + "/public"));
app.use("/", router);
app.get("*", (req, res) => {
    res.status(404);
    res.render("404");
});

app.listen(port, () => {
    console.log("Node application listening on port " + port);
});
