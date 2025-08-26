const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(cors());
app.use(express.static(path.join(__dirname)));

// Serve the game
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Game state management
const gameRooms = new Map();

class GameRoom {
    constructor(roomCode, hostId) {
        this.roomCode = roomCode;
        this.hostId = hostId;
        this.players = new Map();
        this.gameState = 'lobby';
        this.currentRound = 0;
        this.totalRounds = 6;
        this.gameTimer = 4 * 60;
        this.isGeneralTimerPaused = false;
        this.currentQuestion = null;
        this.currentAnswer = null;
        this.currentWordLength = 4;
        this.playerHints = new Map();
        this.playerAnswers = new Map();
        this.timerInterval = null;
        
        // Word sets - same as client
        this.wordSets = {
            4: [
                { question: "Extremely angry or furious", answer: "RAGE" },
                { question: "A small piece of land surrounded by water", answer: "ISLE" },
                { question: "To capture or seize suddenly", answer: "GRAB" },
                { question: "A mythical creature that breathes fire", answer: "DRAGON" }
            ],
            5: [
                { question: "A person who travels to unknown places", answer: "SCOUT" },
                { question: "To make something appear larger", answer: "ZOOM" },
                { question: "A valuable yellow metal", answer: "GOLD" },
                { question: "The ability to see future events", answer: "VISION" }
            ],
            6: [
                { question: "A secret plan to achieve something illegal", answer: "SCHEME" },
                { question: "A person who creates sculptures", answer: "ARTIST" },
                { question: "To vanish completely from sight", answer: "VANISH" },
                { question: "A building where goods are manufactured", answer: "FACTORY" }
            ],
            7: [
                { question: "The feeling of great happiness", answer: "DELIGHT" },
                { question: "To change from one form to another", answer: "CONVERT" },
                { question: "A person who performs magic tricks", answer: "MAGICIAN" },
                { question: "The quality of being honest and fair", answer: "JUSTICE" }
            ],
            8: [
                { question: "Something that cannot be explained by science", answer: "MYSTICAL" },
                { question: "A person who studies ancient civilizations", answer: "EXPLORER" },
                { question: "The process of creating something new", answer: "CREATION" },
                { question: "A situation full of danger", answer: "PERILOUS" }
            ],
            9: [
                { question: "The art of beautiful handwriting", answer: "CALLIGRAPHY" },
                { question: "Something that brings good fortune", answer: "FORTUNATE" },
                { question: "A person who studies the stars", answer: "ASTRONOMER" },
                { question: "The state of being completely puzzled", answer: "BEWILDERED" }
            ],
            10: [
                { question: "The study of human behavior and mind", answer: "PSYCHOLOGY" },
                { question: "Something extraordinary and remarkable", answer: "PHENOMENAL" },
                { question: "A person who seeks truth through questioning", answer: "PHILOSOPHER" },
                { question: "The art of persuasive speaking", answer: "ELOQUENCE" }
            ]
        };
    }

    addPlayer(playerId, playerData) {
        this.players.set(playerId, {
            ...playerData,
            individualTimer: 4 * 60,
            timerPaused: false,
            personalTimer: 0,
            isUsingPersonalTimer: false,
            hasAnswered: false,
            status: 'waiting',
            score: 0,
            joinedAt: Date.now()
        });
        this.playerHints.set(playerId, []);
    }

    removePlayer(playerId) {
        this.players.delete(playerId);
        this.playerHints.delete(playerId);
        this.playerAnswers.delete(playerId);
        
        // If host leaves, assign new host
        if (this.hostId === playerId && this.players.size > 0) {
            this.hostId = this.players.keys().next().value;
            this.players.get(this.hostId).isHost = true;
        }
    }

    startGame() {
        if (this.gameState !== 'lobby') return false;
        
        this.gameState = 'playing';
        this.currentRound = 1;
        this.gameTimer = 4 * 60;
        this.isGeneralTimerPaused = false;
        
        // Reset all players
        this.players.forEach((player, playerId) => {
            player.individualTimer = 4 * 60;
            player.timerPaused = false;
            player.score = 0;
            player.hasAnswered = false;
            player.status = 'thinking';
        });
        
        this.setupRound();
        this.startTimer();
        return true;
    }

