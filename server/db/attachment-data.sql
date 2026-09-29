BEGIN;

ALTER TABLE message_attachments
  ADD COLUMN data BYTEA NOT NULL,
  ADD CONSTRAINT attachment_data_size
    CHECK (
      octet_length(data) = byte_size
      AND byte_size <= 2097152
    );

COMMIT;