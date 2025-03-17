// models/User.js
import { Schema, model } from 'mongoose';

const userSchema = new Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  subjects: { type: [String], default: [] }, // Array of subjects
});

export default model('User', userSchema);