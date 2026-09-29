import { pool } from "../db.js";

export async function listFriends(userId) {
  const result = await pool.query(
    `
      SELECT
        u.id,
        u.username,
        u.display_name AS "displayName",
                u.bio,
        f.created_at AS "addedAt",
        u.last_active_at AS "lastActiveAt",
        COALESCE(
          u.last_active_at >= NOW() - INTERVAL '90 seconds',
          false
        ) AS "isOnline"
      FROM friendships AS f
      JOIN users AS u
        ON u.id = f.friend_id
      WHERE f.user_id = $1
      ORDER BY LOWER(u.display_name), u.id
    `,
    [userId],
  );

  return result.rows;
}

export async function addFriend(userId, friendId) {
  const result = await pool.query(
    `
      INSERT INTO friendships (
        user_id,
        friend_id
      )
      VALUES ($1, $2)
      ON CONFLICT (user_id, friend_id) DO NOTHING
      RETURNING friend_id
    `,
    [userId, friendId],
  );

  return result.rowCount > 0;
}

export async function removeFriend(userId, friendId) {
  await pool.query(
    `
      DELETE FROM friendships
      WHERE user_id = $1
        AND friend_id = $2
    `,
    [userId, friendId],
  );
}
