import { useState } from 'react'
import { useRouter } from 'next/router'
import { useWeb3 } from '../context/Web3Context'
import GameCodeModal from './GameCodeModal'

export default function GameLobby() {
  const router = useRouter()
  const { account, playerData } = useWeb3()
  const [gameMode, setGameMode] = useState(null)
  const [friendMode, setFriendMode] = useState(null) // 'create' or 'join'
  const [friendCode, setFriendCode] = useState('')
  const [searching, setSearching] = useState(false)
  const [creating, setCreating] = useState(false)
  const [showCodeModal, setShowCodeModal] = useState(false)
  const [generatedCode, setGeneratedCode] = useState('')
  const [matchFound, setMatchFound] = useState(false)
  const [opponent, setOpponent] = useState(null)
  const [countdown, setCountdown] = useState(5)
  const [matchedGameId, setMatchedGameId] = useState(null)

  const handlePlayWithFriend = () => {
    setGameMode('friend')
  }

  const handleCreateGame = () => {
    setFriendMode('create')
  }

  const handleJoinGame = () => {
    setFriendMode('join')
  }

  const handleCreateGameWithCode = async () => {
    setCreating(true)
    try {
      // Generate a random 6-character code
      const gameCode = Math.random().toString(36).substring(2, 8).toUpperCase()
      
      // Create game in Supabase
      const { createFriendGame } = await import('../lib/supabaseService')
      const result = await createFriendGame(account, gameCode)
      
      if (result.success) {
        // Store the game code and show modal (don't navigate yet)
        setGeneratedCode(gameCode)
        setShowCodeModal(true)
        // Store game ID for later navigation
        window.friendGameId = result.data.id
      } else {
        alert('Failed to create game. Please try again.')
      }
    } catch (error) {
      console.error('Error creating game:', error)
      alert('Error creating game: ' + error.message)
    }
    setCreating(false)
  }

  const handlePlayRandom = async () => {
    setGameMode('random')
    setSearching(true)
    
    try {
      const { joinMatchmakingQueue, findMatch, subscribeToMatchmaking, getQueueStatus, getGame, leaveMatchmakingQueue } = await import('../lib/supabaseService')
      
      // Join the matchmaking queue
      const joinResult = await joinMatchmakingQueue(account, playerData?.username || 'Player')
      
      if (!joinResult.success) {
        alert('Failed to join matchmaking queue. Please try again.')
        setSearching(false)
        setGameMode(null)
        return
      }
      
      console.log('✅ Joined queue, looking for match...')
      
      // Subscribe to updates FIRST (before trying to find match)
      let pollInterval
      const channel = subscribeToMatchmaking(account, async (queueData) => {
        console.log('🎉 Match found via subscription!', queueData)
        
        if (queueData.status === 'matched' && queueData.match_id) {
          // Clear polling
          if (pollInterval) clearInterval(pollInterval)
          channel.unsubscribe()
          
          // Get game details
          const gameResult = await getGame(queueData.match_id)
          if (gameResult.success) {
            const game = gameResult.data
            // Determine opponent
            const isPlayer1 = game.player1_address.toLowerCase() === account.toLowerCase()
            const opponentAddress = isPlayer1 ? game.player2_address : game.player1_address
            
            // Try to get opponent username from players table
            const { getPlayer } = await import('../lib/supabaseService')
            const opponentResult = await getPlayer(opponentAddress)
            const opponentUsername = opponentResult.success && opponentResult.data 
              ? opponentResult.data.username 
              : 'Opponent'
            
            await handleMatchFound({ address: opponentAddress, username: opponentUsername }, queueData.match_id)
          }
        }
      })
      
      // Try to find a match immediately
      const matchResult = await findMatch(account)
      
      if (matchResult.success && matchResult.matched) {
        // Match found immediately!
        console.log('🎉 Instant match found!')
        if (pollInterval) clearInterval(pollInterval)
        channel.unsubscribe()
        await handleMatchFound(matchResult.opponent, matchResult.gameId)
        return
      }
      
      // No immediate match, poll for matches every 2 seconds as backup
      console.log('⏳ Waiting for opponent...')
      pollInterval = setInterval(async () => {
        const queueStatus = await getQueueStatus(account)
        if (queueStatus.success && queueStatus.inQueue && queueStatus.status === 'matched' && queueStatus.matchId) {
          clearInterval(pollInterval)
          channel.unsubscribe()
          
          // Get game details
          const gameResult = await getGame(queueStatus.matchId)
          if (gameResult.success) {
            const game = gameResult.data
            const isPlayer1 = game.player1_address.toLowerCase() === account.toLowerCase()
            const opponentAddress = isPlayer1 ? game.player2_address : game.player1_address
            
            // Get opponent username
            const { getPlayer } = await import('../lib/supabaseService')
            const opponentResult = await getPlayer(opponentAddress)
            const opponentUsername = opponentResult.success && opponentResult.data 
              ? opponentResult.data.username 
              : 'Opponent'
            
            await handleMatchFound({ address: opponentAddress, username: opponentUsername }, queueStatus.matchId)
          }
        }
      }, 2000)
      
      // Cleanup function
      const cleanup = () => {
        clearInterval(pollInterval)
        channel.unsubscribe()
        leaveMatchmakingQueue(account)
      }
      
      // Store cleanup function for cancel button
      window.matchmakingCleanup = cleanup
      
    } catch (error) {
      console.error('Error in matchmaking:', error)
      alert('Error finding opponent. Please try again.')
      setSearching(false)
      setGameMode(null)
    }
  }
  
  const handleMatchFound = async (opponentData, gameId) => {
    const { createRandomGame, leaveMatchmakingQueue } = await import('../lib/supabaseService')
    
    setOpponent(opponentData)
    setMatchedGameId(gameId)
    setSearching(false)
    setMatchFound(true)
    
    // Create the game in Supabase
    await createRandomGame(
      account,
      playerData?.username || 'Player',
      opponentData.address,
      opponentData.username,
      gameId
    )
    
    // Leave queue
    await leaveMatchmakingQueue(account)
    
    // Start countdown
    let count = 5
    const countdownInterval = setInterval(() => {
      count--
      setCountdown(count)
      
      if (count === 0) {
        clearInterval(countdownInterval)
        // Navigate to game
        router.push(`/game/friend/${gameId}`)
      }
    }, 1000)
  }
  
  const handleCancelSearch = async () => {
    const { leaveMatchmakingQueue } = await import('../lib/supabaseService')
    
    // Call cleanup if it exists
    if (window.matchmakingCleanup) {
      window.matchmakingCleanup()
      delete window.matchmakingCleanup
    }
    
    await leaveMatchmakingQueue(account)
    setSearching(false)
    setGameMode(null)
  }

  const handlePlayAI = () => {
    router.push('/ai-game')
  }

  const handleJoinWithCode = async () => {
    if (friendCode.length === 0) return
    
    setCreating(true)
    try {
      const { joinFriendGame } = await import('../lib/supabaseService')
      const result = await joinFriendGame(friendCode.toUpperCase(), account)
      
      if (result.success) {
        // Navigate to game
        router.push(`/game/friend/${result.data.id}`)
      } else {
        alert(result.error || 'Failed to join game. Please check the code and try again.')
      }
    } catch (error) {
      console.error('Error joining game:', error)
      alert('Error joining game: ' + error.message)
    }
    setCreating(false)
  }

  const handleBack = () => {
    if (friendMode) {
      setFriendMode(null)
    } else {
      setGameMode(null)
    }
  }

  return (
    <>
      <div>
      {!gameMode && (
        <div className="space-y-3">
          <h3 className="text-lg font-black mb-3">Choose Mode</h3>
          
          {/* Game Mode Buttons - Compact Grid */}
          <div className="grid grid-cols-1 gap-2">
            {/* AI Mode */}
            <button
              onClick={handlePlayAI}
              className="mini-card p-3 hover-lift text-left bg-gradient-to-r from-purple-50 to-pink-50"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-black">Play vs AI</div>
                  <div className="text-xs text-gray-600">Challenge the AI</div>
                </div>
              </div>
            </button>

            {/* Friend Mode */}
            <button
              onClick={handlePlayWithFriend}
              className="mini-card p-3 hover-lift text-left bg-gradient-to-r from-blue-50 to-cyan-50"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-black">Play with Friend</div>
                  <div className="text-xs text-gray-600">Create or join game</div>
                </div>
              </div>
            </button>

            {/* Random Mode */}
            <button
              onClick={handlePlayRandom}
              className="mini-card p-3 hover-lift text-left bg-gradient-to-r from-green-50 to-emerald-50"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-black">Random Match</div>
                  <div className="text-xs text-gray-600">Find opponent</div>
                </div>
              </div>
            </button>
          </div>
        </div>
      )}

      {gameMode === 'friend' && !friendMode && (
        <div className="space-y-3 slide-up">
          <h3 className="text-lg font-black mb-3">Play with Friend</h3>
          
          <div className="grid grid-cols-1 gap-2">
            {/* Create Game */}
            <button
              onClick={handleCreateGame}
              className="mini-card p-4 hover-lift text-left bg-gradient-to-r from-green-50 to-emerald-50"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-black">Create Game</div>
                  <div className="text-xs text-gray-600">Get a code to share</div>
                </div>
                <div className="text-2xl">➕</div>
              </div>
            </button>

            {/* Join Game */}
            <button
              onClick={handleJoinGame}
              className="mini-card p-4 hover-lift text-left bg-gradient-to-r from-blue-50 to-cyan-50"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-black">Join Game</div>
                  <div className="text-xs text-gray-600">Enter friend's code</div>
                </div>
                <div className="text-2xl">🔗</div>
              </div>
            </button>
          </div>

          <button onClick={handleBack} className="btn-secondary w-full mt-3">
            Back
          </button>
        </div>
      )}

      {friendMode === 'create' && (
        <div className="space-y-3 slide-up">
          <div className="mini-card p-4 bg-gradient-to-br from-green-50 to-emerald-50">
            <h3 className="text-lg font-black mb-3">Create Game</h3>
            <p className="text-xs text-gray-600 mb-3">Generate a code to share with your friend</p>
            
            <button
              onClick={handleCreateGameWithCode}
              disabled={creating}
              className="w-full btn-success disabled:opacity-50"
            >
              {creating ? 'Creating...' : '🎮 Generate Game Code'}
            </button>
            
            <div className="mt-3 p-2 bg-blue-50 rounded-lg border-2 border-blue-200">
              <p className="text-xs text-gray-700 text-center">
                💡 Your friend can join using the code
              </p>
            </div>
          </div>
          
          <button onClick={handleBack} className="btn-secondary w-full">
            Back
          </button>
        </div>
      )}

      {friendMode === 'join' && (
        <div className="space-y-3 slide-up">
          <div className="mini-card p-4 bg-yellow-50">
            <h3 className="text-lg font-black mb-3">Join Friend's Game</h3>
            <div className="text-xs font-bold text-gray-700 mb-2">Enter Game ID</div>
            <div className="flex gap-2">
              <input
                type="text"
                value={friendCode}
                onChange={(e) => setFriendCode(e.target.value)}
                placeholder="Game ID"
                className="flex-1 px-3 py-2 bg-white border-2 border-black rounded-lg 
                         focus:border-purple-600 outline-none text-black placeholder-gray-400 
                         font-mono text-center text-sm font-bold shadow-bold"
              />
              <button
                onClick={handleJoinWithCode}
                disabled={!friendCode}
                className="btn-success disabled:opacity-50"
              >
                Join
              </button>
            </div>
          </div>
          
          <button onClick={handleBack} className="btn-secondary w-full">
            Back
          </button>
        </div>
      )}

      {gameMode === 'random' && searching && (
        <div className="text-center space-y-3 slide-up">
          <div className="mini-card p-6 bg-gradient-to-br from-green-50 to-emerald-50">
            <div className="mb-4">
              <svg className="animate-spin h-12 w-12 text-green-600 mx-auto" viewBox="0 0 24 24" strokeWidth={4}>
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" fill="none"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            
            <h3 className="text-lg font-black mb-1">Finding Opponent</h3>
            <p className="text-xs text-gray-600 mb-3">Looking for players...</p>
            
            <div className="flex items-center justify-center gap-1">
              <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
          
          <button
            onClick={handleCancelSearch}
            className="btn-danger w-full"
          >
            Cancel Search
          </button>
        </div>
      )}
    </div>

    {/* Game Code Modal */}
    <GameCodeModal 
      isOpen={showCodeModal}
      onClose={() => setShowCodeModal(false)}
      gameCode={generatedCode}
    />

    {/* Match Found Screen */}
    {matchFound && opponent && (
      <>
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40"></div>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-gradient-to-br from-blue-600 to-purple-700 rounded-3xl p-8 text-center relative overflow-hidden shadow-2xl">
            {/* Diagonal Yellow Stripe */}
            <div className="absolute top-0 left-0 w-full h-full">
              <div className="absolute top-1/2 left-1/2 w-[150%] h-24 bg-yellow-400 transform -translate-x-1/2 -translate-y-1/2 rotate-12"></div>
            </div>

            {/* Content */}
            <div className="relative z-10">
              {/* Title */}
              <div className="mb-8">
                <div className="text-2xl font-black text-black mb-2">found</div>
                <div className="text-5xl font-black text-white tracking-wider">match</div>
              </div>

              {/* Player 1 */}
              <div className="mb-4">
                <div className="text-4xl font-black text-white" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                  {playerData?.username || 'You'}
                </div>
              </div>

              {/* VS */}
              <div className="my-6 relative">
                <div className="text-7xl font-black text-white" style={{ 
                  fontFamily: 'Comic Sans MS, cursive',
                  textShadow: '4px 4px 0px rgba(0,0,0,0.3)'
                }}>
                  VS
                </div>
              </div>

              {/* Player 2 */}
              <div className="mb-8">
                <div className="text-4xl font-black text-white" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                  {opponent.username}
                </div>
              </div>

              {/* Countdown */}
              <div className="mt-8">
                <div className="text-sm font-bold text-white mb-2">Starting game in</div>
                <div className="text-6xl font-black text-yellow-400 animate-pulse">
                  {countdown}
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    )}
    </>
  )
}
