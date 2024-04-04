const User = require('../models/userModel');

exports.bookmarkCourse = async (req, res) => {
    const { courseId } = req.params;
    const studentId = req.user.id; 
  
    try {
      
      const updatedUser = await User.findByIdAndUpdate(studentId, {
        $addToSet: { bookmarks: courseId }
      }, { new: true }).populate('bookmarks');
  
      res.status(200).json({ message: 'Course bookmarked successfully', bookmarks: updatedUser.bookmarks });
    } catch (error) {
      res.status(500).json({ message: 'Error bookmarking course', error: error.message });
    }
  };


  exports.removeBookmark = async (req, res) => {
    const { courseId } = req.params;
    const studentId = req.user.id;
  
    try {
     
      const updatedUser = await User.findByIdAndUpdate(studentId, {
        $pull: { bookmarks: courseId }
      }, { new: true }).populate('bookmarks');
  
      res.status(200).json({ message: 'Course unbookmarked successfully', bookmarks: updatedUser.bookmarks });
    } catch (error) {
      res.status(500).json({ message: 'Error removing bookmark', error: error.message });
    }
  };



  exports.getBookmarkedCourses = async (req, res) => {
    const studentId = req.user.id;
  
    try {
    
      const userWithBookmarks = await User.findById(studentId).populate('bookmarks');
  
      if (!userWithBookmarks) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      res.status(200).json({ bookmarks: userWithBookmarks.bookmarks });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching bookmarked courses', error: error.message });
    }
  };