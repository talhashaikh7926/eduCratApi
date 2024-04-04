const express = require('express');
const Review = require('../models/reviewModel');
const User = require('../models/userModel');

exports.submitReview = async (req, res) => {
    const { courseId } = req.params; 
    const { rating, reviewText } = req.body;
    const studentId = req.user.id; 

    try {
        const newReview = new Review({
            course: courseId,
            student: studentId,
            rating,
            reviewText
        });

        await newReview.save();
        res.status(201).json({ message: 'Review submitted successfully', review: newReview });
    } catch (error) {
        res.status(500).json({ message: 'Error submitting review', error: error.message });
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
    const { courseId } = req.params;

    try {
        const reviews = await Review.find({ course: courseId })
            .populate('student', 'name')
            .exec();

        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching reviews', error: error.message });
    }
};