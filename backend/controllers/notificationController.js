import expressAsyncHandler from 'express-async-handler';

import notificationService from '../services/notificationService.js';



const getUnreadNotifications = expressAsyncHandler(async (req, res) => {
  try {
    const notifications = await notificationService.getUnreadNotifications(req.user._id);

    res.status(200).json({
      status: 'success',
      data: notifications,
      message: 'Unread notifications retrieved successfully',
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      data: null,
      message: 'Server error',
    });
  }
});


const markNotificationAsRead = expressAsyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    await notificationService.markNotificationAsRead(id, req.user._id);

    res.status(200).json({
      status: 'success',
      data: null,
      message: 'Notification marked as read',
    });
  } catch (error) {
    res.status(error.message === 'Notification not found' ? 404 : 401).json({
      status: 'error',
      data: null,
      message: error.message,
    });
  }
});

const getUnreadHotelierNotifications = expressAsyncHandler(async (req, res) => {
  try {
    const hotelierId = req.hotelier._id;
    const notifications = await notificationService.getUnreadHotelierNotifications(hotelierId);
    
    res.status(200).json({
      status: 'success',
      data: notifications,
      message: 'Unread notifications retrieved successfully',
    });
  } catch (error) {
    console.error('Error fetching unread notifications:', error);
    res.status(500).json({
      status: 'error',
      data: null,
      message: 'Server error',
    });
  }
});


const markHotelierNotificationAsRead = expressAsyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const hotelierId = req.hotelier._id;
    
    await notificationService.markHotelierNotificationAsRead(id, hotelierId);
    
    res.status(200).json({
      status: 'success',
      data: null,
      message: 'Notification marked as read',
    });
  } catch (error) {
    if (error.message === 'Notification not found') {
      res.status(404).json({
        status: 'error',
        data: null,
        message: 'Notification not found',
      });
    } else if (error.message === 'Not authorized') {
      res.status(401).json({
        status: 'error',
        data: null,
        message: 'Not authorized',
      });
    } else {
      res.status(500).json({
        status: 'error',
        data: null,
        message: 'Server error',
      });
    }
  }
});

export {
  getUnreadNotifications,
  markNotificationAsRead,
  getUnreadHotelierNotifications,
  markHotelierNotificationAsRead
}