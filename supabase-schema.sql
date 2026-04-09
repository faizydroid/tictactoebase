-- Create players table (username only, stats come from blockchain)
CREATE TABLE IF NOT EXISTS players (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create games table (detailed game history)
CREATE TABLE IF NOT EXISTS games (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player1_address TEXT NOT NULL,
  player2_address TEXT,
  game_type TEXT NOT NULL, -- 'pvp', 'ai', 'random'
  status TEXT NOT NULL DEFAULT 'in_progress', -- 'in_progress', 'finished'
  board INTEGER[] DEFAULT ARRAY[0,0,0,0,0,0,0,0,0],
  current_turn TEXT,
  winner_address TEXT,
  is_draw BOOLEAN DEFAULT FALSE,
  moves JSONB DEFAULT '[]'::jsonb, -- Array of moves for replay
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  finished_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_players_wallet ON players(wallet_address);
CREATE INDEX IF NOT EXISTS idx_players_username ON players(username);
CREATE INDEX IF NOT EXISTS idx_games_player1 ON games(player1_address);
CREATE INDEX IF NOT EXISTS idx_games_player2 ON games(player2_address);
CREATE INDEX IF NOT EXISTS idx_games_status ON games(status);
CREATE INDEX IF NOT EXISTS idx_games_created ON games(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;

-- Create policies for players table (allow all operations for now)
CREATE POLICY "Allow all operations on players" ON players
  FOR ALL USING (true) WITH CHECK (true);

-- Create policies for games table (allow all operations for now)
CREATE POLICY "Allow all operations on games" ON games
  FOR ALL USING (true) WITH CHECK (true);
