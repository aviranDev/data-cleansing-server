import {Request, Response, NextFunction} from 'express';
import logger from '../logger/logger';
import {IUser, IUserService} from '../types/userInterface';

export class UserController {
	// Declare an instance of IUserService to handle user-related operations.
	private service: IUserService;

	// Constructor to initialize the UserController with an instance of IUserService.
	constructor(service: IUserService) {
		this.service = service;
	}

	/**
	 * Controller method to handle user registration.
	 * This method takes the user data from the request body and attempts to create a new user.
	 * @param request - The Express Request object, containing user data in the body.
	 * @param response - The Express Response object used to send back the created user.
	 * @param next - The NextFunction to pass control to the next middleware in case of errors.
	 */
	register = async (
		request: Request,
		response: Response,
		next: NextFunction
	): Promise<void> => {
		try {
			// Extract the user data from the request body.
			const user: IUser = request.body;

			// Call the register method of the service to create a new user.
			const newUser = await this.service.register(user);

			// Respond with the newly created user data and a success message.
			response.status(201).json({newUser, message: 'User Added Successfully.'});
		} catch (error) {
			// Forward any errors to the next middleware for centralized error handling.
			next(error);
		} finally {
			// Log the completion of the registration operation.
			logger.debug('Registration operation Completed.');
		}
	};

	/**
	 * Controller method to handle fetching the user's profile.
	 * This method retrieves the authenticated user's profile based on the user ID.
	 * @param request - The Express Request object, with the authenticated user ID attached.
	 * @param response - The Express Response object used to send the user's profile back to the client.
	 * @param next - The NextFunction to pass control to the next middleware in case of errors.
	 */
	userProfile = async (
		request: Request,
		response: Response,
		next: NextFunction
	): Promise<void> => {
		try {
			// Retrieve the user ID from the request object, which is populated after authentication.
			const userId = (request as Request & {user: {_id: string}}).user._id;

			// Call the userProfile method of the service to fetch the user's profile data.
			const user = await this.service.userProfile(userId);

			// Respond with the user's profile data in JSON format.
			response.status(200).send(user);
		} catch (error) {
			// Forward any errors to the next middleware for centralized error handling.
			next(error);
		} finally {
			// Log that the user profile retrieval operation has completed.
			logger.debug('User display profile operation completed.');
		}
	};
}

export default UserController;
