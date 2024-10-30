const router = require("express").Router();

const users = include("database/users");
// const db_utils = include("database/db_utils");

const cloudinary = require("cloudinary").v2;
const multer = require("multer");
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_CLOUD_KEY,
  api_secret: process.env.CLOUDINARY_CLOUD_SECRET,
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get("/mypage", async (req, res) => {
  if (!req.session.authenticated) {
    return res.redirect("/login");
  }

  try {
    const userId = req.session.userId;
    const userInfo = await users.getUserInfo(userId);
    console.log("User Info:", userInfo);

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

router.post(
  "/upload_profile_photo",
  upload.single("file"),
  async (req, res) => {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, error: "No file uploaded." });
    }

    try {
      // Upload the image to Cloudinary
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream((error, result) => {
          if (error) {
            console.error("Cloudinary upload error:", error);
            return reject("Cloudinary upload failed.");
          }
          resolve(result);
        });

        stream.end(req.file.buffer);
      });

      const imgURL = result.secure_url;
      console.log("Image uploaded to Cloudinary:", imgURL);

      const userId = req.session.userId;
      const user = await users.getUserInfo(userId);

      if (user.profile_id) {
        await users.updateProfileImage(user.profile_id, imgURL);
      } else {
        const profileId = await users.addProfileImage(imgURL);
        await users.updateUserProfileId(userId, profileId);
      }

      res.json({ success: true, url: imgURL });
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

module.exports = router;