    setupRound() {
        // Calculate word length based on round
        if (this.currentRound <= 2) {
            this.currentWordLength = 4;
        } else if (this.currentRound <= 4) {
            this.currentWordLength = 5;
        } else {
            this.currentWordLength = 6 + (this.currentRound - 5);
        }

        // Get random question
        const questionsForLength = this.wordSets[this.currentWordLength];
        if (questionsForLength && questionsForLength.length > 0) {
            const randomIndex = Math.floor(Math.random() * questionsForLength.length);
            this.currentQuestion = questionsForLength[randomIndex];
            this.currentAnswer = this.currentQuestion.answer.toUpperCase();
        }

        // Reset player states for new round
        this.players.forEach((player, playerId) => {
            player.hasAnswered = false;
            player.status = 'thinking';
            player.personalTimer = 0;
            player.isUsingPersonalTimer = false;
            player.timerPaused = false;
        });

        this.playerHints.clear();
        this.players.forEach((player, playerId) => {
            this.playerHints.set(playerId, []);
        });
        this.playerAnswers.clear();
        this.isGeneralTimerPaused = false;
    }

    startTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }

        this.timerInterval = setInterval(() => {
            // Update general timer
            if (!this.isGeneralTimerPaused) {
                this.gameTimer--;
            }

            // Update player timers
            this.players.forEach((player, playerId) => {
                if (!player.timerPaused && !player.hasAnswered) {
                    player.individualTimer--;
                }

                if (player.isUsingPersonalTimer && !player.hasAnswered) {
                    player.personalTimer--;
                    if (player.personalTimer <= 0) {
                        this.autoSubmitPlayer(playerId);
                    }
                }
            });

            // Check for game end
            if (this.gameTimer <= 0) {
                this.endGame();
            }

            // Broadcast timer updates
            this.broadcastGameState();
        }, 1000);
    }

    playerFoundWord(playerId) {
        const player = this.players.get(playerId);
        if (!player || player.isUsingPersonalTimer || player.hasAnswered) {
            return false;
        }

        // Pause general timer and player's individual timer
        this.isGeneralTimerPaused = true;
        player.timerPaused = true;
        player.isUsingPersonalTimer = true;
        player.personalTimer = 30;
        player.status = 'final-countdown';

        return true;
    }

    getHint(playerId) {
        const revealedPositions = this.playerHints.get(playerId) || [];
        
        if (revealedPositions.length >= this.currentWordLength - 1) {
            return null; // No more hints available
        }

        // Get available positions
        const availablePositions = [];
        for (let i = 0; i < this.currentWordLength; i++) {
            if (!revealedPositions.includes(i)) {
                availablePositions.push(i);
            }
        }

        if (availablePositions.length > 0) {
            const randomPosition = availablePositions[Math.floor(Math.random() * availablePositions.length)];
            revealedPositions.push(randomPosition);
            this.playerHints.set(playerId, revealedPositions);
            return {
                position: randomPosition,
                letter: this.currentAnswer[randomPosition]
            };
        }

        return null;
    }

    submitAnswer(playerId, answer) {
        const player = this.players.get(playerId);
        if (!player || player.hasAnswered) {
            return false;
        }

        const isCorrect = answer.toUpperCase() === this.currentAnswer;
        
        // Calculate score
        let score = 0;
        if (isCorrect) {
            const hintsUsed = this.playerHints.get(playerId)?.length || 0;
            const correctLetters = this.currentWordLength - hintsUsed;
            score = correctLetters * 1000;
            
            if (player.isUsingPersonalTimer) {
                score += 2000;
            }
        }

        player.hasAnswered = true;
        player.answer = answer.toUpperCase();
        player.score += score;
        player.status = 'completed';

        this.playerAnswers.set(playerId, {
            answer: answer.toUpperCase(),
            correct: isCorrect,
            score: score,
            hintsUsed: this.playerHints.get(playerId)?.length || 0
        });

        // Check if all players have answered
        const allAnswered = Array.from(this.players.values()).every(p => p.hasAnswered);
        if (allAnswered) {
            this.endRound();
        }

        return { isCorrect, score };
    }

    autoSubmitPlayer(playerId) {
        const player = this.players.get(playerId);
        if (!player || player.hasAnswered) return;

        this.submitAnswer(playerId, '');
    }

    endRound() {
        this.gameState = 'results';
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }

        setTimeout(() => {
            this.nextRound();
        }, 5000); // Show results for 5 seconds
    }

    nextRound() {
        this.currentRound++;
        
        if (this.currentRound > this.totalRounds) {
            this.endGame();
        } else {
            this.gameState = 'playing';
            this.setupRound();
            this.startTimer();
        }
    }

    endGame() {
        this.gameState = 'finished';
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
    }

    broadcastGameState() {
        const gameState = {
            roomCode: this.roomCode,
            gameState: this.gameState,
            currentRound: this.currentRound,
            totalRounds: this.totalRounds,
            gameTimer: this.gameTimer,
            isGeneralTimerPaused: this.isGeneralTimerPaused,
            currentQuestion: this.currentQuestion,
            currentWordLength: this.currentWordLength,
            players: Array.from(this.players.entries()).map(([id, player]) => ({
                id,
                name: player.name,
                score: player.score,
                status: player.status,
                individualTimer: player.individualTimer,
                isUsingPersonalTimer: player.isUsingPersonalTimer,
                personalTimer: player.personalTimer,
                hasAnswered: player.hasAnswered,
                isHost: player.isHost,
                hintCount: this.playerHints.get(id)?.length || 0
            })),
            playerAnswers: this.gameState === 'results' ? Object.fromEntries(this.playerAnswers) : null,
            correctAnswer: this.gameState === 'results' ? this.currentAnswer : null
        };

        // Send to all players in room
        this.players.forEach((player, playerId) => {
            const socket = player.socket;
            if (socket) {
                // Include personal hints only for this player
                const personalGameState = {
                    ...gameState,
                    playerHints: this.playerHints.get(playerId) || []
                };
                socket.emit('gameStateUpdate', personalGameState);
            }
        });
    }

    getGameState() {
        return {
            roomCode: this.roomCode,
            gameState: this.gameState,
            players: Array.from(this.players.values()).map(p => ({
                id: p.id,
                name: p.name,
                isHost: p.isHost
            }))
        };
    }
}

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    socket.on('createRoom', (data) => {
        const { playerName } = data;
        const roomCode = generateRoomCode();
        
        const gameRoom = new GameRoom(roomCode, socket.id);
        gameRoom.addPlayer(socket.id, {
            id: socket.id,
            name: playerName,
            isHost: true,
            socket: socket
        });
        
        gameRooms.set(roomCode, gameRoom);
        socket.join(roomCode);
        
        socket.emit('roomCreated', {
            roomCode,
            gameState: gameRoom.getGameState()
        });
    });

    socket.on('joinRoom', (data) => {
        const { roomCode, playerName } = data;
        const gameRoom = gameRooms.get(roomCode);
        
        if (!gameRoom) {
            socket.emit('error', { message: 'Room not found' });
            return;
        }

        if (gameRoom.gameState !== 'lobby') {
            socket.emit('error', { message: 'Game already in progress' });
            return;
        }

        gameRoom.addPlayer(socket.id, {
            id: socket.id,
            name: playerName,
            isHost: false,
            socket: socket
        });
        
        socket.join(roomCode);
        socket.emit('roomJoined', {
            roomCode,
            gameState: gameRoom.getGameState()
        });
        
        // Notify all players in room
        io.to(roomCode).emit('playerJoined', {
            playerId: socket.id,
            playerName: playerName,
            gameState: gameRoom.getGameState()
        });
    });

    socket.on('startGame', (data) => {
        const { roomCode } = data;
        const gameRoom = gameRooms.get(roomCode);
        
        if (!gameRoom || gameRoom.hostId !== socket.id) {
            socket.emit('error', { message: 'Only host can start game' });
            return;
        }

        if (gameRoom.startGame()) {
            gameRoom.broadcastGameState();
        }
    });

    socket.on('getHint', (data) => {
        const { roomCode } = data;
        const gameRoom = gameRooms.get(roomCode);
        
        if (!gameRoom) return;

        const hint = gameRoom.getHint(socket.id);
        if (hint) {
            socket.emit('hintReceived', hint);
            gameRoom.broadcastGameState();
        } else {
            socket.emit('error', { message: 'No more hints available' });
        }
    });

    socket.on('foundWord', (data) => {
        const { roomCode } = data;
        const gameRoom = gameRooms.get(roomCode);
        
        if (!gameRoom) return;

        if (gameRoom.playerFoundWord(socket.id)) {
            gameRoom.broadcastGameState();
        }
    });

    socket.on('submitAnswer', (data) => {
        const { roomCode, answer } = data;
        const gameRoom = gameRooms.get(roomCode);
        
        if (!gameRoom) return;

        const result = gameRoom.submitAnswer(socket.id, answer);
        if (result) {
            socket.emit('answerResult', result);
            gameRoom.broadcastGameState();
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
        
        // Remove player from all rooms
        gameRooms.forEach((gameRoom, roomCode) => {
            if (gameRoom.players.has(socket.id)) {
                gameRoom.removePlayer(socket.id);
                
                // If room is empty, delete it
                if (gameRoom.players.size === 0) {
                    gameRooms.delete(roomCode);
                } else {
                    // Notify remaining players
                    gameRoom.broadcastGameState();
                }
            }
        });
    });
});

function generateRoomCode() {
    return Math.random().toString(36).substr(2, 6).toUpperCase();
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🎮 Word Quest Server running on port ${PORT}`);
    console.log(`🌐 Access the game at: http://localhost:${PORT}`);
});
