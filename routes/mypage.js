const router = require("express").Router();

const users = include("database/users");
const db_utils = include("database/db_utils");

router.get("/mypage", async (req, res) => {
    if (!req.session.authenticated) {
        return res.redirect("/login");
    }

    try {
        const userId = req.session.userId;
        const userInfo = await users.getUserInfo(userId);

        if (!userInfo.length) {
            return res.render("mypage", {
                errorMessage: "Failed to retrieve user information.",
            });
        }

        res.render("mypage", { user: userInfo[0] });
    } catch (error) {
        console.error("Error retrieving user information:", error);
        res.render("mypage", {
            errorMessage:
                "An error occurred while retrieving user information.",
        });
    }
});

router.get("/create", (req, res) => {
    if (!req.session.authenticated) {
        return res.redirect("/login");
    }

    res.render("create");
});

router.post("/create/addPost", async (req, res) => {
    const { title, description } = req.body;

    if (!title || !description) {
        return res.status(400).send("Title and description are required.");
    }

    const postData = {
        title,
        description,
        user_id: req.session.userId,
    };

    try {
        const result = await db_utils.addPost(postData);
        console.log("Post created successfully:", result.insertId);
        res.redirect("/mypage");
    } catch (error) {
        console.error("Error adding post:", error);
        res.status(500).send("Error creating post.");
    }
});

module.exports = router;
