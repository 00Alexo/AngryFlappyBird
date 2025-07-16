const express = require('express');
const path = require('path');

console.log('🚀 Starting Angry Flappy Bird server...');

const app = express();
const PORT = 3000;

// Serve static files from the current directory
app.use(express.static(__dirname));

// Serve the main HTML file
app.get('/', (req, res) => {
    console.log('📄 Serving index.html');
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
const server = app.listen(PORT, () => {
    console.log(`🎮 Angry Flappy Bird server running on http://localhost:${PORT}`);
    console.log(`📁 Serving files from: ${__dirname}`);
    console.log(`🚀 Open your browser and go to: http://localhost:${PORT}`);
});

server.on('error', (err) => {
    console.error('❌ Server error:', err);
});

console.log('✅ Server setup complete!');
