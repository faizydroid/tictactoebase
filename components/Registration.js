import { useState, useEffect } from 'react'
import { useWeb3 } from '../context/Web3Context'
import { createOrUpdatePlayer, checkUsernameAvailable, getPlayer } from '../lib/supabaseService'
import AnimatedBackground from './AnimatedBackground'
import Toast from './Toast'

export default function Registration() {
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [existingUsername, setExistingUsername] = useState(null)
  const [checkingExisting, setCheckingExisting] = useState(true)
  const [toast, setToast] = useState({ show: false, message: '', type: 'error' })
  const { registerPlayer, disconnectWallet, account } = useWeb3()

  // Check if user already has a username in Supabase
  useEffect(() => {
    const checkExistingUsername = async () => {
      if (!account) return
      
      setCheckingExisting(true)
      try {
        const { success, data } = await getPlayer(account)
        if (success && data && data.username) {
          setExistingUsername(data.username)
          setUsername(data.username)
        }
      } catch (error) {
        console.error('Error checking existing username:', error)
      }
      setCheckingExisting(false)
    }

    checkExistingUsername()
  }, [account])

  const showToast = (message, type = 'error') => {
    setToast({ show: true, message, type })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!username.trim()) return

    setLoading(true)
    
    try {
      // If using existing username, skip availability check
      if (!existingUsername) {
        // Check if username is available in Supabase
        const { available } = await checkUsernameAvailable(username.trim())
        
        if (!available) {
          showToast('Username is already taken. Please choose another.', 'warning')
          setLoading(false)
          return
        }
      }

      // Register on blockchain
      try {
        await registerPlayer(username.trim())
        // Save username to Supabase
        await createOrUpdatePlayer(account, username.trim())
        showToast('Registration successful! 🎉', 'success')
      } catch (regError) {
        // Handle specific blockchain errors
        if (regError.code === 'ACTION_REJECTED' || regError.message.includes('user rejected')) {
          showToast('Transaction was rejected. Please approve the transaction to register.', 'warning')
        } else if (regError.message.includes('insufficient funds')) {
          showToast('Insufficient funds for gas fees. Please add ETH to your wallet.', 'error')
        } else if (regError.message.includes('already registered')) {
          showToast('This wallet is already registered. Please use a different wallet.', 'error')
        } else if (regError.message.includes('Username taken')) {
          showToast('This username is already taken on the blockchain. Please choose another.', 'warning')
        } else {
          showToast(`Registration failed: ${regError.reason || regError.message}`, 'error')
        }
      }
    } catch (error) {
      console.error('Registration error:', error)
      showToast(`Unexpected error: ${error.message}`, 'error')
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-yellow-50 via-pink-50 to-purple-50">
      {/* Animated Background with X and O */}
      <AnimatedBackground />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md slide-up">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-4xl font-black mb-2 gradient-text">
              {existingUsername ? 'Re-Register Profile' : 'Create Your Profile'}
            </h1>
            <p className="text-gray-700 font-bold text-base">
              {existingUsername 
                ? 'Register your existing username on the new contract' 
                : 'Choose a username to start playing'}
            </p>
          </div>

          {/* Registration Card */}
          <div className="compact-card p-6">
            {/* Wallet Info */}
            <div className="mb-4 p-3 bg-green-50 rounded-lg border-2 border-green-200">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="text-xs font-bold text-gray-600 mb-1">Connected Wallet</div>
                  <div className="font-mono text-xs font-bold text-green-700 truncate">
                    {account?.slice(0, 10)}...{account?.slice(-8)}
                  </div>
                </div>
                <button
                  onClick={disconnectWallet}
                  className="ml-3 px-3 py-1.5 bg-red-500 text-white text-xs font-bold rounded-lg border-2 border-black shadow-bold hover-lift"
                >
                  Disconnect
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {existingUsername && (
                <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-300 mb-4">
                  <div className="flex items-start gap-3">
                    <div className="text-blue-600 mt-0.5">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="text-xs text-gray-800 flex-1">
                      <p className="font-black mb-1.5 text-sm">Contract was redeployed</p>
                      <p className="font-medium mb-2">Your username exists in our database but needs to be registered on the new smart contract.</p>
                      <p className="font-bold text-blue-700">✓ Username: "{existingUsername}"</p>
                      <p className="font-medium mt-2 text-gray-600">Click below to register it on the new contract (one-time blockchain transaction).</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border-2 border-black rounded-lg 
                           focus:border-purple-600 focus:ring-2 focus:ring-purple-200 
                           transition-all outline-none text-black placeholder-gray-400 font-bold shadow-bold"
                  placeholder="Enter your username"
                  maxLength={20}
                  required
                  disabled={loading || checkingExisting}
                />
                <div className="mt-1.5 text-xs font-bold text-gray-600">
                  {username.length}/20 characters
                </div>
              </div>
              
              <button
                type="submit"
                disabled={loading || !username.trim() || checkingExisting}
                className="w-full btn-primary text-base py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {checkingExisting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Checking...</span>
                  </span>
                ) : loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>{existingUsername ? 'Re-Registering...' : 'Creating Profile...'}</span>
                  </span>
                ) : (
                  existingUsername ? 'Re-Register on New Contract' : 'Create Profile'
                )}
              </button>
            </form>

            {/* Info */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border-2 border-blue-200">
              <div className="flex items-start gap-2">
                <div className="text-blue-600 mt-0.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="text-xs text-gray-800">
                  <p className="font-bold mb-0.5">
                    {existingUsername ? 'Contract was redeployed' : 'One-time registration'}
                  </p>
                  <p className="font-medium">
                    {existingUsername 
                      ? 'Your username exists in our database but needs to be registered on the new smart contract.' 
                      : 'This will create a blockchain transaction.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Built on Base Badge */}
          <div className="mt-4 text-center">
            <div className="inline-flex items-center gap-2 compact-card px-4 py-2 bg-blue-50">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <span className="text-sm font-bold text-gray-700">Built on Base</span>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.show}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </div>
  )
}