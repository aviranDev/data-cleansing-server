import mongoose, {Document, Schema} from 'mongoose';

// Define Mongoose schema and model
export interface IContact extends Document {
	company: string;
	service: string;
	contactName: string;
	email: string;
	phone: string;
	role: string;
	location: string;
	flour: number;
	room: number;
}

const schema = new Schema<IContact>({
	company: {type: String, required: true},
	service: {
		type: String,
		enum: ['agent', 'airline', 'transport'],
		default: 'agent',
		required: true,
	},
	contactName: {type: String, required: true},
	email: {type: String, required: true},
	phone: {
		type: String,
		required: true,
	},
	role: {
		type: String,
		required: true,
	},
	location: {type: String, required: true},
	flour: {type: Number, required: true},
	room: {type: Number, required: true},
});

const Contact = mongoose.model<IContact>('Contact', schema);

export default Contact;
