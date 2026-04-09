import { useState, useEffect } from 'react'
import { useWeb3 } from '../context/Web3Context'
import { getPlayer } from '../lib/supabaseService'

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)
  const { getLeaderboard, account } = useWeb3()

  useEffect(() => {
    loadLeaderboard()
  }, [])

  const loadLeaderboard = async () => {
    setLoading(true)
    const data = await getLeaderboard()
    
    // Fetch usernames from Supabase for each player
    const enrichedData = await Promise.all(
      data.map(async (player) => {
        const { data: supabasePlayer } = await getPlayer(player.address)
        return {
          ...player,
          username: supabasePlayer?.username || player.username
        }
      })
    )
    
    const sorted = enrichedData.sort((a, b) => {
      if (b.winRatio !== a.winRatio) return b.winRatio - a.winRatio
      return b.wins - a.wins
    })
    setLeaderboard(sorted)
    setLoading(false)
  }

  const getRankEmoji = (index) => {
    if (index === 0) return '🥇'
    if (index === 1) return '🥈'
    if (index === 2) return '🥉'
    return `#${index + 1}`
  }

  const getRankColor = (index) => {
    if (index === 0) return 'bg-yellow-100 border-yellow-400'
    if (index === 1) return 'bg-gray-100 border-gray-400'
    if (index === 2) return 'bg-orange-100 border-orange-400'
    return 'bg-white border-gray-200'
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-black border-t-purple-500 mb-2"></div>
        <p className="text-gray-600 text-xs font-bold">Loading...</p>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏆</span>
          <h3 className="text-lg font-black">Top Players</h3>
        </div>
        <button
          onClick={loadLeaderboard}
          className="p-2 rounded-lg bg-white border-2 border-black hover-lift"
          title="Refresh"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {leaderboard.length === 0 ? (
        <div className="text-center py-8 compact-card">
          <p className="text-gray-600 text-sm font-bold">No players yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {leaderboard.map((player, index) => {
            const isCurrentUser = player.address.toLowerCase() === account?.toLowerCase()
            
            return (
              <div
                key={player.address}
                className={`mini-card ${getRankColor(index)} ${
                  isCurrentUser ? 'ring-2 ring-purple-600' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Rank */}
                  <div className="flex-shrink-0 w-8 text-center">
                    <span className="text-lg font-black">
                      {getRankEmoji(index)}
                    </span>
                  </div>

                  {/* Player Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm truncate">
                        {player.username}
                      </span>
                      {isCurrentUser && (
                        <span className="px-1.5 py-0.5 bg-purple-600 text-white text-xs rounded font-bold">
                          You
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 font-mono truncate">
                      {player.address.slice(0, 6)}...{player.address.slice(-4)}
                    </div>
                  </div>

                  {/* Compact Stats */}
                  <div className="flex items-center gap-2 text-xs">
                    <div className="text-center">
                      <div className="font-black text-green-600">{player.wins}</div>
                      <div className="text-gray-500">W</div>
                    </div>
                    <div className="text-gray-300">|</div>
                    <div className="text-center">
                      <div className="font-black text-red-600">{player.losses}</div>
                      <div className="text-gray-500">L</div>
                    </div>
                  </div>

                  {/* Win Rate */}
                  <div className="flex-shrink-0 text-right">
                    <div className={`text-lg font-black ${
                      player.winRatio >= 70 ? 'gradient-text' :
                      player.winRatio >= 50 ? 'text-yellow-600' :
                      'text-gray-600'
                    }`}>
                      {player.winRatio}%
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Motivational Message */}
      {leaderboard.length > 0 && (
        <div className="mt-3 p-3 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg border-2 border-yellow-300">
          <p className="text-xs text-center font-bold text-gray-700">
            🎮 Keep playing to climb the ranks!
          </p>
        </div>
      )}
    </div>
  )
}
