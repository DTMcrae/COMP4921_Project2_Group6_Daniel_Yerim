const router = require("express").Router();

const threadDB = include("database/threads");
const commentDB = include("database/comments");

router.get("/thread/:id", async (req, res) => {
  const thread_id = req.params.id;
  const user_id = req.session.userId;

  const thread = await threadDB.getThread(thread_id);
  if (!thread) {
    res.render("404");
    return;
  }

  const comments = await commentDB.getComments(thread_id);

  const threadLikeStatus = await threadDB.getUserLikeStatus(
    user_id,
    thread_id,
    "thread"
  );
  const commentLikeStatuses = await Promise.all(
    comments.map(async (comment) => ({
      ...comment,
      likeStatus: await commentDB.getUserLikeStatus(
        user_id,
        comment.comment_id,
        "comment"
      ),
    }))
  );

  console.log("Thread Liked: " + threadLikeStatus);
  console.log("Comment Liked: " + JSON.stringify(commentLikeStatuses[0]));

  res.render("thread", {
    loggedIn: req.session.authenticated,
    user_id,
    owner: false,
    thread,
    comments: commentLikeStatuses,
    threadLikeStatus,
  });
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

router.post("/thread/:id/like", async (req, res) => {
  const thread_id = req.params.id;
  const { is_like } = req.body;

  const postData = {
    user_id: req.session.userId,
    entity_id: thread_id,
    entity_type: "thread",
    is_like: is_like,
  }

  try {
    const updatedLikes = await threadDB.toggleLikeThread(postData);
    res.json({ success: true, updatedLikes });
  } catch (error) {
    console.error("Error liking thread:", error);
    res.status(500).json({ success: false });
  }
});

router.post("/comment/:id/like", async (req, res) => {
  const comment_id = req.params.id;
  const { is_like } = req.body;

  const postData = {
    user_id: req.session.userId,
    entity_id: comment_id,
    entity_type: "comment",
    is_like: is_like,
  };

  try {
    const updatedLikes = await commentDB.toggleLikeComment(postData);
    console.log("Backend likes: " + updatedLikes);
    res.json({ success: true, updatedLikes });
  } catch (error) {
    console.error("Error liking comment:", error);
    res.status(500).json({ success: false });
  }
});

router.get("/getUserLikeStatus", async (req, res) => {
  const { user_id, entity_id, entity_type } = req.query;

  try {
    const likeStatus = await threadDB.getUserLikeStatus(
      user_id,
      entity_id,
      entity_type
    );
    res.json({ likeStatus }); // true if liked, false if disliked, null if no action
  } catch (error) {
    console.error("Error fetching like status:", error);
    res.status(500).json({ success: false });
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
    const result = await threadDB.addPost(postData);
    res.redirect("/thread");
  } catch (error) {
    console.error("Error adding post:", error);
    res.status(500).send("Error creating post.");
  }
});

router.post("/deleteThread/:thread_id", async (req, res) => {
  const thread_id = req.params.thread_id;

  try {
    await threadDB.deleteThread(thread_id);
    res.json({ success: true, message: "Thread deleted successfully" });
  } catch (error) {
    console.error("Error deleting Thread:", error);
    res.status(500).json({ success: false, message: "Database error" });
  }
});

router.post("/deleteComment/:comment_id", async (req, res) => {
  const comment_id = req.params.comment_id;
  console.log("Comment ID: " + comment_id);

  try {
    await commentDB.deleteComment(comment_id);
    res.json({ success: true, message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Error deleting Comment:", error);
    res.status(500).json({ success: false, message: "Database error" });
  }
});

module.exports = router;
