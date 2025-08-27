class WordGame {
    constructor() {
        this.gameState = 'lobby'; // lobby, playing, results, finished
        this.currentRound = 0;
        this.totalRounds = 14; // 2 rounds each for 4, 5, 6, 7, 8, 9, 10 letters (7 × 2 = 14 questions)
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
                { question: "Large feline found in Africa", answer: "LION" },
                { question: "Frozen water", answer: "ICED" },
                { question: "A young bear", answer: "CUBS" }
            ],
            5: [
                { question: "A person who travels to unknown places", answer: "SCOUT" },
                { question: "A valuable yellow metal", answer: "GOLDS" },
                { question: "To make something bigger", answer: "SCALE" },
                { question: "Very happy emotion", answer: "BLISS" },
                { question: "Ocean mammal with flippers", answer: "WHALE" },
                { question: "Musical rhythm instrument", answer: "DRUMS" }
            ],
            6: [
                { question: "A secret plan to achieve something illegal", answer: "SCHEME" },
                { question: "A person who creates sculptures", answer: "ARTIST" },
                { question: "To vanish completely from sight", answer: "VANISH" },
                { question: "A round object used in sports", answer: "SPHERE" },
                { question: "A small, furry household pet", answer: "KITTEN" },
                { question: "A place where books are kept", answer: "LIBRARY" }
            ],
            7: [
                { question: "The feeling of great happiness", answer: "DELIGHT" },
                { question: "To change from one form to another", answer: "CONVERT" },
                { question: "The quality of being honest and fair", answer: "JUSTICE" },
                { question: "A person who teaches students", answer: "TEACHER" },
                { question: "The season after winter", answer: "SPRINGS" },
                { question: "A vehicle that travels in space", answer: "ROCKETS" }
            ],
            8: [
                { question: "Something that cannot be explained by science", answer: "MYSTICAL" },
                { question: "A person who studies ancient civilizations", answer: "EXPLORER" },
                { question: "The process of creating something new", answer: "CREATION" },
                { question: "A person who designs buildings", answer: "ENGINEER" },
                { question: "The study of living organisms", answer: "MEDICINE" },
                { question: "A large body of water", answer: "SEAWATER" }
            ],
            9: [
                { question: "Something that brings good fortune", answer: "FORTUNATE" },
                { question: "The state of being completely puzzled", answer: "CONFUSION" },
                { question: "A person who creates beautiful art", answer: "ARCHITECT" },
                { question: "The science of numbers and calculations", answer: "ALGORITHM" },
                { question: "A device used for communication", answer: "TELEPHONE" },
                { question: "The process of learning new skills", answer: "EDUCATION" }
            ],
            10: [
                { question: "The study of human behavior and mind", answer: "PSYCHOLOGY" },
                { question: "Something extraordinary and remarkable", answer: "PHENOMENAL" },
                { question: "A person who seeks truth through questioning", answer: "PHILOSOPHY" },
                { question: "The art of persuasive speaking", answer: "ELOQUENCES" },
                { question: "A scientific study of the universe", answer: "ASTRONOMER" },
                { question: "The process of making decisions", answer: "PROCEDURES" }
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
        
        // Make game instance globally accessible for debugging
        window.wordQuestGame = this;
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

        // Debug: Check if critical elements exist
        console.log('Element check:');
        console.log('startGameBtn:', this.startGameBtn ? 'Found' : 'NOT FOUND');
        console.log('roomInfo:', this.roomInfo ? 'Found' : 'NOT FOUND');
        console.log('playersList:', this.playersList ? 'Found' : 'NOT FOUND');

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
        this.joinGameBtn.addEventListener('click', () => {
            console.log('Join Game button clicked');
            this.joinGame();
        });
        this.createRoomBtn.addEventListener('click', () => {
            console.log('Create Room button clicked');
            this.createRoom();
        });
        if (this.startGameBtn) {
            this.startGameBtn.addEventListener('click', (e) => {
                console.log('Start Game button clicked');
                console.log('Event object:', e);
                console.log('Button element:', this.startGameBtn);
                console.log('Button disabled?', this.startGameBtn.disabled);
                console.log('Button visible?', this.startGameBtn.style.display);
                e.preventDefault();
                this.startGame();
            });
            console.log('Start Game button event listener attached successfully');
        } else {
            console.error('Start Game button not found during event listener setup');
        }

        // Game events
        if (this.getHintBtn) {
            this.getHintBtn.addEventListener('click', () => {
                console.log('Get Hint button clicked');
                this.getHint();
            });
            console.log('Get Hint button event listener attached');
        } else {
            console.error('Get Hint button not found during event listener setup');
        }

        if (this.submitAnswerBtn) {
            this.submitAnswerBtn.addEventListener('click', () => {
                console.log('Submit Answer button clicked');
                this.submitAnswer();
            });
            console.log('Submit Answer button event listener attached');
        } else {
            console.error('Submit Answer button not found during event listener setup');
        }

        if (this.foundBtn) {
            this.foundBtn.addEventListener('click', () => {
                console.log('Found button clicked');
                this.startPersonalTimer();
            });
            console.log('Found button event listener attached');
        } else {
            console.error('Found button not found during event listener setup');
        }
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
        console.log('showScreen called with:', screenName);
        console.log('Available screens:', Object.keys(this.screens));
        console.log('Target screen exists:', this.screens[screenName] ? 'YES' : 'NO');
        
        Object.values(this.screens).forEach(screen => {
            if (screen) {
                screen.classList.remove('active');
            }
        });
        
        if (this.screens[screenName]) {
            this.screens[screenName].classList.add('active');
            console.log('Screen', screenName, 'is now active');
        } else {
            console.error('Screen not found:', screenName);
        }
        
        this.gameState = screenName;
    }

    setupGameEventListeners() {
        console.log('setupGameEventListeners() called');
        
        // Re-find and attach game button event listeners
        this.getHintBtn = document.getElementById('getHintBtn');
        this.submitAnswerBtn = document.getElementById('submitAnswerBtn');
        this.foundBtn = document.getElementById('foundBtn');
        this.answerInput = document.getElementById('answerInput');
        this.nextRoundBtn = document.getElementById('nextRoundBtn');
        
        console.log('Re-found game elements:');
        console.log('getHintBtn:', this.getHintBtn ? 'Found' : 'NOT FOUND');
        console.log('submitAnswerBtn:', this.submitAnswerBtn ? 'Found' : 'NOT FOUND');
        console.log('foundBtn:', this.foundBtn ? 'Found' : 'NOT FOUND');
        console.log('answerInput:', this.answerInput ? 'Found' : 'NOT FOUND');
        console.log('nextRoundBtn:', this.nextRoundBtn ? 'Found' : 'NOT FOUND');

        // Remove any existing event listeners by cloning elements
        if (this.getHintBtn) {
            const newGetHintBtn = this.getHintBtn.cloneNode(true);
            this.getHintBtn.parentNode.replaceChild(newGetHintBtn, this.getHintBtn);
            this.getHintBtn = newGetHintBtn;
            
            this.getHintBtn.addEventListener('click', (e) => {
                console.log('Get Hint button clicked (re-attached)');
                e.preventDefault();
                this.getHint();
            });
            console.log('✅ Get Hint button re-attached');
        }

        if (this.submitAnswerBtn) {
            const newSubmitBtn = this.submitAnswerBtn.cloneNode(true);
            this.submitAnswerBtn.parentNode.replaceChild(newSubmitBtn, this.submitAnswerBtn);
            this.submitAnswerBtn = newSubmitBtn;
            
            this.submitAnswerBtn.addEventListener('click', (e) => {
                console.log('Submit Answer button clicked (re-attached)');
                e.preventDefault();
                this.submitAnswer();
            });
            console.log('✅ Submit Answer button re-attached');
        }

        if (this.foundBtn) {
            const newFoundBtn = this.foundBtn.cloneNode(true);
            this.foundBtn.parentNode.replaceChild(newFoundBtn, this.foundBtn);
            this.foundBtn = newFoundBtn;
            
            this.foundBtn.addEventListener('click', (e) => {
                console.log('Found button clicked (re-attached)');
                e.preventDefault();
                this.startPersonalTimer();
            });
            console.log('✅ Found button re-attached');
        }

        if (this.answerInput) {
            const newAnswerInput = this.answerInput.cloneNode(true);
            this.answerInput.parentNode.replaceChild(newAnswerInput, this.answerInput);
            this.answerInput = newAnswerInput;
            
            this.answerInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    console.log('Enter key pressed in answer input');
                    this.submitAnswer();
                }
            });
            console.log('✅ Answer input re-attached');
        }

        console.log('setupGameEventListeners() completed');
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
        
        // Auto-add demo players for single player mode
        this.addDemoPlayers();
        
        this.updateLobbyUI();
        this.showNotification('Room created! Click Start Game when ready.', 'success');
    }

    joinGame() {
        console.log('joinGame called');
        const playerName = this.playerNameInput.value.trim();
        console.log('Player name:', playerName);
        
        if (!playerName) {
            console.log('No player name provided');
            this.showNotification('Please enter your name', 'error');
            return;
        }

        // For single player, create automatic room
        this.roomCode = this.generateRoomCode();
        this.isHost = true;
        console.log('Created room code:', this.roomCode);
        
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
        console.log('Added current player, total players:', this.players.size);
        
        // Auto-add demo players for single player mode
        this.addDemoPlayers();
        console.log('Added demo players, total players:', this.players.size);
        
        this.updateLobbyUI();
        this.showNotification('Game setup complete! Click Start Word Quest to begin.', 'success');
        console.log('joinGame completed');
    }

    addDemoPlayers() {
        console.log('addDemoPlayers called, current players:', this.players.size);
        const demoPlayers = [
            { name: 'Alice', id: 'demo1' },
            { name: 'Bob', id: 'demo2' },
            { name: 'Charlie', id: 'demo3' }
        ];

        demoPlayers.forEach(demo => {
            console.log('Adding demo player:', demo.name);
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

        console.log('After adding demo players, total players:', this.players.size);
        this.updateLobbyUI();
    }

    updateLobbyUI() {
        console.log('updateLobbyUI called, players count:', this.players.size);
        this.roomInfo.style.display = 'block';
        
        // Safely update room code if element exists
        if (this.currentRoomCodeSpan) {
            this.currentRoomCodeSpan.textContent = this.roomCode;
        }
        
        this.playersList.innerHTML = '';
        this.players.forEach(player => {
            const li = document.createElement('li');
            li.textContent = player.name + (player.isHost ? ' (Host)' : '');
            this.playersList.appendChild(li);
        });

        console.log('Is host:', this.isHost, 'Players size:', this.players.size);
        if (this.isHost && this.players.size >= 1) {
            console.log('Showing start game button');
            this.startGameBtn.style.display = 'block';
            
            // Add backup click handler directly to the button
            this.startGameBtn.onclick = (e) => {
                console.log('Start Game button clicked via onclick');
                e.preventDefault();
                this.startGame();
            };
            console.log('Backup onclick handler added to start button');
        } else {
            console.log('Not showing start game button - isHost:', this.isHost, 'players.size:', this.players.size);
        }
    }

    // Game Functions
    startGame() {
        console.log('startGame() called!');
        console.log('Current gameState:', this.gameState);
        console.log('Available screens:', Object.keys(this.screens));
        
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
        
        console.log('About to show game screen...');
        this.showScreen('game');
        console.log('Game screen shown, setting up round...');
        this.setupRound();
        console.log('Round setup complete, re-attaching game event listeners...');
        this.setupGameEventListeners();
        console.log('Starting timer...');
        this.startGameTimer();
        this.showNotification('Game started! Each player has 4 minutes total. Good luck!', 'success');
        console.log('startGame() completed!');
    }

        setupRound() {
        console.log('setupRound() called, current round:', this.currentRound);
        
        // Calculate word length based on round (2 rounds per word length)
        if (this.currentRound <= 2) {
            this.currentWordLength = 4;        // Rounds 1-2: 4 letters
        } else if (this.currentRound <= 4) {
            this.currentWordLength = 5;        // Rounds 3-4: 5 letters
        } else if (this.currentRound <= 6) {
            this.currentWordLength = 6;        // Rounds 5-6: 6 letters
        } else if (this.currentRound <= 8) {
            this.currentWordLength = 7;        // Rounds 7-8: 7 letters
        } else if (this.currentRound <= 10) {
            this.currentWordLength = 8;        // Rounds 9-10: 8 letters
        } else if (this.currentRound <= 12) {
            this.currentWordLength = 9;        // Rounds 11-12: 9 letters
        } else {
            this.currentWordLength = 10;       // Rounds 13-14: 10 letters
        }
        console.log('Word length for this round:', this.currentWordLength);

        // Get random question for current word length
        const questionsForLength = this.wordSets[this.currentWordLength];
        if (questionsForLength && questionsForLength.length > 0) {
            const randomIndex = Math.floor(Math.random() * questionsForLength.length);
            this.currentQuestion = questionsForLength[randomIndex];
            this.currentAnswer = this.currentQuestion.answer.toUpperCase();
            console.log('Selected question:', this.currentQuestion.question);
            console.log('Answer:', this.currentAnswer);
        } else {
            // Fallback question
            this.currentQuestion = { 
                question: `Find a ${this.currentWordLength}-letter word`, 
                answer: 'WORD'.padEnd(this.currentWordLength, 'S') 
            };
            this.currentAnswer = this.currentQuestion.answer.toUpperCase();
            console.log('Using fallback question and answer:', this.currentAnswer);
        }

        // Reset player states for new round
        this.players.forEach(player => {
            player.hints = [];
            player.status = 'thinking';
            player.foundWord = false;
            player.answer = '';
            player.personalTimer = 0;
            player.isUsingPersonalTimer = false;
            player.hasAnswered = false;
            player.timerPaused = false;
        });
        
        // Reset general timer pause state
        this.isGeneralTimerPaused = false;

        // Initialize hints for each player with empty arrays
        this.playerHints.clear();
        this.players.forEach(player => {
            this.playerHints.set(player.id, []);
        });
        this.playerAnswers.clear();

        console.log('Updating game UI...');
        this.updateGameUI();
        console.log('Updating players grid...');
        this.updatePlayersGrid();
        console.log('Resetting answer section...');
        this.resetAnswerSection();
        console.log('setupRound() completed');
    }

    updateGameUI() {
        console.log('updateGameUI() called');
        console.log('Elements check:');
        console.log('currentRoundSpan:', this.currentRoundSpan ? 'Found' : 'NOT FOUND');
        console.log('wordLengthSpan:', this.wordLengthSpan ? 'Found' : 'NOT FOUND');
        console.log('questionText:', this.questionText ? 'Found' : 'NOT FOUND');
        console.log('letterCount:', this.letterCount ? 'Found' : 'NOT FOUND');
        console.log('answerInput:', this.answerInput ? 'Found' : 'NOT FOUND');
        
        if (this.currentRoundSpan) {
            this.currentRoundSpan.textContent = `Round ${this.currentRound}/${this.totalRounds}`;
        }
        if (this.wordLengthSpan) {
            this.wordLengthSpan.textContent = `${this.currentWordLength} Letters`;
        }
        if (this.questionText) {
            this.questionText.textContent = this.currentQuestion.question;
            console.log('Question set to:', this.currentQuestion.question);
        }
        if (this.letterCount) {
            this.letterCount.textContent = this.currentWordLength;
        }
        if (this.answerInput) {
            this.answerInput.maxLength = this.currentWordLength;
        }
        console.log('updateGameUI() completed');
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
        console.log('updateTimerDisplay() called, gameTimer:', this.gameTimer);
        const minutes = Math.floor(this.gameTimer / 60);
        const seconds = this.gameTimer % 60;
        const timeText = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        if (this.mainTimer) {
            this.mainTimer.textContent = timeText;
            console.log('Timer updated to:', timeText);
        } else {
            console.error('mainTimer element not found!');
        }
    }

    getHint() {
        console.log('getHint() called!');
        const revealedPositions = this.playerHints.get(this.playerId) || [];
        console.log('Current revealed positions:', revealedPositions);
        console.log('Current word length:', this.currentWordLength);
        
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

        // For single player mode, auto-proceed after user answers
        console.log('User answered, scheduling auto-progression to next round...');
        setTimeout(() => {
            console.log('Auto-skipping to next round for single player mode...');
            // Mark all demo players as answered automatically
            this.players.forEach(player => {
                if (player.id !== this.playerId && !player.hasAnswered) {
                    player.hasAnswered = true;
                    player.status = 'completed';
                    player.answer = 'AUTO';
                    // Give demo players random scores
                    const randomScore = Math.floor(Math.random() * 800) + 200;
                    player.score += randomScore;
                    this.playerAnswers.set(player.id, {
                        answer: 'AUTO',
                        correct: true,
                        score: randomScore,
                        hintsUsed: 0
                    });
                }
            });
            this.checkRoundEnd();
        }, 3000); // Auto-proceed after 3 seconds
    }

    checkRoundEnd() {
        console.log('checkRoundEnd() called');
        
        // Check if all players have answered
        const allPlayers = Array.from(this.players.values());
        const answeredPlayers = allPlayers.filter(player => player.hasAnswered);
        const allAnswered = allPlayers.every(player => player.hasAnswered);
        
        console.log('Total players:', allPlayers.length);
        console.log('Players who answered:', answeredPlayers.length);
        console.log('All answered?', allAnswered);
        
        allPlayers.forEach(player => {
            console.log(`Player ${player.name}: hasAnswered = ${player.hasAnswered}, status = ${player.status}`);
        });
        
        if (allAnswered) {
            console.log('All players have answered! Moving to results...');
            this.showNotification('All players have answered! Moving to results...', 'success');
            setTimeout(() => {
                this.endRound();
            }, 2000);
        } else {
            // Show how many players are still answering
            const remainingPlayers = allPlayers.filter(player => !player.hasAnswered).length;
            console.log(`${remainingPlayers} players still need to answer`);
            this.showNotification(`Waiting for ${remainingPlayers} more player(s) to answer...`, 'info');
            
            // Auto-simulate demo players answering after some time for testing
            this.simulateDemoPlayersAnswering();
        }
    }

    simulateDemoPlayersAnswering() {
        console.log('simulateDemoPlayersAnswering() called');
        const demoPlayerIds = ['demo1', 'demo2', 'demo3'];
        
        demoPlayerIds.forEach((playerId, index) => {
            const player = this.players.get(playerId);
            if (player && !player.hasAnswered) {
                console.log(`Scheduling demo player ${player.name} to answer in ${(index + 1) * 2} seconds`);
                setTimeout(() => {
                    console.log(`Demo player ${player.name} is answering...`);
                    // Simulate random answer
                    const isCorrect = Math.random() > 0.6; // 60% chance of correct answer
                    const answer = isCorrect ? this.currentAnswer : 'WRONG';
                    const score = isCorrect ? Math.max(500, 1000 - Math.floor(Math.random() * 300)) : 0;
                    
                    player.hasAnswered = true;
                    player.answer = answer;
                    player.score += score;
                    player.status = 'completed';
                    
                    this.playerAnswers.set(playerId, {
                        answer: answer,
                        correct: isCorrect,
                        score: score,
                        hintsUsed: Math.floor(Math.random() * 2)
                    });
                    
                    console.log(`Demo player ${player.name} answered: ${answer} (${isCorrect ? 'Correct' : 'Wrong'})`);
                    this.updatePlayersGrid();
                    
                    // Check if all players have answered
                    setTimeout(() => {
                        console.log('Checking round end after demo player answer...');
                        this.checkRoundEnd();
                    }, 500);
                }, (index + 1) * 2000); // Faster responses - 2, 4, 6 seconds
            }
        });
    }

    endRound() {
        console.log('endRound() called, current round:', this.currentRound, 'of', this.totalRounds);
        this.showScreen('results');
        this.displayRoundResults();
        
        // Show countdown for auto-progression
        let countdown = 5;
        const countdownInterval = setInterval(() => {
            if (this.nextRoundBtn) {
                this.nextRoundBtn.innerHTML = `<i class="fas fa-arrow-right"></i> Next Round (${countdown}s)`;
            }
            countdown--;
            
            if (countdown <= 0) {
                clearInterval(countdownInterval);
                console.log('Auto-proceeding to next round...');
                this.nextRound();
            }
        }, 1000);
        
        // Also allow manual progression
        if (this.nextRoundBtn) {
            this.nextRoundBtn.style.display = 'block';
            this.nextRoundBtn.onclick = () => {
                console.log('Next Round button clicked manually');
                clearInterval(countdownInterval);
                this.nextRound();
            };
        }
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
        console.log('nextRound() called, new round:', this.currentRound, 'total rounds:', this.totalRounds);
        
        if (this.currentRound > this.totalRounds) {
            console.log('Game complete! Ending game...');
            this.endGame();
        } else {
            console.log('Starting round', this.currentRound);
            // Resume timers for next round
            this.isGeneralTimerPaused = false;
            this.players.forEach(player => {
                player.timerPaused = false;
                player.hasAnswered = false; // Reset for next round
                player.status = 'thinking';
                player.answer = '';
                player.personalTimer = 0;
                player.isUsingPersonalTimer = false;
            });
            
            // Clear player answers for next round
            this.playerAnswers.clear();
            
            this.showScreen('game');
            this.setupRound();
            this.setupGameEventListeners(); // Re-attach event listeners for new round
            this.showNotification(`Round ${this.currentRound} started! Timers resumed.`, 'info');
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
