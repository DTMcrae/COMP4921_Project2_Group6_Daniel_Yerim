const auth = require("express").Router();

const mongoSanitize = require("express-mongo-sanitize");
auth.use(mongoSanitize({ replaceWith: "%" }));
auth.use(mongoSanitize({ replaceWith: "%" }));

const Joi = require("joi");
const bcrypt = require("bcrypt");
const saltRounds = 12;
const users = include("database/users");
const expireTime = 60 * 60 * 1000;

function isValidSession(req) {
    if (req.session.authenticated) {
        return true;
    }
    return false;
}

auth.get("/signup", (req, res) => {
    if (isValidSession(req)) {
        return res.redirect("/");
    }
    res.render("signup");
});

auth.get("/login", (req, res) => {
    if (isValidSession(req)) {
        return res.redirect("/");
    }
    const errorMessage = req.query.error || null;
    res.render("login", { errorMessage });
});

auth.get("/logout", (req, res) => {
    req.session.destroy();
    res.redirect("/");
});

auth.post("/signupSubmit", async (req, res) => {
    var username = req.body.username;
    var email = req.body.email;
    var password = req.body.password;

    const schema = Joi.object({
        username: Joi.string().min(3).max(20).required(),
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

    const validationResult = schema.validate({ username, email, password });
    if (validationResult.error != null) {
        const errorMessage = validationResult.error.message;
        console.log(validationResult.error);
        return res.render("signupError", { errorMessage: errorMessage });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const userId = await users.createUser({
            username,
            email,
            hashedPassword,
        });

        req.session.authenticated = true;
        req.session.email = email;
        req.session.userId = userId;
        req.session.cookie.maxAge = expireTime;

        return res.redirect("/");
    } catch (error) {
        console.error("Error inserting user:", error.message);
        return res.render("signupError", {
            errorMessage: "Error creating your account.",
        });
    }
});

auth.post("/loginSubmit", async (req, res) => {
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

            // Save session before redirecting
            req.session.save((err) => {
                if (err) {
                    console.error("Session save error:", err);
                    return res.render("login", {
                        errorMessage: "Internal server error",
                    });
                }

                return res.redirect("/");
            });
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

module.exports = auth;
