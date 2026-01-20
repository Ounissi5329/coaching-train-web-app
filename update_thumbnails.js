require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('./src/models/Course');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/coaching-platform';

const thumbnails = [
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80", // Professional Coaching
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80", // Team Collaboration
  "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=80", // Business Meeting
  "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&q=80"  // Online Learning
];

async function updateThumbnails() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const courses = await Course.find({});
    console.log(`Found ${courses.length} courses`);

    for (let i = 0; i < courses.length; i++) {
      const thumbnail = thumbnails[i % thumbnails.length];
      await Course.findByIdAndUpdate(courses[i]._id, { thumbnail });
      console.log(`Updated course: ${courses[i].title} with thumbnail: ${thumbnail}`);
    }

    console.log('All courses updated successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error updating thumbnails:', error);
    process.exit(1);
  }
}

updateThumbnails();