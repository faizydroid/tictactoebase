import { useWeb3 } from '../context/Web3Context'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Image from 'next/image'
import AnimatedBackground from './AnimatedBackground'

export default function WalletConnect() {
  const { account, connectWallet } = useWeb3()
  const router = useRouter()

  useEffect(() => {
    if (account) {
      router.push('/')
    }
  }, [account, router])

  const handleConnect = async () => {
    await connectWallet()
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      {/* Animated Background with X and O */}
      <AnimatedBackground />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md fade-in">
          {/* Logo - 3x Larger */}
          <div className="text-center mb-8">
            <div className="inline-block">
              <div className="mb-6 flex justify-center">
                <Image 
                  src="/logo.png" 
                  alt="TicTacToe Logo" 
                  width={360} 
                  height={360}
                  className="object-contain"
                />
              </div>
            </div>
          </div>

          {/* Connect Card */}
          <div className="compact-card p-6">
            <h2 className="text-2xl font-black mb-2 text-center">Connect Wallet</h2>
            <p className="text-gray-600 text-center mb-6 text-sm font-medium">
              Connect your wallet to start playing
            </p>

            {/* Connect Button */}
            <button
              onClick={handleConnect}
              className="w-full btn-primary text-base py-3 group relative overflow-hidden"
            >
              <span className="relative z-10">
                Connect Wallet
              </span>
            </button>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Built on <a href="https://base.org" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold hover:text-blue-700">Base</a> by <a href="https://x.com/faizydroid" target="_blank" rel="noopener noreferrer" className="text-gray-800 font-bold hover:text-gray-900">Faizydroid</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
