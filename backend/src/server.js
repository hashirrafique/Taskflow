require('dotenv').config();
const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');
const { initSocket } = require('./socket');

const PORT = process.env.PORT || 5000;

(async () => {
  await connectDB();

  const server = http.createServer(app);
  initSocket(server);

  server.listen(PORT, () => {
    console.log(`[server] TaskFlow API running on http://localhost:${PORT}`);
    console.log(`[server] Health:  http://localhost:${PORT}/api/health`);
    console.log(`[server] Socket:  ws://localhost:${PORT}`);
  });

  // Graceful shutdown
  const shutdown = (sig) => {
    console.log(`\n[server] ${sig} received, shutting down...`);
    server.close(() => process.exit(0));
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
})();
