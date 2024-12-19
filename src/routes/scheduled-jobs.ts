import {Router} from 'express';
import {ScheduledJobController} from '../controllers/scheduled-jobs';
import SessionService from '../services/SessionService';
import Session from '../models/Session';

// Initialize the session service with the session model
const service = new SessionService(Session);

// Create a new instance of the Express Router
const router = Router();

// Initialize the scheduled jobs controller with the session service
const scheduledJobs = new ScheduledJobController(service);

/**
 * GET /cron-job
 * Route for triggering a scheduled cron job task
 * - Calls the cronTask method from the ScheduledJobController
 * - The cronTask method performs the job logic (e.g., scheduled database cleanup, notifications)
 */
router.get('/cron-job', scheduledJobs.cronTask);

// Export the configured router to be used in the application
export default router;
