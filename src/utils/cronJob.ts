import {CronJob} from 'cron';
import axios from 'axios';
import logger from '../logger/logger';
import config from '../configuration/config';

const {port} = config;
/**
 * Make an HTTP request to the specified Express route.
 */
const performCronTask = async (): Promise<void> => {
	const url = `http://localhost:${port}/api/crons/cron-job`;
	try {
		await axios.get(url);
		logger.debug(
			`Cron job ran successfully at: ${new Date().toLocaleString()}`
		);
	} catch (error) {
		logger.error(
			`Error in Cron job at: ${new Date().toLocaleString()} - Error: ${error}`
		);
	}
};

/**
 * Starts a cron job to perform a specific task at scheduled intervals.
 * The cron job runs every hour, making an HTTP request to an Express route.
 * After execution, it logs a debug message with the timestamp.
 * Note: This is intended for local development using a server running on http://localhost:port.
 */
export const startCronJob = async (): Promise<void> => {
	new CronJob(
		'0 * * * *', // Cron schedule: Runs every hour
		performCronTask,
		null, // Callback function parameter (null as it's not needed)
		true, // Start the cron job immediately upon instantiation
		Intl.DateTimeFormat().resolvedOptions().timeZone // Time zone for the cron job
	);
};

export default startCronJob;
