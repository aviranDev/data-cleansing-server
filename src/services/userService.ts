import {Model} from 'mongoose';
// import BaseError from '../errors/BaseError'
// import { UnauthorizedError } from '../errors/UnauthorizedError'
import {IUser} from '../types/userInterface';
import ConflictError from '../errors/ConflictError';
// import { BadRequestError } from '../errors/BadRequestError'
import config from '../configuration/config';
import BaseError from '../errors/BaseError';
import {generateSalt, hashPassword} from '../utils/passwordUtils';

export class UserService {
	// Mongoose model to handle the user data in MongoDB
	private model: Model<IUser>;

	/**
	 * Constructor to initialize the user model.
	 * @param userModel - The Mongoose model representing the user collection.
	 */
	constructor(userModel: Model<IUser>) {
		// Assign the Mongoose user model to the class property
		this.model = userModel;
	}

	/**
	 * Registers a new user in the system.
	 * @param user - The user object containing username, password, and other details.
	 * @returns The newly created user object after saving it to the database.
	 * @throws ConflictError if the username is already taken.
	 */
	register = async (user: IUser): Promise<IUser> => {
		// eslint-disable-next-line no-useless-catch
		try {
			const userExist = await this.model.findOne({username: user?.username});
			if (userExist) {
				throw new ConflictError('Username taken');
			}

			// Generate a salt for password hashing.
			const salt = generateSalt(config.salt);

			// Hash the user's password with the generated salt.
			const hashedPassword = await hashPassword(user.password, salt);

			// Create a new user instance with the hashed password.
			const newUser = new this.model({...user, password: hashedPassword});

			// Save the new user to the database.
			await newUser.save();
			return newUser; // Return the saved user.
		} catch (error) {
			throw error; // Rethrow any errors encountered.
		}
	};

	/**
	 * Retrieves the profile of a user by their ID, excluding sensitive fields.
	 * @param id - The ID of the user whose profile is being requested.
	 * @returns The user's profile object without sensitive fields.
	 * @throws BaseError if the user is not found in the database.
	 */
	async userProfile(id: string): Promise<IUser> {
		try {
			// Find the user by ID and exclude sensitive fields like password, resetPassword, and accountLocked.
			const userProfile = await this.model
				.findById(id)
				.select([
					'-password',
					'-resetPassword',
					'-accountLocked',
					'-createdAt',
					'-lastFailedLoginDate',
				]);

			// If the user is not found, log an error and throw an exception
			if (!userProfile) {
				throw new BaseError(`User with ID ${id} not found`);
			}

			// Return the user's profile excluding sensitive information
			return userProfile;
		} catch (error) {
			// If any error occurs during the retrieval process, rethrow it
			throw error;
		}
	}
}

export default UserService;
