class WordGame {
    constructor() {
        this.gameState = 'lobby'; // lobby, playing, results, finished
        this.currentRound = 0;
        this.totalRounds = 6; // 2 rounds each for 4, 5, 6-10 letters
        this.gameTimer = 4 * 60; // 4 minutes in seconds (general timer - paused when someone finds)
        this.isGeneralTimerPaused = false; // Whether general timer is paused
        this.roundTimer = 0;
        this.answerTimer = 30; // 30 seconds after checking "found it"
        
        this.players = new Map();
        this.currentPlayer = null;
        this.roomCode = null;
        this.isHost = false;
        
        this.currentQuestion = null;
        this.currentAnswer = null;
        this.playerHints = new Map(); // Will store arrays of revealed positions
        this.playerAnswers = new Map();
        
        // Word sets for different lengths
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
        
        this.currentWordLength = 4;
        this.roundsPerLength = 2;
        
        this.sounds = {
            correct: document.getElementById('correctSound'),
            incorrect: document.getElementById('incorrectSound')
        };
        
        this.initializeElements();
        this.setupEventListeners();
        this.initializeGame();
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
        this.joinGameBtn.addEventListener('click', () => this.joinGame());
        this.createRoomBtn.addEventListener('click', () => this.createRoom());
        this.startGameBtn.addEventListener('click', () => this.startGame());

        // Game events
        this.getHintBtn.addEventListener('click', () => this.getHint());
        this.submitAnswerBtn.addEventListener('click', () => this.submitAnswer());
        this.foundBtn.addEventListener('click', () => this.startPersonalTimer());
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
            if (e.target.value.length > this.currentWordLength) {
                e.target.value = e.target.value.slice(0, this.currentWordLength);
            }
        });

        this.playerNameInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^a-zA-Z0-9\s]/g, '');
        });

        this.roomCodeInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        });
    }

    initializeGame() {
        this.showScreen('lobby');
        this.generatePlayerId();
    }

    generatePlayerId() {
        this.playerId = 'player_' + Math.random().toString(36).substr(2, 9);
    }

    generateRoomCode() {
        return Math.random().toString(36).substr(2, 6).toUpperCase();
    }

    showScreen(screenName) {
        Object.values(this.screens).forEach(screen => {
            screen.classList.remove('active');
        });
        this.screens[screenName].classList.add('active');
        this.gameState = screenName;
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

    // Lobby Functions
    createRoom() {
        const playerName = this.playerNameInput.value.trim();
        if (!playerName) {
            this.showNotification('Please enter your name', 'error');
            return;
        }

        this.roomCode = this.generateRoomCode();
        this.isHost = true;
        this.currentPlayer = {
            id: this.playerId,
            name: playerName,
            score: 0,
            hints: [],
            status: 'waiting',
            isHost: true,
            individualTimer: 4 * 60, // Each player gets 4 minutes
            timerPaused: false
        };

        this.players.set(this.playerId, this.currentPlayer);
        this.updateLobbyUI();
        this.showNotification('Room created successfully!', 'success');
    }

    joinGame() {
        const playerName = this.playerNameInput.value.trim();
        if (!playerName) {
            this.showNotification('Please enter your name', 'error');
            return;
        }

        // For demo purposes, auto-create room if no code provided
        const roomCode = this.roomCodeInput.value.trim() || this.generateRoomCode();
        
        this.roomCode = roomCode;
        this.currentPlayer = {
            id: this.playerId,
            name: playerName,
            score: 0,
            hints: [],
            status: 'waiting',
            isHost: this.players.size === 0,
            individualTimer: 4 * 60, // Each player gets 4 minutes
            timerPaused: false
        };

        this.players.set(this.playerId, this.currentPlayer);
        this.updateLobbyUI();
        this.showNotification('Joined room successfully!', 'success');

        // Auto-add some demo players for testing
        if (this.players.size === 1) {
            this.addDemoPlayers();
        }
    }

    addDemoPlayers() {
        const demoPlayers = [
            { name: 'Alice', id: 'demo1' },
            { name: 'Bob', id: 'demo2' },
            { name: 'Charlie', id: 'demo3' }
        ];

        demoPlayers.forEach(demo => {
            this.players.set(demo.id, {
                id: demo.id,
                name: demo.name,
                score: 0,
                hints: [],
                status: 'waiting',
                isHost: false,
                individualTimer: 4 * 60, // Each player gets 4 minutes
                timerPaused: false
            });
        });

        this.updateLobbyUI();
    }

    updateLobbyUI() {
        this.roomInfo.style.display = 'block';
        this.currentRoomCodeSpan.textContent = this.roomCode;
        
        this.playersList.innerHTML = '';
        this.players.forEach(player => {
            const li = document.createElement('li');
            li.textContent = player.name + (player.isHost ? ' (Host)' : '');
            this.playersList.appendChild(li);
        });

        if (this.isHost && this.players.size >= 2) {
            this.startGameBtn.style.display = 'block';
        }
    }

    // Game Functions
    startGame() {
        this.gameState = 'playing';
        this.currentRound = 1;
        this.gameTimer = 4 * 60;
        this.currentWordLength = 4;
        
        // Reset all players' individual timers to 4 minutes
        this.players.forEach(player => {
            player.individualTimer = 4 * 60;
            player.timerPaused = false;
            player.score = 0; // Reset scores for new game
        });
        
        this.showScreen('game');
        this.setupRound();
        this.startGameTimer();
        this.showNotification('Game started! Each player has 4 minutes total. Good luck!', 'success');
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

        // Get random question for current word length
        const questionsForLength = this.wordSets[this.currentWordLength];
        if (questionsForLength && questionsForLength.length > 0) {
            const randomIndex = Math.floor(Math.random() * questionsForLength.length);
            this.currentQuestion = questionsForLength[randomIndex];
            this.currentAnswer = this.currentQuestion.answer.toUpperCase();
        } else {
            // Fallback question
            this.currentQuestion = { 
                question: `Find a ${this.currentWordLength}-letter word`, 
                answer: 'WORD'.padEnd(this.currentWordLength, 'S') 
            };
            this.currentAnswer = this.currentQuestion.answer.toUpperCase();
        }

        // Reset player states for new round
        this.players.forEach(player => {
            player.hints = [];
            player.status = 'thinking';
            player.foundWord = false;
            player.answer = '';
            player.personalTimer = 0; // Individual timer for this player
            player.isUsingPersonalTimer = false; // Whether player pressed "Found!"
            player.hasAnswered = false; // Whether player has submitted an answer
            player.timerPaused = false; // Reset pause state
            // Note: individualTimer (4 minutes) continues across rounds
        });
        
        // Reset general timer pause state
        this.isGeneralTimerPaused = false;

        // Initialize hints for each player with empty arrays (positions not revealed)
        this.playerHints.clear();
        this.players.forEach(player => {
            this.playerHints.set(player.id, []);
        });
        this.playerAnswers.clear();
        
        this.updateGameUI();
        this.updatePlayersGrid();
        this.resetAnswerSection();
    }

    updateGameUI() {
        this.currentRoundSpan.textContent = `Round ${this.currentRound}/${this.totalRounds}`;
        this.wordLengthSpan.textContent = `${this.currentWordLength} Letters`;
        this.questionText.textContent = this.currentQuestion.question;
        this.letterCount.textContent = this.currentWordLength;
        this.answerInput.maxLength = this.currentWordLength;
    }

    updatePlayersGrid() {
        this.playersGrid.innerHTML = '';
        
        this.players.forEach(player => {
            const playerCard = document.createElement('div');
            playerCard.className = 'player-card';
            if (player.id === this.playerId) {
                playerCard.classList.add('current-player');
            }
            if (player.foundWord) {
                playerCard.classList.add('found-answer');
            }

            // Only show hints for current player, others just see hint count
            let hintsHTML = '';
            if (player.id === this.playerId) {
                const revealedPositions = this.playerHints.get(player.id) || [];
                hintsHTML = this.generateWordPattern(revealedPositions);
            } else {
                const hintCount = this.playerHints.get(player.id)?.length || 0;
                hintsHTML = hintCount > 0 ? `<span class="hint-count">${hintCount} hints used</span>` : '';
            }

            // Show personal 30s timer if active, otherwise show individual 4-minute timer
            const timerText = player.isUsingPersonalTimer ? 
                `${Math.max(0, player.personalTimer)}s` : 
                `${Math.floor(player.individualTimer / 60)}:${(player.individualTimer % 60).toString().padStart(2, '0')}`;

            playerCard.innerHTML = `
                <div class="player-header">
                    <span class="player-name">${player.name}</span>
                    <span class="player-timer ${player.isUsingPersonalTimer ? 'countdown' : ''}">${timerText}</span>
                </div>
                <div class="player-status">${this.getPlayerStatusText(player)}</div>
                <div class="player-hints">${hintsHTML}</div>
            `;

            this.playersGrid.appendChild(playerCard);
        });
    }

    getPlayerStatusText(player) {
        if (player.hasAnswered) return '✅ Answered!';
        if (player.status === 'final-countdown') return '⏰ Final Countdown!';
        if (player.status === 'thinking') return '🤔 Thinking...';
        if (player.status === 'submitting') return '⏱️ Submitting...';
        return 'Waiting...';
    }

    generateWordPattern(revealedPositions) {
        let pattern = '';
        for (let i = 0; i < this.currentWordLength; i++) {
            if (revealedPositions.includes(i)) {
                // Show the actual letter at this position
                pattern += `<span class="hint-letter revealed">${this.currentAnswer[i]}</span>`;
            } else {
                // Show a dash for unrevealed positions
                pattern += `<span class="hint-letter hidden">-</span>`;
            }
        }
        return pattern;
    }

    resetAnswerSection() {
        this.answerInput.value = '';
        this.answerInput.disabled = false; // Re-enable the input field
        this.submitAnswerBtn.disabled = false;
        this.getHintBtn.disabled = false; // Re-enable hints for new round
        this.foundBtn.disabled = false;
        this.foundBtn.textContent = '💡 Found! (Start 30s Timer)';
        this.personalTimerDisplay.style.display = 'none';
        this.hintsDisplay.innerHTML = '';
    }

    startGameTimer() {
        this.gameTimerInterval = setInterval(() => {
            // Only update general timer if not paused
            if (!this.isGeneralTimerPaused) {
                this.gameTimer--;
            }
            
            this.updateTimerDisplay();
            this.updatePlayerTimers();
            
            if (this.gameTimer <= 0) {
                this.endGame();
            }
        }, 1000);
    }

    updatePlayerTimers() {
        this.players.forEach(player => {
            // Individual 4-minute timer (only counts down when not paused and not answered)
            if (!player.timerPaused && !player.hasAnswered) {
                player.individualTimer--;
                
                // Check if player runs out of individual time
                if (player.individualTimer <= 0 && player.id === this.playerId) {
                    this.showNotification('Your time is up!', 'error');
                    this.submitAnswer(true); // Auto-submit
                }
            }
            
            // Personal 30-second timer for found state
            if (player.isUsingPersonalTimer && !player.hasAnswered) {
                player.personalTimer--;
                
                // Auto-submit if personal timer reaches 0
                if (player.personalTimer <= 0 && player.id === this.playerId) {
                    this.submitAnswer(true); // Auto-submit
                }
            } else if (!player.isUsingPersonalTimer && !player.hasAnswered) {
                // Track how long they've been thinking (for display purposes)
                player.personalTimer++;
            }
        });
        
        // Update personal timer display for current player
        const currentPlayer = this.players.get(this.playerId);
        if (currentPlayer && currentPlayer.isUsingPersonalTimer) {
            this.personalTimerText.textContent = Math.max(0, currentPlayer.personalTimer);
            if (currentPlayer.personalTimer <= 0) {
                this.personalTimerDisplay.style.display = 'none';
            }
        }
        
        this.updatePlayersGrid();
    }

    updateTimerDisplay() {
        const minutes = Math.floor(this.gameTimer / 60);
        const seconds = this.gameTimer % 60;
        this.mainTimer.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    getHint() {
        const revealedPositions = this.playerHints.get(this.playerId) || [];
        
        if (revealedPositions.length >= this.currentWordLength - 1) {
            this.showNotification('No more hints available!', 'error');
            return;
        }

        // Get available positions that haven't been revealed yet
        const availablePositions = [];
        for (let i = 0; i < this.currentWordLength; i++) {
            if (!revealedPositions.includes(i)) {
                availablePositions.push(i);
            }
        }
        
        if (availablePositions.length > 0) {
            // Reveal a random position
            const randomPosition = availablePositions[Math.floor(Math.random() * availablePositions.length)];
            revealedPositions.push(randomPosition);
            this.playerHints.set(this.playerId, revealedPositions);
            
            const revealedLetter = this.currentAnswer[randomPosition];
            this.updateHintsDisplay();
            this.updatePlayersGrid();
            this.showNotification(`Hint: Position ${randomPosition + 1} is "${revealedLetter}"`, 'info');
        }
    }

    updateHintsDisplay() {
        const revealedPositions = this.playerHints.get(this.playerId) || [];
        this.hintsDisplay.innerHTML = this.generateWordPattern(revealedPositions);
    }

    startPersonalTimer() {
        const currentPlayer = this.players.get(this.playerId);
        if (!currentPlayer || currentPlayer.isUsingPersonalTimer || currentPlayer.hasAnswered) {
            return;
        }

        // Pause general timer when someone presses Found!
        this.isGeneralTimerPaused = true;
        
        // Pause the player's individual timer
        currentPlayer.timerPaused = true;

        // Start the 30-second personal timer
        currentPlayer.isUsingPersonalTimer = true;
        currentPlayer.personalTimer = 30;
        currentPlayer.status = 'final-countdown';

        // Show personal timer display
        this.personalTimerDisplay.style.display = 'block';
        this.personalTimerText.textContent = '30';

        // Disable the Found! button and hint button
        this.foundBtn.disabled = true;
        this.foundBtn.textContent = '⏰ 30s Timer Active';
        this.getHintBtn.disabled = true; // Can't take hints after pressing Found!

        this.updatePlayersGrid();
        this.showNotification('30-second timer started! General timer paused. Submit your answer quickly!', 'info');
    }

    toggleFoundWord(checked) {
        if (checked) {
            this.foundCheckboxContainer.style.display = 'block';
            this.answerTimer = 30;
            this.startAnswerTimer();
            this.showNotification('30 seconds to submit your answer!', 'info');
        } else {
            this.stopAnswerTimer();
            this.foundCheckboxContainer.style.display = 'none';
        }
    }

    startAnswerTimer() {
        this.answerTimerInterval = setInterval(() => {
            this.answerTimer--;
            
            if (this.answerTimer <= 0) {
                this.submitAnswer(true); // Auto-submit when time runs out
            }
        }, 1000);
    }

    stopAnswerTimer() {
        if (this.answerTimerInterval) {
            clearInterval(this.answerTimerInterval);
            this.answerTimerInterval = null;
        }
    }

    submitAnswer(autoSubmit = false) {
        const answer = this.answerInput.value.trim().toUpperCase();
        
        if (!answer) {
            this.showNotification('Please enter an answer', 'error');
            return;
        }

        if (answer.length !== this.currentWordLength) {
            this.showNotification(`Answer must be exactly ${this.currentWordLength} letters long`, 'error');
            return;
        }

        this.stopAnswerTimer();
        
        const isCorrect = answer === this.currentAnswer;
        const currentPlayer = this.players.get(this.playerId);
        
        // Calculate score: 1000 points per letter minus hints used
        let score = 0;
        if (isCorrect) {
            const hintsUsed = this.playerHints.get(this.playerId)?.length || 0;
            const correctLetters = this.currentWordLength - hintsUsed;
            score = correctLetters * 1000; // 1000 points per letter not from hints
            
            if (currentPlayer.isUsingPersonalTimer) {
                score += 2000; // Bonus for using "Found!" feature
            }
        }

        currentPlayer.score += score;
        currentPlayer.answer = answer;
        currentPlayer.hasAnswered = true;
        currentPlayer.status = 'completed';

        this.playerAnswers.set(this.playerId, {
            answer: answer,
            correct: isCorrect,
            score: score,
            hintsUsed: this.playerHints.get(this.playerId)?.length || 0
        });

        // Play sound
        if (isCorrect) {
            this.sounds.correct?.play().catch(() => {});
            this.showNotification(`Correct! +${score} points`, 'success');
        } else {
            this.sounds.incorrect?.play().catch(() => {});
            this.showNotification(`Incorrect answer`, 'error');
        }

        this.submitAnswerBtn.disabled = true;
        this.getHintBtn.disabled = true;
        this.answerInput.disabled = true;
        this.updatePlayersGrid();

        // Check if round should end
        setTimeout(() => {
            this.checkRoundEnd();
        }, 2000);
    }

    checkRoundEnd() {
        // Check if all players have answered
        const allAnswered = Array.from(this.players.values()).every(player => player.hasAnswered);
        
        if (allAnswered) {
            this.showNotification('All players have answered! Moving to results...', 'success');
            setTimeout(() => {
                this.endRound();
            }, 2000);
        } else {
            // Show how many players are still answering
            const remainingPlayers = Array.from(this.players.values()).filter(player => !player.hasAnswered).length;
            this.showNotification(`Waiting for ${remainingPlayers} more player(s) to answer...`, 'info');
            
            // Auto-simulate demo players answering after some time for testing
            this.simulateDemoPlayersAnswering();
        }
    }

    simulateDemoPlayersAnswering() {
        const demoPlayerIds = ['demo1', 'demo2', 'demo3'];
        
        demoPlayerIds.forEach((playerId, index) => {
            const player = this.players.get(playerId);
            if (player && !player.hasAnswered) {
                setTimeout(() => {
                    // Simulate random answer
                    const isCorrect = Math.random() > 0.5;
                    const answer = isCorrect ? this.currentAnswer : 'FAKE';
                    const score = isCorrect ? Math.max(5, 10 - Math.floor(Math.random() * 6)) : 0;
                    
                    player.hasAnswered = true;
                    player.answer = answer;
                    player.score += score;
                    player.status = 'completed';
                    
                    this.playerAnswers.set(playerId, {
                        answer: answer,
                        correct: isCorrect,
                        score: score,
                        hintsUsed: Math.floor(Math.random() * 3)
                    });
                    
                    this.updatePlayersGrid();
                    this.checkRoundEnd();
                }, (index + 1) * 3000); // Stagger the responses
            }
        });
    }

    endRound() {
        this.showScreen('results');
        this.displayRoundResults();
    }

    displayRoundResults() {
        this.correctAnswer.textContent = this.currentAnswer;
        
        this.playerResults.innerHTML = '';
        this.players.forEach(player => {
            const playerAnswer = this.playerAnswers.get(player.id);
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
    }

    nextRound() {
        this.currentRound++;
        
        if (this.currentRound > this.totalRounds) {
            this.endGame();
        } else {
            // Resume timers for next round
            this.isGeneralTimerPaused = false;
            this.players.forEach(player => {
                player.timerPaused = false;
            });
            
            this.showScreen('game');
            this.setupRound();
            this.showNotification('Next round! Timers resumed.', 'info');
        }
    }

    endGame() {
        if (this.gameTimerInterval) {
            clearInterval(this.gameTimerInterval);
        }
        
        this.showScreen('finalResults');
        this.displayFinalResults();
    }

    displayFinalResults() {
        // Sort players by score
        const sortedPlayers = Array.from(this.players.values()).sort((a, b) => b.score - a.score);
        
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

    playAgain() {
        this.currentRound = 0;
        this.gameTimer = 4 * 60;
        this.players.forEach(player => {
            player.score = 0;
            player.hints = [];
            player.status = 'waiting';
        });
        this.startGame();
    }

    returnToLobby() {
        this.showScreen('lobby');
        this.resetGame();
    }

    resetGame() {
        if (this.gameTimerInterval) {
            clearInterval(this.gameTimerInterval);
        }
        if (this.answerTimerInterval) {
            clearInterval(this.answerTimerInterval);
        }
        
        this.gameState = 'lobby';
        this.currentRound = 0;
        this.gameTimer = 4 * 60;
        this.players.clear();
        this.playerHints.clear();
        this.playerAnswers.clear();
        this.roomCode = null;
        this.isHost = false;
        this.currentPlayer = null;
        
        // Reset UI
        this.roomInfo.style.display = 'none';
        this.startGameBtn.style.display = 'none';
        this.playerNameInput.value = '';
        this.roomCodeInput.value = '';
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.wordGame = new WordGame();
});
