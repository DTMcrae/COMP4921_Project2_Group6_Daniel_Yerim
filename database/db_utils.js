const db = include("databaseConnection");

async function printMySQLVersion() {
  let sqlQuery = `
		SHOW VARIABLES LIKE 'version';
	`;

  try {
    const results = await db.query(sqlQuery);
    console.log("Successfully connected to MySQL");
    console.log(results[0]);
    return true;
  } catch (err) {
    console.log("Error getting version from MySQL");
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

async function getRecentThreads() {
  try {
    const result = await db.query(`
            SELECT t.*, u.username, u.profile_id
            FROM thread AS t
            JOIN user AS u ON t.user_id = u.user_id
            ORDER BY t.created_date DESC
            LIMIT 3
        `);
    return result[0];
  } catch (error) {
    throw new Error("Error retrieving recent threads: " + error.message);
  }
}

async function getLikedThreads() {
  try {
    const result = await db.query(`
            SELECT t.*, u.username, u.profile_id
            FROM thread AS t
            JOIN user AS u ON t.user_id = u.user_id
            ORDER BY t.likes DESC
            LIMIT 3
        `);
    return result[0];
  } catch (error) {
    throw new Error("Error retrieving liked threads: " + error.message);
  }
}

module.exports = {
  printMySQLVersion,
  addPost,
  getRecentThreads,
  getLikedThreads,
};
