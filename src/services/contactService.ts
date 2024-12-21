import {Model} from 'mongoose';
import {IContact} from '../models/Contact';
import BaseError from '../errors/BaseError';
import ConflictError from '../errors/ConflictError';

export interface IContactService {
	allContacts(page: number, pageSize: number): Promise<object>;
	selectByLocation(
		location: string,
		page: number,
		pageSize: number
	): Promise<object>;
	getContactById(documentId: string): Promise<IContact>;
}

class ContactService {
	private model: Model<IContact>; // Mongoose model for the Contact collection

	/**
	 * Constructor for the ContactService class.
	 * Initializes the Mongoose model for the Contact collection.
	 *
	 * @param {Model<IContact>} contactModel - The Mongoose model for the Contact collection.
	 */
	constructor(contactModel: Model<IContact>) {
		// Assign the provided Mongoose model to the class property
		this.model = contactModel;
	}

	/**
	 * Retrieves a paginated list of all contacts.
	 *
	 * @param {number} page - The current page number.
	 * @param {number} pageSize - The number of items per page.
	 * @returns {Promise<Object>} - Resolves with the paginated list of contacts, current page, total pages, and total items.
	 * @throws {BaseError} - Throws if no contacts are found or an error occurs during retrieval.
	 */
	public async allContacts(page: number, pageSize: number): Promise<object> {
		try {
			// Count the total number of contacts in the database.
			const totalItems = await this.model.countDocuments();

			// If no contacts are found, throw a BaseError.
			if (totalItems === 0) {
				throw new BaseError(
					`Contacts not found in the database. ${totalItems}`
				);
			}

			// Calculate the total number of pages.
			const totalPages = Math.ceil(totalItems / pageSize);

			// Calculate the number of items to skip based on the current page.
			const skipCount = (page - 1) * pageSize;

			// Retrieve the contacts for the current page.
			const contacts = await this.model
				.find({})
				.skip(skipCount)
				.limit(pageSize)
				.exec();

			// If no contacts are found, throw an error.
			if (!contacts) {
				throw new BaseError(`Error retrieving contacts from the database.`);
			}

			// Return the paginated list of contacts with pagination metadata.
			return {
				contacts,
				currentPage: page,
				totalPages,
				totalItems,
			};
		} catch (error) {
			// Propagate any errors that occur during the process.
			throw error;
		}
	}

	/**
	 * Retrieves contacts for a specific location in a paginated manner.
	 *
	 * @param {string} location - The location for which contacts should be retrieved.
	 * @param {number} page - The current page number.
	 * @param {number} pageSize - The number of items per page.
	 * @returns {Promise<Object>} - Resolves with the paginated list of contacts, current page, total pages, and total items.
	 * @throws {BaseError} - Throws if no contacts are found for the specified location or an error occurs during retrieval.
	 */
	async selectByLocation(
		location: string,
		page: number,
		pageSize: number
	): Promise<object> {
		try {
			// Count the total number of contacts for the specified location.
			const totalItems = await this.model.countDocuments({location});

			// If no contacts are found for the location, throw a BaseError.
			if (totalItems === 0) {
				throw new BaseError(`No contacts found for the location: ${location}`);
			}

			// Calculate the total number of pages for the location-specific contacts.
			const totalPages = Math.ceil(totalItems / pageSize);

			// Calculate the number of documents to skip based on the current page.
			const skipCount = (page - 1) * pageSize;

			// Retrieve the contacts for the specified location.
			const contactInThatLocation = await this.model
				.find({location}) // Filter by location
				.skip(skipCount)
				.limit(pageSize)
				.exec();

			// If no contacts are found after querying, throw a BaseError.
			if (contactInThatLocation.length === 0) {
				throw new BaseError(`No contacts found for the location: ${location}`);
			}

			// Return the paginated contacts for the location with pagination metadata.
			return {
				contactInThatLocation,
				currentPage: page,
				totalPages,
				totalItems,
			};
		} catch (error) {
			// Propagate any errors that occur during the process.
			throw error;
		}
	}

	/**
	 * Retrieves the details of a contact by its ID.
	 *
	 * @param {string} documentId - The ID of the contact to retrieve.
	 * @returns {Promise<IContact>} - Resolves with the contact details if found.
	 * @throws {ConflictError} - Throws if the contact is not found.
	 * @throws {BaseError} - Throws if there's an error during the retrieval process.
	 */
	public async getContactById(documentId: string): Promise<IContact> {
		try {
			// Attempt to find the contact by its ID.
			const contact = await this.model.findById(documentId);

			// If the contact is not found (null), throw a ConflictError.
			if (contact === null) {
				throw new ConflictError('Contact not found.');
			}

			// Return the contact details if found.
			return contact;
		} catch (error) {
			// Propagate any errors that occur during the process.
			throw error;
		}
	}
}

export default ContactService;
