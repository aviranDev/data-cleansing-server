import {Request, Response, NextFunction} from 'express';
import Joi from 'joi';
import UnprocessableError from '../errors/UnprocessableError';

// Generic validation middleware
export const validateMiddleware = (schema: Joi.ObjectSchema) => {
	return (request: Request, _response: Response, next: NextFunction): void => {
		try {
			const {error, value} = schema.validate(request.body);
			if (error) {
				throw new UnprocessableError(`${error.details[0].message}`);
			}
			// Attach the validated data to the request object
			request.body = value;
			next(); // Call the next middleware or route handler
		} catch (error) {
			next(error);
		}
	};
};

export default validateMiddleware;
