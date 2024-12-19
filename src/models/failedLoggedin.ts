import mongoose, {Schema, Document} from 'mongoose';

// Define interface for FailedLoginAttempt document
interface FailedLoginAttemptDocument extends Document {
	ip: string;
	counter: number;
	lockTime?: number;
}

// Define schema for FailedLoginAttempt collection
const FailedLoginAttemptSchema: Schema = new Schema({
	ip: {type: String, required: true},
	counter: {type: Number, required: true, default: 0},
	lockTime: {type: Number}, // Optional field for lock time
});

// Create and export Mongoose model for FailedLoginAttempt
const FailedLoginAttempt = mongoose.model<FailedLoginAttemptDocument>(
	'FailedLoginAttempt',
	FailedLoginAttemptSchema
);

export default FailedLoginAttempt;
