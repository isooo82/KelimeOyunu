@echo off
echo 🎮 Starting Word Quest Multiplayer Server...
echo.
echo Installing dependencies...
call npm install
echo.
echo Starting server...
echo 🌐 Game will be available at: http://localhost:3000
echo 📱 Share with friends on your network: http://YOUR_IP:3000
echo.
echo Press Ctrl+C to stop the server
echo.
call npm start
