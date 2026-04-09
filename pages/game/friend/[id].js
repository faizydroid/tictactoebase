import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import { useWeb3 } from '../../../context/Web3Context'
import GameBoard from '../../../components/GameBoard'
import AnimatedBackground from '../../../components/AnimatedBackground'
import Modal from '../../../components/Modal'
import { getGame, makeFriendGameMove, finishFriendGame, subscribeToGame } from '../../../lib/supabaseService'

export default function FriendGamePage() {
  const router = useRouter()
  const { id } = router.query
  const { account, recordGameResult, contract, playerData } = useWeb3()
  
  const [game, setGame] = useState(null)
  const [loading, setLoading] = useState(true)
  const [makingMove, setMakingMove] = useState(false)
  const [gameResult, setGameResult] = useState(null)
  const [winningLine, setWinningLine] = useState(null)
  const [showResultScreen, setShowResultScreen] = useState(false)
  const [transactionStatus, setTransactionStatus] = useState(null)
  const [gameKey, setGameKey] = useState(0)
  const [modal, setModal] = useState({ show: false, message: '', type: 'error', title: '' })
  const [isPolling, setIsPolling] = useState(false)
  const [opponentLeft, setOpponentLeft] = useState(false)
  
  const channelRef = useRef(null)
  const pollIntervalRef = useRef(null)

  // Load game and subscribe to updates
  useEffect(() => {
    if (!id || !account) return

    loadGame()

    // Subscribe to real-time updates
    const channel = subscribeToGame(id, (updatedGame) => {
      console.log('Real-time update received:', updatedGame)
      setGame(updatedGame)
      
      // Check if game was abandoned
      if (updatedGame.status === 'abandoned' && !opponentLeft) {
        setOpponentLeft(true)
        return
      }
      
      // Stop polling if it's running
      if (pollIntervalRef.current && updatedGame.status !== 'waiting') {
        console.log('Game started via real-time! Stopping polling.')
        clearInterval(pollIntervalRef.current)
        pollIntervalRef.current = null
        setIsPolling(false)
      }
      
      // Check if game finished
      if (updatedGame.status === 'finished' && !gameResult) {
        handleGameFinished(updatedGame)
      }
    })

    channelRef.current = channel

    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe()
      }
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
      }
    }
  }, [id, account])

  // Start polling when game is in waiting status
  useEffect(() => {
    if (game?.status === 'waiting' && !isPolling && !pollIntervalRef.current) {
      console.log('⏳ Starting polling for game updates...')
      setIsPolling(true)
      
      pollIntervalRef.current = setInterval(async () => {
        console.log('Polling for game updates...')
        const result = await getGame(id)
        if (result.success) {
          if (result.data.status !== 'waiting') {
            console.log('Game started via polling! Stopping polling.')
            setGame(result.data)
            clearInterval(pollIntervalRef.current)
            pollIntervalRef.current = null
            setIsPolling(false)
          }
        }
      }, 2000) // Poll every 2 seconds
    }

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
        pollIntervalRef.current = null
      }
    }
  }, [game?.status, id, isPolling])

  const loadGame = async () => {
    try {
      const result = await getGame(id)
      if (result.success) {
        setGame(result.data)
        
        // Check if game is finished
        if (result.data.status === 'finished') {
          handleGameFinished(result.data)
        }
      } else {
        // Don't use alert, set error state instead
        setGame({ error: 'not_found' })
      }
    } catch (error) {
      console.error('Error loading game:', error)
      setGame({ error: 'load_error' })
    }
    setLoading(false)
  }

  const checkWinner = (board) => {
    const winPatterns = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ]

    for (const pattern of winPatterns) {
      const [a, b, c] = pattern
      if (board[a] !== 0 && board[a] === board[b] && board[b] === board[c]) {
        return { winner: board[a], line: pattern }
      }
    }

    if (board.every(cell => cell !== 0)) {
      return { winner: 'draw', line: null }
    }

    return null
  }

  const handleMove = async (position) => {
    if (!game || makingMove || game.status !== 'in_progress') return
    if (game.current_turn.toLowerCase() !== account.toLowerCase()) return
    if (game.board[position] !== 0) return

    setMakingMove(true)

    try {
      // Determine player number (1 or 2)
      const playerNumber = game.player1_address.toLowerCase() === account.toLowerCase() ? 1 : 2
      
      // Create new board
      const newBoard = [...game.board]
      newBoard[position] = playerNumber

      // Make move in Supabase
      const result = await makeFriendGameMove(id, position, account, newBoard)

      if (result.success) {
        // Check for winner
        const winCheck = checkWinner(newBoard)
        if (winCheck) {
          // Determine winner address
          let winnerAddress = null
          if (winCheck.winner === 1) {
            winnerAddress = game.player1_address
          } else if (winCheck.winner === 2) {
            winnerAddress = game.player2_address
          }

          // Finish game in Supabase
          await finishFriendGame(id, winnerAddress, winCheck.winner === 'draw')
          
          // Set local state
          setWinningLine(winCheck.line)
          setGameResult({
            type: winCheck.winner === 'draw' ? 'draw' : 
                  (winnerAddress.toLowerCase() === account.toLowerCase() ? 'win' : 'lose')
          })

          // Show result screen after animations
          setTimeout(() => {
            setShowResultScreen(true)
            // Transaction will be recorded by handleGameFinished via real-time update
          }, 1200)
        }
      } else {
        setModal({ show: true, message: result.error || 'Failed to make move', type: 'error', title: 'Error' })
      }
    } catch (error) {
      console.error('Error making move:', error)
      setModal({ show: true, message: 'Error making move', type: 'error', title: 'Error' })
    }

    setMakingMove(false)
  }

  const handleGameFinished = (finishedGame) => {
    console.log('Game finished, handling result...')
    
    // Determine result type
    let resultType = 'draw'
    let resultCode = 2 // 0=loss, 1=win, 2=draw
    
    if (finishedGame.is_draw) {
      resultType = 'draw'
      resultCode = 2
    } else if (finishedGame.winner_address.toLowerCase() === account.toLowerCase()) {
      resultType = 'win'
      resultCode = 1
    } else {
      resultType = 'lose'
      resultCode = 0
    }

    console.log('Result type:', resultType, 'Result code:', resultCode)

    setGameResult({ type: resultType })
    
    // Find winning line
    const winCheck = checkWinner(finishedGame.board)
    if (winCheck && winCheck.line) {
      setWinningLine(winCheck.line)
    }

    setTimeout(() => {
      setShowResultScreen(true)
      // Record transaction for this player too!
      recordTransaction(resultCode)
    }, 1200)
  }

  const recordTransaction = async (result) => {
    console.log('Recording transaction for result:', result === 0 ? 'Loss' : result === 1 ? 'Win' : 'Draw')
    console.log('Contract available:', !!contract)
    console.log('Player data:', playerData)
    console.log('Account:', account)
    
    setTransactionStatus('pending')
    try {
      // result: 0 = loss, 1 = win, 2 = draw
      const success = await recordGameResult(result)
      console.log('Record result:', success)
      if (success) {
        setTransactionStatus('confirmed')
      } else {
        console.error('recordGameResult returned false')
        setTransactionStatus(null)
      }
    } catch (error) {
      console.error('Error recording game result:', error)
      setTransactionStatus(null)
    }
  }

  const handlePlayAgain = () => {
    router.push('/')
  }

  const handleQuit = () => {
    // Mark game as abandoned when quitting
    if (game && game.status === 'in_progress') {
      const { abandonGame } = require('../../../lib/supabaseService')
      abandonGame(id)
    }
    router.push('/')
  }

  if (!account) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <div className="compact-card text-center max-w-sm">
          <h2 className="text-xl font-black mb-2">Connect Wallet</h2>
          <p className="text-gray-600 text-sm mb-4">Please connect your wallet</p>
          <button onClick={() => router.push('/')} className="btn-primary w-full">
            Go to Home
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <div className="compact-card text-center p-6">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-black border-t-purple-500 mb-3"></div>
          <div className="text-lg font-black">Loading Game...</div>
        </div>
      </div>
    )
  }

  // Error states with better UI
  if (game?.error === 'not_found') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 relative">
        <AnimatedBackground />
        <div className="compact-card text-center max-w-md relative z-10 p-8">
          <div className="text-6xl mb-4 font-black">?</div>
          <h2 className="text-2xl font-black mb-3 gradient-text">Game Not Found</h2>
          <p className="text-gray-600 text-sm mb-6">
            This game doesn't exist or has already started. Please check the game code and try again.
          </p>
          <div className="space-y-2">
            <button onClick={() => router.push('/')} className="btn-primary w-full">
              Back to Home
            </button>
            <button onClick={() => router.back()} className="btn-secondary w-full">
              Go Back
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (game?.error === 'load_error') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 relative">
        <AnimatedBackground />
        <div className="compact-card text-center max-w-md relative z-10 p-8">
          <div className="text-6xl mb-4 font-black">!</div>
          <h2 className="text-2xl font-black mb-3 text-red-600">Error Loading Game</h2>
          <p className="text-gray-600 text-sm mb-6">
            Something went wrong while loading the game. Please try again.
          </p>
          <div className="space-y-2">
            <button onClick={() => window.location.reload()} className="btn-primary w-full">
              Retry
            </button>
            <button onClick={() => router.push('/')} className="btn-secondary w-full">
              Back to Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!game) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 relative">
        <AnimatedBackground />
        <div className="compact-card text-center max-w-md relative z-10 p-8">
          <div className="text-6xl mb-4 font-black">?</div>
          <h2 className="text-2xl font-black mb-3">No Game Data</h2>
          <p className="text-gray-600 text-sm mb-6">Unable to load game information.</p>
          <button onClick={() => router.push('/')} className="btn-primary w-full">
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  const isMyTurn = game.current_turn && game.current_turn.toLowerCase() === account.toLowerCase()
  const amPlayer1 = game.player1_address.toLowerCase() === account.toLowerCase()
  const isWaiting = game.status === 'waiting'

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 relative">
      <AnimatedBackground />

      {/* Header */}
      <div className="header-compact flex items-center justify-between relative z-10">
        <button onClick={handleQuit} className="text-gray-600 hover:text-black text-sm font-bold">
          ← Back
        </button>
        <div className="text-xs font-bold text-gray-600">
          {game.game_code ? `Code: ${game.game_code}` : 'Friend Game'}
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-3 max-w-md mx-auto relative z-10">
        {/* Waiting for Opponent */}
        {isWaiting && (
          <div className="mb-3 compact-card bg-yellow-50 text-center p-4">
            <div className="text-2xl mb-2 font-black">WAITING</div>
            <div className="text-lg font-black mb-1">Waiting for Opponent</div>
            <p className="text-xs text-gray-600 mb-3">Share code: <span className="font-mono font-black">{game.game_code}</span></p>
            <div className="flex items-center justify-center gap-1">
              <div className="w-2 h-2 bg-yellow-600 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-yellow-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-yellow-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        )}

        {/* Status + Turn Indicator */}
        {!isWaiting && (
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs font-bold">
              {gameResult ? (
                <span className="text-gray-600">Game Over</span>
              ) : isMyTurn ? (
                <span className="text-blue-600 flex items-center gap-1">
                  <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
                  Your Turn
                </span>
              ) : (
                <span className="text-pink-600 flex items-center gap-1">
                  <span className="w-2 h-2 bg-pink-600 rounded-full animate-pulse"></span>
                  Opponent's Turn
                </span>
              )}
            </div>

            <div className="stat-pill bg-purple-100 text-purple-700">
              <span className="text-xs">You are</span>
              <span className="font-black">{amPlayer1 ? 'X' : 'O'}</span>
            </div>
          </div>
        )}

        {/* Game Board */}
        <div className="mb-3">
          <GameBoard
            key={gameKey}
            board={game.board}
            onMove={handleMove}
            disabled={isWaiting || !isMyTurn || gameResult !== null || makingMove}
            playerNumber={amPlayer1 ? 1 : 2}
            gameResult={gameResult}
            winningLine={winningLine}
          />
        </div>

        {/* Making Move Indicator */}
        {makingMove && (
          <div className="compact-card text-center mb-3 bg-blue-50">
            <div className="flex items-center justify-center gap-2 py-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
              <span className="text-sm font-bold text-blue-700">Making move...</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {!gameResult && !isWaiting && (
          <div className="flex gap-2">
            <button onClick={handleQuit} className="flex-1 btn-secondary text-xs">
              Quit Game
            </button>
          </div>
        )}
      </div>

      {/* Result Screen Overlay */}
      {showResultScreen && (
        <>
          <div className="game-overlay"></div>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="result-screen compact-card max-w-sm w-full p-8 text-center bg-white">
              {/* Result Title */}
              <div className="result-title mb-4">
                {gameResult.type === 'win' && (
                  <div>
                    <div className="text-4xl font-black gradient-text mb-2">YOU WIN!</div>
                  </div>
                )}
                {gameResult.type === 'lose' && (
                  <div>
                    <div className="text-4xl font-black text-purple-700 mb-2">YOU LOSE</div>
                  </div>
                )}
                {gameResult.type === 'draw' && (
                  <div>
                    <div className="text-4xl font-black text-yellow-700 mb-2">IT'S A DRAW!</div>
                  </div>
                )}
              </div>

              {/* Transaction Status */}
              <div className="result-subtitle mb-6">
                {transactionStatus === 'pending' && (
                  <div className="transaction-pending text-sm text-gray-600 font-bold">
                    Recording transaction
                    <span className="loading-dots ml-1">
                      <span></span>
                      <span></span>
                      <span></span>
                    </span>
                  </div>
                )}
                {transactionStatus === 'confirmed' && (
                  <div className="transaction-confirmed text-sm text-green-600 font-bold flex items-center justify-center gap-2">
                    <span>Transaction Confirmed</span>
                  </div>
                )}
                {transactionStatus === null && (
                  <div className="text-sm text-gray-500 font-medium">
                    No transaction recorded
                  </div>
                )}
              </div>

              {/* Buttons */}
              <div className="result-buttons flex gap-3">
                <button onClick={handlePlayAgain} className="flex-1 btn-success">
                   Play Again
                </button>
                <button onClick={handleQuit} className="flex-1 btn-secondary">
                   Quit
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Opponent Left Popup */}
      {opponentLeft && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-70 z-50"></div>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="compact-card max-w-sm w-full p-8 text-center bg-white relative z-10">
              <div className="text-6xl mb-4 font-black">X</div>
              <h2 className="text-2xl font-black mb-3 text-gray-900">Opponent Left</h2>
              <p className="text-gray-600 text-sm mb-6">
                Your opponent has left the game.
              </p>
              <button
                onClick={() => router.push('/')}
                className="btn-primary w-full py-3"
              >
                Go Home
              </button>
            </div>
          </div>
        </>
      )}

      {/* Footer */}
      <div className="relative z-10 py-4 text-center">
        <p className="text-sm text-gray-600">
          Built on <a href="https://base.org" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold hover:text-blue-700">Base</a> by <a href="https://x.com/faizydroid" target="_blank" rel="noopener noreferrer" className="text-gray-800 font-bold hover:text-gray-900">Faizydroid</a>
        </p>
      </div>

      {/* Modal */}
      <Modal
        isOpen={modal.show}
        onClose={() => setModal({ ...modal, show: false })}
        title={modal.title}
        message={modal.message}
        type={modal.type}
      />
    </div>
  )
}

// Force server-side rendering to ensure environment variables are available
export async function getServerSideProps() {
  return {
    props: {},
  }
}
