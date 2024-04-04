const express = require('express');
const Course = require('../models/courseModel');
const Enrollment = require('../models/enrollmentModel');
const User = require('../models/userModel');
const Sale = require('../models/saleModel');

exports.enrollInCourse = async (req, res) => {
    const { courseId } = req.params;
    const studentId = req.user.id;

    try {
        const courseExists = await Course.findById(courseId);
        if (!courseExists) {
            return res.status(404).json({ message: 'Course not found' });
        }
        const existingEnrollment = await Enrollment.findOne({ course: courseId, student: studentId });
        if (existingEnrollment) {
            return res.status(400).json({ message: 'Student is already enrolled in this course' });
        }

       
        const enrollment = await Enrollment.create({
            course: courseId,
            student: studentId
        });

      
       // const coursePrice = course?.price; 


        const sale = await Sale.create({
            course: courseId,
            student: studentId,
            amount: 155 
        });

        
        res.status(201).json({ message: 'Enrollment and sale record successful', enrollment, sale });
    } catch (error) {
        res.status(500).json({ message: 'Error enrolling in course', error: error.message });
    }
};



exports.getEnrolledCourses = async (req, res) => {
    const studentId = req.user.id;

    try {

        const enrollments = await Enrollment.find({ student: studentId })
            .populate('course')
            .exec();
        if (enrollments.length === 0) {

            return res.status(404).json({ message: 'No enrolled courses found for the student.' });
        }


        //const enrolledCourses = enrollments.map(enrollment => enrollment.course);

        res.status(200).json(enrollments);
    } catch (error) {
        console.error(error); // Logging the error can help in debugging
        res.status(500).json({ message: 'Error fetching enrolled courses', error: error.message });
    }
};