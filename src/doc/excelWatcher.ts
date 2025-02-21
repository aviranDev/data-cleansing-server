// watchers/excelWatcher.ts
import chokidar from 'chokidar';
import path from 'path';
import _ from 'lodash';
import {processExcelFile} from './excelFile';

const filePath = process.env.DOCKER_ENV
	? '/app/contacts.xlsx' // Inside Docker
	: path.join(process.cwd(), 'src/contacts.xlsx'); // Local development

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
