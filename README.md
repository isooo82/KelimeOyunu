# 🎮 Word Quest - Real-Time Multiplayer Word Game

A competitive real-time multiplayer word guessing game where players race to find words of increasing difficulty while managing individual timers and strategic hint usage. **Now with true online multiplayer!**

![Word Quest Demo](https://img.shields.io/badge/Status-Ready%20to%20Play-brightgreen) 
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow)
![HTML5](https://img.shields.io/badge/HTML5-Semantic-orange)
![CSS3](https://img.shields.io/badge/CSS3-Glassmorphism-blue)
![Node.js](https://img.shields.io/badge/Node.js-Multiplayer-green)
![Socket.IO](https://img.shields.io/badge/Socket.IO-Real--Time-blue)

## 🚀 Quick Start (Play Online with Friends!)

### Option 1: Local Multiplayer Server
```bash
# Install Node.js first (nodejs.org)
npm install
npm start

# Game available at: http://localhost:3000
# Share with friends: http://YOUR_IP:3000
```

### Option 2: Easy Start Scripts
**Windows:** Double-click `start-game.bat`  
**Mac/Linux:** Run `./start-game.sh`

### Option 3: Single Player (Offline)
Simply open `index.html` in your browser for offline play with demo players.

## 🎯 Game Features

### 🎪 **Core Gameplay**
- **Progressive Difficulty**: Words increase from 4 to 10 letters across 6 rounds
- **Individual Timers**: Each player gets 4 minutes total for the entire game
- **Smart Pause System**: Timers pause when any player presses "Found!"
- **Positioned Hints**: See letter positions like `R-A-E` instead of random letters
- **Privacy Protection**: Only see your own hints, others show hint count only

### ⏰ **Advanced Timer System**
- **Personal 4-minute timer** for each player
- **General timer pauses** when someone finds the answer
- **30-second countdown** after pressing "Found!" button
- **Timer resumes** for next question
- **Auto-submit** when time expires

### 💰 **Scoring System**
- **1000 points per letter** found without hints
- **+2000 bonus** for using "Found!" feature
- **No points** for letters revealed by hints
- **Example**: 5-letter word with 2 hints = 3000 points (3 × 1000)

### 🌐 **Real-Time Multiplayer**
- **True online multiplayer** with WebSocket connections
- **Room-based gameplay** with shareable room codes
- **Real-time synchronization** of all game events
- **Cross-platform support** (PC, mobile, tablet)
- **Automatic reconnection** if connection drops

### 🎨 **Modern UI/UX**
- **Glassmorphism design** with backdrop blur effects
- **Responsive layout** works on all devices
- **Real-time updates** for all players
- **Visual feedback** and smooth animations
- **Sound effects** for correct/incorrect answers

## 🎮 How to Play

### 🏁 **Getting Started**
1. Open `index.html` in any modern web browser
2. Enter your player name
3. Create a room or join with a room code
4. Wait for other players (demo players auto-join for testing)
5. Host clicks "Start Game" when ready

### 🎯 **During Gameplay**
1. **Read the clue** for the current word
2. **Think and type** your answer
3. **Get hints** if stuck (reveals letter positions)
4. **Press "Found!"** when confident to start 30-second timer
5. **Submit answer** before time runs out
6. **Wait for others** - game continues when all players answer

### ⌨️ **Controls**
- **Type letters**: Automatically converts to uppercase
- **Enter key**: Submit answer
- **Hint button**: Reveal a random letter position
- **Found! button**: Start 30-second countdown timer

## 🏆 Game Rules

### 📊 **Scoring**
- **Base Score**: 1000 points per letter found without hints
- **Hint Penalty**: Letters revealed by hints give 0 points
- **Found! Bonus**: +2000 points for using the confidence feature
- **Wrong Answer**: 0 points

### ⏰ **Timer Rules**
- Each player has **4 minutes total** for entire game
- Individual timers **pause** when pressing "Found!"
- General timer **pauses** for everyone during answer phase
- **30 seconds** to submit after pressing "Found!"
- Timers **resume** when moving to next question

### 🎮 **Round Progression**
- **Rounds 1-2**: 4-letter words
- **Rounds 3-4**: 5-letter words
- **Rounds 5-6**: 6+ letter words (increasing difficulty)
- **All players** must answer before proceeding

## 🛠️ Technical Details

### 📁 **File Structure**
```
word-game/
├── index.html          # Main game interface
├── style.css           # Modern styling with glassmorphism
├── game.js             # Complete game logic and mechanics
└── README.md           # This documentation
```

### 🔧 **Technologies Used**
- **HTML5**: Semantic structure and audio elements
- **CSS3**: Modern styling with Grid, Flexbox, and glassmorphism effects
- **JavaScript ES6+**: Object-oriented game logic with classes
- **Font Awesome**: Icons for enhanced UI
- **Google Fonts**: Inter and Poppins typography

### 🎨 **Design Principles**
- **Glassmorphism**: Translucent elements with backdrop blur
- **Responsive Design**: Mobile-first approach with CSS Grid
- **Accessibility**: High contrast and clear visual hierarchy
- **Performance**: Optimized animations and efficient DOM updates

## 🎲 Sample Questions

### 4-Letter Words
- "Extremely angry or furious" → **RAGE**
- "A small piece of land surrounded by water" → **ISLE**

### 5-Letter Words  
- "A person who travels to unknown places" → **SCOUT**
- "A valuable yellow metal" → **GOLD**

### 6+ Letter Words
- "A secret plan to achieve something illegal" → **SCHEME**
- "The study of human behavior and mind" → **PSYCHOLOGY**

## 🎯 Strategy Tips

### 🧠 **For Players**
1. **Think before hinting**: Each hint costs you 1000 points
2. **Use "Found!" wisely**: Grants bonus but creates time pressure  
3. **Watch your timer**: Balance speed with accuracy
4. **Learn from hints**: Letter positions help with future guesses

### 🎪 **For Hosts**
1. **Add more players**: Game is more fun with 4+ participants
2. **Customize words**: Edit `wordSets` in `game.js` for themed games
3. **Adjust timing**: Modify timer values for different difficulty levels

## 🔧 Customization

### 📝 **Adding New Words**
Edit the `wordSets` object in `game.js`:
```javascript
this.wordSets = {
    4: [
        { question: "Your clue here", answer: "WORD" },
        // Add more 4-letter words
    ],
    5: [
        { question: "Your clue here", answer: "WORDS" },
        // Add more 5-letter words
    ]
    // Continue for other lengths...
};
```

### ⏰ **Adjusting Timers**
Modify these values in `game.js`:
```javascript
// Individual player timer (4 minutes = 240 seconds)
player.individualTimer = 4 * 60;

// Found! countdown timer (30 seconds)
currentPlayer.personalTimer = 30;

// Total game time (4 minutes)
this.gameTimer = 4 * 60;
```

### 🎨 **Styling Changes**
Customize colors in `style.css`:
```css
:root {
    --primary-color: #4f46e5;    /* Main theme color */
    --success-color: #10b981;    /* Success/correct color */
    --danger-color: #ef4444;     /* Error/timer color */
    /* Add your custom colors */
}
```

## 🌐 Browser Compatibility

✅ **Fully Supported**
- Chrome 70+
- Firefox 65+  
- Safari 12+
- Edge 79+

⚠️ **Limited Support**
- Internet Explorer (not recommended)

## 🚀 Future Enhancements

### 🎯 **Planned Features**
- **Real WebSocket Multiplayer**: True real-time multiplayer without simulation
- **AI Word Generation**: Dynamic word creation based on topics
- **Categories System**: Themed word sets (Animals, Science, etc.)
- **Tournament Mode**: Bracket-style competitions
- **Statistics Dashboard**: Player performance tracking
- **Voice Clues**: Audio-based hints option

### 🎪 **Potential Additions**
- **Team Mode**: Collaborative gameplay
- **Daily Challenges**: New words every day
- **Difficulty Levels**: Adjustable game complexity
- **Power-ups**: Special abilities and boosts
- **Leaderboards**: Global and friends rankings

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### 🐛 **Bug Reports**
Please include:
- Browser and version
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable

## 📜 License

This project is open source and available under the [MIT License](LICENSE).

## 🎉 Acknowledgments

- **Font Awesome** for beautiful icons
- **Google Fonts** for typography
- **CSS Glassmorphism** inspiration from modern design trends
- **Testing Community** for feedback and bug reports

---

**🎮 Ready to play? Open `index.html` and start your word quest adventure!**

*Built with ❤️ for competitive word game enthusiasts*