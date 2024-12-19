import BaseError from './BaseError';

class ForbiddenError extends BaseError {
	constructor(message = 'Access forbidden') {
		super(message);
		this.name = 'Forbidden Error';
		this.statusCode = 403; // Set the specific status code for 403 Forbidden
	}
}

export default ForbiddenError;
