import mongoose from 'mongoose';

const teacherProfileSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  location: { type: String, required: true },
  description: { type: String, required: true },
  profilePhotoPath: { type: String, required: true },
  cardPhotoPath: { type: String, required: true },
}, { timestamps: true });

const TeacherProfile = mongoose.model('TeacherProfile', teacherProfileSchema);
export default TeacherProfile;