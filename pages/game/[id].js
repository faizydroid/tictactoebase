import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useWeb3 } from '../../context/Web3Context'
import GameBoard from '../../components/GameBoard'
import AnimatedBackground from '../../components/AnimatedBackground'
import Modal from '../../components/Modal'

export default function GamePage() {
  const router = useRouter()
  const { id } = router.query
  const { account, getGame, makeMove, recordGameResult } = useWeb3()
  const [game, setGame] = useState(null)
  const [loading, setLoading] = useState(true)
  const [makingMove, setMakingMove] = useState(false)
  const [gameResult, setGameResult] = useState(null)
  const [winningLine, setWinningLine] = useState(null)
  const [showResultScreen, setShowResultScreen] = useState(false)
  const [transactionStatus, setTransactionStatus] = useState(null)
  const [gameKey, setGameKey] = useState(0)
  const [modal, setModal] = useState({ show: false, message: '', type: 'error', title: '' })

  useEffect(() => {
    if (id && account) {
      loadGame()
      // Set up polling for game updates every 2 seconds
      const interval = setInterval(loadGame, 2000)
      return () => clearInterval(interval)
    }
  }, [id, account])

  const loadGame = async () => {
    if (!id) return
    
    try {
      const gameData = await getGame(parseInt(id))
      if (gameData) {
        setGame(gameData)
        
        // Check if game is finished
        if (gameData.isFinished && !gameResult) {
          let resultType
          let winLine = null
          
          if (gameData.winner === '0x0000000000000000000000000000000000000000') {
            resultType = 'draw'
          } else if (gameData.winner.toLowerCase() === account.toLowerCase()) {
            resultType = 'win'
          } else {
            resultType = 'lose'
          }
          
          // Find winning line
          winLine = findWinningLine(gameData.board)
          
          setGameResult({ type: resultType })
          setWinningLine(winLine)
          
          // Show result screen after animations
          setTimeout(() => {
            setShowResultScreen(true)
            
            // Record transaction
            if (resultType === 'draw') {
              recordTransaction(2)
            } else if (resultType === 'win') {
              recordTransaction(1)
            } else {
              recordTransaction(0)
            }
          }, 1200)
        }
      }
    } catch (error) {
      console.error('Error loading game:', error)
    }
    setLoading(false)
  }

  const findWinningLine = (board) => {
    const winPatterns = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
      [0, 4, 8], [2, 4, 6] // Diagonals
    ]

    for (const pattern of winPatterns) {
      const [a, b, c] = pattern
      if (board[a] !== 0 && board[a] === board[b] && board[b] === board[c]) {
        return pattern
      }
    }
    return null
  }

  const recordTransaction = async (result) => {
    setTransactionStatus('pending')
    try {
      // result: 0 = loss, 1 = win, 2 = draw
      const success = await recordGameResult(result)
      if (success) {
        setTransactionStatus('confirmed')
      } else {
        setTransactionStatus(null)
      }
    } catch (error) {
      console.error('Error recording game result:', error)
      setTransactionStatus(null)
    }
  }

  const handleMove = async (position) => {
    if (!game || game.isFinished || game.currentPlayer.toLowerCase() !== account.toLowerCase() || makingMove) return
    
    setMakingMove(true)
    try {
      const success = await makeMove(game.gameId, position)
      if (success) {
        // Wait a bit then reload game
        setTimeout(loadGame, 1000)
      }
    } catch (error) {
      console.error('Error making move:', error)
      setModal({ show: true, message: 'Failed to make move. Please try again.', type: 'error', title: 'Error' })
    }
    setMakingMove(false)
  }

  const handlePlayAgain = () => {
    setGameKey(prev => prev + 1)
    setGameResult(null)
    setWinningLine(null)
    setShowResultScreen(false)
    setTransactionStatus(null)
    router.push('/')
  }

  const handleQuit = () => {
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

  if (!game) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <div className="compact-card text-center max-w-sm">
          <h2 className="text-xl font-black mb-2">Game Not Found</h2>
          <p className="text-gray-600 text-sm mb-4">This game doesn't exist</p>
          <button onClick={() => router.push('/')} className="btn-primary w-full">
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  const isMyTurn = game.currentPlayer.toLowerCase() === account.toLowerCase()
  const amPlayer1 = game.player1.toLowerCase() === account.toLowerCase()

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 relative">
      {/* Animated Background */}
      <AnimatedBackground />

      {/* Compact Header */}
      <div className="header-compact flex items-center justify-between relative z-10">
        <button onClick={handleQuit} className="text-gray-600 hover:text-black text-sm font-bold">
          ← Back
        </button>
        <div className="text-xs font-bold text-gray-600">Game #{id}</div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-3 max-w-md mx-auto relative z-10">
        {/* Status Row */}
        <div className="flex items-center justify-between mb-3">
          {/* Turn Indicator */}
          <div className="text-xs font-bold">
            {game.isFinished ? (
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

          {/* Player Indicator */}
          <div className="stat-pill bg-purple-100 text-purple-700">
            <span className="text-xs">You are</span>
            <span className="font-black">{amPlayer1 ? 'X' : 'O'}</span>
          </div>
        </div>

        {/* Game Board */}
        <div className="mb-3">
          <GameBoard 
            key={gameKey}
            board={game.board}
            onMove={handleMove}
            disabled={game.isFinished || !isMyTurn || makingMove}
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
        {!gameResult && (
          <div className="flex gap-2">
            <button onClick={handleQuit} className="flex-1 btn-secondary text-xs">
              Quit Game
            </button>
          </div>
        )}

        {/* Players Info */}
        <div className="compact-card mt-3 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="grid grid-cols-2 gap-2 text-center text-xs">
            <div>
              <div className="font-bold text-blue-600">Player X</div>
              <div className="text-gray-600 font-mono text-xs">
                {game.player1.slice(0, 6)}...{game.player1.slice(-4)}
              </div>
            </div>
            <div>
              <div className="font-bold text-pink-600">Player O</div>
              <div className="text-gray-600 font-mono text-xs">
                {game.player2.slice(0, 6)}...{game.player2.slice(-4)}
              </div>
            </div>
          </div>
        </div>
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
                    <div className="text-2xl mb-2">🤝</div>
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
