const mineflayer = require('mineflayer');
const express = require('express');
const socketIO = require('socket.io');

// Set up Express server
const app = express();
const server = app.listen(8080, () => {
  console.log('Web server running on http://localhost:8080');
});

// Serve static files (e.g., CSS, JS) from the "public" folder
app.use(express.static('public'));

// Set up WebSocket server for real-time communication
const io = socketIO(server);

// Serve the HTML page on the root
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Initialize the bot
const bot = mineflayer.createBot({
  host: 'test.wadmc.site', // Minecraft server address (localhost for local testing)
  port: 25565, // Default port for Minecraft
  username: 'Bot',
});

// Track progress of mining
let minedCount = 0;

// Function to mine stone
function mineStone() {
  const targetBlock = bot.findBlock({
    matching: 1, // Stone block ID
    maxDistance: 64,
  });

  if (targetBlock) {
    bot.dig(targetBlock, () => {
      minedCount++;
      console.log(`Mined stone! Total: ${minedCount}`);
      io.emit('update', { minedCount }); // Send progress to the client
      mineStone(); // Keep mining after finishing current block
    });
  } else {
    console.log('No stone found!');
  }
}

// When the bot is spawned and ready, start mining
bot.once('spawn', () => {
  console.log('Bot spawned!');
  mineStone(); // Start mining stone
});

// WebSocket connection handler
io.on('connection', (socket) => {
  console.log('New client connected');
  socket.emit('update', { minedCount }); // Send initial progress to the client
});
