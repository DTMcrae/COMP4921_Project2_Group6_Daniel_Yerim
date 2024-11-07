const db = include("databaseConnection");

async function getThread(thread_id) {
  let getThreadSQL = `
  SELECT * from thread as t
  JOIN user AS u ON u.user_id = t.user_id
  where thread_id = ?;
    `;

  try {
    const results = await db.query(getThreadSQL, [thread_id]);
    const thread = results[0];

    if (thread.length > 0) {
      return thread[0];
    } else {
      throw new Error("Failed to get thread");
    }
  } catch (err) {
    console.log("Error getting thread.");
    console.log(err);
    return false;
  }
}

async function addPost(postData) {
  const insertPostSQL = `
    INSERT INTO thread (user_id, title, text, views, likes, created_date, last_update, comments) 
    VALUES (?, ?, ?, 0, 0, NOW(), NOW(), 0);
    `;

  try {
    const results = await db.query(insertPostSQL, [
      postData.user_id,
      postData.title,
      postData.description,
    ]);
    return results;
  } catch (error) {
    console.error("Error adding post:", error);
    throw error;
  }
}

async function getThreadByUserId(userId) {
  let getThreadSQL = `
  SELECT * from thread where user_id = ?;
    `;

  try {
    const results = await db.query(getThreadSQL, [userId]);
    const thread = results[0];

    if (thread.length > 0) {
      return thread;
    } else {
      throw new Error("Failed to get thread");
    }
  } catch (err) {
    console.log("Error getting thread.");
    console.log(err);
    return false;
  }
}

async function deleteThread(threadId) {
  let deleteThreadSQL = `
  DELETE FROM thread WHERE thread_id = ?;
    `;

  try {
    const results = await db.query(deleteThreadSQL, [threadId]);
    return results;
  } catch (err) {
    console.log("Error deleting thread.");
    console.log(err);
    return false;
  }
}

async function searchThreads(searchTerm) {
  try {
    const searchWithWildcard = `*${searchTerm}*`;

    const searchThreadsQuery = `
        SELECT 'thread' AS type, t.*, u.username, u.profile_id, p.cloudinary_url
        FROM thread AS t
        JOIN user AS u ON u.user_id = t.user_id
        LEFT JOIN profile_images AS p ON p.profile_id = u.profile_id
        WHERE MATCH (t.title, t.text) AGAINST (? IN NATURAL LANGUAGE MODE)
    `;
    const [results] = await db.query(searchThreadsQuery, [searchWithWildcard]);
    return results;
  } catch (error) {
    console.error("Error executing search query:", error);
    throw error;
  }
}

async function toggleLikeThread(postData) {
  const toggleLikeSQL = `
    INSERT INTO user_likes (user_id, entity_id, entity_type, is_like)
    VALUES (?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE is_like = VALUES(is_like);
  `;
  const deleteLikeSQL = `
    DELETE FROM user_likes WHERE user_id = ? AND entity_id = ? AND entity_type = 'thread';
  `;
  const selectLikesSQL = `
    SELECT likes FROM thread WHERE thread_id = ?;
  `;
  const selectCurrentStatusSQL = `
    SELECT is_like FROM user_likes WHERE user_id = ? AND entity_id = ? AND entity_type = 'thread';
  `;
  const updateLikesSQL = `
    UPDATE thread SET likes = likes + ? WHERE thread_id = ?;
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
        "Entity ID:",
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
    console.error("Error toggling like:", error);
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
    console.log("Return value: " + results);
    return results.length ? results[0].is_like : null;
  } catch (error) {
    console.error("Error fetching like status:", error);
    throw error;
  }
}

module.exports = {
  getThread,
  addPost,
  getThreadByUserId,
  deleteThread,
  searchThreads,
  toggleLikeThread,
  getUserLikeStatus,
};
