import {Model} from 'mongoose';
import {IUser} from '../types/userInterface';
// import { IAuthService } from '../types/authInterface'
import {ISessionService} from '../types/sessionInterface';
import UnauthorizedError from '../errors/UnauthorizedError';
import TooManyRequestsError from '../errors/TooManyRequestsError';
import bcryptjs from 'bcryptjs';
import BaseError from '../errors/BaseError';
import {generateSalt, hashPassword} from '../utils/passwordUtils';
import config from '../configuration/config';

// Define the maximum number of login attempts allowed before locking the account.
const MAX_LOGIN_ATTEMPTS = 5;
// const LOCK_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Define the account lock duration for excessive login attempts (1 minute here).
const LOCK_DURATION_MS = 1 * 60 * 1000; // 1 minute in milliseconds

export class AuthService {
	// Declare the model and tokenService as private properties.
	private model: Model<IUser>;
	private tokenService: ISessionService;
	readonly lockDuration: number;
	readonly maxLoginAttempts: number;

	/**
	 * AuthService constructor.
	 * @param userModel - The Mongoose model for user operations.
	 * @param tokenService - The token service used to manage JWT tokens.
	 * @param lockDuration - The duration (in ms) for locking a user's account (default is 2 minutes).
	 * @param maxLoginAttempts - Maximum allowed login attempts before locking the account (default is 5).
	 */
	constructor(
		userModel: Model<IUser>,
		tokenService: ISessionService,
		lockDuration = 2 * 60 * 1000,
		maxLoginAttempts: number = 5
	) {
		this.model = userModel;
		this.tokenService = tokenService;
		this.lockDuration = lockDuration;
		this.maxLoginAttempts = maxLoginAttempts;
	}

	private async updatePassword(
		userId: string,
		password: string
	): Promise<IUser> {
		try {
			// Attempt to update the user's password and resetPassword flag
			const updatedPassword = await this.model.findByIdAndUpdate(
				userId, // The user's ID to identify the user
				{
					password: password, // Set the new password
					resetPassword: true, // Set the resetPassword flag to indicate a password reset
				},
				{new: true} // Return the updated user object after the update
			);

			// Check if the updatedPassword is null, indicating an error
			if (updatedPassword === null) {
				throw new BaseError(`Failed to retrieve member profile.`);
			}

			// Return the updated user object
			return updatedPassword;
		} catch (error) {
			// If any error occurs during the process, rethrow it
			throw error;
		}
	}

	/**
	 * Compare a plain text password with a hashed password using bcrypt.
	 * @param plainPassword - The user's plain text password.
	 * @param hashedPassword - The stored hashed password.
	 * @returns A boolean indicating whether the passwords match.
	 */
	comparePasswords = (
		plainPassword: string,
		hashedPassword: string
	): boolean => {
		const trimmedPassword = plainPassword.trim(); // Trim any extra spaces from the password.
		return bcryptjs.compareSync(trimmedPassword, hashedPassword); // Compare the passwords using bcrypt.
	};

