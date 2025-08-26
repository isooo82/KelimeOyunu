# 🚀 Word Quest - Online Multiplayer Deployment Guide

This guide will help you deploy Word Quest online so you and your friends can play together from anywhere!

## 🎯 Quick Start (Local Testing)

### 1. Install Node.js
- Download and install Node.js from [nodejs.org](https://nodejs.org/)
- Make sure you have Node.js 14+ installed

### 2. Install Dependencies
```bash
cd word-game
npm install
```

### 3. Start the Server
```bash
npm start
```

### 4. Play the Game
- Open your browser and go to: `http://localhost:3000`
- Share this URL with friends on your local network: `http://YOUR_IP:3000`

## 🌐 Deploy Online (Free Options)

### Option 1: Heroku (Easiest)

1. **Create a Heroku account** at [heroku.com](https://heroku.com)

2. **Install Heroku CLI** from [devcenter.heroku.com](https://devcenter.heroku.com/articles/heroku-cli)

3. **Deploy to Heroku:**
```bash
# Login to Heroku
heroku login

# Create a new app (replace 'your-word-quest' with your preferred name)
heroku create your-word-quest

# Deploy the code
git add .
git commit -m "Deploy Word Quest multiplayer game"
git push heroku main

# Open your game
heroku open
```

Your game will be available at: `https://your-word-quest.herokuapp.com`

### Option 2: Railway (Fast & Easy)

1. **Go to [railway.app](https://railway.app)**
2. **Sign in with GitHub**
3. **Click "New Project" → "Deploy from GitHub repo"**
4. **Select your word-game repository**
5. **Railway will automatically deploy your game!**

### Option 3: Render (Free Tier)

1. **Go to [render.com](https://render.com)**
2. **Sign in with GitHub**
3. **Click "New" → "Web Service"**
4. **Connect your GitHub repository**
5. **Set these settings:**
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
6. **Click "Create Web Service"**

### Option 4: Glitch (Browser-Based)

1. **Go to [glitch.com](https://glitch.com)**
2. **Click "New Project" → "Import from GitHub"**
3. **Paste your repository URL**
4. **Glitch will automatically set up and run your game!**

## 🔧 Configuration

### Environment Variables

For production deployment, you can set these environment variables:

```bash
PORT=3000                    # Port number (auto-set by most platforms)
NODE_ENV=production         # Environment mode
```

### Custom Domain (Optional)

Most platforms allow you to set up a custom domain:
- **Heroku:** Settings → Domains → Add Domain
- **Railway:** Settings → Domains → Custom Domain
- **Render:** Settings → Custom Domains

## 🎮 How to Play Online

### For the Host:
1. **Deploy the game** using any method above
2. **Share the URL** with your friends
3. **Create a room** and share the room code
4. **Start the game** when everyone joins

### For Players:
1. **Open the shared URL** in your browser
2. **Enter your name** and the **room code**
3. **Wait for the host** to start the game
4. **Enjoy playing together!**

## 🛠️ Troubleshooting

### Common Issues:

**"Application Error" on Heroku:**
- Check logs: `heroku logs --tail`
- Make sure all dependencies are in `package.json`

**Connection Issues:**
- Check if the server is running: Visit the URL in browser
- Make sure WebSocket connections are allowed
- Try refreshing the page

**Game Not Syncing:**
- Check browser console for errors (F12)
- Make sure all players are on the same URL
- Refresh the page if connection is lost

### Performance Tips:

- **Limit to 6-8 players** for best performance
- **Use modern browsers** (Chrome, Firefox, Safari, Edge)
- **Stable internet connection** recommended

## 📱 Mobile Support

The game works great on mobile devices:
- **Responsive design** adapts to all screen sizes
- **Touch-friendly** buttons and inputs
- **Portrait and landscape** modes supported

## 🔒 Security Notes

- Room codes are randomly generated and expire when empty
- No personal data is stored on the server
- All communication is real-time and temporary

## 🎯 Scaling for Large Groups

For bigger events or tournaments:

1. **Upgrade to paid hosting** for better performance
2. **Consider using a CDN** for faster loading
3. **Monitor server resources** during peak usage
4. **Set up multiple game servers** if needed

## 🚀 Advanced Deployment

### Docker Deployment

```dockerfile
FROM node:16
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### Custom Server Setup

For your own server:

```bash
# Install PM2 for process management
npm install -g pm2

# Start the game with PM2
pm2 start server.js --name "word-quest"

# Set up auto-restart on reboot
pm2 startup
pm2 save
```

## 📊 Monitoring

Track your game's usage:
- **Heroku:** Use Heroku Dashboard
- **Railway:** Built-in analytics
- **Render:** Service metrics
- **Custom:** Use PM2 monitoring

---

## 🎉 You're Ready to Play!

Once deployed, your Word Quest game will be available 24/7 for you and your friends to enjoy. Share the URL and have fun competing in real-time word battles!

**Need help?** Check the troubleshooting section or create an issue in the GitHub repository.

**Happy Gaming!** 🎮✨
