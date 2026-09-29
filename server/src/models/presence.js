import { pool } from "../db.js";

export async function updateActivity(userId) {
  await pool.query(
    `
      UPDATE users
      SET last_active_at = NOW()
      WHERE id = $1
    `,
    [userId],
  );
}
