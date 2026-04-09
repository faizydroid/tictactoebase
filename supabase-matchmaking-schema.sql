-- Matchmaking Queue System for Random Match
-- Run this in Supabase SQL Editor

-- 1. Create matchmaking_queue table
CREATE TABLE IF NOT EXISTS matchmaking_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT NOT NULL,
  username TEXT NOT NULL,
  joined_at TIMESTAMP DEFAULT NOW(),
  status TEXT DEFAULT 'waiting', -- 'waiting', 'matched', 'cancelled'
  match_id UUID,
  expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '5 minutes'),
  UNIQUE(wallet_address)
);

-- 2. Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_matchmaking_queue_status ON matchmaking_queue(status);
CREATE INDEX IF NOT EXISTS idx_matchmaking_queue_joined_at ON matchmaking_queue(joined_at);

-- 3. Enable Row Level Security
ALTER TABLE matchmaking_queue ENABLE ROW LEVEL SECURITY;

-- 4. Create policies for matchmaking_queue
CREATE POLICY "Allow all operations on matchmaking_queue" ON matchmaking_queue
  FOR ALL USING (true) WITH CHECK (true);

-- 5. Function to clean up expired queue entries
CREATE OR REPLACE FUNCTION cleanup_expired_queue_entries()
RETURNS void AS $$
BEGIN
  DELETE FROM matchmaking_queue
  WHERE expires_at < NOW()
    OR (status = 'matched' AND joined_at < NOW() - INTERVAL '1 hour');
END;
$$ LANGUAGE plpgsql;

-- 6. Function to find and create a match
CREATE OR REPLACE FUNCTION find_match(player_wallet TEXT)
RETURNS TABLE(
  match_found BOOLEAN,
  opponent_wallet TEXT,
  opponent_username TEXT,
  game_id UUID
) AS $$
DECLARE
  v_opponent RECORD;
  v_player RECORD;
  v_game_id UUID;
BEGIN
  -- Get player info
  SELECT * INTO v_player
  FROM matchmaking_queue
  WHERE wallet_address = player_wallet
    AND status = 'waiting';

  IF v_player IS NULL THEN
    -- Player not in queue or already matched
    RETURN QUERY SELECT false, NULL::TEXT, NULL::TEXT, NULL::UUID;
    RETURN;
  END IF;

  -- Find an opponent (oldest waiting player, not yourself)
  SELECT * INTO v_opponent
  FROM matchmaking_queue
  WHERE status = 'waiting'
    AND wallet_address != player_wallet
    AND expires_at > NOW()
  ORDER BY joined_at ASC
  LIMIT 1;

  IF v_opponent IS NULL THEN
    -- No opponent found
    RETURN QUERY SELECT false, NULL::TEXT, NULL::TEXT, NULL::UUID;
  ELSE
    -- Create a game
    v_game_id := gen_random_uuid();
    
    -- Update both players' status
    UPDATE matchmaking_queue
    SET status = 'matched', match_id = v_game_id
    WHERE wallet_address IN (player_wallet, v_opponent.wallet_address);
    
    -- Return match info
    RETURN QUERY SELECT 
      true,
      v_opponent.wallet_address,
      v_opponent.username,
      v_game_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- 7. Add game_type to games table if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'games' AND column_name = 'game_type'
  ) THEN
    ALTER TABLE games ADD COLUMN game_type TEXT DEFAULT 'friend';
  END IF;
END $$;

-- 8. Create view for active queue
CREATE OR REPLACE VIEW active_queue AS
SELECT 
  wallet_address,
  username,
  joined_at,
  status,
  expires_at
FROM matchmaking_queue
WHERE status = 'waiting'
  AND expires_at > NOW()
ORDER BY joined_at ASC;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Matchmaking system schema created successfully!';
  RAISE NOTICE 'Tables: matchmaking_queue';
  RAISE NOTICE 'Functions: cleanup_expired_queue_entries, find_match';
  RAISE NOTICE 'Views: active_queue';
END $$;
