import http from 'http';
import { createApp } from './app';
import { env } from './config/env';
import prisma from './config/database/postgresql/prisma';
import { connectMongoDB } from './config/database/mongodb/mongoose';
import { connectRedis, disconnectRedis } from './config/redis';
import { initializeSocket } from './services/socket.service';
import { initEmailQueue } from './queues/email.queue';
import { initNotificationQueue } from './queues/notification.queue';
import logger from './utils/logger';

let server: http.Server;

async function bootstrap() {
  try {
    logger.info('✅ Environment variables validated');

    // 2. Connect to PostgreSQL (Prisma)
    await prisma.$connect();
    logger.info('✅ Connected to PostgreSQL');

    // 3. Connect to MongoDB (Mongoose)
    await connectMongoDB();

    // 4. Connect to Redis (Graceful degradation if failed)
    await connectRedis();

    // 5. Initialize Express App
    const app = createApp();
    server = http.createServer(app);

    // 6. Initialize Socket.IO
    initializeSocket(server);

    // 7. Initialize BullMQ Queues
    initEmailQueue();
    initNotificationQueue();

    // 8. Start Server
    const port = env.PORT;
    server.listen(port, () => {
      logger.info(`🚀 Server running on http://localhost:${port}`);
      logger.info(`📚 Swagger docs available at http://localhost:${port}/api/docs`);
      logger.info(`✨ Environment: ${env.NODE_ENV}`);
    });
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle unhandled rejections
process.on('unhandledRejection', (err: Error) => {
  logger.error('UNHANDLED REJECTION! 💥 Shutting down...', err);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...', err);
  process.exit(1);
});

// Graceful shutdown on SIGTERM / SIGINT
const gracefulShutdown = async () => {
  logger.info('SIGTERM/SIGINT received. Shutting down gracefully...');

  if (server) {
    server.close(async () => {
      logger.info('HTTP server closed');
      try {
        await prisma.$disconnect();
        logger.info('PostgreSQL disconnected');

        await import('mongoose').then(m => m.default.connection.close(false));
        logger.info('MongoDB disconnected');

        await disconnectRedis();
        logger.info('Redis disconnected');

        process.exit(0);
      } catch (err) {
        logger.error('Error during graceful shutdown', err);
        process.exit(1);
      }
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Start the server
bootstrap();
