-- ==============================================================================
-- Migration 007: Add public_id (prefixed NanoID) to users, trips, conversations, and messages
-- Fully idempotent with automatic zero-downtime backfill for existing rows
-- ==============================================================================

-- 1. Users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS public_id VARCHAR(32);

-- 2. Trips table
ALTER TABLE trips ADD COLUMN IF NOT EXISTS public_id VARCHAR(32);

-- 3. Conversations table
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS public_id VARCHAR(32);

-- 4. Messages table
ALTER TABLE messages ADD COLUMN IF NOT EXISTS public_id VARCHAR(32);

-- 5. Backfill existing rows with deterministic prefix + random alphanumeric string
UPDATE users 
SET public_id = 'usr_' || substr(md5(random()::text || clock_timestamp()::text || id::text), 1, 16)
WHERE public_id IS NULL;

UPDATE trips 
SET public_id = 'trp_' || substr(md5(random()::text || clock_timestamp()::text || id::text), 1, 16)
WHERE public_id IS NULL;

UPDATE conversations 
SET public_id = 'conv_' || substr(md5(random()::text || clock_timestamp()::text || id::text), 1, 16)
WHERE public_id IS NULL;

UPDATE messages 
SET public_id = 'msg_' || substr(md5(random()::text || clock_timestamp()::text || id::text), 1, 16)
WHERE public_id IS NULL;

-- 6. Enforce NOT NULL constraints
ALTER TABLE users ALTER COLUMN public_id SET NOT NULL;
ALTER TABLE trips ALTER COLUMN public_id SET NOT NULL;
ALTER TABLE conversations ALTER COLUMN public_id SET NOT NULL;
ALTER TABLE messages ALTER COLUMN public_id SET NOT NULL;

-- 7. Add unique indexes for instant O(1) query lookups
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_public_id ON users(public_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_trips_public_id ON trips(public_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_conversations_public_id ON conversations(public_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_messages_public_id ON messages(public_id);
