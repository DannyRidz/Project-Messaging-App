import { randomUUID } from "node:crypto";
import { pool } from "../db.js";

export async function createMessage(
  conversationId,
  senderId,
  body,
  attachment = null,
) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const membershipResult = await client.query(
      `
        SELECT c.id
        FROM conversations AS c
        JOIN conversation_members AS cm
          ON cm.conversation_id = c.id
        WHERE c.id = $1
          AND cm.user_id = $2
        FOR UPDATE OF c, cm
      `,
      [conversationId, senderId],
    );

    if (membershipResult.rows.length === 0) {
      await client.query("COMMIT");
      return null;
    }

    const result = await client.query(
      `
        INSERT INTO messages (
          conversation_id,
          sender_id,
          body
        )
        VALUES ($1, $2, $3)
        RETURNING
          id,
          conversation_id AS "conversationId",
          sender_id AS "senderId",
          body,
          created_at AS "createdAt"
      `,
      [conversationId, senderId, body],
    );

    const message = result.rows[0];
    message.attachments = [];

    if (attachment) {
      const attachmentResult = await client.query(
        `
          INSERT INTO message_attachments (
            message_id,
            storage_key,
            mime_type,
            byte_size,
            data
          )
          VALUES ($1, $2, $3, $4, $5)
          RETURNING
            id,
            mime_type AS "mimeType",
            byte_size AS "byteSize"
        `,
        [
          message.id,
          randomUUID(),
          attachment.mimeType,
          attachment.data.length,
          attachment.data,
        ],
      );

      const savedAttachment = attachmentResult.rows[0];

      message.attachments = [
        {
          ...savedAttachment,
          url: `/api/attachments/${savedAttachment.id}`,
        },
      ];
    }

    await client.query("COMMIT");

    return message;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function listMessages(
  conversationId,
  { afterId, beforeId, limit },
) {
  const values = [conversationId, limit + 1];

  let condition = "";
  let order = "DESC";

  if (afterId !== undefined) {
    values.push(afterId);
    condition = "AND m.id > $3";
    order = "ASC";
  } else if (beforeId !== undefined) {
    values.push(beforeId);
    condition = "AND m.id < $3";
  }

  const result = await pool.query(
    `
      SELECT
        m.id,
        m.conversation_id AS "conversationId",
        m.sender_id AS "senderId",
        m.body,
        m.created_at AS "createdAt",
        JSON_BUILD_OBJECT(
          'id', u.id,
          'username', u.username,
          'displayName', u.display_name
        ) AS sender,
        COALESCE(
          (
            SELECT JSON_AGG(
              JSON_BUILD_OBJECT(
                'id', a.id,
                'mimeType', a.mime_type,
                'byteSize', a.byte_size,
                'url', '/api/attachments/' || a.id
              )
              ORDER BY a.id
            )
            FROM message_attachments AS a
            WHERE a.message_id = m.id
          ),
          '[]'::json
        ) AS attachments
      FROM messages AS m
      JOIN users AS u
        ON u.id = m.sender_id
      WHERE m.conversation_id = $1
        ${condition}
      ORDER BY m.id ${order}
      LIMIT $2
    `,
    values,
  );

  const hasMore = result.rows.length > limit;
  const messages = result.rows.slice(0, limit);

  if (order === "DESC") {
    messages.reverse();
  }

  return { messages, hasMore };
}
