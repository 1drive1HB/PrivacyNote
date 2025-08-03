-- Drop table if it exists
DROP TABLE IF EXISTS notes;

-- Create table with automatic cleanup
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  is_encrypted BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index for faster expiration checks
CREATE INDEX idx_notes_expires_at ON notes (expires_at);

-- -- Create function for automatic cleanup
-- CREATE OR REPLACE FUNCTION delete_expired_notes()
-- RETURNS TRIGGER AS $$
-- BEGIN
--   DELETE FROM notes WHERE expires_at < NOW();
--   RETURN NULL;
-- END;
-- $$ LANGUAGE plpgsql;

-- -- Create trigger that runs after insert
-- CREATE TRIGGER trigger_delete_expired_notes
-- AFTER INSERT ON notes
-- EXECUTE FUNCTION delete_expired_notes();