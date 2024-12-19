import BaseError from './BaseError';

class TooManyRequestsError extends BaseError {
	constructor(message = 'Too many requests, please try again later') {
		super(message);
		this.name = 'Too Many Requests Error';
		this.statusCode = 429; // Set the specific status code for 429 Too Many Requests
	}
}

export default TooManyRequestsError;
