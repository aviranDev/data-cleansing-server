declare global {
	namespace NodeJS {
		interface ProcessEnv {
			NODE_ENV: string;
			DB_URI: string;
			JWT_SECRET: string;
			SERVER_PORT: string;
			SALT: string;
			ACCESS_TOKEN_SECRET: string;
			REFRESH_TOKEN_SECRET: string;
			ACCESS_TOKEN_EXPIRE: string;
			REFRESH_TOKEN_EXPIRE: string;
		}
	}

	namespace Express {
		interface Request {
			user?: {
				_id: string;
				username: string;
				role: string;
				resetPassword?: boolean;
			};
		}
	}
}
