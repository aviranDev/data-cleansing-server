import XLSX from 'xlsx';
import fs from 'fs';
import Contact, {IContact} from '../models/Contact';
import CryptoJS from 'crypto-js';

// Helper function to chunk an array into smaller arrays of a specific size
const chunkArray = <T>(array: T[], size: number): T[][] => {
	// Create chunks of the array to process in batches
	return Array.from({length: Math.ceil(array.length / size)}, (_, i) =>
		array.slice(i * size, i * size + size)
	);
};

// Helper function to compute a hash for comparison of data using meaningful fields
const computeHash = (data: Partial<IContact>): string => {
	// Convert the data to a JSON string and compute the MD5 hash
	return CryptoJS.MD5(JSON.stringify(data)).toString(CryptoJS.enc.Hex);
};

// Helper function to normalize phone numbers by removing all non-numeric characters
const normalizePhone = (phone: any): string => {
	// Return the phone number as a string, stripping non-numeric characters
	return (phone ? String(phone) : '').replace(/\D/g, '').trim();
};

// Function to process the Excel file and update the database
export const processExcelFile = async (filePath: string): Promise<void> => {
	try {
		// Check if the Excel file exists at the provided path
		if (!fs.existsSync(filePath)) {
			console.error('Excel file not found:', filePath);
			return; // Exit if the file doesn't exist
		}

		// Read and parse the Excel file into a workbook object
		const workbook = XLSX.readFile(filePath);
		// Use the first sheet in the workbook
		const sheetName = workbook.SheetNames[0];
		// Convert the sheet into an array of contact objects
		const sheetData: IContact[] = XLSX.utils.sheet_to_json<IContact>(
			workbook.Sheets[sheetName]
		);

		// Log the number of rows parsed from the Excel file
		console.log(`Parsed ${sheetData.length} rows from Excel file.`);

		// If the sheet contains no data, log a warning and exit
		if (sheetData.length === 0) {
			console.warn('No data found in the Excel sheet.');
			return;
		}

		// Define the chunk size for batch processing (adjustable based on database capacity)
		const CHUNK_SIZE = 100;

		// Define valid service values to ensure consistency in the data
		const validServices = ['agent', 'airline', 'transport'];

		// Validate and correct the service field for each row, setting invalid values to "agent"
		sheetData.forEach((row, index) => {
			if (row.service && !validServices.includes(row.service)) {
				console.warn(
					`Invalid service value "${row.service}" at row ${
						index + 1
					}. Setting to "agent".`
				);
				row.service = 'agent'; // Set invalid service to a default value
			}
		});

		// Prepare the data for batch processing by splitting it into chunks
		const chunkedData = chunkArray(sheetData, CHUNK_SIZE);
		// Iterate through each chunk of data
		for (const chunk of chunkedData) {
			// Create an array to store bulk operations
			const bulkOps = [];
			// Process each row in the current chunk
			for (const row of chunk) {
				// Check if a contact with the same email already exists in the database
				const existingContact = await Contact.findOne({
					email: row.email,
				}).lean();

				// Normalize the phone number for comparison purposes
				const normalizedPhone = normalizePhone(row.phone);

				// Helper function to create a standardized hash object for comparison
				const createHashObject = (data: IContact) => ({
					company: data.company,
					contactName: data.contactName,
					email: data.email,
					service: data.service,
					flour: data.flour,
					location: data.location,
					role: data.role,
					room: data.room,
					phone: normalizePhone(data.phone), // Ensure phone is normalized
				});

				// Compute the hash for the current row and the existing contact (if any)
				const excelHash = computeHash(createHashObject(row as IContact));
				const dbHash = existingContact
					? computeHash(createHashObject(existingContact as IContact))
					: null;

				// If no existing contact or the hashes differ, update the record
				if (!existingContact || excelHash !== dbHash) {
					console.log(`Updating record for email: ${row.email}`);
					// Add the update operation to the bulkOps array
					bulkOps.push({
						updateOne: {
							filter: {email: row.email},
							update: {$set: {...row, phone: normalizedPhone}},
							upsert: true, // Insert if not found, otherwise update
						},
					});
				} else {
					console.log(`No changes for email: ${row.email}`);
				}
			}

			// Execute bulk write for the current chunk
			if (bulkOps.length > 0) {
				const result = await Contact.bulkWrite(bulkOps);
				console.log(
					`Chunk processed: ${result.matchedCount} updated, ${result.upsertedCount} inserted.`
				);
			}
		}

		// **Delete records not present in the Excel file**
		// Create a set of emails from the Excel data
		const excelEmails = new Set(sheetData.map((row) => row.email));
		// Remove contacts from the database whose email is not in the Excel file
		await Contact.deleteMany({email: {$nin: Array.from(excelEmails)}});

		console.log('Excel file processed and database updated.');
	} catch (error) {
		// Log any errors encountered during processing
		console.error('Error processing Excel file:', error);
	}
};
