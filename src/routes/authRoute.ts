import {userAuth} from './../middlewares/userAuth';
import {Router} from 'express';
import UserModel from '../models/User';
import AuthService from '../services/authService';
import AuthController from '../controllers/authController';
import SessionService from '../services/SessionService';
import Session from '../models/Session';
import validateAuthentication from '../validation/authValidation';
import {validateMiddleware} from '../middlewares/validateRequest';
import {resetPasswordValidation} from '../validation/resetPassValidation';
import rateLimiter from '../utils/limiter';

// Initialize the session service with the session model
const sessionService = new SessionService(Session);

// Initialize the authentication service with the user model and session service
const authService = new AuthService(UserModel, sessionService);

// Initialize the authentication controller with the authentication service
const authController = new AuthController(authService);

// Create a new instance of the Express Router
const router = Router();
const {maxLoginAttempts, lockDuration} = authService;

/**
 * POST /login
 * Route for user login
 * - Applies a rate limiter middleware (to prevent brute-force attacks)
 * - Uses the validateMiddleware to validate the authentication request body
 * - Calls the login method from the AuthController
 */
router.post(
	'/login',
	rateLimiter(maxLoginAttempts, lockDuration), // Limiting to 5 requests per minute
	validateMiddleware(validateAuthentication), // Validates the request body
	authController.login // Calls the login method in the AuthController
);

/**
 * POST /reset-password
 * Route for resetting the user’s password
 * - Requires the user to be authenticated (using the userAuth middleware)
 * - Validates the request body with validateMiddleware and resetPasswordValidation
 * - Calls the resetPassword method from the AuthController to handle the reset logic
 */
router.post(
	'/reset-password',
	userAuth, // Checks if the user is authenticated
	validateMiddleware(resetPasswordValidation), // Validates the request body for required fields and format
	authController.resetPasswrod // Executes password reset logic in AuthController
);

/**
 * GET /refresh-token
 * Route for refreshing the access token
 * - Calls the refreshAccessToken method from the AuthController
 */
router.get('/refresh-token', authController.refreshAccessToken);

/**
 * DELETE /logout
 * Route for logging out the user
 * - Calls the logout method from the AuthController
 */
router.delete('/logout', authController.logout);

// Export the configured router to be used in the application
export default router;
