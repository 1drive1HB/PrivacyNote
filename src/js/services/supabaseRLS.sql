-- Drop table if it exists (clean start)
DROP TABLE IF EXISTS notes;

-- Create the notes table
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  is_encrypted BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for better performance on expiration checks
CREATE INDEX idx_notes_expires_at ON notes (expires_at);

-- For immediate functionality (disable RLS for now)
--ALTER TABLE notes DISABLE ROW LEVEL SECURITY;

-- Future-ready RLS policies (commented out for now)
-- Uncomment these when ready to implement RLS:
/*
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Minimal working policies
CREATE POLICY "Allow all inserts" ON notes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow select by id" ON notes FOR SELECT USING (true);
CREATE POLICY "Allow delete expired" ON notes FOR DELETE USING (expires_at < NOW());
*/

-- SELECT id, created_at, expires_at, 
--        expires_at < NOW() AS is_expired,
--        length(content) AS content_length
-- FROM notes
-- ORDER BY created_at DESC;