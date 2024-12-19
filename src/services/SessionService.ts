import {IUser} from './../types/userInterface';
import {Model} from 'mongoose';
import jwt, {sign} from 'jsonwebtoken';
import BaseError from '../errors/BaseError';
import {ISession} from '../types/sessionInterface';
import config from '../configuration/config';
import ForbiddenError from '../errors/ForbiddenError';

export interface TokenPayload {
	_id: string;
	username: string;
	resetPassword: boolean;
	role: string;
}
// Destructure configuration variables for token secrets and expiration times.
const {
	accessTokenSecret,
	refreshTokenSecret,
	accessTokenExpire,
	refreshTokenExpire,
} = config;

export class SessionService {
	// Store secrets and expiration times for token management.
	public accessTokenSecret = accessTokenSecret;
	public refreshTokenSecret = refreshTokenSecret;
	public accessTokenExpire = accessTokenExpire;
	public refreshTokenExpire = refreshTokenExpire;

	// Model for session management in the database.
	private model: Model<ISession>;

	/**
	 * SessionService constructor.
	 * @param sessionModel - The Mongoose model used for storing and retrieving session information.
	 */
	constructor(sessionModel: Model<ISession>) {
		this.model = sessionModel;
	}

	/**
	 * Generates the payload for JWT tokens by extracting relevant user information.
	 * @param user - The user object containing user details like ID, username, and role.
	 * @returns The token payload with essential user data.
	 * @throws BaseError if the user object is missing.
	 */
	private generateUserPayload(user: IUser): TokenPayload {
		// If the user object is not provided, throw an InternalError
		if (!user) {
			// Throw an error if the user object is missing.
			throw new BaseError('User object is required.');
		}

		// Create a token payload with essential user data.
		const payload: TokenPayload = {
			_id: user._id, // The user's unique identifier
			username: user.username, // The user's username
			resetPassword: user.resetPassword, // Indicates if the user needs to reset their password.
			role: user.role, // The user's role (e.g., admin, user).
		};

		return payload; // Return the constructed token payload.
	}

	/**
	 * Generates an access token using the user's information.
	 * @param user - The user object containing user details.
	 * @returns The generated access token.
	 */
	public generateAccessToken(user: IUser): string {
		// Create a payload with essential user information for the access token
		const payload = this.generateUserPayload(user);

		// Sign the payload using the access token secret and set its expiration time
		const accessToken = sign(payload, this.accessTokenSecret, {
			expiresIn: this.accessTokenExpire,
		});

		// Return the generated access token
		return accessToken;
	}

	/**
	 * Generates a refresh token for the user.
	 * @param user - The user object containing user details.
	 * @returns The generated refresh token.
	 */
	public generateRefreshToken(user: IUser): string {
		// Create a payload with essential user information for the refresh token
		const payload = this.generateUserPayload(user);

		// Sign the payload using the refresh token secret and set its expiration time
		const refreshToken = sign(payload, this.refreshTokenSecret, {
			expiresIn: this.refreshTokenExpire,
		});

		// Return the generated refresh token
		return refreshToken;
	}

	/**
	 * Verifies a given refresh token and retrieves the corresponding user information.
	 * @param refreshToken - The refresh token to verify.
	 * @returns The decoded user object from the refresh token.
	 * @throws ForbiddenError if the token is invalid or not found in the database.
	 */
	public async verifyRefreshToken(refreshToken: string): Promise<IUser> {
		try {
			// Check if the refresh token exists in the database.
			const storedToken = await this.model.findOne({refreshToken});

			// Check if the token doesn't exist in the database
			if (!storedToken) {
				throw new BaseError(`Token not found in the database.`);
			}

			// Verify the refresh token and return the decoded user information
			const decoded = jwt.verify(
				refreshToken,
				this.refreshTokenSecret
			) as IUser;

			// Return the decoded user information, which includes the user's ID
			return decoded;
		} catch (error) {
			if (error instanceof jwt.JsonWebTokenError) {
				// Throw a forbidden error if the token verification fails.
				throw new ForbiddenError('Invalid token: ' + error.message);
			} else {
				throw error; // Rethrow any other errors.
			}
		}
	}

	/**
	 * Verifies an access token extracted from the authorization header.
	 * @param authHeader - The authorization header containing the access token.
	 * @returns The decoded user information from the token.
	 */
	public verifyAccessToken(authHeader: string): IUser {
		// Extract the token from the authorization header
		const token = authHeader.split(' ')[1];

		// Verify the access token and extract the user payload
		const payload = jwt.verify(token, accessTokenSecret) as IUser;

		// Return the extracted user payload from the access token
		return payload;
	}

	/**
	 * Removes a refresh token from the database, effectively logging the user out.
	 * @param cookie - The refresh token to remove from the database.
	 * @throws BaseError if the refresh token is not found in the database.
	 */
	public async removeRefreshToken(cookie: string): Promise<void> {
		try {
			// Attempt to find and remove the corresponding refresh token using the provided cookie
			const refreshToken = await this.model.findOneAndDelete({
				refreshToken: cookie,
			});

			// Check if the refreshToken is null, indicating that it was not found in the database
			if (refreshToken === null) {
				// If not found, throw an InternalError to indicate the issue
				throw new BaseError('Refresh token not found in the database.');
			}
		} catch (error) {
			throw error; // Rethrow any caught errors.
		}
	}

	/**
	 * Stores a new refresh token in the database, along with the user's last login timestamp.
	 * @param refreshToken - The refresh token to store.
	 * @param userId - The user's unique identifier.
	 * @throws BaseError if the operation to store the token fails.
	 */
	public async storeRefreshTokenInDb(
		refreshToken: string,
		userId: string
	): Promise<void> {
		try {
			// Get the current lastLogin timestamp
			const lastLogin = new Date();

			// Find and update the refresh token in the database
			const userToken = await this.model.findOneAndUpdate(
				{userId},
				{refreshToken, lastLogin},
				{new: true, upsert: true, runValidators: true}
			);

			// If the token is null, it means the operation failed; throw an InternalError
			if (userToken === null) {
				throw new BaseError(`Store Token In Db Failed: ${userToken}.`);
			}
		} catch (error) {
			throw error; // Rethrow any caught errors.
		}
	}

	/**
	 * Removes expired sessions based on the provided expiration date.
	 * @param expirationDate - The date to compare against for removing old sessions.
	 */
	public async removeExpiredSessions(expirationDate: Date): Promise<void> {
		// Delete sessions with lastLogin timestamp less than or equal to the expiration date.
		await this.model.deleteMany({lastLogin: {$lte: expirationDate}});
	}
}

export default SessionService;
