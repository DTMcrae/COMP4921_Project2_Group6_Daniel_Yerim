const router = require("express").Router();

// const cloudinary = require("cloudinary").v2;

// cloudinary.config({
//     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//     api_key: process.env.CLOUDINARY_CLOUD_KEY,
//     api_secret: process.env.CLOUDINARY_CLOUD_SECRET,
// });

const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const mongoSanitize = require("express-mongo-sanitize");
router.use(mongoSanitize({ replaceWith: "%" }));
router.use(mongoSanitize({ replaceWith: "%" }));

const db_utils = include("database/db_utils");

module.exports = router;
