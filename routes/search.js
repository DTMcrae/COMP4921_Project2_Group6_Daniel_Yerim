const router = require("express").Router();
const threadsDB = include("database/threads");
const commentsDB = include("database/comments");

router.post("/search_threads", async (req, res) => {
  const searchTerm = req.body.query;

  try {
    const threads = await threadsDB.searchThreads(searchTerm);
    const comments = await commentsDB.searchComments(searchTerm);
    console.log("Threads:", threads);
    console.log("Comments:", comments);
    res.json({ threads, comments });
  } catch (err) {
    console.error("Error fetching search results:", err);
    res.status(500).json({ error: "Failed to retrieve search results" });
  }
});

module.exports = router;
