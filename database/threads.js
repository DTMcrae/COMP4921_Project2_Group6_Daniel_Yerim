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

module.exports = { getThread, addPost };
