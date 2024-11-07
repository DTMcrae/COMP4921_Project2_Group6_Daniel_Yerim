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

async function getRecentThreads() {
  try {
    const result = await db.query(`
            SELECT t.*, u.username, u.profile_id, p.cloudinary_url,
            (SELECT COUNT(*) FROM comments c WHERE c.thread_id = t.thread_id) AS commentCount
            FROM thread AS t
            JOIN user AS u ON t.user_id = u.user_id
            LEFT JOIN profile_images AS p ON u.profile_id = p.profile_id
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
            SELECT t.*, u.username, u.profile_id, p.cloudinary_url,
            (SELECT COUNT(*) FROM comments c WHERE c.thread_id = t.thread_id) AS commentCount
            FROM thread AS t
            JOIN user AS u ON t.user_id = u.user_id
            LEFT JOIN profile_images AS p ON u.profile_id = p.profile_id
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
  getRecentThreads,
  getLikedThreads,
};
