const db = include("databaseConnection");

async function getComments(thread_id) {
  let getCommentSQL = `
    WITH RECURSIVE CommentHierarchy AS (
    SELECT c.comment_id, c.thread_id, c.user_id, c.text, c.likes, c.created_date, c.parent_id, 
    0 AS depth,
    CAST(c.comment_id AS CHAR(100)) AS order_key  -- Base order_key is the comment's ID
    FROM comments c
    WHERE c.thread_id = 1 AND c.parent_id IS NULL

    UNION ALL

    SELECT c.comment_id, c.thread_id, c.user_id, c.text, c.likes, c.created_date, 
    c.parent_id, ch.depth + 1,
    CONCAT(ch.order_key, '-', c.comment_id) AS order_key  -- Append child ID to parent's order_key
    FROM comments c
    INNER JOIN CommentHierarchy ch ON c.parent_id = ch.comment_id
    WHERE c.thread_id = 1
    )

    SELECT ch.comment_id, ch.user_id, u.username, ch.text, ch.likes, ch.created_date, ch.depth, 
    pi.cloudinary_url
    FROM CommentHierarchy ch
    LEFT JOIN profile_images pi ON ch.user_id = pi.profile_id
    LEFT JOIN user u ON ch.user_id = u.user_id
    ORDER BY ch.order_key;  -- Sort by hierarchical order_key
    `;

  let params = {
    threadid: thread_id,
  };

  try {
    const results = await db.query(getCommentSQL, params);

    const comments = results[0];

    if (comments) {
      console.log("User received comments " + JSON.stringify(comments));
      return comments;
    } else {
      throw new Error("Failed to get comments");
    }
  } catch (err) {
    console.log("Error getting comments");
    console.log(err);
    return false;
  }
}

async function addComment(thread_id, user_id, text, parent_id = null) {
  let addCommentSQL = `
    INSERT INTO comments (thread_id, user_id, text, parent_id)
    VALUES (?, ?, ?, ?);
    `;

  let params = [thread_id, user_id, text, parent_id];

  try {
    const result = await db.query(addCommentSQL, params);
    return result[0].insertId; // Returns the new comment's ID
  } catch (err) {
    console.log("Error adding comment:", err);
    return false;
  }
}

async function getCommentsByUserId(user_id) {
  let getCommentSQL = `
    SELECT c.*, t.title
    FROM comments AS c
    JOIN thread AS t on t.thread_id = c.thread_id
    WHERE c.user_id = ?;
    `;

  try {
    const results = await db.query(getCommentSQL, [user_id]);
    const comments = results[0];

    if (comments.length > 0) {
      return comments;
    } else {
      throw new Error("Failed to get comments");
    }
  } catch (err) {
    console.log("Error getting comments.");
    console.log(err);
    return false;
  }
}

async function deleteComment(commentId) {
  let deleteCommentSQL = `
  DELETE FROM comments WHERE comment_id = ?;
    `;

  try {
    const results = await db.query(deleteCommentSQL, [commentId]);
    return results;
  } catch (err) {
    console.log("Error deleting Comment.");
    console.log(err);
    return false;
  }
}

async function searchComments(searchTerm) {
  try {
    const searchWithWildcard = `*${searchTerm}*`;

    const searchThreadsQuery = `
        SELECT 'comment' AS type, comment_id, thread_id, user_id, text, likes, created_date, parent_id
        FROM comments
        WHERE MATCH(text) AGAINST(? IN BOOLEAN MODE)
    `;
    const [results] = await db.query(searchThreadsQuery, [searchWithWildcard]);
    return results;
  } catch (error) {
    console.error("Error executing search query:", error);
    throw error;
  }
}

module.exports = {
  getComments,
  addComment,
  getCommentsByUserId,
  deleteComment,
  searchComments,
};
