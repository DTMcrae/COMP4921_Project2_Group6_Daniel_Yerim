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
    INSERT INTO thread (user_id, title, text, views, likes, created_date, last_update) 
    VALUES (?, ?, ?, 0, 0, NOW(), NOW());
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

module.exports = {
    printMySQLVersion,
    addPost,
};
