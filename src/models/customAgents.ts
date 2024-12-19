import mongoose, {Document, Schema} from 'mongoose';

// Define Mongoose schema and model
export interface ICustomAgent extends Document {
	agent: string;
	contactName: string;
	email: string;
	phone: string;
	role: string;
}

const schema = new Schema<ICustomAgent>({
	agent: {type: String, required: true},
	contactName: {type: String, required: true},
	email: {type: String, required: true},
	phone: {
		type: String,
		minlength: 9,
		maxlength: 9,
		required: true,
	},
	role: {
		type: String,
		required: true,
	},
});

const CustomAgent = mongoose.model<ICustomAgent>('CustomAgent', schema);

export default CustomAgent;
