import XLSX from 'xlsx';
import fs from 'fs';
import Contact, {IContact} from '../models/Contact';
import CryptoJS from 'crypto-js';
import logger from '../logger/logger';

/**
 * Helper function to chunk an array into smaller arrays of a specific size.
 * @param array - The input array to be divided into smaller chunks.
 * @param size - The size of each chunk (number of items per chunk).
 * @returns An array of smaller arrays (chunks), each containing up to `size` items.
 */
const chunkArray = <T>(array: T[], size: number): T[][] => {
	return Array.from({length: Math.ceil(array.length / size)}, (_, i) =>
		array.slice(i * size, i * size + size)
	);
};

/**
 * Helper function to compute an MD5 hash for a given object.
 * @param data - A partial IContact object containing the fields to be hashed.
 * @returns A string representing the MD5 hash of the input object.
 */
const computeHash = (data: Partial<IContact>): string => {
	return CryptoJS.MD5(JSON.stringify(data)).toString(CryptoJS.enc.Hex);
};

/**
 * Helper function to normalize phone numbers by removing all non-numeric characters.
 * @param phone - The input phone number, which may contain non-numeric characters.
 * @returns A string containing only the numeric characters from the input phone number.
 */
const normalizePhone = (phone: any): string => {
	return (phone ? String(phone) : '').replace(/\D/g, '').trim();
};

/**
 * Function to process an Excel file and update the database based on its content.
 * @param filePath - The path to the Excel file to be processed.
 */
export const processExcelFile = async (filePath: string): Promise<void> => {
	try {
		if (!fs.existsSync(filePath)) {
			logger.error('Excel file not found:', filePath);
			return;
		}

		const workbook = XLSX.readFile(filePath);
		const sheetName = workbook.SheetNames[0];
		const sheetData: IContact[] = XLSX.utils.sheet_to_json<IContact>(
			workbook.Sheets[sheetName]
		);

		logger.debug(`Parsed ${sheetData.length} rows from Excel file.`);

		if (sheetData.length === 0) {
			logger.warn('No data found in the Excel sheet.');
			return;
		}

		const CHUNK_SIZE = 50;
		const validServices = ['agent', 'airline', 'transport'];

		sheetData.forEach((row, index) => {
			if (row.service && !validServices.includes(row.service)) {
				logger.warn(
					`Invalid service value "${row.service}" at row ${
						index + 1
					}. Setting to "agent".`
				);
				row.service = 'agent';
			}
		});

		const emails = sheetData.map((row) => row.email);
		const existingContacts = await Contact.find({email: {$in: emails}}).lean();
		const contactMap = new Map(
			existingContacts.map((contact) => [contact.email, contact])
		);

		const chunkedData = chunkArray(sheetData, CHUNK_SIZE);

		for (const chunk of chunkedData) {
			const bulkOps = [];

			for (const row of chunk) {
				const existingContact = contactMap.get(row.email);
				const normalizedPhone = normalizePhone(row.phone);

				const createHashObject = (data: IContact) => ({
					company: data.company,
					contactName: data.contactName,
					email: data.email,
					service: data.service,
					floor: data.floor,
					location: data.location,
					role: data.role,
					room: data.room,
					phone: normalizePhone(data.phone),
				});

				const excelHash = computeHash(createHashObject(row as IContact));
				const dbHash = existingContact
					? computeHash(createHashObject(existingContact as IContact))
					: null;

				if (!existingContact || excelHash !== dbHash) {
					console.log(`Updating record for email: ${row.email}`);
					bulkOps.push({
						updateOne: {
							filter: {email: row.email},
							update: {$set: {...row, phone: normalizedPhone}},
							upsert: true,
						},
					});
				} else {
					logger.debug(`No changes for email: ${row.email}`);
				}
			}

			if (bulkOps.length > 0) {
				const result = await Contact.bulkWrite(bulkOps);
				logger.debug(
					`Chunk processed: ${result.matchedCount} updated, ${result.upsertedCount} inserted.`
				);
			}
		}

		const excelEmails = new Set(sheetData.map((row) => row.email));
		await Contact.deleteMany({email: {$nin: Array.from(excelEmails)}});

		logger.debug('Excel file processed and database updated.');
	} catch (error) {
		logger.error('Error processing Excel file:', error);
	}
};
