const db = include("databaseConnection");

async function createUser(postData) {
  let createUserSQL = `
		INSERT INTO user
		(username, email, password)
		VALUES
		(:username, :email, :passwordHash);
	`;

  let params = {
    username: postData.username,
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

async function getUserInfo(userId) {
  let getUsersSQL = `
  SELECT u.user_id, u.username, u.email, p.cloudinary_url
  FROM user AS u
  LEFT JOIN profile_images AS p ON p.profile_id = u.profile_id
  WHERE u.user_id = ?;
  `;

  try {
    const [results] = await db.query(getUsersSQL, [userId]);

    if (results.length === 0) {
      console.log("No user found with the given id");
      return [];
    }

    console.log("Successfully retrieved a user info");
    console.log(results[0]);
    return results;
  } catch (err) {
    console.log("Error getting a user info");
    console.log(err);
    return false;
  }
}

async function addProfileImage(cloudinaryUrl) {
  try {
    const sql = `INSERT INTO profile_images (cloudinary_url) VALUES (?)`;
    const [result] = await db.query(sql, [cloudinaryUrl]);
    return result.insertId;
  } catch (error) {
    console.error("Error adding profile image:", error.message);
    throw new Error("Failed to add profile image.");
  }
}

async function updateProfileImage(profileId, cloudinaryUrl) {
  try {
    const sql = `UPDATE profile_images SET cloudinary_url = ? WHERE profile_id = ?`;
    await db.query(sql, [cloudinaryUrl, profileId]);
  } catch (error) {
    console.error("Error updating profile image:", error.message);
    throw new Error("Failed to update profile image.");
  }
}

async function updateUserProfileId(userId, profileId) {
  try {
    const sql = `UPDATE user SET profile_id = ? WHERE user_id = ?`;
    await db.query(sql, [profileId, userId]);
  } catch (error) {
    console.error("Error updating user profile ID:", error.message);
    throw new Error("Failed to update user profile ID.");
  }
}

module.exports = {
  createUser,
  getUserByEmail,
  getUserId,
  getUserInfo,
  addProfileImage,
  updateProfileImage,
  updateUserProfileId,
};
