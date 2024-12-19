import logger from '../logger/logger';
import { connectToDatabase, disconnectDatabase } from './db';

/**
 * Orchestrates the database seeding process by establishing a connection,
 * running the data population function, and ensuring disconnection.
 *
 * @param populateData - A function responsible for populating the database
 * with data. This is typically model-specific and handles insertion logic.
 */
export const runSeedingProcess = async (populateData: () => Promise<void>): Promise<void> => {
  try {
    // Step 1: Connect to the database
    await connectToDatabase(); // Ensure database connection
    logger.debug('Database connection established for seeding');

    // Step 2: Execute the provided data population function
    await populateData(); // Seed the user data
  } catch (err) {
    // Log any errors encountered during the seeding process
    console.error('Error during data seeding: ', err);
  } finally {
    // Step 3: Ensure the database connection is closed after seeding
    await disconnectDatabase(); // Disconnect from the database after seeding
  }
};

export default runSeedingProcess;
