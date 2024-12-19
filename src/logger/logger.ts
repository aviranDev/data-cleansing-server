import {createLogger, format, transports} from 'winston';
import path from 'path';

const MAX_STACK_DEPTH = 5; // Limit stack depth to focus on key parts
const INTERNAL_PATHS = ['node_modules', 'express']; // Filter out internal paths

const logger = createLogger({
	level: 'debug',
	format: format.combine(
		format.timestamp(),
		format.printf(({level, message, timestamp, stack, ...meta}) => {
			const metaInfo = Object.keys(meta).length
				? JSON.stringify(meta, null, 2)
				: '';

			// Shorten the stack trace, filter internal paths, and limit depth
			const shortStack =
				typeof stack === 'string'
					? stack
							.split('\n')
							.filter(
								(line) =>
									!INTERNAL_PATHS.some((internalPath) =>
										line.includes(internalPath)
									)
							)
							.slice(0, MAX_STACK_DEPTH)
							.map((line) => line.replace(path.dirname(__dirname), ''))
							.join('\n')
					: '';

			return `${timestamp} [${level.toUpperCase()}]: ${message}${
				metaInfo ? `\nMeta: ${metaInfo}` : ''
			}${shortStack ? `\nStack trace:\n${shortStack}` : ''}`;
		})
	),
	transports: [
		// Logs errors to 'error.log' (only 'error' level)
		new transports.File({
			filename: 'logs/error.log',
			level: 'error', // Only log 'error' level messages here
		}),

		// Logs everything (debug, info, warn, error) to 'combined.log'
		new transports.File({
			filename: 'logs/combined.log', // All levels go into combined log
		}),

		// Log everything to the console (you can control the level here if needed)
		new transports.Console({
			format: format.combine(
				format.colorize(), // Add colorization based on the log level
				format.printf(({level, message, timestamp}) => {
					return `${timestamp} [${level}]: ${message}`;
				})
			),
		}),
	],
});

// Usage examples for various log levels
// logger.debug('This is a debug message')
// logger.info('This is an info message')
// logger.warn('This is a warning')
// logger.error('This is an error message')

export default logger;
