import { supabase } from './supabase'

// Player operations (username only)
export const createOrUpdatePlayer = async (walletAddress, username) => {
  try {
    const { data, error } = await supabase
      .from('players')
      .upsert({
        wallet_address: walletAddress.toLowerCase(),
        username: username,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'wallet_address'
      })
      .select()
      .single()

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('Error creating/updating player:', error)
    return { success: false, error }
  }
}

export const getPlayer = async (walletAddress) => {
  try {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('wallet_address', walletAddress.toLowerCase())
      .single()

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('Error getting player:', error)
    return { success: false, error }
  }
}

export const getPlayerByUsername = async (username) => {
  try {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('username', username)
      .single()

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('Error getting player by username:', error)
    return { success: false, error }
  }
}

export const checkUsernameAvailable = async (username) => {
  try {
    const { data, error } = await supabase
      .from('players')
      .select('username')
      .eq('username', username)
      .single()

    // If no data found, username is available
    return { success: true, available: !data }
  } catch (error) {
    // Error means username doesn't exist (available)
    return { success: true, available: true }
  }
}

// Game operations (detailed history)
export const createGame = async (player1, player2, gameType = 'pvp') => {
  try {
    const { data, error } = await supabase
      .from('games')
      .insert({
        player1_address: player1.toLowerCase(),
        player2_address: player2 ? player2.toLowerCase() : null,
        game_type: gameType, // 'pvp', 'ai', 'random'
        status: 'in_progress',
        board: [0, 0, 0, 0, 0, 0, 0, 0, 0],
        current_turn: player1.toLowerCase(),
        moves: []
      })
      .select()
      .single()

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('Error creating game:', error)
    return { success: false, error }
  }
}

export const recordMove = async (gameId, position, player, board, moves) => {
  try {
    const { data, error } = await supabase
      .from('games')
      .update({
        board: board,
        moves: moves,
        updated_at: new Date().toISOString()
      })
      .eq('id', gameId)
      .select()
      .single()

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('Error recording move:', error)
    return { success: false, error }
  }
}

export const finishGame = async (gameId, winner, isDraw = false) => {
  try {
    const { data, error } = await supabase
      .from('games')
      .update({
        status: 'finished',
        winner_address: winner ? winner.toLowerCase() : null,
        is_draw: isDraw,
        finished_at: new Date().toISOString()
      })
      .eq('id', gameId)
      .select()
      .single()

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('Error finishing game:', error)
    return { success: false, error }
  }
}

export const getGame = async (gameId) => {
  try {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .eq('id', gameId)
      .single()

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('Error getting game:', error)
    return { success: false, error }
  }
}

export const getPlayerGames = async (walletAddress, limit = 10) => {
  try {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .or(`player1_address.eq.${walletAddress.toLowerCase()},player2_address.eq.${walletAddress.toLowerCase()}`)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('Error getting player games:', error)
    return { success: false, error }
  }
}

