import User from '../models/User';
import * as bcrypt from 'bcryptjs';
import seed from '../json/users.json';
import logger from '../logger/logger';
import {runSeedingProcess} from './runSeeder';

// Seed data logic
const seedUsers = async (): Promise<void> => {
	try {
		// Step 1: Retrieve all existing user emails from the database in a single query
		const existingUsers = await User.find({}, {username: 1});
		const existingEmails = new Set(existingUsers.map((user) => user.username));

		// Step 2: Process new users: hash passwords and filter out existing users
		const newUsers = await Promise.all(
			seed.users.map(async (user) => {
				if (!existingEmails.has(user.username)) {
					const salt = bcrypt.genSaltSync(10);
					const hashedPassword = await bcrypt.hash(user.password, salt);
					return {...user, password: hashedPassword};
				}
				logger.warn(`User ${user.username} already exists, skipping.`);
				return null; // Exclude existing users
			})
		);

		// Filter out null values (existing users)
		const filteredUsers = newUsers.filter((user) => user !== null);

		// Step 3: Insert new users in a batch operation
		if (filteredUsers.length > 0) {
			await User.insertMany(filteredUsers);
			filteredUsers.forEach((user) => {
				logger.debug(`User ${user.username} added.`);
			});
		} else {
			logger.info('No new users to add.');
		}

		// Log a debug message indicating the successful import of data
		logger.debug('Data successfully imported');
	} catch (error) {
		logger.error(`Error during data seeding: ${error}`);
	}
};

runSeedingProcess(seedUsers);
