const express = require('express');
const Review = require('../models/reviewModel');
const User = require('../models/userModel');
const Course = require('../models/courseModel');
const mongoose = require('mongoose');

exports.submitReview = async (req, res) => {
    const { rating, title, comment, courseIds, userId } = req.body;

    try {
        const existingReview = await Review.findOne({ course: courseIds, student: userId });
        if (existingReview) {
            return res.status(400).json({ message: 'You have already submitted a review for this course' });
        }
        const newReview = new Review({
            course: courseIds,
            student: userId,
            title: title,
            reviewText: comment,
            rating: rating
        });

        await newReview.save();
        return res.status(201).json({ message: 'Review submitted successfully', review: newReview });
    } catch (error) {
        return res.status(500).json({ message: 'Error submitting review', error: error.message });
    }
};


exports.respondToReview = async (req, res) => {
    const { reviewId } = req.params;
    const { responseText } = req.body;
    const teacherId = req.user.id;
    try {
        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        review.teacherResponse = {
            teacher: teacherId,
            text: responseText,
            respondedOn: new Date()
        };

        await review.save();
        res.status(200).json({ message: 'Response to review added successfully', review });
    } catch (error) {
        res.status(500).json({ message: 'Error responding to review', error: error.message });
    }
};

exports.getReviewsForCourse = async (req, res) => {
    const { courseId } = req.body;

    try {
        if (!courseId) {
            return res.status(400).json({ message: 'CourseId is required' });
        }

        const aggregatedReviews = await Review.aggregate([
            {
                $match: { course: new mongoose.Types.ObjectId(courseId) }

            },
            {
                $lookup: {
                    from: "users",
                    localField: "student",
                    foreignField: "_id",
                    as: "studentInfo"
                }
            },
            {
                $project: {
                    _id: 1,
                    rating: 1,
                    title: 1,
                    reviewText: 1,
                    teacherResponse: 1,
                    reviewDate: 1,
                    studentFirstName: { $arrayElemAt: ["$studentInfo.firstName", 0] },
                    studentLastName: { $arrayElemAt: ["$studentInfo.lastName", 0] },
                    profilePictureUrl: {
                        $cond: {
                            if: { $ne: ["$studentInfo.profilePicture", null] },
                            then: { $concat: [`${req.protocol}://${req.get('host')}/Images/`, { $arrayElemAt: ["$studentInfo.profilePicture", 0] }] },
                            else: null
                        }
                    }
                }
            }
        ]);

        // Return the aggregated reviews
        res.status(200).json(aggregatedReviews);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching reviews', error: error.message });
    }
};

exports.getTeacherCourseReviews = async (req, res) => {
    const { teacherId } = req.body;
    if (!teacherId) {
        return res.status(403).json({ message: 'User Not Found' });
    }
    try {
        const courses = await Course.find({ teacher: teacherId });

        const courseIds = courses.map(course => course._id);

        const reviews = await Review.aggregate([
            {
                $match: { course: { $in: courseIds } }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'student',
                    foreignField: '_id',
                    as: 'studentInfo'
                }
            },
            {
                $unwind: '$studentInfo'
            },
            {
                $project: {
                    _id: 1,
                    rating: 1,
                    title: 1,
                    reviewText: 1,
                    reviewDate: 1,
                    studentFirstName: '$studentInfo.firstName',
                    studentLastName: '$studentInfo.lastName',
                    profilePictureUrl: {
                        $cond: {
                            if: { $ne: ['$studentInfo.profilePicture', null] },
                            then: { $concat: [`${req.protocol}://${req.get('host')}/Images/`, '$studentInfo.profilePicture'] },
                            else: null
                        }
                    }
                }
            }
        ]);

        res.status(200).json({ reviews });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching reviews', error: error.message });
    }
};

exports.getAllTeachersData = async (req, res) => {
    try {
        const teachers = await User.aggregate([
            {
                $match: { role: 'teacher' } // Assuming 'teacher' is the role for teachers
            },
            {
                $lookup: {
                    from: 'courses',
                    localField: '_id',
                    foreignField: 'teacher',
                    as: 'courses'
                }
            },
            {
                $addFields: {
                    courseIds: '$courses._id' // Extracting courseIds from courses array
                }
            },
            {
                $lookup: {
                    from: 'reviews',
                    localField: 'courseIds',
                    foreignField: 'course',
                    as: 'reviews'
                }
            },
            {
                $unwind: '$reviews' // Unwind reviews array to calculate average rating for each review
            },
            {
                $group: {
                    _id: '$_id',
                    email: { $first: '$email' },
                    username: { $first: '$username' },
                    role: { $first: '$role' },
                    firstName: { $first: '$firstName' },
                    lastName: { $first: '$lastName' },
                    phone: { $first: '$phone' },
                    personalInfo: { $first: '$personalInfo' },
                    profilePicture: {
                        $first: {
                            $cond: {
                                if: { $ne: ['$profilePicture', null] },
                                then: { $concat: [`${req.protocol}://${req.get('host')}/Images/`, '$profilePicture'] },
                                else: null
                            }
                        }
                    },

                    state: { $first: '$state' },
                    country: { $first: '$country' },
                    address1: { $first: '$address1' },
                    address2: { $first: '$address2' },
                    birthday: { $first: '$birthday' },
                    socialLinks: { $first: '$socialLinks' },
                    totalCourses: { $sum: 1 }, // Count the total number of courses
                    totalEnrollments: { $sum: 1 }, // Count the total number of enrollments
                    averageRating: { $avg: '$reviews.rating' } // Calculate the average rating from reviews
                }
            }
        ]);

        res.status(200).json({ teachers });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching teachers data', error: error.message });
    }
};

