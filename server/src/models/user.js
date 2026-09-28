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

export async function findUserByEmail(email) {
  const result = await pool.query(
    `
      SELECT
        id,
        username,
        email,
        password_hash AS "passwordHash",
        display_name AS "displayName",
        bio,
        created_at AS "createdAt"
      FROM users
      WHERE email = $1
    `,
    [email],
  );

  return result.rows[0];
}

export async function findUserById(id) {
  const result = await pool.query(
    `
      SELECT
        id,
        username,
        email,
        display_name AS "displayName",
        bio,
        created_at AS "createdAt"
      FROM users
      WHERE id = $1
    `,
    [id],
  );

  return result.rows[0];
}

export async function updateUserProfile(userId, { displayName, bio }) {
  const result = await pool.query(
    `
      UPDATE users
      SET
        display_name = COALESCE($2, display_name),
        bio = COALESCE($3, bio)
      WHERE id = $1
      RETURNING
        id,
        username,
        email,
        display_name AS "displayName",
        bio,
        created_at AS "createdAt"
    `,
    [userId, displayName, bio],
  );

  return result.rows[0];
}

export async function findPublicUserById(userId) {
  const result = await pool.query(
    `
      SELECT
        id,
        username,
        display_name AS "displayName",
        bio
      FROM users
      WHERE id = $1
    `,
    [userId],
  );

  return result.rows[0];
}
