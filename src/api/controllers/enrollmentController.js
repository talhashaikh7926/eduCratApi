const express = require('express');
const Course = require('../models/courseModel');
const Enrollment = require('../models/enrollmentModel');
const User = require('../models/userModel');
const Sale = require('../models/saleModel');

exports.enrollInCourses = async (req, res) => {
    const { courseIds,
        firstName,
        lastName,
        company,
        country,
        address,
        apartment,
        city,
        state,
        zip,
        phone,
        email,
        notes,

    } = req.body;
    const { studentId } = req.body;
    const parsedCourseObjects = JSON.parse(req.body.courseObjects);
    try {
        const enrollments = [];
        const sales = [];

        for (const courseObj of parsedCourseObjects) {
            const { course: courseId, price } = courseObj;

            const courseExists = await Course.findById(courseId);
            if (!courseExists) {
                return res.status(404).json({ message: `Course with ID ${courseId} not found` });
            }

            const existingEnrollment = await Enrollment.findOne({ course: courseId, student: studentId });
            if (existingEnrollment) {
                return res.status(404).json({ message: `Student ${studentId} is already enrolled in course ${courseId}` });
            }

            const enrollment = await Enrollment.create({
                course: courseId,
                student: studentId,
                firstName: firstName,
                lastName: lastName,
                company: company,
                country: country,
                address: address,
                apartment: apartment,
                city: city,
                state: state,
                zip: zip,
                phone: phone,
                email: email,
                notes: notes,
            });
            enrollments.push(enrollment);

            const sale = await Sale.create({
                course: courseId,
                student: studentId,
                amount: price,
            });
            sales.push(sale);

            console.log(`Enrolled student ${studentId} in course ${courseId} with price ${price}`);
        }

        res.status(200).json({ message: 'Enrollment and sale records created successfully', enrollments, sales });
    } catch (error) {
        console.error("Error enrolling in courses:", error);
        res.status(500).json({ message: 'Error enrolling in courses', error: error.message });
    }

};




exports.getEnrolledCourses = async (req, res) => {
    const { studentId } = req.body;
    try {
        const enrollments = await Enrollment.find({ student: studentId }).populate('course').exec();

        if (enrollments.length === 0) {
            return res.status(404).json({ message: 'No enrolled courses found for the student.' });
        }
        const enrolledCourses = [];
        for (const enrollment of enrollments) {
            const courseId = enrollment.course._id;
            const course = await Course.aggregate([
                {
                    $match: { _id: courseId }
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
            if (!course || course.length === 0) {
                console.error(`Course with ID ${courseId} not found`);
                continue; // Skip to the next enrollment
            }
            enrolledCourses.push(course[0]); // Assuming only one course is returned
        }

        res.status(200).json(enrolledCourses);
    } catch (error) {
        console.error("Error fetching enrolled courses:", error);
        res.status(500).json({ message: 'Error fetching enrolled courses', error: error.message });
    }
};