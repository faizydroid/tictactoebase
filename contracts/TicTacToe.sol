// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract TicTacToe {
    struct Player {
        address wallet;
        string username;
        uint256 gamesPlayed;
        uint256 wins;
        uint256 losses;
        uint256 draws;
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
    
    function registerPlayer(string memory _username) external {
        require(!players[msg.sender].isRegistered, "Player already registered");
        require(usernameToAddress[_username] == address(0), "Username taken");
        
        players[msg.sender] = Player({
            wallet: msg.sender,
            username: _username,
            gamesPlayed: 0,
            wins: 0,
            losses: 0,
            draws: 0,
            isRegistered: true
        });
        
        usernameToAddress[_username] = msg.sender;
        registeredPlayers.push(msg.sender);
        
        emit PlayerRegistered(msg.sender, _username);
    }
    
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
    
    function isBoardFull(uint256 _gameId) internal view returns (bool) {
        uint8[9] memory board = games[_gameId].board;
        for (uint i = 0; i < 9; i++) {
            if (board[i] == 0) return false;
        }
        return true;
    }
    
    function getLeaderboard() external view returns (Player[] memory) {
        uint256 playerCount = registeredPlayers.length;
        Player[] memory leaderboard = new Player[](playerCount);
        
        for (uint256 i = 0; i < playerCount; i++) {
            leaderboard[i] = players[registeredPlayers[i]];
        }
        return leaderboard;
    }
    
    function getPlayerCount() external view returns (uint256) {
        return registeredPlayers.length;
    }
    
    function getPlayerByIndex(uint256 index) external view returns (Player memory) {
        require(index < registeredPlayers.length, "Index out of bounds");
        return players[registeredPlayers[index]];
    }
    
    function getGame(uint256 _gameId) external view returns (Game memory) {
        return games[_gameId];
    }
    
    // Record AI game result (no opponent needed)
    function recordAIGame(bool won) external {
        require(players[msg.sender].isRegistered, "Player not registered");
        
        players[msg.sender].gamesPlayed++;
        
        if (won) {
            players[msg.sender].wins++;
        } else {
            players[msg.sender].losses++;
        }
    }
    
    // Record game result with draw support
    function recordGameResult(uint8 result) external {
        require(players[msg.sender].isRegistered, "Player not registered");
        require(result <= 2, "Invalid result: 0=loss, 1=win, 2=draw");
        
        players[msg.sender].gamesPlayed++;
        
        if (result == 1) {
            players[msg.sender].wins++;
        } else if (result == 0) {
            players[msg.sender].losses++;
        } else if (result == 2) {
            players[msg.sender].draws++;
        }
    }
}