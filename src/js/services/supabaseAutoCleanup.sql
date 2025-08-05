-- -- Drop existing table if needed
-- DROP TABLE IF EXISTS notes CASCADE;

-- -- Create table with automatic cleanup
-- CREATE TABLE notes (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   content TEXT NOT NULL,
--   is_encrypted BOOLEAN DEFAULT FALSE,
--   expires_at TIMESTAMPTZ NOT NULL,
--   created_at TIMESTAMPTZ DEFAULT NOW()
-- );

-- -- Add index for faster expiration checks
-- CREATE INDEX idx_notes_expires_at ON notes (expires_at);

-- -- Add function to safely retrieve and delete note
-- CREATE OR REPLACE FUNCTION get_and_delete_note(note_id UUID)
-- RETURNS SETOF notes AS $$
-- BEGIN
--   RETURN QUERY
--   DELETE FROM notes 
--   WHERE id = note_id
--   RETURNING *;
-- END;
-- $$ LANGUAGE plpgsql SECURITY DEFINER;

-- -- Enable Row Level Security
-- ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- -- Updated RLS policies
-- CREATE POLICY "Allow all access via function" ON notes
--   FOR ALL USING (auth.role() = 'anon');

-- CREATE POLICY "Allow insert for anon" ON notes
--   FOR INSERT WITH CHECK (true);

-- CREATE POLICY "Allow delete via function" ON notes
--   FOR DELETE USING (false); -- Only via function