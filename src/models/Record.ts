import mongoose, {Document, Schema} from 'mongoose';

// Define Mongoose schema and model
interface IRecord extends Document {
	name: string;
	age: number;
	email: string;
}

const recordSchema = new Schema<IRecord>({
	name: {type: String, required: true},
	age: {type: Number, required: true},
	email: {type: String, required: true},
});

const Record = mongoose.model<IRecord>('Record', recordSchema);

export default Record;
