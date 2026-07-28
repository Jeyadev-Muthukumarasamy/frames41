import { createServer } from 'http';
import { createApp } from './app.js';
import { env } from './config/env.js';
import { logger } from './infrastructure/logger/pino.logger.js';
import { connectDatabase, disconnectDatabase } from './infrastructure/database/prisma.client.js';
import { setupUncaughtExceptionHandlers } from './middleware/error.middleware.js';

/**
 * Server startup
 */
async function startServer(): Promise<void> {
  // Setup uncaught exception handlers
  setupUncaughtExceptionHandlers();

  try {
    // Connect to database
    await connectDatabase();

    // Create app
    const app = createApp();
    const server = createServer(app);

    // Graceful shutdown handling
    const gracefulShutdown = async (signal: string): Promise<void> => {
      logger.info({ signal }, 'Received shutdown signal, starting graceful shutdown...');

      // Stop accepting new connections
      server.close(async () => {
        logger.info('HTTP server closed');

        try {
          // Close database connection
          await disconnectDatabase();
          logger.info('Database connections closed');

          // Exit gracefully
          process.exit(0);
        } catch (error) {
          logger.error({ error }, 'Error during shutdown');
          process.exit(1);
        }
      });

      // Force shutdown after 30 seconds
      setTimeout(() => {
        logger.error('Forced shutdown due to timeout');
        process.exit(1);
      }, 30000);
    };

    // Listen for shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Start server
    const port = env.PORT;
    server.listen(port, () => {
      logger.info(
        { port, env: env.NODE_ENV },
        'Server started successfully',
      );
    });
  } catch (error) {
    logger.fatal({ error }, 'Failed to start server');
    process.exit(1);
  }
}

// Start the server
startServer();
