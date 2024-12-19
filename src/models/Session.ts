import mongoose, {Schema, model} from 'mongoose';
import {ISession} from '../types/sessionInterface';

/** Session Model
 *  Collection name: Session
 *  Schema: SessionSchema
 */
const SessionSchema = new Schema<ISession>({
	// Unique token associated with the user's session
	refreshToken: {
		type: String,
		required: true,
	},
	// Reference to the associated user (User model)
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true,
	},
	// Timestamp indicating the last login time of the session
	lastLogin: {
		type: Date,
		required: true,
	},
});

// Create a Mongoose model for the Session schema
const Session = model<ISession>('Session', SessionSchema);

export default Session;
