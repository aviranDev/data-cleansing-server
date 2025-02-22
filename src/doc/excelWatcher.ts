import fs from 'fs';
import chokidar from 'chokidar';
import path from 'path';
import _ from 'lodash';
import {processExcelFile} from './excelFile';

// Determine the correct file path
const possiblePaths = [
	path.join(process.cwd(), 'app/contacts.xlsx'),
	path.join(process.cwd(), 'src/contacts.xlsx'),
];

const filePath =
	possiblePaths.find((p) => fs.existsSync(p)) ?? possiblePaths[0];

// Log the file path or an error if not found
if (!fs.existsSync(filePath)) {
	console.error(`❌ Excel file not found at ${filePath}`);
} else {
	console.log(`✅ Using Excel file at ${filePath}`);
}

/**
 * Initialize the watcher for the Excel file and process changes
 */
export function startExcelWatcher(): void {
	// Ensure the file exists
	if (!fs.existsSync(filePath)) {
		console.error(`❌ Excel file not found: ${filePath}`);
		return;
	}

	const watcher = chokidar.watch(filePath, {
		persistent: true,
		usePolling: true, // 👈 Enables polling (fixes issues in Docker)
		interval: 1000, // 👈 Adjust polling interval (1 second)
		ignoreInitial: false, // Ensures the file is processed on startup
	});

	watcher.on(
		'change',
		_.debounce(() => {
			console.log(`📂 File changed: ${filePath}, updating database...`);
			try {
				processExcelFile(filePath);
			} catch (error) {
				console.error(`Error processing file ${filePath}:`, error);
			}
		}, 1000) // Debounce to handle rapid changes
	);

	// Initial processing of the file
	console.log(`✅ Watching: ${filePath}`);
	try {
		processExcelFile(filePath);
	} catch (error) {
		console.error(`Error processing file on startup: ${error}`);
	}
}
