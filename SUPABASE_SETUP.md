# Supabase Setup Guide

This guide will help you set up Supabase for your TicTacToe game.

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in:
   - Project name: `tictactoe-game`
   - Database password: (create a strong password)
   - Region: Choose closest to your users
5. Click "Create new project"

## Step 2: Run the Database Schema

1. In your Supabase project, go to the SQL Editor
2. Click "New Query"
3. Copy the entire content from `supabase-schema.sql`
4. Paste it into the SQL editor
5. Click "Run" to execute the schema

This will create:
- `players` table - stores player information and stats
- `games` table - stores all game data
- Indexes for better performance
- A function to increment player stats
- Row Level Security policies

## Step 3: Get Your API Keys

1. In your Supabase project, go to Settings > API
2. Copy the following values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

## Step 4: Update Environment Variables

1. Open your `.env.local` file
2. Add the following lines:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

3. Replace the values with your actual Supabase credentials
4. Save the file

## Step 5: Restart Your Development Server

```bash
npm run dev
```

## Database Schema

### Players Table (Username Storage Only)
- `id` - UUID (primary key)
- `wallet_address` - TEXT (unique, wallet address)
- `username` - TEXT (unique, player username)
- `created_at` - TIMESTAMP
- `updated_at` - TIMESTAMP

**Note:** Stats (wins, losses, draws, games_played) are stored on the blockchain, not in Supabase.

### Games Table (Detailed Game History)
- `id` - UUID (primary key)
- `player1_address` - TEXT (first player wallet)
- `player2_address` - TEXT (second player wallet, null for AI)
- `game_type` - TEXT ('pvp', 'ai', 'random')
- `status` - TEXT ('in_progress', 'finished')
- `board` - INTEGER[] (9 elements, 0=empty, 1=player1, 2=player2)
- `current_turn` - TEXT (wallet address of current player)
- `winner_address` - TEXT (wallet address of winner)
- `is_draw` - BOOLEAN
- `moves` - JSONB (array of moves for game replay)
- `created_at` - TIMESTAMP
- `updated_at` - TIMESTAMP
- `finished_at` - TIMESTAMP

## Hybrid Architecture

This app uses a hybrid approach:

### Supabase (Off-Chain)
- Player usernames
- Detailed game history
- Move-by-move replay data
- Game timestamps

### Blockchain (On-Chain)
- Player stats (wins, losses, draws, games_played)
- Official game results
- Leaderboard rankings

This approach provides:
- Fast username lookups
- Detailed game history without blockchain costs
- Verifiable stats on the blockchain
- Lower gas costs (only final results on-chain)

## Security

The current setup uses permissive RLS policies for development. For production, you should:

1. Restrict write operations to authenticated users
2. Add proper validation rules
3. Implement user authentication
4. Add rate limiting

## Troubleshooting

### Connection Issues
- Verify your Supabase URL and anon key are correct
- Check that your project is not paused (free tier pauses after inactivity)
- Ensure you're using the correct environment variables

### Schema Issues
- Make sure you ran the entire `supabase-schema.sql` file
- Check the SQL Editor for any error messages
- Verify tables were created in the Table Editor

### Data Not Showing
- Check browser console for errors
- Verify RLS policies are enabled
- Check Supabase logs in the project dashboard
