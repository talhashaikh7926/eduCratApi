const mongoose = require('mongoose');

const curriculumItemSchema = new mongoose.Schema({
  article: String,
  videoUrl: String,
});

const courseSchema = new mongoose.Schema({
  title: String,
  shortDescription: String,
  courseDescription: String,
  whatWillStudentLearn: String,
  requirements: String,
  level: String, 
  audioLanguage: String,
  closeCaption: Boolean,
  category: String,
  curriculum: [curriculumItemSchema],
  courseThumbnail: String, 
  videoThumbnail: { 
    thumbnailUrl: String, 
    videoUrl: String 
  },
  teacher: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }
});

const Course = mongoose.model('Course', courseSchema);
module.exports = Course;
