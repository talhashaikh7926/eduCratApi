const express = require('express');
const Course = require('../models/courseModel');
const User = require('../models/userModel');
const mongoose = require('mongoose');
const router = express.Router();
const path = require('path');

exports.createCourse = async (req, res) => {
    try {
        const {
            title, shortDescription, courseDescription, whatWillStudentLearn,
            requirements, level, audioLanguage, closeCaption, category, curriculum, videoUrl, price
        } = req.body;
        const profile = await User.findById(req.user.id);
        if (!profile) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (req.files) {
            const teacherId = req.user.id;
            // Convert curriculum JSON string into an object
            const curriculumItems = JSON.parse(curriculum);
            const courseThumbnailPath = req.files.courseThumbnail ? req.files.courseThumbnail[0].filename : undefined;
            const videoThumbnailPath = req.files.thumbnailUrl ? req.files.thumbnailUrl[0].filename : undefined;
            const newCourse = await Course.create({
                title,
                shortDescription,
                courseDescription,
                whatWillStudentLearn,
                requirements,
                level,
                price,
                audioLanguage,
                closeCaption: closeCaption === 'true',
                category,
                curriculum: curriculumItems, // Curriculum is already in the desired format
                courseThumbnail: courseThumbnailPath,
                thumbnailUrl: videoThumbnailPath,

                teacher: teacherId
            });
            res.status(201).json({ message: 'Course created successfully', course: newCourse });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error creating course', error: error.message });
    }
};

exports.getAllCourses = async (req, res) => {
    try {
        const courses = await Course.aggregate([
            {
                $lookup: {
                    from: 'users',
                    localField: 'teacher',
                    foreignField: '_id',
                    as: 'teacherInfo'
                }
            },
            {
                $unwind: '$teacherInfo'
            },
            {
                $project: {
                    _id: 1,
                    title: 1,
                    shortDescription: 1,
                    courseDescription: 1,
                    whatWillStudentLearn: 1,
                    requirements: 1,
                    level: 1,
                    audioLanguage: 1,
                    closeCaption: 1,
                    category: 1,
                    curriculum: 1,
                    price: 1,
                    courseThumbnailUrl: {
                        $cond: {
                            if: { $ne: ['$courseThumbnail', null] },
                            then: { $concat: [`${req.protocol}://${req.get('host')}/Images/`, '$courseThumbnail'] },
                            else: null
                        }
                    },
                    videoThumbnailUrl: {
                        $cond: {
                            if: { $ne: ['$thumbnailUrl', null] },
                            then: { $concat: [`${req.protocol}://${req.get('host')}/Images/`, '$thumbnailUrl'] },
                            else: null
                        }
                    },
                    teacher: {
                        _id: '$teacherInfo._id',

                        firstName: '$teacherInfo.firstName',
                        lastName: '$teacherInfo.lastName',
                        profilePictureUrl: {
                            $cond: {
                                if: { $ne: ['$teacherInfo.profilePicture', null] },
                                then: { $concat: [`${req.protocol}://${req.get('host')}/Images/`, '$teacherInfo.profilePicture'] },
                                else: null
                            }
                        }
                    }
                }
            }
        ]);

        res.status(200).json(courses);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching courses', error: error.message });
    }

};

exports.getCoursesById = async (req, res) => {
    const { courseId } = req.body;
    const course_id = await Course.findById(courseId);
    if (!course_id) {
        return res.status(404).json({ message: 'Course not found' });
    }
    try {
        const course = await Course.aggregate([
            {
                $match: { _id: new mongoose.Types.ObjectId(courseId) }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'teacher',
                    foreignField: '_id',
                    as: 'teacherInfo'
                }
            },
            {
                $unwind: '$teacherInfo'
            },
            {
                $lookup: {
                    from: 'enrollments',
                    localField: '_id',
                    foreignField: 'course',
                    as: 'enrollments'
                }
            },
            {
                $lookup: {
                    from: 'reviews',
                    localField: '_id',
                    foreignField: 'course',
                    as: 'reviews'
                }
            },
            {
                $addFields: {
                    enrollmentLength: { $cond: { if: { $isArray: '$enrollments' }, then: { $size: '$enrollments' }, else: 0 } },
                    teacherTotalCourses: { $size: { $ifNull: ['$teacherInfo.courses', []] } },
                    reviewsLength: { $cond: { if: { $isArray: '$reviews' }, then: { $size: '$reviews' }, else: 0 } }
                }
            },
            {
                $project: {
                    _id: 1,
                    title: 1,
                    shortDescription: 1,
                    courseDescription: 1,
                    whatWillStudentLearn: 1,
                    requirements: 1,
                    level: 1,
                    audioLanguage: 1,
                    closeCaption: 1,
                    category: 1,
                    curriculum: 1,
                    price: 1,
                    courseThumbnailUrl: {
                        $cond: {
                            if: { $ne: ['$courseThumbnail', null] },
                            then: { $concat: [`${req.protocol}://${req.get('host')}/Images/`, '$courseThumbnail'] },
                            else: null
                        }
                    },
                    videoThumbnailUrl: {
                        $cond: {
                            if: { $ne: ['$videoThumbnail.thumbnailUrl', null] },
                            then: { $concat: [`${req.protocol}://${req.get('host')}/Images/`, '$videoThumbnail.thumbnailUrl'] },
                            else: null
                        }
                    },
                    teacher: {
                        _id: '$teacherInfo._id',
                        firstName: '$teacherInfo.firstName',
                        lastName: '$teacherInfo.lastName',
                        personalInfo: '$teacherInfo.personalInfo',
                        profilePictureUrl: {
                            $cond: {
                                if: { $ne: ['$teacherInfo.profilePicture', null] },
                                then: { $concat: [`${req.protocol}://${req.get('host')}/Images/`, '$teacherInfo.profilePicture'] },
                                else: null
                            }
                        }
                    },
                    enrollmentLength: 1,
                    teacherTotalCourses: 1,
                    reviewsLength: 1
                }
            }
        ]);

        if (!course || course.length === 0) {
            return res.status(404).json({ message: 'Course not found' });
        }

        res.status(200).json(course[0]); // Assuming only one course is returned

    } catch (error) {
        res.status(500).json({ message: 'Error fetching course', error: error.message });
    }

};
