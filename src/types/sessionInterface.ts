import {Types, Document} from 'mongoose';
import {IUser} from './userInterface';

export interface ISession extends Document {
	refreshToken: string;
	userId: Types.ObjectId;
	lastLogin: Date;
}

export interface ISessionService {
	generateAccessToken(user: IUser): string;
	generateRefreshToken(user: IUser): string;
	verifyRefreshToken(refreshToken: string): Promise<IUser>;
	verifyAccessToken(authHeader: string): IUser;
	removeRefreshToken(cookie: string): Promise<void>;
	storeRefreshTokenInDb(refreshToken: string, userId: string): Promise<void>;
	removeExpiredSessions(expirationDate: Date): Promise<void>;
}
