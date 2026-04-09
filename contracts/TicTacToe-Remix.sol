// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title TicTacToe - On-Chain Multiplayer Game
 * @notice This contract manages a fully on-chain tic-tac-toe game with player registration,
 *         game creation, move validation, and leaderboard tracking.
 * @dev Deploy this contract to Base Mainnet using Remix IDE
 * 
 * Deployment Instructions:
 * 1. Open in Remix: https://remix.ethereum.org/
 * 2. Compile with Solidity 0.8.19 (Optimization: 200 runs)
 * 3. Connect MetaMask to Base Mainnet (Chain ID: 8453)
 * 4. Deploy using "Injected Provider - MetaMask"
 * 5. Estimated cost: ~0.003 ETH
 */
contract TicTacToe {
    struct Player {
        address wallet;
        string username;
        uint256 gamesPlayed;
        uint256 wins;
        uint256 losses;
        bool isRegistered;
    }
    
    struct Game {
        address player1;
        address player2;
        address currentPlayer;
        uint8[9] board; // 0 = empty, 1 = player1, 2 = player2
        address winner;
        bool isFinished;
        uint256 gameId;
    }
    
    mapping(address => Player) public players;
    mapping(uint256 => Game) public games;
    mapping(string => address) public usernameToAddress;
    
    uint256 public gameCounter;
    address[] public registeredPlayers;
    
    event PlayerRegistered(address indexed player, string username);
    event GameCreated(uint256 indexed gameId, address indexed player1, address indexed player2);
    event MoveMade(uint256 indexed gameId, address indexed player, uint8 position);
    event GameFinished(uint256 indexed gameId, address indexed winner);
    
    constructor() {
        gameCounter = 0;
    }
    
    /**
     * @notice Register a new player with a unique username
     * @param _username The desired username (must be unique)
     */
    function registerPlayer(string memory _username) external {
        require(!players[msg.sender].isRegistered, "Player already registered");
        require(usernameToAddress[_username] == address(0), "Username taken");
        
        players[msg.sender] = Player({
            wallet: msg.sender,
            username: _username,
            gamesPlayed: 0,
            wins: 0,
            losses: 0,
            isRegistered: true
        });
        
        usernameToAddress[_username] = msg.sender;
        registeredPlayers.push(msg.sender);
        
        emit PlayerRegistered(msg.sender, _username);
    }
    
    /**
     * @notice Create a new game with an opponent
     * @param _opponent The address of the opponent (must be registered)
     * @return The game ID
     */
    function createGame(address _opponent) external returns (uint256) {
        require(players[msg.sender].isRegistered, "Player not registered");
        require(players[_opponent].isRegistered, "Opponent not registered");
        require(msg.sender != _opponent, "Cannot play against yourself");
        
        gameCounter++;
        
        games[gameCounter] = Game({
            player1: msg.sender,
            player2: _opponent,
            currentPlayer: msg.sender,
            board: [0,0,0,0,0,0,0,0,0],
            winner: address(0),
            isFinished: false,
            gameId: gameCounter
        });
        
        emit GameCreated(gameCounter, msg.sender, _opponent);
        return gameCounter;
    }
    
    /**
     * @notice Make a move in an active game
     * @param _gameId The ID of the game
     * @param _position The board position (0-8)
     */
    function makeMove(uint256 _gameId, uint8 _position) external {
        Game storage game = games[_gameId];
        require(!game.isFinished, "Game already finished");
        require(msg.sender == game.currentPlayer, "Not your turn");
        require(_position < 9, "Invalid position");
        require(game.board[_position] == 0, "Position already taken");
        
        uint8 playerNumber = (msg.sender == game.player1) ? 1 : 2;
        game.board[_position] = playerNumber;
        
        emit MoveMade(_gameId, msg.sender, _position);
        
        address winner = checkWinner(_gameId);
        if (winner != address(0)) {
            game.winner = winner;
            game.isFinished = true;
            
            players[winner].wins++;
            players[winner].gamesPlayed++;
            
            address loser = (winner == game.player1) ? game.player2 : game.player1;
            players[loser].losses++;
            players[loser].gamesPlayed++;
            
            emit GameFinished(_gameId, winner);
        } else if (isBoardFull(_gameId)) {
            game.isFinished = true;
            players[game.player1].gamesPlayed++;
            players[game.player2].gamesPlayed++;
            emit GameFinished(_gameId, address(0)); // Draw
        } else {
            game.currentPlayer = (game.currentPlayer == game.player1) ? game.player2 : game.player1;
        }
    }
    
    /**
     * @notice Check if there's a winner in the game
     * @param _gameId The ID of the game
     * @return The address of the winner, or address(0) if no winner yet
     */
    function checkWinner(uint256 _gameId) internal view returns (address) {
        uint8[9] memory board = games[_gameId].board;
        
        // Check rows
        for (uint8 i = 0; i < 3; i++) {
            if (board[i*3] != 0 && board[i*3] == board[i*3+1] && board[i*3+1] == board[i*3+2]) {
                return (board[i*3] == 1) ? games[_gameId].player1 : games[_gameId].player2;
            }
        }
        
        // Check columns
        for (uint8 i = 0; i < 3; i++) {
            if (board[i] != 0 && board[i] == board[i+3] && board[i+3] == board[i+6]) {
                return (board[i] == 1) ? games[_gameId].player1 : games[_gameId].player2;
            }
        }
        
        // Check diagonals
        if (board[0] != 0 && board[0] == board[4] && board[4] == board[8]) {
            return (board[0] == 1) ? games[_gameId].player1 : games[_gameId].player2;
        }
        
        if (board[2] != 0 && board[2] == board[4] && board[4] == board[6]) {
            return (board[2] == 1) ? games[_gameId].player1 : games[_gameId].player2;
        }
        
        return address(0);
    }
    
    /**
     * @notice Check if the board is completely filled
     * @param _gameId The ID of the game
     * @return True if board is full, false otherwise
     */
    function isBoardFull(uint256 _gameId) internal view returns (bool) {
        uint8[9] memory board = games[_gameId].board;
        for (uint i = 0; i < 9; i++) {
            if (board[i] == 0) return false;
        }
        return true;
    }
    
    /**
     * @notice Get all registered players (leaderboard)
     * @return Array of all players
     */
    function getLeaderboard() external view returns (Player[] memory) {
        uint256 playerCount = registeredPlayers.length;
        Player[] memory leaderboard = new Player[](playerCount);
        
        for (uint256 i = 0; i < playerCount; i++) {
            leaderboard[i] = players[registeredPlayers[i]];
        }
        return leaderboard;
    }
    
    /**
     * @notice Get the total number of registered players
     * @return The count of registered players
     */
    function getPlayerCount() external view returns (uint256) {
        return registeredPlayers.length;
    }
    
    /**
     * @notice Get a player by their index in the registered players array
     * @param index The index of the player
     * @return The player data
     */
    function getPlayerByIndex(uint256 index) external view returns (Player memory) {
        require(index < registeredPlayers.length, "Index out of bounds");
        return players[registeredPlayers[index]];
    }
    
    /**
     * @notice Get game details by game ID
     * @param _gameId The ID of the game
     * @return The game data
     */
    function getGame(uint256 _gameId) external view returns (Game memory) {
        return games[_gameId];
    }
}

/**
 * DEPLOYMENT NOTES:
 * 
 * Network: Base Mainnet
 * Chain ID: 8453
 * RPC URL: https://mainnet.base.org
 * Explorer: https://basescan.org
 * 
 * Estimated Deployment Cost: ~0.003 ETH (~$10 USD)
 * 
 * After deployment:
 * 1. Copy the contract address
 * 2. Verify on BaseScan: https://basescan.org/verifyContract
 * 3. Update your frontend .env.local with the contract address
 * 4. Test all functions before announcing to users
 * 
 * Contract Functions:
 * - registerPlayer(username): Register a new player
 * - createGame(opponent): Create a game with another player
 * - makeMove(gameId, position): Make a move in a game
 * - getLeaderboard(): Get all players and their stats
 * - getGame(gameId): Get game details
 */