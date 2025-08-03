CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  is_encrypted BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Notes insert policy" 
-- ON notes FOR INSERT WITH CHECK (true);

-- CREATE POLICY "Notes select policy"
-- ON notes FOR SELECT USING (id = current_setting('app.current_note_id')::UUID);

-- CREATE POLICY "Notes delete policy"
-- ON notes FOR DELETE USING (expires_at < NOW() OR id = current_setting('app.current_note_id')::UUID);

-- new table with automatic trigger for row deleteion within 24h, or rts policy with 16h deletion
-- 1:1 copy of notes table with trigger deleteion after ON INSERT value 