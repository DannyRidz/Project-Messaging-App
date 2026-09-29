import { pool } from "../db.js";

export async function createMessage(conversationId, senderId, body) {
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

    await client.query("COMMIT");

    return result.rows[0];
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
        '[]'::json AS attachments
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
