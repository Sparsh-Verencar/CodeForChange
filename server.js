import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import multer from 'multer'; // For file uploads
import path from 'path';
import Teacher from './Teacher.js'; // Adjust the path if needed
import dotenv from 'dotenv';

const app = express();
const PORT = process.env.PORT || 5000;
dotenv.config();

// Middleware
app.use(cors({
  origin: '*', // Allow all origins during development
  credentials: true,
}));
app.use(express.json()); // Parse JSON bodies


// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Failed to connect to MongoDB:', err));

// Configure Multer for file uploads
const profilePhotoUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/profile-photos/');
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname));
    },
  }),
});
const cardPhotoUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/card-photos/');
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname));
    },
  }),
});



// Serve uploaded files statically
app.use('/uploads', express.static('uploads'));

// API to handle file uploads
app.post(
  '/api/upload/profile-photo',
  profilePhotoUpload.single('profilePhoto'),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const filePath = `/uploads/profile-photos/${req.file.filename}`;
    res.json({ url: filePath });
  }
);

// Handle card photo uploads
app.post(
  '/api/upload/card-photo',
  cardPhotoUpload.single('cardPhoto'),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const filePath = `/uploads/card-photos/${req.file.filename}`;
    res.json({ url: filePath });
  }
);
app.get('/api/get-published-cards', async (req, res) => {
  try {
    const teachers = await Teacher.find({ "publishedCard": { $exists: true, $ne: null } });
    const publishedCards = teachers.flatMap(teacher => {
      if (teacher.publishedCard) {
        return {
          ...teacher.publishedCard._doc,
          profilePhoto: `${req.protocol}://${req.get('host')}${teacher.publishedCard.profilePhoto}`,
          cardPhoto: `${req.protocol}://${req.get('host')}${teacher.publishedCard.cardPhoto}`,
          name: teacher.publishedCard.name,
          specialization: teacher.publishedCard.specialization,
          courseName: teacher.publishedCard.courseName,
          courseLength: teacher.publishedCard.courseLength
        };
      }
      return [];
    });
    res.status(200).json(publishedCards);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch published cards', details: err });
  }
});

// API to save teacher data
app.post('/api/save-teacher', async (req, res) => {
  try {
    const { email, username, experience, subjects, profilePhotoPath } = req.body;

    const teacher = await Teacher.findOneAndUpdate(
      { email },
      { username, experience, subjects, profilePhotoPath },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json(teacher);
    
  } catch (err) {
    res.status(500).json({ error: 'Server error', message: err.message });
  }
});

// API to fetch teacher data
app.get('/api/get-teacher/:email', async (req, res) => {
  const { email } = req.params;

  try {
    const teacher = await Teacher.findOne({ email });
    if (teacher) {
      res.status(200).json(teacher);
    } else {
      res.status(404).json({ error: 'Teacher not found' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch teacher data' });
  }
});
// Save profile card details
app.post('/api/save-profile-card-details', async (req, res) => {
  try {
    const { email, cardDetails } = req.body;

    const teacher = await Teacher.findOneAndUpdate(
      { email },
      { profileCardDetails: cardDetails },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json(teacher.profileCardDetails);
  } catch (err) {
    res.status(500).json({ 
      error: 'Failed to save card details',
      message: err.message 
    });
  }
});

// Get profile card details
app.get('/api/get-profile-card-details/:email', async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ 
      email: req.params.email 
    }).select('profileCardDetails');

    res.status(200).json(teacher?.profileCardDetails || {});
  } catch (err) {
    res.status(500).json({ 
      error: 'Failed to fetch card details',
      message: err.message 
    });
  }
});
// Update the publish endpoint
app.post('/api/publish-card', async (req, res) => {
  try {
    const { email, cardDetails } = req.body;
    
    const teacher = await Teacher.findOneAndUpdate(
      { email },
      { 
        publishedCard: {
          name: cardDetails.name,
          specialization: cardDetails.specialization,
          courseName: cardDetails.courseName,
          courseLength: cardDetails.courseLength,
          photo: cardDetails.photo,
          subject: cardDetails.subject, 
          cardPhoto: cardDetails.cardPhoto
        }
      },
      { new: true, runValidators: true }
    );

    if (!teacher) return res.status(404).json({ error: 'Teacher not found' });
    res.json({ message: 'Card published successfully', card: teacher.publishedCard });
  } catch (err) {
    res.status(500).json({ 
      error: 'Publish failed',
      message: err.message 
    });
  }
});
// Notification endpoint
app.post('/api/notify-teacher', async (req, res) => {
  try {
    const { courseName, teacherName, studentId, studentName } = req.body;
    
    // Store in database
    const notification = await Notification.create({
      courseName,
      teacherName,
      studentId,
      studentName,
      timestamp: new Date()
    });

    res.status(200).json(notification);
  } catch (error) {
    res.status(500).json({ error: 'Failed to store notification' });
  }
});

// Get notifications endpoint
app.get('/api/get-notifications/:teacherEmail', async (req, res) => {
  try {
    const notifications = await Notification.find({
      teacherEmail: req.params.teacherEmail
    }).sort({ timestamp: -1 });
    
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});
app.post('/api/create-stripe-session', (req, res) => {
  // Mock response for development
  res.json({ id: 'cs_test_1234567890abcdefghijklmnopqrstuvwxyz' }); // Replace with a real session ID if needed
});

// Add trial materials
app.post('/api/publish-card', async (req, res) => {
  try {
    const { email, cardDetails } = req.body;
    
    const teacher = await Teacher.findOneAndUpdate(
      { email },
      { 
        publishedCard: {
          ...cardDetails,
          teacherEmail: email // Add teacher's email to published card
        }
      },
      { new: true, runValidators: true }
    );

    if (!teacher) return res.status(404).json({ error: 'Teacher not found' });
    res.json({ message: 'Card published successfully', card: teacher.publishedCard });
  } catch (err) {
    res.status(500).json({ 
      error: 'Publish failed',
      message: err.message 
    });
  }
});
// Get trial materials
app.get('/api/get-published-cards', async (req, res) => {
  try {
    const teachers = await Teacher.find({ "publishedCard": { $exists: true } });
    const publishedCards = teachers.map(teacher => ({
      ...teacher.publishedCard.toObject(),
      teacherEmail: teacher.email // Include teacher's actual email
    }));
    res.status(200).json(publishedCards);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch published cards' });
  }
});

// Add this route for saving trial materials
app.post('/api/save-trial-materials', async (req, res) => {
  const { email, trialMaterialLinks } = req.body;

  try {
    const teacher = await Teacher.findOneAndUpdate(
      { email },
      { trialMaterials: trialMaterialLinks }, // Assuming you have trialMaterials in your schema
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json(teacher);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save trial materials', message: err.message });
  }
});
app.get('/api/get-trial-materials/:courseId', async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const teacher = await Teacher.findOne({ 'publishedCard.courseName': courseId });

    if (!teacher) {
      return res.status(404).json({ error: 'Course not found' });
    }

    res.status(200).json(teacher.trialMaterials || []);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch trial materials', message: err.message });
  }
});
// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});