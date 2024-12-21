import {Request, Response, NextFunction} from 'express';
import logger from '../logger/logger';
import {IContactService} from '../services/contactService';

class ContactController {
	private service: IContactService;

	constructor(service: IContactService) {
		this.service = service;
	}

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
			console.log(location);

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
	selectByCompany = async (
		request: Request,
		response: Response,
		next: NextFunction
	): Promise<void> => {
		try {
			// Parse pagination parameters from the request query or use default values if not provided.
			const page: number = parseInt(request.query.page as string) || 1;
			const limit: number = parseInt(request.query.limit as string) || 10;
			const company = request.query.company as string;

			// Call the service to fetch contacts for the given location.
			const contactsInThatcompany = await this.service.selectByCompany(
				company,
				page,
				limit
			);

			// Respond with a success message.
			response.status(200).json(contactsInThatcompany);
		} catch (error) {
			// Pass any errors to the error-handling middleware.
			next(error);
		} finally {
			// Log a message indicating that the operation is complete.
			logger.debug('Port contacts is complete.');
		}
	};
	selectByService = async (
		request: Request,
		response: Response,
		next: NextFunction
	): Promise<void> => {
		try {
			// Parse pagination parameters from the request query or use default values if not provided.
			const page: number = parseInt(request.query.page as string) || 1;
			const limit: number = parseInt(request.query.limit as string) || 10;
			const service = request.query.service as string;

			// Call the service to fetch contacts for the given location.
			const contactsInThatcompany = await this.service.selectByService(
				service,
				page,
				limit
			);

			// Respond with a success message.
			response.status(200).json(contactsInThatcompany);
		} catch (error) {
			// Pass any errors to the error-handling middleware.
			next(error);
		} finally {
			// Log a message indicating that the operation is complete.
			logger.debug('Port contacts is complete.');
		}
	};

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

	getContactByEmail = async (
		request: Request,
		response: Response,
		next: NextFunction
	): Promise<void> => {
		try {
			// Extract the contact ID from the request parameters.
			const email = request.query.email as string;

			// Call the service to retrieve the contact by its ID.
			const contact = await this.service.getContactByEmail(email);

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

	findByContactName = async (
		request: Request,
		response: Response,
		next: NextFunction
	): Promise<void> => {
		try {
			// Extract the contact ID from the request parameters.
			const name = request.query.name as string;

			// Call the service to retrieve the contact by its ID.
			const contact = await this.service.getContactByName(name);

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
