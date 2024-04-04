const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  saleDate: {
    type: Date,
    default: Date.now,
  },
  amount: {
    type: Number,
    required: true,
  }
});

module.exports = mongoose.model('Sale', saleSchema);
