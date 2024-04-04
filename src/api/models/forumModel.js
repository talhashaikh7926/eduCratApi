const mongoose = require('mongoose');

const forumTopicSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  startedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastPostedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subscribers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const ForumTopic = mongoose.model('ForumTopic', forumTopicSchema);
module.exports = ForumTopic;
