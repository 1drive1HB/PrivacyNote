-- Complete database cleanup script
-- Drop triggers first
DROP TRIGGER IF EXISTS trg_set_note_expiration ON public.notes;

-- Drop functions
DROP FUNCTION IF EXISTS public.set_note_expiration() CASCADE;
DROP FUNCTION IF EXISTS public.delete_expired_notes() CASCADE;
DROP FUNCTION IF EXISTS public.get_note_content(UUID) CASCADE;

-- Drop policies (use the correct policy names from your current setup)
DROP POLICY IF EXISTS "Allow anonymous insert" ON public.notes;
DROP POLICY IF EXISTS "Allow anonymous select" ON public.notes;
DROP POLICY IF EXISTS "Allow anonymous update" ON public.notes;
DROP POLICY IF EXISTS "Allow anonymous delete" ON public.notes;
-- DROP POLICY IF EXISTS "Allow insert for anon" ON public.notes;
-- DROP POLICY IF EXISTS "Disallow direct delete" ON public.notes;

-- Disable RLS
ALTER TABLE IF EXISTS public.notes DISABLE ROW LEVEL SECURITY;

-- Drop indexes
DROP INDEX IF EXISTS public.idx_notes_expires_at;
DROP INDEX IF EXISTS public.notes_pkey;

-- Finally drop the table
DROP TABLE IF EXISTS public.notes CASCADE;

-- Verification query to confirm everything is dropped
DO $$
BEGIN
    -- Check table
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'notes') THEN
        RAISE NOTICE '✓ Table public.notes dropped successfully';
    ELSE
        RAISE NOTICE '✗ Table public.notes still exists';
    END IF;

    -- Check functions
    IF NOT EXISTS (SELECT FROM information_schema.routines WHERE routine_schema = 'public' AND routine_name = 'set_note_expiration') THEN
        RAISE NOTICE '✓ Function public.set_note_expiration dropped successfully';
    ELSE
        RAISE NOTICE '✗ Function public.set_note_expiration still exists';
    END IF;

    IF NOT EXISTS (SELECT FROM information_schema.routines WHERE routine_schema = 'public' AND routine_name = 'delete_expired_notes') THEN
        RAISE NOTICE '✓ Function public.delete_expired_notes dropped successfully';
    ELSE
        RAISE NOTICE '✗ Function public.delete_expired_notes still exists';
    END IF;

    IF NOT EXISTS (SELECT FROM information_schema.routines WHERE routine_schema = 'public' AND routine_name = 'get_note_content') THEN
        RAISE NOTICE '✓ Function public.get_note_content dropped successfully';
    ELSE
        RAISE NOTICE '✗ Function public.get_note_content still exists';
    END IF;

    -- Check indexes
    IF NOT EXISTS (SELECT FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'notes_pkey') THEN
        RAISE NOTICE '✓ Index public.notes_pkey dropped successfully';
    ELSE
        RAISE NOTICE '✗ Index public.notes_pkey still exists';
    END IF;

    IF NOT EXISTS (SELECT FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'idx_notes_expires_at') THEN
        RAISE NOTICE '✓ Index public.idx_notes_expires_at dropped successfully';
    ELSE
        RAISE NOTICE '✗ Index public.idx_notes_expires_at still exists';
    END IF;

    -- Check policies
    IF NOT EXISTS (SELECT FROM pg_policies WHERE schemaname = 'public' AND tablename = 'notes') THEN
        RAISE NOTICE '✓ All policies dropped successfully';
    ELSE
        RAISE NOTICE '✗ Some policies still exist';
    END IF;

    RAISE NOTICE 'Database cleanup completed!';
END $$;