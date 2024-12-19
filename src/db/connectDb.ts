import mongoose from 'mongoose';
import logger from '../logger/logger';
import config from '../configuration/config';

// Function to connect to MongoDB
export async function connectDb(): Promise<void> {
	const mongoURI = config.uri;

	if (!mongoURI) {
		logger.error('MONGO_URI environment variable is not defined.');
		process.exit(1); // Exiting since the URI is critical
	}

	try {
		// Attempt to connect to the MongoDB database
		await mongoose.connect(mongoURI);

		// Log a success message upon successful connection
		logger.info('Connected To MongoDB Locally.');
	} catch (error) {
		// Handle any errors that occur during the connection process
		throw error;
	}
}

/**
 * @description Closes the connection to the MongoDB database.
 * @returns {Promise<void>} A promise that resolves when the connection is closed.
 */
export async function disconnectDb(): Promise<void> {
	try {
		// Attempt to close the MongoDB database connection
		await mongoose.connection.close();

		// Log a success message upon successful closure
		logger.info('MongoDB connection closed.');
	} catch (error) {
		// Handle any errors that occur during the closure process
		logger.error(`Error closing MongoDB connection: ${error}`);
		throw error;
	}
}
