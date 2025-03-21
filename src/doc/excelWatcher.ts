import fs from 'fs';
import chokidar from 'chokidar';
import path from 'path';
import _ from 'lodash';
import {processExcelFile} from './excelFile';
import logger from '../logger/logger'; // Assuming you use a logger

// const filePath = path.join(process.cwd(), 'src', 'contacts.xlsx');
const filePath = '/app/src/contacts.xlsx'; // Container path

// Check and log the initial state of the file
if (!fs.existsSync(filePath)) {
	logger.error(`❌ Excel file not found at ${filePath}`);
} else {
	logger.info(`✅ Using Excel file at ${filePath}`);
}

/**
 * Initialize the watcher for the Excel file and process changes
 */
export function startExcelWatcher(): void {
	if (!fs.existsSync(filePath)) {
		logger.error(`❌ Excel file not found: ${filePath}`);
		return;
	}

	const watcher = chokidar.watch(filePath, {
		persistent: true,
		usePolling: true,
		interval: 1000,
		ignoreInitial: false,
		awaitWriteFinish: {
			stabilityThreshold: 2000,
			pollInterval: 100,
		},
	});

	watcher.on(
		'change',
		_.debounce(async () => {
			logger.info(`📂 File changed: ${filePath}, updating database...`);
			try {
				await processExcelFile(filePath);
			} catch (error) {
				logger.error(`❌ Error processing file ${filePath}:`, error);
			}
		}, 1000)
	);

	// Initial processing of the file
	logger.info(`👀 Watching: ${filePath}`);
	(async () => {
		try {
			logger.info(`🚀 Initial processing of: ${filePath}`);
			await processExcelFile(filePath);
		} catch (error) {
			logger.error(`❌ Error processing file on startup: ${error}`);
		}
	})();
}
