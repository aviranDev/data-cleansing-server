import BaseError from './BaseError';

class NoContentError extends BaseError {
	constructor(message = 'No content available') {
		super(message);
		this.name = 'NoContent Error';
		this.statusCode = 204; // Set specific status code for 204 No Content
	}
}

export default NoContentError;
