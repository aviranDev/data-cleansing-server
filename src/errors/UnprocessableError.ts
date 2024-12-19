import BaseError from './BaseError';

class UnprocessableError extends BaseError {
	constructor(message = 'Unprocessable Entity') {
		super(message);
		this.name = 'Unprocessable Entity';
		this.statusCode = 422; // Set the specific status code for 401 Unauthorized
	}
}

export default UnprocessableError;
