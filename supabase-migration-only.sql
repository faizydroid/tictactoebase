-- ============================================
-- REAL-TIME MULTIPLAYER GAME MIGRATION
-- ============================================
-- This script ONLY adds new features to existing schema
-- Safe to run on existing database

-- ============================================
-- 1. ADD NEW COLUMNS TO GAMES TABLE
-- ============================================

-- Add new columns (IF NOT EXISTS prevents errors if already added)
DO $$ 
BEGIN
  -- Add game_code column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'games' AND column_name = 'game_code'
  ) THEN
    ALTER TABLE games ADD COLUMN game_code TEXT UNIQUE;
    CREATE INDEX idx_games_code ON games(game_code) WHERE game_code IS NOT NULL;
  END IF;

  -- Add code_expires_at column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'games' AND column_name = 'code_expires_at'
  ) THEN
    ALTER TABLE games ADD COLUMN code_expires_at TIMESTAMP WITH TIME ZONE;
    CREATE INDEX idx_games_expired ON games(code_expires_at) WHERE code_expires_at IS NOT NULL;
  END IF;

  -- Add last_activity_at column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'games' AND column_name = 'last_activity_at'
  ) THEN
    ALTER TABLE games ADD COLUMN last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    CREATE INDEX idx_games_active ON games(status, last_activity_at) WHERE status = 'in_progress';
  END IF;

  -- Add blockchain_game_id column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'games' AND column_name = 'blockchain_game_id'
  ) THEN
    ALTER TABLE games ADD COLUMN blockchain_game_id INTEGER;
  END IF;

  -- Add blockchain_recorded column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'games' AND column_name = 'blockchain_recorded'
  ) THEN
    ALTER TABLE games ADD COLUMN blockchain_recorded BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- Add index for waiting games
CREATE INDEX IF NOT EXISTS idx_games_waiting ON games(status, created_at) WHERE status = 'waiting';

-- Add comments
COMMENT ON COLUMN games.game_type IS 'Game type: ai (vs AI), friend (code-based), random (matchmaking), blockchain (legacy)';
COMMENT ON COLUMN games.status IS 'Game status: waiting (for player 2), in_progress (playing), finished (completed), abandoned (expired)';

-- ============================================
-- 2. CREATE GAME CODE GENERATOR FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION generate_game_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- Exclude I,O,0,1
  result TEXT := '';
  i INTEGER;
  code_exists BOOLEAN;
BEGIN
  LOOP
    result := '';
    FOR i IN 1..6 LOOP
      result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    END LOOP;
    
    SELECT EXISTS(SELECT 1 FROM games WHERE game_code = result) INTO code_exists;
    
    IF NOT code_exists THEN
      RETURN result;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 3. CREATE ACTIVITY TRACKING FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION update_game_activity()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_activity_at = NOW();
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger (drop first if exists)
DROP TRIGGER IF EXISTS trigger_update_game_activity ON games;
CREATE TRIGGER trigger_update_game_activity
  BEFORE UPDATE ON games
  FOR EACH ROW
  EXECUTE FUNCTION update_game_activity();

-- ============================================
-- 4. CREATE CLEANUP FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION cleanup_expired_games()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
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
-- 5. CREATE HELPER VIEWS
-- ============================================

-- Drop views if they exist
DROP VIEW IF EXISTS waiting_games;
DROP VIEW IF EXISTS recent_games;

-- View: Active games waiting for players
CREATE VIEW waiting_games AS
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
CREATE VIEW recent_games AS
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
-- 6. VERIFY MIGRATION
-- ============================================

-- Check that all columns exist
DO $$
DECLARE
  missing_columns TEXT[];
BEGIN
  SELECT ARRAY_AGG(col) INTO missing_columns
  FROM (
    SELECT 'game_code' AS col WHERE NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'games' AND column_name = 'game_code'
    )
    UNION ALL
    SELECT 'code_expires_at' WHERE NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'games' AND column_name = 'code_expires_at'
    )
    UNION ALL
    SELECT 'last_activity_at' WHERE NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'games' AND column_name = 'last_activity_at'
    )
    UNION ALL
    SELECT 'blockchain_game_id' WHERE NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'games' AND column_name = 'blockchain_game_id'
    )
    UNION ALL
    SELECT 'blockchain_recorded' WHERE NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'games' AND column_name = 'blockchain_recorded'
    )
  ) AS missing;

  IF missing_columns IS NOT NULL THEN
    RAISE EXCEPTION 'Migration incomplete. Missing columns: %', array_to_string(missing_columns, ', ');
  END IF;
END $$;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

SELECT 
  '✅ Migration completed successfully!' AS status,
  COUNT(*) AS total_games,
  COUNT(CASE WHEN game_code IS NOT NULL THEN 1 END) AS games_with_codes,
  COUNT(CASE WHEN status = 'waiting' THEN 1 END) AS waiting_games,
  COUNT(CASE WHEN status = 'in_progress' THEN 1 END) AS active_games,
  COUNT(CASE WHEN status = 'finished' THEN 1 END) AS finished_games
FROM games;

-- Test code generation
SELECT 
  '✅ Code generation test' AS test,
  generate_game_code() AS sample_code;

-- ============================================
-- NEXT STEPS
-- ============================================

/*
IMPORTANT: Enable Real-Time Replication

1. Go to Supabase Dashboard
2. Navigate to: Database → Replication
3. Find the 'games' table
4. Enable Real-time
5. Check: INSERT, UPDATE, DELETE

Then test with:

-- Create a test game
INSERT INTO games (
  game_code,
  player1_address,
  game_type,
  status,
  board,
  current_turn,
  code_expires_at
) VALUES (
  generate_game_code(),
  '0xTEST1234567890123456789012345678901234',
  'friend',
  'waiting',
  ARRAY[0,0,0,0,0,0,0,0,0],
  '0xTEST1234567890123456789012345678901234',
  NOW() + INTERVAL '24 hours'
)
RETURNING *;

-- View waiting games
SELECT * FROM waiting_games;

-- Test cleanup
SELECT cleanup_expired_games();
*/
