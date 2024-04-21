const User = require('../models/userModel');
const Course = require('../models/courseModel');
const Sale = require('../models/saleModel');
const Enrollment = require('../models/enrollmentModel');

exports.getTeacherDashboard = async (req, res) => {
    const { teacherId } = req.body;

    try {
        // Retrieve recent courses regardless of the teacher
        const recentCourses = await Course.find().sort({ createdAt: -1 }).limit(5);

        // Retrieve 5 popular teachers
        const popularTeachers = await User.find({ role: 'teacher' }).limit(5);

        // Retrieve the teacher's profile
        const teacherProfile = await User.findById(teacherId);

        // Retrieve all courses taught by the teacher
        const courses = await Course.find({ teacher: teacherId });

        // Calculate total sales for the courses
        const sales = await Sale.aggregate([
            { $match: { course: { $in: courses.map(course => course._id) } } },
            { $group: { _id: null, totalSales: { $sum: '$amount' } } }
        ]);

        // Calculate total students for the courses
        const totalStudents = await Enrollment.distinct('student', { course: { $in: courses.map(course => course._id) } }).count();

        res.json({
            name: teacherProfile.firstName + " " + teacherProfile.lastName,
            email: teacherProfile.email,
            profilePicture: teacherProfile.profilePicture ? `${req.protocol}://${req.get('host')}/Images/${teacherProfile.profilePicture}` : null,
            profileViews: teacherProfile.profileViews,
            totalCourses: courses.length,
            totalSales: sales.length > 0 ? sales[0].totalSales : 0,
            totalStudents,
            recentCourses: recentCourses.map(course => ({
                _id: course._id,
                title: course.title,
                shortDescription: course.shortDescription,
                courseDescription: course.courseDescription,
                whatWillStudentLearn: course.whatWillStudentLearn,
                requirements: course.requirements,
                level: course.level,
                audioLanguage: course.audioLanguage,
                closeCaption: course.closeCaption,
                category: course.category,
                curriculum: course.curriculum,
                price: course.price,
                courseThumbnailUrl: course.courseThumbnail ? `${req.protocol}://${req.get('host')}/Images/${course.courseThumbnail}` : null,
                videoThumbnailUrl: course.videoThumbnail ? (course.videoThumbnail.thumbnailUrl ? `${req.protocol}://${req.get('host')}/Images/${course.videoThumbnail.thumbnailUrl}` : null) : null
            })),
            popularTeachers: await Promise.all(popularTeachers.map(async (teacher) => {
                // Find courses taught by the current teacher
                const teacherCourses = await Course.find({ teacher: teacher._id });

                // Calculate total enrolled students for the teacher's courses
                const totalEnrolledStudents = await Enrollment.distinct('student', { course: { $in: teacherCourses.map(course => course._id) } }).count();

                return {
                    _id: teacher._id,
                    firstName: teacher.firstName,
                    lastName: teacher.lastName,
                    personalInfo: teacher.personalInfo,
                    profilePictureUrl: teacher.profilePicture ? `${req.protocol}://${req.get('host')}/Images/${teacher.profilePicture}` : null,
                    totalCourses: teacherCourses.length,
                    totalEnrolledStudents,
                };
            }))
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching teacher data', error: error.message });
    }


};

exports.getAdminDashboard = async (req, res) => {
    const { admin } = req.body;
    try {
        const profile = await User.findById(admin);
        if (!profile) {
            return res.status(404).json({ message: 'User not found' });
        }
        const totalStudents = await User.countDocuments({ role: 'student' });
        const totalTeachers = await User.countDocuments({ role: 'teacher' });
        const totalCourses = await Course.countDocuments({});
        const totalSales = await Sale.aggregate([
            {
                $group: {
                    _id: null,
                    totalSales: { $sum: '$amount' } // Assuming the field storing the sales amount is 'salesAmount'
                }
            }
        ]);

        const teachers = await User.find({ role: 'teacher' });

        const recentCourses = await Course.find({})
            .sort({ createdAt: -1 })
            .limit(10)
            .select('title courseThumbnail teacher -_id')
            .populate('teacher', 'firstName lastname profilePicture -_id');

        res.status(200).json({
            totalStudents,
            totalTeachers,
            totalCourses,
            totalSales: totalSales.length > 0 ? totalSales[0].totalSales : 0,
            teachers,
            recentCourses
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching admin dashboard data', error: error.message });
    }
};

