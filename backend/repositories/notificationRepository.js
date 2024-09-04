
import Notification from "../models/notificationModel.js";

const createNotification = async (notificationData) => {
  const notification = new Notification(notificationData);
  return await notification.save();
};
const createHotelierNotification = async (notificationData) => {
  const notification = new Notification(notificationData);
  return await notification.save();
};
const findUnreadNotificationsByUserId = async (userId) => {
  return await Notification.find({
    userId,
    isRead: false,
  }).sort({ createdAt: -1 });
};
const findNotificationById = async (id) => {
  return await Notification.findById(id);
};

const updateNotificationStatus = async (notification) => {
  return await notification.save();
};
const getUnreadNotifications = async (hotelierId) => {
  return Notification.find({ hotelierId, isRead: false }).sort({ createdAt: -1 });
};
const updateNotificationAsRead = async (notification) => {
  notification.isRead = true;
  return notification.save();
};

export default { createNotification,createHotelierNotification,findUnreadNotificationsByUserId,findNotificationById,updateNotificationStatus,
  getUnreadNotifications,updateNotificationAsRead
 };
