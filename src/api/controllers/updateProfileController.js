const User = require('../models/userModel');
const path = require('path');
const bcrypt = require('bcryptjs');

exports.updateProfile = async (req, res, next) => {
    const { userId, firstName, lastName, address1, address2, phone, birthday, state, country, personalInfo } = req.body;
    let profilePicturePath = '';

    if (req.file) {
        profilePicturePath = req.file.filename;
        const profile = await User.findById(userId);
        if (!profile) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (userId) {
            try {
                const updatedUser = await User.findByIdAndUpdate(userId, {
                    firstName,
                    lastName,
                    address1,
                    address2,
                    birthday,
                    phone,
                    state,
                    country,
                    personalInfo,
                    profilePicture: profilePicturePath,
                }, { new: true }); // Return the updated user document

                res.status(200).json({ message: 'Profile updated successfully', updatedUser });
            } catch (error) {
                res.status(500).json({ message: 'Error updating profile', error: error.message });
            }
        }
        else {
            res.status(500).json({ message: 'User Id Required' });
        }
    }
}
exports.getProfile = async (req, res) => {
    const { userId } = req.body;
    if (userId) {
        try {
            const profile = await User.findById(userId);
            if (!profile) {
                return res.status(404).json({ message: 'User not found' });
            }
            let profilePictureFilename = profile.profilePicture ? path.basename(profile.profilePicture) : null;
            const profilePictureUrl = profilePictureFilename
                ? `${req.protocol}://${req.get('host')}/uploads/${profilePictureFilename}`
                : null;

            const profileData = {
                ...profile.toObject(),
                profilePictureUrl,
            };

            delete profileData.profilePicture;

            res.status(200).json({ data: profileData });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    } else {
        res.status(400).json({ message: 'User ID required' });
    }
};

exports.changePassword = async (req, res) => {
    const { userId, newPassword } = req.body;
    if (userId) {
        try {
            const profile = await User.findById(userId);
            if (!profile) {
                return res.status(404).json({ message: 'User not found' });
            }
            const hashedPassword = await bcrypt.hash(newPassword, 12);
            await User.findByIdAndUpdate(userId, { password: hashedPassword });
            res.status(200).json({ message: 'Password changed successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Error changing password', error: error.message });
        }
    }
    else {
        res.status(400).json({ message: 'User ID required' });
    }
};

exports.updateSocialProfile = async (req, res, next) => {
    const {twitter, instagram, facebook, linkedin } = req.body.socialLinks;
    const profile = await User.findById(req.body.userId);
    if (!profile) {
        return res.status(404).json({ message: 'User not found' });
    }
    console.log(twitter,'asda');
    if (profile) {
        try {
            const updatedUser = await User.findByIdAndUpdate(profile, {
                socialLinks: {
                    twitter: twitter,
                    instagram: instagram,
                    facebook: facebook,
                    linkedin: linkedin
                }
            }, { new: true }); // Return the updated user document

            res.status(200).json({ message: 'Social Profile updated successfully', updatedUser });
        } catch (error) {
            res.status(500).json({ message: 'Error updating social profile', error: error.message });
        }
    }
    else {
        res.status(500).json({ message: 'User Id Required' });
    }
}