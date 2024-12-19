import BaseError from './BaseError';

class NotFoundError extends BaseError {
	constructor(message = 'Resource not found') {
		super(message);
		this.name = 'Not Found';
		this.statusCode = 404; // Set specific status code
	}
}

export default NotFoundError;
