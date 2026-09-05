-- Menautkan conversation ke trip yang spesifik (opsional, nullable).
-- ON DELETE SET NULL: bila trip dihapus, conversation tetap hidup sebagai sesi mandiri.
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS trip_id BIGINT
  REFERENCES trips(id) ON DELETE SET NULL;

-- Index untuk performa lookup conversations by trip_id
CREATE INDEX IF NOT EXISTS idx_conversations_trip_id ON conversations(trip_id);
