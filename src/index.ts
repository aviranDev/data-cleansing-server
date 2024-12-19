import express, {Application} from 'express';
import cors from 'cors';
import {connectDb} from './db/connectDb';
import morganMiddleware from './logger/morgan';
import logger from './logger/logger';
import config from './configuration/config';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import {configureGracefulShutdown} from './db/shoutdownDb';
import {createServer} from 'http';
import routes from './api/globalRotues';
import errorHandler from './middlewares/errorHandler';
import notFoundMiddleware from './middlewares/notFoundMiddleware';
import {startCronJob} from './utils/cronJob';
import {processExcelFile} from './doc/excelFile';
import path from 'path';
import chokidar from 'chokidar';
dotenv.config();

function setupMiddlewares(app: Application) {
	app.use(
		cors({
			origin: config.origin,
			credentials: true,
		})
	);
	app.use(morganMiddleware);
	app.use(express.json());
	app.use(cookieParser());
	logger.info('Middlewares configured successfully.');
}

function setupRoutes(app: Application) {
	app.use('/api', routes);
	app.use(notFoundMiddleware); // Catch-all for undefined routes
	app.use(errorHandler);
}

// Watch for changes in the Excel file
const filePath = path.join(process.cwd(), 'src/data2.xlsx');
const watcher = chokidar.watch(filePath, {persistent: true});

watcher
	.on('change', () => {
		console.log('File changed, updating database...');
		processExcelFile(filePath);
	})
	.on('error', (error) => console.error('File watching error:', error));

// Initial processing
processExcelFile(filePath);

export async function startServer(): Promise<void> {
	try {
		const app = express();
		setupMiddlewares(app);
		setupRoutes(app);
		startCronJob();

		// Create the HTTP server
		const server = createServer(app);

		// Start listening
		server.listen(config.port, async () => {
			logger.info(`Server is running on http://localhost:${config.port}`);
			// Connect to the database
			await connectDb();
		});

		// Configure graceful shutdown
		configureGracefulShutdown(server);
	} catch (error) {
		logger.error('Error starting the server:', error);
		process.exit(1);
	}
}

startServer();
