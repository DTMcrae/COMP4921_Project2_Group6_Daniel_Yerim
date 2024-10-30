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
      errorMessage: "An error occurred while retrieving user information.",
    });
  }
});

module.exports = router;
