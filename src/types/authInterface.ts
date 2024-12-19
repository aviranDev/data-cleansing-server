export interface IAuth {
	username: string;
	password: string;
	confirmPassword?: string;
	lockDuration: number;
	maxLoginAttempts: number;
}

export interface IAuthService {
	login(
		username: string,
		password: string
	): Promise<{accessToken: string; refreshToken: string}>;
	logout(cookie: string): Promise<void>;
	refreshAccessToken(
		refreshToken: string
	): Promise<{success: boolean; accessToken?: string}>;
	resetUserPassword(
		userId: string,
		cookie: string,
		password: string,
		confirmPassword: string
	): Promise<void>;
	// authValidationContainer(body: IAuth, keys: (keyof IAuth)[]): Promise<null>
}
