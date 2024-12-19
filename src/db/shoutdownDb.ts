import {Server} from 'http';
import logger from '../logger/logger';
import {disconnectDb} from './connectDb';

export function configureGracefulShutdown(server: Server): void {
	// Flag to ensure that shutdown is only triggered once
	let isShuttingDown = false;

	const shutdown = async () => {
		if (isShuttingDown) return; // Prevent multiple shutdown attempts
		isShuttingDown = true;

		logger.info('Received SIGINT (Ctrl+C). Initiating graceful shutdown...');

		try {
			// Stop accepting new connections
			server.close((err) => {
				if (err) {
					logger.error('Error closing the server:', err);
					process.exit(1);
				} else {
					logger.info('Server closed successfully.');
				}
			});

			// Clean up database connections
			await disconnectDb();

			logger.info('Resources cleaned up successfully.');
			process.exit(0); // Exit with success
		} catch (error) {
			logger.error('Error during shutdown:', error);
			process.exit(1); // Exit with failure
		}
	};

	// Handle SIGINT (Ctrl+C) signal
	process.on('SIGINT', shutdown);

	// Optionally handle other signals like SIGTERM and SIGHUP for completeness
	process.on('SIGTERM', shutdown);
	process.on('SIGHUP', shutdown);

	// Handle unexpected exceptions
	process.on('uncaughtException', (error) => {
		logger.error('Uncaught Exception:', error);
		process.exit(1);
	});

	process.on('unhandledRejection', (reason, promise) => {
		logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
		process.exit(1);
	});
}
