const db = include("databaseConnection");

async function createUser(postData) {
    let createUserSQL = `
		INSERT INTO user
		(email, password)
		VALUES
		(:email, :passwordHash);
	`;

    let params = {
        email: postData.email,
        passwordHash: postData.hashedPassword,
    };

    try {
        const results = await db.query(createUserSQL, params);

        const insertedUserId = results[0].insertId;

        if (insertedUserId) {
            console.log("User sucessfully inserted with ID: " + insertedUserId);
            return insertedUserId;
        } else {
            throw new Error("Failed to insert user");
        }
    } catch (err) {
        console.log("Error inserting user");
        console.log(err);
        return false;
    }
}

async function getUserByEmail(email) {
    let getUsersSQL = `SELECT user_id, email, password FROM user WHERE email = ?;`;

    try {
        const [results] = await db.query(getUsersSQL, [email]);

        if (results.length === 0) {
            // No user found with the given email
            console.log("No user found with the given email");
            return [];
        }

        console.log("Successfully retrieved a user");
        console.log(results[0]);
        return results;
    } catch (err) {
        console.log("Error getting a user");
        console.log(err);
        return false;
    }
}

async function getUserId(email) {
    let getUserSQL = `
		SELECT user_id
		FROM user
		WHERE email = :user;
	`;

    let params = {
        user: email,
    };

    try {
        const results = await db.query(getUserSQL, params);

        if (results.length > 0) {
            console.log("Successfully found user");
            console.log(results[0]);
            return results[0].user_id;
        } else {
            console.log("User not found");
            return null;
        }
    } catch (err) {
        console.log("Error trying to find user");
        console.log(err);
        return false;
    }
}

module.exports = { createUser, getUserByEmail, getUserId };
