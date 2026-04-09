-- ============================================
-- REAL-TIME MULTIPLAYER GAME SYSTEM
-- ============================================
-- This schema extends the existing Supabase setup
-- to support real-time friend games with code sharing

-- ============================================
-- 1. UPDATE EXISTING GAMES TABLE
-- ============================================

-- Add new columns to existing games table
ALTER TABLE games 
ADD COLUMN IF NOT EXISTS game_code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS code_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS blockchain_game_id INTEGER,
ADD COLUMN IF NOT EXISTS blockchain_recorded BOOLEAN DEFAULT FALSE;

-- Add comment to explain game_type values
COMMENT ON COLUMN games.game_type IS 'Game type: ai (vs AI), friend (code-based), random (matchmaking), blockchain (legacy blockchain-only)';

-- Add comment to explain status values
COMMENT ON COLUMN games.status IS 'Game status: waiting (waiting for player 2), in_progress (playing), finished (completed), abandoned (expired/left)';

-- ============================================
-- 2. CREATE INDEXES FOR PERFORMANCE
-- ============================================

-- Index for fast code lookup
CREATE INDEX IF NOT EXISTS idx_games_code ON games(game_code) WHERE game_code IS NOT NULL;

-- Index for finding waiting games
CREATE INDEX IF NOT EXISTS idx_games_waiting ON games(status, created_at) WHERE status = 'waiting';

-- Index for active games
CREATE INDEX IF NOT EXISTS idx_games_active ON games(status, last_activity_at) WHERE status = 'in_progress';

-- Index for code expiration cleanup
CREATE INDEX IF NOT EXISTS idx_games_expired ON games(code_expires_at) WHERE code_expires_at IS NOT NULL;

-- ============================================
-- 3. CREATE HELPER FUNCTIONS
-- ============================================

-- Function to generate unique 6-character game code
CREATE OR REPLACE FUNCTION generate_game_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- Exclude similar chars (I,O,0,1)
  result TEXT := '';
  i INTEGER;
  code_exists BOOLEAN;
BEGIN
  LOOP
    result := '';
    FOR i IN 1..6 LOOP
      result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    END LOOP;
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM games WHERE game_code = result) INTO code_exists;
    
    -- If code doesn't exist, return it
    IF NOT code_exists THEN
      RETURN result;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to update last_activity_at on any game update
CREATE OR REPLACE FUNCTION update_game_activity()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_activity_at = NOW();
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic activity tracking
DROP TRIGGER IF EXISTS trigger_update_game_activity ON games;
CREATE TRIGGER trigger_update_game_activity
  BEFORE UPDATE ON games
  FOR EACH ROW
  EXECUTE FUNCTION update_game_activity();

-- Function to clean up expired games
CREATE OR REPLACE FUNCTION cleanup_expired_games()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Mark games as abandoned if:
  -- 1. Code expired and still waiting
  -- 2. No activity for 30 minutes and in progress
  UPDATE games
  SET status = 'abandoned'
  WHERE (
    (status = 'waiting' AND code_expires_at < NOW())
    OR
    (status = 'in_progress' AND last_activity_at < NOW() - INTERVAL '30 minutes')
  );
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 4. UPDATE ROW LEVEL SECURITY POLICIES
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Allow all operations on games" ON games;

-- Policy: Anyone can read games they're part of
CREATE POLICY "Players can read their games" ON games
  FOR SELECT
  USING (
    player1_address = current_setting('request.jwt.claims', true)::json->>'wallet_address'
    OR player2_address = current_setting('request.jwt.claims', true)::json->>'wallet_address'
    OR status = 'waiting' -- Allow reading waiting games for joining
  );

-- Policy: Anyone can create a game
CREATE POLICY "Anyone can create games" ON games
  FOR INSERT
  WITH CHECK (true);

-- Policy: Players can update their own games
CREATE POLICY "Players can update their games" ON games
  FOR UPDATE
  USING (
    player1_address = current_setting('request.jwt.claims', true)::json->>'wallet_address'
    OR player2_address = current_setting('request.jwt.claims', true)::json->>'wallet_address'
  );

-- For development: Allow all operations (remove in production)
CREATE POLICY "Allow all for development" ON games
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================
-- 5. ENABLE REAL-TIME REPLICATION
-- ============================================

-- Enable real-time for games table
ALTER PUBLICATION supabase_realtime ADD TABLE games;

-- ============================================
-- 6. CREATE VIEWS FOR COMMON QUERIES
-- ============================================

-- View: Active games waiting for players
CREATE OR REPLACE VIEW waiting_games AS
SELECT 
  id,
  game_code,
  player1_address,
  created_at,
  code_expires_at,
  EXTRACT(EPOCH FROM (code_expires_at - NOW())) AS seconds_until_expiry
FROM games
WHERE status = 'waiting'
  AND code_expires_at > NOW()
ORDER BY created_at DESC;

-- View: Recent finished games
CREATE OR REPLACE VIEW recent_games AS
SELECT 
  id,
  game_code,
  player1_address,
  player2_address,
  game_type,
  winner_address,
  is_draw,
  finished_at,
  EXTRACT(EPOCH FROM (finished_at - created_at)) AS game_duration_seconds
FROM games
WHERE status = 'finished'
ORDER BY finished_at DESC
LIMIT 50;

-- ============================================
-- 7. SAMPLE DATA FOR TESTING (OPTIONAL)
-- ============================================

-- Uncomment to insert test data
/*
INSERT INTO games (
  game_code,
  player1_address,
  player2_address,
  game_type,
  status,
  board,
  current_turn,
  code_expires_at
) VALUES (
  'TEST01',
  '0x1234567890123456789012345678901234567890',
  NULL,
  'friend',
  'waiting',
  ARRAY[0,0,0,0,0,0,0,0,0],
  '0x1234567890123456789012345678901234567890',
  NOW() + INTERVAL '24 hours'
);
*/

-- ============================================
-- 8. SCHEDULED CLEANUP (OPTIONAL)
-- ============================================

-- Note: This requires pg_cron extension
-- Run this in Supabase SQL Editor to enable:
-- CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule cleanup every hour
-- SELECT cron.schedule(
--   'cleanup-expired-games',
--   '0 * * * *', -- Every hour
--   $$ SELECT cleanup_expired_games(); $$
-- );

-- ============================================
-- 9. USEFUL QUERIES FOR MONITORING
-- ============================================

-- Check active games count
-- SELECT status, COUNT(*) FROM games GROUP BY status;

-- Find games by code
-- SELECT * FROM games WHERE game_code = 'ABC123';

-- Find player's active games
-- SELECT * FROM games 
-- WHERE (player1_address = '0x...' OR player2_address = '0x...')
--   AND status IN ('waiting', 'in_progress');

-- Find expired games
-- SELECT * FROM games 
-- WHERE status = 'waiting' 
--   AND code_expires_at < NOW();

-- ============================================
-- MIGRATION COMPLETE
-- ============================================

-- Verify the schema
SELECT 
  'Schema updated successfully!' AS message,
  COUNT(*) AS total_games,
  COUNT(CASE WHEN game_code IS NOT NULL THEN 1 END) AS games_with_codes
FROM games;
