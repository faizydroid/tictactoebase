import { createContext, useContext, useState, useEffect } from 'react'
import { ethers } from 'ethers'
import TicTacToeABI from '../contracts/TicTacToe.json'

const Web3Context = createContext()

export const useWeb3 = () => {
  const context = useContext(Web3Context)
  if (!context) {
    throw new Error('useWeb3 must be used within Web3Provider')
  }
  return context
}

export const Web3Provider = ({ children }) => {
  const [account, setAccount] = useState(null)
  const [provider, setProvider] = useState(null)
  const [contract, setContract] = useState(null)
  const [isRegistered, setIsRegistered] = useState(false)
  const [playerData, setPlayerData] = useState(null)
  const [initializing, setInitializing] = useState(true)

  const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS

  useEffect(() => {
    // Check if wallet was previously connected
    const initWallet = async () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' })
          if (accounts.length > 0) {
            await connectWallet()
          }
        } catch (error) {
          console.error('Error checking wallet:', error)
        }
      }
      setInitializing(false)
    }
    
    initWallet()
  }, [])

  const connectWallet = async () => {
    try {
      if (typeof window === 'undefined' || !window.ethereum) {
        alert('Please install MetaMask!')
        return false
      }

      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      })
      
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const network = await provider.getNetwork()
      
      // Check if on Base Mainnet (chainId: 8453)
      if (network.chainId !== 8453n) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x2105' }], // 8453 in hex
          })
        } catch (switchError) {
          // Chain not added, add it
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: '0x2105',
                chainName: 'Base',
                nativeCurrency: {
                  name: 'Ethereum',
                  symbol: 'ETH',
                  decimals: 18
                },
                rpcUrls: ['https://mainnet.base.org'],
                blockExplorerUrls: ['https://basescan.org']
              }]
            })
          }
        }
      }

      const contractInstance = new ethers.Contract(
        CONTRACT_ADDRESS,
        TicTacToeABI.abi,
        signer
      )

      setAccount(accounts[0])
      setProvider(provider)
      setContract(contractInstance)

      // Check registration in Supabase first
      const { getPlayer } = await import('../lib/supabaseService')
      const result = await getPlayer(accounts[0])
      
      if (result.success && result.data && result.data.username) {
        // Try to get blockchain stats first
        let blockchainStats = {
          gamesPlayed: 0,
          wins: 0,
          losses: 0,
          draws: 0
        }
        
        try {
          const player = await contractInstance.players(accounts[0])
          // Check if player has data on blockchain (username exists)
          if (player.username && player.username !== '') {
            blockchainStats = {
              gamesPlayed: Number(player.gamesPlayed),
              wins: Number(player.wins),
              losses: Number(player.losses),
              draws: Number(player.draws || 0)
            }
            console.log('✅ Loaded blockchain stats:', blockchainStats)
          } else {
            console.log('⚠️ No blockchain data found, using zeros')
          }
        } catch (error) {
          console.log('⚠️ Blockchain stats not available:', error.message)
        }
        
        setIsRegistered(true)
        setPlayerData({
          username: result.data.username,
          ...blockchainStats
        })
      } else {
        setIsRegistered(false)
        setPlayerData(null)
      }

      return true
    } catch (error) {
      console.error('Error connecting wallet:', error)
      return false
    }
  }

  const disconnectWallet = () => {
    setAccount(null)
    setProvider(null)
    setContract(null)
    setIsRegistered(false)
    setPlayerData(null)
  }

  const checkRegistration = async () => {
    if (!account) return
    
    try {
      // Check Supabase for username (not blockchain)
      const { getPlayer } = await import('../lib/supabaseService')
      const result = await getPlayer(account)
      
      if (result.success && result.data && result.data.username) {
        // Try to get blockchain stats first
        let blockchainStats = {
          gamesPlayed: 0,
          wins: 0,
          losses: 0,
          draws: 0
        }
        
        if (contract) {
          try {
            const player = await contract.players(account)
            // Check if player has data on blockchain (username exists)
            if (player.username && player.username !== '') {
              blockchainStats = {
                gamesPlayed: Number(player.gamesPlayed),
                wins: Number(player.wins),
                losses: Number(player.losses),
                draws: Number(player.draws || 0)
              }
              console.log('✅ Loaded blockchain stats:', blockchainStats)
            } else {
              console.log('⚠️ No blockchain data found, using zeros')
            }
          } catch (error) {
            console.log('⚠️ Blockchain stats not available:', error.message)
          }
        }
        
        setIsRegistered(true)
        setPlayerData({
          username: result.data.username,
          ...blockchainStats
        })
      } else {
        setIsRegistered(false)
        setPlayerData(null)
      }
    } catch (error) {
      console.error('Error checking registration:', error)
      setIsRegistered(false)
      setPlayerData(null)
    }
  }

  const registerPlayer = async (username) => {
    if (!contract) {
      throw new Error('Contract not initialized. Please reconnect your wallet.')
    }
    
    try {
      console.log('Attempting to register username:', username)
      const tx = await contract.registerPlayer(username)
      console.log('Transaction sent:', tx.hash)
      const receipt = await tx.wait()
      console.log('Transaction confirmed:', receipt)
      await checkRegistration()
      return true
    } catch (error) {
      console.error('Error registering player:', error)
      // Re-throw the error so Registration component can handle it
      throw error
    }
  }

  const getLeaderboard = async () => {
    if (!contract) return []
    
    try {
      const playerCount = await contract.getPlayerCount()
      const leaderboard = []
      
      for (let i = 0; i < playerCount; i++) {
        const player = await contract.getPlayerByIndex(i)
        leaderboard.push({
          address: player.wallet,
          username: player.username,
          gamesPlayed: Number(player.gamesPlayed),
          wins: Number(player.wins),
          losses: Number(player.losses),
          winRatio: Number(player.gamesPlayed) > 0 
            ? (Number(player.wins) / Number(player.gamesPlayed) * 100).toFixed(1) 
            : 0
        })
      }
      
      return leaderboard
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
      return []
    }
  }

  const createGame = async (opponentAddress) => {
    if (!contract) return null
    
    try {
      const tx = await contract.createGame(opponentAddress)
      const receipt = await tx.wait()
      
      // Extract game ID from event
      const event = receipt.logs.find(log => {
        try {
          const parsed = contract.interface.parseLog(log)
          return parsed.name === 'GameCreated'
        } catch {
          return false
        }
      })
      
      if (event) {
        const parsed = contract.interface.parseLog(event)
        return Number(parsed.args[0])
      }
      
      return null
    } catch (error) {
      console.error('Error creating game:', error)
      throw error
    }
  }

  const makeMove = async (gameId, position) => {
    if (!contract) return false
    
    try {
      const tx = await contract.makeMove(gameId, position)
      await tx.wait()
      return true
    } catch (error) {
      console.error('Error making move:', error)
      return false
    }
  }

  const getGame = async (gameId) => {
    if (!contract) return null
    
    try {
      const game = await contract.getGame(gameId)
      return {
        gameId: Number(game.gameId),
        player1: game.player1,
        player2: game.player2,
        currentPlayer: game.currentPlayer,
        board: game.board.map(cell => Number(cell)),
        winner: game.winner,
        isFinished: game.isFinished
      }
    } catch (error) {
      console.error('Error fetching game:', error)
      return null
    }
  }

  const recordAIGameResult = async (won) => {
    if (!contract) return false
    
    try {
      const tx = await contract.recordAIGame(won)
      await tx.wait()
      await checkRegistration() // Refresh player data
      return true
    } catch (error) {
      console.error('Error recording AI game result:', error)
      return false
    }
  }

  const recordGameResult = async (result) => {
    if (!contract) {
      console.error('❌ No contract available')
      return false
    }
    
    try {
      // result: 0 = loss, 1 = win, 2 = draw
      console.log('📝 Attempting to record game result:', result === 0 ? 'Loss' : result === 1 ? 'Win' : 'Draw')
      console.log('📊 Account:', account)
      
      // Check if player is registered on blockchain
      // A registered player will have a non-empty username
      let needsRegistration = false
      try {
        const player = await contract.players(account)
        console.log('📊 Blockchain player data:', {
          username: player.username,
          gamesPlayed: Number(player.gamesPlayed),
          wins: Number(player.wins),
          losses: Number(player.losses)
        })
        
        // Check if truly registered by checking if username exists
        // This is more reliable than isRegistered flag
        needsRegistration = !player.username || player.username === ''
      } catch (checkError) {
        console.log('⚠️ Could not check registration, assuming needs registration')
        needsRegistration = true
      }
      
      if (needsRegistration) {
        console.log('⚠️ Player not registered on blockchain, registering now...')
        // Auto-register with username from Supabase
        if (playerData && playerData.username) {
          try {
            const regTx = await contract.registerPlayer(playerData.username)
            console.log('📝 Registration transaction sent:', regTx.hash)
            await regTx.wait()
            console.log('✅ Player registered on blockchain')
          } catch (regError) {
            console.error('❌ Auto-registration failed:', regError)
            // If already registered, that's fine, continue
            if (regError.reason && regError.reason.includes('already registered')) {
              console.log('✅ Player was already registered, continuing...')
            } else {
              console.error('❌ Unexpected registration error:', regError.reason || regError.message)
              // Don't return false, try to record anyway
            }
          }
        } else {
          console.error('❌ No username available for registration')
        }
      } else {
        console.log('✅ Player already registered on blockchain')
      }
      
      const tx = await contract.recordGameResult(result)
      console.log('📝 Transaction sent:', tx.hash)
      await tx.wait()
      console.log('✅ Game result recorded on blockchain')
      await checkRegistration() // Refresh player data
      return true
    } catch (error) {
      console.error('❌ Error recording game result:', error)
      console.error('❌ Error details:', {
        message: error.message,
        reason: error.reason,
        code: error.code
      })
      
      // Check if it's a "not registered" error
      if (error.reason && error.reason.includes('Player not registered')) {
        console.error('❌ Player not registered on blockchain contract')
      }
      
      return false
    }
  }

  const value = {
    account,
    provider,
    contract,
    isRegistered,
    playerData,
    initializing,
    connectWallet,
    disconnectWallet,
    checkRegistration,
    registerPlayer,
    getLeaderboard,
    createGame,
    makeMove,
    getGame,
    recordAIGameResult,
    recordGameResult
  }

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  )
}
