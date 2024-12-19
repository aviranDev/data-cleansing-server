import BaseError from './BaseError';

class UnauthorizedError extends BaseError {
	constructor(message = 'Unauthorized access') {
		super(message);
		this.name = 'Unauthorized';
		this.statusCode = 401; // Set the specific status code for 401 Unauthorized
	}
}

export default UnauthorizedError;
