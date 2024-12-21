import {Router, Application} from 'express'; // Import necessary modules from express
import authRoute from '../routes/authRoute'; // Import authentication-related routes
import userRoute from '../routes/userRoute'; // Import user management-related routes
import cronRoute from '../routes/scheduled-jobs'; // Import scheduled job (cron) related routes
import contactRoutes from '../routes/contactRoute'; // Import contact management-related routes
import notFoundMiddleware from '../middlewares/notFoundMiddleware'; // Middleware to handle undefined routes
import errorHandler from '../middlewares/errorHandler'; // General error handling middleware

// Create an instance of a Router
const router = Router();

// Define API routes with their respective paths
router.use('/auth', authRoute); // Mount authentication-related routes at /auth
router.use('/users', userRoute); // Mount user management-related routes at /users
router.use('/contacts', contactRoutes); // Mount contact management-related routes at /contacts
router.use('/crons', cronRoute); // Mount cron job-related routes at /crons

/**
 * Function to setup API routes and middlewares
 * @param app Express Application instance
 */
export function setupRoutes(app: Application): void {
	// Mount the router for the API on /api path
	app.use('/api', router);

	// Middleware for handling undefined routes, catching 404 errors
	app.use(notFoundMiddleware);

	// Middleware for handling any errors that occur in the app
	app.use(errorHandler);
}
