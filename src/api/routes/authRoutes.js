const express = require('express');
const { signUp, login } = require('../controllers/authController');
const { updateProfile, getProfile, changePassword, updateSocialProfile } = require('../controllers/updateProfileController');
const { jwtMiddleware } = require('../middlewares/authMiddleware');
const { upload } = require('../helpers/multerConfig');
const { createCourse, getAllCourses, getCoursesById } = require('../controllers/courseController');
const { enrollInCourse,getEnrolledCourses } = require('../controllers/enrollmentController');
const { getReviewsForCourse, respondToReview, submitReview } = require('../controllers/reviewController');
const { bookmarkCourse, removeBookmark, getBookmarkedCourses } = require('../controllers/bookmarkController');
const { createTopic, toggleSubscribeTopic, deleteTopic } = require('../controllers/forumController');
const { getTeacherDashboard,getAdminDashboard } = require('../controllers/dashboardsController');

const router = express.Router();

router.post('/signup', signUp);
router.post('/login', login);


/////////////Update Profile//////////////
router.post('/updateProfile', jwtMiddleware, upload.single('profilePicture'), updateProfile)
router.get('/getProfile', jwtMiddleware, getProfile)
router.post('/changePassword', jwtMiddleware, changePassword)
router.post('/updateSocialProfile', jwtMiddleware, updateSocialProfile)




////////Course///////////////////////
router.post('/createCourse', jwtMiddleware, upload.fields([
    { name: 'courseThumbnail', maxCount: 1 },
    { name: 'videoThumbnail', maxCount: 1 }
]), createCourse);
router.get('/courses', getAllCourses)
router.get('/coursesbyId/:courseId', jwtMiddleware, getCoursesById)
router.post('/enroll/:courseId', jwtMiddleware, enrollInCourse)
router.get('/enroll' ,jwtMiddleware,getEnrolledCourses)

////////////Reviews ///////////////////
router.post('/courses/:courseId/reviews', jwtMiddleware, submitReview);
router.post('/reviews/:reviewId/respond', jwtMiddleware, respondToReview);
router.get('/courses/:courseId/reviews', getReviewsForCourse);


/////////Bookmark Course ////////////////////////
router.post('/courses/:courseId/bookmark', jwtMiddleware, bookmarkCourse);
router.delete('/courses/:courseId/bookmark', jwtMiddleware, removeBookmark);
router.get('/my/bookmarks', jwtMiddleware, getBookmarkedCourses);


/////////Forum Topic ////////////////
router.post('/forum/topics', jwtMiddleware, createTopic);
router.post('/forum/topics/:topicId/subscribe', jwtMiddleware, toggleSubscribeTopic);
router.delete('/forum/topics/:topicId', jwtMiddleware, deleteTopic);


/////////Dashboard ///////////
router.get('/dashboard/teacher', jwtMiddleware, getTeacherDashboard);
router.get('/dashboard/admin', jwtMiddleware,getAdminDashboard)

module.exports = router;
