const express = require('express');
const Course = require('../models/courseModel');
const User = require('../models/userModel');
const router = express.Router();
const path = require('path');

exports.createCourse = async (req, res) => {
    try {
        const {
            title, shortDescription, courseDescription, whatWillStudentLearn,
            requirements, level, audioLanguage, closeCaption, category, curriculum, videoUrl
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
            const videoThumbnailPath = req.files.videoThumbnail ? req.files.videoThumbnail[0].filename : undefined;
            const newCourse = await Course.create({
                title,
                shortDescription,
                courseDescription,
                whatWillStudentLearn: whatWillStudentLearn,
                requirements: requirements,
                level,
                audioLanguage,
                closeCaption: closeCaption === 'true',
                category,
                curriculum: curriculumItems,
                courseThumbnail: courseThumbnailPath,
                videoThumbnail: {
                    thumbnailUrl: videoThumbnailPath,
                    videoUrl
                },
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
        const courses = await Course.find({});
        res.status(200).json(courses);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching courses', error: error.message });
    }
};

exports.getCoursesById = async (req, res) => {
    const { courseId } = req.params;
    const profile = await User.findById(req.user.id);
    if (!profile) {
        return res.status(404).json({ message: 'User not found' });
    }
    try {
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        res.status(200).json(course);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching course', error: error.message });
    }
};
