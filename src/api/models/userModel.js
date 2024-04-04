const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    username: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        required: true,
        enum: ['student', 'teacher', 'admin'],
    },
    bookmarks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
      }],
    firstName: {type: String},
    lastname: {type: String},
    phone: {type: String},
    personalInfo: {type: String},
    profilePicture: {type: String},
    state: {type: String},
    country: {type: String},
    address1: {type: String},
    address2: {type: String},
    birthday: {type: String},
    socialLinks: {
        twitter: String,
        instagram: String,
        facebook: String,
        linkedin: String
      }


});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

module.exports = mongoose.model('User', userSchema);
