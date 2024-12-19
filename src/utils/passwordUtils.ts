import bcryptjs from 'bcryptjs';

const generateSalt = (saltRounds: number): string => {
	return bcryptjs.genSaltSync(saltRounds);
};

const hashPassword = async (
	password: string,
	salt: string
): Promise<string> => {
	return bcryptjs.hash(password, salt);
};

export {generateSalt, hashPassword};
