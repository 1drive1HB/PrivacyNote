-- Main notes table
CREATE TABLE IF NOT EXISTS public.notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    is_encrypted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours'),
    read_count INTEGER DEFAULT 0,
    -- Boolean flags for expiration types
    expires_in_24h BOOLEAN DEFAULT TRUE,
    expires_in_48h BOOLEAN DEFAULT FALSE
);

CREATE UNIQUE INDEX IF NOT EXISTS notes_pkey ON public.notes USING btree (id);
CREATE INDEX IF NOT EXISTS idx_notes_expires_at ON public.notes USING btree (expires_at);

-- Trigger to set expiration based on boolean flags
CREATE OR REPLACE FUNCTION public.set_note_expiration()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.expires_in_24h THEN
        NEW.expires_at = NOW() + INTERVAL '24 hours';
        NEW.expires_in_48h = FALSE;
    ELSIF NEW.expires_in_48h THEN
        NEW.expires_at = NOW() + INTERVAL '48 hours';
        NEW.expires_in_24h = FALSE;
    ELSE
        -- Default to 24h if no flag set
        NEW.expires_at = NOW() + INTERVAL '24 hours';
        NEW.expires_in_24h = TRUE;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger before insert
CREATE TRIGGER trg_set_note_expiration
    BEFORE INSERT ON public.notes
    FOR EACH ROW
    EXECUTE FUNCTION public.set_note_expiration();

-- Simple expiration cleanup function
CREATE OR REPLACE FUNCTION public.delete_expired_notes()
RETURNS void AS $$
BEGIN
    DELETE FROM public.notes 
    WHERE expires_at < NOW() OR read_count > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Secure retrieval function
CREATE OR REPLACE FUNCTION public.get_note_content(note_id UUID)
RETURNS TABLE(content TEXT) AS $$
BEGIN
    RETURN QUERY
    WITH upd AS (
        UPDATE public.notes
        SET read_count = read_count + 1
        WHERE id = note_id
        RETURNING content
    )
    SELECT content FROM upd;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- Create proper policies for anonymous access
CREATE POLICY "Allow anonymous insert" ON public.notes
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anonymous select" ON public.notes
  FOR SELECT TO anon USING (true);

CREATE POLICY "Allow anonymous update" ON public.notes
  FOR UPDATE TO anon USING (true);

CREATE POLICY "Allow anonymous delete" ON public.notes
  FOR DELETE TO anon USING (true);


SELECT * FROM public.notes

TRUNCATE TABLE public.notes