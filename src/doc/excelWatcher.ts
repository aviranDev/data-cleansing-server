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
	possiblePaths.find((p) => fs.existsSync(p)) ?? possiblePaths[0]; // Default to first if none exist

/**
 * Initialize the watcher for the Excel file and process changes
 */
export function startExcelWatcher(): void {
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
			processExcelFile(filePath);
		}, 1000)
	);

	// Initial processing
	console.log(`✅ Watching: ${filePath}`);
	processExcelFile(filePath);
}