export const getRecentGames = async (limit = 20) => {
  try {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .eq('status', 'finished')
      .order('finished_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('Error getting recent games:', error)
    return { success: false, error }
  }
}


// ============================================
// FRIEND GAME FUNCTIONS (Real-time)
// ============================================

export const createFriendGame = async (playerAddress, gameCode) => {
  try {
    console.log(`🎮 Creating friend game with code: ${gameCode}`)
    
    const { data, error } = await supabase
      .from('games')
      .insert({
        game_code: gameCode,
        player1_address: playerAddress.toLowerCase(),
        player2_address: null,
        game_type: 'friend',
        status: 'waiting',
        board: [0, 0, 0, 0, 0, 0, 0, 0, 0],
        current_turn: playerAddress.toLowerCase(),
        code_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        moves: []
      })
      .select()
      .single()

    if (error) {
      console.error('❌ Error creating game:', error)
      throw error
    }
    
    console.log('✅ Game created successfully:', data)
    return { success: true, data }
  } catch (error) {
    console.error('❌ Error creating friend game:', error)
    return { success: false, error }
  }
}

export const joinFriendGame = async (gameCode, playerAddress) => {
  try {
    console.log(`🔍 Looking for game with code: ${gameCode}`)
    
    // Find game by code
    const { data: game, error: findError } = await supabase
      .from('games')
      .select('*')
      .eq('game_code', gameCode.toUpperCase())
      .eq('status', 'waiting')
      .single()

    if (findError || !game) {
      console.error('❌ Game not found:', findError)
      return { success: false, error: 'Game not found or already started' }
    }

    console.log('✅ Game found:', game)

    // Check if code expired
    if (new Date(game.code_expires_at) < new Date()) {
      console.error('❌ Game code expired')
      return { success: false, error: 'Game code has expired' }
    }

    console.log('🎮 Joining game...')

    // Join game
    const { data: updatedGame, error: updateError } = await supabase
      .from('games')
      .update({
        player2_address: playerAddress.toLowerCase(),
        status: 'in_progress',
        current_turn: game.player1_address // Player 1 goes first
      })
      .eq('id', game.id)
      .select()
      .single()

    if (updateError) {
      console.error('❌ Error updating game:', updateError)
      throw updateError
    }
    
    console.log('✅ Successfully joined game:', updatedGame)
    return { success: true, data: updatedGame }
  } catch (error) {
    console.error('❌ Error joining friend game:', error)
    return { success: false, error: error.message }
  }
}

export const makeFriendGameMove = async (gameId, position, playerAddress, newBoard) => {
  try {
    // Get current game state
    const { data: game, error: fetchError } = await supabase
      .from('games')
      .select('*')
      .eq('id', gameId)
      .single()

    if (fetchError) throw fetchError

    // Validate it's player's turn
    if (game.current_turn.toLowerCase() !== playerAddress.toLowerCase()) {
      return { success: false, error: 'Not your turn' }
    }

    // Validate position is empty
    if (game.board[position] !== 0) {
      return { success: false, error: 'Position already taken' }
    }

    // Determine next player
    const nextPlayer = game.current_turn.toLowerCase() === game.player1_address.toLowerCase()
      ? game.player2_address
      : game.player1_address

    // Update game
    const { data: updatedGame, error: updateError } = await supabase
      .from('games')
      .update({
        board: newBoard,
        current_turn: nextPlayer,
        moves: [...game.moves, { position, player: playerAddress.toLowerCase(), timestamp: new Date().toISOString() }]
      })
      .eq('id', gameId)
      .select()
      .single()

    if (updateError) throw updateError
    return { success: true, data: updatedGame }
  } catch (error) {
    console.error('Error making move:', error)
    return { success: false, error: error.message }
  }
}

export const finishFriendGame = async (gameId, winner, isDraw = false) => {
  try {
    const { data, error } = await supabase
      .from('games')
      .update({
        status: 'finished',
        winner_address: winner ? winner.toLowerCase() : null,
        is_draw: isDraw,
        finished_at: new Date().toISOString()
      })
      .eq('id', gameId)
      .select()
      .single()

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('Error finishing game:', error)
    return { success: false, error }
  }
}

export const subscribeToGame = (gameId, callback) => {
  console.log(`📡 Setting up real-time subscription for game ${gameId}`)
  
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
        console.log('📨 Real-time payload received:', payload)
        callback(payload.new)
      }
    )
    .subscribe((status) => {
      console.log(`📡 Subscription status: ${status}`)
      if (status === 'SUBSCRIBED') {
        console.log('✅ Successfully subscribed to game updates')
      } else if (status === 'CHANNEL_ERROR') {
        console.error('❌ Subscription error - check if real-time is enabled in Supabase')
      } else if (status === 'TIMED_OUT') {
        console.error('⏱️ Subscription timed out')
      }
    })

  return channel
}


// ============================================
// MATCHMAKING SYSTEM (Random Match)
// ============================================

