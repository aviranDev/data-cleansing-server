import BaseError from './BaseError';

class ConflictError extends BaseError {
	constructor(message = 'Conflict occurred') {
		super(message);
		this.name = 'Conflict Error';
		this.statusCode = 409; // Set the specific status code for 409 Conflict
	}
}

export default ConflictError;
