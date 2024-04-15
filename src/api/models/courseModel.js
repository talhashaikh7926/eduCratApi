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
  price: {
    type: Number,
    min: 0, 
    validate: {
      validator: function (value) {
        return !isNaN(value);
      },
      message: props => `${props.value} is not a valid price!`
    }
  },
  curriculum: [{
    title: String,
    items: [curriculumItemSchema]
  }],
  courseThumbnail: String,
  thumbnailUrl: String,
  videoUrl: String,
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

const Course = mongoose.model('Course', courseSchema);
module.exports = Course;
