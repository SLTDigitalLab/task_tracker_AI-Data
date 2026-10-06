const prisma = require('../config/db');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });
    res.json(notifications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching notifications' });
  }
};

// @desc    Mark notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res) => {
  try {
    const notification = await prisma.notification.updateMany({
      where: { 
        id: req.params.id,
        userId: req.user.id 
      },
      data: { isRead: true }
    });
    res.json(notification);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error marking notification as read' });
  }
};

module.exports = { getNotifications, markAsRead };
