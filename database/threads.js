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

module.exports = { getThread };
