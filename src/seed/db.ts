import * as mongoose from 'mongoose';
import config from '../configuration/config';
import logger from '../logger/logger';

/**
 * Establishes a connection to the MongoDB database.
 * Utilizes the URI provided in the configuration file.
 * Logs the success or failure of the connection attempt.
 */
export const connectToDatabase = async (): Promise<void> => {
	try {
		// Attempt to connect to the MongoDB database
		await mongoose.connect(config.uri);
		logger.debug('Connected to MongoDB');
	} catch (error) {
		// Log the error if connection fails and terminate the process
		console.error('Error connecting to MongoDB:', error);
		process.exit(1); // Exit the process with failure
	}
};

/**
 * Safely disconnects from the MongoDB database.
 * Logs the success or failure of the disconnection attempt.
 */
export const disconnectDatabase = async (): Promise<void> => {
	try {
		// Attempt to disconnect from the MongoDB database
		await mongoose.disconnect();
		logger.debug('Database disconnected');
	} catch (error) {
		// Log the error if disconnection fails
		console.error('Error disconnecting from MongoDB:', error);
	}
};
