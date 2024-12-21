// middlewares/setupMiddlewares.ts
import {Application} from 'express';
import corsConfig from './corsMiddleware'; // Adjust path as needed
import morganMiddleware from '../logger/morgan';
import cookieParser from 'cookie-parser';
import express from 'express';
import logger from '../logger/logger';

export function setupMiddlewares(app: Application): void {
	app.use(corsConfig); // Use the external CORS configuration
	app.use(morganMiddleware);
	app.use(express.json());
	app.use(cookieParser());
	logger.info('Middlewares configured successfully.');
}
