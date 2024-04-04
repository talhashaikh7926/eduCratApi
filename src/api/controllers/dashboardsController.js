const User = require('../models/userModel');
const Course = require('../models/courseModel');
const Sale = require('../models/saleModel');
const Enrollment = require('../models/enrollmentModel');

exports.getTeacherDashboard = async (req, res) => {
    const teacherId = req.user.id;

    try {

        const teacherProfile = await User.findById(teacherId);
        const courses = await Course.find({ teacher: teacherId });
        const sales = await Sale.aggregate([
            { $match: { course: { $in: courses.map(course => course._id) } } },
            { $group: { _id: null, totalSales: { $sum: '$amount' } } }
        ]);


        const totalStudents = await Enrollment.distinct('student', { course: { $in: courses.map(course => course._id) } }).count();

        res.json({
            name: teacherProfile.name,
            profilePicture: teacherProfile.profilePicture,
            profileViews: teacherProfile.profileViews,
            totalCourses: courses.length,
            totalSales: sales.length > 0 ? sales[0].totalSales : 0,
            totalStudents,
            courses: courses,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching teacher dashboard data', error: error.message });
    }
};

exports.getAdminDashboard = async (req, res) => {
    try {
        const profile = await User.findById(req.user.id);
        if (!profile) {
            return res.status(404).json({ message: 'User not found' });
        }
        const totalStudents = await User.countDocuments({ role: 'student' });
        const totalTeachers = await User.countDocuments({ role: 'teacher' });
        const totalCourses = await Course.countDocuments({});
        const totalSales = await Sale.countDocuments({});


        const teachers = await User.find({ role: 'teacher' }, 'firstName lastname profilePicture');


        const recentCourses = await Course.find({})
            .sort({ createdAt: -1 })
            .limit(10)
            .select('title courseThumbnail teacher -_id')
            .populate('teacher', 'firstName lastname profilePicture -_id');

        res.status(200).json({
            totalStudents,
            totalTeachers,
            totalCourses,
            totalSales,
            teachers,
            recentCourses
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching admin dashboard data', error: error.message });
    }
};
