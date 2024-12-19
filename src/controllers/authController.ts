import {NextFunction, Request, Response} from 'express';
import logger from '../logger/logger';
import {IAuthService} from '../types/authInterface';

class AuthController {
	// Declare an instance of UserService as a property
	private service: IAuthService;

	// Constructor to initialize the UserService instance
	constructor(service: IAuthService) {
		this.service = service;
	}

	/**
	 * Controller method to handle user login requests.
	 * This method is responsible for authenticating the user and issuing tokens.
	 * @param req - The Express Request object containing the username and password in the request body.
	 * @param res - The Express Response object used to send the tokens back to the client.
	 * @param next - The NextFunction to pass control to the next middleware in case of errors.
	 */
	login = async (
		req: Request,
		res: Response,
		next: NextFunction
	): Promise<void> => {
		try {
			// Extract username and password from the request body.
			const {username, password} = req.body;

			// Attempt to authenticate the user and retrieve tokens.
			const {refreshToken, accessToken} = await this.service.login(
				username,
				password
			);

			// Set the refresh token as an HTTP-only cookie.
			res.cookie('jwt', refreshToken, {
				// Commented out httpOnly here for reference but should be true in production.
				// httpOnly: true,
				sameSite: 'none', // Ensure the cookie is usable in cross-site contexts.
				secure: true, // true for production, false for development
				maxAge: 7 * 24 * 60 * 60 * 1000, // Cookie will expire in 7 days.
			});

			// Send the access token to the client in the response body.
			res.status(200).send({
				message: 'User are authenticated',
				accessToken: accessToken,
			});
		} catch (error) {
			// Forward any errors to the next middleware for centralized error handling.
			next(error);
		} finally {
			// Log the successful completion of the authentication process.
			logger.info('Authentication process complete');
		}
	};

	resetPasswrod = async (
		request: Request,
		response: Response,
		next: NextFunction
	): Promise<void> => {
		try {
			// Extract user information from the request.
			const cookies = request.cookies.jwt;
			const userId = (request as Request & {user: {_id: string}}).user._id;

			const {password, confirmPassword} = request.body;

			// Call the service to reset the password
			await this.service.resetUserPassword(
				userId,
				cookies,
				password,
				confirmPassword
			);

			// Clear the refresh token cookie to log the user out
			// response.clearCookie('jwt', { httpOnly: true, sameSite: 'none' });
			response.clearCookie('jwt', {sameSite: 'none'});

			// Respond with a success message
			response
				.status(201)
				.json({message: 'Reset password process is complete.'});
		} catch (error) {
			// Pass any errors to the next middleware for error handling.
			next(error);
		} finally {
			// Log a debug message indicating the completion of the Logout process.
			logger.debug('Reset Password process complete');
		}
	};

	/**
	 * Controller method to handle token refresh requests.
	 * This method issues a new access token using a valid refresh token.
	 * @param req - The Express Request object containing cookies with the refresh token.
	 * @param res - The Express Response object used to send the new access token.
	 * @param next - The NextFunction to pass control to the next middleware in case of errors.
	 */
	refreshAccessToken = async (
		req: Request,
		res: Response,
		next: NextFunction
	): Promise<void> => {
		try {
			// Retrieve the refresh token from the cookies.
			const cookies = req.cookies;
			const refreshToken = cookies?.jwt || undefined;

			// Use the AuthService to generate a new access token from the refresh token.
			const newAccessToken = await this.service.refreshAccessToken(
				refreshToken
			);

			// Respond to the client with the new access token.
			res.status(200).json(newAccessToken);
		} catch (error) {
			// Forward any errors to the next middleware for centralized error handling.
			next(error);
		} finally {
			// Log the successful completion of the refresh token process.
			logger.debug('Refresh token process complete');
		}
	};

	/**
	 * Controller method to handle user logout requests.
	 * This method clears the user's refresh token both from the database and from cookies.
	 * @param req - The Express Request object containing cookies with the refresh token.
	 * @param res - The Express Response object used to confirm that the cookie is cleared.
	 * @param next - The NextFunction to pass control to the next middleware in case of errors.
	 */
	logout = async (
		req: Request,
		res: Response,
		next: NextFunction
	): Promise<void> => {
		try {
			// Retrieve the refresh token from the cookies.
			const cookies = req.cookies;

			// Call the AuthService to remove the refresh token from the database.
			await this.service.logout(cookies.jwt);

			// Clear the refresh token cookie on the client-side.
			// using it only in development mode with postman tests
			// res.clearCookie('jwt', { httpOnly: true, sameSite: 'none' });

			// Respond with a confirmation message that the cookie has been cleared.
			res.status(200).json({messgae: 'Cookie cleared.'});
		} catch (error) {
			// Forward any errors to the next middleware for centralized error handling.
			next(error);
		} finally {
			// Log the successful completion of the logout process.
			logger.debug('Logout process complete');
		}
	};
}

export default AuthController;
