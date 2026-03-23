import { createServer } from 'http';
import app from './app';
import { config, validateEnv } from './config';
import { prisma } from './config/database';
import { initWebSocket, broadcastNotification } from './websocket';
import { setBroadcastFunction } from './controllers/notificationController';

async function startServer() {
  try {
    validateEnv();

    await prisma.$connect();
    console.log('✅ Database connected successfully');

    // Create HTTP server from Express app so WebSocket can share it
    const server = createServer(app);

    // Initialize WebSocket on the same HTTP server
    initWebSocket(server);

    // Inject broadcast function into the notification controller
    setBroadcastFunction(broadcastNotification);

    server.listen(config.port, () => {
      console.log(`
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║   🏛️  GIC Church Management Platform API                 ║
║                                                          ║
║   Server running on port ${config.port}                         ║
║   Environment: ${config.nodeEnv.padEnd(39)}║
║                                                          ║
║   API URL:      http://localhost:${config.port}/api               ║
║   Health:       http://localhost:${config.port}/health            ║
║   WebSocket:    ws://localhost:${config.port}/ws                  ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

const gracefulShutdown = async (signal: string) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);

  try {
    await prisma.$disconnect();
    console.log('Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

startServer();
