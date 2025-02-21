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
	searchContacts(
		filter: object, // Accept an object for MongoDB-style filters
		page: number,
		pageSize: number
	): Promise<{items: IContact[]; totalItems: number; totalPages: number}>;
	filterByName(company: string): Promise<object>;
	searchByname(search: string): Promise<IContact>;
	selectByService(
		service: string,
		page: number,
		pageSize: number
	): Promise<object>;
	getContactById(documentId: string): Promise<IContact>;
	getContactByEmail(contactEmail: string): Promise<IContact>;
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
		const skipCount = (page - 1) * pageSize;

		try {
			const result = await this.model.aggregate([
				{$match: filter},
				{
					$facet: {
						metadata: [
							{$count: 'totalItems'}, // Count total items
							{
								$addFields: {
									totalPages: {$ceil: {$divide: ['$totalItems', pageSize]}},
								},
							}, // Calculate total pages
						],
						items: [
							{$skip: skipCount}, // Skip the appropriate number of records
							{$limit: pageSize}, // Limit the number of records per page
						],
					},
				},
			]);

			const totalItems = result[0]?.metadata?.[0]?.totalItems || 0;
			const totalPages = result[0]?.metadata?.[0]?.totalPages || 0;
			const items = result[0]?.items || [];

			return {items, totalItems, totalPages};
		} catch (error) {
			throw new BaseError('Error during aggregation.');
		}
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
	 * Retrieves contacts for a specific company in a paginated manner with case-sensitive name matching.
	 */
	public async filterByName(company: string): Promise<object> {
		try {
			// Create a case-sensitive filter for the company name using $regex
			const filter = {company: {$regex: company, $options: 'i'}};

			// Use findOne to retrieve the first contact that matches the company
			const data = await this.model
				.find(filter)
				.limit(parseInt('3'))
				.select('company'); // Return only relevant fields

			if (!data) {
				throw new BaseError(`No contacts found for the company: ${company}`);
			}

			return data;
		} catch (error) {
			throw new BaseError(`Error retrieving contacts for company: ${company}`);
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
	public async searchByname(search: string): Promise<IContact> {
		try {
			const contact = await this.model.findOne({company: search});
			if (!contact) {
				throw new ConflictError('Contact not found.');
			}
			return contact;
		} catch (error) {
			throw error;
		}
	}

	public async searchContacts(
		filter: object, // Updated type to object
		page: number = 1,
		pageSize: number = 10
	): Promise<{items: IContact[]; totalItems: number; totalPages: number}> {
		try {
			const result = await this.model.aggregate([
				{$match: filter},
				{
					$facet: {
						metadata: [
							{$count: 'totalItems'},
							{
								$addFields: {
									totalPages: {$ceil: {$divide: ['$totalItems', pageSize]}},
								},
							},
						],
						items: [{$skip: (page - 1) * pageSize}, {$limit: pageSize}],
					},
				},
			]);

			const metadata = result[0]?.metadata?.[0] || {
				totalItems: 0,
				totalPages: 0,
			};
			const items = result[0]?.items || [];

			return {
				items,
				totalItems: metadata.totalItems,
				totalPages: metadata.totalPages,
			};
		} catch (error) {
			throw new BaseError('Error during search aggregation.');
		}
	}
}

export default ContactService;
