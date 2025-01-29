import {Schema, model} from 'mongoose';
import {IUser} from '../types/userInterface';

const userSchema = new Schema<IUser>({
	username: {
		type: String,
		required: true,
		unique: true, // Ensure usernames are unique
		trim: true, // Trim whitespace
		match: /^[a-zA-Z0-9]{6}$/,
	},
	password: {
		type: String,
		required: true,
		minlength: 6,
		maxlength: 255,
	},
	email: {type: String, required: true, unique: true},
	isVerified: {type: Boolean, default: false},
	verificationCode: {type: String, default: ''},
	role: {
		type: String,
		enum: ['employee', 'admin', 'superAdmin'],
		default: 'employee',
		required: true,
	},
	resetPassword: {
		type: Boolean,
		default: false,
	},
	failedLoginAttempts: {
		type: Number,
		default: 0,
	},
	accountLocked: {
		type: Boolean,
		default: false,
	},
	lastFailedLoginDate: {
		type: Date,
		default: null,
	},
	createdAt: {
		type: Date,
		default: Date.now(),
	},
});

const UserModel = model('User', userSchema);

export default UserModel;
