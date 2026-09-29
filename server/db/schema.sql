CREATE TABLE users (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  display_name TEXT NOT NULL,
  bio TEXT,
  last_active_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE conversations (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('direct', 'group')),
  name TEXT,
  created_by INTEGER NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (
    (type = 'direct' AND name IS NULL)
    OR
    (type = 'group' AND name IS NOT NULL AND BTRIM(name) <> '')
  )
);

CREATE TABLE conversation_members (
  conversation_id INTEGER NOT NULL REFERENCES conversations(id),
  user_id INTEGER NOT NULL REFERENCES users(id),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (conversation_id, user_id)
);

CREATE TABLE messages (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  conversation_id INTEGER NOT NULL REFERENCES conversations(id),
  sender_id INTEGER NOT NULL REFERENCES users(id),
  body TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE message_attachments (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  message_id INTEGER NOT NULL REFERENCES messages(id),
  storage_key TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  byte_size INTEGER NOT NULL CHECK (byte_size > 0),
  data BYTEA NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT attachment_data_size CHECK (
    octet_length(data) = byte_size
    AND byte_size <= 2097152
  )
);

CREATE TABLE friendships (
  user_id INTEGER NOT NULL REFERENCES users(id),
  friend_id INTEGER NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, friend_id),
  CHECK (user_id <> friend_id)
);

CREATE INDEX conversation_members_user_idx
  ON conversation_members(user_id);

CREATE INDEX messages_conversation_id_idx
  ON messages(conversation_id, id);

CREATE INDEX message_attachments_message_idx
  ON message_attachments(message_id);