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
            SELECT t.*, u.username, u.profile_id, p.cloudinary_url
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
            SELECT t.*, u.username, u.profile_id, p.cloudinary_url
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

async function searchThreads(searchTerm) {
  try {
    const searchThreadsQuery = `
        SELECT t.*, u.username, u.profile_id, p.cloudinary_url
        FROM thread AS t
        JOIN user AS u ON u.user_id = t.user_id
        LEFT JOIN profile_images AS p ON p.profile_id = u.profile_id
        WHERE MATCH (t.title, t.text) AGAINST (? IN NATURAL LANGUAGE MODE)
    `;
    const [results] = await db.query(searchThreadsQuery, [searchTerm]);
    return results;
  } catch (error) {
    console.error("Error executing search query:", error);
    throw error;
  }
}

module.exports = {
  printMySQLVersion,
  getRecentThreads,
  getLikedThreads,
  searchThreads,
};
