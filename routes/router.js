const router = require("express").Router();

// const multer = require("multer");
// const storage = multer.memoryStorage();
// const upload = multer({ storage: storage });

const mongoSanitize = require("express-mongo-sanitize");
router.use(mongoSanitize({ replaceWith: "%" }));
router.use(mongoSanitize({ replaceWith: "%" }));

const db_utils = include("database/db_utils");

module.exports = router;
