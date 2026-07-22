const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { WebcastPushConnection } = require('tiktok-live-connector');

const app = express();
const server = http.createServer(app);

const io = new Server(server, { cors: { origin: "*" } });

app.use(express.static('public'));

// --- CHANGE THIS TO YOUR TIKTOK USERNAME ---
const tiktokUsername = 'got.clapped.by'; 

const tiktokLiveConnection = new WebcastPushConnection(tiktokUsername);

tiktokLiveConnection.connect().then(state => {
    console.log(`✅ Connected to live stream! Room ID: ${state.roomId}`);
}).catch(err => {
    console.error('❌ Failed to connect (Are you currently live?)', err);
});

tiktokLiveConnection.on('chat', data => {
    io.emit('chat', {
        username: data.uniqueId,
        comment: data.comment
    });
});

tiktokLiveConnection.on('gift', data => {
    if (data.giftType === 1 && !data.repeatEnd) return; 
    io.emit('gift', {
        username: data.uniqueId,
        giftName: data.giftName,
        amount: data.repeatCount
    });
});

// Render dynamically assigns the port
const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
});
