const db = include("databaseConnection");

async function getThread(thread_id) {
  let getThreadSQL = `
  SELECT * from thread where thread_id = ?;
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
        WHERE MATCH (t.title, t.text) AGAINST (? IN BOOLEAN MODE)
    `;
    const [results] = await db.query(searchThreadsQuery, [searchWithWildcard]);
    return results;
  } catch (error) {
    console.error("Error executing search query:", error);
    throw error;
  }
}

module.exports = {
  getThread,
  addPost,
  getThreadByUserId,
  deleteThread,
  searchThreads,
};