	/**
	 * Authenticates a user by their username and password.
	 * Checks if the user exists, verifies the password, and manages account lockout.
	 * @param username - The user's username.
	 * @param password - The user's plain text password.
	 * @returns An object containing accessToken and refreshToken if authentication succeeds.
	 * @throws UnauthorizedError if authentication fails or account is locked.
	 */
	login = async (
		username: string,
		password: string
	): Promise<{accessToken: string; refreshToken: string}> => {
		try {
			// Find the user by username.
			const user = await this.model.findOne({username: username});

			// If the user doesn't exist, throw an UnauthorizedError.
			if (!user) {
				throw new UnauthorizedError('Invalid username or password.');
			}

			// Check if the account is locked due to too many login attempts.
			if (user.accountLocked && user.lastFailedLoginDate) {
				const oper = Date.now() - user.lastFailedLoginDate.getTime();
				const lockDuration = LOCK_DURATION_MS - oper; // Calculate remaining lock duration.
				// const timer = Math.ceil(lockDuration / 1000);

				if (lockDuration > 0) {
					// If the lock duration hasn't passed, throw an error indicating the account is locked.
					throw new TooManyRequestsError(`Account is locked. Try again later`);
				}

				// Reset failed login attempts and unlock the account if lock duration has passed.
				user.failedLoginAttempts = 0;
				user.accountLocked = false;
				user.lastFailedLoginDate = null;
			}

			// Check if the user has exceeded the maximum number of login attempts.
			if (user.failedLoginAttempts >= MAX_LOGIN_ATTEMPTS) {
				// Lock the account if login attempts exceed the allowed threshold.
				user.accountLocked = true;
				await user.save(); // Save changes to the database.
				throw new TooManyRequestsError('Account is locked. Try again later.');
			}

			// Compare the provided password with the stored hashed password.
			const result = this.comparePasswords(password, user.password);
			if (!result) {
				// If the password doesn't match, increase the failed login attempts and save.
				user.failedLoginAttempts += 1;
				user.lastFailedLoginDate = new Date();
				await user.save();
				throw new UnauthorizedError('Invalid username or password.');
			}

			// Reset failed login attempts on successful login.
			await user.save();

			// Generate an access token and refresh token for the user.
			const accessToken = this.tokenService.generateAccessToken(user);
			const refreshToken = this.tokenService.generateRefreshToken(user);

			// Store the refresh token in the database.
			await this.tokenService.storeRefreshTokenInDb(refreshToken, user._id);

			// Return both the generated access token and refresh token as an object.
			// The access token is used for authenticating API requests,
			// while the refresh token is used to obtain new access tokens when the current one expires.
			return {accessToken, refreshToken};
		} catch (error) {
			// Re-throw the error so it can be handled at a higher level.
			throw error;
		}
	};

	/**
	 * Refreshes an access token using the provided refresh token.
	 * @param refreshToken - The refresh token used to obtain a new access token.
	 * @returns An object with the new access token.
	 * @throws UnauthorizedError if the refresh token is invalid or missing.
	 */
	public async refreshAccessToken(
		refreshToken: string
	): Promise<{success: boolean; accessToken?: string}> {
		try {
			if (!refreshToken) {
				throw new UnauthorizedError('Cookie must be provided.');
			}

			// Verify the refresh token and retrieve user information.
			const userInformation = await this.tokenService.verifyRefreshToken(
				refreshToken
			);

			// Find the user in the database by their ID.
			const user = await this.model.findById(userInformation._id);

			if (!user) {
				throw new BaseError(`User not found in the database.`);
			}

			// Generate a new access token.
			const accessToken = this.tokenService.generateAccessToken(user);

			return {success: true, accessToken};
		} catch (error) {
			// Re-throw the error so it can be handled at a higher level.
			throw error;
		}
	}

	public async resetUserPassword(
		userId: string,
		cookie: string,
		password: string,
		confirmPassword: string
	): Promise<void> {
		try {
			// Check if the cookie is provided
			if (!cookie) {
				throw new UnauthorizedError('Cookie must be provided.');
			}

			// Find the user by user ID
			const member = await this.model.findById(userId);

			// Check if the user is found
			if (!member) {
				throw new UnauthorizedError('Member not found.');
			}

			// Check if the new password and its confirmation match
			if (password !== confirmPassword) {
				throw new UnauthorizedError('Passwords do not match.');
			}

			// Generate a salt and hash the new password
			const salt = generateSalt(config.salt);
			const userPassword = await hashPassword(password, salt);

			// Update the user's password in the database
			await this.updatePassword(userId, userPassword);

			// Remove the user's refresh token
			await this.tokenService.removeRefreshToken(cookie);
		} catch (error) {
			// If any error occurs during the process, rethrow it
			throw error;
		}
	}

	/**
	 * Logs the user out by removing the refresh token from the database.
	 * @param cookie - The refresh token to be removed.
	 * @throws UnauthorizedError if the cookie is invalid or missing.
	 */
	logout = async (cookie: string): Promise<void> => {
		try {
			if (!cookie) {
				// If no cookie is provided, throw an UnauthorizedError.
				throw new UnauthorizedError('Cookie must be provided.');
			}

			// Remove the refresh token from the database.
			await this.tokenService.removeRefreshToken(cookie);
		} catch (error) {
			// Re-throw the error so it can be handled at a higher level.
			throw error;
		}
	};
}

export default AuthService;
