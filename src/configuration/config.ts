import dotenv from 'dotenv';
import logger from '../logger/logger';

// Load environment variables from the .env file
dotenv.config();

// Default values for the environment in case specific variables are not provided
const defaults = {
	dbUri: 'mongodb://127.0.0.1:27017/data-cleansing', // Default URI for MongoDB in development
	jwtSecret: 'default_jwt_secret', // Default JWT secret for token signing
	accessTokenSecret: 'default_access_token_secret', // Default secret for access token
	refreshTokenSecret: 'default_refresh_token_secret', // Default secret for refresh token
	serverPort: 8080, // Default server port
	accessTokenExpire: '1m', // Default expiration for access tokens
	refreshTokenExpire: '5m', // Default expiration for refresh tokens
	salt: 10, // Default salt value for password hashing
	origin: 'http://localhost:5173',
};

// Function to ensure required environment variables are set.
// If a required variable is missing, it logs a warning or error and may exit the process if critical.
const ensureEnvVars = (): void => {
	// Map containing the required environment variables and their corresponding default values
	const requiredEnvVars = new Map<string, string>([
		['JWT_SECRET', defaults.jwtSecret], // JWT secret, fallback to default if missing
		['ACCESS_TOKEN_SECRET', defaults.accessTokenSecret], // Access token secret
		['REFRESH_TOKEN_SECRET', defaults.refreshTokenSecret], // Refresh token secret
		['ACCESS_TOKEN_EXPIRE', defaults.accessTokenExpire], // Refresh token secret
		['REFRESH_TOKEN_EXPIRE', defaults.refreshTokenExpire], // Refresh token secret
		['ORIGIN', defaults.origin], // Refresh token secret
	]);

	// Iterate over each required environment variable in the Map
	requiredEnvVars.forEach((defaultValue, key) => {
		// Check if the environment variable is not defined
		if (!process.env[key]) {
			if (defaultValue) {
				// If a default value is present, log a warning and use the default value
				logger.warn(
					`Missing required environment variable: ${key}. Using default value: ${defaultValue}`
				);
			} else {
				// If no default value is present, log an error and terminate the server
				logger.error(
					`Critical environment variable missing: ${key}. Server shutting down.`
				);
				process.exit(1); // Exit the process with status code 1 (failure)
			}
		}
	});
};

// Run the environment check at the start of the application
ensureEnvVars();

// Define the configuration object based on environment variables and defaults
const config = {
	// Determine the environment (development or production) from NODE_ENV, default to 'development'
	env: process.env.NODE_ENV || 'development',

	// Use the server port from environment variables or fallback to default port
	port: process.env.SERVER_PORT || 8080,

	origin: process.env.ORIGIN || defaults.origin,

	// Salt value for password hashing, fallback to default salt if not provided
	salt: Number(process.env.SALT) || defaults.salt,

	// MongoDB URI, selects the appropriate URI based on the environment
	uri: process.env.DB_URI || defaults.dbUri,

	// JWT secret, use environment variable or fallback to default if missing
	jwtSecret: process.env.JWT_SECRET || defaults.jwtSecret,

	// Access token secret, fallback to default if not set
	accessTokenSecret:
		process.env.ACCESS_TOKEN_SECRET || defaults.accessTokenSecret,

	// Refresh token secret, fallback to default if not set
	refreshTokenSecret:
		process.env.REFRESH_TOKEN_SECRET || defaults.refreshTokenSecret,

	// Token expiration durations (both access and refresh tokens), with default fallbacks
	accessTokenExpire:
		process.env.ACCESS_TOKEN_EXPIRE || defaults.accessTokenExpire,
	refreshTokenExpire:
		process.env.REFRESH_TOKEN_EXPIRE || defaults.refreshTokenExpire,
};

// Export the configuration object to be used throughout the application
export default config;
