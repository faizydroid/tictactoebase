# 🚀 Supabase Real-Time Game Migration Guide

## Overview
This guide walks you through updating your Supabase database to support real-time friend games with code sharing.

---

## 📋 Prerequisites

- Supabase project already set up
- Existing `players` and `games` tables
- Access to Supabase SQL Editor

---

## 🔧 Step-by-Step Migration

### Step 1: Backup Current Data (Recommended)

```sql
-- Export current games (run in Supabase SQL Editor)
SELECT * FROM games;

-- Export current players
SELECT * FROM players;
```

Save the results as CSV or JSON for backup.

---

### Step 2: Run Migration Script

1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Click **New Query**
4. Copy the entire contents of `supabase-realtime-schema.sql`
5. Paste into the SQL Editor
6. Click **Run** (or press Ctrl+Enter)

You should see: `Schema updated successfully!`

---

### Step 3: Verify Migration

Run these queries to verify everything worked:

```sql
-- Check new columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'games' 
  AND column_name IN ('game_code', 'code_expires_at', 'last_activity_at', 'blockchain_game_id', 'blockchain_recorded');

-- Test code generation function
SELECT generate_game_code();

-- Check indexes
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'games';
```

---

### Step 4: Enable Real-Time (Important!)

1. In Supabase Dashboard, go to **Database** → **Replication**
2. Find the `games` table
3. Enable **Real-time** for the table
4. Check these events:
   - ✅ INSERT
   - ✅ UPDATE
   - ✅ DELETE

---

### Step 5: Test the System

Run this test query to create a sample game:

```sql
-- Create a test game with code
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
```

You should see a game with a 6-character code like "XJ4K9P".

---

## 🔍 What Changed?

### New Columns in `games` Table:

| Column | Type | Purpose |
|--------|------|---------|
| `game_code` | TEXT | 6-character code for joining (e.g., "XJ4K9P") |
| `code_expires_at` | TIMESTAMP | When the code expires (24 hours) |
| `last_activity_at` | TIMESTAMP | Last move/update time |
| `blockchain_game_id` | INTEGER | Reference to blockchain game ID |
| `blockchain_recorded` | BOOLEAN | Whether result is on blockchain |

### New Functions:

1. **`generate_game_code()`** - Creates unique 6-character codes
2. **`update_game_activity()`** - Auto-updates activity timestamp
3. **`cleanup_expired_games()`** - Marks old games as abandoned

### New Indexes:

- Fast code lookup
- Efficient waiting game queries
- Active game monitoring
- Expiration cleanup

### New Views:

- `waiting_games` - Games waiting for players
- `recent_games` - Recently finished games

---

## 🎮 How to Use in Your App

### Creating a Game:

```javascript
import { supabase } from './lib/supabase'

async function createFriendGame(playerAddress) {
  // Generate code using database function
  const { data: codeData } = await supabase
    .rpc('generate_game_code')
  
  const gameCode = codeData
  
  // Create game
  const { data, error } = await supabase
    .from('games')
    .insert({
      game_code: gameCode,
      player1_address: playerAddress,
      game_type: 'friend',
      status: 'waiting',
      board: [0,0,0,0,0,0,0,0,0],
      current_turn: playerAddress,
      code_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    })
    .select()
    .single()
  
  return { gameCode, gameId: data.id }
}
```

### Joining a Game:

```javascript
async function joinGameWithCode(code, playerAddress) {
  // Find game by code
  const { data: game, error } = await supabase
    .from('games')
    .select('*')
    .eq('game_code', code)
    .eq('status', 'waiting')
    .single()
  
  if (!game) {
    throw new Error('Game not found or already started')
  }
  
  // Join game
  const { data: updatedGame } = await supabase
    .from('games')
    .update({
      player2_address: playerAddress,
      status: 'in_progress'
    })
    .eq('id', game.id)
    .select()
    .single()
  
  return updatedGame
}
```

### Real-Time Subscription:

```javascript
function subscribeToGame(gameId, onUpdate) {
  const channel = supabase
    .channel(`game:${gameId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'games',
        filter: `id=eq.${gameId}`
      },
      (payload) => {
        onUpdate(payload.new)
      }
    )
    .subscribe()
  
  return channel
}

// Usage
const channel = subscribeToGame(gameId, (updatedGame) => {
  setBoard(updatedGame.board)
  setCurrentTurn(updatedGame.current_turn)
  setStatus(updatedGame.status)
})

// Cleanup
channel.unsubscribe()
```

### Making a Move:

```javascript
async function makeMove(gameId, newBoard, nextPlayer) {
  const { data, error } = await supabase
    .from('games')
    .update({
      board: newBoard,
      current_turn: nextPlayer
    })
    .eq('id', gameId)
    .select()
    .single()
  
  return data
}
```

---

## 🧹 Maintenance

### Clean Up Expired Games (Manual):

```sql
SELECT cleanup_expired_games();
```

### View Active Games:

```sql
SELECT * FROM waiting_games;
```

### Monitor Game Activity:

```sql
SELECT 
  status,
  COUNT(*) as count,
  AVG(EXTRACT(EPOCH FROM (NOW() - last_activity_at))) as avg_seconds_since_activity
FROM games
WHERE status IN ('waiting', 'in_progress')
GROUP BY status;
```

---

## 🔒 Security Notes

### Current Setup (Development):
- All operations allowed for testing
- RLS policies are permissive

### Production Recommendations:

1. **Remove development policy:**
```sql
DROP POLICY "Allow all for development" ON games;
```

2. **Implement proper authentication:**
- Use Supabase Auth
- Set JWT claims with wallet address
- Enforce player-specific policies

3. **Add validation:**
- Validate moves server-side
- Check turn order
- Prevent cheating

---

## 🐛 Troubleshooting

### Issue: Real-time not working

**Solution:**
1. Check Database → Replication → Enable for `games` table
2. Verify subscription code is correct
3. Check browser console for errors

### Issue: Code generation fails

**Solution:**
```sql
-- Test function
SELECT generate_game_code();

-- If fails, recreate function
DROP FUNCTION IF EXISTS generate_game_code();
-- Then re-run migration script
```

### Issue: Games not expiring

**Solution:**
```sql
-- Manually run cleanup
SELECT cleanup_expired_games();

-- Check expired games
SELECT * FROM games 
WHERE status = 'waiting' 
  AND code_expires_at < NOW();
```

---

## ✅ Migration Checklist

- [ ] Backup existing data
- [ ] Run migration script
- [ ] Verify new columns exist
- [ ] Test code generation function
- [ ] Enable real-time replication
- [ ] Test creating a game with code
- [ ] Test joining a game with code
- [ ] Test real-time updates
- [ ] Update application code
- [ ] Test end-to-end gameplay

---

## 📚 Next Steps

1. Update `lib/supabaseService.js` with new functions
2. Create friend game page (`pages/game/friend/[id].js`)
3. Implement real-time subscriptions
4. Add UI for code sharing
5. Test with a friend!

---

## 🎉 Success!

Your database is now ready for real-time friend games with code sharing!

Players can:
- ✅ Create games with simple codes
- ✅ Join games instantly
- ✅ Play in real-time
- ✅ No wallet addresses needed
- ✅ Free gameplay (no gas fees)
