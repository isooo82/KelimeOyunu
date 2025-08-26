class MultiplayerWordGame {
    constructor() {
        this.socket = io();
        this.playerId = null;
        this.roomCode = null;
        this.isHost = false;
        this.gameState = null;
        this.playerHints = [];
        
        this.sounds = {
            correct: document.getElementById('correctSound'),
            incorrect: document.getElementById('incorrectSound')
        };
        
        this.initializeElements();
        this.setupEventListeners();
        this.setupSocketListeners();
        this.showScreen('lobby');
    }

    initializeElements() {
        // Screen elements
        this.screens = {
            lobby: document.querySelector('.lobby-screen'),
            game: document.querySelector('.game-screen'),
            results: document.querySelector('.results-screen'),
            finalResults: document.querySelector('.final-results-screen')
        };

        // Lobby elements
        this.playerNameInput = document.getElementById('playerName');
        this.roomCodeInput = document.getElementById('roomCode');
        this.joinGameBtn = document.getElementById('joinGameBtn');
        this.createRoomBtn = document.getElementById('createRoomBtn');
        this.startGameBtn = document.getElementById('startGameBtn');
        this.roomInfo = document.querySelector('.room-info');
        this.currentRoomCodeSpan = document.getElementById('currentRoomCode');
        this.playersList = document.getElementById('playersList');

        // Game elements
        this.mainTimer = document.querySelector('.main-timer');
        this.currentRoundSpan = document.querySelector('.current-round');
        this.wordLengthSpan = document.querySelector('.word-length');
        this.questionText = document.getElementById('questionText');
        this.letterCount = document.getElementById('letterCount');
        this.playersGrid = document.getElementById('playersGrid');
        this.getHintBtn = document.getElementById('getHintBtn');
        this.hintsDisplay = document.getElementById('hintsDisplay');
        this.answerInput = document.getElementById('answerInput');
        this.submitAnswerBtn = document.getElementById('submitAnswerBtn');
        this.foundBtn = document.getElementById('foundBtn');
        this.personalTimerDisplay = document.getElementById('personalTimerDisplay');
        this.personalTimerText = document.getElementById('personalTimerText');

        // Results elements
        this.correctAnswer = document.getElementById('correctAnswer');
        this.playerResults = document.getElementById('playerResults');
        this.nextRoundBtn = document.getElementById('nextRoundBtn');

        // Final results elements
        this.finalLeaderboard = document.getElementById('finalLeaderboard');
        this.playAgainBtn = document.getElementById('playAgainBtn');
        this.newRoomBtn = document.getElementById('newRoomBtn');

        // Notification container
        this.notificationContainer = document.getElementById('notificationContainer');
    }

    setupEventListeners() {
        // Lobby events
        this.joinGameBtn.addEventListener('click', () => this.joinRoom());
        this.createRoomBtn.addEventListener('click', () => this.createRoom());
        this.startGameBtn.addEventListener('click', () => this.startGame());

        // Game events
        this.getHintBtn.addEventListener('click', () => this.getHint());
        this.submitAnswerBtn.addEventListener('click', () => this.submitAnswer());
        this.foundBtn.addEventListener('click', () => this.foundWord());
        this.answerInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.submitAnswer();
        });

        // Results events
        this.nextRoundBtn.addEventListener('click', () => this.nextRound());
        this.playAgainBtn.addEventListener('click', () => this.playAgain());
        this.newRoomBtn.addEventListener('click', () => this.returnToLobby());

        // Input validation
        this.answerInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.toUpperCase().replace(/[^A-Z]/g, '');
            if (this.gameState?.currentWordLength && e.target.value.length > this.gameState.currentWordLength) {
                e.target.value = e.target.value.slice(0, this.gameState.currentWordLength);
            }
        });

        this.playerNameInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^a-zA-Z0-9\s]/g, '');
        });

        this.roomCodeInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        });
    }

    setupSocketListeners() {
        this.socket.on('connect', () => {
            console.log('Connected to server');
            this.playerId = this.socket.id;
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from server');
            this.showNotification('Connection lost! Trying to reconnect...', 'error');
        });

        this.socket.on('roomCreated', (data) => {
            this.roomCode = data.roomCode;
            this.isHost = true;
            this.updateLobbyUI(data.gameState);
            this.showNotification('Room created successfully!', 'success');
        });

        this.socket.on('roomJoined', (data) => {
            this.roomCode = data.roomCode;
            this.updateLobbyUI(data.gameState);
            this.showNotification('Joined room successfully!', 'success');
        });

        this.socket.on('playerJoined', (data) => {
            this.updateLobbyUI(data.gameState);
            this.showNotification(`${data.playerName} joined the room!`, 'info');
        });

        this.socket.on('gameStateUpdate', (gameState) => {
            this.updateGameState(gameState);
        });

        this.socket.on('hintReceived', (hint) => {
            this.playerHints.push(hint.position);
            this.updateHintsDisplay();
            this.showNotification(`Hint: Position ${hint.position + 1} is "${hint.letter}"`, 'info');
        });

        this.socket.on('answerResult', (result) => {
            if (result.isCorrect) {
                this.sounds.correct?.play().catch(() => {});
                this.showNotification(`Correct! +${result.score} points`, 'success');
            } else {
                this.sounds.incorrect?.play().catch(() => {});
                this.showNotification('Incorrect answer', 'error');
            }
        });

        this.socket.on('error', (error) => {
            this.showNotification(error.message, 'error');
        });
    }

    createRoom() {
        const playerName = this.playerNameInput.value.trim();
        if (!playerName) {
            this.showNotification('Please enter your name', 'error');
            return;
        }

        this.socket.emit('createRoom', { playerName });
    }

    joinRoom() {
        const playerName = this.playerNameInput.value.trim();
        const roomCode = this.roomCodeInput.value.trim();
        
        if (!playerName) {
            this.showNotification('Please enter your name', 'error');
            return;
        }

        if (!roomCode) {
            this.showNotification('Please enter a room code', 'error');
            return;
        }

        this.socket.emit('joinRoom', { playerName, roomCode });
    }

    startGame() {
        if (!this.isHost) return;
        this.socket.emit('startGame', { roomCode: this.roomCode });
    }

    getHint() {
        this.socket.emit('getHint', { roomCode: this.roomCode });
    }

    foundWord() {
        this.socket.emit('foundWord', { roomCode: this.roomCode });
        this.foundBtn.disabled = true;
        this.getHintBtn.disabled = true;
        this.foundBtn.textContent = '⏰ 30s Timer Active';
    }

    submitAnswer() {
        const answer = this.answerInput.value.trim();
        
        if (!answer) {
            this.showNotification('Please enter an answer', 'error');
            return;
        }

        if (this.gameState?.currentWordLength && answer.length !== this.gameState.currentWordLength) {
            this.showNotification(`Answer must be exactly ${this.gameState.currentWordLength} letters long`, 'error');
            return;
        }

        this.socket.emit('submitAnswer', { roomCode: this.roomCode, answer });
        this.submitAnswerBtn.disabled = true;
        this.getHintBtn.disabled = true;
        this.foundBtn.disabled = true;
        this.answerInput.disabled = true;
    }

    updateGameState(gameState) {
        this.gameState = gameState;

        if (gameState.gameState === 'playing') {
            this.showScreen('game');
            this.updateGameUI();
            this.updatePlayersGrid();
            this.resetAnswerSection();
        } else if (gameState.gameState === 'results') {
            this.showScreen('results');
            this.displayRoundResults();
        } else if (gameState.gameState === 'finished') {
            this.showScreen('finalResults');
            this.displayFinalResults();
        }

        // Update personal hints
        if (gameState.playerHints) {
            this.playerHints = gameState.playerHints;
            this.updateHintsDisplay();
        }

        // Update personal timer if active
        const currentPlayer = gameState.players.find(p => p.id === this.playerId);
        if (currentPlayer?.isUsingPersonalTimer) {
            this.personalTimerDisplay.style.display = 'block';
            this.personalTimerText.textContent = Math.max(0, currentPlayer.personalTimer);
        } else {
            this.personalTimerDisplay.style.display = 'none';
        }
    }

    updateGameUI() {
        if (!this.gameState) return;

        this.currentRoundSpan.textContent = `Round ${this.gameState.currentRound}/${this.gameState.totalRounds}`;
        this.wordLengthSpan.textContent = `${this.gameState.currentWordLength} Letters`;
        this.questionText.textContent = this.gameState.currentQuestion?.question || '';
        this.letterCount.textContent = this.gameState.currentWordLength;
        this.answerInput.maxLength = this.gameState.currentWordLength;

        // Update timer
        const minutes = Math.floor(this.gameState.gameTimer / 60);
        const seconds = this.gameState.gameTimer % 60;
        this.mainTimer.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    updatePlayersGrid() {
        if (!this.gameState) return;

        this.playersGrid.innerHTML = '';
        
        this.gameState.players.forEach(player => {
            const playerCard = document.createElement('div');
            playerCard.className = 'player-card';
            
            if (player.id === this.playerId) {
                playerCard.classList.add('current-player');
            }
            if (player.hasAnswered) {
                playerCard.classList.add('found-answer');
            }

            // Show hints only for current player, hint count for others
            let hintsHTML = '';
            if (player.id === this.playerId) {
                hintsHTML = this.generateWordPattern(this.playerHints);
            } else {
                hintsHTML = player.hintCount > 0 ? `<span class="hint-count">${player.hintCount} hints used</span>` : '';
            }

            // Timer display
            const timerText = player.isUsingPersonalTimer ? 
                `${Math.max(0, player.personalTimer)}s` : 
                `${Math.floor(player.individualTimer / 60)}:${(player.individualTimer % 60).toString().padStart(2, '0')}`;

            playerCard.innerHTML = `
                <div class="player-header">
                    <span class="player-name">${player.name}${player.isHost ? ' (Host)' : ''}</span>
                    <span class="player-timer ${player.isUsingPersonalTimer ? 'countdown' : ''}">${timerText}</span>
                </div>
                <div class="player-status">${this.getPlayerStatusText(player)}</div>
                <div class="player-hints">${hintsHTML}</div>
            `;

            this.playersGrid.appendChild(playerCard);
        });
    }

    generateWordPattern(revealedPositions) {
        if (!this.gameState?.currentWordLength) return '';
        
        let pattern = '';
        for (let i = 0; i < this.gameState.currentWordLength; i++) {
            if (revealedPositions.includes(i)) {
                pattern += `<span class="hint-letter revealed">?</span>`;
            } else {
                pattern += `<span class="hint-letter hidden">-</span>`;
            }
        }
        return pattern;
    }

    getPlayerStatusText(player) {
        if (player.hasAnswered) return '✅ Answered!';
        if (player.status === 'final-countdown') return '⏰ Final Countdown!';
        if (player.status === 'thinking') return '🤔 Thinking...';
        return 'Waiting...';
    }

    updateHintsDisplay() {
        this.hintsDisplay.innerHTML = this.generateWordPattern(this.playerHints);
    }

    resetAnswerSection() {
        this.answerInput.value = '';
        this.answerInput.disabled = false;
        this.submitAnswerBtn.disabled = false;
        this.getHintBtn.disabled = false;
        this.foundBtn.disabled = false;
        this.foundBtn.textContent = '💡 Found! (Start 30s Timer)';
        this.personalTimerDisplay.style.display = 'none';
    }

    updateLobbyUI(gameState) {
        this.roomInfo.style.display = 'block';
        this.currentRoomCodeSpan.textContent = this.roomCode;
        
        this.playersList.innerHTML = '';
        gameState.players.forEach(player => {
            const li = document.createElement('li');
            li.textContent = player.name + (player.isHost ? ' (Host)' : '');
            this.playersList.appendChild(li);
        });

        if (this.isHost && gameState.players.length >= 1) {
            this.startGameBtn.style.display = 'block';
        }
    }

    displayRoundResults() {
        if (!this.gameState) return;

        this.correctAnswer.textContent = this.gameState.correctAnswer;
        
        this.playerResults.innerHTML = '';
        this.gameState.players.forEach(player => {
            const playerAnswer = this.gameState.playerAnswers?.[player.id];
            const resultItem = document.createElement('div');
            resultItem.className = 'result-item';
            
            if (playerAnswer) {
                resultItem.classList.add(playerAnswer.correct ? 'correct' : 'incorrect');
                resultItem.innerHTML = `
                    <div>
                        <strong>${player.name}</strong><br>
                        Answer: ${playerAnswer.answer} | Hints: ${playerAnswer.hintsUsed}
                    </div>
                    <div>+${playerAnswer.score} points</div>
                `;
            } else {
                resultItem.innerHTML = `
                    <div><strong>${player.name}</strong><br>No answer submitted</div>
                    <div>0 points</div>
                `;
            }
            
            this.playerResults.appendChild(resultItem);
        });

        // Hide next round button for non-hosts
        this.nextRoundBtn.style.display = 'none';
    }

    displayFinalResults() {
        if (!this.gameState) return;

        const sortedPlayers = [...this.gameState.players].sort((a, b) => b.score - a.score);
        
        this.finalLeaderboard.innerHTML = '';
        sortedPlayers.forEach((player, index) => {
            const position = index + 1;
            const resultItem = document.createElement('div');
            resultItem.className = 'result-item';
            
            let medal = '';
            if (position === 1) medal = '🥇';
            else if (position === 2) medal = '🥈';
            else if (position === 3) medal = '🥉';
            
            resultItem.innerHTML = `
                <div>
                    <strong>${medal} ${player.name}</strong>
                </div>
                <div>${player.score} points</div>
            `;
            
            this.finalLeaderboard.appendChild(resultItem);
        });
    }

    showScreen(screenName) {
        Object.values(this.screens).forEach(screen => {
            screen.classList.remove('active');
        });
        this.screens[screenName].classList.add('active');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        this.notificationContainer.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 4000);
    }

    nextRound() {
        // Results automatically progress on server
    }

    playAgain() {
        this.returnToLobby();
    }

    returnToLobby() {
        this.showScreen('lobby');
        this.roomInfo.style.display = 'none';
        this.startGameBtn.style.display = 'none';
        this.playerNameInput.value = '';
        this.roomCodeInput.value = '';
        this.roomCode = null;
        this.isHost = false;
        this.gameState = null;
        this.playerHints = [];
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.wordGame = new MultiplayerWordGame();
});
