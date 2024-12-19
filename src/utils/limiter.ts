import {Request, Response, NextFunction} from 'express';
import UserModel from '../models/User';
import FailedLoginAttempt from '../models/failedLoggedin';
import TooManyRequestsError from '../errors/TooManyRequestsError';

export const rateLimiter = (maxRequests: number, windowMs: number) => {
	let timeoutId: NodeJS.Timeout | null = null; // Store the timeout ID
	const errorMessage = 'Account is locked. try again later.';

	const clearPreviousTimeout = (): void => {
		if (timeoutId) clearTimeout(timeoutId);
	};

	const setLockTimeout = async (
		ip: string,
		windowMs: number
	): Promise<void> => {
		timeoutId = setTimeout(async () => {
			await FailedLoginAttempt.deleteOne({ip});
		}, windowMs);
	};

	return async (
		request: Request,
		_response: Response,
		next: NextFunction
	): Promise<void> => {
		const {
			body: {username},
		} = request;

		// Get the IP address, considering proxy setups
		const ip = request.ips?.length ? request.ips[0] : request.ip || 'unknown';

		try {
			// Find the user by username
			const user = await UserModel.findOne({username});

			// Find the existing record for this IP address
			const countDB = await FailedLoginAttempt.findOne({ip});

			// Get the current time
			const currentTime = Date.now();

			// Check if the user exists and if the lock time for this IP address has not elapsed
			if (user && countDB?.lockTime && currentTime < countDB.lockTime) {
				throw new TooManyRequestsError(errorMessage);
			}

			// If the user does not exist, increment the request count for this IP address
			if (!user) {
				const newCountDB = await FailedLoginAttempt.findOneAndUpdate(
					{ip},
					{$inc: {counter: 1}, $setOnInsert: {lockTime: 0}},
					{upsert: true, new: true}
				);

				// Check if the request count exceeds the maximum allowed requests
				if (newCountDB.counter >= maxRequests) {
					// Set the lock time for this IP address
					newCountDB.lockTime = Date.now() + windowMs;
					await newCountDB.save();

					// Clear previous timeout if it exists
					clearPreviousTimeout();

					// Set new timeout to remove the document after the window duration
					setLockTimeout(ip, windowMs);

					// Throw a ManyRequests error indicating that the account is locked
					throw new TooManyRequestsError(errorMessage);
				}
			}
			// If the user exists proceed to the next middleware
			next();
		} catch (error) {
			// Pass any errors to the error-handling middleware
			next(error);
		}
	};
};

export default rateLimiter;
