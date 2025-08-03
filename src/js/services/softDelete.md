ALTER TABLE notes 
ADD COLUMN active BOOLEAN DEFAULT TRUE,
ADD COLUMN deleted_at TIMESTAMPTZ;

-- Update the delete trigger to mark as inactive instead of deleting
CREATE OR REPLACE FUNCTION soft_delete_expired_notes()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE notes 
  SET active = FALSE, deleted_at = NOW() 
  WHERE expires_at < NOW() OR id = NEW.id;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE POLICY "Allow all inserts" ON notes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow select by id" ON notes FOR SELECT USING (true);
CREATE POLICY "Allow delete expired" ON notes FOR DELETE USING (expires_at < NOW());