const router = require("express").Router();
const db_utils = include("database/db_utils");

router.post("/search_threads", async (req, res) => {
  const searchTerm = req.body.query;

  try {
    const results = await db_utils.searchThreads(searchTerm);
    res.json({ results });
  } catch (err) {
    console.error("Error fetching search results:", err);
    res.status(500).json({ error: "Failed to retrieve search results" });
  }
});

module.exports = router;
