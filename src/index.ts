import express from 'express'; // Import the express framework
import {connectDb} from './db/connectDb'; // Function to connect to the database
import logger from './logger/logger'; // Logger utility for logging messages
import config from './configuration/config'; // Configuration values (e.g., port number)
import dotenv from 'dotenv'; // Library to load environment variables from a .env file
import {configureGracefulShutdown} from './db/shoutdownDb'; // Function to handle graceful shutdown of the database connections
import {createServer} from 'http'; // HTTP server creation
import {setupRoutes} from './api/globalRotues'; // Function to set up API routes
import {startCronJob} from './utils/cronJob'; // Function to start cron jobs for periodic tasks
import {setupMiddlewares} from './middlewares/setupMiddlewares'; // Function to configure middleware (e.g., body parsers, CORS)
import {startExcelWatcher} from './doc/excelWatcher'; // Function to watch for changes in an Excel file
dotenv.config(); // Load environment variables from .env file into process.env

// Function to start the server
export async function startServer(): Promise<void> {
	try {
		console.log('this is a test');

		const app = express(); // Create an Express application instance
		setupMiddlewares(app); // Set up middlewares such as body parsers, CORS, etc.
		setupRoutes(app); // Set up API routes to handle requests
		// Perform necessary asynchronous tasks (connect to DB, start cron jobs, watch Excel file)
		await Promise.all([connectDb(), startCronJob(), startExcelWatcher()]);

		// Create an HTTP server using the Express app
		const server = createServer(app);

		// Start the server and listen on the configured port
		server.listen(config.port, async () => {
			// Log the server is running successfully
			logger.info(`Server is running on http://localhost:${config.port}`);
		});

		// Set up graceful shutdown to ensure connections and tasks are properly closed
		configureGracefulShutdown(server);
	} catch (error) {
		// If an error occurs, log the error and terminate the process
		logger.error('Error starting the server:', error);
		process.exit(1); // Exit with a failure status code
	}
}

startServer();
