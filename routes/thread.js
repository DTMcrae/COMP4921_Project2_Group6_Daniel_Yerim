const router = require("express").Router();

const threadDB = include("database/threads");
const commentDB = include("database/comments");

router.get("/thread/:id", async (req, res) => {

  const thread_id = req.params.id;

  console.log("Thread ID: " + thread_id);

  const thread = await threadDB.getThread(thread_id);

  if(!thread) {
    res.render("404");
    return;
  }

  const comments = await commentDB.getComments(thread_id);

  let loggedIn = req.session.authenticated;
  let user_id = req.session.userId;
  let owner = false;

  res.render("thread", {loggedIn: loggedIn, user_id:user_id, owner: owner, thread: thread, comments:comments});
});

router.post("/thread/:id/addComment", async (req, res) => {
  const thread_id = req.params.id;
  const { user_id, text, parent_id } = req.body;

  console.log("Parent: " + parent_id);

  if (!text || !user_id) {
    res.status(400).send("Text and user_id are required.");
    return;
  }

  const newCommentId = await commentDB.addComment(
    thread_id,
    user_id,
    text,
    parent_id || null
  );
  if (newCommentId) {
    res.redirect(`/thread/${thread_id}`);
  } else {
    res.status(500).send("Failed to add comment");
  }
});

module.exports = router;
