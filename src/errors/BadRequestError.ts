import BaseError from './BaseError';

class BadRequestError extends BaseError {
	constructor(message = 'Bad request') {
		super(message);
		this.name = 'Bad Request Error';
		this.statusCode = 400; // Set the specific status code for 400 Bad Request
	}
}

export default BadRequestError;
