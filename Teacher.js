// models/Teacher.js
import { Schema, model } from 'mongoose';

const courseSchema = new Schema({
  courseName: { type: String, required: true }, // Name of the course
  chapters: { type: [String], required: true }, // Array of chapters
});

const subjectSchema = new Schema({
  subjectName: { type: String, required: true }, // Name of the subject
  courses: { type: [courseSchema], required: true }, // Array of courses
});



const cardDetailsSchema = new Schema({
  name: { type: String, required: [true, 'Name is required'] },
  specialization: { type: String, required: [true, 'Specialization is required'] },
  subject: { type: String, required: [true, 'Subject is required'] }, // Add this
  courseName: { type: String, required: [true, 'Course name is required'] },
  courseLength: { type: String, required: [true, 'Course length is required'] },
  photo: { type: String, required: [true, 'Profile photo is required'] },
  cardPhoto: { type: String, required: [true, 'Card photo is required'] },
  email: { type: String, required: [true, 'Email is required'] }, // Add this
  phoneNumber: { type: String, required: [true, 'Phone Number is required'] }, // Add this
  location: { type: String, required: [true, 'Location is required'] }, // Add this
}, { _id: false });
  // Rest of your schema remains the same
const teacherSchema = new Schema({
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    experience: { type: String, required: true },
    subjects: { type: [subjectSchema], required: true },
    profilePhotoPath: { type: String, required: true },
    profileCardDetails: { type: cardDetailsSchema, required: false },
    publishedCard: { type: cardDetailsSchema, required: false }, // Add this field
    trialMaterials: { type: Array }, // Add this field
  });


export default model('Teacher', teacherSchema);