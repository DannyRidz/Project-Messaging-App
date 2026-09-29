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

export async function listUserConversations(userId) {
  const result = await pool.query(
    `
      SELECT
        c.id,
        c.type,
        c.name,
        c.created_by AS "createdBy",
        c.created_at AS "createdAt",
        JSON_AGG(
          JSON_BUILD_OBJECT(
            'id', u.id,
            'username', u.username,
            'displayName', u.display_name
          )
          ORDER BY u.id
        ) AS members
      FROM conversations AS c
      INNER JOIN conversation_members AS own
        ON own.conversation_id = c.id
      INNER JOIN conversation_members AS cm
        ON cm.conversation_id = c.id
      INNER JOIN users AS u
        ON u.id = cm.user_id
      WHERE own.user_id = $1
      GROUP BY c.id
      ORDER BY c.created_at DESC, c.id DESC
    `,
    [userId],
  );

  return result.rows;
}

export async function listConversationMembers(conversationId) {
  const result = await pool.query(
    `
      SELECT
        u.id,
        u.username,
        u.display_name AS "displayName"
      FROM users AS u
      INNER JOIN conversation_members AS cm
        ON cm.user_id = u.id
      WHERE cm.conversation_id = $1
      ORDER BY u.id
    `,
    [conversationId],
  );

  return result.rows;
}

export async function getOrCreateDirectConversation(userId, recipientId) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    await client.query(
      "SELECT pg_advisory_xact_lock($1::integer, $2::integer)",
      [Math.min(userId, recipientId), Math.max(userId, recipientId)],
    );

    const recipient = await client.query("SELECT id FROM users WHERE id = $1", [
      recipientId,
    ]);

    if (recipient.rowCount === 0) {
      await client.query("COMMIT");
      return null;
    }

    const existing = await client.query(
      `
        SELECT
          c.id,
          c.type,
          c.name,
          c.created_by AS "createdBy",
          c.created_at AS "createdAt"
        FROM conversations AS c
        INNER JOIN conversation_members AS first_member
          ON first_member.conversation_id = c.id
        INNER JOIN conversation_members AS second_member
          ON second_member.conversation_id = c.id
        WHERE c.type = 'direct'
          AND first_member.user_id = $1
          AND second_member.user_id = $2
        ORDER BY c.id
        LIMIT 1
      `,
      [userId, recipientId],
    );

    if (existing.rowCount > 0) {
      await client.query("COMMIT");

      return {
        conversation: existing.rows[0],
        created: false,
      };
    }

    const inserted = await client.query(
      `
        INSERT INTO conversations (type, created_by)
        VALUES ('direct', $1)
        RETURNING
          id,
          type,
          name,
          created_by AS "createdBy",
          created_at AS "createdAt"
      `,
      [userId],
    );

    const conversation = inserted.rows[0];

    await client.query(
      `
        INSERT INTO conversation_members (
          conversation_id,
          user_id
        )
        VALUES ($1, $2), ($1, $3)
      `,
      [conversation.id, userId, recipientId],
    );

    await client.query("COMMIT");

    return {
      conversation,
      created: true,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function createGroupConversation(creatorId, name, memberIds) {
  const client = await pool.connect();
  const allMemberIds = [creatorId, ...memberIds];

  try {
    await client.query("BEGIN");

    const existingUsers = await client.query(
      `
        SELECT COUNT(*)::integer AS total
        FROM users
        WHERE id = ANY($1::integer[])
      `,
      [allMemberIds],
    );

    if (existingUsers.rows[0].total !== allMemberIds.length) {
      await client.query("ROLLBACK");
      return null;
    }

    const inserted = await client.query(
      `
        INSERT INTO conversations (type, name, created_by)
        VALUES ('group', $1, $2)
        RETURNING
          id,
          type,
          name,
          created_by AS "createdBy",
          created_at AS "createdAt"
      `,
      [name, creatorId],
    );

    const conversation = inserted.rows[0];

    await client.query(
      `
        INSERT INTO conversation_members (conversation_id, user_id)
        SELECT $1, UNNEST($2::integer[])
      `,
      [conversation.id, allMemberIds],
    );

    await client.query("COMMIT");
    return conversation;
  } catch (error) {
    await client.query("ROLLBACK");

    if (error.code === "23503") {
      return null;
    }

    throw error;
  } finally {
    client.release();
  }
}
