import XLSX from 'xlsx';
import fs from 'fs';
import Contact, {IContact} from '../models/Contact';

// Helper function to chunk an array
const chunkArray = <T>(array: T[], size: number): T[][] =>
	Array.from({length: Math.ceil(array.length / size)}, (_, i) =>
		array.slice(i * size, i * size + size)
	);

// Function to process the Excel file
export const processExcelFile = async (filePath: string): Promise<void> => {
	try {
		// Check if the file exists
		if (!fs.existsSync(filePath)) {
			console.error('Excel file not found:', filePath);
			return;
		}

		// Read and parse the Excel file
		const workbook = XLSX.readFile(filePath);
		const sheetName = workbook.SheetNames[0];
		const sheetData: IContact[] = XLSX.utils.sheet_to_json<IContact>(
			workbook.Sheets[sheetName]
		);

		// Log the number of rows parsed
		console.log(`Parsed ${sheetData.length} rows from Excel file.`);

		if (sheetData.length === 0) {
			console.warn('No data found in the Excel sheet.');
			return;
		}

		// Define chunk size for batch processing
		const CHUNK_SIZE = 100; // Adjust based on your database capacity

		// Define valid service values
		const validServices = ['agent', 'airline', 'transport'];

		// Validate and correct the service field for each row
		sheetData.forEach((row, index) => {
			if (row.service && !validServices.includes(row.service)) {
				console.warn(
					`Invalid service value "${row.service}" at row ${
						index + 1
					}. Setting to "agent".`
				);
				row.service = 'agent'; // Set to a default value if invalid
			}
		});

		// Prepare bulk operations in chunks
		const chunkedData = chunkArray(sheetData, CHUNK_SIZE);
		for (const chunk of chunkedData) {
			const bulkOps = chunk.map((row) => ({
				updateOne: {
					filter: {email: row.email}, // Unique identifier
					update: {$set: row}, // Update all fields
					upsert: true, // Insert if not found
				},
			}));

			if (bulkOps.length > 0) {
				const result = await Contact.bulkWrite(bulkOps);
				console.log(
					`Chunk processed: ${result.matchedCount} updated, ${result.upsertedCount} inserted.`
				);
			}
		}

		// **Delete records not present in Excel**
		const excelEmails = new Set(sheetData.map((row) => row.email));
		await Contact.deleteMany({email: {$nin: Array.from(excelEmails)}});

		console.log('Excel file processed and database updated.');
	} catch (error) {
		console.error('Error processing Excel file:', error);
	}
};
