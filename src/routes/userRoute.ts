import {Router} from 'express';
import UserController from '../controllers/userController';
import UserService from '../services/userService';
import UserModel from '../models/User';
import {validateMiddleware} from '../middlewares/validateRequest';
import validateRegistration from '../validation/userValidation';
import {userAuth} from '../middlewares/userAuth';

// Initialize the service layer with the UserModel to interact with the database
const userService = new UserService(UserModel);

// Initialize the controller with the service, which handles business logic and user actions
const userController = new UserController(userService);

// Create an Express router instance to define routes for user-related operations
const router = Router();

/**
 * POST /register
 * Route to handle user registration.
 * First, it validates the request body using `validateMiddleware` and `validateRegistration`.
 * Then it calls the `register` method of the userController to handle the registration logic.
 */
router.post(
	'/register',
	validateMiddleware(validateRegistration),
	userController.register
);

/**
 * GET /user-profile
 * Route to handle user profile retrieval.
 * First, it checks if the user is authenticated using the `userAuth` middleware.
 * If the user is authenticated, it calls the `userProfile` method of the userController to get the profile.
 */
router.get('/user-profile', userAuth, userController.userProfile);

// Export the router for use in the main server file
export default router;
