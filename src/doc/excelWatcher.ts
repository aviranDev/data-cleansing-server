// watchers/excelWatcher.ts
import chokidar from 'chokidar';
import path from 'path';
import _ from 'lodash';
import {processExcelFile} from './excelFile';

const filePath = process.env.DOCKER_ENV
	? '/app/contacts.xlsx' // Inside Docker
	: path.join(process.cwd(), 'src/contacts.xlsx'); // Local development

console.log('DOCKER_ENV:', process.env.DOCKER_ENV); // Log the value of DOCKER_ENV
console.log('File path being watched:', filePath); // Log the file path to ensure it's correct

/**
 * Initialize the watcher for the Excel file and process changes
 */
export function startExcelWatcher(): void {
	const watcher = chokidar.watch(filePath, {persistent: true});

	watcher.on(
		'change',
		_.debounce(() => {
			console.log('File changed, updating database...');
			processExcelFile(filePath);
		}, 1000)
	);

	// Initial processing
	processExcelFile(filePath);
}
