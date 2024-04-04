const ForumTopic = require('../models/forumModel')
const User = require('../models/userModel')


exports.createTopic = async (req, res) => {
    const { title, description } = req.body;
    const userId = req.user.id; 
  
    try {
      const newTopic = new ForumTopic({
        title,
        description,
        startedBy: userId,
        lastPostedBy: userId
      });
  
      await newTopic.save();
      res.status(201).json({ message: 'Forum topic created successfully', topic: newTopic });
    } catch (error) {
      res.status(500).json({ message: 'Error creating forum topic', error: error.message });
    }
  };


  exports.toggleSubscribeTopic = async (req, res) => {
    const { topicId } = req.params;
    const userId = req.user.id;
  
    try {
      const topic = await ForumTopic.findById(topicId);
      if (!topic) {
        return res.status(404).json({ message: 'Topic not found' });
      }
  
      const isSubscribed = topic.subscribers.includes(userId);
      if (isSubscribed) {
        topic.subscribers.pull(userId);
      } else {
        
        topic.subscribers.push(userId);
      }
  
      await topic.save();
      res.status(200).json({ message: `User has been ${isSubscribed ? 'unsubscribed' : 'subscribed'} successfully.` });
    } catch (error) {
      res.status(500).json({ message: 'Error subscribing/unsubscribing to the topic', error: error.message });
    }
  };
  

  exports.deleteTopic = async (req, res) => {
    const { topicId } = req.params;
  
    try {
      const topic = await ForumTopic.findByIdAndDelete(topicId);
      if (!topic) {
        return res.status(404).json({ message: 'Topic not found' });
        
      }
  
      res.status(200).json({ message: 'Forum topic deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting forum topic', error: error.message });
    }
  };
  
  