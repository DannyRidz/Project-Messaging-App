import { pool } from "../db.js";

export async function findConversationForUser(conversationId, userId) {
  const result = await pool.query(
    `
      SELECT
        c.id,
        c.type,
        c.name,
        c.created_by AS "createdBy",
        c.created_at AS "createdAt"
      FROM conversations AS c
      INNER JOIN conversation_members AS cm
        ON cm.conversation_id = c.id
      WHERE c.id = $1
        AND cm.user_id = $2
    `,
    [conversationId, userId],
  );

  return result.rows[0];
}
