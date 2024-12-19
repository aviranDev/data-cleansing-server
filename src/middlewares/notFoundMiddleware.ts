import {Request, Response, NextFunction} from 'express';
import NotFoundError from '../errors/NotFoundError';

// Middleware for handling undefined routes
const notFoundMiddleware = (
	_req: Request,
	_res: Response,
	next: NextFunction
): void => {
	next(new NotFoundError('Route not found'));
};

export default notFoundMiddleware;
