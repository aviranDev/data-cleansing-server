import XLSX from 'xlsx';
import fs from 'fs';
// import Record from '../models/Record';
import CustomAgent, {ICustomAgent} from '../models/customAgents';

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
		const sheetData: ICustomAgent[] = XLSX.utils.sheet_to_json<ICustomAgent>(
			workbook.Sheets[sheetName]
		);

		// Sync data with the database
		const existingRecords = await CustomAgent.find();
		const existingEmails = new Set(existingRecords.map((rec) => rec.email));

		const newRecords = sheetData.filter(
			(row) => !existingEmails.has(row.email)
		);
		const updatedRecords = sheetData.filter((row) =>
			existingEmails.has(row.email)
		);

		// Insert new records
		if (newRecords.length) {
			await CustomAgent.insertMany(
				newRecords.map((row) => ({
					agent: row.agent,
					contactName: row.contactName,
					email: row.email,
					phone: row.phone,
					role: row.role,
				}))
			);
		}

		// Update existing records
		for (const record of updatedRecords) {
			await CustomAgent.updateOne(
				{email: record.email}, // Filter by unique identifier
				{...record} // Update with all fields from the record
			);
		}

		// **Delete records not present in Excel**
		const excelEmails = new Set(sheetData.map((row) => row.email));
		await CustomAgent.deleteMany({email: {$nin: Array.from(excelEmails)}});

		console.log('Excel file processed and database updated.');
	} catch (error) {
		console.error('Error processing Excel file:', error);
	}
};
