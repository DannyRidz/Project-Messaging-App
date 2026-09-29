import { pool } from "../db.js";

export async function findAttachmentForUser(attachmentId, userId) {
  const result = await pool.query(
    `
      SELECT
        a.data,
        a.mime_type AS "mimeType"
      FROM message_attachments AS a
      JOIN messages AS m
        ON m.id = a.message_id
      JOIN conversation_members AS cm
        ON cm.conversation_id = m.conversation_id
      WHERE a.id = $1
        AND cm.user_id = $2
    `,
    [attachmentId, userId],
  );

  return result.rows[0];
}
