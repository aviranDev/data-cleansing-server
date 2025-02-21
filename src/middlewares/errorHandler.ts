import {Request, Response, NextFunction} from 'express';
import BaseError from '../errors/BaseError';
import logger from '../logger/logger';

// Error handling middleware
const errorHandler = (
	err: BaseError,
	req: Request,
	res: Response,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	_next: NextFunction // Required by Express for error handling
): void => {
	const statusCode = err instanceof BaseError ? err.statusCode : 500;
	const name = err instanceof BaseError ? err.name : 'undentified error';

	const message =
		err instanceof BaseError ? err.message : 'An unknown error occurred';

	// Log error using Winston (clean stack trace)
	logger.error(`Error: ${message}`, {
		url: req.originalUrl,
		method: req.method,
		statusCode,
		stack: err.stack, // The stack trace will be formatted neatly by Winston
	});

	// Send error response to client
	res.status(statusCode).send({
		status: 'error',
		name,
		statusCode,
		message,
		stack: process.env.NODE_ENV === 'production' ? undefined : err.stack, // Stack trace hidden in production
	});
};

export default errorHandler;
