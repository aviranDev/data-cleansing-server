import {Request, Response, NextFunction} from 'express';
import logger from '../logger/logger';
import {IContactService} from '../services/contactService';

class ContactController {
	private service: IContactService;

	constructor(service: IContactService) {
		this.service = service;
	}

	/**
	 * Retrieves all contacts with pagination.
	 *
	 * @param {Request} request - Express request object, containing pagination parameters.
	 * @param {Response} response - Express response object, used to send the response.
	 * @param {NextFunction} next - Express next middleware function, used to handle errors.
	 * @returns {Promise<void>} - Resolves with the paginated list of contacts on success, or passes an error to the next middleware.
	 *
	 * @description This middleware function fetches all contacts with optional pagination.
	 *   It parses pagination parameters (page and limit) from the request query, then calls
	 *   the `allContacts` method of the service to retrieve the contacts. If successful,
	 *   it responds with the contacts data. Any errors are passed to the error-handling middleware.
	 */
	allContacts = async (
		request: Request,
		response: Response,
		next: NextFunction
	): Promise<void> => {
		try {
			// Parse pagination parameters from the request query or use default values if not provided.
			const page: number = parseInt(request.query.page as string) || 1;
			const limit: number = parseInt(request.query.limit as string) || 10;

			// Call the service to fetch the contacts with pagination.
			const contacts = await this.service.allContacts(page, limit);

			// Respond with the fetched contacts.
			response.status(200).json(contacts);
		} catch (error) {
			// Pass any errors to the error-handling middleware.
			next(error);
		} finally {
			// Log a message indicating that the operation is complete.
			logger.debug('Display contacts complete.');
		}
	};

	/**
	 * Returns a middleware function to retrieve contacts by location with pagination.
	 *
	 * @param {string} location - The location for which contacts are to be fetched.
	 * @returns {(request: Request, response: Response, next: NextFunction) => Promise<void>} - Express middleware function.
	 *
	 * @description This middleware function retrieves contacts filtered by location with pagination.
	 *   It parses pagination parameters (page and limit) from the request query, and calls the
	 *   `selectByLocation` method of the service to retrieve the contacts for the given location.
	 *   If successful, it responds with the filtered contacts. Any errors are passed to the error-handling middleware.
	 */
	selectByLocation = async (
		request: Request,
		response: Response,
		next: NextFunction
	): Promise<void> => {
		try {
			// Parse pagination parameters from the request query or use default values if not provided.
			const page: number = parseInt(request.query.page as string) || 1;
			const limit: number = parseInt(request.query.limit as string) || 10;
			const location = request.query.location as string;

			// Call the service to fetch contacts for the given location.
			const contactsInThatLocation = await this.service.selectByLocation(
				location,
				page,
				limit
			);

			// Respond with a success message.
			response.status(200).json(contactsInThatLocation);
		} catch (error) {
			// Pass any errors to the error-handling middleware.
			next(error);
		} finally {
			// Log a message indicating that the operation is complete.
			logger.debug('Port contacts is complete.');
		}
	};

	/**
	 * Retrieves details of a specific contact by its ID.
	 *
	 * @param {Request} request - Express request object, containing the contact ID in the parameters.
	 * @param {Response} response - Express response object, used to send the contact details.
	 * @param {NextFunction} next - Express next middleware function, used to handle errors.
	 * @returns {Promise<void>} - Resolves with the contact details on success, or passes an error to the next middleware.
	 *
	 * @description This middleware function retrieves a contact by its unique ID.
	 *   It extracts the contact ID from the request parameters and calls the `getContactById`
	 *   method of the service to retrieve the contact details. If successful, it responds with
	 *   the contact data. Any errors are passed to the error-handling middleware.
	 */
	getContactById = async (
		request: Request,
		response: Response,
		next: NextFunction
	): Promise<void> => {
		try {
			// Extract the contact ID from the request parameters.
			const {id} = request.params;

			// Call the service to retrieve the contact by its ID.
			const contact = await this.service.getContactById(id);

			// Respond with the contact details.
			response.status(200).send({contact: contact});
		} catch (error) {
			// Pass any errors to the error-handling middleware.
			next(error);
		} finally {
			// Log a message indicating that the operation is complete.
			logger.debug('Display contact is complete.');
		}
	};
}

export default ContactController;
