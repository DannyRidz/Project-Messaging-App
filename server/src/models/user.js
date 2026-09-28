import { pool } from "../db.js";

export async function createUser({ username, email, passwordHash }) {
  const result = await pool.query(
    `
      INSERT INTO users (
        username,
        email,
        password_hash,
        display_name
      )
      VALUES ($1, $2, $3, $4)
      RETURNING
        id,
        username,
        email,
        display_name AS "displayName",
        bio,
        created_at AS "createdAt"
    `,
    [username, email, passwordHash, username],
  );

  return result.rows[0];
}
