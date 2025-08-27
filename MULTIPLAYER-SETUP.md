# 🌐 Word Quest - Multiplayer Setup Guide

## 🎯 Option 1: Install Node.js (Recommended)

### Step 1: Install Node.js
1. **Download Node.js**: Go to https://nodejs.org
2. **Download LTS version** (Long Term Support - recommended)
3. **Run the installer** - accept all default settings
4. **Restart your computer** after installation

### Step 2: Start the Multiplayer Server
1. **Open Command Prompt/PowerShell** 
2. **Navigate to game folder**:
   ```
   cd C:\calculator-app\word-game
   ```
3. **Install dependencies** (first time only):
   ```
   npm install
   ```
4. **Start the server**:
   ```
   npm start
   ```
   
### Step 3: Play with Friends
1. **Server starts** on `http://localhost:3000`
2. **Share your IP** with friends:
   - Open Command Prompt
   - Type: `ipconfig`
   - Share your IPv4 address (e.g., 192.168.1.100)
   - Friends visit: `http://YOUR-IP:3000`

---

## 🚀 Option 2: Online Hosting (No Installation)

### Deploy to Railway (Free)
1. **Create account**: https://railway.app
2. **Deploy from GitHub**:
   - Upload your project to GitHub
   - Connect Railway to GitHub
   - Deploy automatically
3. **Get public URL** - share with friends worldwide!

### Deploy to Glitch (Free)
1. **Visit**: https://glitch.com
2. **Import project** from GitHub
3. **Get instant URL** for multiplayer

---

## 🎮 Option 3: Local Network Only

### Using Python (If you have Python)
```python
# Simple local server
python -m http.server 8000
```
Then use `local-multiplayer.html` for turn-based play

---

## 🔧 Troubleshooting

### If Node.js doesn't work:
- **Check Windows version** - Windows 10/11 recommended
- **Run as Administrator** when installing
- **Restart computer** after installation
- **Check PATH** - Node should be in system PATH

### If friends can't connect:
- **Check Windows Firewall** - allow Node.js
- **Router settings** - enable port forwarding (port 3000)
- **Same network** - ensure you're on same WiFi/network

---

## 🌟 Features in Multiplayer Mode

✅ **Real-time gameplay** - see other players' progress
✅ **Live chat** - communicate during game  
✅ **Room codes** - private games with friends
✅ **Spectator mode** - watch ongoing games
✅ **Leaderboards** - track high scores
✅ **Custom word sets** - add your own challenges

---

## 📱 Quick Start Commands

```bash
# Install Node.js first, then:
cd C:\calculator-app\word-game
npm install
npm start

# Share with friends:
# http://YOUR-IP-ADDRESS:3000
```

**Need help?** The setup should take 5-10 minutes maximum!