export const joinMatchmakingQueue = async (walletAddress, username) => {
  try {
    console.log(`🎮 Joining matchmaking queue: ${username}`)
    
    // Remove any existing entry first
    await leaveMatchmakingQueue(walletAddress)
    
    const { data, error } = await supabase
      .from('matchmaking_queue')
      .insert({
        wallet_address: walletAddress.toLowerCase(),
        username: username,
        status: 'waiting',
        expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString() // 5 minutes
      })
      .select()
      .single()

    if (error) {
      console.error('❌ Error joining queue:', error)
      throw error
    }
    
    console.log('✅ Joined matchmaking queue:', data)
    return { success: true, data }
  } catch (error) {
    console.error('❌ Error joining matchmaking queue:', error)
    return { success: false, error: error.message }
  }
}

export const leaveMatchmakingQueue = async (walletAddress) => {
  try {
    const { error } = await supabase
      .from('matchmaking_queue')
      .delete()
      .eq('wallet_address', walletAddress.toLowerCase())

    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error('Error leaving matchmaking queue:', error)
    return { success: false, error: error.message }
  }
}

export const findMatch = async (walletAddress) => {
  try {
    console.log('🔍 Looking for match...')
    
    // Call the Postgres function to find a match
    const { data, error } = await supabase
      .rpc('find_match', { player_wallet: walletAddress.toLowerCase() })

    if (error) throw error
    
    if (data && data.length > 0 && data[0].match_found) {
      console.log('✅ Match found!', data[0])
      return {
        success: true,
        matched: true,
        opponent: {
          address: data[0].opponent_wallet,
          username: data[0].opponent_username
        },
        gameId: data[0].game_id
      }
    }
    
    console.log('⏳ No match found yet')
    return { success: true, matched: false }
  } catch (error) {
    console.error('❌ Error finding match:', error)
    return { success: false, error: error.message }
  }
}

export const getQueueStatus = async (walletAddress) => {
  try {
    const { data, error } = await supabase
      .from('matchmaking_queue')
      .select('*')
      .eq('wallet_address', walletAddress.toLowerCase())
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // Not in queue
        return { success: true, inQueue: false }
      }
      throw error
    }
    
    return { 
      success: true, 
      inQueue: true,
      status: data.status,
      matchId: data.match_id
    }
  } catch (error) {
    console.error('Error getting queue status:', error)
    return { success: false, error: error.message }
  }
}

export const createRandomGame = async (player1Address, player1Username, player2Address, player2Username, matchId) => {
  try {
    console.log(`🎮 Creating random game: ${player1Username} vs ${player2Username}`)
    
    const { data, error } = await supabase
      .from('games')
      .insert({
        id: matchId,
        player1_address: player1Address.toLowerCase(),
        player2_address: player2Address.toLowerCase(),
        game_type: 'random',
        status: 'in_progress',
        board: [0, 0, 0, 0, 0, 0, 0, 0, 0],
        current_turn: player1Address.toLowerCase(), // Player 1 goes first
        moves: []
      })
      .select()
      .single()

    if (error) {
      console.error('❌ Error creating random game:', error)
      throw error
    }
    
    console.log('✅ Random game created:', data)
    return { success: true, data }
  } catch (error) {
    console.error('❌ Error creating random game:', error)
    return { success: false, error: error.message }
  }
}

export const subscribeToMatchmaking = (walletAddress, onMatch) => {
  console.log(`📡 Subscribing to matchmaking updates for ${walletAddress}`)
  
  const channel = supabase
    .channel(`matchmaking:${walletAddress}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'matchmaking_queue',
        filter: `wallet_address=eq.${walletAddress.toLowerCase()}`
      },
      (payload) => {
        console.log('📨 Matchmaking update:', payload)
        if (payload.new.status === 'matched') {
          onMatch(payload.new)
        }
      }
    )
    .subscribe((status) => {
      console.log(`📡 Matchmaking subscription status: ${status}`)
    })

  return channel
}
