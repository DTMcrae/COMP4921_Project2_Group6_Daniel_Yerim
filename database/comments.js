const db = include("databaseConnection");

async function getComments(thread_id) {
  let getCommentSQL = `
    WITH RECURSIVE CommentHierarchy AS (
    SELECT c.comment_id, c.thread_id, c.user_id, c.text, c.likes, c.created_date, c.parent_id, 
    0 AS depth,
    CAST(c.comment_id AS CHAR(100)) AS order_key  -- Base order_key is the comment's ID
    FROM comments c
    WHERE c.thread_id = ? AND c.parent_id IS NULL

    UNION ALL

    SELECT c.comment_id, c.thread_id, c.user_id, c.text, c.likes, c.created_date, 
    c.parent_id, ch.depth + 1,
    CONCAT(ch.order_key, '-', c.comment_id) AS order_key  -- Append child ID to parent's order_key
    FROM comments c
    INNER JOIN CommentHierarchy ch ON c.parent_id = ch.comment_id
    WHERE c.thread_id = ?
    )

    SELECT ch.comment_id, ch.user_id, u.username, ch.text, ch.likes, ch.created_date, ch.depth, 
    pi.cloudinary_url
    FROM CommentHierarchy ch
    LEFT JOIN profile_images pi ON ch.user_id = pi.profile_id
    LEFT JOIN user u ON ch.user_id = u.user_id
    ORDER BY ch.order_key;  -- Sort by hierarchical order_key
    `;

  try {
    const results = await db.query(getCommentSQL, [thread_id, thread_id]);

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
        SELECT 'comment' AS type, c.comment_id, c.thread_id, c.user_id, c.text, c.likes, c.created_date, c.parent_id, t.title
        FROM comments AS c
        JOIN thread AS t ON t.thread_id = c.thread_id
        WHERE MATCH(c.text) AGAINST(? IN NATURAL LANGUAGE MODE)
    `;
    const [results] = await db.query(searchThreadsQuery, [searchWithWildcard]);
    return results;
  } catch (error) {
    console.error("Error executing search query:", error);
    throw error;
  }
}

async function toggleLikeComment(postData) {
  const toggleLikeSQL = `
    INSERT INTO user_likes (user_id, entity_id, entity_type, is_like)
    VALUES (?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE is_like = VALUES(is_like);
  `;
  const deleteLikeSQL = `
    DELETE FROM user_likes WHERE user_id = ? AND entity_id = ? AND entity_type = 'comment';
  `;
  const selectLikesSQL = `
    SELECT likes FROM comments WHERE comment_id = ?;
  `;
  const selectCurrentStatusSQL = `
    SELECT is_like FROM user_likes WHERE user_id = ? AND entity_id = ? AND entity_type = 'comment';
  `;
  const updateLikesSQL = `
    UPDATE comments SET likes = likes + ? WHERE comment_id = ?;
  `;

  try {
    // Step 1: Check current like/dislike status
    const [currentStatusResult] = await db.query(selectCurrentStatusSQL, [
      postData.user_id,
      postData.entity_id,
    ]);

    const currentStatus = currentStatusResult.length
      ? currentStatusResult[0].is_like
      : null;
    const newLikeValue = postData.is_like ? 1 : 0;
    let increment;

    // Step 2: Determine increment and whether to delete the entry
    if (currentStatus === null) {
      // No prior action: +1 for like, -1 for dislike
      increment = postData.is_like ? 1 : -1;
      // Insert or update the like status
      await db.query(toggleLikeSQL, [
        postData.user_id,
        postData.entity_id,
        postData.entity_type,
        postData.is_like,
      ]);
    } else if (currentStatus === newLikeValue) {
      // Unliking or undisliking: -1 for like, +1 for dislike
      increment = postData.is_like ? -1 : 1;
      console.log(
        "Deleting like/dislike for User:",
        postData.user_id,
        "Comment ID:",
        postData.entity_id
      );
      const deleteResult = await db.query(deleteLikeSQL, [
        postData.user_id,
        postData.entity_id,
      ]);
      console.log("Delete Result:", deleteResult);
    } else {
      // Switching from like to dislike or vice versa: ±2
      increment = postData.is_like ? 2 : -2;
      // Update the like status
      await db.query(toggleLikeSQL, [
        postData.user_id,
        postData.entity_id,
        postData.entity_type,
        postData.is_like,
      ]);
    }

    // Step 3: Apply the increment to the likes count
    await db.query(updateLikesSQL, [increment, postData.entity_id]);

    // Step 4: Fetch and return the updated likes count
    const [updateResult] = await db.query(selectLikesSQL, [postData.entity_id]);
    return updateResult[0].likes;
  } catch (error) {
    console.error("Error toggling like on comment:", error);
    throw error;
  }
}

async function getUserLikeStatus(user_id, entity_id, entity_type) {
  const getStatusSQL = `
    SELECT is_like FROM user_likes
    WHERE user_id = ? AND entity_id = ? AND entity_type = ?
  `;

  try {
    const [results] = await db.query(getStatusSQL, [
      user_id,
      entity_id,
      entity_type,
    ]);
    return results.length ? results[0].is_like : null;
  } catch (error) {
    console.error("Error fetching like status:", error);
    throw error;
  }
}

module.exports = {
  getComments,
  addComment,
  getCommentsByUserId,
  deleteComment,
  searchComments,
  toggleLikeComment,
  getUserLikeStatus,
};
