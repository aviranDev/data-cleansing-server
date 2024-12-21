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
	selectByCompany(
		company: string,
		page: number,
		pageSize: number
	): Promise<object>;
	selectByService(
		service: string,
		page: number,
		pageSize: number
	): Promise<object>;
	getContactById(documentId: string): Promise<IContact>;
	getContactByEmail(contactEmail: string): Promise<IContact>;
	getContactByName(contactName: string): Promise<IContact>;
}

class ContactService {
	private model: Model<IContact>; // Mongoose model for the Contact collection

	constructor(contactModel: Model<IContact>) {
		// Assign the provided Mongoose model to the class property
		this.model = contactModel;
	}

	// Consolidated method for pagination
	private async paginate(
		filter: object,
		page: number,
		pageSize: number
	): Promise<{items: IContact[]; totalItems: number; totalPages: number}> {
		const totalItems = await this.model.countDocuments(filter);
		if (totalItems === 0) {
			throw new BaseError('No items found for the given filter.');
		}

		const totalPages = Math.ceil(totalItems / pageSize);
		const skipCount = (page - 1) * pageSize;

		const items = await this.model
			.find(filter)
			.skip(skipCount)
			.limit(pageSize)
			.exec();

		return {items, totalItems, totalPages};
	}

	/**
	 * Retrieves a paginated list of all contacts.
	 */
	public async allContacts(page: number, pageSize: number): Promise<object> {
		try {
			const {items, totalItems, totalPages} = await this.paginate(
				{},
				page,
				pageSize
			);

			return {
				contacts: items,
				currentPage: page,
				totalPages,
				totalItems,
			};
		} catch (error) {
			throw error;
		}
	}

	/**
	 * Retrieves contacts for a specific location in a paginated manner.
	 */
	public async selectByLocation(
		location: string,
		page: number,
		pageSize: number
	): Promise<object> {
		try {
			const {items, totalItems, totalPages} = await this.paginate(
				{location},
				page,
				pageSize
			);

			return {
				contacts: items,
				currentPage: page,
				totalPages,
				totalItems,
			};
		} catch (error) {
			throw new BaseError(`No contacts found for the location: ${location}`);
		}
	}

	/**
	 * Retrieves contacts for a specific company in a paginated manner.
	 */
	public async selectByCompany(
		company: string,
		page: number,
		pageSize: number
	): Promise<object> {
		try {
			const {items, totalItems, totalPages} = await this.paginate(
				{company},
				page,
				pageSize
			);

			return {
				contacts: items,
				currentPage: page,
				totalPages,
				totalItems,
			};
		} catch (error) {
			throw new BaseError(`No contacts found for the company: ${company}`);
		}
	}
	/**
	 * Retrieves contacts for a specific company in a paginated manner.
	 */
	public async selectByService(
		service: string,
		page: number,
		pageSize: number
	): Promise<object> {
		try {
			const {items, totalItems, totalPages} = await this.paginate(
				{service},
				page,
				pageSize
			);

			return {
				contacts: items,
				currentPage: page,
				totalPages,
				totalItems,
			};
		} catch (error) {
			throw new BaseError(`No contacts found for the company: ${service}`);
		}
	}

	/**
	 * Retrieves the details of a contact by its ID.
	 */
	public async getContactById(documentId: string): Promise<IContact> {
		try {
			const contact = await this.model.findById(documentId);
			if (!contact) {
				throw new ConflictError('Contact not found.');
			}
			return contact;
		} catch (error) {
			throw error;
		}
	}

	/**
	 * Retrieves the details of a contact by its ID.
	 */
	public async getContactByEmail(email: string): Promise<IContact> {
		try {
			const contact = await this.model.findOne({email});
			if (!contact) {
				throw new ConflictError('Contact not found.');
			}
			return contact;
		} catch (error) {
			throw error;
		}
	}

	/**
	 * Retrieves the details of a contact by its ID.
	 */
	public async getContactByName(contactName: string): Promise<IContact> {
		try {
			const contact = await this.model.findOne({contactName});
			if (!contact) {
				throw new ConflictError('Contact not found.');
			}
			return contact;
		} catch (error) {
			throw error;
		}
	}
}

export default ContactService;
