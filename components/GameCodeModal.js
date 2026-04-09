import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

export default function GameCodeModal({ isOpen, onClose, gameCode }) {
  const [copied, setCopied] = useState(false)
  const [waitingForOpponent, setWaitingForOpponent] = useState(true)
  const router = useRouter()

  // Poll for game updates to detect when opponent joins
  useEffect(() => {
    if (!isOpen || !window.friendGameId) return

    let pollInterval

    const startPolling = async () => {
      const { getGame } = await import('../lib/supabaseService')
      
      pollInterval = setInterval(async () => {
        try {
          const result = await getGame(window.friendGameId)
          if (result.success && result.data) {
            // Check if opponent joined (player2_address is set and status changed)
            if (result.data.player2_address && result.data.status === 'in_progress') {
              setWaitingForOpponent(false)
              clearInterval(pollInterval)
              
              // Navigate to game after brief delay
              setTimeout(() => {
                router.push(`/game/friend/${window.friendGameId}`)
                onClose()
              }, 800)
            }
          }
        } catch (error) {
          console.error('Error polling game:', error)
        }
      }, 1000) // Poll every second
    }

    startPolling()

    return () => {
      if (pollInterval) {
        clearInterval(pollInterval)
      }
    }
  }, [isOpen, router, onClose])

  if (!isOpen) return null

  const handleCopy = () => {
    navigator.clipboard.writeText(gameCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = async () => {
    const shareText = `🎮 Join my Tic Tac Toe game!\n\nGame Code: ${gameCode}\n\nEnter this code in the app to play!`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Tic Tac Toe Game',
          text: shareText
        })
      } catch (error) {
        // User cancelled or error occurred
        if (error.name !== 'AbortError') {
          console.error('Error sharing:', error)
          // Fallback to copy
          handleCopy()
        }
      }
    } else {
      // Fallback to copy if Web Share API not available
      navigator.clipboard.writeText(shareText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-fadeIn"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div 
          className="pointer-events-auto max-w-md w-full bg-white rounded-2xl border-4 border-black shadow-bold-xl animate-scaleIn"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-green-400 to-emerald-500 p-6 rounded-t-xl border-b-4 border-black">
            <div className="text-center">
              <div className="text-5xl mb-3">🎮</div>
              <h2 className="text-2xl font-black text-white mb-1">Game Created!</h2>
              <p className="text-white/90 text-sm font-bold">Share this code with your friend</p>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Game Code Display */}
            <div className="mb-4">
              <div className="bg-gradient-to-br from-yellow-100 to-orange-100 rounded-xl border-4 border-black p-6 text-center">
                <div className="text-xs font-bold text-gray-600 mb-2">GAME CODE</div>
                <div className="text-5xl font-black tracking-wider text-black mb-3 font-mono">
                  {gameCode}
                </div>
                
                {/* Copy and Share Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleCopy}
                    className={`py-2.5 rounded-lg border-2 border-black font-bold text-sm transition-all ${
                      copied 
                        ? 'bg-green-500 text-white' 
                        : 'bg-white text-black hover-lift'
                    }`}
                  >
                    {copied ? (
                      <span className="flex items-center justify-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        Copied!
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Copy
                      </span>
                    )}
                  </button>
                  
                  <button
                    onClick={handleShare}
                    className="py-2.5 rounded-lg border-2 border-black font-bold text-sm bg-blue-500 text-white hover-lift"
                  >
                    <span className="flex items-center justify-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                      Share
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Waiting Animation */}
            {waitingForOpponent ? (
              <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border-2 border-blue-300">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex-shrink-0">
                    <div className="relative w-8 h-8">
                      <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
                      <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-black text-blue-900">Waiting for opponent...</div>
                    <div className="text-xs text-blue-700">Game starts automatically when friend joins</div>
                  </div>
                </div>
                
                {/* Animated dots */}
                <div className="flex items-center justify-center gap-1.5">
                  <div className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-bounce"></div>
                  <div className="w-2.5 h-2.5 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2.5 h-2.5 bg-pink-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            ) : (
              <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-300">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex-shrink-0">
                    <div className="relative w-8 h-8">
                      <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-black text-green-900">Friend joined!</div>
                    <div className="text-xs text-green-700">Taking you to the game...</div>
                  </div>
                </div>
                
                {/* Loading animation */}
                <div className="flex items-center justify-center gap-1.5">
                  <div className="w-2.5 h-2.5 bg-green-600 rounded-full animate-bounce"></div>
                  <div className="w-2.5 h-2.5 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2.5 h-2.5 bg-teal-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="mb-4 space-y-2">
              <div className="flex items-start gap-2">
                <div className="flex-shrink-0 w-5 h-5 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-black">
                  1
                </div>
                <div className="text-xs text-gray-700">
                  <span className="font-bold">Share the code</span> via text, Discord, or any app
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="flex-shrink-0 w-5 h-5 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-black">
                  2
                </div>
                <div className="text-xs text-gray-700">
                  <span className="font-bold">Friend enters code</span> in "Join Game"
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="flex-shrink-0 w-5 h-5 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-black">
                  3
                </div>
                <div className="text-xs text-gray-700">
                  <span className="font-bold">Game starts automatically!</span>
                </div>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="w-full btn-secondary py-2.5"
            >
              Close & Wait
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
