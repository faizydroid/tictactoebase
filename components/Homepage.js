import { useState } from 'react'
import { useWeb3 } from '../context/Web3Context'
import Leaderboard from './Leaderboard'
import GameLobby from './GameLobby'
import AnimatedBackground from './AnimatedBackground'
import Image from 'next/image'

export default function Homepage() {
  const { playerData, account, disconnectWallet } = useWeb3()
  const [activeTab, setActiveTab] = useState('play')
  const [showDropdown, setShowDropdown] = useState(false)

  const winRate = playerData?.gamesPlayed > 0 
    ? ((playerData.wins / playerData.gamesPlayed) * 100).toFixed(0) 
    : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative">
      {/* Animated Background with X and O */}
      <AnimatedBackground />

      {/* Enhanced Header */}
      <div className="header-compact relative z-10">
        <div className="flex items-center justify-between">
          {/* Logo - Much Larger and Clear */}
          <div className="flex items-center gap-3">
            <Image 
              src="/logo.png" 
              alt="TicTacToe" 
              width={300} 
              height={300}
              className="object-contain"
            />
          </div>

          {/* Username Dropdown Button - No Avatar Letter */}
          <div className="relative">
            <button 
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border-2 border-black shadow-bold hover-lift"
            >
              <span className="font-bold text-sm">{playerData?.username}</span>
              <svg 
                className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                strokeWidth={3}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <>
                {/* Click outside to close dropdown */}
                <div 
                  className="fixed inset-0 z-[100]" 
                  onClick={() => setShowDropdown(false)}
                ></div>
                
                <div className="absolute right-0 mt-2 w-64 compact-card bg-white z-[101] slide-up">
                  <div className="p-3 space-y-3">
                    {/* Wallet Address */}
                    <div>
                      <div className="text-xs text-gray-500 font-bold mb-1">Wallet Address</div>
                      <div className="flex items-center gap-2">
                        <code className="text-xs font-mono bg-gray-100 px-2 py-1 rounded border border-gray-300 flex-1">
                          {account?.slice(0, 6)}...{account?.slice(-4)}
                        </code>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(account)
                            alert('Address copied!')
                          }}
                          className="text-gray-600 hover:text-black"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Network */}
                    <div>
                      <div className="text-xs text-gray-500 font-bold mb-1">Network</div>
                      <div className="flex items-center gap-2 bg-blue-50 px-2 py-1.5 rounded border-2 border-blue-200">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        <span className="text-sm font-bold text-blue-700">Base Mainnet</span>
                      </div>
                    </div>

                    {/* Logout Button */}
                    <button
                      onClick={() => {
                        disconnectWallet()
                        setShowDropdown(false)
                      }}
                      className="w-full btn-danger flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Disconnect
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-3 max-w-2xl mx-auto relative z-10">
        {/* Compact Stats Strip */}
        <div className="compact-card mb-3 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="grid grid-cols-4 gap-2 text-center">
            <div>
              <div className="text-xl font-black text-black">{playerData?.gamesPlayed || 0}</div>
              <div className="text-xs text-gray-600 font-bold">Games</div>
            </div>
            <div>
              <div className="text-xl font-black text-green-600">{playerData?.wins || 0}</div>
              <div className="text-xs text-gray-600 font-bold">Wins</div>
            </div>
            <div>
              <div className="text-xl font-black text-red-600">{playerData?.losses || 0}</div>
              <div className="text-xs text-gray-600 font-bold">Loss</div>
            </div>
            <div>
              <div className="text-xl font-black gradient-text">{winRate}%</div>
              <div className="text-xs text-gray-600 font-bold">Win%</div>
            </div>
          </div>
        </div>

        {/* Compact Tab Bar */}
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setActiveTab('play')}
            className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all border-2 border-black ${
              activeTab === 'play'
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-bold'
                : 'bg-white text-gray-700'
            }`}
          >
            Play
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all border-2 border-black ${
              activeTab === 'leaderboard'
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-bold'
                : 'bg-white text-gray-700'
            }`}
          >
            Leaderboard
          </button>
        </div>

        {/* Tab Content */}
        <div className="fade-in">
          {activeTab === 'play' && (
            <div className="compact-card">
              <GameLobby />
            </div>
          )}
          {activeTab === 'leaderboard' && (
            <div className="compact-card">
              <Leaderboard />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
