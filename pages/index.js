import { useState, useEffect } from 'react'
import { useWeb3 } from '../context/Web3Context'
import WalletConnect from '../components/WalletConnect'
import Registration from '../components/Registration'
import Homepage from '../components/Homepage'

export default function Home() {
  const { account, initializing } = useWeb3()
  const [loading, setLoading] = useState(true)
  const [supabaseRegistered, setSupabaseRegistered] = useState(false)

  useEffect(() => {
    const checkRegistration = async () => {
      // Wait for Web3Context to finish initializing
      if (initializing) return
      
      // Check Supabase registration directly
      if (account) {
        try {
          const { getPlayer } = await import('../lib/supabaseService')
          const result = await getPlayer(account)
          
          if (result.success && result.data && result.data.username) {
            setSupabaseRegistered(true)
          }
        } catch (error) {
          console.error('Error checking Supabase registration:', error)
        }
      }
      
      setLoading(false)
    }

    checkRegistration()
  }, [account, initializing])

  // Show loading until Web3 initializes and check completes
  if (initializing || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-8 border-black border-t-pink-500 mb-4"></div>
          <div className="text-black text-2xl font-black">Loading...</div>
        </div>
      </div>
    )
  }

  if (!account) {
    return <WalletConnect />
  }

  // If user has username in Supabase, go to homepage (skip blockchain check)
  if (supabaseRegistered) {
    return <Homepage />
  }

  // Only show registration if not in Supabase
  return <Registration />
}