import expressAsyncHandler from 'express-async-handler';
import notificationService from '../services/notificationService.js';
import responseMessages from '../constants/responseMessages.js';

const getUnreadNotifications = expressAsyncHandler(async (req, res) => {
  try {
    const notifications = await notificationService.getUnreadNotifications(req.user._id);

    res.status(200).json({
      status: 'success',
      data: notifications,
      message: responseMessages.unreadNotificationsRetrieved,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      data: null,
      message: responseMessages.serverError,
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
      message: responseMessages.notificationMarkedAsRead,
    });
  } catch (error) {
    res.status(error.message === 'Notification not found' ? 404 : 401).json({
      status: 'error',
      data: null,
      message: error.message === 'Notification not found' ? responseMessages.notificationNotFound : responseMessages.serverError,
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
      message: responseMessages.unreadNotificationsRetrieved,
    });
  } catch (error) {
    console.error('Error fetching unread notifications:', error);
    res.status(500).json({
      status: 'error',
      data: null,
      message: responseMessages.serverError,
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
      message: responseMessages.notificationMarkedAsRead,
    });
  } catch (error) {
    if (error.message === 'Notification not found') {
      res.status(404).json({
        status: 'error',
        data: null,
        message: responseMessages.notificationNotFound,
      });
    } else if (error.message === 'Not authorized') {
      res.status(401).json({
        status: 'error',
        data: null,
        message: responseMessages.notAuthorized,
      });
    } else {
      res.status(500).json({
        status: 'error',
        data: null,
        message: responseMessages.serverError,
      });
    }
  }
});

export {
  getUnreadNotifications,
  markNotificationAsRead,
  getUnreadHotelierNotifications,
  markHotelierNotificationAsRead
};
